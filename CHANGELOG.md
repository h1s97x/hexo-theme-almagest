# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

暂无未发布内容。

## [1.1.0] - 2026-09-02

本次发布包含自 v1.0.0 以来累积的文档整理、Bug 修复、新标签支持，
以及一轮完整的技术栈升级。

### Changed

**技术栈升级（工具链 + 运行时依赖）**

升级前项目整体落后 2~3 个大版本，其中 ESLint 与 Stylelint 的两项**破坏性变更**会直接打断 CI，故统一升级并配套改造。

**破坏性升级（不升会挂）**

- **ESLint 8 → 10**：ESLint 10 已**彻底移除 `.eslintrc`**（9.x 标记废弃，10.x 删除），旧 `.eslintrc.json` 会让 `npm run lint` 直接失败。新增 `eslint.config.js`（flat config）并删除 `.eslintrc.json`；`no-unused-vars` 的 `caughtErrors` 显式设回 `none`，保留旧语义（ESLint 9 起默认值改为 `all`，会把空 `catch (e)` 误报为 unused var）
- **Stylelint 14 → 17**：Stylelint 15 起移除了 `indentation` / `quotes` / `no-eol-whitespace` 等全部 stylistic 规则，旧配置中 15 条规则已不存在。清理失效规则，并关闭 `declaration-property-value-no-unknown` / `media-query-no-invalid` / `media-feature-range-notation` / `nesting-selector-no-missing-scoping-root` 四条与 Stylus 变量（`$transition-base`、`$breakpoint-md` 等）冲突的新规则

**依赖调整**

- 移除 **`moment`**（官方已停产）：唯一使用者是 `format_date` helper，而该 helper 在 32 个模板中零调用（模板统一用 Hexo 内置 `date()` / `date_xml()`）。同时删除该 helper 及其单元测试
- 移除 **`cheerio`** 与 **`probe-image-size`**：两者均为重型包且在代码中零引用（图片懒加载实际由 `filters.js` 手写扫描器实现），删除以加快安装
- 移除 **`stylelint-config-prettier`**：Stylelint 15 起已无与 Prettier 冲突的规则，该包已冗余
- `hexo-util` 3 → 4（要求 Node >= 18），`engines.node` 相应由 `>=14` 提升到 `>=18`
- 工具链同步升级：`husky` 8 → 9（`prepare` 脚本由 `husky install` 改为 `husky`，`pre-commit` 移除 `husky.sh` 样板行）、`lint-staged` 15 → 17、`prettier` 3.0 → 3.9、`eslint-config-prettier` 9 → 10、`stylelint-config-standard` 29 → 40

**样式修复**

- 修复两处真实废弃属性：`clip: rect(0,0,0,0)` → `clip-path: inset(50%)`、 `page-break-inside` → `break-inside`

**工程化改进**

- **消除 Prettier 与 ESLint 的规则冲突**：旧配置中 10 条格式化规则（indent / quotes / semi / brace-style / comma-dangle / keyword-spacing / space-infix-ops / space-before-function-paren / no-trailing-spaces / linebreak-style）与 Prettier 重复且互相覆盖，会造成"lint 修完 prettier 又改回去"的死循环。现明确职责划分：**ESLint 只管代码质量（4 条规则），Prettier 只管代码格式**
- **修复 lint-staged 阻断提交**：Prettier 不支持 `.styl` 语法（`inferredParser: null`），显式传入会报 `No parser could be inferred`，而 lint-staged 对 `.styl` 调用了 `prettier --write`。新增 `.prettierignore` 排除 `source/css/`，样式格式统一由 Stylelint 负责
- `npm run lint` 覆盖范围由 `source/js/**/*.js` 扩展到全量 JS（`scripts/`、`test/`、`eslint.config.js`），lint-staged 同步覆盖 `scripts/` 与 `test/`
- CI 镜像 `node:20` → `node:22`（`lint-staged@17` 要求 Node >= 22.22.1）
- 冒烟测试支持 `HEXO_SPEC` 环境变量切换 Hexo 主版本，CI 新增 `smoke-test-hexo8` 阶段构建 **Hexo 7 / 8 兼容矩阵**（均已验证通过）；`tools/build-demo.sh` 同样支持该变量
- `code_highlight.cdn` 的 highlight.js 由 11.8.0 升至 11.12.0，并补充国内镜像替换说明

### Fixed

**修复 Demo 构建脚本被 Hexo 误加载（阻断用户安装）**

