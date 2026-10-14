/**
 * Pretty URL 路由改写（纯函数）
 *
 * 背景：Hexo 默认 permalink（`:year/:month/:day/:title/`）产出的本就是目录型 URL，
 * 本模块只服务「permalink 以 .html 结尾」的站点——开启主题 `url.pretty` 后，
 * 把 `foo.html` 的路由改写为 `foo/index.html`，同时改写文档 path，
 * 让模板里的 url_for / permalink / 上下篇导航自动跟随。
 *
 * 默认关闭（`url.pretty: false`），开启方式见 _config.yml 注释。
 */

'use strict';

/**
 * 把 .html 路由改写为目录型路由
 * - 'index.html'        → 'index.html'（站点根，不能动）
 * - 'foo/index.html'    → 'foo/index.html'（已是目录型，幂等）
 * - 'foo.html'          → 'foo/index.html'
 * - '2024/01/a/b.html'  → '2024/01/a/b/index.html'
 * - 非 .html 路径       → 原样返回
 *
 * @param {string} rawPath
 * @returns {string}
 */
function prettyRoutePath(rawPath) {
  if (!rawPath || typeof rawPath !== 'string') {
    return rawPath;
  }

  const p = rawPath.trim();
  if (!p || p === 'index.html') {
    return rawPath;
  }

  // 已是目录型（…/index.html）：不动，保证幂等
  if (/\/index\.html?$/i.test(p)) {
    return rawPath;
  }

  if (/\.html?$/i.test(p)) {
    return p.replace(/\.html?$/i, '') + '/index.html';
  }

  return rawPath;
}

module.exports = { prettyRoutePath };
