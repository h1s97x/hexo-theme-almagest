/**
 * 配置废弃告警（纯函数）
 *
 * 参考 Redefine `scripts/deprecations/` 的规则式做法：
 * 配置键改名/移除时，不让用户配置静默失效，而是在 hexo generate 时
 * 打印「哪个键废弃了、改用哪个」的明确指引。
 *
 * 规则在下方 RULES 数组中追加；当前主题尚无历史废弃键，
 * 框架先就位，2.0.0 起随配置调整逐条补充。
 */

'use strict';

/**
 * 废弃规则
 * @property {string} key 废弃的配置键（点路径，如 'features.old_thing'）
 * @property {string} removedIn 从哪个主题版本起失效
 * @property {string} instead 替代方案说明
 */
const RULES = [];

/**
 * 按点路径读配置（避免中间层级不存在时抛错）
 * @param {object} config
 * @param {string} dottedKey
 * @returns {*} 取不到返回 undefined
 */
function getByPath(config, dottedKey) {
  if (!config || typeof config !== 'object') {
    return undefined;
  }
  return dottedKey.split('.').reduce(function (acc, part) {
    return acc && typeof acc === 'object' ? acc[part] : undefined;
  }, config);
}

/**
 * 找出配置中命中的废弃项
 * @param {object} config 主题配置
 * @returns {Array<{key: string, removedIn: string, instead: string}>}
 */
function findDeprecations(config) {
  return RULES.filter(function (rule) {
    return getByPath(config, rule.key) !== undefined;
  }).map(function (rule) {
    return { key: rule.key, removedIn: rule.removedIn, instead: rule.instead };
  });
}

/**
 * 生成人类可读的告警文案
 * @param {Array<{key: string, removedIn: string, instead: string}>} hits
 * @returns {string[]} 每条一行
 */
function formatDeprecationWarnings(hits) {
  return hits.map(function (hit) {
    return (
      '配置项 "' + hit.key + '" 已废弃（自 ' + hit.removedIn + ' 起失效），请改用：' + hit.instead
    );
  });
}

module.exports = { RULES, getByPath, findDeprecations, formatDeprecationWarnings };
