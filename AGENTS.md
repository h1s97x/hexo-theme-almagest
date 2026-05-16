# Hexo Theme Almagest - 项目规范

## 项目概述

Hexo Theme Almagest 是一个优雅的星空风格 Hexo 博客主题，灵感来自 Stellar 主题。支持深色/浅色主题切换，专为天文爱好者和技术博主设计。

## 技术栈

- **框架**: Hexo >= 6.0.0
- **模板引擎**: EJS
- **样式预处理**: Stylus
- **Node.js**: >= 18.0.0
- **包管理器**: pnpm

## 目录结构

````
hexo-theme-almagest/
├── .github/
│   └── workflows/          # CI/CD 工作流
│       ├── pr-check.yml     # PR 检查
│       └── release.yml      # 发布流程
├── layout/                 # EJS 模板文件
│   ├── layout.ejs          # 主布局
│   ├── index.ejs           # 首页
│   ├── post.ejs            # 文章页
│   ├── page.ejs            # 页面
│   ├── archive.ejs         # 归档页
│   ├── categories.ejs      # 分类页
│   ├── tags.ejs            # 标签页
│   ├── about.ejs           # 关于页
│   ├── links.ejs           # 友链页
│   ├── 404.ejs             # 404 页
│   └── _partial/            # 组件目录
│       ├── head.ejs        # 头部资源
│       ├── header.ejs      # 头部导航
│       ├── footer.ejs      # 页脚
│       ├── sidebar.ejs      # 侧边栏
│       ├── toc.ejs         # 文章目录
│       ├── post-nav.ejs    # 文章导航
│       ├── post-card.ejs   # 文章卡片
│       ├── copyright.ejs   # 版权声明
│       ├── scripts.ejs      # 脚本引入
│       └── ...
├── source/
│   ├── css/                # 样式文件
│   │   ├── main.styl       # 入口文件
│   │   ├── _variables.styl # 变量
│   │   ├── _mixins.styl    # 混入
│   │   ├── _base.styl      # 基础样式
│   │   ├── _layout.styl    # 布局样式
│   │   ├── _components.styl     # 组件样式
│   │   ├── _components-extra.styl # 扩展组件
│   │   ├── _responsive.styl      # 响应式
│   │   ├── _theme-light.styl     # 亮色主题
│   │   ├── _theme-dark.styl      # 暗色主题
│   │   ├── _code-highlight.styl  # 代码高亮
│   │   └── _astronomy.styl       # 星空效果
│   └── js/                 # JavaScript 文件
│       ├── theme.js        # 主题切换
│       ├── search.js       # 搜索功能
│       ├── code-copy.js    # 代码复制
│       ├── code-features.js # 代码块高级功能
│       ├── lazy-load.js    # 图片懒加载
│       ├── medium-zoom.js  # 图片灯箱
│       ├── typing.js      # 打字机效果
│       ├── scroll-animation.js # 滚动动画
│       ├── toc.js          # 目录功能
│       ├── astronomy.js    # 星空动画
│       ├── random-banner.js # 随机 Banner
│       └── utils.js        # 工具函数
├── scripts/                # Hexo 脚本
│   ├── index.js           # 入口
│   ├── events.js          # 事件处理
│   ├── generators.js      # 生成器
│   ├── helpers.js         # 辅助函数
│   ├── filters.js         # 过滤器
│   ├── tags.js            # 自定义标签
│   ├── math-helper.js     # 数学公式
│   ├── stylus-inject.js   # Stylus 变量注入
│   └── random-banner.js   # 随机 Banner
├── languages/             # 多语言文件
│   ├── zh-CN.yml
│   ├── en.yml
│   └── zh-TW.yml
├── _config.yml            # 主题配置
├── package.json
├── README.md              # 用户文档
├── AGENTS.md              # 开发规范
├── CHANGELOG.md          # 更新日志
├── LICENSE
└── .stylelintrc.json     # Stylelint 配置

## 关键入口 / 核心模块

### 模板入口

- `layout/layout.ejs`: 主布局文件，所有页面都继承此布局
- `layout/post.ejs`: 文章详情页，包含目录、导航等功能

### 脚本入口

