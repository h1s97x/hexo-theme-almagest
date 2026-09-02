/**
 * Code Copy Script
 * Adds copy button to code blocks.
 */

(function () {
  'use strict';

  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(codeBlock => {
      const pre = codeBlock.parentElement;

      // Skip if already has a copy button
      if (pre.querySelector('.code-copy-btn')) {
        return;
      }

      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.textContent = window.__almagestCopyText || 'Copy';
      copyButton.setAttribute('aria-label', window.__almagestCopyText || 'Copy code');

      // Add copy functionality
      copyButton.addEventListener('click', function () {
        const code = codeBlock.textContent;

        copyText(code)
          .then(() => {
            // Show success feedback
            const originalText = copyButton.textContent;
            const copiedText = window.__almagestCopiedText || 'Copied!';
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
            copyButton.textContent = window.__almagestCopyFailedText || 'Failed';

            setTimeout(() => {
              copyButton.textContent = window.__almagestCopyText || 'Copy';
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
