/**
 * 资源（asset）相关纯函数（可测试层）
 *
 * 为 `{% asset_code %}` 标签提供可单测的参数解析与内容截取能力，
 * 不引用全局 `hexo`，不触碰文件系统。
 */

'use strict';

const path = require('path');

/** 支持以 `key:value` 形式书写的命名参数 */
const NAMED_KEYS = ['lang', 'from', 'to'];

/** 位置参数依次映射到的字段名 */
const POSITIONAL_KEYS = ['path', 'title'];

/**
 * 解析 asset_code 标签参数。
 *
 * - 位置参数依次映射到 path / title
 * - 形如 `lang:js` / `from:10` / `to:20` 的键值对按名解析
 *
 * @param {string[]} args
 * @returns {{ path: string, title: string, lang: string, from: number, to: number }}
 */
function parseAssetCodeArgs(args) {
  const out = { path: '', title: '', lang: '', from: 0, to: -1 };
  const posKeys = POSITIONAL_KEYS;
  let pos = 0;

  for (const arg of args || []) {
    if (!arg) {
      continue;
    }

    const idx = arg.indexOf(':');
    if (idx > 0 && NAMED_KEYS.includes(arg.slice(0, idx))) {
      const key = arg.slice(0, idx);
      const value = arg.slice(idx + 1);
      if (key === 'from' || key === 'to') {
        out[key] = parseInt(value, 10) || 0;
      } else {
        out[key] = value;
      }
    } else if (posKeys[pos]) {
      out[posKeys[pos]] = arg;
      pos++;
    } else {
      out.title = arg;
    }
  }

  return out;
}

/**
 * 安全转字符串：null / undefined 视为空串
 * @param {*} value
 * @returns {string}
 */
function toStr(value) {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * 按 1-based 闭区间截取代码行。
 * - from <= 0 视为从第 1 行开始
 * - to < 0 视为到末尾
 *
 * @param {string} content 文件全文
 * @param {number} from
 * @param {number} to
 * @returns {string}
 */
function sliceLines(content, from, to) {
  const lines = toStr(content).split('\n');
  const start = from > 0 ? from - 1 : 0;
  const end = to >= 0 ? to : lines.length;
  return lines.slice(start, end).join('\n').trim();
}

/**
 * 统计代码总行数（用于高亮器的行号渲染，取值与 `from/to` 截取无关）。
 * @param {string} content
 * @returns {number}
 */
function countLines(content) {
  return toStr(content).split('\n').length;
}

/**
 * 由文件名推断代码语言（取扩展名，不含点）。
 * @param {string} filePath
 * @returns {string}
 */
function inferLang(filePath) {
  return path.extname(filePath || '').replace(/^\./, '');
}

module.exports = {
  NAMED_KEYS,
  POSITIONAL_KEYS,
  parseAssetCodeArgs,
  sliceLines,
  countLines,
  inferLang
};
