# 07 · 依赖关系

## 1. npm 依赖（`package.json`）

### 运行时依赖（`dependencies`，仅 3 个）

| 包                     | 版本     | 被谁使用                | 用途                                           |
| ---------------------- | -------- | ----------------------- | ---------------------------------------------- |
| `hexo-renderer-ejs`    | —        | Hexo                    | 渲染 `layout/**/*.ejs`                         |
| `hexo-renderer-stylus` | —        | Hexo                    | 编译 `source/css/*.styl`                       |
| `hexo-util`            | `^4.0.0` | `scripts/tags/index.js` | 生成 `asset_code` 的 caption 链接（`url_for`） |

### 开发依赖（`devDependencies`）

| 包                                                             | 用途                                                              |
| -------------------------------------------------------------- | ----------------------------------------------------------------- |
| `eslint` / `@eslint/js` / `eslint-config-prettier` / `globals` | JS 代码检查                                                       |
| `stylelint` / `stylelint-config-standard` / `postcss-styl`     | Stylus 检查（`postcss-styl` 是 stylelint 读 Stylus 的自定义语法） |
| `prettier`                                                     | 格式化                                                            |
| `husky` / `lint-staged`                                        | Git 钩子，提交前自动检查                                          |

### 环境要求

| 项      | 要求                                                                                |
| ------- | ----------------------------------------------------------------------------------- |
| Node.js | `>= 18.0.0`                                                                         |
| Hexo    | `>= 6.0.0`（`asset_code` 标签需 **`>= 7`** 才有原生高亮，否则降级为 `<pre><code>`） |

## 2. `scripts/` 内部依赖矩阵

**方向严格单向**：注册层 → lib 层；lib 层内部**零互相依赖**。

| 文件                          | require 的内部模块                    | require 的外部包          |
| ----------------------------- | ------------------------------------- | ------------------------- |
| `scripts/config/index.js`     | `../lib/config`、`../../package.json` | —                         |
| `scripts/events/index.js`     | —                                     | —                         |
| `scripts/filters/index.js`    | `../lib/html`、`../lib/text`          | —                         |
| `scripts/generators/index.js` | `../lib/text`                         | —                         |
| `scripts/helpers/index.js`    | `../lib/text`                         | —                         |
| `scripts/tags/index.js`       | `../lib/text`、`../lib/asset`         | `path`、`fs`、`hexo-util` |
| `scripts/lib/config.js`       | —                                     | —                         |
| `scripts/lib/text.js`         | —                                     | —                         |
| `scripts/lib/html.js`         | —                                     | —                         |
| `scripts/lib/asset.js`        | —                                     | `path`                    |

### 依赖图

```
                  ┌────────────────┐
                  │  lib/config.js │  (零依赖)
                  └───────┬────────┘
                          │
   ┌──────────────────────┴───────────┐
   │                                  │
┌──▼──────────────┐          ┌────────▼─────────┐
│ config/index.js │          │ (config 校验打印) │
└─────────────────┘          └──────────────────┘

  ┌────────────────┐   ┌───────────────┐
  │  lib/text.js   │   │ lib/html.js   │  (零依赖)
  │  (零依赖)       │   └───────┬───────┘
  └───┬────┬───┬───┘           │
      │    │   │               │
      │    │   └───────────────┼──────────► filters/index.js
      │    └───────────────────┼──────────► generators/index.js
      └────────────────────────┼──────────► helpers/index.js
                               └──────────► tags/index.js
  ┌────────────────┐
  │  lib/asset.js  │ ─────────────────────► tags/index.js
  └────────────────┘

  events/index.js  ← 零依赖（只调 console.log）
```

**lib 层的 4 个文件互不 require**，这是它能被单独单测的前提（`tests/unit/lib.test.js`）。

## 3. 构建期数据流依赖

```
source/_posts/*.md
   │
   │ ① before_post_render filter（占位直通）
   ▼
Markdown 渲染（hexo-renderer-marked）
   │
   ├─ ② excerpt filter ──────────────► page.excerpt
   │                                     │
   │                                     └─► helpers.get_excerpt → post-card.ejs
   │
   ├─ ③ after_render:html filter ────► HTML 注入 data-src / loading="lazy"
   │      (lib/html.lazyLoadHtml)
   │
   ▼
page.content
   │
   ├─► 模板渲染（layout/*.ejs）
   │      └─► 产出 public/**/*.html
   │
   └─► search generator（lib/text.toIndexText）
          └─► 产出 public/search.json
                 │
                 └─► 前端 search.js fetch 后建倒排索引
```

**关键依赖点**：`after_render:html` 选择在**渲染层**注入懒加载，而不是 `after_post_render`——
后者的产物是 `post.content`，会被 `search.json` 与 RSS 消费，注入 `data-src` 会污染下游数据。
冒烟测试专门断言了这一点：

```bash
grep -q 'data-src' public/search.json    # 若命中则 FAIL：post.content 被污染
grep -q '<img'     public/search.json    # 若命中则 FAIL：索引未剥离标签
```

## 4. 前端全局变量契约

