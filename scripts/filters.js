/**
 * Hexo Filters
 * Content filters, SEO optimizations, and transformations
 */

'use strict';

module.exports = function (hexo) {
  // ============================================
  // Content Processing Filters
  // ============================================

  // Before post render - add processing
  hexo.extend.filter.register('before_post_render', function (data) {
    // Add reading time to post
    if (!data.reading_time) {
      const content = data.content.replace(/<[^>]*>/g, '');
      const wordCount = content.split(/\s+/).length;
      data.reading_time = Math.ceil(wordCount / 200);
    }

    return data;
  });

  // After post render - modify rendered content
  hexo.extend.filter.register('after_post_render', function (data) {
    // Wrap images with figure for better styling
    if (data.content) {
      data.content = data.content.replace(
        /<img([^>]*)src="([^"]*)"([^>]*)\/?>/g,
        '<figure class="article-image"><img$1src="$2"$3></figure>'
      );
    }

    // 处理脚注语法
    // 将 [^1] 和 [^1]: note 转换为 HTML 脚注
    const footnoteConfig = hexo.theme.config.post?.footnote;
    if (footnoteConfig?.enable !== false && data.content) {
      data.content = processFootnotes(data.content, footnoteConfig);
    }

    return data;
  });

  /**
   * 处理脚注语法
   * 将 Markdown 脚注语法转换为 HTML 脚注
   * @param {string} content - 文章内容
   * @param {object} config - 脚注配置
   * @returns {string} 处理后的内容
   */
  function processFootnotes(content, config) {
    const header = config?.header || '';
    const footnotes = {};
    let footnoteIndex = 0;
    const footnoteRefs = [];

    // 提取脚注定义: [^1]: content
    content = content.replace(
      /\[\^(\w+)\]:\s*(.+?)(?=\n\[\^|\n{2,}|\s*$)/gs,
      function (match, id, text) {
        footnoteIndex++;
        footnotes[id] = {
          id: id,
          index: footnoteIndex,
          text: text.trim()
        };
        return '';
      }
    );

    // 替换脚注引用: [^1]
    content = content.replace(/\[\^(\w+)\](?!:)/g, function (match, id) {
      if (!footnotes[id]) return match;
      const fn = footnotes[id];
      const refId = 'fnref-' + id;
      const fnId = 'fn-' + id;

      if (!footnoteRefs.includes(id)) {
        footnoteRefs.push(id);
      }

      return (
        '<sup class="footnote-ref"><a href="#' +
        fnId +
        '" id="' +
        refId +
        '">[' +
        fn.index +
        ']</a></sup>'
      );
    });

    // 生成脚注列表
    if (footnoteRefs.length > 0) {
      let footnoteHtml = '<div class="footnotes">';
      if (header) {
        footnoteHtml += '<h3 class="footnotes-header">' + header + '</h3>';
      }
      footnoteHtml += '<ol class="footnotes-list">';

      footnoteRefs.forEach(function (id) {
        const fn = footnotes[id];
        footnoteHtml += '<li id="fn-' + id + '" class="footnote-item">';
        footnoteHtml += fn.text;
        footnoteHtml += ' <a href="#fnref-' + id + '" class="footnote-backref">&#8617;</a>';
        footnoteHtml += '</li>';
      });

      footnoteHtml += '</ol></div>';
      content += footnoteHtml;
    }

    return content;
  }

  // Generate excerpt automatically if not provided
  hexo.extend.filter.register('excerpt', function (data) {
    if (data.excerpt) return data;

    // Try to find <!-- more --> marker
    const moreMarker = '<!-- more -->';
    const moreIndex = data.content.indexOf(moreMarker);

    if (moreIndex !== -1) {
      data.excerpt = data.content
        .substring(0, moreIndex)
        .replace(/<[^>]*>/g, '')
        .trim();
    } else {
      // Generate from content
      const content = data.content
        .replace(/<[^>]*>/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      data.excerpt = content.substring(0, 200) + '...';
    }

    return data;
  });

  // ============================================
  // SEO Filters
  // ============================================

  // Generate meta tags for head
  hexo.extend.filter.register('theme_inject', function (html) {
    const config = this.theme;
    const page = this.page;

    // Open Graph tags
    const ogTags = [
      '<meta property="og:title" content="' + (page.title || config.title) + '">',
      '<meta property="og:description" content="' +
        (page.description || config.description || '') +
        '">',
      '<meta property="og:url" content="' + this.url + '">',
      '<meta property="og:type" content="' +
        (page.layout === 'post' ? 'article' : 'website') +
        '">',
      '<meta property="og:site_name" content="' + config.title + '">'
    ];

    // Twitter Card tags
    if (config.seo?.open_graph?.twitter_card !== false) {
      ogTags.push('<meta name="twitter:card" content="summary">');
      if (config.seo?.open_graph?.twitter_id) {
        ogTags.push(
          '<meta name="twitter:site" content="' + config.seo.open_graph.twitter_id + '">'
        );
      }
    }

    // Canonical URL
    const canonicalUrl = (config.url || '') + '/' + (page.canonical_path || page.path);
    ogTags.push('<link rel="canonical" href="' + canonicalUrl + '">');

    // Insert after head opening tag
    return html.replace(/<head([^>]*)>/, function (match) {
      return match + '\n' + ogTags.join('\n');
    });
  });

  // ============================================
  // Asset Path Filters
  // ============================================

  // Process asset paths
  hexo.extend.filter.register('asset_path', function (path) {
    const config = this.theme;
    const cdn = config.cdn_prefix || '';

    if (cdn) {
      return cdn + path;
    }

    return path;
  });

  // ============================================
  // Template Filters
  // ============================================

  // Add active class to current menu item
  hexo.extend.filter.register('menu_item_active', function (html, path) {
    if (html.indexOf('href="' + path + '"') !== -1) {
      html = html.replace('class="nav-link"', 'class="nav-link active"');
    }
    return html;
  });

  // ============================================
  // Server Filters
  // ============================================

  // Add headers for caching
  hexo.extend.filter.register('server_middleware', function (app) {
    app.use(function (ctx, next) {
      // Add cache headers for assets
      if (ctx.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        ctx.set('Cache-Control', 'public, max-age=31536000');
      }
      return next();
    });
  });
};
