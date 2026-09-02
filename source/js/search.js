/**
 * Search Script
 * Handles search functionality.
 *
 * 数据来源（按优先级）：
 * 1. 页面内嵌 `script[data-search-data]`（由 search.ejs 注入，内容最新）
 * 2. 外部 `search.json`（由 search generator 生成，供直接 fetch）
 */

(function () {
  'use strict';

  let searchData = [];
  let searchIndex = {};

  /**
   * 分词：优先按空白拆词（英文场景），同时保留中文连续字符作为一个查询单元。
   * 搜索时对每个词做子串匹配，确保中英文都能命中。
   */
  function tokenize(text) {
    return String(text || '')
      .toLowerCase()
      .split(/\s+/)
      .filter(function (w) {
        return w.length > 0;
      });
  }

  /**
   * 建立倒排索引（词 → 文档索引集合）
   */
  function buildSearchIndex() {
    searchIndex = {};
    searchData.forEach(function (item, index) {
      // 标题拆词建索引（命中标题的词在 performSearch 中加权更高）
      tokenize(item.title).forEach(function (word) {
        if (!searchIndex[word]) {
          searchIndex[word] = [];
        }
        if (searchIndex[word].indexOf(index) === -1) {
          searchIndex[word].push(index);
        }
      });

      // 正文拆词建索引
      tokenize(item.content).forEach(function (word) {
        if (!searchIndex[word]) {
          searchIndex[word] = [];
        }
        if (searchIndex[word].indexOf(index) === -1) {
          searchIndex[word].push(index);
        }
      });
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

    // 处理搜索表单提交
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query, searchResults);
      }
    });

    // 实时搜索
    searchInput.addEventListener('input', function () {
      const query = this.value.trim();
      if (query.length > 0) {
        performSearch(query, searchResults);
      } else if (searchResults) {
        searchResults.innerHTML =
          '<div class="no-results"><p>' +
          (window.__almagestSearchEmpty || 'Enter search terms') +
          '</p></div>';
      }
    });
  }

  /**
   * 加载搜索数据
   * @param {Function} [done] 数据加载完成回调
   */
  function loadSearchData(done) {
    // 1) 优先使用页面内嵌数据
    const script = document.querySelector('script[data-search-data]');
    if (script) {
      try {
        searchData = JSON.parse(script.textContent);
        buildSearchIndex();
        if (done) {
          done();
        }
        return;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Failed to parse inline search data:', e);
      }
    }

    // 2) 回退到外部 search.json
    fetch('/search.json')
      .then(function (res) {
        if (!res.ok) {
          throw new Error('HTTP ' + res.status);
        }
        return res.json();
      })
      .then(function (data) {
        searchData = Array.isArray(data) ? data : [];
        buildSearchIndex();
        if (done) {
          done();
        }
      })
      .catch(function (err) {
        // eslint-disable-next-line no-console
        console.error('Failed to load search data:', err);
        if (done) {
          done();
        }
      });
  }

  /**
   * 执行搜索
   */
  function performSearch(query, resultsContainer) {
    if (!resultsContainer) {
      return;
    }

    const queryWords = tokenize(query);
    const results = new Set();

    // 用倒排索引找到候选文档
    queryWords.forEach(function (word) {
      if (searchIndex[word]) {
        searchIndex[word].forEach(function (index) {
          results.add(index);
        });
      }
    });

    // 若索引没有命中（如中文整句），回退到全量线性扫描
    const docs = Array.from(results).map(function (index) {
      return searchData[index];
    });

    const allDocs = Array.from(searchData);
    const linearHits = [];
    allDocs.forEach(function (item, index) {
      const haystack = (item.title + ' ' + item.content).toLowerCase();
      let matched = false;
      queryWords.forEach(function (word) {
        if (haystack.indexOf(word) !== -1) {
          matched = true;
        }
      });
      if (matched && results.has(index) === false) {
        linearHits.push(index);
      }
    });
    linearHits.forEach(function (index) {
      results.add(index);
      docs.push(searchData[index]);
    });

    // 打分排序：标题命中加权更高
    const scoredResults = docs
      .map(function (item) {
        let score = 0;
        queryWords.forEach(function (word) {
          if (item.title.toLowerCase().indexOf(word) !== -1) {
            score += 10;
          }
          if (item.content.toLowerCase().indexOf(word) !== -1) {
            score += 1;
          }
        });
        return { item: item, score: score };
      })
      .sort(function (a, b) {
        return b.score - a.score;
      });

    // 显示结果
    displayResults(scoredResults, resultsContainer, query);
  }

  /**
   * 渲染搜索结果
   */
  function displayResults(results, container, query) {
    if (results.length === 0) {
      container.innerHTML =
        '<div class="no-results"><p>' +
        (window.__almagestSearchNoResults || 'No results found for "' + escapeHtml(query) + '"') +
        '</p></div>';
      return;
    }

    let html = '<div class="search-results-list">';
    results.slice(0, 20).forEach(function (result) {
      const item = result.item;
      const excerpt = getExcerpt(item.content, query, 150);

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
    const lowerContent = content.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const queryIndex = lowerContent.indexOf(lowerQuery);
    // 若关键词未命中正文，则从开头截取
    let start = queryIndex > -1 ? Math.max(0, queryIndex - 50) : 0;
    let end = Math.min(content.length, start + length);

    let excerpt = content.substring(start, end);
    if (start > 0) {
      excerpt = '...' + excerpt;
    }
    if (end < content.length) {
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
    return text.replace(regex, '<mark>$1</mark>');
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
