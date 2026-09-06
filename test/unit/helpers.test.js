/**
 * helpers 注册层单元测试
 * 通过 mock 全局 hexo 加载 `scripts/helpers/index.js` 后断言各 helper 行为。
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
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
require(path.join(__dirname, '../../scripts/helpers/index.js'));

test('helpers: 注册了 5 个 helper', () => {
  assert.deepEqual(Object.keys(registered).sort(), [
    'get_categories',
    'get_excerpt',
    'get_reading_time',
    'get_tags',
    'is_featured'
  ]);
});

test('get_reading_time: 空内容返回 0', () => {
  assert.equal(registered.get_reading_time(''), 0);
  assert.equal(registered.get_reading_time(null), 0);
});

test('get_reading_time: 按 200 词/分钟估算', () => {
  assert.equal(registered.get_reading_time(Array(400).fill('word').join(' ')), 2);
});

test('get_reading_time: 忽略 HTML 标签', () => {
  assert.equal(registered.get_reading_time('<p>Hello world</p><div>This is content</div>'), 1);
});

test('get_excerpt: 去除 HTML 并截断', () => {
  const post = { content: '<p>' + 'a'.repeat(300) + '</p>' };
  const excerpt = registered.get_excerpt(post, 100);
  assert.ok(excerpt.endsWith('...'));
  assert.equal(excerpt.length, 103);
});

test('get_excerpt: 支持自定义长度', () => {
  assert.equal(registered.get_excerpt({ content: 'short content' }, 200), 'short content');
});

test('get_excerpt: 优先使用 post.excerpt', () => {
  const post = { content: 'long body...', excerpt: 'custom excerpt' };
  assert.equal(registered.get_excerpt(post, 200), 'custom excerpt');
});

test('get_excerpt: 缺省长度回落到 200', () => {
  const post = { content: 'y'.repeat(250) };
  assert.equal(registered.get_excerpt(post).length, 203);
});

test('is_featured: 检查 featured 标记', () => {
  assert.equal(registered.is_featured({ featured: true }), true);
  assert.equal(registered.is_featured({}), false);
});

test('get_categories / get_tags: 返回数组', () => {
  assert.deepEqual(registered.get_categories({ categories: ['a'] }), ['a']);
  assert.deepEqual(registered.get_categories({}), []);
  assert.deepEqual(registered.get_tags({ tags: ['t'] }), ['t']);
  assert.deepEqual(registered.get_tags({}), []);
});