- 将 `scripts/build-demo.sh` 迁移至 `tools/build-demo.sh`：Hexo 会把主题 `scripts/` 目录下所有文件当作 JS 加载，`.sh` 脚本导致任意用户 `hexo generate` 时 `Script load failed: themes/almagest/scripts/build-demo.sh`（SyntaxError）——用 npm 或 submodule 安装主题均会踩到
- 同步更新 `.cnb.yml`（部署流水线）、`README.md`、`doc/QUICK_REFERENCE.md`、`doc/DEVELOPMENT.md` 中的调用与结构说明

### Added

**内置通用 `asset_code` 标签（收编自 Stellar 生态）**

- 新增 `{% asset_code path/to/file [title] [lang:xx] [from:n] [to:n] %}` 标签：将站点 `source/` 目录下的源码文件以带行号、标题链接的代码块渲染进文章，语言未指定时按扩展名推断
- 基于 Hexo 内置高亮器渲染（Hexo >= 7），旧版本自动降级为 `<pre><code>`
- 为 `asset_code` 补充单元测试，并在 `package.json` 增加 `hexo-util` 运行时依赖

**npm 包瘦身**

- 扩充 `.npmignore`：排除 `.ci/` `.cnb/` `.cnb.yml` `.github/` `.husky/` `doc/` `test/` `tools/` 及各类开发/部署配置，制品从 108 个文件（376 kB）降至 66 个文件（221 kB），仅保留用户安装运行所需的主题文件

#### Phase 5: 文档整理

**文档目录重组**

- 将散落在根目录的 `CONTRIBUTING.md` / `DEVELOPMENT.md` / `QUICK_REFERENCE.md` / `BUG_FIX_AND_IMPROVEMENT_GUIDE.md` 统一归入 `doc/` 目录，根目录仅保留 `README.md` 与 `CHANGELOG.md`
- README / 各文档内部链接同步更新；更新 `doc/` 内文档间的相对引用
- 演示博客（`doc/source/`）文档中的配置示例统一为 `theme_config:` 写法（移除过时的 `_config.example.yml` 复制步骤）
- 修复演示博客文章间的失效链接（`.md` → Hexo 渲染后的 `.html`），指向仓库文档的链接改用 CNB 绝对 URL
- 同步更新 DEVELOPMENT.md 项目结构树与 QUICK_REFERENCE.md 文件结构，使其与实际仓库一致

#### Phase 4: 发布与生态

**版本发布自动化**

- 接入 CNB 云原生构建 `auto_tag` 事件：在仓库 Tag 列表页点击「自动生成 Tag」按钮，基于 Conventional Commits 自动计算版本号并创建 `vX.Y.Z` 标签（`cnbcool/git-auto-tag` 插件）
- 接入 `tag_push` 发布流水线：推送 `v*` 标签后自动执行 质量检查（lint + 单测 + 冒烟）→ 生成 CHANGELOG（`cnbcool/changelog` 插件）→ 创建 CNB Release（`git:release` 内置任务，描述自动读取生成日志）→ 发布 npm 制品（`tencentcom/npm` 插件）
- 发布到 CNB npm 制品库 `npm.cnb.cool/h1s97x/toolkit/-/packages/`，无需额外令牌（复用构建凭证）
- 新增 `npm-publish.sh` 手动发布脚本（支持自定义 registry）

**Demo 站点与部署**

- 新增 `tools/build-demo.sh`：一键构建 `doc/` 演示博客到 `.demo/public`（真实 Hexo 构建验证通过，25 个产物文件）
- 新增 `.cnb/tag_deploy.yml`：配置 production 部署环境，支持在仓库「部署」入口一键部署到 EdgeOne Pages（`tencentcom/deploy-eopages` 插件，需配置 `EDGEONE_PAGES_API_TOKEN`）
- `.gitignore` 新增 `.demo/` 构建产物目录

**社区生态规范**

- 新增 `.cnb/ISSUE_TEMPLATE/` Issue 模板：Bug 报告（版本/严重程度/复现步骤/期望与实际行为/环境）、功能建议（描述/场景/优先级/参考实现）、使用问题，及 config.yml 联系人配置
- 新增 [CONTRIBUTING.md](doc/CONTRIBUTING.md)：行为准则、贡献流程（Fork → 分支 → 开发验证 → PR）、代码规范、Conventional Commits 提交规范、分支命名约定、发布流程说明
- 创建仓库标签体系：`bug` / `feature request` / `question` / `documentation` / `enhancement` / `release` / `ci`
- README 补充「版本发布」「Demo 站点」「贡献」章节

