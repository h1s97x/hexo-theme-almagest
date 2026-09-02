/**
 * Hexo Generators
 * Custom page generators
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册生成器，不能使用 module.exports 导出函数。
 */

'use strict';

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
hexo.extend.generator.register('search', function (locals) {
  const themeConfig = hexo.theme.config || {};
  if (themeConfig.features && themeConfig.features.search === false) {
    return [];
  }

  const searchData = [];

  locals.posts.forEach(post => {
    if (post.published !== false && post.search !== false) {
      searchData.push({
        title: post.title || '',
        url: post.path,
        content: post.content || post.excerpt || '',
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
