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

// 单篇文章进入搜索索引的正文长度上限（字符数，缺省值）
// 旧实现直接把 post.content（含 HTML 标签、代码块、图片）整篇塞进 search.json，
// 索引体积随整站正文字数线性膨胀，且被 search.ejs 内嵌进页面 HTML，首访即下载全站正文。
const DEFAULT_INDEX_LENGTH = 1500;

// Archive generator
hexo.extend.generator.register('archive', function (locals) {
  return {
    path: 'archives/index.html',
    layout: 'archive',
    data: {
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

  return {
    path: 'search.json',
    data: JSON.stringify(searchData)
  };
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
