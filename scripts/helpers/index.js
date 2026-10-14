/**
 * Hexo Helpers
 * Template helper functions
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册 helper，不能使用 module.exports 导出函数。
 *
 * 本文件是 **注册层**：所有可测试的纯逻辑位于 `scripts/lib/text.js`。
 */

'use strict';

const { toExcerpt, readingTime } = require('../lib/text');
const { isNavActive } = require('../lib/path');
const { normalizePagePath, robotsFor, buildJsonLd, stringifyJsonLd } = require('../lib/seo');
const { buildFrontendConfig, stringifyConfig } = require('../lib/config-export');

// 主题版本号：以 package.json 为唯一事实来源。
// 模板里的 `config.version || theme_version()` 兜底曾硬编码 '1.0.0'，
// 与真实版本（1.1.0）不一致，会导致资源 `?v=` 缓存刷新失效。
const THEME_VERSION = require('../../package.json').version;

// Get excerpt helper
hexo.extend.helper.register('get_excerpt', function (post, length) {
  return toExcerpt(post.excerpt || post.content || '', length);
});

// Get reading time helper
hexo.extend.helper.register('get_reading_time', function (content) {
  return readingTime(content);
});

// Check if post is featured
hexo.extend.helper.register('is_featured', function (post) {
  return post.featured === true;
});

// Get post categories
hexo.extend.helper.register('get_categories', function (post) {
  return post.categories || [];
});

// Get post tags
hexo.extend.helper.register('get_tags', function (post) {
  return post.tags || [];
});

// 导航当前项判断（wiki / topic / notebooks 侧栏高亮）
// 两侧路径统一归一化后比较，容忍完整 URL、尾斜杠、.html / index.html 后缀差异
hexo.extend.helper.register('is_nav_active', function (currentPath, targetPath) {
  return isNavActive(currentPath, targetPath);
});

// 主题版本号（资源缓存刷新用）
hexo.extend.helper.register('theme_version', function () {
  return THEME_VERSION;
});

// ────────────────────────────────────────────────────────────
// SEO：canonical / robots / JSON-LD
// ────────────────────────────────────────────────────────────

/**
 * 输出当前页的绝对 canonical URL。
 *
 * 站点未配置 url 时返回 ''（模板据此省略该标签，避免输出 undefined 链接）。
 * 用 url_for 而非 full_url_for：后者不应用 root，且 config.url 为空时会抛错。
 */
hexo.extend.helper.register('alm_canonical', function (page) {
  const siteConfig = hexo.config || {};
  const siteUrl = siteConfig.url ? String(siteConfig.url).replace(/\/+$/, '') : '';
  if (!siteUrl) {
    return '';
  }

  const rawPath = (page && page.path) || this.path || '/';
  const target = normalizePagePath(rawPath);

  try {
    const urlFor = hexo.extend.helper.get('url_for');
    // relative: false —— 站点开启 relative_link 时也要保证 canonical 是绝对地址
    const rel = urlFor.call(this, target, { relative: false });
    return siteUrl + rel;
  } catch (e) {
    // 兜底：url_for 异常时放弃 canonical，绝不让 SEO 标签搞崩构建
    return '';
  }
});

/**
 * 输出 robots meta 值（archive / category / tag 默认 noindex,follow）
 * @param {string} pageType
 * @param {{noindexArchives?: boolean}} [options]
 */
hexo.extend.helper.register('alm_robots', function (pageType, options) {
  const seoConfig = (hexo.theme && hexo.theme.config && hexo.theme.config.seo) || {};
  const opts = options || {};
  const noindexArchives =
    opts.noindexArchives !== undefined
      ? opts.noindexArchives
      : seoConfig.noindex_archives !== false;
  return robotsFor(pageType, { noindexArchives: noindexArchives });
});

/**
 * 输出 JSON-LD 结构化数据（已做 < > & 转义，可直接进 <script>）
 * @param {object} data buildJsonLd 的入参
 * @returns {string} 无数据时返回 ''
 */
hexo.extend.helper.register('alm_json_ld', function (data) {
  return stringifyJsonLd(buildJsonLd(data));
});

/**
 * 输出前端统一配置（window.__almagestConfig 的 JSON 内容，已转义）。
 *
 * 调用方是模板，`this` 即模板 locals，因此 `this.__` 是当前语言的 i18n 函数、
 * `this.url_for` 可用。单测或异常上下文下降级到缺省值。
 */
hexo.extend.helper.register('alm_export_config', function () {
  let searchUrl = '';
  try {
    if (this && typeof this.url_for === 'function') {
      searchUrl = this.url_for('/search.json');
    }
  } catch (e) {
    searchUrl = '';
  }

  const config = buildFrontendConfig({
    version: THEME_VERSION,
    t: this && this.__,
    searchUrl: searchUrl
  });
  return stringifyConfig(config);
});
