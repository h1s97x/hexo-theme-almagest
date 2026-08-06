/**
 * filters 单元测试
 * 通过 mock 全局 hexo 对象，加载 scripts/filters.js 后断言各 filter 行为。
 *
 * 评审整改：图片懒加载从 `after_post_render`（污染 post.content）迁移到
 * `after_render:html`（只作用于最终 HTML 字符串），因此：
 * - post.content 保持原始 `src`，search.json / RSS 等下游消费者图片正常；
 * - 渲染层输出保留 `src` + `data-src` + `loading="lazy"`，最终 HTML 始终含 `src`
 *   （评审 Critical 断言：图片一定可加载，不依赖 JS）。
 */

'use strict';

const { test, run, assert } = require('./framework');
const path = require('path');

// ---- 构造 mock hexo ----
const registered = {};
let themeConfig = {};

global.hexo = {
  extend: {
    filter: {
      register(name, fn) {
        if (!registered[name]) {
          registered[name] = [];
        }
        registered[name].push(fn);
      }
    }
  },
  get theme() {
    return { config: themeConfig };
  }
};

// 加载被测模块
require(path.join(__dirname, '../../scripts/filters.js'));

function runFilters(name, input) {
  const fns = registered[name] || [];
  let result = input;
  fns.forEach(fn => {
    result = fn(result) || result;
  });
  return result;
}

function afterRenderHtml(str) {
  return runFilters('after_render:html', str);
}

test('filters: 注册了 3 类 filter（懒加载走 after_render:html，不再污染 post.content）', () => {
  assert.deepStrictEqual(Object.keys(registered).sort(), [
    'after_render:html',
    'before_post_render',
    'excerpt'
  ]);
  assert.strictEqual(
    registered['after_post_render'],
    undefined,
    '不应再注册 after_post_render（避免污染 post.content）'
  );
});

// ---- after_render:html（渲染层懒加载注入）----

test('after_render:html: 图片保留 src 并补 data-src 与 loading="lazy"', () => {
  themeConfig = { image: { lazy_load: true } };
  const out = afterRenderHtml('<p><img src="/a.jpg" alt="a"></p>');
  // Critical 断言：最终渲染 HTML 必须包含 src（图片不依赖 JS 也能加载）
  assert.ok(out.includes('src="/a.jpg"'), '应保留 src（Critical）');
  assert.ok(out.includes('data-src="/a.jpg"'), '应包含 data-src');
  assert.ok(out.includes('loading="lazy"'), '应包含 loading="lazy"');
});

test('after_render:html: 单引号/裸属性 loading 不被重复注入', () => {
  themeConfig = { image: { lazy_load: true } };
  const single = afterRenderHtml(`<p><img src="/a.jpg" loading='lazy' alt="a"></p>`);
  assert.ok((single.match(/loading/g) || []).length === 1, '单引号 loading 不应重复注入');

  const bare = afterRenderHtml(`<p><img src="/a.jpg" loading alt="a"></p>`);
  assert.ok((bare.match(/loading/g) || []).length === 1, '裸 loading 不应重复注入');
});

test('after_render:html: 属性值含 >（data URI）不会被截断', () => {
  themeConfig = { image: { lazy_load: true } };
  const src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"><circle r="10"/></svg>';
  const html = '<p><img src="' + src + '" alt="a"></p>';
  const out = afterRenderHtml(html);
  assert.ok(out.includes('src="' + src + '"'), 'data URI src 应保留完整');
  assert.ok(out.includes('data-src="' + src + '"'), 'data URI 应完整复制到 data-src');
  assert.ok(out.includes('loading="lazy"'), '应包含 loading="lazy"');
});

test('after_render:html: <pre>/<script> 内嵌示例图片不被改写', () => {
  themeConfig = { image: { lazy_load: true } };
  const html =
    '<pre><code>&lt;img src="/code-sample.jpg" alt="x"&gt;</code></pre>' +
    '<script>var s = "<img src=\\"/inline.jpg\\">";</script>' +
    '<img src="/real.jpg" alt="real">';
  const out = afterRenderHtml(html);
  // 代码示例 / 脚本里的 img 文本原样保留
  assert.ok(out.includes('&lt;img src="/code-sample.jpg"'), 'pre 内示例不应改写');
  assert.ok(out.includes('var s = "<img src=\\"/inline.jpg\\">"'), 'script 内不应改写');
  // 真实 img 被改写（保留 src + 补 data-src/loading）
  assert.ok(out.includes('src="/real.jpg"'), '真实 img 应保留 src');
  assert.ok(out.includes('data-src="/real.jpg"'), '真实 img 应补 data-src');
  assert.ok(out.includes('loading="lazy"'), '真实 img 应加 loading');
});

test('after_render:html: 已处理过的图片不重复处理', () => {
  themeConfig = { image: { lazy_load: true } };
  const html = '<p><img data-src="/a.jpg" loading="lazy" alt="a"></p>';
  assert.strictEqual(afterRenderHtml(html), html);
});

test('after_render:html: lazy_load=false 时不处理', () => {
  themeConfig = { image: { lazy_load: false } };
  const html = '<p><img src="/a.jpg" alt="a"></p>';
  assert.strictEqual(afterRenderHtml(html), html);
});

test('after_render:html: 无图片内容不报错', () => {
  themeConfig = {};
  const html = '<p>no image</p>';
  assert.strictEqual(afterRenderHtml(html), html);
});

// ---- excerpt ----

test('excerpt: 生成摘要', () => {
  const data = { content: '<p>' + 'x'.repeat(300) + '</p>' };
  registered.excerpt.forEach(fn => fn(data));
  assert.ok(data.excerpt.endsWith('...'));
  assert.strictEqual(data.excerpt.length, 203);
});

run();
