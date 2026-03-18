/**
 * Code Copy Script
 * Adds copy button to code blocks
 */

(function() {
  'use strict';

  function initCodeCopy() {
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(codeBlock => {
      const pre = codeBlock.parentElement;
      
      // Create copy button
      const copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code');
      
      // Add copy functionality
      copyButton.addEventListener('click', function() {
        const code = codeBlock.textContent;
        
        navigator.clipboard.writeText(code).then(() => {
          // Show success feedback
          const originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          copyButton.classList.add('copied');
          
          setTimeout(() => {
            copyButton.textContent = originalText;
            copyButton.classList.remove('copied');
          }, 2000);
        }).catch(err => {
          console.error('Failed to copy code:', err);
          copyButton.textContent = 'Failed';
          
          setTimeout(() => {
            copyButton.textContent = 'Copy';
          }, 2000);
        });
      });
      
      // Insert button into pre element
      pre.style.position = 'relative';
      pre.appendChild(copyButton);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeCopy);
  } else {
    initCodeCopy();
  }

})();
