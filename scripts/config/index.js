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

hexo.on('ready', function () {
  const themeConfig = (hexo.theme && hexo.theme.config) || {};

  if (syncVersion(hexo)) {
    hexo.log.info('Almagest: version 已同步为 ' + pkgVersion);
  }

  const problems = validate(themeConfig);
  if (problems.length === 0) {
    return;
  }

  hexo.log.warn('Almagest: 检测到 ' + problems.length + ' 处配置问题：');
  problems.forEach(function (msg) {
    hexo.log.warn('  - ' + msg);
  });
  hexo.log.warn('  参考主题 _config.yml 中的注释说明进行修正。');
});

module.exports = { syncVersion, validate, getPath: require('../lib/config').getPath };