### Fixed

#### Phase 3.1: 懒加载链路评审整改

- **Critical**：`lazy-load.js` 不再因原生 lazy 支持而提前 return，最终渲染 HTML 始终保留 `src` + `data-src` + `loading="lazy"`，即使 JS 未执行图片也能显示（现代浏览器走原生 lazy，老浏览器由 IntersectionObserver 回填）
- **Warning**：图片懒加载从 `after_post_render` 迁移到 `after_render:html`，不再污染 `post.content`，`search.json` / RSS 等下游消费者拿到的图片保留原始 `src`
- **Warning**：新增 `img[data-src]` / `img.loaded` / `img.error` 样式，接通 `image.placeholder_color`，破图时显示占位背景而非浏览器默认图标
- **Info**：`filters.js` 改用引号感知的 HTML 扫描器，兼容单引号 / 裸属性 `loading`、data URI 属性值含 `>` 的场景，且跳过 `<pre>` / `<script>` 内嵌示例
- 单元测试新增 after_render:html 用例；CI 冒烟测试新增「最终渲染 HTML 必须包含 `src`」「search.json 不含 data-src」断言

### Added

#### Phase 3: Quality & Performance

**多语言全量收尾（三语对齐）**

- 补齐 `breadcrumb` / `pagination` / `last_updated` / `copyright` / `copy_failed` 等缺失文案键
- 补齐 `astronomy.*` 系列子键（日历、观星指南、天气、观测提示等 23 个）
- 新增无障碍文案键：`toggle_theme` / `toggle_menu` / `back_to_top` / `previous_month` / `next_month`
- 移除模板中硬编码英文：`min read` → `read_time_unit`、`All rights reserved`、`Powered by`、`Failed` 等
- `en` / `zh-CN` / `zh-TW` 三个语言包实现 100% 键对齐（各 120 个键）

**单元测试**

- 新增零依赖轻量测试框架 `test/unit/framework.js`（Node >= 14 兼容）
- 新增 helpers / generators / tags / filters 四个测试文件，共 31 个用例
- 覆盖：helper 日期格式化与阅读时间估算、generator 搜索数据与配置开关、tag 渲染、图片懒加载 filter 等
- `package.json` 新增 `test:unit`，`npm test` 变为 lint + stylelint + 单元测试 + 冒烟测试四段
- `.cnb.yml` 新增 `unit-test` 阶段

**样式/组件模块化重构**

- 将 `astronomy-calendar.ejs` / `observation-guide.ejs` 内联 `<style>` 提取为独立组件样式文件
  `_astronomy-calendar.styl` / `_observation-guide.styl`，随 `main.css` 统一打包
- 移除模板内联样式，页面样式收敛到样式体系，便于主题换肤与维护

**性能优化**

- 图片懒加载链路打通：新增 `after_post_render` filter 自动为文章图片添加 `loading="lazy"` 与 `data-src`
- `lazy-load.js` 重构：优先识别浏览器原生 lazy、支持失败回退、高 DPR 场景
- `main.css` 与 `head.ejs` 静态资源统一走 `cdn_prefix + version`，便于 CDN 部署与缓存刷新
- `_config.yml` 补充性能优化说明（stylus compress、Google Fonts 镜像、懒加载）

**工程化与文档**

- lint 达到 0 error / 0 warning（清理未使用参数与 console 合理告警）
- 修复 QUICK_REFERENCE / DEVELOPMENT 中过时的 `github.com/your-username` 假链接
- footer 仓库链接改为 CNB 真实地址

#### Phase 2: Engineering Foundation

**主题配置规范化**

- `_config.yml` 重构为带完整注释与默认值的配置模板，新增 `date_format` / `code_highlight` / `fonts` / `page` 等配置项
- 文档明确 `theme_config:` 深度合并用法（站点 `_config.yml` 覆盖主题默认值）

**前端资源管线**

- 新增 `_partial/theme-init.ejs`：把防 FOUC 的主题初始化收敛为最小内联脚本，移除 `head.ejs` 中与 `theme.js` 重复的初始化逻辑
- `theme.js` 重构：专注主题切换 / 系统偏好监听，新增移动端菜单开关、搜索按钮跳转逻辑，暴露 `ThemeManager` API
- `scripts.ejs`：所有 JS 统一 `defer` 加载（不阻塞首屏），注入前端 i18n 文案
- 删除未使用的 `_partial/navbar.ejs`（死代码）
- 404 页搜索按钮由 `<button>` 改为真实链接，导航栏搜索按钮同样改为链接

