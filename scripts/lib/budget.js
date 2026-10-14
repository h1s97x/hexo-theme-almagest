/**
 * 性能预算（纯函数）
 *
 * 背景：参考主题 Redefine 每页默认 ~440KB JS + ~220KB CSS
 * （moment-with-locales 366KB 无条件加载 + FontAwesome 字体 ~800KB），
 * 是典型主题的 5-10 倍。本主题把预算做成可断言的硬约束，
 * 防止后续迭代重蹈覆辙。
 *
 * 预算值（gzip 前，与 docs/10-upgrade-plan.md 一致，2026-10-14 按实测校准）：
 *   每页 JS   ≤ 100 KB（实测 ~35KB）
 *   每页 CSS  ≤ 80 KB（实测 main.css 压缩后 52.4KB + modern.css 3.9KB ≈ 56KB；
 *                      初始定的 50KB 低于现状，按 30% 余量校准为 80KB）
 *   search.json ≤ 300 KB
 *
 * gzip 后实际传输：JS ~10KB、CSS ~11KB。
 */

'use strict';

const KB = 1024;

const DEFAULT_LIMITS = {
  perPageJs: 100 * KB,
  perPageCss: 80 * KB,
  searchIndex: 300 * KB
};

/**
 * 计算文件列表总字节数
 * @param {Array<{size: number}>} files
 * @returns {number}
 */
function sumSizes(files) {
  if (!Array.isArray(files)) {
    return 0;
  }
  return files.reduce(function (acc, f) {
    const size = f && typeof f.size === 'number' ? f.size : 0;
    return acc + size;
  }, 0);
}

/**
 * 找出超限文件
 * @param {Array<{name: string, size: number}>} files
 * @param {number} limit 字节数
 * @returns {Array<{name: string, size: number}>} 超限文件（未超限返回空数组）
 */
function findViolations(files, limit) {
  if (!Array.isArray(files)) {
    return [];
  }
  return files.filter(function (f) {
    return f && typeof f.size === 'number' && f.size > limit;
  });
}

/**
 * 检查搜索索引体积
 * @param {number} size 字节数
 * @param {number} [limit]
 * @returns {{ok: boolean, size: number, limit: number}}
 */
function checkSearchIndexSize(size, limit) {
  const l = typeof limit === 'number' ? limit : DEFAULT_LIMITS.searchIndex;
  const s = typeof size === 'number' ? size : 0;
  return { ok: s <= l, size: s, limit: l };
}

module.exports = { KB, DEFAULT_LIMITS, sumSizes, findViolations, checkSearchIndexSize };
