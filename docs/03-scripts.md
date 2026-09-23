# 03 · Hexo 脚本层（`scripts/`）

10 个文件，分为**注册层**（6 个 `index.js`）与**纯函数层**（`lib/` 4 个）。

## 0. 架构与加载机制

Hexo 会**递归加载主题 `scripts/` 下的所有 `.js`**（目录结构不影响加载）。因此这 6 个注册层文件是**直接执行的脚本**，靠全局 `hexo` 对象注册钩子。

> **读代码时的陷阱**：注册层文件末尾的 `module.exports` **只为单元测试存在**，Hexo 加载时忽略它。它们不是普通 CommonJS 模块。

```
scripts/
├── config/index.js       69 行   version 同步 + 配置校验告警
├── events/index.js       24 行   3 个生命周期日志
├── filters/index.js      54 行   3 个 filter
├── generators/index.js   97 行   5 个 generator（含 search.json）
├── helpers/index.js      38 行   5 个模板 helper
├── tags/index.js        107 行   4 个自定义 markdown 标签
└── lib/                  ──── 纯函数层：无 hexo 依赖、无副作用、可单测 ────
    ├── config.js        124 行   配置校验规则
    ├── text.js          141 行   HTML 剥离 / 摘要 / 索引正文 / 阅读时长
    ├── html.js          181 行   图片懒加载 HTML 注入
    └── asset.js         108 行   asset_code 参数解析与行截取
```

**依赖方向严格单向**：注册层 → lib 层；lib 层 4 个文件**互不依赖**。

## 1. `scripts/config/index.js`

**职责**：在 `ready` 阶段同步版本号 + 校验主题配置。

**导出**：`{ syncVersion, validate, getPath }`（后两个是从 `../lib/config` 转出）

| 函数          | 签名             | 返回       | 说明                                                                                                                                                        |
| ------------- | ---------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `syncVersion` | `(hexoInstance)` | `boolean`  | `package.json` 有版本、站点未在 `theme_config` 显式覆盖 `version`、且 `theme.config.version !== pkgVersion` 时，把 `theme.config.version` 改写并返回 `true` |
| `validate`    | `(themeConfig)`  | `string[]` | 转发 lib 层                                                                                                                                                 |
| `getPath`     | `(obj, path)`    | `*`        | 转发 lib 层                                                                                                                                                 |

**注册**：`hexo.on('ready', fn)` —— 事件钩子，**无 priority 概念**。
行为：`syncVersion` 成功 → `hexo.log.info`；`validate` 非空 → 逐条 `hexo.log.warn`。**永不抛错、不阻断构建。**

## 2. `scripts/events/index.js`

**职责**：仅打印控制台日志。**无任何 `module.exports`。**

| 注册                        | 输出                            |
| --------------------------- | ------------------------------- |
| `hexo.on('ready')`          | `Almagest: Theme ready`         |
| `hexo.on('generateBefore')` | `Almagest: Generating...`       |
| `hexo.on('generateAfter')`  | `Almagest: Generation complete` |

> 这里也注册了一个 `ready` 监听，与 `config/index.js` 的并存，Hexo 会按注册顺序都调用。

## 3. `scripts/filters/index.js`

**职责**：把 lib 纯函数桥接成 3 个 Hexo filter。**无 `module.exports`。**

| 注册钩子             | priority                   | 作用                       |
| -------------------- | -------------------------- | -------------------------- |
| `before_post_render` | 未显式传（Hexo 默认 `10`） | 原样 `return data`（占位） |
| `after_render:html`  | 默认 `10`                  | 图片懒加载注入             |
| `excerpt`            | 默认 `10`                  | 生成摘要                   |

> **三个注册都只传了 `(name, fn)`，源码中没有任何数字 priority。** 依赖 Hexo 默认值 10。

**`after_render:html` 逻辑**：

1. `themeConfig.image.lazy_load === false` → 原样返回
2. 非字符串 或 `indexOf('<img') === -1` → 原样返回
3. 否则 `return lazyLoadHtml(str)`

> **设计动机**（源码注释）：放在**渲染层**而非 `after_post_render`，是为了不污染 `post.content`，
> 保证 `search.json` / RSS 下游拿到的仍是原始 `src`。测试 `tests/unit/scripts.test.js` 明确断言
> 「不再有 `after_post_render`」。

**`excerpt` 逻辑**：`data.excerpt` 已存在则不动；否则 `toExcerpt(content, DEFAULT_EXCERPT_LENGTH, { alwaysSuffix: true })`。