前端 5 个脚本通过 `window.__almagest*` 变量与模板通信（详见 [04 · 前端脚本层](04-frontend.md#6-全局变量契约汇总)）：

| 注入方                 | 变量                                                      | 消费方                         |
| ---------------------- | --------------------------------------------------------- | ------------------------------ |
| `_partial/scripts.ejs` | `__almagestCopyText` / `CopiedText` / `CopyFailedText`    | `code-copy.js`                 |
| `layout/search.ejs`    | `__almagestSearchUrl` / `SearchEmpty` / `SearchNoResults` | `search.js`                    |
| **（无人注入）**       | `__almagestNoEventsText`                                  | `astronomy.js`（恒走英文兜底） |

## 5. 前端 Web API 依赖与降级

| 脚本                     | 依赖的 Web API                                     | 缺失时的降级                                               |
| ------------------------ | -------------------------------------------------- | ---------------------------------------------------------- |
| `code-copy.js`           | `navigator.clipboard.writeText`                    | 回退 `document.execCommand('copy')` → 再失败则显示失败文案 |
| `lazy-load.js`           | `IntersectionObserver`                             | 全量加载所有图片                                           |
| `lazy-load.js`           | `HTMLImageElement.prototype.loading`（原生懒加载） | 使用 IO 或全量加载                                         |
| `search.js`              | `fetch`                                            | 置空数据集（搜索无结果但不报错）                           |
| `theme.js`               | `localStorage`                                     | `try/catch` 静默失败（不持久化）                           |
| `theme.js`               | `matchMedia`                                       | `getSystemPreference()` 返回 `null`                        |
| `astronomy.js`           | `requestAnimationFrame` / Canvas 2D                | canvas 创建失败即 return                                   |
| `astronomy.js`           | `matchMedia('(prefers-reduced-motion: reduce)')`   | 照常播放动画                                               |
| `astronomy.js`           | `performance.now()`                                | 必需，无降级                                               |
| `theme-init.ejs`（内联） | `localStorage` + `matchMedia`                      | 回退 `light`                                               |

## 6. 外部 CDN 依赖

| 资源                | 地址                                                           | 受控于                                      | 可替换                   |
| ------------------- | -------------------------------------------------------------- | ------------------------------------------- | ------------------------ |
| highlight.js 运行库 | `https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.12.0` | `code_highlight.cdn`                        | ✅ 可换国内镜像          |
| highlight.js 样式表 | 同上 + `/styles/<theme>.min.css`                               | `code_highlight.theme` / `style.code_theme` | ✅                       |
| Google Fonts        | `fonts.googleapis.com/css2?...`                                | `fonts.google_fonts_url`                    | ✅ 可换 `fonts.loli.net` |
| Giscus              | `giscus.app`                                                   | `services.giscus.enable`                    | ❌ 不可换（服务本身）    |

**离线场景**：关闭 `code_highlight.enable` 与 `fonts.google_fonts`，主题可完全离线运行——
但代码块会失去语法着色（`scripts.ejs` 的内联脚本在 `window.hljs === undefined` 时静默返回，
保留可读纯文本）。

## 7. 加载顺序依赖

### CSS：`main.styl` 的 import 顺序就是层叠顺序

关键约束见 [05 · 样式体系](05-styles.md#2-mainstyl-的-import-顺序决定层叠)，最重要的一条：

> `_responsive.styl` 在 `_layout.styl` **之后**，所以 `.sidebar` 的 `display: none` 由 `_responsive` 说了算，
> **`_layout.styl` 里故意不设 `display`**。

### JS：全部 `defer`，按文档顺序执行

`_partial/scripts.ejs` 中的顺序：

```
theme.js  →  search.js  →  lazy-load.js  →  code-copy.js  →  (hljs 运行库 + 内联高亮)  →  astronomy.js
```

由于都用 `defer`，执行时机在 **DOM 解析完成后、`DOMContentLoaded` 之前**，按出现顺序依次执行。
而 `code-copy.js` / `lazy-load.js` / `theme.js` 内部又各自判断 `document.readyState === 'loading'`，
是**双重保险**。

> ⚠️ `search.js` **没有**做 readyState 判断（只监听 `DOMContentLoaded`）。由于它也是 `defer` 加载，
> 正常情况下 `readyState` 已是 `interactive`，`DOMContentLoaded` 可能**已经派发过**，理论上存在
> 初始化不执行的风险。其余 4 个脚本都有兜底，建议统一。

### 渲染顺序：`theme-init.ejs` 必须在 CSS 之前

它是 `<head>` 里的**同步内联脚本**（无 `src` / `defer` / `async`），目的是在首帧渲染前写入
`data-theme`，避免白闪。**不要给它加 `defer`。**

## 8. 循环依赖与耦合检查

| 检查项                          | 结果                                                                           |
| ------------------------------- | ------------------------------------------------------------------------------ |
| `scripts/` 内部循环依赖         | **无**（严格单向，lib 层零互依赖）                                             |
| `scripts/` 与 `layout/` 耦合    | 通过 helper 名 / generator 的 `layout` 字段解耦，**无直接 require**            |
| `scripts/` 与 `source/js/` 耦合 | 通过 `search.json` 文件解耦，**无代码依赖**                                    |
| `layout/` 与 `source/js/` 耦合  | 通过 DOM 选择器 + `window.__almagest*`，属**字符串级隐式耦合**（无法静态校验） |
| `source/css/` 与 `layout/` 耦合 | 通过 class / id 名，同属字符串级隐式耦合                                       |
| 前端脚本之间的耦合              | `theme.js` 派发 `themechange` 事件供外部订阅；其余 4 个**互不调用**            |

> **隐式耦合是本主题最容易出问题的地方**：改动模板的 class 名或删掉某个 partial 时，
> 编译期不会报错、运行时也不一定报错（只是功能静默失效）。
> 目前唯一的防线是 `tests/smoke.sh` 的产物断言，覆盖面有限。
> 建议改进方向：加断言校验「前端脚本依赖的选择器在产物中存在」。

---

**上一篇**：[06 · 配置与多语言](06-config-i18n.md) ｜ **下一篇**：[08 · 运行方式](08-getting-started.md)
