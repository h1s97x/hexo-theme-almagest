/**
 * Theme Toggle Script
 * Handles light/dark theme switching with localStorage persistence
 * and system preference detection.
 *
 * 注意：页面加载时的主题初始化（防 FOUC）由 layout 中内联的
 * `_partial/theme-init.ejs` 完成，这里只负责「切换」与「系统偏好监听」，
 * 避免两套初始化逻辑重复。
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'theme-preference';
  const THEME_ATTRIBUTE = 'data-theme';
  const LIGHT_THEME = 'light';
  const DARK_THEME = 'dark';

  /**
   * Get system preference using prefers-color-scheme media query
   */
  function getSystemPreference() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return DARK_THEME;
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
      return LIGHT_THEME;
    }
    return null;
  }

  /**
   * Get current theme from DOM
   */
  function getCurrentTheme() {
    return document.documentElement.getAttribute(THEME_ATTRIBUTE) || LIGHT_THEME;
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    if (theme === DARK_THEME || theme === LIGHT_THEME) {
      document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
      updateThemeButtonState(theme);
    }
  }

  /**
   * Toggle between light and dark themes
   */
  function toggleTheme() {
    const currentTheme = getCurrentTheme();
    const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

    // Apply new theme
    applyTheme(newTheme);

    // Save preference to localStorage
    saveThemePreference(newTheme);

    // Dispatch custom event for other scripts to listen
    dispatchThemeChangeEvent(newTheme);
  }

  /**
   * Save theme preference to localStorage
   */
  function saveThemePreference(theme) {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {
      // Silently fail if localStorage is not available
    }
  }

  /**
   * Update theme toggle button state
   */
  function updateThemeButtonState(theme) {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) {
      return;
    }

    if (theme === DARK_THEME) {
      themeToggleBtn.classList.add('dark-mode');
      themeToggleBtn.setAttribute('aria-pressed', 'true');
    } else {
      themeToggleBtn.classList.remove('dark-mode');
      themeToggleBtn.setAttribute('aria-pressed', 'false');
    }
  }

  /**
   * Dispatch custom theme change event
   */
  function dispatchThemeChangeEvent(theme) {
    window.dispatchEvent(
      new CustomEvent('themechange', {
        detail: { theme: theme }
      })
    );
  }

  /**
   * Setup event listeners for theme toggle button
   */
  function setupThemeToggle() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (!themeToggleBtn) {
      return;
    }

    themeToggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleTheme();
    });

    // Support keyboard navigation
    themeToggleBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleTheme();
      }
    });
  }

  /**
   * Listen to system preference changes
   */
  function listenToSystemPreference() {
    if (!window.matchMedia) {
      return;
    }

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const lightModeQuery = window.matchMedia('(prefers-color-scheme: light)');

    // Handle preference changes
    const handleChange = function() {
      // Only apply system preference if user hasn't saved a preference
      if (!localStorage.getItem(STORAGE_KEY)) {
        const theme = getSystemPreference();
        if (theme) {
          applyTheme(theme);
          dispatchThemeChangeEvent(theme);
        }
      }
    };

    // Modern API
    if (darkModeQuery.addEventListener) {
      darkModeQuery.addEventListener('change', handleChange);
      lightModeQuery.addEventListener('change', handleChange);
    }
    // Fallback for older browsers
    if (darkModeQuery.addListener) {
      darkModeQuery.addListener(handleChange);
      lightModeQuery.addListener(handleChange);
    }
  }

  /**
   * Mobile menu toggle
   */
  function setupMobileMenu() {
    const toggleBtn =
      document.getElementById('mobile-menu-btn') || document.getElementById('mobile-menu-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggleBtn || !menu) {
      return;
    }

    toggleBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const expanded = menu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    // Close menu when clicking a link inside it
    menu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        menu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /**
   * Search button: navigate to /search/ page
   */
  function setupSearchButton() {
    const searchBtns = document.querySelectorAll('#search-btn, #search-btn-404');
    searchBtns.forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        window.location.href = '/search/';
      });
    });
  }

  /**
   * Initialize theme interactions
   */
  function initTheme() {
    // Sync button state with current theme
    updateThemeButtonState(getCurrentTheme());

    // Setup event listeners
    setupThemeToggle();
    setupMobileMenu();
    setupSearchButton();

    // Listen for system preference changes
    listenToSystemPreference();
  }

  /**
   * Expose theme API globally for other scripts
   */
  window.ThemeManager = {
    getCurrentTheme: getCurrentTheme,
    setTheme: function(theme) {
      if (theme === LIGHT_THEME || theme === DARK_THEME) {
        applyTheme(theme);
        saveThemePreference(theme);
        dispatchThemeChangeEvent(theme);
      }
    },
    toggleTheme: toggleTheme,
    getSystemPreference: getSystemPreference,
    onThemeChange: function(callback) {
      window.addEventListener('themechange', function(e) {
        callback(e.detail.theme);
      });
    }
  };

  // Initialize when DOM is ready (scripts are loaded with defer)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
})();