> ⚠️ `alwaysSuffix: true` 意味着**无论是否超长都补 `...`**（历史行为）。

**依赖**：`../lib/html`、`../lib/text`。无外部 npm 包。

## 4. `scripts/generators/index.js`

**职责**：注册 5 个 generator。**无 `module.exports`。**

模块级常量：`const DEFAULT_INDEX_LENGTH = 1500;`

| 注册名        | 产出                                                                         | 备注                        |
| ------------- | ---------------------------------------------------------------------------- | --------------------------- |
| `archive`     | `{ path:'archives/index.html', layout:'archive', data:{ posts } }`           | 官方 generator 会覆盖同路径 |
| `categories`  | `{ path:'categories/index.html', layout:'categories', data:{ categories } }` | 同上                        |
| `tags`        | `{ path:'tags/index.html', layout:'tags', data:{ tags } }`                   | 同上                        |
| `search`      | `{ path:'search.json', data: JSON.stringify(searchData) }`                   | **搜索索引**                |
| `search-page` | `{ path:'search/index.html', layout:'search', data:{} }`                     | 搜索页壳                    |

generator 注册**无 priority 概念**。

### `search` generator 关键逻辑

1. `themeConfig.features.search === false` → `return []`（不生成索引，也不生成搜索页）
2. `indexLength = parseInt(searchConfig.index_length, 10) || DEFAULT_INDEX_LENGTH`
3. 遍历 `locals.posts`，仅收录 `post.published !== false && post.search !== false`
4. 每条压入 `{ title, url, text, date }`
5. `text` = `toIndexText(post.content || post.excerpt || '', indexLength)`

**`search.json` 结构**（顶层数组）：

```json
[
  {
    "title": "文章标题",
    "url": "2024/01/01/hello/",
    "text": "经 toIndexText 截断后的纯文本",
    "date": "2024-01-01T00:00:00.000Z"
  }
]
```

> 字段名只有这 4 个。旧版本曾用 `content` 存放整篇正文，现已改为 `text` 且只存截断后的纯文本。
> 前端 `search.js` 保留了读旧字段的兼容分支。

**依赖**：`../lib/text`。无外部包。

## 5. `scripts/helpers/index.js`

**职责**：注册 5 个 EJS helper。**无 `module.exports`。**

| helper             | 签名             | 返回      | 说明                                                        |
| ------------------ | ---------------- | --------- | ----------------------------------------------------------- |
| `get_excerpt`      | `(post, length)` | `string`  | `toExcerpt(post.excerpt \|\| post.content \|\| '', length)` |
| `get_reading_time` | `(content)`      | `number`  | 空内容 0，非空至少 1                                        |
| `is_featured`      | `(post)`         | `boolean` | `post.featured === true`（严格等于）                        |
| `get_categories`   | `(post)`         | `any[]`   | `post.categories \|\| []`                                   |
| `get_tags`         | `(post)`         | `any[]`   | `post.tags \|\| []`                                         |

**注册**：`hexo.extend.helper.register('name', fn)`，无 priority。

> ⚠️ **`is_featured` / `get_categories` / `get_tags` 在 `layout/` 中调用次数为 0**（已实测）。
> 它们是**为使用者预留的模板 API**，主题自身不使用。见 [09 · 已知缺陷](09-known-issues.md)。

**依赖**：`../lib/text`。

## 6. `scripts/tags/index.js`

**职责**：注册 4 个自定义 markdown 标签。**无 `module.exports`。**

| 标签         | 注册形式         | 参数                                                                            | 输出                                |
| ------------ | ---------------- | ------------------------------------------------------------------------------- | ----------------------------------- |
| `note`       | `{ ends: true }` | `args[0]` = 类型（缺省 `info`）                                                 | `<div class="note note-${type}">`   |
| `alert`      | `{ ends: true }` | `args[0]` = 类型（缺省 `info`）                                                 | `<div class="alert alert-${type}">` |
| `button`     | 无               | `args[0]` 文本（`Click me`）/ `args[1]` URL（`#`）/ `args[2]` 类型（`primary`） | `<a href class="btn btn-${type}">`  |
| `asset_code` | 无               | 见下                                                                            | 高亮代码块 或降级 `<pre><code>`     |

### `asset_code` 参数格式

```
{% asset_code path/to/file [title] [lang:xx] [from:n] [to:n] %}
```

- 位置参数依次映射 `path` → `title`；命名参数 `lang:` / `from:` / `to:` 可出现在任意位置
- 路径解析：先按 `path.join(path.dirname(this.source), relPath)` 作为 Asset 路径 `findOne`，
  **回退**为按 `relPath` 直接 `findOne`；都找不到 → `hexo.log.warn` 并返回 `''`
