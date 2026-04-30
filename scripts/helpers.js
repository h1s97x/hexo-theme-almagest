/**
 * Hexo Helpers
 * Template helper functions for Almagest theme
 */

'use strict';

module.exports = function(hexo) {

  // Format date helper
  // Usage: <%= format_date(date, 'YYYY-MM-DD') %>
  hexo.extend.helper.register('format_date', function(date, format) {
    return hexo.util.moment(date).format(format || 'YYYY-MM-DD');
  });

  // Get relative time
  // Usage: <%= relative_date(date) %>
  hexo.extend.helper.register('relative_date', function(date) {
    return hexo.util.moment(date).fromNow();
  });

  // Get excerpt from content
  // Usage: <%= get_excerpt(content, 200) %>
  hexo.extend.helper.register('get_excerpt', function(post, length) {
    const excerpt_length = length || 200;
    let excerpt = post.excerpt || post.content;

    // Remove HTML tags
    excerpt = excerpt.replace(/<[^>]*>/g, '');

    // Remove markdown syntax
    excerpt = excerpt.replace(/[#*`_~\[\]]/g, '');

    // Truncate
    if (excerpt.length > excerpt_length) {
      excerpt = excerpt.substring(0, excerpt_length) + '...';
    }

    return excerpt;
  });

  // Get reading time
  // Usage: <%= get_reading_time(content) %>
  hexo.extend.helper.register('get_reading_time', function(content) {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');

    // Calculate reading time (200 words per minute)
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    return readingTime;
  });

  // Get word count
  // Usage: <%= get_word_count(content) %>
  hexo.extend.helper.register('get_word_count', function(content) {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');

    // Count words
    const words = text.split(/\s+/).filter(w => w.length > 0).length;

    return words;
  });

  // Check if post is featured
  // Usage: <%= is_featured(post) %>
  hexo.extend.helper.register('is_featured', function(post) {
    return post.featured === true;
  });

  // Get post categories
  // Usage: <%= get_categories(post) %>
  hexo.extend.helper.register('get_categories', function(post) {
    return post.categories || [];
  });

  // Get post tags
  // Usage: <%= get_tags(post) %>
  hexo.extend.helper.register('get_tags', function(post) {
    return post.tags || [];
  });

  // Get configured social links
  // Usage: <%= get_social_links() %>
  hexo.extend.helper.register('get_social_links', function() {
    const config = this.theme.social || {};
    return config;
  });

  // Get asset URL with CDN prefix
  // Usage: <%= asset_url(path) %>
  hexo.extend.helper.register('asset_url', function(path) {
    const config = this.theme.cdn_prefix || '';
    return config ? config + path : this.url_for(path);
  });

  // Get page-specific title
  // Usage: <%= page_title() %>
  hexo.extend.helper.register('page_title', function() {
    const page = this.page;
    const config = this.theme;

    if (page.title) {
      return page.title + ' - ' + config.title;
    }
    return config.title;
  });

  // Check if current page is home
  // Usage: <%= is_home() %>
  hexo.extend.helper.register('is_home', function() {
    return this.page.__index === true;
  });

  // Check if current page is post
  // Usage: <%= is_post() %>
  hexo.extend.helper.register('is_post', function() {
    return this.page.layout === 'post';
  });

  // Check if current page is page
  // Usage: <%= is_page() %>
  hexo.extend.helper.register('is_page', function() {
    return this.page.layout === 'page';
  });

  // Get sidebar widgets
  // Usage: <%= get_sidebar_widgets() %>
  hexo.extend.helper.register('get_sidebar_widgets', function() {
    const config = this.theme.sidebar || {};
    return config.widgets || [];
  });

  // Render markdown content
  // Usage: <%= render_md(content) %>
  hexo.extend.helper.register('render_md', function(content) {
    return hexo.render.renderSync({text: content, engine: 'markdown'});
  });

  // Generate category path
  // Usage: <%= category_path(category) %>
  hexo.extend.helper.register('category_path', function(category) {
    return this.url_for('/categories/' + category.slug + '/');
  });

  // Generate tag path
  // Usage: <%= tag_path(tag) %>
  hexo.extend.helper.register('tag_path', function(tag) {
    return this.url_for('/tags/' + tag.slug + '/');
  });

  // Get canonical URL
  // Usage: <%= canonical_url() %>
  hexo.extend.helper.register('canonical_url', function() {
    const config = this.config;
    const url = this.page.canonical_path || this.page.path;

    return config.url + '/' + url;
  });

  // Get og image
  // Usage: <%= og_image() %>
  hexo.extend.helper.register('og_image', function() {
    const page = this.page;
    const theme = this.theme;

    // Page-specific cover
    if (page.cover) {
      return this.url_for(page.cover);
    }

    // Default cover from theme config
    if (theme.image?.default_cover) {
      return this.url_for(theme.image.default_cover);
    }

    return '';
  });

  // Group posts by year
  // Usage: <%= group_posts_by_year(posts) %>
  hexo.extend.helper.register('group_posts_by_year', function(posts) {
    const years = {};

    posts.each(post => {
      const year = post.date.year();
      if (!years[year]) {
        years[year] = [];
      }
      years[year].push(post);
    });

    return years;
  });

  // Group posts by month
  // Usage: <%= group_posts_by_month(posts) %>
  hexo.extend.helper.register('group_posts_by_month', function(posts) {
    const groups = {};

    posts.each(post => {
      const year = post.date.year();
      const month = post.date.month() + 1;
      const key = year + '-' + (month < 10 ? '0' + month : month);

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(post);
    });

    return groups;
  });
};
