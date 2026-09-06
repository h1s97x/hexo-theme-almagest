/**
 * config 注册层单元测试
 * 校验 `scripts/config/index.js` 的 ready 钩子与 version 自动同步行为。
 *
 * 校验规则本身的用例见 `lib/config.test.js`。
 */

'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

// ---- 构造 mock hexo ----
const readyHandlers = [];
const logs = { info: [], warn: [] };

let themeConfig = {};
let siteThemeConfig = undefined;

global.hexo = {
  on(event, fn) {
    if (event === 'ready') {
      readyHandlers.push(fn);
    }
  },
  get theme() {
    return { config: themeConfig };
  },
  get config() {
    return { theme_config: siteThemeConfig };
  },
  log: {
    info(msg) {
      logs.info.push(String(msg));
    },
    warn(msg) {
      logs.warn.push(String(msg));
    }
  }
};

const configModule = require(path.join(__dirname, '../../scripts/config/index.js'));
const pkg = require('../../package.json');

/**
 * 触发一次 ready 事件（等价于 Hexo 启动完成）
 */
function fireReady() {
  readyHandlers.forEach(function (fn) {
    fn();
  });
}

test('config: 注册了 ready 事件', () => {
  assert.equal(readyHandlers.length, 1);
});

test('config: 站点未覆盖 version 时同步为 package.json 版本', () => {
  themeConfig = { version: '0.0.1' };
  siteThemeConfig = undefined;
  assert.equal(configModule.syncVersion(global.hexo), true);
  assert.equal(themeConfig.version, pkg.version);
});

test('config: 站点显式覆盖 version 时不覆盖用户配置', () => {
  themeConfig = { version: '9.9.9' };
  siteThemeConfig = { version: '9.9.9' };
  assert.equal(configModule.syncVersion(global.hexo), false);
  assert.equal(themeConfig.version, '9.9.9');
});

test('config: version 已一致时不做改动', () => {
  themeConfig = { version: pkg.version };
  siteThemeConfig = undefined;
  assert.equal(configModule.syncVersion(global.hexo), false);
});

test('config: ready 时把配置问题输出到日志（不抛错）', () => {
  logs.warn.length = 0;
  themeConfig = { prefer_theme: 'dark' };
  siteThemeConfig = undefined;
  fireReady();

  const all = logs.warn.join('\n');
  assert.ok(all.includes('prefer_theme'), '应提示未知配置项');
  assert.ok(all.includes('配置问题'), '应输出问题汇总');
});

test('config: 配置合法时 ready 不输出告警', () => {
  logs.warn.length = 0;
  themeConfig = { title: 'ok', version: pkg.version };
  siteThemeConfig = undefined;
  fireReady();
  assert.deepEqual(logs.warn, []);
});
