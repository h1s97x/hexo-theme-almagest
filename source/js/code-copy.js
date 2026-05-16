/**
 * Code Copy Script
 * Adds copy button and language label to code blocks
 */

(function () {
  'use strict';

  // 常用语言名称映射
  var langNames = {
    js: 'JavaScript',
    javascript: 'JavaScript',
    ts: 'TypeScript',
    typescript: 'TypeScript',
    py: 'Python',
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    cs: 'C#',
    csharp: 'C#',
    go: 'Go',
    rust: 'Rust',
    rs: 'Rust',
    swift: 'Swift',
    kotlin: 'Kotlin',
    php: 'PHP',
    ruby: 'Ruby',
    html: 'HTML',
    xml: 'XML',
    css: 'CSS',
    scss: 'SCSS',
    sass: 'Sass',
    less: 'Less',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    md: 'Markdown',
    markdown: 'Markdown',
    sh: 'Shell',
    bash: 'Bash',
    shell: 'Shell',
    zsh: 'Zsh',
    sql: 'SQL',
    mysql: 'MySQL',
    pgsql: 'PostgreSQL',
    docker: 'Dockerfile',
    dockerfile: 'Dockerfile',
    makefile: 'Makefile',
    make: 'Makefile',
    vim: 'Vim',
    lua: 'Lua',
    perl: 'Perl',
    r: 'R',
    scala: 'Scala',
    haskell: 'Haskell',
    elixir: 'Elixir',
    erlang: 'Erlang',
    clojure: 'Clojure',
    fsharp: 'F#',
    ocaml: 'OCaml',
    plaintext: 'Plain Text',
    text: 'Text'
  };

  function getLanguageName(lang) {
    if (!lang) {
      return '';
    }
    lang = lang.toLowerCase().trim();
    return langNames[lang] || lang.toUpperCase();
  }

  function initCodeBlocks() {
    var codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach(function (codeBlock) {
      var pre = codeBlock.parentElement;

      // Skip if already processed
      if (pre.classList.contains('code-block-processed')) {
        return;
      }
      pre.classList.add('code-block-processed');

      // Get language from class
      var lang = '';
      var langClass = codeBlock.className.match(/language-(\w+)/);
      if (langClass) {
        lang = getLanguageName(langClass[1]);
      }

      // Create code block wrapper
      var wrapper = document.createElement('div');
      wrapper.className = 'code-block-wrapper';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      // Create header
      var header = document.createElement('div');
      header.className = 'code-block-header';

      // Add language label
      if (lang) {
        var langLabel = document.createElement('span');
        langLabel.className = 'code-lang';
        langLabel.textContent = lang;
        header.appendChild(langLabel);
      }

      // Create copy button with SVG icon
      var copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.setAttribute('aria-label', 'Copy code');

      // SVG icons for copy state and copied state
      copyButton.innerHTML =
        '<svg class="copy-icon" viewBox="0 0 24 24" width="16" height="16">' +
        '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor"/>' +
        '</svg>' +
        '<svg class="check-icon" viewBox="0 0 24 24" width="16" height="16">' +
        '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>' +
        '</svg>';
      copyButton.dataset.copyState = 'copy';
      header.appendChild(copyButton);

      // Add copy functionality
      copyButton.addEventListener('click', function () {
        var code = codeBlock.textContent;

        navigator.clipboard
          .writeText(code)
          .then(function () {
            // Switch to copied state
            copyButton.dataset.copyState = 'copied';
            copyButton.classList.add('copied');

            setTimeout(function () {
              // Switch back to copy state
              copyButton.dataset.copyState = 'copy';
              copyButton.classList.remove('copied');
            }, 2000);
          })
          .catch(function () {
            // Keep original behavior on error
            copyButton.dataset.copyState = 'error';
            copyButton.classList.add('error');

            setTimeout(function () {
              copyButton.dataset.copyState = 'copy';
              copyButton.classList.remove('error');
            }, 2000);
          });
      });

      // Insert header
      wrapper.insertBefore(header, pre);
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCodeBlocks);
  } else {
    initCodeBlocks();
  }

  // Re-initialize after Pjax
  document.addEventListener('pjax:success', initCodeBlocks);
})();
