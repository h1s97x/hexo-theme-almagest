/**
 * Search Script - Enhanced Version
 * Handles search functionality with Chinese tokenization support
 */

(function () {
  'use strict';

  let searchData = [];
  let searchIndex = {};
  let searchConfig = {
    placeholder: 'Type to search...',
    show_count: true,
    limit: 20
  };

  // Initialize search
  function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchForm || !searchInput) {
      return;
    }

    // Load search config
    loadSearchConfig();

    // Set placeholder
    if (searchConfig.placeholder) {
      searchInput.placeholder = searchConfig.placeholder;
    }

    // Load search data
    loadSearchData();

    // Handle search form submission
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query, searchResults);
      }
    });

    // Handle real-time search
    let debounceTimer;
    searchInput.addEventListener('input', function () {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const query = this.value.trim();
        if (query.length > 0) {
          performSearch(query, searchResults);
        } else if (searchResults) {
          searchResults.innerHTML =
            '<div class="search-hint"><p>' + searchConfig.placeholder + '</p></div>';
        }
      }, 300);
    });
  }

  // Load search config from window
  function loadSearchConfig() {
    if (window.searchConfig) {
      searchConfig = Object.assign(searchConfig, window.searchConfig);
    }
  }

  // Load search data from JSON
  function loadSearchData() {
    const script = document.querySelector('script[data-search-data]');
    if (script) {
      try {
        searchData = JSON.parse(script.textContent);
        buildSearchIndex();
      } catch (e) {
        console.error('Failed to parse search data:', e);
      }
    }
  }

  // Tokenize text (supports both English and Chinese)
  function tokenize(text) {
    if (!text) {
      return [];
    }
    text = text.toLowerCase();

    // Chinese character pattern
    const chinesePattern = /[\u4e00-\u9fa5]+/g;
    // English word pattern
    const englishPattern = /[a-z0-9]+/gi;

    const tokens = [];

    // Extract Chinese tokens (each character or consecutive characters)
    let chineseMatch;
    while ((chineseMatch = chinesePattern.exec(text)) !== null) {
      const chinese = chineseMatch[0];
      // Add each character as a token for better Chinese search
      for (let i = 0; i < chinese.length; i++) {
        tokens.push(chinese[i]);
      }
      // Also add consecutive characters for phrase matching
      for (let len = 2; len <= Math.min(chinese.length, 4); len++) {
        for (let i = 0; i <= chinese.length - len; i++) {
          tokens.push(chinese.substring(i, i + len));
        }
      }
    }

    // Extract English tokens
    let englishMatch;
    while ((englishMatch = englishPattern.exec(text)) !== null) {
      if (englishMatch[0].length >= 2) {
        tokens.push(englishMatch[0]);
      }
    }

    return [...new Set(tokens)];
  }

  // Build search index
  function buildSearchIndex() {
    searchData.forEach((item, index) => {
      const tokens = tokenize(item.title + ' ' + (item.content || ''));

      tokens.forEach(token => {
        if (!searchIndex[token]) {
          searchIndex[token] = [];
        }
        if (!searchIndex[token].includes(index)) {
          searchIndex[token].push(index);
        }
      });

      // Also index by full title for exact matching
      const titleLower = item.title.toLowerCase();
      if (!searchIndex[titleLower]) {
        searchIndex[titleLower] = [];
      }
      if (!searchIndex[titleLower].includes(index)) {
        searchIndex[titleLower].push(index);
      }
    });
  }

  // Perform search
  function performSearch(query, resultsContainer) {
    if (!resultsContainer) {
      return;
    }

    // Show loading state
    resultsContainer.innerHTML = '<div class="search-loading"><p>Searching...</p></div>';

    const queryTokens = tokenize(query);
    const results = new Set();

    // Find matching documents
    queryTokens.forEach(token => {
      if (searchIndex[token]) {
        searchIndex[token].forEach(index => {
          results.add(index);
        });
      }
    });

    // Score and sort results
    const scoredResults = Array.from(results)
      .map(index => {
        const item = searchData[index];
        let score = 0;
        const queryLower = query.toLowerCase();

        // Exact title match gets highest score
        if (item.title.toLowerCase().includes(queryLower)) {
          score += 100;
        }

        // Partial match scoring
        queryTokens.forEach(token => {
          if (item.title.toLowerCase().includes(token)) {
            score += 20;
          }
          if (item.content && item.content.toLowerCase().includes(token)) {
            score += 5;
          }
          // Category and tags matching
          if (item.categories) {
            item.categories.forEach(cat => {
              if (cat.toLowerCase().includes(token)) {
                score += 10;
              }
            });
          }
          if (item.tags) {
            item.tags.forEach(tag => {
              if (tag.toLowerCase().includes(token)) {
                score += 10;
              }
            });
          }
        });

        return { item, score, index };
      })
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score);

    // Display results
    displayResults(scoredResults, resultsContainer, query);
  }

  // Display search results
  function displayResults(results, container, query) {
    const limit = searchConfig.limit || 20;
    const limitedResults = results.slice(0, limit);

    if (limitedResults.length === 0) {
      container.innerHTML =
        '<div class="no-results"><p>No results found for "' + escapeHtml(query) + '"</p></div>';
      return;
    }

    let html = '';

    // Show results count
    if (searchConfig.show_count) {
      html +=
        '<div class="search-results-count"><p>' +
        results.length +
        ' result' +
        (results.length !== 1 ? 's' : '') +
        ' found</p></div>';
    }

    html += '<div class="search-results-list">';
    limitedResults.forEach(result => {
      const item = result.item;
      const excerpt = getExcerpt(item.content || '', query, 200);

      html += '<div class="search-result-item">';
      html +=
        '<h3 class="result-title"><a href="' +
        item.url +
        '">' +
        highlightQuery(item.title, query) +
        '</a></h3>';

      // Show date if available
      if (item.date) {
        html += '<div class="result-date"><time>' + formatDate(item.date) + '</time></div>';
      }

      html += '<p class="result-excerpt">' + highlightQuery(excerpt, query) + '</p>';

      // Show categories and tags
      if (item.categories && item.categories.length) {
        html +=
          '<div class="result-meta"><span class="result-categories">' +
          item.categories.join(' / ') +
          '</span></div>';
      }

      html += '</div>';
    });
    html += '</div>';

    // Show "load more" hint if there are more results
    if (results.length > limit) {
      html +=
        '<div class="search-more"><p>' +
        (results.length - limit) +
        ' more results. Please refine your search.</p></div>';
    }

    container.innerHTML = html;
  }

  // Format date
  function formatDate(dateStr) {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  }

  // Get excerpt from content
  function getExcerpt(content, query, length) {
    // Strip HTML tags
    content = content
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const queryLower = query.toLowerCase();
    const queryIndex = content.toLowerCase().indexOf(queryLower);

    let start, end;
    if (queryIndex >= 0) {
      // Start from query position
      start = Math.max(0, queryIndex - 80);
      end = Math.min(content.length, queryIndex + query.length + 120);
    } else {
      start = 0;
      end = Math.min(content.length, length);
    }

    let excerpt = content.substring(start, end);

    if (start > 0) {
      excerpt = '...' + excerpt;
    }
    if (end < content.length) {
      excerpt = excerpt + '...';
    }

    return excerpt;
  }

  // Highlight query in text
  function highlightQuery(text, query) {
    if (!text) {
      return '';
    }

    // Strip HTML tags first
    text = text.replace(/<[^>]+>/g, '');

    // Escape special regex characters in query
    const queryWords = query.split(/\s+/).filter(w => w.length > 0);
    const pattern = queryWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');

    if (!pattern) {
      return escapeHtml(text);
    }

    return escapeHtml(text).replace(new RegExp('(' + pattern + ')', 'gi'), '<mark>$1</mark>');
  }

  // Escape HTML
  function escapeHtml(text) {
    if (!text) {
      return '';
    }
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initSearch);
})();
