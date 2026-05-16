/**
 * 打字机效果 (Typing Effect)
 * 参考 Fluid 主题的打字机实现
 * 为首页副标题添加打字机动画效果
 */

(function () {
  'use strict';

  /**
   * 打字机类
   * @param {HTMLElement} element - 目标元素
   * @param {Object} options - 配置选项
   */
  function TypingEffect(element, options) {
    this.element = element;
    this.text = options.text || '';
    this.speed = parseInt(options.speed, 10) || 70;
    this.cursor = options.cursor || '_';
    this.loop = options.loop === 'true' || options.loop === true;
    this.index = 0;
    this.isDeleting = false;
    this.timer = null;

    this.init();
  }

  /**
   * 初始化打字机
   */
  TypingEffect.prototype.init = function () {
    if (!this.text) {
      return;
    }

    this.type();
  };

  /**
   * 打字动画核心逻辑
   */
  TypingEffect.prototype.type = function () {
    const self = this;
    const currentText = this.text;
    let displayText = '';

    if (this.isDeleting) {
      // 删除模式
      displayText = currentText.substring(0, this.index - 1);
      this.index--;
    } else {
      // 打字模式
      displayText = currentText.substring(0, this.index + 1);
      this.index++;
    }

    this.element.textContent = displayText;

    // 计算打字速度
    let typeSpeed = this.speed;
    if (this.isDeleting) {
      typeSpeed /= 2; // 删除速度快一倍
    }

    // 判断状态转换
    if (!this.isDeleting && this.index === currentText.length) {
      // 打完一行
      if (this.loop) {
        typeSpeed = 2000; // 暂停 2 秒后开始删除
        this.isDeleting = true;
      } else {
        // 不循环，停止打字，隐藏光标
        this.hideCursor();
        return;
      }
    } else if (this.isDeleting && this.index === 0) {
      // 删除完毕
      this.isDeleting = false;
      typeSpeed = 500; // 暂停 0.5 秒后开始打下一行
    }

    this.timer = setTimeout(function () {
      self.type();
    }, typeSpeed);
  };

  /**
   * 隐藏光标
   */
  TypingEffect.prototype.hideCursor = function () {
    const cursor = this.element.parentNode.querySelector('.typing-cursor');
    if (cursor) {
      cursor.style.display = 'none';
    }
  };

  /**
   * 销毁打字机
   */
  TypingEffect.prototype.destroy = function () {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  };

  /**
   * 初始化所有打字机效果
   */
  function initTypingEffects() {
    const elements = document.querySelectorAll('.typing-effect');

    elements.forEach(function (element) {
      // 如果已经有实例，先销毁
      if (element._typingInstance) {
        element._typingInstance.destroy();
      }

      // 创建新实例
      element._typingInstance = new TypingEffect(element, {
        text: element.dataset.text,
        speed: element.dataset.speed,
        cursor: element.dataset.cursor,
        loop: element.dataset.loop
      });
    });
  }

  // 页面加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTypingEffects);
  } else {
    initTypingEffects();
  }

  // Pjax 完成后重新初始化
  document.addEventListener('pjax:complete', initTypingEffects);

  // 导出到全局
  window.TypingEffect = TypingEffect;
  window.initTypingEffects = initTypingEffects;
})();
