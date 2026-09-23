# 02 · 模板层（`layout/`）

30 个 EJS 文件 = **12 个页面级模板** + **18 个片段级 partial**（其中 4 个是孤儿）。

## 1. 完整文件清单

```
layout/
├── layout.ejs                 全站外壳：<html>/<head>/<body> 骨架 + body 插槽
│
├── 【页面级 · 12】
├── index.ejs                  首页：文章卡片列表 + 分页
├── post.ejs                   文章详情：标题 / 元信息 / TOC / 正文 / 评论
├── page.ejs                   独立页面：同 post 但去掉了分类标签区
├── archive.ejs                列表页（归档 / 分类 / 标签 三合一，按年份分组）
├── categories.ejs             分类总览：遍历 site.categories
├── tags.ejs                   标签总览：标签云（按文章数分 1~5 档）+ 全量列表
├── search.ejs                 搜索页：注入索引地址 + 结果容器
├── 404.ejs                    错误页：插画 + 返回/搜索按钮 + 菜单建议
├── wiki.ejs                   Wiki 文档页：左 wiki-nav + 正文 + 父子页导航
├── topic.ejs                  专题页：左 topic-nav + 系列文章有序列表
├── notebooks.ejs              笔记簿：左 notebooks-nav + 卡片网格
│
└── _partial/                  【片段级 · 18】
    ├── head.ejs               <head>：meta / 标题 / 字体 / 高亮样式 / inject.head
    ├── theme-init.ejs         防白闪的同步内联脚本（写 data-theme）
    ├── header.ejs             站点头部：Logo + 导航 + 搜索/主题/移动菜单按钮
    ├── footer.ejs             页脚：简介 + 社交图标 + 版权
    ├── breadcrumb.ejs         面包屑（按 page.type 分支）
    ├── sidebar.ejs            侧边栏：简介 / 最近 5 篇 / 分类 / 标签云
    ├── post-card.ejs          单张文章卡片
    ├── pagination.ejs         上一页 / 页码 / 下一页
    ├── comments.ejs           Giscus 评论区容器
    ├── search-box.ejs         搜索表单
    ├── scripts.ejs            全站脚本装载 + i18n 注入 + inject.body_end
    ├── wiki-nav.ejs           Wiki 左侧项目/页面树
    ├── topic-nav.ejs          专题左侧系列导航
    ├── notebooks-nav.ejs      笔记簿左侧分类导航
    │
    │   ── 以下 4 个当前【没有任何模板 include】（孤儿组件）──
    ├── astronomy-card.ejs     ★ 天文信息卡（constellation / event / celestial_body 三型）
    ├── astronomy-calendar.ejs ★ 天文事件日历（月历骨架 + 即将到来事件）
    ├── observation-guide.ejs  ★ 观星指南
    └── constellation-nav.ejs  ★ 十二星座导航（硬编码数组）
```

## 2. 模板继承：只有一个插槽

`layout.ejs` 是**全站唯一外壳**，它提供且仅提供**一个具名插槽** `body`：

```ejs
<article class="article-container">
  <%- body %>       <!-- ← 页面级模板的渲染结果注入此处 -->
</article>
```

其余区域全部由固定 partial 组成，顺序为：

```
<head>  →  head.ejs, theme-init.ejs
<body>
  .starry-background          ← features.starfield !== false 时输出
  #app
    header.ejs
    main > .container
      breadcrumb.ejs
      .content-wrapper(.index | .content.with-sidebar | .no-sidebar)
        sidebar.ejs          ← 仅当 sidebar.position === 'left'
        article > <%- body %>   ← 页面级内容
        sidebar.ejs          ← 仅当 sidebar.position === 'right'
    footer.ejs
    #back-to-top             ← features.back_to_top 时输出
  scripts.ejs
```

`layout.ejs` 开头做三件预处理：

