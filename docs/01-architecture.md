# 01 · 整体架构

## 1. 定位：主题 = 被站点调用的插件

Almagest 本身**不可运行**。Hexo 的目录约定是：

```
<站点根>/
├── _config.yml          # 站点配置（含 theme: almagest）
├── source/_posts/*.md   # 内容
├── themes/almagest/     # ← 主题必须装在这里
└── node_modules/        # Hexo 引擎 + 渲染器
```

`hexo generate` 做的事是：**读 `source/_posts/` 的文章 → 用 `themes/almagest/layout/` 的模板渲染 → 输出 `public/`**。

主题自己不提供入口脚本，所以：

- **不要**试图 `cd` 进主题目录跑 `hexo server`（主题没有 `package.json` 里的 hexo 字段，也没有 `source/_posts`）
- 要在本地看效果，必须另建站点（见 [08 · 运行方式](08-getting-started.md)）

## 2. 四层模型

主题的代码按「执行时机」和「职责」分成四层，**层与层之间的通信方式是架构的核心**：

```
┌─────────────────────────────────────────────────────────────────┐
│ ① 模板层  layout/**/*.ejs (30 文件)                              │
│    职责：把 Hexo 提供的数据渲染成 HTML                            │
│    输入：page / site / theme / config + 注册的 helper            │
│    输出：HTML 字符串                                             │
├─────────────────────────────────────────────────────────────────┤
│ ② 构建扩展层  scripts/**/*.js (10 文件)                          │
│    职责：向 Hexo 注册 filter / generator / helper / tag          │
│          —— 决定"有哪些页面、内容长什么样"                       │
│    子层：注册层（6 个 index.js） → lib 纯函数层（4 个文件）        │
├─────────────────────────────────────────────────────────────────┤
│ ③ 样式层  source/css/*.styl (13 文件)                            │
│    职责：编译成单个 main.css                                     │
│    双轨：Stylus 编译期变量 + CSS 运行期变量（明暗切换靠后者）      │
├─────────────────────────────────────────────────────────────────┤
│ ④ 前端运行层  source/js/*.js (5 文件)                            │
│    职责：浏览器里操作 DOM / Canvas，无构建步骤                    │
│    与 ①②③ 的唯一契约：DOM 选择器 + window.__almagest* 全局变量   │
└─────────────────────────────────────────────────────────────────┘
```

### 层间通信契约（最重要的一张表）

| 从 → 到 | 通信方式         | 具体载体                                                            |
| ------- | ---------------- | ------------------------------------------------------------------- |
| ② → ①   | Hexo helper      | `hexo.extend.helper.register(name, fn)`，模板里直接调用 `name(...)` |
| ② → ①   | generator 返回   | `{ path, layout, data }`，其中 `layout` 指定用哪个 EJS              |
| ② → ④   | 生成静态数据文件 | `search.json`（由 `scripts/generators` 产出，前端 `fetch`）         |
| ① → ④   | 注入全局变量     | `window.__almagestCopyText` / `__almagestSearchUrl` 等              |
| ① → ④   | 产出 DOM 节点    | `.starry-background` / `#search-form` / `.astronomy-calendar` …     |
| ③ → ①   | class / id 名    | 模板写类名，样式按类名命中                                          |
| ① → ③   | HTML 属性        | `data-theme`（明暗）、`data-src`（懒加载）                          |

> **排查静默失效的通用方法**：功能"不报错但也不工作"时，90% 是这条链上的名字没对上——
> 前端找 `.foo`，模板产出的是 `.bar`；或前端读 `window.__x`，模板从没注入过。
> 本主题有 3 处属于此类，见 [09 · 已知缺陷](09-known-issues.md)。

## 3. 构建期发生了什么

```
1. Hexo 启动
   └─ 递归加载 themes/almagest/scripts/**/*.js
      → 每个 index.js 直接执行，调用全局 hexo 对象注册钩子
      → scripts/config/index.js 在 ready 时同步 version 并校验配置

2. 渲染文章（每个 .md）
   ├─ before_post_render  filter  → 占位直通
   ├─ Markdown 解析（hexo-renderer-marked）
   ├─ excerpt             filter  → 生成摘要
   └─ after_render:html   filter  → 图片懒加载注入（src + data-src + loading="lazy"）

3. 生成页面（generator 依次执行）
   ├─ 主题自带：archive / categories / tags / search / search-page
   └─ 官方插件：hexo-generator-index / archive / category / tag

4. 模板渲染
   └─ 每个页面 → layout.ejs 外壳（<%- body %> 插槽）→ 输出 HTML

5. 编译样式
   └─ source/css/main.styl → public/css/main.css（单文件）

6. 复制静态资源
   └─ source/js/*.js → public/js/*.js（原样复制，不压缩不转译）
```

## 4. 目录职责