- `scripts/index.js`: 注册所有主题脚本
- `scripts/helpers.js`: 模板辅助函数（时间格式化、阅读时间等）
- `scripts/tags.js`: 自定义标签（note、timeline、folding 等）
- `scripts/math-helper.js`: 数学公式辅助函数

### 样式入口

- `source/css/main.styl`: 样式入口，导入所有样式文件

## 运行与预览

### 本地预览

1. 在 Hexo 站点根目录安装主题：

   ```bash
   cd your-hexo-site
   git clone https://github.com/your-username/hexo-theme-almagest.git themes/almagest
````

2. 修改站点 `_config.yml`：

   ```yaml
   theme: almagest
   ```

3. 启动开发服务器：
   ```bash
   hexo server
   ```

### 样式开发

```bash
# 安装依赖
pnpm install

# 检查代码规范
pnpm lint

# 修复代码规范问题
pnpm lint:fix

# 样式检查
pnpm style:lint

# 格式化代码
pnpm format
```

## 配置说明

### 主题配置 (`_config.yml`)

主要配置项：

- `dark_mode`: 暗色模式配置 (enable, default: auto/light/dark)
- `static_prefix`: CDN 资源前缀配置
- `color`: 颜色配置（亮色/暗色双主题）
- `font`: 字体配置 (font_size, font_family, code_font_size)
- `navbar`: 导航栏配置 (ground_glass 毛玻璃效果)
- `index`: 首页配置 (banner_img, random_img, slogan 打字机)
- `article`: 文章配置 (reading_time, copyright, toc)
- `features`: 功能开关
  - `search`: 搜索功能
  - `toc`: 文章目录 (scroll_follow 跟随滚动, expand 展开折叠)
  - `code_copy`: 代码复制
  - `code_highlight`: 代码高亮 (行高亮, 折叠)
  - `back_to_top`: 返回顶部
  - `lazy_load`: 图片懒加载
  - `reading_mode`: 阅读模式
  - `pjax`: 无刷新导航
  - `pjax_loading`: NProgress 加载进度条
  - `scroll_animation`: 滚动动画
- `image`: 图片配置（lazy_load, lightbox, loading_img）
- `search`: 搜索配置 (path, field, content)
- `open_graph`: Open Graph SEO 配置
- `code`: 代码块配置 (highlight_line, collapse)

### 文章 Front Matter

```yaml
---
title: 文章标题
date: 2024-01-01
categories: [分类]
tags: [标签]
cover: /images/cover.jpg
excerpt: 摘要
---
```

## 自定义标签

| 标签             | 用途     | 示例                                     |
| ---------------- | -------- | ---------------------------------------- |
| `{% note %}`     | 提示框   | `{% note default %}内容{% endnote %}`    |
| `{% timeline %}` | 时间线   | `{% timeline %}...{% endtimeline %}`     |
| `{% folding %}`  | 折叠块   | `{% folding 标题 %}内容{% endfolding %}` |
| `{% link %}`     | 链接卡片 | `{% link url 标题 描述 %}`               |
| `{% tabs %}`     | 选项卡   | `{% tabs %}...{% endtabs %}`             |
| `{% label %}`    | 标签徽章 | `{% label text primary %}`               |
| `{% video %}`    | 视频     | `{% video url %}`                        |
| `{% audio %}`    | 音频     | `{% audio url %}`                        |
| `{% gallery %}`  | 图片画廊 | `{% gallery %}![](url){% endgallery %}`  |

## 开发规范与 Git 工作流

### Git 分支策略

所有开发必须遵循分支工作流，**禁止直接推送到 main 分支或强制推送**。

```
main (保护分支)
  ↑
  ├── feat/homepage-banner    # 新功能
  ├── feat/typing-effect      # 新功能
  ├── fix/sidebar-duplicate   # Bug 修复
  ├── refactor/nav-styles     # 重构
  └── docs/readme-update      # 文档
