/**
 * 前端配置导出（纯函数层）
 *
 * 背景：主题配置与服务端 i18n 文案此前靠一个个零散的 window.__almagest* 全局变量
 * 注入前端（copy 三件套、search 三件套、日历文案各占一处），
 * 新增前端能力就要改模板 + 改 JS 两处，容易漂移。
 *
 * 现在统一为单个 `window.__almagestConfig`（<script type="application/json">），
 * 由 alm_export_config helper 产出。本文件只放可单测的纯逻辑。
 */

'use strict';

// 前端消费方的缺省值（i18n 键缺失或模板未注入时使用）
const DEFAULTS = {
  copy: { copy: 'Copy', copied: 'Copied!', failed: 'Failed' },
  search: {
    url: '/search.json',
    empty: 'Enter search terms',
    noResults: 'No results found'
  },
  astronomy: { noEvents: 'No events for this day' }
};

/**
 * 取 i18n 文案；Hexo 的 __() 找不到键时会原样返回键名，
 * 此时视为缺失并回落缺省值（与 Next 的 `__('k') !== 'k' ? ... : fallback` 惯用法一致）
 * @param {Function} t __ 函数（可为非函数，届时整体回落）
 * @param {string} key
 * @param {string} fallback
 * @returns {string}
 */
function resolveI18n(t, key, fallback) {
  if (typeof t !== 'function') {
    return fallback;
  }
  const value = t(key);
  return value && value !== key ? value : fallback;
}

/**
 * 组装导出给前端的配置对象
 * @param {object} [parts]
 * @param {string} [parts.version] 主题版本号
 * @param {Function} [parts.t] __ i18n 函数
 * @param {string} [parts.searchUrl] search.json 地址（url_for 结果）
 * @returns {{version: string, copy: object, search: object, astronomy: object}}
 */
function buildFrontendConfig(parts) {
  const p = parts || {};
  const t = p.t;

  return {
    version: p.version || '',
    copy: {
      copy: resolveI18n(t, 'copy_code', DEFAULTS.copy.copy),
      copied: resolveI18n(t, 'code_copied', DEFAULTS.copy.copied),
      failed: resolveI18n(t, 'copy_failed', DEFAULTS.copy.failed)
    },
    search: {
      url: p.searchUrl || DEFAULTS.search.url,
      empty: resolveI18n(t, 'search_empty', DEFAULTS.search.empty),
      noResults: resolveI18n(t, 'search_no_results', DEFAULTS.search.noResults)
    },
    astronomy: {
      noEvents: resolveI18n(t, 'astronomy.no_events', DEFAULTS.astronomy.noEvents)
    }
  };
}

/**
 * 序列化为可内联进 <script> 的 JSON 字符串。
 * `<` `>` `&` 转义为 \u 序列，防止 `</script>` 提前闭合与 HTML 实体歧义。
 * @param {object} obj
 * @returns {string}
 */
function stringifyConfig(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}

module.exports = { DEFAULTS, resolveI18n, buildFrontendConfig, stringifyConfig };
