# Hexo Theme Almagest

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

一个简洁而强大的 Hexo 主题，参考 [Stellar](https://github.com/xaoxuu/hexo-theme-stellar) 主题设计，主打"极简 + 天文主题"，同时更易于定制。

A minimal yet powerful Hexo theme inspired by Stellar with enhanced customization.

## 特性

- 🪐 **天文主题**：星空背景、天文事件日历、星座导航、观测指南
- 🌗 **明暗双主题**：支持系统偏好自动切换 + 手动切换（localStorage 记忆）
- 📱 **响应式布局**：桌面 / 平板 / 移动端自适应
- 🔍 **全站搜索**：零依赖本地搜索（生成 `search.json`）
- 🌍 **多语言**：内置 `en` / `zh-CN` / `zh-TW`
- 💻 **代码高亮与复制**：基于 highlight.js + 一键复制按钮
- 🖼 **图片懒加载**：基于 IntersectionObserver
- ⚡ **SEO 友好**：语义化 HTML、自动 meta 标签

## 安装

```bash
# 在 Hexo 站点根目录下
git clone https://cnb.cool/h1s97x/hexo-theme-almagest.git themes/almagest
```

在站点 `_config.yml` 中启用主题：

```yaml
theme: almagest
```

安装主题依赖：

```bash
npm install hexo-renderer-ejs hexo-renderer-stylus hexo-renderer-marked \
  hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag
```

## 快速开始

```bash
hexo clean && hexo generate
hexo server
```

## 配置

主题配置在主题根目录 `_config.yml`（**已带完整注释与默认值**），也可在站点根目录 `_config.yml` 中通过 `theme_config:` 覆盖任意配置项（站点级配置会与主题默认值**深度合并**）：

```yaml
# 站点 _config.yml
theme: almagest
theme_config:
  title: 'My Blog'
  style:
    primary_color: '#7c3aed' # 覆盖主题色
  features:
    search: false # 关闭搜索
  fonts:
    google_fonts: false # 国内网络可关闭 Google Fonts
```

> 💡 无需复制整份主题 `_config.yml`，只需写你想覆盖的项。完整的配置项说明见主题根目录 `_config.yml` 内注释。

常用配置项速览：

```yaml
style:
  primary_color: '#0066cc' # 主题色
  prefers_theme: 'auto' # auto | light | dark
  code_theme: 'atom-one-light' # 代码高亮主题

features:
  search: true # 搜索
  toc: true # 目录
  reading_time: true # 阅读时间
  code_copy: true # 代码复制
  back_to_top: true # 返回顶部

sidebar:
  enable: true
  position: right

menu:
  Home: /
  Archives: /archives/
  Categories: /categories/
  Tags: /tags/
```

## 开发

```bash
npm install          # 安装依赖
npm run lint         # JS 代码检查（eslint）
npm run style:lint   # 样式检查（stylelint）
npm run check        # 全部静态检查
npm run test:unit    # 单元测试（helpers/generators/tags/filters）
npm test             # 静态检查 + 单元测试 + CI 冒烟测试（真实 Hexo 构建验证）
```

## 性能优化

- **CSS 压缩**：在站点根目录 `_config.yml` 添加 `stylus.compress: true` 即可压缩生成的 `main.css`
- **CDN 部署**：配置 `theme_config.cdn_prefix` 后，`main.css` 与全部 JS 资源统一走该前缀 + 版本号（`?v=`），方便接入 CDN 并刷新缓存
- **图片懒加载**：默认开启，文章正文图片会自动添加 `loading="lazy"` 与 `data-src`，无需手动处理
- **Google Fonts**：国内网络不可用时设置 `fonts.google_fonts: false`，或替换 `google_fonts_url` 为国内镜像

## 版本发布

项目已接入 **CNB 云原生构建自动发布**，流程如下：

1. **自动打 Tag**：在仓库的 **Tag 列表页面**点击「自动生成 Tag」按钮，流水线基于
   [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 自动计算下一个版本号并创建 `vX.Y.Z` 标签。
2. **发布 Release**：推送 `v*` 标签后，流水线自动运行质量检查（lint + 单测 + 冒烟测试）、
   生成 CHANGELOG，并创建 CNB Release（描述自动读取生成的 CHANGELOG）。
3. **发布 npm 制品**：同时将主题打包发布到 CNB npm 制品库 `npm.cnb.cool/h1s97x/toolkit/-/packages/`。

> 如需手动发布，可执行 `bash npm-publish.sh`（需配置 `CNB_TOKEN` 制品库令牌）。

## Demo 站点

`doc/` 目录包含演示博客源码，可通过以下命令构建静态站点：

```bash
bash scripts/build-demo.sh   # 输出到 .demo/public
```

配合仓库的「部署」入口（`.cnb/tag_deploy.yml`）可一键部署到 **EdgeOne Pages**（需配置 `EDGEONE_PAGES_API_TOKEN`）。

## 贡献

欢迎任何形式的贡献！请阅读 [CONTRIBUTING.md](doc/CONTRIBUTING.md) 了解：

- Bug 报告 / 功能建议 / 使用问题的 **Issue 模板**
- 代码提交规范（Conventional Commits）与分支命名约定
- 本地开发与验证流程
- 版本发布与 npm 发布说明

## 文档

完整的文档位于 `doc/` 目录：

- [快速参考卡](doc/QUICK_REFERENCE.md)
- [开发文档](doc/DEVELOPMENT.md)
- [Bug 修复与改进指南](doc/BUG_FIX_AND_IMPROVEMENT_GUIDE.md)
- [贡献指南](doc/CONTRIBUTING.md)
- [更新日志](CHANGELOG.md)
- [演示博客源码](doc/)

## License

本项目基于 [MIT 许可证](LICENSE) 开源，Copyright © 2026 [H1S97X (QAQ)](https://cnb.cool/h1s97x)。

你可以自由地使用、复制、修改、合并、发布、分发、再许可及/或销售本软件的副本，但需在软件及所有副本中保留上述版权声明和本许可声明。软件按“原样”提供，不附带任何明示或默示的担保。详见 [LICENSE](LICENSE) 文件全文。

> 主题设计参考自 [Stellar](https://github.com/xaoxuu/hexo-theme-stellar)，其许可证详见对应项目。
