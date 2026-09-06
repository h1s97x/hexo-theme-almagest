/**
 * Hexo Events
 * Handles Hexo lifecycle events
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册事件，不能使用 module.exports 导出函数。
 */

'use strict';

// Before generate
hexo.on('generateBefore', function () {
  console.log('Almagest: Generating...');
});

// After generate
hexo.on('generateAfter', function () {
  console.log('Almagest: Generation complete');
});

// Ready
hexo.on('ready', function () {
  console.log('Almagest: Theme ready');
});
