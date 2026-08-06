/**
 * Hexo Filters
 * Content filters and transformations
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册过滤器，不能使用 module.exports 导出函数。
 */

'use strict';

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
