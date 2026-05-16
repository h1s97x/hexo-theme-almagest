/**
 * 随机 Banner 图片工具
 * 从指定目录随机选择图片作为 Banner
 * @description 当 index.random_img 开启时，从 /img/random/ 目录随机选择图片
 */
(function () {
  'use strict';

  /**
   * 从数组中随机选择一个元素
   * @param {Array} arr - 源数组
   * @returns {*} 随机元素
   */
  function randomPick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * 初始化随机 Banner
   * 将 data-src 属性设置为随机选择的图片 src
   */
  function initRandomBanner() {
    // 查找所有带有 data-random-src 属性的元素
    var elements = document.querySelectorAll('[data-random-src]');
    if (!elements || elements.length === 0) {
      return;
    }

    // 获取随机图片路径列表（从 window.randomBanners 全局变量）
    var banners = window.randomBanners;
    if (!banners || banners.length === 0) {
      return;
    }

    // 为每个元素设置随机图片
    elements.forEach(function (el) {
      var src = randomPick(banners);
      el.setAttribute('src', src);
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRandomBanner);
  } else {
    initRandomBanner();
  }

  // Pjax 完成后重新初始化
  document.addEventListener('pjax:complete', initRandomBanner);
})();
