/**
 * filters 注册层单元测试
 *
 * 通过 mock 全局 hexo 加载 `scripts/filters/index.js`，断言各 filter 的注册与行为。
 *
 * 评审整改：图片懒加载从 `after_post_render`（污染 post.content）迁移到
 * `after_render:html`（只作用于最终 HTML 字符串），因此：
 * - post.content 保持原始 `src`，search.json / RSS 等下游消费者图片正常；
 * - 渲染层输出保留 `src` + `data-src` + `loading="lazy"`。
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
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
require(path.join(__dirname, '../../scripts/filters/index.js'));

function runFilters(name, input) {
  const fns = registered[name] || [];
  return fns.reduce((acc, fn) => fn(acc) || acc, input);
}

function afterRenderHtml(str) {
  return runFilters('after_render:html', str);
}

test('filters: 注册 3 类 filter，且不再注册 after_post_render', () => {
  assert.deepEqual(Object.keys(registered).sort(), [
    'after_render:html',
    'before_post_render',
    'excerpt'
  ]);
  assert.equal(registered['after_post_render'], undefined);
});

test('before_post_render: 原样返回数据', () => {
  const data = { title: 'x' };
  assert.equal(runFilters('before_post_render', data), data);
});

// ---- after_render:html（渲染层懒加载注入）----

test('after_render:html: 图片保留 src 并补 data-src 与 loading="lazy"', () => {
  themeConfig = { image: { lazy_load: true } };
  const out = afterRenderHtml('<p><img src="/a.jpg" alt="a"></p>');
  assert.ok(out.includes('src="/a.jpg"'), '应保留 src（Critical）');
  assert.ok(out.includes('data-src="/a.jpg"'), '应包含 data-src');
  assert.ok(out.includes('loading="lazy"'), '应包含 loading="lazy"');
});

test('after_render:html: 已处理过的图片不重复处理', () => {
  themeConfig = { image: { lazy_load: true } };
  const html = '<p><img data-src="/a.jpg" loading="lazy" alt="a"></p>';
  assert.equal(afterRenderHtml(html), html);
});

test('after_render:html: lazy_load=false 时不处理', () => {
  themeConfig = { image: { lazy_load: false } };
  const html = '<p><img src="/a.jpg" alt="a"></p>';
  assert.equal(afterRenderHtml(html), html);
});

test('after_render:html: 无图片内容不报错', () => {
  themeConfig = {};
  const html = '<p>no image</p>';
  assert.equal(afterRenderHtml(html), html);
});

test('after_render:html: 非字符串输入原样返回', () => {
  themeConfig = {};
  assert.equal(afterRenderHtml(null), null);
});

// ---- excerpt ----

test('excerpt: 已有 excerpt 时不覆盖', () => {
  const data = { content: 'body', excerpt: 'custom' };
  runFilters('excerpt', data);
  assert.equal(data.excerpt, 'custom');
});

test('excerpt: 生成摘要', () => {
  const data = { content: '<p>' + 'x'.repeat(300) + '</p>' };
  registered.excerpt.forEach(fn => fn(data));
  assert.ok(data.excerpt.endsWith('...'));
  assert.equal(data.excerpt.length, 203);
});