```
hexo-theme-almagest/
├── layout/                  模板层
│   ├── layout.ejs           全站唯一外壳（提供 body 插槽）
│   ├── index.ejs            首页
│   ├── post.ejs / page.ejs  文章页 / 独立页面
│   ├── archive.ejs          归档（同时兜住分类页与标签页）
│   ├── categories.ejs       分类总览
│   ├── tags.ejs             标签云总览
│   ├── search.ejs           搜索页
│   ├── 404.ejs             错误页
│   ├── wiki.ejs / topic.ejs / notebooks.ejs   三类内容聚合页
│   └── _partial/            18 个片段（14 个被引用，4 个孤儿）
├── scripts/                 Hexo 构建扩展层
│   ├── config/ events/ filters/ generators/ helpers/ tags/   注册层（6）
│   └── lib/                纯函数层（4）
├── source/
│   ├── css/                样式层（13 个 .styl → main.css）
│   └── js/                 前端运行层（5 个 .js）
├── languages/              多语言（en / zh-CN / zh-TW）
├── _config.yml             主题配置（312 行）
├── package.json            仅含 3 个 dependencies，无构建脚本
└── tests/
    ├── unit/               9 个 node:test 单测文件
    └── ci-smoke-test.sh    自建临时站点做真实构建冒烟
```

## 5. 关键设计决策（及代价）

### 5.1 注册层 / 纯函数层分离

`scripts/` 被拆成两半：

- **注册层**（`config/` `events/` `filters/` `generators/` `helpers/` `tags/` 各自的 `index.js`）
  只做一件事：把 lib 的纯函数桥接成 Hexo 扩展点。**全部依赖全局 `hexo` 对象。**
- **纯函数层**（`scripts/lib/`）
  不 require `hexo`、无副作用，因此可以被 `node --test` 直接单测。

**代价**：注册层的 `module.exports` 只为测试存在，Hexo 加载时会忽略它；读代码时容易被末尾的 `module.exports` 误导，以为它是普通模块。实际是「脚本 + 测试钩子」的双重身份。

### 5.2 双轨制配色（Stylus 编译期 + CSS 运行期）

样式层同时存在两套变量：

|          | 编译期（Stylus `$var`）          | 运行期（CSS `var(--x)`）                 |
| -------- | -------------------------------- | ---------------------------------------- |
| 定义位置 | `_variables.styl`                | `_theme-light.styl` / `_theme-dark.styl` |
| 生效方式 | 构建时替换为字面量               | 浏览器实时解析                           |
| 能用于   | 任何 Stylus 表达式 / 函数        | 仅 CSS 属性值                            |
| 谁在用   | 不易变的常量（间距、断点、阴影） | 需要随主题切换的值（颜色）               |

**代价**：改一个颜色常常要同时改两边，只改一边会出现「切了主题不变色」或「写了变量没生效」。详见 [05 · 样式体系](05-styles.md)。

### 5.3 明暗主题的双文件双写

`_theme-light.styl` 与 `_theme-dark.styl` 各 265 行 / 264 行，每份内部**把同一组变量写两遍**：

1. 选择器块：`[data-theme='light']`（亮色还多带一个 `:root` 作默认基线）
2. 媒体查询块：`@media (prefers-color-scheme: light) :root:not([data-theme])`
3. 组件覆盖块：只写 `[data-theme='…']`，不带媒体查询

**代价**：一组颜色改动要在 4 个地方同步（2 文件 × 2 处），漏改会有「系统暗色正常、手动切暗色不对」这类偏门 bug。

### 5.4 前端零构建

`source/js/` 的 5 个文件被原样复制到 `public/js/`，**不经过压缩、转译、打包**。

**好处**：改完刷新即生效，无构建等待。
**代价**：代码形态不统一——4 个 IIFE + 1 个全局脚本（`astronomy.js` 直接定义全局常量与 `window.Astronomy`），且互相之间没有统一契约（只有 2 个文件对外暴露 API）。

## 6. 扩展点速查

想加一个能力时，先确定它属于哪一层：

| 想做的事           | 该动哪层 | 具体位置                                                             |
| ------------------ | -------- | -------------------------------------------------------------------- |
| 新增一种页面类型   | ② + ①    | `scripts/generators/index.js` 注册 → 新建 `layout/<name>.ejs`        |
| 加工文章内容       | ②        | `scripts/filters/index.js` + `scripts/lib/` 加纯函数                 |
| 给模板暴露新数据   | ②        | `scripts/helpers/index.js` 注册 helper                               |
| 新增 markdown 语法 | ②        | `scripts/tags/index.js` 注册 tag                                     |
| 改页面结构         | ①        | `layout/` 对应 `.ejs`                                                |
| 改视觉             | ③        | 先看 `_variables.styl` 有没有对应 token，再改具体组件文件            |
| 加浏览器交互       | ④        | `source/js/` 新建文件 + 在 `_partial/scripts.ejs` 挂载（含配置开关） |

**跨层的改动一定同时涉及两边**，例如"加一个开关控制的交互功能"需要：`_config.yml` 加配置项 → `_partial/scripts.ejs` 加条件加载 → `source/js/` 写脚本 → 若涉及样式再改 ③。

---

**下一篇**：[02 · 模板层](02-layout.md)
