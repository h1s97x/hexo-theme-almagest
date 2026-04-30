/**
 * Math Helper for Almagest Theme
 * 数学公式辅助函数
 */

'use strict';

module.exports = function(hexo) {
  const config = hexo.theme.config.math || {};

  // 检查是否启用数学公式
  function isMathEnabled() {
    return config.enable === true;
  }

  // 检查是否为渲染引擎
  function isEngine(engine) {
    return config.engine === engine;
  }

  // 判断页面是否需要渲染数学公式
  hexo.extend.helper.register('is_math_page', function() {
    if (!isMathEnabled()) return false;

    const page = this.page;
    const layout = page.layout;
    const type = page.type;

    // 文章页面总是渲染
    if (layout === 'post') return true;

    // 指定类型页面渲染
    if (type === 'math') return true;

    // 配置为所有页面渲染
    if (config.render_on_all_pages) return true;

    return false;
  });

  // 获取数学公式 CDN 链接
  hexo.extend.helper.register('math_cdn', function(type, file) {
    const cdnBase = 'https://cdn.jsdelivr.net/npm';
    const version = config.katex?.version || '0.16.9';

    if (type === 'katex-css') {
      return `${cdnBase}/katex@${version}/dist/katex.min.css`;
    }
    if (type === 'katex-js') {
      return `${cdnBase}/katex@${version}/dist/katex.min.js`;
    }
    if (type === 'katex-auto-render') {
      return `${cdnBase}/katex@${version}/dist/contrib/auto-render.min.js`;
    }
    if (type === 'katex-copy-tex-css') {
      return `${cdnBase}/katex@${version}/dist/contrib/copy-tex.min.css`;
    }
    if (type === 'katex-copy-tex-js') {
      return `${cdnBase}/katex@${version}/dist/contrib/copy-tex.min.js`;
    }

    return '';
  });
};