**搜索链路打通**

- `search.js`：支持页面内嵌数据 + 外部 `search.json` 双数据源回退，`?q=` 参数自动搜索，新增中文/整句回退扫描，修复摘要截取越界
- `search.ejs`：注入 i18n 文案（不再硬编码英文），安全序列化内嵌搜索数据（防 `</script>` 截断）
- 文章页阅读时间由服务端直接渲染（`get_reading_time`），移除失效的 `id="reading-time"` 占位

**样式修复**

- 修复 `_astronomy.styl` 中 `background-image:` 空值导致的 stylus 解析报错

**工程化与 CI**

- `.cnb.yml` 扩展为 install-deps → lint-js → stylelint → smoke-test 四阶段
- `package.json`：新增 `check` / 重写 `test`（lint + stylelint + 冒烟测试），不再 `exit 1`
- stylelint 引入 `postcss-styl` 自定义语法，规则适配 stylus

## [1.0.0] - 2026

### Added

#### Phase 1: Basic Framework

**Project Initialization and Configuration**

- Project directory structure with layout/, source/, scripts/, languages/ directories
- package.json with project metadata and dependencies
- ESLint configuration for JavaScript code standards
- Stylelint configuration for CSS/Stylus code standards
- Prettier configuration for code formatting
- Git hooks with husky and lint-staged for pre-commit checks
- .gitignore, LICENSE (MIT), and .editorconfig files
- README.md with project overview and quick start guide

**Basic Template System**

- Main layout template (layout.ejs) with page framework and template inheritance
- Index page template (index.ejs) for displaying article lists with pagination
- Post page template (post.ejs) for displaying article content and metadata
- Page template (page.ejs) for custom standalone pages
- Archive page template (archive.ejs) for chronological article browsing
- 404 error page template (404.ejs)
- Partial components directory (_partial/) with reusable components:
  - head.ejs - page head section
  - header.ejs - page header
  - footer.ejs - page footer

**Style System**

- Stylus-based style system with main.styl entry point
- Variable definitions (_variables.styl) for colors, fonts, and spacing
- Base styles (_base.styl) for global styling and typography
- Layout styles (_layout.styl) for page structure
- Light theme (_theme-light.styl) with light color scheme
- Dark theme (_theme-dark.styl) with dark color scheme
- Support for smooth theme transitions

**Theme Switching Functionality**

- Theme toggle script (source/js/theme.js) for switching between light and dark themes
- Local storage persistence for user theme preference
- System preference detection (prefers-color-scheme)
- Smooth CSS transitions to prevent flickering
- Theme toggle button in header

**Responsive Design**

- Responsive styles (_responsive.styl) with mobile-first approach
- Mobile menu (hamburger menu) for small screens
- Responsive breakpoints:
  - Desktop: > 1024px
  - Tablet: 768px - 1024px
  - Mobile: < 768px
- Optimized typography and spacing for mobile devices
- Touch-friendly interactive elements

**Navigation System**

- Navigation bar component (navbar.ejs) with menu items
- Sidebar component (sidebar.ejs) for additional content
- Menu configuration support through _config.yml
- Breadcrumb navigation for page hierarchy
- Mobile-friendly collapsible menu

**Configuration System**

- _config.yml example configuration file with all available options
- Configuration reading in templates and scripts
- Default value handling for missing configuration items
- Support for customization through configuration

**Basic Documentation and Demo Blog**

- Demo blog structure in doc/ directory
- Demo blog configuration (doc/_config.yml)
- Getting started guide (doc/source/posts/getting-started.md)
- Installation guide (doc/source/posts/installation.md)
- Basic configuration guide (doc/source/posts/configuration.md)

#### Phase 2: Core Features

**Category System**

- Categories page template (layout/categories.ejs)
- Category page generator for automatic page generation
- Categories sidebar widget (categories-widget.ejs)
- Article filtering by category
- Category list display with article counts

**Tag System**

- Tags page template (layout/tags.ejs)
- Tag page generator for automatic page generation
- Tag cloud sidebar widget (tags-widget.ejs)
- Article filtering by tag
- Tag cloud visualization

**Search Functionality**

- Search script (source/js/search.js) with index generation
- Search results page template (layout/search.ejs)
- Search box component (search-box.ejs)
- Full-text search across article titles and content
- Search result highlighting and excerpt display