- 读文件：`fs.readFileSync(doc.source, 'utf8')` → `sliceLines(source, from, to)`
- 语言：`lang || inferLang(relPath)`；标题：`title || path.basename(relPath)`
- caption 链接：`hexoUtil.url_for.call(hexo, doc.path)`
- 渲染分支：`hexo.extend.highlight.query` 存在且 `hexo.config.syntax_highlighter` 为真（Hexo ≥ 7）时调
  `hl.exec(...)`；否则降级为 `<pre><code class="language-${lang}">${escapeHtml(code)}</code></pre>`

**依赖**：`path`、`fs`（Node 内置）、`hexo-util`（**唯一的 npm 依赖**）、`../lib/text`、`../lib/asset`。

## 7. `scripts/lib/config.js` — 配置校验规则

**导出**：`{ KNOWN_TOP_LEVEL_KEYS, ENUM_RULES, POSITIVE_NUMBER_RULES, getPath, validate, hasSiteOverride }`

### 三类规则

**A. 顶层键白名单**（28 项，拼写检查）

```
title, subtitle, description, author, language, date_format, style, code_highlight,
fonts, menu, sidebar, features, social, services, pagination, article, page, image,
search, astronomy, wiki, topic, notebooks, inject, debug, cdn_prefix, version
```

不在白名单的键会报：`未知配置项 \`<key>\`（可能是拼写错误，将不会生效）`

**B. 枚举校验**（`ENUM_RULES`，3 条）

| 路径                  | 允许值                    |
| --------------------- | ------------------------- |
| `style.prefers_theme` | `auto` / `light` / `dark` |
| `sidebar.position`    | `left` / `right`          |
| `pagination.type`     | `pagination` / `infinite` |

**C. 正数校验**（`POSITIVE_NUMBER_RULES`，4 项）

`sidebar.width`、`pagination.per_page`、`article.excerpt_length`、`search.index_length`

### 函数

| 函数              | 签名                | 返回       | 说明                                                                      |
| ----------------- | ------------------- | ---------- | ------------------------------------------------------------------------- |
| `getPath`         | `(obj, path)`       | `*`        | 按 `a.b.c` 用 `reduce` 读取嵌套属性；中途遇 `null`/`undefined` 即返回该值 |
| `validate`        | `(themeConfig)`     | `string[]` | 返回问题描述数组，**永不抛错**                                            |
| `hasSiteOverride` | `(siteConfig, key)` | `boolean`  | `Object.prototype.hasOwnProperty.call(siteConfig.theme_config, key)`      |

**失败处理**：缺失的嵌套配置（`undefined`）**不报错**（跳过）。`validate` 只返回数组，
由 `scripts/config/index.js` 打印：

```
Almagest: 检测到 N 处配置问题：
  - <msg>
  参考主题 _config.yml 中的注释说明进行修正。
```

**依赖**：无（不 require 任何东西）。

## 8. `scripts/lib/text.js` — 文本处理

**导出**：`{ DEFAULT_EXCERPT_LENGTH, DEFAULT_WORDS_PER_MINUTE, ELLIPSIS, stripHtml, escapeHtml, toExcerpt, toPlainText, toIndexText, readingTime }`

常量：`DEFAULT_EXCERPT_LENGTH = 200`、`DEFAULT_WORDS_PER_MINUTE = 200`、`ELLIPSIS = '...'`

| 函数          | 签名                         | 说明                                                                           |
| ------------- | ---------------------------- | ------------------------------------------------------------------------------ |
| `stripHtml`   | `(html)`                     | `replace(/<[^>]*>/g,'')`，不还原实体、不压空白                                 |
| `escapeHtml`  | `(str)`                      | 顺序替换 `&` → `&amp;` → `<` → `&lt;` → `>` → `&gt;`（**不含引号**）           |
| `toExcerpt`   | `(html, maxLength, options)` | `options.alwaysSuffix` 默认 `false`。`limit = maxLength > 0 ? maxLength : 200` |
| `toPlainText` | `(html)`                     | 搜索索引用。见下方顺序说明                                                     |
| `toIndexText` | `(html, maxLength)`          | `toPlainText` 后仅当 `maxLength > 0 && length > maxLength` 才截断              |
| `readingTime` | `(content, wordsPerMinute)`  | 空 → `0`；`Math.max(Math.ceil(words / rate), 1)`                               |

