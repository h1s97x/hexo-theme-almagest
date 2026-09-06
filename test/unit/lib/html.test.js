/**
 * lib/html 单元测试（纯函数，无需 mock hexo）
 *
 * 断言目标与评审整改一致：
 * - 最终渲染 HTML 必须保留 src（图片不依赖 JS 也能加载）
 * - post.content 不被污染（本层只做字符串处理，不接触 post 对象）
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { hasAttr, getAttrMatch, processImgTag, lazyLoadHtml } = require('../../../scripts/lib/html');

test('hasAttr: 兼容双引号 / 单引号 / 裸属性', () => {
  assert.equal(hasAttr(' src="/a.jpg" alt="a"', 'src'), true);
  assert.equal(hasAttr(" loading='lazy'", 'loading'), true);
  assert.equal(hasAttr(' loading alt="a"', 'loading'), true);
  assert.equal(hasAttr(' src="/a.jpg"', 'alt'), false);
  // 注意：'-' 是非单词字符，故 `data-src` 中的 src 也会命中；
  // processImgTag 先单独判断 data-src 并提前返回，因此不会误处理
  assert.equal(hasAttr(' data-src="/a.jpg"', 'src'), true);
});

test('getAttrMatch: 返回含等号与值的完整片段', () => {
  assert.equal(getAttrMatch(' src="/a.jpg" alt="a"', 'src'), 'src="/a.jpg"');
  assert.equal(getAttrMatch(" src='/a.jpg'", 'src'), "src='/a.jpg'");
  assert.equal(getAttrMatch(' alt="a"', 'src'), null);
});

test('processImgTag: 保留 src 并补 data-src 与 loading="lazy"', () => {
  const out = processImgTag('<img src="/a.jpg" alt="a">');
  assert.ok(out.includes('src="/a.jpg"'), '应保留 src（Critical）');
  assert.ok(out.includes('data-src="/a.jpg"'), '应包含 data-src');
  assert.ok(out.includes('loading="lazy"'), '应包含 loading="lazy"');
});

test('processImgTag: 已含 data-src 时原样返回', () => {
  const tag = '<img data-src="/a.jpg" loading="lazy" alt="a">';
  assert.equal(processImgTag(tag), tag);
});

test('processImgTag: 无 src 时原样返回', () => {
  const tag = '<img alt="a">';
  assert.equal(processImgTag(tag), tag);
});

test('lazyLoadHtml: 单引号 / 裸属性 loading 不被重复注入', () => {
  const single = lazyLoadHtml('<p><img src="/a.jpg" loading=\'lazy\' alt="a"></p>');
  assert.equal((single.match(/loading/g) || []).length, 1);

  const bare = lazyLoadHtml('<p><img src="/a.jpg" loading alt="a"></p>');
  assert.equal((bare.match(/loading/g) || []).length, 1);
});

test('lazyLoadHtml: 属性值含 >（data URI）不会被截断', () => {
  const src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
  const out = lazyLoadHtml('<p><img src="' + src + '" alt="a"></p>');
  assert.ok(out.includes('src="' + src + '"'), 'data URI src 应保留完整');
  assert.ok(out.includes('data-src="' + src + '"'), 'data URI 应完整复制到 data-src');
  assert.ok(out.includes('loading="lazy"'), '应包含 loading="lazy"');
});

test('lazyLoadHtml: <pre>/<script> 内嵌示例图片不被改写', () => {
  const html =
    '<pre><code>&lt;img src="/code-sample.jpg" alt="x"&gt;</code></pre>' +
    '<script>var s = "<img src=\\"/inline.jpg\\">";</script>' +
    '<img src="/real.jpg" alt="real">';
  const out = lazyLoadHtml(html);

  assert.ok(out.includes('&lt;img src="/code-sample.jpg"'), 'pre 内示例不应改写');
  assert.ok(out.includes('var s = "<img src=\\"/inline.jpg\\">"'), 'script 内不应改写');
  assert.ok(out.includes('src="/real.jpg"'), '真实 img 应保留 src');
  assert.ok(out.includes('data-src="/real.jpg"'), '真实 img 应补 data-src');
});

test('lazyLoadHtml: 无图片内容原样返回', () => {
  const html = '<p>no image</p>';
  assert.equal(lazyLoadHtml(html), html);
});

test('lazyLoadHtml: 未闭合的受保护区不会丢失尾部内容', () => {
  const html = '<pre><code>unterminated';
  assert.equal(lazyLoadHtml(html), html);
});