```ejs
const config = theme;        // ① 把 config 指向【主题配置】，遮蔽站点配置
const page_type = ['post','page'].includes(page.layout) ? 'content' : 'index';  // ②
const sidebar_enabled = ...  // ③ 决定 .with-sidebar / .no-sidebar 与 data-theme
```

### ⚠️ 陷阱 ①：`config` 被遮蔽

几乎所有模板首行都写 `const config = theme;`。这意味着：

- 在模板内 `config.xxx` 一律指**主题配置**
- 站点配置的 `config.url` / `config.root` / `config.permalink` 全部变成 `undefined`

**这是本主题 2 处真实缺陷的根因**（`*-nav.ejs` 里用 `config.url` / `config.root` 拼路径），见 [09 · 已知缺陷](09-known-issues.md#1-config-被遮蔽导致导航-active-态永不生效)。

要访问站点配置请用 `site.config` 或用未遮蔽的原始变量。

### ⚠️ 陷阱 ②：`layout: layout` front-matter 的不对称

12 个页面级模板中，**8 个显式写了 `--- layout: layout ---`**（archive / categories / tags / search / 404 / wiki / topic / notebooks），而 **`index.ejs` / `post.ejs` / `page.ejs` 没有写**。

这**不影响功能**——Hexo 的 layout 机制会自动回退到 `layout.ejs` 包裹。CI 冒烟测试断言 `public/index.html` 含 `<script src`（该字符串只存在于 `layout.ejs → scripts.ejs`），证明无 front-matter 的模板同样被外壳包裹。

显式写出属**冗余但无害**的文档性写法。若要统一，两个方向都可以。

## 3. 页面级模板详表

| 模板             | 触发来源                                                    | 说明                                       |
| ---------------- | ----------------------------------------------------------- | ------------------------------------------ |
| `index.ejs`      | `hexo-generator-index`                                      | 首页文章列表                               |
| `post.ejs`       | Hexo 核心 post 路由                                         | 文章详情                                   |
| `page.ejs`       | Hexo 核心 page 路由                                         | 独立页面                                   |
| `archive.ejs`    | `hexo-generator-archive`（layout 链 `['archive','index']`） | **同时兜住分类页与标签页**                 |
| `categories.ejs` | 主题 generator `categories` / `hexo-generator-category`     | 分类总览                                   |
| `tags.ejs`       | 主题 generator `tags` / `hexo-generator-tag`                | 标签总览                                   |
| `search.ejs`     | 主题 generator `search-page`                                | `/search/`                                 |
| `404.ejs`        | 需外部 404 插件或手写 `layout: 404`                         | 无内置 generator                           |
| `wiki.ejs`       | 用户页面 `layout: wiki`                                     | 需 `page.children` / `page.parent`         |
| `topic.ejs`      | 用户页面 `layout: topic`                                    | 需 `page.articles` / `page.related_topics` |
| `notebooks.ejs`  | 用户页面 `layout: notebooks`                                | 需 `page.notebooks`                        |

### `archive.ejs` 的三合一设计

主题**故意不提供 `category.ejs` / `tag.ejs`**。原因是 Hexo generator 的 layout 回退链是：

```
hexo-generator-category → layout: ['category', 'archive', 'index']
hexo-generator-tag      → layout: ['tag',      'archive', 'index']
```

两者必然回落到 `archive.ejs`。于是该模板用 `page.category` / `page.tag` 是否存在来切换标题与副标题：

```ejs
<%= page.category ? __('categories_desc') : (page.tag ? __('tags_desc') : __('archive_description')) %>
```

**这是一个值得保留的设计**——避免了把年份分组逻辑复制三份。但它也带来一个约束：**新增分类/标签专属布局时，不要另建 `category.ejs`，而应在 `archive.ejs` 内分支**，否则会破坏这个收敛。

## 4. include 依赖图

```
layout.ejs
├── _partial/head
├── _partial/theme-init
├── _partial/header
├── _partial/breadcrumb
├── _partial/sidebar            (position = left 或 right，二选一)
├── _partial/footer
└── _partial/scripts

index.ejs      ──► _partial/post-card (传 { post })  ──► _partial/pagination
post.ejs       ──► _partial/comments
page.ejs       ──► _partial/comments
search.ejs     ──► _partial/search-box
wiki.ejs       ──► _partial/wiki-nav
topic.ejs      ──► _partial/topic-nav
notebooks.ejs  ──► _partial/notebooks-nav

archive.ejs    ──► （无 partial，全部手写）
categories.ejs ──► （无 partial）
tags.ejs       ──► （无 partial）
404.ejs        ──► （无 partial）

[孤儿]  astronomy-card / astronomy-calendar / observation-guide / constellation-nav
```

**注意列表渲染有两套并存**：`post-card.ejs` 是卡片式（首页用），`archive.ejs` 自己手写了 `.archive-item` 行式列表；`sidebar.ejs` 也自己手写了分类/标签云，**没有复用** `categories.ejs` / `tags.ejs` 的逻辑。改列表样式时要注意改的是哪一套。

## 5. 关键模板的变量与 helper

### `index.ejs`

- 变量：`page.posts`（Hexo Query）、`page.total`、`config.title` / `config.subtitle`
- 分支：`page.posts && page.posts.length > 0` → 遍历；否则渲染 `.no-posts`
- `page.total > 1` 时才 include 分页
- **不直接调用任何自定义 helper**（摘要与阅读时间由 `post-card.ejs` 调用）
- ⚠️ 第 4 行 `const per_page = config.pagination?.per_page || 10;` 是**死变量**——计算后从未使用。真实每页条数由站点 `per_page` / `index_generator.per_page` 决定

### `post.ejs`

- 变量：`page.title` / `page.date` / `page.updated` / `page.categories` / `page.tags` / `page.content` / `page.toc`
- helper：`get_reading_time(page.content)`、`toc(page.content, { list_number: false })`、`date()`、`date_xml()`、`url_for()`
- 分支：`features.reading_time` / `features.toc && page.toc` / `features.comments` / `article.show_updated` / `page.categories.length` / `page.tags.length`

### `_partial/head.ejs`

- 局部函数 `asset(path)` = `url_for(cdn_prefix + path + '?v=' + version)`
- 输出：`<title>`、meta description / keywords / author / theme-color、favicon、Google Fonts（受 `fonts.google_fonts !== false`）、highlight.js **样式表**、`main.css`、图片占位色 CSS 变量、`inject.head`
- 分支：`page.title` / `page.tags.length` / `code_highlight.enable !== false` / `fonts.google_fonts !== false` / `inject.head`
- ⚠️ 只引高亮**样式表**，**运行库在 `scripts.ejs`**（注释专门强调了 CDN 选型坑）

### `_partial/scripts.ejs`

- 注入全局变量：
  ```js
  window.__almagestCopyText = __('copy_code');
  window.__almagestCopiedText = __('code_copied');
  window.__almagestCopyFailedText = __('copy_failed');
  ```
- 脚本加载与条件：

  | 脚本                           | 条件                              |
  | ------------------------------ | --------------------------------- |
  | `js/theme.js`                  | 无条件                            |
  | `js/search.js`                 | `features.search`                 |
  | `js/lazy-load.js`              | `image.lazy_load`                 |
  | `js/code-copy.js`              | `features.code_copy`              |
  | highlight.js 运行库 + 内联高亮 | `code_highlight.enable !== false` |
  | `js/astronomy.js`              | `features.starfield !== false`    |
  | `inject.body_end`              | 非空时                            |

- 全部 `<script src>` 带 `defer`
- **高亮降级链**：head 引样式 → 此处引运行库 → 内联脚本在 `DOMContentLoaded` 里 `querySelectorAll('pre code')`，跳过 `dataset.highlighted === 'yes'`，`window.hljs === undefined` 时静默 return（离线可用）

## 6. 条件渲染的配置开关全表

### `features.*` 开关

| 配置项                  | 默认   | 控制什么                                                            | 出现位置                                                     |
| ----------------------- | ------ | ------------------------------------------------------------------- | ------------------------------------------------------------ |
| `features.search`       | `true` | 搜索按钮 / `/search/` 页 / `search.json` / `search.js`              | `header.ejs`、`404.ejs`、`scripts.ejs`、`scripts/generators` |
| `features.comments`     | `true` | 是否渲染评论区                                                      | `post.ejs`、`page.ejs`                                       |
| `features.toc`          | `true` | 目录（同时要求 `page.toc`，**需文章 front-matter 写 `toc: true`**） | `post.ejs`、`page.ejs`                                       |
| `features.code_copy`    | `true` | 加载 `code-copy.js`                                                 | `scripts.ejs`                                                |
| `features.back_to_top`  | `true` | 输出 `#back-to-top` 按钮                                            | `layout.ejs`                                                 |
| `features.reading_time` | `true` | 阅读时间显示                                                        | `post.ejs`、`post-card.ejs`                                  |
| `features.show_excerpt` | `true` | 卡片摘要（判定用 `!== false`）                                      | `post-card.ejs`                                              |
| `features.starfield`    | `true` | 星空节点 + `astronomy.js`（判定用 `!== false`）                     | `layout.ejs`、`scripts.ejs`                                  |

> **判定风格不统一**：`search/comments/toc/code_copy/reading_time` 用**真值判断**（写 `false` 关闭），
> `show_excerpt/starfield` 用 **`!== false` 空值判断**（不写即开，显式 `false` 才关）。
> 新增开关时建议统一，避免用户误解「不写就不开」。

### 其余配置项

| 配置路径                                    | 控制什么                                       | 出现位置                                      |
| ------------------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| `sidebar.enable` / `sidebar.position`       | 侧边栏开关与左右位置                           | `layout.ejs`                                  |
| `style.prefers_theme`                       | `auto` 时输出空 `data-theme`，交由内联脚本决定 | `layout.ejs`                                  |
| `style.primary_color`                       | `<meta name="theme-color">`                    | `head.ejs`                                    |
| `style.code_theme` / `code_highlight.theme` | 高亮样式主题（前者优先）                       | `head.ejs`                                    |
| `code_highlight.enable` / `.cdn`            | 高亮样式表 + 运行库                            | `head.ejs`、`scripts.ejs`                     |
| `fonts.google_fonts` / `.google_fonts_url`  | 字体加载                                       | `head.ejs`                                    |
| `image.lazy_load` / `.placeholder_color`    | 懒加载脚本 / 占位色                            | `scripts.ejs`、`head.ejs`                     |
| `pagination.per_page` / `.type`             | 分页（模板内的计算未被使用）                   | `index.ejs`                                   |
| `article.excerpt_length` / `.show_updated`  | 摘要长度 / 更新时间                            | `post-card.ejs`、`post.ejs`                   |
| `page.show_updated`                         | 独立页更新时间                                 | `page.ejs`                                    |
| `date_format`                               | 日期格式（兜底 `YYYY-MM-DD`）                  | `post/page/archive/tags/categories/post-card` |
| `menu`                                      | 桌面 + 移动导航                                | `header.ejs`、`404.ejs`                       |
| `social.*`                                  | 页脚社交图标（空串则不显示）                   | `footer.ejs`                                  |
| `services.giscus.*`                         | 评论（`enable` + 11 个 data-* 参数）           | `comments.ejs`                                |
| `cdn_prefix` / `version`                    | 资源前缀与缓存版本号                           | `head.ejs`、`scripts.ejs`                     |
| `inject.head` / `inject.body_end`           | 自定义注入                                     | `head.ejs`、`scripts.ejs`                     |
| `astronomy.events`                          | 日历「即将到来事件」（前 5 条）                | `astronomy-calendar.ejs`                      |
| `wiki.projects` / `wiki.edit_url`           | Wiki 侧栏                                      | `wiki-nav.ejs`                                |
| `topics` / `topics_archive_url`             | 专题侧栏                                       | `topic-nav.ejs`                               |
| `notebooks.categories`                      | 笔记簿侧栏                                     | `notebooks-nav.ejs`                           |

> ⚠️ `_config.yml` 里**没有** `astronomy` / `wiki` / `topic(s)` / `notebooks` 这几个分组，
> 但 `scripts/lib/config.js` 的白名单承认它们。要用这些功能需自行在站点 `_config.yml` 的
> `theme_config:` 下定义。

## 7. 天文组件模板（4 个孤儿）

| 文件                     | 渲染什么                                                                                 | 数据来源                        | 被谁 include |
| ------------------------ | ---------------------------------------------------------------------------------------- | ------------------------------- | ------------ |
| `astronomy-card.ejs`     | 单张天文卡，按 `card.type` 分四支（`constellation` / `event` / `celestial_body` / 默认） | 仅局部变量 `card`（调用方传入） | **无**       |
| `astronomy-calendar.ejs` | 月历骨架（表头 + 空 grid）+ 即将到来事件列表                                             | `config.astronomy.events`       | **无**       |
| `observation-guide.ejs`  | 观星指南（位置 / 可见星座 / 最佳时间 / 建议 / 设备 / 天气 / 光污染 / 相关文章）          | 纯 `page.*` 前置字段            | **无**       |
| `constellation-nav.ejs`  | 十二星座导航（12 项硬编码 + i18n 名称）                                                  | 代码内硬编码                    | **无**       |

**它们当前无法通过配置启用**——`features.starfield` 只控制 `.starry-background` 节点与 `astronomy.js`，不影响这 4 个模板。

要用它们必须在自己的页面里显式 include：

```ejs
<%- partial('_partial/astronomy-card', { card: { type: 'event', title: '...', ... } }) %>
```

**注意**：对应的运行时行为（`initAstronomyCards` / `initConstellationNav` / `initCalendar`）在 `astronomy.js` 里都实现了并且会执行（只要 `features.starfield !== false`）。但**日历的事件数据未接入**——`hasEvent()` 恒返回 `false`，详见 [09 · 已知缺陷](09-known-issues.md)。

## 8. 两个特殊机制

### `theme-init.ejs` — 防白闪（FOUC）

在 `<head>` 中的**同步内联脚本**（无 `src`、无 `defer`），在首帧渲染前把 `data-theme` 写到 `<html>`：

```js
(function () {
  var STORAGE_KEY = 'theme-preference';
  var saved = null;
  try {
    saved = localStorage.getItem(STORAGE_KEY);
  } catch (e) {} // 隐私模式会抛错
  var theme = saved;
  if (theme !== 'light' && theme !== 'dark') {
    theme = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', theme);
})();
```

**两级策略**：服务端只在 `style.prefers_theme !== 'auto'` 时输出 `data-theme`；`auto` 时输出空，由这段脚本按 `localStorage → prefers-color-scheme` 决定。**最终以 localStorage / 系统为准**，服务端属性会被脚本覆盖。

### `_partial/breadcrumb.ejs` — 可能永不显示

它的分支全部基于 `page.type`（`post` / `page` / `archive` / `category` / `tag`），但：

- 主题自带的 `scripts/generators/index.js` **只注入 `layout` 与 `data`，不注入 `type`**
- `page.type` 是否存在取决于官方 `hexo-generator-archive / category / tag` 是否装了

这些官方 generator 未启用时，`breadcrumbs.length` 恒为 1，`<% if (breadcrumbs.length > 1) %>` 不成立 → **整个面包屑不输出**。

---

**上一篇**：[01 · 整体架构](01-architecture.md) ｜ **下一篇**：[03 · Hexo 脚本层](03-scripts.md)
