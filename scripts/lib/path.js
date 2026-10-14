/**
 * 路径归一化与导航 active 态判断（纯函数，无 hexo 依赖）
 *
 * 背景：导航 partial 里曾用 `config.url + item.path`（config 被遮蔽为主题配置，
 * 取不到站点 url）判断当前项，导致比较恒为 false、active 态永不生效，
 * 且 `config.root + 'notebooks/new'` 拼出 "undefined..." 链接。
 *
 * 现在统一走本模块：两侧路径都归一化成「小写、无协议主机、无首尾斜杠、
 * 无 .html / index.html 后缀」的可比形式。
 */

'use strict';

/**
 * 归一化一个路径或 URL，用于导航当前项比较
 * @param {string} raw 站点内路径（/wiki/foo/）或完整 URL（https://x.com/wiki/foo/）
 * @returns {string} 归一化结果，如 'wiki/foo'
 */
function normalizePath(raw) {
  if (!raw || typeof raw !== 'string') {
    return '';
  }

  let s = raw.trim();
  if (!s) {
    return '';
  }

  // 容忍用户把完整 URL 当导航路径：去掉协议与主机
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\/[^/]+/i, '');

  // 去掉查询串 / hash，避免带参数链接永远匹配不上
  s = s.replace(/[?#].*$/, '');

  s = s.toLowerCase();

  // 首尾斜杠
  s = s.replace(/^\/+/, '').replace(/\/+$/, '');

  // 后缀：foo.html / foo/index.html / foo/index → foo
  s = s.replace(/\.html?$/, '');
  s = s.replace(/(^|\/)index$/, '$1');
  s = s.replace(/\/+$/, '');

  return s;
}

/**
 * 判断导航项是否应对应「当前页」（输出 active 类名）
 * @param {string} currentPath 当前页路径（Hexo page.path，如 'wiki/foo/index.html'）
 * @param {string} targetPath 导航项目标路径（主题配置里的 path）
 * @returns {boolean}
 */
function isNavActive(currentPath, targetPath) {
  const current = normalizePath(currentPath);
  const target = normalizePath(targetPath);

  if (!current || !target) {
    return false;
  }

  return current === target;
}

module.exports = { normalizePath, isNavActive };