**Comment System**

- Giscus comment system integration
- Comments component (comments.ejs)
- Comment configuration through _config.yml
- Enable/disable comments per article

**Image Optimization**

- Lazy loading implementation (source/js/lazy-load.js)
- Responsive image support with srcset
- Image error handling with fallback display
- Placeholder display during image loading

**Multilingual Support**

- Language files directory (languages/)
- Chinese (Simplified) translation (languages/zh-CN.yml)
- English translation (languages/en.yml)
- Chinese (Traditional) translation (languages/zh-TW.yml)
- Language configuration support
- UI text translation throughout the theme

**Code Highlighting**

- Code highlight styles (_code-highlight.styl)
- Syntax highlighting for multiple programming languages
- Copy button functionality (source/js/code-copy.js)
- Line number display support
- Code block styling

**User Documentation**

- Categories and tags usage guide
- Search functionality documentation
- Comment system configuration guide
- Image optimization best practices
- Multilingual configuration guide

#### Phase 3: Advanced Features

**Wiki System**

- Wiki page template (layout/wiki.ejs)
- Document tree navigation component (wiki-nav.ejs)
- Multi-project wiki support
- Document hierarchy display

**Topic System**

- Topic page template (layout/topic.ejs)
- Series article management component (topic-nav.ejs)
- Column navigation support
- Series article display and navigation

**Notebooks System**

- Notebooks page template (layout/notebooks.ejs)
- Note categorization component (notebooks-nav.ejs)
- Quick note creation functionality
- Note templates

**Astronomy Theme and Starry Background**

- Astronomy styles (_astronomy.styl)
- Static starry background implementation
- Dynamic starry animation (source/js/astronomy.js)
- Astronomy theme configuration
- Background switching support

**Astronomy Knowledge Cards**

- Astronomy card component (astronomy-card.ejs)
- Constellation information cards with images
- Celestial body information cards
- Astronomy event cards

**Constellation Navigation**

- Constellation navigation component (constellation-nav.ejs)
- 12 constellation display
- Article categorization by constellation
- Constellation page generation
- Constellation image display
- Constellation-based article filtering

**Advanced Features Documentation**

- Wiki usage guide (doc/source/posts/wiki-guide.md)
- Topic usage guide (doc/source/posts/topic-guide.md)
- Notebooks usage guide (doc/source/posts/notebooks-guide.md)
- Astronomy features guide (doc/source/posts/astronomy-guide.md)

#### Phase 4: Community and Release

**Documentation Completion**

- Comprehensive user documentation
- FAQ section (doc/source/posts/faq.md)
- Best practices guide (doc/source/posts/best-practices.md)
- Complete feature documentation

**Astronomy Event Calendar**

- Astronomy event calendar component (astronomy-calendar.ejs)
- Event data management system
- Event reminder functionality
- Event subscription support

**Night Sky Observation Guide**

- Observation guide component (observation-guide.ejs)
- Location-aware functionality
- Visible constellation calculation
- Observation recommendations generation
- Best observation time display

**Astronomy Features Documentation**

- Astronomy event calendar guide (doc/source/posts/astronomy-calendar.md)
- Night sky observation guide (doc/source/posts/observation-guide.md)
- Astronomy best practices documentation

**Development Documentation**

- Project analysis documentation
- System design documentation
- Development guide (DEVELOPMENT.md)
- Quick reference card (QUICK_REFERENCE.md)

**NPM Publishing**

- Version 1.0.0 release
- CHANGELOG.md documentation
- NPM package publication

### Changed

- Improved responsive design for better mobile experience
- Enhanced theme switching with smoother transitions
- Optimized search functionality for better performance
- Refined navigation system for better usability
- Updated documentation with more examples and use cases

### Fixed

- Fixed theme persistence across browser sessions
- Fixed responsive layout issues on various screen sizes
- Fixed search index generation for special characters
- Fixed image lazy loading on slow connections
- Fixed code highlighting for edge cases

### Deprecated

- None in this release

### Removed

- None in this release

### Security

- Implemented Content Security Policy (CSP) headers
- Validated user input to prevent XSS attacks
- Secured local storage usage for theme preferences
- Sanitized search queries

### Performance

- Optimized CSS file size (< 50KB)
- Optimized JavaScript file size (< 30KB)
- Implemented lazy loading for images
- Added caching strategies for static resources
- First Contentful Paint (FCP) < 1.5 seconds
- Largest Contentful Paint (LCP) < 2.5 seconds

