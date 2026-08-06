/**
 * Hexo Theme Almagest - 轻量单元测试框架
 *
 * 零依赖实现，兼容 Node >= 14。
 * 用法：
 *   1. `require('./framework')` 得到 { test, run, assert }
 *   2. 用 test(name, fn) 注册用例
 *   3. 文件末尾调用 run()（同步执行，避免多个测试文件共享
 *      global.hexo 时互相覆盖导致的状态错乱）
 */

'use strict';

const assert = require('assert');

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function run() {
  let passed = 0;
  let failed = 0;

  for (const t of tests) {
    try {
      t.fn();
      console.log('  \u2713 ' + t.name);
      passed += 1;
    } catch (err) {
      console.error('  \u2717 ' + t.name);
      console.error('    ' + (err && err.message ? err.message : err));
      failed += 1;
    }
  }

  console.log('');
  console.log(`  ${passed} passed, ${failed} failed`);
  console.log('');

  if (failed > 0) {
    process.exitCode = 1;
  }

  // 跑完即清空，避免多个测试文件共享 tests 数组互相污染
  tests.length = 0;
}

module.exports = { test, run, assert };
