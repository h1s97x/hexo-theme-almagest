/**
 * Utilities - 工具函数库
 * 基于 Butterfly 主题的 utils.js，MIT License
 */

(function() {
  'use strict';

  const btf = {
    // 节流函数
    throttle: function(func, wait, options) {
      let timeout;
      let previous = 0;
      const later = function() {
        previous = options.leading === false ? 0 : Date.now();
        timeout = null;
        func.apply(this, arguments);
      };

      return function() {
        const now = Date.now();
        if (!previous && options.leading === false) {
          previous = now;
        }
        const remaining = wait - (now - previous);
        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }
          previous = now;
          func.apply(this, arguments);
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }
      };
    },

    // 防抖函数
    debounce: function(func, wait, immediate) {
      let timeout;
      return function() {
        const context = this;
        const args = arguments;
        if (timeout) {
          clearTimeout(timeout);
        }
        if (immediate) {
          const callNow = !timeout;
          timeout = setTimeout(function() {
            timeout = null;
          }, wait);
          if (callNow) {
            func.apply(context, args);
          }
        } else {
          timeout = setTimeout(function() {
            func.apply(context, args);
          }, wait);
        }
      };
    },

    // 滚动到指定位置
    scrollToDest: function(pos, time) {
      time = time || 500;
      const currentPos = window.scrollY;
      const isNavFixed = document.getElementById('header').classList.contains('fixed');
      if (currentPos > pos || isNavFixed) {
        pos = pos - 70;
      }

      if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({ top: pos, behavior: 'smooth' });
        return;
      }

      const startTime = performance.now();
      const animate = function(currentTime) {
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / time, 1);
        window.scrollTo(0, currentPos + (pos - currentPos) * progress);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    },

    // 获取滚动百分比
    getScrollPercent: function(currentTop, ele) {
      let docHeight, winHeight, headerHeight, contentMath;
      if (!docHeight || ele.clientHeight !== docHeight) {
        docHeight = ele.clientHeight;
        winHeight = window.innerHeight;
        headerHeight = ele.offsetTop;
        contentMath = Math.max(docHeight - winHeight, document.documentElement.scrollHeight - winHeight);
      }
      const scrollPercent = (currentTop - headerHeight) / contentMath;
      return Math.max(0, Math.min(100, Math.round(scrollPercent * 100)));
    },

    // 动画进入
    animateIn: function(ele, animation) {
      ele.style.display = 'block';
      ele.style.animation = animation;
    },

    // 动画退出
    animateOut: function(ele, animation) {
      const handleAnimationEnd = function() {
        ele.style.display = '';
        ele.style.animation = '';
        ele.removeEventListener('animationend', handleAnimationEnd);
      };
      ele.addEventListener('animationend', handleAnimationEnd);
      ele.style.animation = animation;
    },

    // 元素包装
    wrap: function(selector, eleType, options) {
      const createEle = document.createElement(eleType);
      for (const [key, value] of Object.entries(options)) {
        createEle.setAttribute(key, value);
      }
      selector.parentNode.insertBefore(createEle, selector);
      createEle.appendChild(selector);
    },

    // 检测元素是否隐藏
    isHidden: function(ele) {
      return ele.offsetHeight === 0 && ele.offsetWidth === 0;
    },

    // 获取元素顶部位置
    getEleTop: function(ele) {
      return ele.getBoundingClientRect().top + window.scrollY;
    },

    // 相对时间格式化
    diffDate: function(inputDate, more) {
      const dateNow = new Date();
      const datePost = new Date(inputDate);
      const diffMs = dateNow - datePost;
      const diffSec = diffMs / 1000;
      const diffMin = diffSec / 60;
      const diffHour = diffMin / 60;
      const diffDay = diffHour / 24;
      const diffMonth = diffDay / 30;

      if (!more) {
        return Math.floor(diffDay);
      }
      if (diffMonth > 12) {
        return datePost.toISOString().slice(0, 10);
      }
      if (diffMonth >= 1) {
        return Math.floor(diffMonth) + ' month(s) ago';
      }
      if (diffDay >= 1) {
        return Math.floor(diffDay) + ' day(s) ago';
      }
      if (diffHour >= 1) {
        return Math.floor(diffHour) + ' hour(s) ago';
      }
      if (diffMin >= 1) {
        return Math.floor(diffMin) + ' minute(s) ago';
      }
      return 'Just now';
    },

    // 懒加载评论
    loadComment: function(dom, callback) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries) {
          if (entries[0].isIntersecting) {
            callback();
            observer.disconnect();
          }
        }, { threshold: [0] });
        observer.observe(dom);
      } else {
        callback();
      }
    },

    // 修复 body padding-right (防止滚动条消失导致布局偏移)
    fixBodyPaddingRight: {
      add: function() {
        const paddingRight = window.innerWidth - document.body.clientWidth;
        if (paddingRight > 0) {
          document.body.style.paddingRight = paddingRight + 'px';
          document.body.style.overflow = 'hidden';
        }
      },
      remove: function() {
        document.body.style.paddingRight = '';
        document.body.style.overflow = '';
      }
    },

    // 添加 Pjax 事件监听
    addEventListenerPjax: function(ele, event, fn, option) {
      ele.addEventListener(event, fn, option);
      window.addFn('pjaxSendOnce_' + Math.random(), function() {
        ele.removeEventListener(event, fn, option);
      }, 'send');
    }
  };

  // 导出到全局
  window.btf = window.btf || btf;

})();
