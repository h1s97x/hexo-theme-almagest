/**
 * Hexo Generators
 * Custom page generators
 */

'use strict';

module.exports = function(hexo) {
  // Archive generator
  hexo.extend.generator.register('archive', function(locals) {
    return {
      path: 'archives/index.html',
      layout: 'archive',
      data: {
        posts: locals.posts
      }
    };
  });

  // Categories generator
  hexo.extend.generator.register('categories', function(locals) {
    return {
      path: 'categories/index.html',
      layout: 'categories',
      data: {
        categories: locals.categories
      }
    };
  });

  // Tags generator
  hexo.extend.generator.register('tags', function(locals) {
    return {
      path: 'tags/index.html',
      layout: 'tags',
      data: {
        tags: locals.tags
      }
    };
  });

  // Search index generator
  hexo.extend.generator.register('search', function(locals) {
    const searchData = [];
    
    locals.posts.forEach(post => {
      if (post.published !== false) {
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
      content: JSON.stringify(searchData)
    };
  });
};
