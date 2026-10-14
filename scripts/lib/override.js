/**
 * 站点级配置覆盖管线（纯函数）
 *
 * 背景（参考 Fluid `merge-configs.js` / Redefine `data-handle.js`）：
 * 用户改主题配置此前只能改站点 `_config.yml` 的 `theme_config`（会被主题升级覆盖），
 * 或在主题目录里改 `_config.yml`（升级即丢）。标准做法是支持
 * `source/_data/almagest.yml` 作为用户侧覆盖层，优先级最高且与主题解耦。
 *
 * 优先级：source/_data/almagest.yml > 站点 _config.yml 的 theme_config > 主题 _config.yml
 */

'use strict';

const { deepMerge } = require('hexo-util');

// 站点 _data 下被识别为主题覆盖的文件名（不含扩展名）
const DATA_FILE_NAME = 'almagest';

/**
 * 从 hexo locals 的 data 对象中取出主题覆盖配置
 * @param {object} siteData hexo.locals.get('data') 的结果（可能为 undefined）
 * @returns {object} 覆盖配置（无则空对象）
 */
function extractDataOverride(siteData) {
  if (!siteData || typeof siteData !== 'object') {
    return {};
  }
  const override = siteData[DATA_FILE_NAME];
  return override && typeof override === 'object' ? override : {};
}

/**
 * 把站点 _data 覆盖合并进主题配置
 *
 * 注意：
 * 1. hexo-util 的 deepMerge 只接受 (target, source) 两个参数，多传的被忽略，
 *    因此多级合并必须链式调用；
 * 2. 其 arrayMerge 是「按下标合并 + 去重追加」而非整体替换，
 *    数组型配置（如 astronomy.events）表现为追加，文档需注明；
 * 3. hexo.theme.config 是 getter/setter 且被 Hexo 的 mergeCtxThemeConfig
 *    在 load 阶段赋过值，因此这里用「读 → 合并 → 写回」。
 *
 * @param {object} themeConfig 当前主题配置（hexo.theme.config）
 * @param {object} siteData hexo.locals.get('data')
 * @returns {{merged: object, changed: boolean}} merged 为合并后的新配置对象
 */
function applyDataOverride(themeConfig, siteData) {
  const override = extractDataOverride(siteData);
  const keys = Object.keys(override);

  if (keys.length === 0) {
    return { merged: themeConfig, changed: false };
  }

  // 先克隆主题配置（deepMerge 会修改第一个参数），再让覆盖层胜出
  const merged = deepMerge(deepMerge({}, themeConfig || {}), override);
  return { merged: merged, changed: true };
}

module.exports = { DATA_FILE_NAME, extractDataOverride, applyDataOverride };
