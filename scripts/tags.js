/**
 * Hexo Tags
 * Custom tag plugins
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册 tag，不能使用 module.exports 导出函数。
 */

'use strict';

// Note tag
hexo.extend.tag.register('note', function(args, content) {
  const type = args[0] || 'info';
  return `<div class="note note-${type}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
}, { ends: true });

// Alert tag
hexo.extend.tag.register('alert', function(args, content) {
  const type = args[0] || 'info';
  return `<div class="alert alert-${type}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
}, { ends: true });

// Button tag
hexo.extend.tag.register('button', function(args) {
  const text = args[0] || 'Click me';
  const url = args[1] || '#';
  const type = args[2] || 'primary';
  return `<a href="${url}" class="btn btn-${type}">${text}</a>`;
});

// ---------------------------------------------------------------------------
// Asset code tag（通用能力，收编自 Stellar 生态的 asset_code）
//
// 把 source/ 目录下的源码文件以代码块形式渲染进文章：
//   {% asset_code path/to/file [title] [lang:xx] [from:n] [to:n] %}
//
// 说明：
//   - `path` 相对站点 source/ 目录（支持绝对路径），也可写成相对当前文章 source 目录的路径
//   - 语言未指定时根据文件扩展名推断；标题未指定时取文件名
//   - 使用 Hexo 内置高亮器渲染（Hexo >= 7 的 syntax_highlighter 机制），
//     无法使用高亮器的环境（如 Hexo 6）降级为 <pre><code>
// ---------------------------------------------------------------------------

const path = require('path');
const hexoUtil = require('hexo-util');
const fs = require('fs');

/**
 * 转义 HTML 特殊字符（降级渲染 <pre><code> 时使用）
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 解析 tag 参数：
 *  - 位置参数依次映射到 path / title
 *  - 形如 `lang:js` / `from:10` / `to:20` 的键值对按名解析
 * @param {string[]} args
 * @returns {{ path: string, title: string, lang: string, from: number, to: number }}
 */
function parseAssetCodeArgs(args) {
  const out = { path: '', title: '', lang: '', from: 0, to: -1 };
  const posKeys = ['path', 'title'];
  let pos = 0;
  for (const arg of args || []) {
    if (!arg) {
      continue;
    }
    const idx = arg.indexOf(':');
    if (idx > 0 && ['lang', 'from', 'to'].includes(arg.slice(0, idx))) {
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

hexo.extend.tag.register('asset_code', function(args) {
  const { path: relPath, title, lang, from, to } = parseAssetCodeArgs(args);

  // path 未提供时直接跳过
  if (!relPath) {
    return '';
  }

  const Asset = hexo.model('Asset');
  let doc = Asset.findOne({
    path: path.join(path.dirname(this.source || ''), relPath)
  });
  if (!doc) {
    doc = Asset.findOne({ path: relPath });
  }
  if (!doc) {
    hexo.log.warn(
      `[asset_code] Asset not found: ${relPath} (relative to ${this.source || 'site'})`
    );
    return '';
  }

  // 读取源码内容，按 from/to 截取行区间
  const codeLines = fs.readFileSync(doc.source, 'utf8').split('\n');
  const start = from > 0 ? from - 1 : 0;
  const end = to >= 0 ? to : codeLines.length;
  const code = codeLines.slice(start, end).join('\n').trim();

  const fileLang = lang || path.extname(relPath).substring(1);
  const fileTitle = title || path.basename(relPath);
  const caption = `<span><a href="${hexoUtil.url_for.call(hexo, doc.path)}">${fileTitle}</a></span>`;

  // Hexo >= 7 的高亮器（hexo.extend.highlight）；旧版本（如 Hexo 6）降级为纯 pre/code
  const hl = hexo.extend.highlight;
  if (hl && typeof hl.query === 'function' && hexo.config.syntax_highlighter) {
    return hl.exec(hexo.config.syntax_highlighter, {
      context: hexo,
      args: [
        code,
        {
          lang: fileLang,
          caption,
          lines_length: codeLines.length
        }
      ]
    });
  }

  return `<pre><code class="language-${fileLang}">${escapeHtml(code)}</code></pre>`;
});