### `toPlainText` 的处理顺序（重要）

```
1. 删 <script> / <style> 整段          → 替换为空格
2. 删其余标签                          → 替换为空格
3. 还原实体：&nbsp; &lt; &gt; &quot; &#39; / &apos;
4. 【最后】还原 &amp;                  ← 注释：避免二次解码
5. \s+ 压成单空格 → trim
```

> **第 4 步必须在最后**。若先还原 `&amp;`，那么输入里的 `&amp;lt;` 会被先解成 `&lt;`，
> 再被第 3 步解成 `<`，产生错误结果。

**依赖**：无。

## 9. `scripts/lib/html.js` — 图片懒加载注入

**导出**：`{ hasAttr, getAttrMatch, processImgTag, lazyLoadHtml }`

| 函数            | 签名            | 说明                                                                            |
| --------------- | --------------- | ------------------------------------------------------------------------------- |
| `hasAttr`       | `(attrs, name)` | `new RegExp('\\b'+name+'(?:\\s*=\\s*\|\s\|\$)', 'i')`，兼容双引号/单引号/裸属性 |
| `getAttrMatch`  | `(attrs, name)` | 正则 `\b{name}\s*=\s*("[^"]*"\|'[^']*'\|[^\s>]+)`，返回**含等号与值的完整片段** |
| `processImgTag` | `(tag)`         | 处理单个完整 `<img ...>`                                                        |
| `lazyLoadHtml`  | `(html)`        | 对整段 HTML 做**引号感知**扫描                                                  |

**最终注入的三件套**：保留 `src`（保证 JS 未执行时图片也能显示）+ 增加 `data-src` + 增加 `loading="lazy"`。

> 冒烟测试断言了这三者同时存在：`data-src`、`loading="lazy"`、以及原始 `src`。
> 注释说明：**只加 `data-src` 而删掉 `src` 会让现代浏览器永远加载不出图片**。

**依赖**：无。

## 10. `scripts/lib/asset.js` — `asset_code` 支撑

**导出**：`{ NAMED_KEYS, POSITIONAL_KEYS, parseAssetCodeArgs, sliceLines, countLines, inferLang }`

常量：`NAMED_KEYS = ['lang','from','to']`、`POSITIONAL_KEYS = ['path','title']`

| 函数                 | 签名                  | 说明                                                                                                                                 |
| -------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `parseAssetCodeArgs` | `(args)`              | 默认 `{ path:'', title:'', lang:'', from:0, to:-1 }`。`from`/`to` 走 `parseInt(v,10) \|\| 0`。**位置参数超出两个后一律覆盖 `title`** |
| `sliceLines`         | `(content, from, to)` | 1-based 闭区间截行。`from > 0` → `start = from-1`；`to >= 0` → `end = to`；否则到末尾。最后 `.trim()`                                |
| `countLines`         | `(content)`           | `split('\n').length`。空串/`null` 返回 `1`。用于高亮器行号，**与 from/to 截取无关**                                                  |
| `inferLang`          | `(filePath)`          | `path.extname(...).replace(/^\./,'')`，无扩展名返回 `''`                                                                             |

内部辅助 `toStr(value)`（`undefined`/`null` → `''`）**未导出**。

**依赖**：`path`（Node 内置）。

## 11. 完整注册钩子清单

| 文件                  | 钩子类型           | 名称                                                                               | priority |
| --------------------- | ------------------ | ---------------------------------------------------------------------------------- | -------- |
| `config/index.js`     | `hexo.on`          | `ready`                                                                            | —        |
| `events/index.js`     | `hexo.on`          | `ready` / `generateBefore` / `generateAfter`                                       | —        |
| `filters/index.js`    | `extend.filter`    | `before_post_render`                                                               | 默认 10  |
| `filters/index.js`    | `extend.filter`    | `after_render:html`                                                                | 默认 10  |
| `filters/index.js`    | `extend.filter`    | `excerpt`                                                                          | 默认 10  |
| `generators/index.js` | `extend.generator` | `archive` / `categories` / `tags` / `search` / `search-page`                       | —        |
| `helpers/index.js`    | `extend.helper`    | `get_excerpt` / `get_reading_time` / `is_featured` / `get_categories` / `get_tags` | —        |
| `tags/index.js`       | `extend.tag`       | `note` / `alert` / `button` / `asset_code`                                         | —        |

**合计 16 个注册点。**

---

**上一篇**：[02 · 模板层](02-layout.md) ｜ **下一篇**：[04 · 前端脚本层](04-frontend.md)
