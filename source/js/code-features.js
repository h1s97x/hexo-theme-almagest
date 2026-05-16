/**
 * 代码块高级功能
 * 支持行号显示、行高亮、代码折叠
 */

(function () {
  'use strict';

  const defaultConfig = {
    codeLineNumber: true,
    codeHighlight: true,
    codeFold: true
  };

  let config = {};

  /**
   * 初始化代码块高级功能
   */
  function initCodeFeatures() {
    // 合并配置
    config = Object.assign({}, defaultConfig, window.themeConfig?.codeFeatures || {});

    if (config.codeLineNumber) {
      addLineNumbers();
    }

    if (config.codeHighlight) {
      highlightLines();
    }

    if (config.codeFold) {
      initCodeFold();
    }
  }

  /**
   * 添加行号
   */
  function addLineNumbers() {
    const codeBlocks = document.querySelectorAll('pre code');
    codeBlocks.forEach(codeBlock => {
      // 跳过已经有行号的代码块
      if (codeBlock.classList.contains('line-number-done')) {
        return;
      }

      const lines = codeBlock.innerHTML.split('\n');
      const lineNumbers = [];

      lines.forEach((_, i) => {
        if (lines[i].trim() !== '') {
          lineNumbers.push(`<span class="line-number">${i + 1}</span>`);
        } else {
          lineNumbers.push('<span class="line-number empty"></span>');
        }
      });

      codeBlock.innerHTML =
        '<span class="line-numbers-rows">' + lineNumbers.join('') + '</span>' + codeBlock.innerHTML;
      codeBlock.classList.add('line-number-done');
    });
  }

  /**
   * 高亮指定行
   * 支持语法: ```js {1,3-5} 或 ```js hl_lines=[1,3,4]
   */
  function highlightLines() {
    const codeBlocks = document.querySelectorAll('pre[data-highlight]');

    codeBlocks.forEach(pre => {
      const highlightLines = pre.getAttribute('data-highlight');
      if (!highlightLines) {
        return;
      }

      // 解析行号 (支持 "1,3-5" 或 "[1,3,4]" 格式)
      const lines = parseHighlightLines(highlightLines);
      const codeEl = pre.querySelector('code');
      if (!codeEl) {
        return;
      }

      // 获取所有行
      let html = codeEl.innerHTML;
      const lineHtmls = html.split('\n');

      // 高亮指定行
      lineHtmls.forEach((line, index) => {
        const lineNum = index + 1;
        if (lines.includes(lineNum)) {
          lineHtmls[index] = `<span class="code-line-highlight">${line}</span>`;
        }
      });

      codeEl.innerHTML = lineHtmls.join('\n');
    });
  }

  /**
   * 解析高亮行号字符串
   * @param {string} str - "1,3-5" 或 "[1,3,4]"
   * @returns {number[]} 行号数组
   */
  function parseHighlightLines(str) {
    const lines = [];
    // 移除 [] 如果有
    str = str.replace(/^\[|\]$/g, '');

    str.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim(), 10));
        for (let i = start; i <= end; i++) {
          lines.push(i);
        }
      } else {
        const num = parseInt(part, 10);
        if (!isNaN(num)) {
          lines.push(num);
        }
      }
    });

    return lines;
  }

  /**
   * 初始化代码折叠功能
   */
  function initCodeFold() {
    const codeBlocks = document.querySelectorAll('pre[data-fold]');

    codeBlocks.forEach(pre => {
      // 获取折叠行数
      const foldLines = parseInt(pre.getAttribute('data-fold') || '10', 10);

      // 检查代码行数
      const codeEl = pre.querySelector('code');
      if (!codeEl) {
        return;
      }

      const lineCount = (codeEl.textContent.match(/\n/g) || []).length + 1;

      // 如果代码行数小于阈值，不折叠
      if (lineCount <= foldLines) {
        return;
      }

      // 创建折叠按钮
      const foldBtn = document.createElement('div');
      foldBtn.className = 'code-fold-btn';
      foldBtn.textContent = '▼ 展开';
      foldBtn.setAttribute('data-folded', 'false');

      // 添加折叠容器
      const foldWrapper = document.createElement('div');
      foldWrapper.className = 'code-fold-wrapper';

      // 将 pre 包裹在折叠容器中
      pre.parentNode.insertBefore(foldWrapper, pre);
      foldWrapper.appendChild(foldBtn);
      foldWrapper.appendChild(pre);

      // 添加折叠样式
      foldWrapper.classList.add('folded');

      // 点击事件
      foldBtn.addEventListener('click', () => {
        const isFolded = foldBtn.getAttribute('data-folded') === 'true';
        if (isFolded) {
          // 展开
          pre.style.maxHeight = 'none';
          foldBtn.textContent = '▲ 收起';
          foldBtn.setAttribute('data-folded', 'false');
          foldWrapper.classList.remove('folded');
        } else {
          // 折叠
          pre.style.maxHeight = foldLines * 1.5 + 'em';
          foldBtn.textContent = '▼ 展开';
          foldBtn.setAttribute('data-folded', 'true');
          foldWrapper.classList.add('folded');
        }
      });
    });
  }

  /**
   * 销毁函数 (Pjax 切换时调用)
   */
  function destroy() {
    // 移除行号
    document.querySelectorAll('.line-numbers-rows').forEach(el => el.remove());
    document
      .querySelectorAll('.line-number-done')
      .forEach(el => el.classList.remove('line-number-done'));

    // 移除高亮
    document.querySelectorAll('.code-line-highlight').forEach(el => {
      const parent = el.parentNode;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
    });

    // 移除折叠
    document.querySelectorAll('.code-fold-wrapper').forEach(wrapper => {
      const pre = wrapper.querySelector('pre');
      const btn = wrapper.querySelector('.code-fold-btn');
      if (pre) {
        wrapper.parentNode.insertBefore(pre, wrapper);
        pre.style.maxHeight = '';
      }
      if (btn) {
        btn.remove();
      }
      wrapper.remove();
    });
  }

  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeFeatures);
  } else {
    initCodeFeatures();
  }

  // 导出
  window.codeFeatures = {
    init: initCodeFeatures,
    destroy: destroy
  };
})();
