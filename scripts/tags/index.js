/**
 * Hexo Tags
 * Custom tag plugins
 *
 * 注意：Hexo 的主题脚本机制是「直接执行代码」，
 * 因此这里直接使用全局 `hexo` 注册 tag，不能使用 module.exports 导出函数。
 *
 * 本文件是 **注册层**：参数解析与内容截取位于 `scripts/lib/asset.js`。
 */

'use strict';

const path = require('path');
const fs = require('fs');
const hexoUtil = require('hexo-util');

const { escapeHtml } = require('../lib/text');
const { parseAssetCodeArgs, sliceLines, countLines, inferLang } = require('../lib/asset');

// Note tag
hexo.extend.tag.register(
  'note',
  function (args, content) {
    const type = args[0] || 'info';
    return `<div class="note note-${type}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
  },
  { ends: true }
);

// Alert tag
hexo.extend.tag.register(
  'alert',
  function (args, content) {
    const type = args[0] || 'info';
    return `<div class="alert alert-${type}">${hexo.render.renderSync({ text: content, engine: 'markdown' })}</div>`;
  },
  { ends: true }
);

// Button tag
hexo.extend.tag.register('button', function (args) {
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
hexo.extend.tag.register('asset_code', function (args) {
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
  const source = fs.readFileSync(doc.source, 'utf8');
  const code = sliceLines(source, from, to);

  const fileLang = lang || inferLang(relPath);
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
          lines_length: countLines(source)
        }
      ]
    });
  }

  return `<pre><code class="language-${fileLang}">${escapeHtml(code)}</code></pre>`;
});
