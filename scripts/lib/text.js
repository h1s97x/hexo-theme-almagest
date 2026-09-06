/**
 * 纯文本处理函数集合（可测试层）
 *
 * 本模块是「lib / 注册层分离」架构中的 **lib 层**：
 * - 不引用全局 `hexo`，不产生任何副作用，可直接在单元测试中 require；
 * - 只做纯字符串处理（剥离标签、截断、统计字数）；
 * - `scripts/helpers`、`scripts/generators`、`scripts/filters` 只负责把它
 *   们桥接成 Hexo 的 helper / generator / filter。
 *
 * 参考：Stellar 的 `scripts/lib/`、Fluid 的 `scripts/utils/`。
 */

'use strict';

/** 默认摘要长度（字符数） */
const DEFAULT_EXCERPT_LENGTH = 200;

/** 默认阅读速度（词/分钟） */
const DEFAULT_WORDS_PER_MINUTE = 200;

/** 截断后缀 */
const ELLIPSIS = '...';

/**
 * 安全转字符串：null / undefined 视为空串
 * @param {*} value
 * @returns {string}
 */
function toStr(value) {
  return value === undefined || value === null ? '' : String(value);
}

/**
 * 剥离 HTML 标签（不还原实体、不压缩空白）。
 * @param {string} html
 * @returns {string}
 */
function stripHtml(html) {
  return toStr(html).replace(/<[^>]*>/g, '');
}

/**
 * 转义 HTML 特殊字符。
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return toStr(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 生成摘要：剥离 HTML 后按长度截断。
 *
 * @param {string} html 原始内容（可为 post.content / post.excerpt）
 * @param {number} [maxLength] 摘要最大长度
 * @param {{ alwaysSuffix?: boolean }} [options]
 *   alwaysSuffix=true 时，即使未超长也追加省略号（兼容 excerpt filter 的历史行为）
 * @returns {string}
 */
function toExcerpt(html, maxLength, options) {
  const { alwaysSuffix = false } = options || {};
  const limit = maxLength > 0 ? maxLength : DEFAULT_EXCERPT_LENGTH;
  const text = stripHtml(html);

  if (text.length > limit) {
    return text.slice(0, limit) + ELLIPSIS;
  }

  return alwaysSuffix ? text + ELLIPSIS : text;
}

/**
 * 把文章 HTML 转为搜索/索引用的纯文本：
 * - 丢弃 <script> / <style> 整段内容（脚本与样式不该被搜到）
 * - 剥离其余标签（<pre> 保留文本，代码块内容仍可搜索）
 * - 还原常见实体、压缩空白
 *
 * @param {string} html
 * @returns {string}
 */
function toPlainText(html) {
  return toStr(html)
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&(?:#39|apos);/g, "'")
    .replace(/&amp;/g, '&') // 必须最后还原，避免二次解码
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 生成搜索索引正文（toPlainText + 按长度截断）。
 * @param {string} html
 * @param {number} maxLength <=0 表示不截断
 * @returns {string}
 */
function toIndexText(html, maxLength) {
  const text = toPlainText(html);

  if (maxLength > 0 && text.length > maxLength) {
    return text.slice(0, maxLength);
  }

  return text;
}

/**
 * 估算阅读时长（分钟）。
 * - 按空格分词统计（中文按字/词块计数，与历史实现一致）
 * - 空内容返回 0；非空内容至少返回 1 分钟
 *
 * @param {string} content
 * @param {number} [wordsPerMinute]
 * @returns {number}
 */
function readingTime(content, wordsPerMinute) {
  if (!content) {
    return 0;
  }

  const rate = wordsPerMinute > 0 ? wordsPerMinute : DEFAULT_WORDS_PER_MINUTE;
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;

  return Math.max(Math.ceil(wordCount / rate), 1);
}

module.exports = {
  DEFAULT_EXCERPT_LENGTH,
  DEFAULT_WORDS_PER_MINUTE,
  ELLIPSIS,
  stripHtml,
  escapeHtml,
  toExcerpt,
  toPlainText,
  toIndexText,
  readingTime
};