```

#### 分支命名规范

- 新功能：`feat/功能描述`（如 `feat/homepage-banner`）
- Bug 修复：`fix/问题描述`（如 `fix/pjax-loading`）
- 重构：`refactor/重构内容`（如 `refactor/css-variables`）
- 文档：`docs/文档内容`（如 `docs/readme-update`）
- 样式：`style/样式内容`（如 `style/dark-mode-colors`）

#### 开发流程

1. **创建分支**：`git checkout -b feat/xxx`
2. **开发功能**：按规范编写代码，确保有注释
3. **本地验证**：运行 `pnpm lint`、`pnpm style:lint`
4. **提交代码**：遵循 Conventional Commits 规范
   - `feat: 新增首页 Banner`
   - `fix: 修复 Pjax loading 不隐藏`
   - `refactor: 重构导航栏样式`
5. **推送到远程**：`git push origin feat/xxx`
6. **创建 PR**：在 GitHub 上创建 Pull Request
7. **Code Review**：至少通过一次 Review 后方可合并
8. **合并到 main**：使用 Squash Merge，保持主线历史整洁

### 提交信息规范（Conventional Commits）

```
<type>(<scope>): <subject>

<body>

<footer>
```

- **type**: feat | fix | docs | style | refactor | test | chore
- **scope**: layout | css | js | config | docs | script
- **subject**: 简短描述（不超过 50 字符）
- **body**: 详细描述（可选）
- **footer**: 关联 Issue（如 `Closes #123`）

### 代码规范

- JavaScript 使用 ESLint + Prettier
- Stylus 使用 Stylelint + Prettier
- 提交前运行 `pnpm lint` 和 `pnpm format`
- 所有代码必须有中文注释，解释关键逻辑

### CI/CD 要求

项目需配置 GitHub Actions 工作流：

1. **PR 检查工作流**（`.github/workflows/pr-check.yml`）
   - 触发条件：Pull Request 创建/更新
   - 检查内容：
     - `pnpm install`
     - `pnpm lint`（ESLint 检查）
     - `pnpm style:lint`（Stylelint 检查）
     - `pnpm format:check`（Prettier 格式检查）
   - 任一检查失败则阻止合并

2. **Release 工作流**（`.github/workflows/release.yml`）
   - 触发条件：main 分支推送或 Tag 创建
   - 执行内容：
     - 版本号自动更新
     - 生成 CHANGELOG
     - 创建 GitHub Release

### 组件开发

- 新增组件放在 `layout/_partial/` 目录
- 对应样式放在 `source/css/_components-extra.styl`
- 遵循现有的命名约定
- 每个组件必须包含配置项开关

### 功能扩展原则

- 优先使用配置项控制功能开关（参考 Fluid 主题设计）
- 借鉴成熟主题（Fluid、Butterfly、Stellar）的 MIT 代码
- 保持代码简洁，避免过度工程化
- 保持主题的轻量级特性

## 常见问题和预防

### 图片懒加载不生效

- 确认 `image.lazy_load` 配置已启用
- 占位图路径需要存在于 `source/` 目录下

### 图片灯箱不工作

- 确认 `image.lightbox` 配置为 `true`
- 图片需要有 `zoomable` 类或位于 `article` 区域内
- 使用 `image.img_url_replace` 可以替换放大时的图片 URL

### 星空动画效果不显示

- 确认 `astronomy.enable` 配置为 `true`
- 星空效果仅在暗色主题下显示

### 代码高亮样式异常

- 检查 `code.highlight.enable` 是否为 `true`
- 确认 CDN 链接可访问
- 主题会根据深色/浅色模式自动切换高亮主题

### 代码块行高亮不生效

- 使用 `// [!code highlight]` 注释标记高亮行
- 确认 `code.highlight_line.enable` 为 `true`

### 数学公式不渲染

- 确认 `math.enable` 配置为 `true`
- 检查 `math.engine` 配置（katex 或 mathjax）
- 确认 CDN 链接可访问

### Pjax 页面切换后功能失效

- 所有功能脚本都需要在 `scripts.ejs` 中监听 `pjax:complete` 事件重新初始化
- 使用 `Almagine.pjaxReInit()` 触发重新初始化

### 暗色模式切换不生效

- 确认 `dark_mode.enable` 为 `true`
- 检查浏览器控制台是否有 JS 错误
- 确认 CSS 变量定义正确（\_theme-light.styl / \_theme-dark.styl）
