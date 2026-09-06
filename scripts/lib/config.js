/**
 * 主题配置校验的纯逻辑（可测试层）
 *
 * 不引用全局 `hexo`：只接收配置对象、返回问题描述数组。
 * 注册（ready 钩子、version 自动同步）位于 `scripts/config/index.js`。
 *
 * 背景：
 * - 主题配置项全部靠注释文档约束，用户拼错键名（如 `prefer_theme`）会静默失效，
 *   排查成本很高；这里做一次只读校验并返回问题列表，由注册层决定如何告警
 *   （不阻断构建）。
 */

'use strict';

// 主题 _config.yml 的顶层键白名单（改动 _config.yml 时需同步）
const KNOWN_TOP_LEVEL_KEYS = [
  'title',
  'subtitle',
  'description',
  'author',
  'language',
  'date_format',
  'style',
  'code_highlight',
  'fonts',
  'menu',
  'sidebar',
  'features',
  'social',
  'services',
  'pagination',
  'article',
  'page',
  'image',
  'search',
  'astronomy',
  'wiki',
  'topic',
  'notebooks',
  'inject',
  'debug',
  'cdn_prefix',
  'version'
];

// 取值必须落在枚举内的配置项
const ENUM_RULES = [
  { path: 'style.prefers_theme', allowed: ['auto', 'light', 'dark'] },
  { path: 'sidebar.position', allowed: ['left', 'right'] },
  { path: 'pagination.type', allowed: ['pagination', 'infinite'] }
];

// 必须是正数的配置项
const POSITIVE_NUMBER_RULES = [
  'sidebar.width',
  'pagination.per_page',
  'article.excerpt_length',
  'search.index_length'
];

/**
 * 按 a.b.c 形式读取嵌套属性
 * @param {object} obj
 * @param {string} path
 * @returns {*}
 */
function getPath(obj, path) {
  return path.split('.').reduce(function (acc, key) {
    return acc === null || acc === undefined ? acc : acc[key];
  }, obj);
}

/**
 * 校验主题配置，返回问题描述数组（不抛错，避免阻断构建）
 * @param {object} themeConfig
 * @returns {string[]}
 */
function validate(themeConfig) {
  const problems = [];

  Object.keys(themeConfig || {}).forEach(function (key) {
    if (KNOWN_TOP_LEVEL_KEYS.indexOf(key) === -1) {
      problems.push('未知配置项 `' + key + '`（可能是拼写错误，将不会生效）');
    }
  });

  ENUM_RULES.forEach(function (rule) {
    const value = getPath(themeConfig, rule.path);
    if (value !== undefined && value !== null && rule.allowed.indexOf(value) === -1) {
      problems.push(
        '`' + rule.path + '` 取值 `' + value + '` 无效，可选：' + rule.allowed.join(' / ')
      );
    }
  });

  POSITIVE_NUMBER_RULES.forEach(function (path) {
    const value = getPath(themeConfig, path);
    if (value !== undefined && value !== null && (typeof value !== 'number' || value <= 0)) {
      problems.push('`' + path + '` 应为正数，当前为 `' + value + '`');
    }
  });

  return problems;
}

/**
 * 站点是否在 _config.yml 的 theme_config 中显式覆盖了某配置项
 * @param {object} siteConfig hexo.config
 * @param {string} key
 * @returns {boolean}
 */
function hasSiteOverride(siteConfig, key) {
  const siteThemeConfig = siteConfig && siteConfig.theme_config;
  return !!(siteThemeConfig && Object.prototype.hasOwnProperty.call(siteThemeConfig, key));
}

module.exports = {
  KNOWN_TOP_LEVEL_KEYS,
  ENUM_RULES,
  POSITIVE_NUMBER_RULES,
  getPath,
  validate,
  hasSiteOverride
};
