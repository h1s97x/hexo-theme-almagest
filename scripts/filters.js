/**
 * Hexo Filters
 * Content filters and transformations
 */

'use strict';

module.exports = function(hexo) {
  // Before post render
  hexo.extend.filter.register('before_post_render', function(data) {
    // Add custom processing here
    return data;
  });

  // After post render
  hexo.extend.filter.register('after_post_render', function(data) {
    // Add custom processing here
    return data;
  });

  // Excerpt filter
  hexo.extend.filter.register('excerpt', function(data) {
    if (data.excerpt) return;
    
    // Generate excerpt from content
    const content = data.content.replace(/<[^>]*>/g, '');
    data.excerpt = content.substring(0, 200) + '...';
    
    return data;
  });
};
