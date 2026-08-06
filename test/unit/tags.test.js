/**
 * tags 单元测试
 * 通过 mock 全局 hexo 对象，加载 scripts/tags.js 后断言各 tag 渲染输出。
 */

'use strict';

const { test, run, assert } = require('./framework');
const path = require('path');

// ---- 构造 mock hexo ----
const registered = {};

global.hexo = {
  extend: {
    tag: {
      register(name, fn, options) {
        registered[name] = { fn, options };
      }
    }
  },
  render: {
    renderSync({ text }) {
      // 简单 markdown 模拟：仅处理空行与段落
      return '<p>' + text + '</p>';
    }
  }
};

// 加载被测模块
require(path.join(__dirname, '../../scripts/tags.js'));

test('tags: 注册了 3 个 tag', () => {
  const names = Object.keys(registered).sort();
  assert.deepStrictEqual(names, ['alert', 'button', 'note']);
});

test('note: 默认 info 类型且带 ends 选项', () => {
  const out = registered.note.fn([], 'some note content');
  assert.strictEqual(out, '<div class="note note-info"><p>some note content</p></div>');
  assert.strictEqual(registered.note.options.ends, true);
});

test('note: 支持自定义类型', () => {
  const out = registered.note.fn(['warning'], 'careful');
  assert.strictEqual(out, '<div class="note note-warning"><p>careful</p></div>');
});

test('alert: 支持类型', () => {
  const out = registered.alert.fn(['danger'], 'boom');
  assert.strictEqual(out, '<div class="alert alert-danger"><p>boom</p></div>');
});

test('button: 默认值', () => {
  const out = registered.button.fn([]);
  assert.strictEqual(out, '<a href="#" class="btn btn-primary">Click me</a>');
});

test('button: 自定义文本/链接/类型', () => {
  const out = registered.button.fn(['Go', 'https://example.com', 'success']);
  assert.strictEqual(
    out,
    '<a href="https://example.com" class="btn btn-success">Go</a>'
  );
});

run();
