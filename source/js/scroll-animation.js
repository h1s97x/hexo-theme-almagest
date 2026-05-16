/**
 * 滚动动画 - 元素进入视口时触发动画
 * 使用 Intersection Observer API
 */

(function () {
  'use strict';

  // 配置
  const SCROLL_ANIMATION_CONFIG = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  /**
   * 初始化滚动动画
   * 为带有 data-scroll 类名的元素添加动画
   */
  function initScrollAnimation() {
    // 检查浏览器是否支持 Intersection Observer
    if (!('IntersectionObserver' in window)) {
      // 不支持则直接显示所有元素
      document.querySelectorAll('[data-scroll]').forEach(function (el) {
        el.classList.add('scroll-show');
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // 元素进入视口，添加显示类
          entry.target.classList.add('scroll-show');
          // 动画完成后停止观察
          observer.unobserve(entry.target);
        }
      });
    }, SCROLL_ANIMATION_CONFIG);

    // 观察所有带有 data-scroll 属性的元素
    document.querySelectorAll('[data-scroll]').forEach(function (el) {
      observer.observe(el);
    });
  }

  /**
   * 初始化归档页时间线动画
   */
  function initArchiveTimelineAnimation() {
    // 为归档页的文章项添加 data-scroll 属性
    const archiveItems = document.querySelectorAll('.archive-item');
    archiveItems.forEach(function (item, index) {
      item.setAttribute('data-scroll', '');
      // 添加延迟以实现交错动画效果
      item.style.transitionDelay = (index % 10) * 50 + 'ms';
    });

    // 为年份标题添加动画
    const yearTitles = document.querySelectorAll('.archive-year');
    yearTitles.forEach(function (title) {
      title.setAttribute('data-scroll', '');
    });
  }

  /**
   * 初始化时间线节点动画
   */
  function initTimelineAnimation() {
    const timelineNodes = document.querySelectorAll('.timeline-node');
    timelineNodes.forEach(function (node, index) {
      node.setAttribute('data-scroll', '');
      // 添加延迟以实现交错动画效果
      node.style.transitionDelay = (index % 5) * 100 + 'ms';
    });
  }

  // 页面加载完成后初始化
  function init() {
    initScrollAnimation();
    initArchiveTimelineAnimation();
    initTimelineAnimation();
  }

  // 监听 DOM 加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Pjax 切换页面后重新初始化
  document.addEventListener('pjax:complete', function () {
    init();
  });
})();
