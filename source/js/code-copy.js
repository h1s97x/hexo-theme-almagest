/**
 * Code Copy Script
 * Adds copy button and language label to code blocks
 */

(function() {
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

    codeBlocks.forEach(function(codeBlock) {
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

      // Create copy button
      var copyButton = document.createElement('button');
      copyButton.className = 'code-copy-btn';
      copyButton.textContent = 'Copy';
      copyButton.setAttribute('aria-label', 'Copy code');
      header.appendChild(copyButton);

      // Add copy functionality
      copyButton.addEventListener('click', function() {
        var code = codeBlock.textContent;

        navigator.clipboard.writeText(code).then(function() {
          var originalText = copyButton.textContent;
          copyButton.textContent = 'Copied!';
          copyButton.classList.add('copied');

          setTimeout(function() {
            copyButton.textContent = originalText;
            copyButton.classList.remove('copied');
          }, 2000);
        }).catch(function(err) {
          console.error('Failed to copy code:', err);
          copyButton.textContent = 'Failed';

          setTimeout(function() {
            copyButton.textContent = 'Copy';
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
