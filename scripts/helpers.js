/**
 * Hexo Helpers
 * Template helper functions
 */

'use strict';

module.exports = function(hexo) {
  // Format date helper
  hexo.extend.helper.register('format_date', function(date, format) {
    return hexo.util.moment(date).format(format || 'YYYY-MM-DD');
  });

  // Get excerpt helper
  hexo.extend.helper.register('get_excerpt', function(post, length) {
    const excerpt_length = length || 200;
    let excerpt = post.excerpt || post.content;
    
    // Remove HTML tags
    excerpt = excerpt.replace(/<[^>]*>/g, '');
    
    // Truncate
    if (excerpt.length > excerpt_length) {
      excerpt = excerpt.substring(0, excerpt_length) + '...';
    }
    
    return excerpt;
  });

  // Get reading time helper
  hexo.extend.helper.register('get_reading_time', function(content) {
    // Remove HTML tags
    const text = content.replace(/<[^>]*>/g, '');
    
    // Calculate reading time (200 words per minute)
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    
    return readingTime;
  });

  // Check if post is featured
  hexo.extend.helper.register('is_featured', function(post) {
    return post.featured === true;
  });

  // Get post categories
  hexo.extend.helper.register('get_categories', function(post) {
    return post.categories || [];
  });

  // Get post tags
  hexo.extend.helper.register('get_tags', function(post) {
    return post.tags || [];
  });
};
