/**
 * Hexo Helpers
 * Template helper functions
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册 helper，不能使用 module.exports 导出函数。
 */

'use strict';

// Format date helper
hexo.extend.helper.register('format_date', function(date, format) {
  return require('moment')(date).format(format || 'YYYY-MM-DD');
});

// Get excerpt helper
hexo.extend.helper.register('get_excerpt', function(post, length) {
  const excerpt_length = length || 200;
  let excerpt = post.excerpt || post.content || '';

  // Remove HTML tags
  excerpt = String(excerpt).replace(/<[^>]*>/g, '');

  // Truncate
  if (excerpt.length > excerpt_length) {
    excerpt = excerpt.substring(0, excerpt_length) + '...';
  }

  return excerpt;
});

// Get reading time helper
hexo.extend.helper.register('get_reading_time', function(content) {
  if (!content) return 0;

  // Remove HTML tags
  const text = String(content).replace(/<[^>]*>/g, '');

  // Calculate reading time (200 words per minute)
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.ceil(wordCount / 200);

  return Math.max(readingTime, 1);
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
