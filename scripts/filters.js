/**
 * Hexo Filters
 * Content filters, SEO optimizations, and transformations
 */

'use strict';

module.exports = function(hexo) {

  // ============================================
  // Content Processing Filters
  // ============================================

  // Before post render - add processing
  hexo.extend.filter.register('before_post_render', function(data) {
    // Add reading time to post
    if (!data.reading_time) {
      const content = data.content.replace(/<[^>]*>/g, '');
      const wordCount = content.split(/\s+/).length;
      data.reading_time = Math.ceil(wordCount / 200);
    }

    return data;
  });

  // After post render - modify rendered content
  hexo.extend.filter.register('after_post_render', function(data) {
    // Wrap images with figure for better styling
    if (data.content) {
      data.content = data.content.replace(
        /<img([^>]*)src="([^"]*)"([^>]*)\/?>/g,
        '<figure class="article-image"><img$1src="$2"$3></figure>'
      );
    }

    return data;
  });

  // Generate excerpt automatically if not provided
  hexo.extend.filter.register('excerpt', function(data) {
    if (data.excerpt) return data;

    // Try to find <!-- more --> marker
    const moreMarker = '<!-- more -->';
    const moreIndex = data.content.indexOf(moreMarker);

    if (moreIndex !== -1) {
      data.excerpt = data.content.substring(0, moreIndex).replace(/<[^>]*>/g, '').trim();
    } else {
      // Generate from content
      const content = data.content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
      data.excerpt = content.substring(0, 200) + '...';
    }

    return data;
  });

  // ============================================
  // SEO Filters
  // ============================================

  // Generate meta tags for head
  hexo.extend.filter.register('theme_inject', function(html) {
    const config = this.theme;
    const page = this.page;

    // Open Graph tags
    const ogTags = [
      '<meta property="og:title" content="' + (page.title || config.title) + '">',
      '<meta property="og:description" content="' + (page.description || config.description || '') + '">',
      '<meta property="og:url" content="' + this.url + '">',
      '<meta property="og:type" content="' + (page.layout === 'post' ? 'article' : 'website') + '">',
      '<meta property="og:site_name" content="' + config.title + '">'
    ];

    // Twitter Card tags
    if (config.seo?.open_graph?.twitter_card !== false) {
      ogTags.push('<meta name="twitter:card" content="summary">');
      if (config.seo?.open_graph?.twitter_id) {
        ogTags.push('<meta name="twitter:site" content="' + config.seo.open_graph.twitter_id + '">');
      }
    }

    // Canonical URL
    const canonicalUrl = (config.url || '') + '/' + (page.canonical_path || page.path);
    ogTags.push('<link rel="canonical" href="' + canonicalUrl + '">');

    // Insert after head opening tag
    return html.replace(/<head([^>]*)>/, function(match) {
      return match + '\n' + ogTags.join('\n');
    });
  });

  // ============================================
  // Asset Path Filters
  // ============================================

  // Process asset paths
  hexo.extend.filter.register('asset_path', function(path) {
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
  hexo.extend.filter.register('menu_item_active', function(html, path) {
    if (html.indexOf('href="' + path + '"') !== -1) {
      html = html.replace('class="nav-link"', 'class="nav-link active"');
    }
    return html;
  });

  // ============================================
  // Server Filters
  // ============================================

  // Add headers for caching
  hexo.extend.filter.register('server_middleware', function(app) {
    app.use(function(ctx, next) {
      // Add cache headers for assets
      if (ctx.path.match(/\.(css|js|jpg|jpeg|png|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
        ctx.set('Cache-Control', 'public, max-age=31536000');
      }
      return next();
    });
  });
};
