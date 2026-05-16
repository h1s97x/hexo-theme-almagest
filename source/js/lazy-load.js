/**
 * Lazy Load Script
 * 实现图片懒加载，支持占位图
 */

(function () {
  'use strict';

  // 获取配置
  var lazyLoadConfig = window.lazyLoadConfig || {};
  var loadingImg = lazyLoadConfig.loadingImg || '';
  var placeholderColor = lazyLoadConfig.placeholderColor || '#1a1a2e';

  /**
   * 创建占位元素
   */
  function createPlaceholder(img) {
    var wrapper = document.createElement('div');
    wrapper.className = 'lazy-placeholder';

    // 如果有 loading 图片，使用图片作为占位
    if (loadingImg) {
      var placeholderImg = document.createElement('img');
      placeholderImg.src = loadingImg;
      placeholderImg.alt = '';
      placeholderImg.className = 'lazy-loading-img';
      wrapper.appendChild(placeholderImg);
    } else {
      // 否则使用纯色占位
      wrapper.style.backgroundColor = placeholderColor;
    }

    // 将图片包装在占位元素内
    img.parentNode.insertBefore(wrapper, img);
    wrapper.appendChild(img);
  }

  /**
   * 初始化懒加载
   */
  function initLazyLoad() {
    // 检查浏览器是否支持 Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 不支持则立即加载所有图片
      loadAllImages();
      return;
    }

    var images = document.querySelectorAll('img[data-src]');

    if (images.length === 0) {
      return;
    }

    // 为已有占位符的图片添加包装
    images.forEach(function (img) {
      if (!img.parentNode.classList.contains('lazy-placeholder')) {
        createPlaceholder(img);
      }
    });

    var imageObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var img = entry.target;
            var wrapper = img.parentNode;

            // 如果图片已经在懒加载容器内，获取实际 img 元素
            if (wrapper.classList.contains('lazy-placeholder')) {
              var lazyImg = wrapper.querySelector('img[data-src]');
              if (lazyImg) {
                img = lazyImg;
              }
            }

            var src = img.getAttribute('data-src');
            var srcset = img.getAttribute('data-srcset');

            // 加载图片
            if (src) {
              img.src = src;
            }
            if (srcset) {
              img.srcset = srcset;
            }

            // 添加已加载类
            img.classList.add('loaded');

            // 加载完成后移除占位包装
            if (wrapper.classList.contains('lazy-placeholder')) {
              wrapper.classList.add('loaded');
              setTimeout(function () {
                if (wrapper.parentNode) {
                  var parent = wrapper.parentNode;
                  parent.insertBefore(img, wrapper);
                  parent.removeChild(wrapper);
                }
              }, 300); // 等待过渡动画完成
            }

            // 停止观察这个图片
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '50px 0px',
        threshold: 0.01
      }
    );

    // 重新选择所有懒加载图片
    var lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(function (img) {
      imageObserver.observe(img);
    });
  }

  /**
   * 加载所有图片（不支持 Intersection Observer 时的备用方案）
   */
  function loadAllImages() {
    var images = document.querySelectorAll('img[data-src]');
    images.forEach(function (img) {
      var src = img.getAttribute('data-src');
      var srcset = img.getAttribute('data-srcset');

      if (src) {
        img.src = src;
      }
      if (srcset) {
        img.srcset = srcset;
      }

      img.classList.add('loaded');
    });
  }

  // Pjax 完成后重新初始化
  document.addEventListener('pjax:complete', initLazyLoad);

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLazyLoad);
  } else {
    initLazyLoad();
  }
})();
