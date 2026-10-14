/**
 * Hexo Generators
 * Custom page generators
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册生成器，不能使用 module.exports 导出函数。
 *
 * 本文件是 **注册层**：索引正文的生成逻辑位于 `scripts/lib/text.js`。
 */

'use strict';

const { toIndexText } = require('../lib/text');
const { prettyRoutePath } = require('../lib/pretty_urls');
const { checkSearchIndexSize } = require('../lib/budget');

// 单篇文章进入搜索索引的正文长度上限（字符数，缺省值）
// 旧实现直接把 post.content（含 HTML 标签、代码块、图片）整篇塞进 search.json，
// 索引体积随整站正文字数线性膨胀，且被 search.ejs 内嵌进页面 HTML，首访即下载全站正文。
const DEFAULT_INDEX_LENGTH = 1500;

// Archive generator
// 注意 data.type：breadcrumb.ejs 靠 page.type 分支渲染，
// 不注入时面包屑会因匹配不到任何分支而整个不输出。
hexo.extend.generator.register('archive', function (locals) {
  return {
    path: 'archives/index.html',
    layout: 'archive',
    data: {
      type: 'archive',
      posts: locals.posts
    }
  };
});

// Categories generator
hexo.extend.generator.register('categories', function (locals) {
  return {
    path: 'categories/index.html',
    layout: 'categories',
    data: {
      type: 'category',
      categories: locals.categories
    }
  };
});

// Tags generator
hexo.extend.generator.register('tags', function (locals) {
  return {
    path: 'tags/index.html',
    layout: 'tags',
    data: {
      type: 'tag',
      tags: locals.tags
    }
  };
});

// Search index generator（受 theme.features.search 配置控制）
//
// 只输出搜索必需的纯文本（`text` 字段），不再输出整篇 `content`：
// 索引体积与「文章数 × index_length」而不是整站正文成正比。
hexo.extend.generator.register('search', function (locals) {
  const themeConfig = hexo.theme.config || {};
  if (themeConfig.features && themeConfig.features.search === false) {
    return [];
  }

  const searchConfig = themeConfig.search || {};
  const indexLength = parseInt(searchConfig.index_length, 10) || DEFAULT_INDEX_LENGTH;

  const searchData = [];

  locals.posts.forEach(post => {
    if (post.published !== false && post.search !== false) {
      searchData.push({
        title: post.title || '',
        url: post.path,
        text: toIndexText(post.content || post.excerpt || '', indexLength),
        date: post.date
      });
    }
  });

  const json = JSON.stringify(searchData);

  // 搜索索引体积预算：超限只告警不阻断（构建可用性优先于预算）。
  // 体积 ≈ 文章数 × index_length，文章多的站点可调小 search.index_length。
  const budget = checkSearchIndexSize(Buffer.byteLength(json, 'utf8'));
  if (!budget.ok) {
    hexo.log.warn(
      'Almagest: search.json 体积 ' +
        Math.round(budget.size / 1024) +
        'KB 超出预算 ' +
        Math.round(budget.limit / 1024) +
        'KB，建议调小 search.index_length'
    );
  }

  return {
    path: 'search.json',
    data: json
  };
});

// Page generator 覆盖（url.pretty 开启时改写 .html 路由）
//
// 逻辑与 Hexo 核心 page generator 逐行对应（layout 缺失/false 时输出原始内容、
// 有 layout 时走 ['page','post','index'] 回退链并打 __page 标记），
// 唯一差别是 pretty 开启时的路由改写：
// - 'index.html' / 'index/'  → 'index.html'（站点根；关闭 trailing 选项后 Hexo 会给 'index/'，
//   不处理会输出成 index/index.html）
// - 'foo.html'               → 'foo/index.html'（手写在 source/ 下的 .html 页面）
//
// 只改写路由返回值，不改写 page.path（文档模型的 path 是只读 getter，赋值会抛错）。
// 建议同时把站点 pretty_urls.trailing_index / trailing_html 设为 false，
// 让 url_for 产出的链接与路由一致（见 _config.yml url.pretty 注释）。
//
// ⚠️ 为什么「无条件注册 + 运行时判断」：站点 theme_config 的合并发生在
// hexo load 阶段之后（Hexo 的 mergeCtxThemeConfig），脚本加载时读不到站点侧覆盖，
// 因此不能在注册时用配置决定是否注册。pretty 关闭时行为与核心完全一致。
hexo.extend.generator.register('page', function (locals) {
  const themeConfig = hexo.theme.config || {};
  const pretty = !!(themeConfig.url && themeConfig.url.pretty === true);

  return locals.pages.map(function (page) {
    let path = page.path;

    if (pretty) {
      if (path === 'index.html' || path === 'index/') {
        path = 'index.html';
      } else {
        path = prettyRoutePath(path);
      }
    }

    const layout = page.layout;
    if (!layout || layout === 'false' || layout === 'off') {
      return { path: path, data: page.content };
    }

    const layouts = ['page', 'post', 'index'];
    if (layout !== 'page') {
      layouts.unshift(layout);
    }
    page.__page = true;
    return { path: path, layout: layouts, data: page };
  });
});

// Search page generator（生成 /search/ 页面，受 theme.features.search 配置控制）
hexo.extend.generator.register('search-page', function () {
  const themeConfig = hexo.theme.config || {};
  if (themeConfig.features && themeConfig.features.search === false) {
    return [];
  }

  return {
    path: 'search/index.html',
    layout: 'search',
    data: {}
  };
});
