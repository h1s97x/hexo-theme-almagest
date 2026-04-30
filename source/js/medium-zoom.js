/**
 * Medium Zoom - 图片灯箱
 * 基于 medium-zoom 库，轻量级图片缩放查看
 * MIT License
 */

(function() {
  'use strict';

  const MediumZoom = function(options) {
    this.options = Object.assign({
      margin: 0,
      gutter: 40,
      background: 'rgba(0, 0, 0, 0.85)',
      scrollable: false,
      zoomable: true,
      draggable: true
    }, options);

    this._opened = false;
    this._active = null;
    this._images = [];
    this._hiding = false;

    this._init();
  };

  MediumZoom.prototype._init = function() {
    const zoomables = document.querySelectorAll('article img, .article-content img, .markdown-body img');
    zoomables.forEach(function(img) {
      if (!img.closest('a') && !img.classList.contains('no-zoom')) {
        img.classList.add('zoomable');
      }
    });

    // 绑定点击事件
    document.addEventListener('click', this._handleClick.bind(this));

    // 绑定缩放事件
    document.addEventListener('scroll', this._handleScroll.bind(this), { passive: true });

    // 键盘事件
    document.addEventListener('keydown', this._handleKeydown.bind(this));
  };

  MediumZoom.prototype._handleClick = function(e) {
    const target = e.target;

    if (target.tagName === 'IMG' && target.classList.contains('zoomable')) {
      if (this._opened) {
        this._close();
      } else {
        this._open(target);
      }
    } else if (this._opened && !target.classList.contains('zoom-overlay')) {
      this._close();
    }
  };

  MediumZoom.prototype._handleScroll = function() {
    if (this._opened && !this.options.scrollable) {
      this._close();
    }
  };

  MediumZoom.prototype._handleKeydown = function(e) {
    if (!this._opened) {
      return;
    }

    if (e.key === 'Escape') {
      this._close();
    }
  };

  MediumZoom.prototype._open = function(img) {
    this._opened = true;
    this._active = img;

    // 创建 overlay
    const overlay = document.createElement('div');
    overlay.className = 'zoom-overlay';
    overlay.style.cssText = [
      'position: fixed',
      'top: 0',
      'left: 0',
      'width: 100%',
      'height: 100%',
      'background: ' + this.options.background,
      'z-index: 99999',
      'cursor: zoom-out',
      'opacity: 0',
      'transition: opacity 0.3s ease'
    ].join(';');

    // 创建 zoomed 容器
    const zoomed = document.createElement('img');
    zoomed.src = img.src;
    zoomed.className = 'zoom-image';
    zoomed.style.cssText = [
      'position: absolute',
      'max-width: 90vw',
      'max-height: 90vh',
      'object-fit: contain',
      'cursor: zoom-out',
      'opacity: 0',
      'transition: opacity 0.3s ease, transform 0.3s ease',
      'transform-origin: center center'
    ].join(';');

    // 计算位置并居中
    const rect = img.getBoundingClientRect();
    const scrollTop = window.scrollY;
    const scrollLeft = window.scrollX;

    const originX = rect.left + rect.width / 2 - scrollLeft;
    const originY = rect.top + rect.height / 2 - scrollTop;
    const originWidth = rect.width;
    const originHeight = rect.height;

    // 目标尺寸
    const targetWidth = Math.min(rect.width * 2, window.innerWidth * 0.9);
    // eslint-disable-next-line no-unused-vars
    const targetHeight = targetWidth * (originHeight / originWidth);
    const targetX = window.innerWidth / 2;
    const targetY = window.innerHeight / 2;

    zoomed.style.transformOrigin = originX + 'px ' + originY + 'px';
    zoomed.style.transform = 'translate(-50%, -50%) translate(' + (targetX - originX) + 'px, ' + (targetY - originY) + 'px) scale(' + (targetWidth / originWidth) + ')';

    overlay.appendChild(zoomed);
    document.body.appendChild(overlay);

    // 触发动画
    requestAnimationFrame(function() {
      overlay.style.opacity = '1';
      zoomed.style.opacity = '1';
      zoomed.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    this._overlay = overlay;
    this._zoomed = zoomed;
    this._originRect = rect;

    // 禁止背景滚动
    document.body.style.overflow = 'hidden';
  };

  MediumZoom.prototype._close = function() {
    if (!this._opened || this._hiding) {
      return;
    }
    this._hiding = true;

    const overlay = this._overlay;
    const zoomed = this._zoomed;
    // eslint-disable-next-line no-unused-vars
    const originRect = this._originRect;

    if (!overlay || !zoomed) {
      this._hiding = false;
      return;
    }

    overlay.style.opacity = '0';
    zoomed.style.opacity = '0';

    setTimeout(function() {
      if (overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
      }
      document.body.style.overflow = '';
      this._opened = false;
      this._active = null;
      this._overlay = null;
      this._zoomed = null;
      this._hiding = false;
    }.bind(this), 300);
  };

  MediumZoom.prototype.update = function() {
    // 重新初始化，用于 Pjax 后刷新
    const zoomables = document.querySelectorAll('article img, .article-content img, .markdown-body img');
    zoomables.forEach(function(img) {
      if (!img.closest('a') && !img.classList.contains('no-zoom') && !img.classList.contains('zoomable')) {
        img.classList.add('zoomable');
      }
    });
  };

  // 导出
  window.MediumZoom = MediumZoom;

})();

// 初始化
(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {
    window.mediumZoom = new window.MediumZoom();
  });

  // Pjax 成功后重新初始化
  document.addEventListener('pjax:success', function() {
    if (window.mediumZoom) {
      window.mediumZoom.update();
    }
  });
})();