## Development Phases

### Phase 1: Basic Framework (Weeks 1-2)

- Project initialization and configuration
- Basic template system
- Style system with light/dark themes
- Theme switching functionality
- Responsive design
- Navigation system
- Configuration system
- Basic documentation

### Phase 2: Core Features (Weeks 3-4)

- Category system
- Tag system
- Search functionality
- Comment system integration
- Image optimization
- Multilingual support
- Code highlighting
- User documentation

### Phase 3: Advanced Features (Weeks 5-6)

- Wiki system
- Topic system
- Notebooks system
- Astronomy theme and starry background
- Astronomy knowledge cards
- Constellation navigation
- Advanced features documentation

### Phase 4: Community and Release (Week 7+)

- Documentation completion
- Astronomy event calendar
- Night sky observation guide
- Astronomy features documentation
- Development documentation
- NPM publishing
- Community feedback handling

## Commit History

### Phase 1 Commits

- `feat: 初始化项目框架和开发工具配置` - Project initialization
- `feat: 实现基础模板系统和页面类型` - Basic templates
- `feat: 实现样式系统和主题定义` - Style system
- `feat: 实现亮暗主题切换和持久化` - Theme switching
- `feat: 实现响应式设计和移动端适配` - Responsive design
- `feat: 实现导航系统和菜单配置` - Navigation system
- `feat: 实现配置系统和默认配置` - Configuration system
- `docs: 添加基础文档和演示博客框架` - Basic documentation

### Phase 2 Commits

- `feat: 实现分类系统和分类页面` - Category system
- `feat: 实现标签系统和标签云` - Tag system
- `feat: 实现全站搜索功能` - Search functionality
- `feat: 集成 Giscus 评论系统` - Comment system
- `feat: 实现图片懒加载和优化` - Image optimization
- `feat: 实现多语言支持` - Multilingual support
- `feat: 实现代码高亮和复制功能` - Code highlighting
- `docs: 在演示博客中添加用户文档` - User documentation

### Phase 3 Commits

- `feat: 实现 Wiki 系统基础功能` - Wiki system
- `feat: 实现 Topic 系统基础功能` - Topic system
- `feat: 实现 Notebooks 系统基础功能` - Notebooks system
- `feat: 实现星空背景和天文主题` - Astronomy theme
- `feat: 实现天文知识卡片系统` - Astronomy cards
- `feat: 实现星座导航和分类` - Constellation navigation
- `docs: 在演示博客中添加高级功能指南` - Advanced features documentation

### Phase 4 Commits

- `docs: 完善演示博客中的用户文档` - Documentation completion
- `feat: 实现天文事件日历` - Astronomy event calendar
- `feat: 实现夜空观测指南` - Observation guide
- `docs: 添加天文功能完整文档` - Astronomy documentation
- `docs: 整理并提交开发文档` - Development documentation
- `chore: 发布 v1.0.0 到 NPM` - NPM publishing

## Installation

To use Hexo Theme Almagest, follow these steps:

1. Install the theme in your Hexo blog:

   ```bash
   npm install hexo-theme-almagest
   ```

2. Update your Hexo configuration (_config.yml):

   ```yaml
   theme: almagest
   ```

3. Copy the theme configuration example:

   ```bash
   cp node_modules/hexo-theme-almagest/_config.yml _config.almagest.yml
   ```

4. Customize the theme configuration as needed

5. Generate and deploy your blog:
   ```bash
   hexo generate
   hexo deploy
   ```

## Features

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Light/Dark Theme**: Built-in theme switching with user preference persistence
- **Multilingual Support**: Support for Chinese (Simplified/Traditional) and English
- **Search Functionality**: Full-text search across all articles
- **Comment System**: Integrated Giscus comment system
- **Image Optimization**: Lazy loading and responsive images
- **Code Highlighting**: Syntax highlighting for multiple programming languages
- **Advanced Features**: Wiki, Topic, and Notebooks systems
- **Astronomy Theme**: Starry background and constellation navigation
- **Customizable**: Extensive configuration options for customization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or suggestions, please visit the GitHub repository or check the documentation.

## Acknowledgments

- Inspired by hexo-theme-stellar
- Built with Hexo, EJS, Stylus, and vanilla JavaScript
- Community feedback and contributions

---

For more information, visit the [project documentation](./doc/source/posts/getting-started.md) or the [GitHub repository](https://github.com/yourusername/hexo-theme-almagest).
