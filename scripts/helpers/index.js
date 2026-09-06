/**
 * Hexo Helpers
 * Template helper functions
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册 helper，不能使用 module.exports 导出函数。
 *
 * 本文件是 **注册层**：所有可测试的纯逻辑位于 `scripts/lib/text.js`。
 */

'use strict';

const { toExcerpt, readingTime } = require('../lib/text');

// Get excerpt helper
hexo.extend.helper.register('get_excerpt', function (post, length) {
  return toExcerpt(post.excerpt || post.content || '', length);
});

// Get reading time helper
hexo.extend.helper.register('get_reading_time', function (content) {
  return readingTime(content);
});

// Check if post is featured
hexo.extend.helper.register('is_featured', function (post) {
  return post.featured === true;
});

// Get post categories
hexo.extend.helper.register('get_categories', function (post) {
  return post.categories || [];
});

// Get post tags
hexo.extend.helper.register('get_tags', function (post) {
  return post.tags || [];
});
