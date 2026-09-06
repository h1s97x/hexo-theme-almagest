/**
 * Search Script
 * Handles search functionality.
 *
 * 数据来源：`/search.json`（由 search generator 生成的纯文本索引）。
 * 旧实现把全站正文内嵌进搜索页 HTML，文章一多首访就要下载整站内容；
 * 现在改为进入搜索页后按需 fetch 索引，索引本身也只含截断后的纯文本。
 *
 * 检索性能（旧实现每次按键都会对全部文档做一次全量扫描）：
 * - 建索引时预计算小写标题 / 正文，搜索时不再重复拼接字符串 + toLowerCase
 * - 倒排索引按「词」命中；中文无空格，因此对 CJK 串额外切 bigram
 *   （"天文望远镜" → 天文 / 文望 / 望远 / 远镜），让中文子串也能走索引
 * - 仅当倒排索引完全未命中时才退化为一次全量线性扫描
 * - 输入防抖 150ms，并对同一查询缓存结果
 */

(function () {
  'use strict';

  const DEBOUNCE_MS = 150;
  const MAX_RESULTS = 20;
  const EXCERPT_LENGTH = 150;
  const TITLE_WEIGHT = 10;
  const BODY_WEIGHT = 1;

  // CJK 统一表意文字 / 假名 / 谚文：没有空格分词，需要 bigram 切分
  const CJK_RANGE = '\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff\\u3040-\\u30ff\\uac00-\\ud7af';
  const CJK_CHAR = new RegExp('[' + CJK_RANGE + ']');
  const NON_WORD = new RegExp('[^0-9a-z' + CJK_RANGE + ']+');

  let searchData = [];
  let searchIndex = {};
  let resultCache = {};
  let dataReady = false;
  let debounceTimer = null;

  /**
   * 把已小写的文本切成词，长度 > 2 的 CJK 串额外产出所有 bigram。
   * @param {string} lowerText 必须是已转换小写且已 trim 的文本
   * @returns {string[]}
   */
  function splitWords(lowerText) {
    const words = [];

    lowerText.split(NON_WORD).forEach(function (raw) {
      if (!raw) {
        return;
      }

      words.push(raw);

      // 两字的 CJK 串本身就是一个 bigram，无需再切
      if (raw.length > 2 && CJK_CHAR.test(raw.charAt(0))) {
        for (let i = 0; i + 2 <= raw.length; i++) {
          words.push(raw.slice(i, i + 2));
        }
      }
    });

    return words;
  }

  /**
   * 把一段小写文本的词写入倒排索引
   * @param {string} lowerText
   * @param {number} docIndex
   */
  function indexWords(lowerText, docIndex) {
    splitWords(lowerText).forEach(function (word) {
      const bucket = searchIndex[word];
      if (!bucket) {
        searchIndex[word] = [docIndex];
        return;
      }
      if (bucket.indexOf(docIndex) === -1) {
        bucket.push(docIndex);
      }
    });
  }

  /**
   * 归一化数据 + 建立倒排索引。
   * 兼容旧索引中字段名仍为 `content` 的情况（`item.text` 缺失时回退）。
   */
  function buildSearchIndex() {
    searchIndex = {};
    resultCache = {};

    searchData = searchData.map(function (item) {
      const doc = {
        title: item.title || '',
        url: item.url || '',
        date: item.date,
        // 旧索引（字段名 content）兼容：仅在 text 不是字符串时回退
        text: typeof item.text === 'string' ? item.text : item.content || ''
      };

      // 预计算小写副本：搜索时不再重复 toLowerCase / 字符串拼接
      doc._title = doc.title.toLowerCase();
      doc._text = doc.text.toLowerCase();
      return doc;
    });

    searchData.forEach(function (doc, index) {
      indexWords(doc._title, index);
      indexWords(doc._text, index);
    });
  }

  /**
   * 初始化搜索
   */
  function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchForm || !searchInput) {
      return;
    }

    // 加载搜索数据
    loadSearchData(function () {
      // 数据就绪后，若 URL 带 ?q= 参数则自动执行一次搜索（支持从导航栏跳转带关键词）
      const params = new URLSearchParams(window.location.search);
      const q = params.get('q');
      if (q) {
        searchInput.value = q;
        performSearch(q, searchResults);
      }
    });

    // 处理搜索表单提交（立即执行，取消防抖中的待执行搜索）
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearTimeout(debounceTimer);
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query, searchResults);
      }
    });

    // 实时搜索（防抖，避免逐字符触发全量扫描）
    searchInput.addEventListener('input', function () {
      const query = this.value.trim();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(function () {
        if (query) {
          performSearch(query, searchResults);
        } else if (searchResults) {
          showMessage(searchResults, window.__almagestSearchEmpty || 'Enter search terms');
        }
      }, DEBOUNCE_MS);
    });
  }

  /**
   * 加载搜索数据（按需 fetch，全站只加载一次）
   * @param {Function} [done] 数据加载完成回调
   */
  function loadSearchData(done) {
    if (dataReady) {
      if (done) {
        done();
      }
      return;
    }

    const url = window.__almagestSearchUrl || '/search.json';

    // 极老浏览器无 fetch：降级为空数据集，页面其余部分不受影响
    if (typeof fetch !== 'function') {
      dataReady = true;
      searchData = [];
      buildSearchIndex();
      if (done) {
        done();
      }
      return;
    }

    fetch(url)
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        searchData = Array.isArray(data) ? data : [];
        dataReady = true;
        buildSearchIndex();
        if (done) {
          done();
        }
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load search data:', err);
        dataReady = true;
        searchData = [];
        buildSearchIndex();
        if (done) {
          done();
        }
      });
  }

  /**
   * 执行搜索（结果按查询词缓存）
   * @param {string} query
   * @param {HTMLElement} resultsContainer
   */
  function performSearch(query, resultsContainer) {
    if (!resultsContainer) {
      return;
    }

    const cacheKey = String(query || '').toLowerCase();
    if (resultCache[cacheKey]) {
      displayResults(resultCache[cacheKey], resultsContainer, query);
      return;
    }

    const queryWords = splitWords(cacheKey);
    if (queryWords.length === 0) {
      displayResults([], resultsContainer, query);
      return;
    }

    const candidates = {};
    let indexedHitCount = 0;

    queryWords.forEach(function (word) {
      const bucket = searchIndex[word];
      if (!bucket) {
        return;
      }
      indexedHitCount += 1;
      bucket.forEach(function (index) {
        candidates[index] = true;
      });
    });

    // 倒排索引完全没命中（例如输入的是某个词的前半段）才做一次全量扫描，
    // 使用预计算的小写文本，不再每次按键重新拼接 title + content
    if (indexedHitCount === 0) {
      searchData.forEach(function (doc, index) {
        for (let i = 0; i < queryWords.length; i++) {
          if (doc._title.indexOf(queryWords[i]) !== -1 || doc._text.indexOf(queryWords[i]) !== -1) {
            candidates[index] = true;
            return;
          }
        }
      });
    }

    // 打分排序：标题命中加权更高
    const scoredResults = [];
    Object.keys(candidates).forEach(function (rawIndex) {
      const doc = searchData[rawIndex];
      let score = 0;
      queryWords.forEach(function (word) {
        if (doc._title.indexOf(word) !== -1) {
          score += TITLE_WEIGHT;
        }
        if (doc._text.indexOf(word) !== -1) {
          score += BODY_WEIGHT;
        }
      });
      if (score > 0) {
        scoredResults.push({ item: doc, score: score });
      }
    });

    scoredResults.sort(function (a, b) {
      return b.score - a.score;
    });

    resultCache[cacheKey] = scoredResults;
    displayResults(scoredResults, resultsContainer, query);
  }

  /**
   * 在结果区显示一条纯文案提示
   * @param {HTMLElement} container
   * @param {string} text
   */
  function showMessage(container, text) {
    container.innerHTML = '<div class="no-results"><p>' + text + '</p></div>';
  }

  /**
   * 渲染搜索结果
   */
  function displayResults(results, container, query) {
    if (results.length === 0) {
      showMessage(
        container,
        window.__almagestSearchNoResults || 'No results found for "' + escapeHtml(query) + '"'
      );
      return;
    }

    let html = '<div class="search-results-list">';
    results.slice(0, MAX_RESULTS).forEach(function (result) {
      const item = result.item;
      const excerpt = getExcerpt(item.text, query, EXCERPT_LENGTH);

      html += '<div class="search-result-item">';
      html +=
        '<h3 class="result-title"><a href="' +
        item.url +
        '">' +
        highlightQuery(item.title, query) +
        '</a></h3>';
      html += '<p class="result-excerpt">' + highlightQuery(excerpt, query) + '</p>';
      html += '<a href="' + item.url + '" class="result-link">' + item.url + '</a>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  /**
   * 从正文中截取包含关键词的片段
   */
  function getExcerpt(content, query, length) {
    const lowerContent = String(content || '').toLowerCase();
    const lowerQuery = String(query || '').toLowerCase();
    const queryIndex = lowerQuery ? lowerContent.indexOf(lowerQuery) : -1;
    // 若关键词未命中正文，则从开头截取
    const start = queryIndex > -1 ? Math.max(0, queryIndex - 50) : 0;
    const end = Math.min(lowerContent.length, start + length);

    let excerpt = String(content || '').substring(start, end);
    if (start > 0) {
      excerpt = '...' + excerpt;
    }
    if (end < lowerContent.length) {
      excerpt = excerpt + '...';
    }
    return excerpt;
  }

  /**
   * 高亮查询词
   */
  function highlightQuery(text, query) {
    if (!query || !text) {
      return text || '';
    }
    const regex = new RegExp('(' + query.split(/\s+/).join('|') + ')', 'gi');
    return String(text).replace(regex, '<mark>$1</mark>');
  }

  /**
   * 转义 HTML
   */
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(text).replace(/[&<>"']/g, function (m) {
      return map[m];
    });
  }

  // 暴露给模板/其他脚本设置文案
  window.__almagestSearch = {
    setEmptyText: function (text) {
      window.__almagestSearchEmpty = text;
    },
    setNoResultsText: function (text) {
      window.__almagestSearchNoResults = text;
    }
  };

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initSearch);
})();
