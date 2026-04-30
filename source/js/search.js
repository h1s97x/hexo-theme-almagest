/**
 * Search Script
 * Handles search functionality
 */

(function() {
  'use strict';

  let searchData = [];
  let searchIndex = {};

  // Initialize search
  function initSearch() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    if (!searchForm || !searchInput) {
      return;
    }

    // Load search data
    loadSearchData();

    // Handle search form submission
    searchForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        performSearch(query, searchResults);
      }
    });

    // Handle real-time search
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      if (query.length > 0) {
        performSearch(query, searchResults);
      } else if (searchResults) {
        searchResults.innerHTML = '<div class="no-results"><p>Enter search terms</p></div>';
      }
    });
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

  // Build search index
  function buildSearchIndex() {
    searchData.forEach((item, index) => {
      const title = item.title.toLowerCase();

      title.split(/\s+/).forEach(word => {
        if (word.length > 0) {
          if (!searchIndex[word]) {
            searchIndex[word] = [];
          }
          if (!searchIndex[word].includes(index)) {
            searchIndex[word].push(index);
          }
        }
      });
    });
  }

  // Perform search
  function performSearch(query, resultsContainer) {
    if (!resultsContainer) {
      return;
    }

    const queryWords = query.toLowerCase().split(/\s+/);
    const results = new Set();

    // Find matching documents
    queryWords.forEach(word => {
      if (searchIndex[word]) {
        searchIndex[word].forEach(index => {
          results.add(index);
        });
      }
    });

    // Score and sort results
    const scoredResults = Array.from(results).map(index => {
      const item = searchData[index];
      let score = 0;

      queryWords.forEach(word => {
        if (item.title.toLowerCase().includes(word)) {
          score += 10;
        }
        if (item.content.toLowerCase().includes(word)) {
          score += 1;
        }
      });

      return { item, score, index };
    }).sort((a, b) => b.score - a.score);

    // Display results
    displayResults(scoredResults, resultsContainer, query);
  }

  // Display search results
  function displayResults(results, container, query) {
    if (results.length === 0) {
      container.innerHTML = '<div class="no-results"><p>No results found for "' + escapeHtml(query) + '"</p></div>';
      return;
    }

    let html = '<div class="search-results-list">';
    results.slice(0, 20).forEach(result => {
      const item = result.item;
      const excerpt = getExcerpt(item.content, query, 150);

      html += '<div class="search-result-item">';
      html += '<h3 class="result-title"><a href="' + item.url + '">' + highlightQuery(item.title, query) + '</a></h3>';
      html += '<p class="result-excerpt">' + highlightQuery(excerpt, query) + '</p>';
      html += '<a href="' + item.url + '" class="result-link">' + item.url + '</a>';
      html += '</div>';
    });
    html += '</div>';

    container.innerHTML = html;
  }

  // Get excerpt from content
  function getExcerpt(content, query, length) {
    const queryIndex = content.toLowerCase().indexOf(query.toLowerCase());
    let start = Math.max(0, queryIndex - 50);
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

  // Highlight query in text
  function highlightQuery(text, query) {
    const regex = new RegExp('(' + query.split(/\s+/).join('|') + ')', 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  // Escape HTML
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      '\'': '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  // Initialize on DOM ready
  document.addEventListener('DOMContentLoaded', initSearch);

})();
