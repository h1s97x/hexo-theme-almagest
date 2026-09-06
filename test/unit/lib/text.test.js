/**
 * lib/text 单元测试（纯函数，无需 mock hexo）
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  stripHtml,
  escapeHtml,
  toExcerpt,
  toPlainText,
  toIndexText,
  readingTime,
  DEFAULT_EXCERPT_LENGTH
} = require('../../../scripts/lib/text');

test('stripHtml: 剥离标签', () => {
  assert.equal(stripHtml('<p>Hello <strong>world</strong></p>'), 'Hello world');
});

test('stripHtml: null / undefined 安全', () => {
  assert.equal(stripHtml(null), '');
  assert.equal(stripHtml(undefined), '');
});

test('escapeHtml: 转义三种特殊字符', () => {
  assert.equal(escapeHtml('<a href="x">&</a>'), '&lt;a href="x"&gt;&amp;&lt;/a&gt;');
});

test('toExcerpt: 超长时截断并追加省略号', () => {
  const out = toExcerpt('<p>' + 'a'.repeat(300) + '</p>', 100);
  assert.equal(out.length, 103);
  assert.ok(out.endsWith('...'));
});

test('toExcerpt: 未超长时不追加省略号', () => {
  assert.equal(toExcerpt('<p>short content</p>', 200), 'short content');
});

test('toExcerpt: alwaysSuffix=true 时即使未超长也追加省略号', () => {
  assert.equal(toExcerpt('short', 200, { alwaysSuffix: true }), 'short...');
});

test('toExcerpt: 缺省长度回落到 200', () => {
  assert.equal(DEFAULT_EXCERPT_LENGTH, 200);
  assert.equal(toExcerpt('x'.repeat(250)), 'x'.repeat(200) + '...');
});

test('toPlainText: 丢弃 script / style，保留 pre 文本', () => {
  const html =
    '<style>.a{color:red}</style><script>var t = 1;</script><pre><code>keepme</code></pre>';
  assert.equal(toPlainText(html), 'keepme');
});

test('toPlainText: 剥离标签、还原实体、压缩空白', () => {
  const html = '<p>Hello   <strong>world</strong></p>\n\n<p>second &amp; third &lt;</p>';
  assert.equal(toPlainText(html), 'Hello world second & third <');
});

test('toPlainText: &amp; 最后还原，避免二次解码', () => {
  assert.equal(toPlainText('&amp;lt;'), '&lt;');
});

test('toIndexText: 按 maxLength 截断', () => {
  assert.equal(toIndexText('abcdefghijklmnopqrstuvwxyz', 10), 'abcdefghij');
});

test('toIndexText: maxLength <= 0 表示不截断', () => {
  assert.equal(toIndexText('abcdefg', 0), 'abcdefg');
  assert.equal(toIndexText('abcdefg', -1), 'abcdefg');
});

test('readingTime: 空内容返回 0', () => {
  assert.equal(readingTime(''), 0);
  assert.equal(readingTime(null), 0);
});

test('readingTime: 按 200 词/分钟估算', () => {
  assert.equal(readingTime(Array(400).fill('word').join(' ')), 2);
});

test('readingTime: 忽略 HTML 标签且至少 1 分钟', () => {
  assert.equal(readingTime('<p>Hello world</p><div>This is content</div>'), 1);
});

test('readingTime: 支持自定义阅读速度', () => {
  assert.equal(readingTime(Array(400).fill('word').join(' '), 400), 1);
});
