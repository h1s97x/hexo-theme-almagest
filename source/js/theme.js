/**
 * Theme Toggle Script
 * Handles light/dark theme switching with localStorage persistence
 * and system preference detection.
 *
 * 注意：页面加载时的主题初始化（防 FOUC）由 layout 中内联的
 * `_partial/theme-init.ejs` 完成，这里只负责「切换」与「系统偏好监听」，
 * 避免两套初始化逻辑重复。
 */

(function () {
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
   * 把主题属性写到 <html>。
   * 支持 View Transitions 的浏览器做一次交叉淡入淡出（见 _modern.styl），
   * 否则直接切换；尊重系统「减少动态效果」偏好。
   */
  function setThemeAttribute(theme) {
    var reduceMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (typeof document.startViewTransition === 'function' && !reduceMotion) {
      document.startViewTransition(function () {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
      });
      return;
    }

    document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
  }

  /**
   * Apply theme to the document
   */
  function applyTheme(theme) {
    if (theme === DARK_THEME || theme === LIGHT_THEME) {
      setThemeAttribute(theme);
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

    themeToggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      toggleTheme();
    });

    // Support keyboard navigation
    themeToggleBtn.addEventListener('keydown', function (e) {
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
    const handleChange = function () {
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

    toggleBtn.addEventListener('click', function (e) {
      e.preventDefault();
      const expanded = menu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    // Close menu when clicking a link inside it
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        menu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Click outside closes the menu（点击空白处收起，符合移动端习惯）
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('open')) {
        return;
      }
      if (menu.contains(e.target) || toggleBtn.contains(e.target)) {
        return;
      }
      menu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // Esc 键收起
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !menu.classList.contains('open')) {
        return;
      }
      menu.classList.remove('open');
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    // 视窗放大到桌面断点时，清掉展开态，避免样式残留
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768 && menu.classList.contains('open')) {
        menu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Search button: navigate to /search/ page
   */
  function setupSearchButton() {
    const searchBtns = document.querySelectorAll('#search-btn, #search-btn-404');
    searchBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '/search/';
      });
    });
  }

  /**
   * Back to top button
   *
   * 滚动超过阈值才加 `.show` 类显示按钮（CSS 里默认 `display: none`）；
   * 点击回到顶部，遵循系统「减少动态效果」偏好时直接跳转。
   * 滚动监听用 rAF 节流，避免每像素都操作 DOM。
   */
  function setupBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) {
      return;
    }

    var SHOW_THRESHOLD = 300;
    var ticking = false;

    function updateVisibility() {
      ticking = false;
      var show = window.scrollY > SHOW_THRESHOLD;
      btn.classList.toggle('show', show);
      btn.setAttribute('aria-hidden', show ? 'false' : 'true');
    }

    window.addEventListener(
      'scroll',
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateVisibility);
        }
      },
      { passive: true }
    );

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var reduceMotion =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) {
        window.scrollTo(0, 0);
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });

    // 初始状态：刷新后若已停在页面中部，按钮应直接出现
    updateVisibility();
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
    setupBackToTop();

    // Listen for system preference changes
    listenToSystemPreference();
  }

  /**
   * Expose theme API globally for other scripts
   */
  window.ThemeManager = {
    getCurrentTheme: getCurrentTheme,
    setTheme: function (theme) {
      if (theme === LIGHT_THEME || theme === DARK_THEME) {
        applyTheme(theme);
        saveThemePreference(theme);
        dispatchThemeChangeEvent(theme);
      }
    },
    toggleTheme: toggleTheme,
    getSystemPreference: getSystemPreference,
    onThemeChange: function (callback) {
      window.addEventListener('themechange', function (e) {
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
