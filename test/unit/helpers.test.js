/**
 * helpers 单元测试
 * 通过 mock 全局 hexo 对象，加载 scripts/helpers.js 后断言各 helper 行为。
 */

'use strict';

const { test, run, assert } = require('./framework');
const path = require('path');

// ---- 构造 mock hexo ----
const registered = {};
global.hexo = {
  extend: {
    helper: {
      register(name, fn) {
        registered[name] = fn;
      }
    }
  },
  theme: { config: {} }
};

// 加载被测模块（直接执行注册代码）
require(path.join(__dirname, '../../scripts/helpers.js'));

test('helpers: 注册了 5 个 helper', () => {
  const names = Object.keys(registered).sort();
  assert.deepStrictEqual(names, [
    'get_categories',
    'get_excerpt',
    'get_reading_time',
    'get_tags',
    'is_featured'
  ]);
});

test('get_reading_time: 空内容返回 0', () => {
  assert.strictEqual(registered.get_reading_time(''), 0);
  assert.strictEqual(registered.get_reading_time(null), 0);
});

test('get_reading_time: 按 200 词/分钟估算', () => {
  const words = Array(400).fill('word').join(' ');
  assert.strictEqual(registered.get_reading_time(words), 2);
});

test('get_reading_time: 忽略 HTML 标签', () => {
  const content = '<p>Hello world</p><div>This is content</div>';
  // 4 个词 -> 1 分钟
  assert.strictEqual(registered.get_reading_time(content), 1);
});

test('get_excerpt: 去除 HTML 并截断', () => {
  const post = { content: '<p>' + 'a'.repeat(300) + '</p>' };
  const excerpt = registered.get_excerpt(post, 100);
  assert.ok(excerpt.endsWith('...'));
  assert.strictEqual(excerpt.length, 103);
});

test('get_excerpt: 支持自定义长度', () => {
  const post = { content: 'short content' };
  assert.strictEqual(registered.get_excerpt(post, 200), 'short content');
});

test('get_excerpt: 优先使用 post.excerpt', () => {
  const post = { content: 'long body...', excerpt: 'custom excerpt' };
  assert.strictEqual(registered.get_excerpt(post, 200), 'custom excerpt');
});

test('is_featured: 检查 featured 标记', () => {
  assert.strictEqual(registered.is_featured({ featured: true }), true);
  assert.strictEqual(registered.is_featured({}), false);
});

test('get_categories / get_tags: 返回数组', () => {
  assert.deepStrictEqual(registered.get_categories({ categories: ['a'] }), ['a']);
  assert.deepStrictEqual(registered.get_categories({}), []);
  assert.deepStrictEqual(registered.get_tags({ tags: ['t'] }), ['t']);
  assert.deepStrictEqual(registered.get_tags({}), []);
});

run();
