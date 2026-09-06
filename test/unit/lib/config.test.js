/**
 * lib/config 单元测试（纯函数，无需 mock hexo）
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { validate, getPath, hasSiteOverride } = require('../../../scripts/lib/config');

test('validate: 配置合法时无问题', () => {
  const config = {
    title: 'x',
    style: { prefers_theme: 'auto', primary_color: '#0066cc' },
    sidebar: { position: 'right', width: 300 },
    pagination: { type: 'pagination', per_page: 10 },
    article: { excerpt_length: 200 },
    search: { index_length: 1500 }
  };
  assert.deepEqual(validate(config), []);
});

test('validate: 识别拼错的顶层键', () => {
  const problems = validate({ prefer_theme: 'dark' });
  assert.equal(problems.length, 1);
  assert.ok(problems[0].includes('prefer_theme'));
});

test('validate: 识别非法枚举值', () => {
  const problems = validate({ style: { prefers_theme: 'midnight' } });
  assert.equal(problems.length, 1);
  assert.ok(problems[0].includes('midnight'));
  assert.ok(problems[0].includes('auto / light / dark'));
});

test('validate: 识别非正数', () => {
  const problems = validate({ search: { index_length: -1 } });
  assert.equal(problems.length, 1);
  assert.ok(problems[0].includes('search.index_length'));
});

test('validate: 缺失的嵌套配置不报错', () => {
  assert.deepEqual(validate({}), []);
  assert.deepEqual(validate({ style: {} }), []);
  assert.deepEqual(validate(undefined), []);
});

test('getPath: 按 a.b.c 读取，缺失时返回 undefined', () => {
  const obj = { a: { b: { c: 1 } } };
  assert.equal(getPath(obj, 'a.b.c'), 1);
  assert.equal(getPath(obj, 'a.x.c'), undefined);
  assert.equal(getPath(obj, 'a.b.c.d'), undefined);
});

test('hasSiteOverride: 站点显式覆盖时返回 true', () => {
  assert.equal(hasSiteOverride({ theme_config: { version: '9.9.9' } }, 'version'), true);
  assert.equal(hasSiteOverride({ theme_config: { version: '9.9.9' } }, 'title'), false);
  assert.equal(hasSiteOverride({ theme_config: undefined }, 'version'), false);
});
