/**
 * Hexo Tags
 * Custom tag plugins for Almagest theme
 * Compatible with Stellar theme syntax
 */

'use strict';

module.exports = function(hexo) {
  
  // Note tag (Stellar compatibility)
  // Usage: {% note color:type content %} or {% note type %}content{% endnote %}
  hexo.extend.tag.register('note', function(args, content) {
    // Parse arguments like: color:cyan This is content
    let color = 'default';
    let icon = '';
    let text = '';
    
    args.forEach(arg => {
      if (arg.startsWith('color:')) {
        color = arg.replace('color:', '');
      } else if (arg.startsWith('icon:')) {
        icon = arg.replace('icon:', '');
      } else {
        text += (text ? ' ' : '') + arg;
      }
    });
    
    // If content is provided via end tag, use that instead
    const contentText = content ? hexo.render.renderSync({text: content, engine: 'markdown'}) : text;
    const iconHtml = icon ? `<span class="note-icon"><i class="icon-${icon}"></i></span>` : '';
    
    return `<div class="note note-${color}">${iconHtml}<div class="note-content">${contentText}</div></div>`;
  }, {ends: true});

  // Quote tag (Stellar compatibility)
  // Usage: {% quot text icon:hashtag %}
  hexo.extend.tag.register('quot', function(args) {
    let text = '';
    let icon = '';
    
    args.forEach(arg => {
      if (arg.startsWith('icon:')) {
        icon = arg.replace('icon:', '');
      } else {
        text += (text ? ' ' : '') + arg;
      }
    });
    
    const iconHtml = icon ? `<span class="quote-icon"><i class="icon-${icon}"></i></span>` : '';
    return `<blockquote class="quote-block">${iconHtml}<p class="quote-text">${text}</p></blockquote>`;
  });

  // Timeline tag (Stellar compatibility)
  // Usage: {% timeline title %} content {% endtimeline %}
  hexo.extend.tag.register('timeline', function(args, content) {
    const title = args.join(' ');
    const titleHtml = title ? `<h3 class="timeline-title">${title}</h3>` : '';
    
    // Process <!-- node text --> comments as timeline items
    let processedContent = content.replace(/<!--\s*node\s+(.+?)\s*-->/g, (match, nodeText) => {
      return `</div><div class="timeline-node"><div class="timeline-node-title">${nodeText}</div>`;
    });
    
    // Wrap content properly
    processedContent = hexo.render.renderSync({text: processedContent, engine: 'markdown'});
    
    return `<div class="timeline">${titleHtml}<div class="timeline-content">${processedContent}</div></div>`;
  }, {ends: true});

  // Checkbox tag (Stellar compatibility)
  // Usage: {% checkbox checked:true text %}
  hexo.extend.tag.register('checkbox', function(args) {
    let checked = false;
    let text = '';
    
    args.forEach(arg => {
      if (arg === 'checked:true') {
        checked = true;
      } else if (arg.startsWith('checked:')) {
        checked = arg.replace('checked:', '') === 'true';
      } else {
        text += (text ? ' ' : '') + arg;
      }
    });
    
    const checkedAttr = checked ? 'checked' : '';
    return `<label class="checkbox-item"><input type="checkbox" ${checkedAttr} disabled /><span class="checkbox-text">${text}</span></label>`;
  });

  // Folding/Collapse tag
  // Usage: {% folding title %} content {% endfolding %}
  hexo.extend.tag.register('folding', function(args, content) {
    const title = args[0] || 'Click to expand';
    const open = args.includes('open') ? 'open' : '';
    return `
      <details class="folding-block" ${open}>
        <summary class="folding-title">${title}</summary>
        <div class="folding-content">${hexo.render.renderSync({text: content, engine: 'markdown'})}</div>
      </details>
    `;
  }, {ends: true});

  // Alert tag
  hexo.extend.tag.register('alert', function(args, content) {
    const type = args[0] || 'info';
    return `<div class="alert alert-${type}">${hexo.render.renderSync({text: content, engine: 'markdown'})}</div>`;
  }, {ends: true});

  // Button tag
  // Usage: {% button text url type %}
  hexo.extend.tag.register('button', function(args) {
    const text = args[0] || 'Click me';
    const url = args[1] || '#';
    const type = args[2] || 'primary';
    return `<a href="${url}" class="btn btn-${type}">${text}</a>`;
  });

  // Link card
  // Usage: {% link url title description %}
  hexo.extend.tag.register('link', function(args) {
    const url = args[0] || '#';
    const title = args[1] || url;
    const desc = args[2] || '';
    const descHtml = desc ? `<p class="link-desc">${desc}</p>` : '';
    return `
      <a href="${url}" class="link-card" target="_blank" rel="noopener noreferrer">
        <div class="link-card-content">
          <div class="link-title">${title}</div>
          ${descHtml}
          <div class="link-url">${url}</div>
        </div>
      </a>
    `;
  });

  // Image with caption
  // Usage: {% image url alt caption %}
  hexo.extend.tag.register('image', function(args) {
    const url = args[0] || '';
    const alt = args[1] || '';
    const caption = args[2] || '';
    const captionHtml = caption ? `<figcaption class="image-caption">${caption}</figcaption>` : '';
    return `
      <figure class="image-figure">
        <img src="${url}" alt="${alt}" loading="lazy" />
        ${captionHtml}
      </figure>
    `;
  });

  // Copy code block
  hexo.extend.tag.register('copy', function(args, content) {
    const lang = args[0] || 'text';
    const showLineNumbers = args.includes('line-numbers');
    const lineNumbersClass = showLineNumbers ? 'line-numbers' : '';
    return `
      <div class="code-block-wrapper">
        <div class="code-block-header">
          <span class="code-lang">${lang}</span>
          <button class="code-copy-btn">Copy</button>
        </div>
        <pre class="code-block ${lineNumbersClass}"><code class="language-${lang}">${content}</code></pre>
      </div>
    `;
  }, {ends: true});

  // Markdown tag for raw markdown content
  hexo.extend.tag.register('md', function(args, content) {
    return hexo.render.renderSync({text: content, engine: 'markdown'});
  }, {ends: true});

  // Center text
  hexo.extend.tag.register('center', function(args, content) {
    return `<div class="text-center">${content}</div>`;
  }, {ends: true});

  // Grid layout
  hexo.extend.tag.register('grid', function(args, content) {
    const cols = args[0] || '2';
    return `<div class="grid-layout grid-cols-${cols}">${content}</div>`;
  }, {ends: true});

  // Badge tag
  hexo.extend.tag.register('badge', function(args) {
    const text = args[0] || '';
    const type = args[1] || 'default';
    return `<span class="badge badge-${type}">${text}</span>`;
  });

  // Label tag (inline highlight)
  hexo.extend.tag.register('label', function(args) {
    const text = args[0] || '';
    const color = args[1] || 'default';
    return `<span class="label label-${color}">${text}</span>`;
  });
  
  // Tab tags
  hexo.extend.tag.register('tabs', function(args, content) {
    const tabNames = args.join(' ').split(',').map(s => s.trim()).filter(s => s);
    const tabsHtml = tabNames.map((name, idx) => 
      `<button class="tab-btn ${idx === 0 ? 'active' : ''}" data-tab="${idx}">${name}</button>`
    ).join('');
    
    return `
      <div class="tabs-container">
        <div class="tabs-header">${tabsHtml}</div>
        <div class="tabs-content">${content}</div>
      </div>
    `;
  }, {ends: true});

  hexo.extend.tag.register('tab', function(args, content) {
    return `<div class="tab-panel">${content}</div>`;
  }, {ends: true});
};
