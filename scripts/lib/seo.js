/**
 * SEO 纯函数层：canonical 路径归一化、robots 判定、JSON-LD 结构化数据
 *
 * 不依赖 hexo 全局、无副作用，可被单元测试直接 require。
 * 需要读站点配置（config.url）的部分放在注册层 helpers/index.js。
 *
 * 差异化背景：调研的 22 个参考主题中，next / fluid / icarus 均只输出
 * Open Graph，无一实现 JSON-LD —— 结构化数据是本主题的差异化点。
 */

'use strict';

// 归档 / 分类 / 标签页默认 noindex（薄内容页，避免分散权重），可在 seo.noindex_archives 关闭
const NOINDEX_TYPES = ['archive', 'category', 'tag'];

/**
 * 归一化页面路径，用于 canonical 拼接
 *
 * - 空 / 'index.html' → '/'（首页）
 * - 'foo/index.html' → '/foo/'（目录型 URL，去掉 index.html 保留尾斜杠）
 * - 'foo.html' → '/foo.html'（保持原样）
 * - 补全首斜杠
 *
 * @param {string} raw page.path 或路由 path
 * @returns {string}
 */
function normalizePagePath(raw) {
  if (!raw || typeof raw !== 'string') {
    return '/';
  }

  let p = raw.trim();
  if (!p || p === '/' || p === 'index.html') {
    return '/';
  }

  // 目录型 URL：去掉尾部 index.html，保留尾斜杠
  p = p.replace(/(^|\/)index\.html$/, '$1');

  if (p.charAt(0) !== '/') {
    p = '/' + p;
  }

  return p;
}

/**
 * 按页面类型生成 robots meta 值
 * @param {string} pageType post / page / home / archive / category / tag / ...
 * @param {{noindexArchives?: boolean}} [options]
 * @returns {string} 'noindex,follow' 或 ''（不输出该 meta）
 */
function robotsFor(pageType, options) {
  const opts = options || {};
  if (opts.noindexArchives === false) {
    return '';
  }
  if (!pageType || NOINDEX_TYPES.indexOf(pageType) === -1) {
    return '';
  }
  return 'noindex,follow';
}

/**
 * 构造 JSON-LD 结构化数据对象
 *
 * - post  → BlogPosting（headline / 日期 / 作者 / 发布者 / 关键词 / 主实体）
 * - home  → WebSite
 * - page  → WebPage
 * - 其他  → null（不输出）
 *
 * @param {object} input
 * @returns {object|null}
 */
function buildJsonLd(input) {
  const data = input || {};
  const type = data.type;
  const context = 'https://schema.org';

  if (type === 'post') {
    const ld = {
      '@context': context,
      '@type': 'BlogPosting',
      headline: data.title || '',
      description: data.description || '',
      mainEntityOfPage: { '@type': 'WebPage', '@id': data.url || '' },
      keywords: data.keywords || '',
      inLanguage: data.language || 'en'
    };
    if (data.url) {
      ld.url = data.url;
    }
    if (data.image) {
      ld.image = data.image;
    }
    if (data.datePublished) {
      ld.datePublished = data.datePublished;
    }
    if (data.dateModified) {
      ld.dateModified = data.dateModified;
    }
    ld.author = { '@type': 'Person', name: data.author || '' };
    if (data.siteName) {
      ld.publisher = { '@type': 'Organization', name: data.siteName };
    }
    return ld;
  }

  if (type === 'home') {
    const ld = {
      '@context': context,
      '@type': 'WebSite',
      name: data.siteName || '',
      url: data.url || '',
      inLanguage: data.language || 'en'
    };
    if (data.description) {
      ld.description = data.description;
    }
    return ld;
  }

  if (type === 'page') {
    const ld = {
      '@context': context,
      '@type': 'WebPage',
      name: data.title || '',
      description: data.description || '',
      inLanguage: data.language || 'en'
    };
    if (data.url) {
      ld.url = data.url;
      ld['@id'] = data.url;
    }
    return ld;
  }

  return null;
}

/**
 * 序列化 JSON-LD 供内联 <script> 使用。
 * `<` `>` `&` 转义为 \u 序列，防止 `</script>` 提前闭合与 HTML 实体歧义。
 * @param {object|null} obj
 * @returns {string} 无数据时返回 ''
 */
function stringifyJsonLd(obj) {
  if (!obj) {
    return '';
  }
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

module.exports = {
  NOINDEX_TYPES,
  normalizePagePath,
  robotsFor,
  buildJsonLd,
  stringifyJsonLd
};
