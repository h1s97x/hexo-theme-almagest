/**
 * Stylus 变量注入
 * 将主题配置中的 color 配置注入到 Stylus 变量中
 * 参考 Fluid 主题设计
 */

'use strict';

/* global hexo */

hexo.extend.filter.register('stylus:renderer', function (style) {
  const themeConfig = hexo.theme.config || {};

  // 注入颜色配置
  if (themeConfig.color) {
    const color = themeConfig.color;

    // 亮色主题颜色
    style.define('color-body-bg', color.body_bg_color || '#f8f9fa');
    style.define('color-navbar-bg', color.navbar_bg_color || 'rgba(255, 255, 255, 0.95)');
    style.define('color-navbar-text', color.navbar_text_color || '#334155');
    style.define('color-board', color.board_color || '#ffffff');
    style.define('color-text', color.text_color || '#334155');
    style.define('color-sec-text', color.sec_text_color || '#64748b');
    style.define('color-post-heading', color.post_heading_color || '#1e293b');
    style.define('color-link', color.link_color || '#0066cc');
    style.define('color-link-hover', color.link_hover_color || '#4a90d9');
    style.define('color-link-hover-bg', color.link_hover_bg_color || 'rgba(74, 144, 217, 0.1)');
    style.define('color-line', color.line_color || '#e2e8f0');
    style.define('color-button-bg', color.button_bg_color || 'transparent');
    style.define('color-button-hover-bg', color.button_hover_bg_color || '#f1f5f9');

    // 暗色主题颜色
    style.define('color-body-bg-dark', color.body_bg_color_dark || '#0f172a');
    style.define('color-navbar-bg-dark', color.navbar_bg_color_dark || 'rgba(15, 23, 42, 0.95)');
    style.define('color-navbar-text-dark', color.navbar_text_color_dark || '#e2e8f0');
    style.define('color-board-dark', color.board_color_dark || '#1e293b');
    style.define('color-text-dark', color.text_color_dark || '#cbd5e1');
    style.define('color-sec-text-dark', color.sec_text_color_dark || '#94a3b8');
    style.define('color-post-heading-dark', color.post_heading_color_dark || '#e2e8f0');
    style.define('color-link-dark', color.link_color_dark || '#60a5fa');
    style.define('color-link-hover-dark', color.link_hover_color_dark || '#93c5fd');
    style.define(
      'color-link-hover-bg-dark',
      color.link_hover_bg_color_dark || 'rgba(96, 165, 250, 0.15)'
    );
    style.define('color-line-dark', color.line_color_dark || '#334155');
    style.define('color-button-bg-dark', color.button_bg_color_dark || 'transparent');
    style.define('color-button-hover-bg-dark', color.button_hover_bg_color_dark || '#334155');
  }
});
