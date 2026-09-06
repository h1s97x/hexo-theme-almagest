/**
 * lib/asset 单元测试（纯函数，无需 mock hexo）
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  parseAssetCodeArgs,
  sliceLines,
  countLines,
  inferLang
} = require('../../../scripts/lib/asset');

test('parseAssetCodeArgs: 位置参数依次映射 path / title', () => {
  assert.deepEqual(parseAssetCodeArgs(['data.txt', 'My Title']), {
    path: 'data.txt',
    title: 'My Title',
    lang: '',
    from: 0,
    to: -1
  });
});

test('parseAssetCodeArgs: 解析 lang / from / to 命名参数', () => {
  const out = parseAssetCodeArgs(['data.txt', 'T', 'lang:js', 'from:2', 'to:5']);
  assert.equal(out.lang, 'js');
  assert.equal(out.from, 2);
  assert.equal(out.to, 5);
});

test('parseAssetCodeArgs: 命名参数可出现在任意位置', () => {
  const out = parseAssetCodeArgs(['lang:py', 'demo.py']);
  assert.equal(out.lang, 'py');
  assert.equal(out.path, 'demo.py');
});

test('parseAssetCodeArgs: 多余位置参数归入 title', () => {
  const out = parseAssetCodeArgs(['a.js', 't1', 't2']);
  assert.equal(out.title, 't2');
});

test('parseAssetCodeArgs: 空参数与空输入安全', () => {
  assert.deepEqual(parseAssetCodeArgs([]), { path: '', title: '', lang: '', from: 0, to: -1 });
  assert.deepEqual(parseAssetCodeArgs(['', null]), {
    path: '',
    title: '',
    lang: '',
    from: 0,
    to: -1
  });
  assert.deepEqual(parseAssetCodeArgs(undefined), {
    path: '',
    title: '',
    lang: '',
    from: 0,
    to: -1
  });
});

test('sliceLines: from / to 为 1-based 闭区间', () => {
  assert.equal(sliceLines('a\nb\nc\nd', 2, 3), 'b\nc');
});

test('sliceLines: from <= 0 视为从头开始', () => {
  assert.equal(sliceLines('a\nb\nc', 0, 2), 'a\nb');
});

test('sliceLines: to < 0 视为到末尾', () => {
  assert.equal(sliceLines('a\nb\nc', 2, -1), 'b\nc');
});

test('sliceLines: 去除首尾空白', () => {
  assert.equal(sliceLines('  a  \n  b  ', 1, 2), 'a  \n  b');
});

test('countLines: 统计总行数（与截取区间无关）', () => {
  assert.equal(countLines('a\nb\nc'), 3);
  assert.equal(countLines(''), 1);
  assert.equal(countLines(null), 1);
});

test('inferLang: 取扩展名且不含点', () => {
  assert.equal(inferLang('a/b/demo.js'), 'js');
  assert.equal(inferLang('data.txt'), 'txt');
  assert.equal(inferLang('noext'), '');
});
