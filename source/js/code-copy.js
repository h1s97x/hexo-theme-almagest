/**
 * Code Copy Script
 * Adds copy button to code blocks.
 */

(function () {
  'use strict';

  // 统一配置（scripts.ejs 注入的 window.__almagestConfig）
  function config() {
    try {
      return (window.__almagestConfig && window.__almagestConfig.copy) || {};
    } catch (e) {
      return {};
    }
  }

  function initCodeCopy() {
    // 兼容两种代码块结构：
    // 1. 主题 highlight.js 方案（默认，Hexo 内置高亮已被主题关闭）：
    //    <pre><code class="language-js">
    // 2. Hexo 内置高亮（code_highlight.enable: false 时）：
    //    <figure class="highlight"><table><tr><td class="gutter"><pre>行号</pre>
    //    </td><td class="code"><pre>代码</pre></td></tr></table></figure>
    //    （关闭行号时为 <figure class="highlight"><pre>，即直接子级 pre）
    // 只取「装代码」的那个 pre：gutter 里是行号，不能作为复制来源。
    const targets = document.querySelectorAll(
      'pre code, figure.highlight td.code pre, figure.highlight > pre'
    );
    const texts = config();

    targets.forEach(target => {
      // pre code 结构取父级 pre；其余结构 target 本身就是 pre
      const pre = target.tagName === 'PRE' ? target : target.parentElement;

      // Skip if already has a copy button
      if (pre.querySelector('.code-copy-btn')) {
        return;
      }

      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.textContent = texts.copy || 'Copy';
      copyButton.setAttribute('aria-label', texts.copy || 'Copy code');

      // Add copy functionality
      copyButton.addEventListener('click', function () {
        const code = target.textContent;

        copyText(code)
          .then(() => {
            // Show success feedback
            const originalText = copyButton.textContent;
            const copiedText = texts.copied || 'Copied!';
            copyButton.textContent = copiedText;
            copyButton.classList.add('copied');

            setTimeout(() => {
              copyButton.textContent = originalText;
              copyButton.classList.remove('copied');
            }, 2000);
          })
          .catch(() => {
            // eslint-disable-next-line no-console
            console.error('Failed to copy code');
            copyButton.textContent = texts.failed || 'Failed';

            setTimeout(() => {
              copyButton.textContent = texts.copy || 'Copy';
            }, 2000);
          });
      });

      // Insert button into pre element
      pre.style.position = 'relative';
      pre.appendChild(copyButton);
    });
  }

  /**
   * Copy text with fallback for older browsers
   */
  function copyText(text) {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    // Fallback: execCommand
    return new Promise(function (resolve, reject) {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (success) {
          resolve();
        } else {
          reject(new Error('execCommand copy failed'));
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopy);
  } else {
    initCodeCopy();
  }
})();
