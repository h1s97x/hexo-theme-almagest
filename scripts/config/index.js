/**
 * Hexo Config Guard（注册层）
 * 主题配置校验与默认值补齐
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册事件，不能使用 module.exports 导出函数
 * （文件末尾的 module.exports 仅为单元测试服务，Hexo 加载时会忽略）。
 *
 * 校验规则本身位于 `scripts/lib/config.js`（纯函数、无 hexo 依赖）。
 *
 * `version` 用于静态资源缓存清除，升级主题后忘记同步会一直命中旧缓存；
 * 站点未显式覆盖时自动对齐 package.json 的版本号。
 */

'use strict';

const { validate, hasSiteOverride } = require('../lib/config');
const { findDeprecations, formatDeprecationWarnings } = require('../lib/deprecations');
const { applyDataOverride, DATA_FILE_NAME } = require('../lib/override');

/**
 * 主题 package.json 版本号（用于自动同步 version）
 */
const pkgVersion = (function () {
  try {
    return require('../../package.json').version || '';
  } catch (err) {
    return '';
  }
})();

/**
 * 站点未显式配置 version 时，自动对齐主题 package.json 版本号，
 * 避免升级主题后仍命中旧的 main.css / JS 缓存。
 * @param {object} hexoInstance
 * @returns {boolean} 是否发生了同步
 */
function syncVersion(hexoInstance) {
  if (!pkgVersion || hasSiteOverride(hexoInstance.config, 'version')) {
    return false;
  }

  const themeConfig = hexoInstance.theme.config;
  if (!themeConfig || themeConfig.version === pkgVersion) {
    return false;
  }

  themeConfig.version = pkgVersion;
  return true;
}

/**
 * 主题启用自带 highlight.js 方案时，关闭 Hexo 内置高亮。
 *
 * 背景（真实缺陷，演示站点截图时暴露）：Hexo 7/8 的 markdown 代码高亮由
 * **`syntax_highlighter`** 配置控制（默认 `'highlight.js'`），
 * `before_post_render` 上的 backtick_code_block filter 会先把围栏代码块
 * 渲染成 `<figure class="highlight"><table>…<pre>`——其中**没有 `<code>` 子元素**。
 * 于是 scripts.ejs 里的 `hljs.highlightElement('pre code')` 与 code-copy.js 的
 * `pre code` 选择器全部匹配不到：主题的语法高亮和复制按钮静默失效
 * （页面看着正常，功能全无）。
 *
 * 注意：不是 `highlight.enable`——那个配置项在 Hexo 8 已基本失效，
 * 改它没有任何效果（实测过）。
 *
 * 主题的 `code_highlight.enable` 默认为 true，即默认就走自带方案，
 * 因此这里在默认路径上清空 syntax_highlighter；用户显式关闭主题方案
 * （code_highlight.enable: false）时不动站点配置，交还 Hexo 内置高亮。
 *
 * @param {object} hexoInstance
 * @returns {boolean} 是否发生了关闭
 */
function disableBuiltinHighlight(hexoInstance) {
  const themeConfig = (hexoInstance.theme && hexoInstance.theme.config) || {};
  if (!themeConfig.code_highlight || themeConfig.code_highlight.enable === false) {
    return false;
  }

  if (!hexoInstance.config.syntax_highlighter) {
    return false;
  }

  hexoInstance.config.syntax_highlighter = '';
  return true;
}

// ⚠️ 为什么所有配置逻辑都挂 generateBefore 而不是 ready：
// Hexo 的 'ready' 在 init() 阶段发射，此时主题 _config.yml 尚未加载、
// 站点 theme_config 尚未合并（theme.process() 与 mergeCtxThemeConfig 都在
// 之后的 load() 里），hexo.theme.config 是**空对象**——挂在 ready 上的
// 配置校验读到的永远是 {}（等于没校验），高亮关闭也因读不到
// code_highlight 而静默失效（真实缺陷，演示站点截图时暴露）。
// generateBefore 位于合并之后、文章渲染之前，是唯一正确的时机。
hexo.on('generateBefore', function () {
  // 1. 站点 _data 覆盖合并（优先级最高；先于其余逻辑，让它们看到最终配置）
  const siteData = hexo.locals && hexo.locals.get ? hexo.locals.get('data') : null;
  const overrideResult = applyDataOverride(hexo.theme.config, siteData);
  if (overrideResult.changed) {
    hexo.theme.config = overrideResult.merged;
    hexo.log.info('Almagest: 已合并站点覆盖 source/_data/' + DATA_FILE_NAME + '.yml');
  }

  const themeConfig = (hexo.theme && hexo.theme.config) || {};

  // 2. 版本同步（资源缓存清除）
  if (syncVersion(hexo)) {
    hexo.log.info('Almagest: version 已同步为 ' + pkgVersion);
  }

  // 3. 关闭 Hexo 内置高亮（主题自带 highlight.js 方案启用时）
  if (disableBuiltinHighlight(hexo)) {
    hexo.log.info('Almagest: 已关闭 Hexo 内置高亮，改用主题 highlight.js 方案');
  }

  // 4. 配置校验
  const problems = validate(themeConfig);
  if (problems.length > 0) {
    hexo.log.warn('Almagest: 检测到 ' + problems.length + ' 处配置问题：');
    problems.forEach(function (msg) {
      hexo.log.warn('  - ' + msg);
    });
    hexo.log.warn('  参考主题 _config.yml 中的注释说明进行修正。');
  }

  // 5. 废弃配置告警：键已改名/移除时给出明确迁移指引，避免静默失效
  const deprecated = findDeprecations(themeConfig);
  if (deprecated.length > 0) {
    formatDeprecationWarnings(deprecated).forEach(function (msg) {
      hexo.log.warn('Almagest: ' + msg);
    });
  }
});

module.exports = {
  syncVersion,
  disableBuiltinHighlight,
  validate,
  getPath: require('../lib/config').getPath
};
