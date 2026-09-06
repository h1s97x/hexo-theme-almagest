/**
 * Hexo Filters
 * Content filters and transformations
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册过滤器，不能使用 module.exports 导出函数。
 *
 * 本文件是 **注册层**：只负责把 `scripts/lib/` 中的纯函数桥接成 Hexo filter，
 * 业务逻辑一律下沉到 lib，便于单元测试直接覆盖。
 */

'use strict';

const { lazyLoadHtml } = require('../lib/html');
const { toExcerpt, DEFAULT_EXCERPT_LENGTH } = require('../lib/text');

// Before post render
hexo.extend.filter.register('before_post_render', function (data) {
  return data;
});

// ---------------------------------------------------------------------------
// 图片懒加载（渲染层注入）
//
// 在 `after_render:html` 阶段处理最终 HTML 字符串，而不是 `after_post_render`：
// 这样不会污染 `post.content`，search.json / RSS 等下游消费者拿到的仍是原始
// `src`，图片可以正常显示。
// ---------------------------------------------------------------------------
hexo.extend.filter.register('after_render:html', function (str) {
  const themeConfig = hexo.theme.config || {};
  if (themeConfig.image && themeConfig.image.lazy_load === false) {
    return str;
  }

  if (typeof str !== 'string' || str.indexOf('<img') === -1) {
    return str;
  }

  return lazyLoadHtml(str);
});

// Excerpt filter
hexo.extend.filter.register('excerpt', function (data) {
  if (data.excerpt) {
    return;
  }

  // 历史行为：无论是否超长都追加省略号，故 alwaysSuffix=true
  data.excerpt = toExcerpt(data.content, DEFAULT_EXCERPT_LENGTH, {
    alwaysSuffix: true
  });

  return data;
});
