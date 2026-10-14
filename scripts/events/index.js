/**
 * Hexo Events
 * Handles Hexo lifecycle events
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册事件，不能使用 module.exports 导出函数。
 *
 * 本文件是 **注册层**：generateBefore 里做的站点 _data 覆盖合并，
 * 逻辑位于 `scripts/lib/override.js`（纯函数、可单测）。
 */

'use strict';

const { applyDataOverride, DATA_FILE_NAME } = require('../lib/override');

// Before generate
hexo.on('generateBefore', function () {
  // 站点级覆盖：source/_data/almagest.yml > theme_config > 主题 _config.yml。
  // 必须挂在 generateBefore——Hexo 的 theme_config 合并在 load 阶段完成，
  // 而 generator / 模板都在 generate 阶段读配置，晚于本事件。
  const siteData = hexo.locals && hexo.locals.get ? hexo.locals.get('data') : null;
  const result = applyDataOverride(hexo.theme.config, siteData);

  if (result.changed) {
    hexo.theme.config = result.merged;
    hexo.log.info('Almagest: 已合并站点覆盖 source/_data/' + DATA_FILE_NAME + '.yml');
  }

  console.log('Almagest: Generating...');
});

// After generate
hexo.on('generateAfter', function () {
  console.log('Almagest: Generation complete');
});

// Ready
hexo.on('ready', function () {
  console.log('Almagest: Theme ready');
});
