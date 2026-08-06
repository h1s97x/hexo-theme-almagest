/**
 * Hexo Tags
 * Custom tag plugins
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册 tag，不能使用 module.exports 导出函数。
 */

'use strict';

// Note tag
hexo.extend.tag.register('note', function(args, content) {
  const type = args[0] || 'info';
  return `<div class="note note-${type}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
}, { ends: true });

// Alert tag
hexo.extend.tag.register('alert', function(args, content) {
  const type = args[0] || 'info';
  return `<div class="alert alert-${type}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
}, { ends: true });

// Button tag
hexo.extend.tag.register('button', function(args) {
  const text = args[0] || 'Click me';
  const url = args[1] || '#';
  const type = args[2] || 'primary';
  return `<a href="${url}" class="btn btn-${type}">${text}</a>`;
});
