/**
 * 单元测试入口
 * 加载 test/unit 下所有 *.test.js（每个文件自带 run() 并同步执行）。
 *
 * 注意：每个测试文件会设置自己的 global.hexo mock 并立即执行用例，
 * 因此不同测试文件之间互不影响（进程内先后执行，各自清理）。
 */

'use strict';

const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs
  .readdirSync(dir)
  .filter(f => f.endsWith('.test.js'))
  .sort();

console.log('Running unit tests...\n');

for (const file of files) {
  console.log('[' + file + ']');
  // eslint-disable-next-line global-require
  require(path.join(dir, file));
  console.log('');
}
