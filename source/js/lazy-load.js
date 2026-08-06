/**
 * Lazy Load Script
 * Implements lazy loading for images.
 *
 * 阶段3 整改（评审修复）：
 * - 最终渲染 HTML 保留 `src`（scripts/filters.js 的 after_render:html 输出
 *   `src` + `data-src` + `loading="lazy"`），因此：
 *   1) 现代浏览器：原生 `loading="lazy"` 负责加载时机，即使本脚本未执行
 *      图片也能正常显示（评审 Critical 修复）。
 *   2) 老浏览器：本脚本用 IntersectionObserver 把 `data-src` 按需回填 `src`
 *      （对 data-src-only 图片做真正懒加载）。
 * - 加载失败：标记 `.error` 并移除 `data-src` 兜底，配合 CSS 占位背景避免破图。
 * - 加载完成：标记 `.loaded`（淡入）。
 * - 兼容用户手写 `<img data-src="...">`（无 src）的场景：统一回填 src。
 */

(function() {
  'use strict';

  const LOADED_CLASS = 'loaded';
  const ERROR_CLASS = 'error';

  /**
   * 确保图片有 src：若缺失（用户手写 data-src / 旧版主题输出），
   * 从 data-src / data-srcset 回填，并在原生 lazy 场景补 loading="lazy"。
   * @param {HTMLImageElement} img
   */
  function ensureSrc(img) {
    if (!img.getAttribute('src') && img.getAttribute('data-src')) {
      img.src = img.getAttribute('data-src');
    }
    if (img.getAttribute('data-srcset')) {
      img.srcset = img.getAttribute('data-srcset');
    }
    if ('loading' in HTMLImageElement.prototype && !img.hasAttribute('loading')) {
      img.loading = 'lazy';
    }
  }

  /**
   * 绑定单个图片的加载状态：load → .loaded，error → .error（移除 data-src 兜底）。
   * @param {HTMLImageElement} img
   */
  function bindState(img) {
    // 已加载完成（缓存命中）直接标记
    if (img.complete && img.naturalWidth > 0) {
      img.classList.add(LOADED_CLASS);
      return;
    }

    img.addEventListener(
      'load',
      function() {
        img.classList.add(LOADED_CLASS);
        img.classList.remove(ERROR_CLASS);
      },
      { once: true }
    );

    img.addEventListener(
      'error',
      function() {
        img.classList.remove(LOADED_CLASS);
        img.classList.add(ERROR_CLASS);
        // 去掉 data-src 兜底，避免刷新时反复触发加载 / 破图
        img.removeAttribute('data-src');
        if (img.hasAttribute('data-srcset')) {
          img.removeAttribute('data-srcset');
        }
      },
      { once: true }
    );
  }

  /**
   * 立即加载全部懒加载图片（极老浏览器无 IntersectionObserver 的兜底）。
   */
  function loadAllImages() {
    document.querySelectorAll('img[data-src]').forEach(function(img) {
      ensureSrc(img);
    });
  }

  function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) {
      return;
    }

    // 所有懒加载图片绑定状态标记
    images.forEach(bindState);

    // 极老浏览器：无 IntersectionObserver → 全部立即加载
    if (!('IntersectionObserver' in window)) {
      loadAllImages();
      return;
    }

    // 现代浏览器：原生 loading="lazy" 负责加载时机（src 已在 HTML 中），
    // 只需回填可能缺失的 src（如用户手写 data-src 的图片）。
    if ('loading' in HTMLImageElement.prototype) {
      images.forEach(ensureSrc);
      return;
    }

    // 老浏览器（无原生 lazy）+ IO：对 data-src-only 图片做真正的按需加载。
    // 已有 src 的图片在解析时即会加载（浏览器不认识 loading="lazy"），
    // 这里只处理尚未有 src、等待 data-src 回填的图片。
    const pending = Array.prototype.filter.call(images, function(img) {
      return !img.getAttribute('src');
    });

    if (pending.length === 0) {
      return;
    }

    const imageObserver = new IntersectionObserver(
      function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            ensureSrc(img);
            imageObserver.unobserve(img);
          }
        });
      },
      { rootMargin: '50px 0px' }
    );

    pending.forEach(function(img) {
      imageObserver.observe(img);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }
})();
