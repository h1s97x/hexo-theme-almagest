/**
 * HTML 字符串处理函数集合（可测试层）
 *
 * 与 `lib/text.js` 一样属于 **lib 层**：不引用全局 `hexo`、无副作用。
 *
 * 主要承载「图片懒加载」的 HTML 注入逻辑。放在渲染层
 * （`after_render:html`）而不是 `after_post_render` 处理，是为了不污染
 * `post.content`——search.json / RSS 等下游消费者拿到的仍是原始 `src`。
 */

'use strict';

/**
 * 判断属性区是否已存在某属性（兼容任意引号风格 / 裸属性）。
 * @param {string} attrs
 * @param {string} name
 * @returns {boolean}
 */
function hasAttr(attrs, name) {
  return new RegExp('\\b' + name + '(?:\\s*=|\\s|$)', 'i').test(attrs);
}

/**
 * 从属性区提取某属性的完整片段（含等号与值）。
 * 例如输入 ` src="/a.jpg" alt="a"` 与 name=src，返回 `src="/a.jpg"`。
 * @param {string} attrs
 * @param {string} name
 * @returns {string|null}
 */
function getAttrMatch(attrs, name) {
  const re = new RegExp('\\b' + name + '\\s*=\\s*("[^"]*"|\'[^\']*\'|[^\\s>]+)', 'i');
  const m = attrs.match(re);
  return m ? m[0] : null;
}

/**
 * 处理单个 <img> 标签：保留 src 并补 data-src + loading="lazy"。
 *
 * 为什么保留 src：
 * - 最终渲染 HTML 始终包含 src，即使 lazy-load.js 因 CDN 故障 / JS 错误未执行，
 *   图片也能正常显示（现代浏览器走原生 loading="lazy"，无需 JS）。
 * - data-src 作为 polyfill / 错误兜底标记保留：lazy-load.js 据此识别懒加载图片，
 *   加载失败时应用 .error 占位样式。
 *
 * 已含 data-src（或任意引号风格 loading）的标签不再处理，避免重复注入。
 * @param {string} tag 完整 <img ...> 标签
 * @returns {string}
 */
function processImgTag(tag) {
  // 已处理过 / 用户手动使用 data-src → 跳过
  if (hasAttr(tag, 'data-src')) {
    return tag;
  }

  // 去掉 '<img' 与尾部 '>'，得到属性区
  const inner = tag.slice(4, -1);
  const srcAttr = getAttrMatch(inner, 'src');
  if (!srcAttr) {
    return tag;
  }

  // 保留 src，同时在其后补充同值的 data-src（供 JS 识别/兜底）
  const dataSrcAttr = srcAttr.replace(/^\s*src\s*=/i, 'data-src=');
  let newInner = inner.replace(
    /\bsrc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/i,
    srcAttr + ' ' + dataSrcAttr
  );

  // 补 loading="lazy"（若已有任意引号风格则跳过）
  if (!hasAttr(newInner, 'loading')) {
    newInner += ' loading="lazy"';
  }

  return '<img' + newInner + '>';
}

/**
 * 对 HTML 字符串做引号感知扫描，逐个处理 <img> 标签。
 * - 属性值（如 data URI）内含 '>' 不会被提前截断
 * - <script>/<style>/<pre>/<textarea> 内的内容原样跳过，
 *   避免误改 search.ejs 内嵌 JSON / 代码示例中的图片标签。
 *
 * @param {string} html
 * @returns {string}
 */
function lazyLoadHtml(html) {
  let result = '';
  let i = 0;
  const len = html.length;

  while (i < len) {
    const lt = html.indexOf('<', i);
    if (lt === -1) {
      result += html.slice(i);
      break;
    }

    // 复制 '<' 之前的纯文本
    result += html.slice(i, lt);
    i = lt;

    // 识别标签名（大小写不敏感）
    const head = html.slice(lt, lt + 12);
    const tagMatch = head.match(/^<([a-zA-Z][a-zA-Z0-9]*)/);
    if (!tagMatch) {
      result += '<';
      i = lt + 1;
      continue;
    }

    const tagName = tagMatch[1].toLowerCase();

    // <img>：引号感知地找到标签结束的 '>'，再交给 processImgTag
    if (tagName === 'img') {
      let j = lt + tagMatch[0].length;
      let inSingle = false;
      let inDouble = false;
      while (j < len) {
        const ch = html[j];
        if (inDouble) {
          if (ch === '"') {
            inDouble = false;
          }
        } else if (inSingle) {
          if (ch === "'") {
            inSingle = false;
          }
        } else if (ch === '"') {
          inDouble = true;
        } else if (ch === "'") {
          inSingle = true;
        } else if (ch === '>') {
          break;
        }
        j++;
      }

      const tagEnd = Math.min(j + 1, len);
      const tag = html.slice(lt, tagEnd);
      result += processImgTag(tag);
      i = tagEnd;
      continue;
    }

    // 受保护区域：整段原样复制，跳过其中的 <img>
    if (
      tagName === 'script' ||
      tagName === 'style' ||
      tagName === 'pre' ||
      tagName === 'textarea'
    ) {
      const closeOpen = html.toLowerCase().indexOf('</' + tagName, lt);
      if (closeOpen === -1) {
        result += html.slice(i);
        i = len;
      } else {
        let end = closeOpen + ('</' + tagName).length;
        while (end < len && html[end] !== '>') {
          end++;
        }
        end = Math.min(end + 1, len);
        result += html.slice(i, end);
        i = end;
      }
      continue;
    }

    // 其他标签：原样保留 '<'，标签体作为后续文本继续扫描
    result += '<';
    i = lt + 1;
  }

  return result;
}

module.exports = {
  hasAttr,
  getAttrMatch,
  processImgTag,
  lazyLoadHtml
};
