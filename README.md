# Hexo Theme Almagest

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
npm test             # 静态检查 + CI 冒烟测试（真实 Hexo 构建验证）
```

## 文档

- [快速参考卡](QUICK_REFERENCE.md)
- [开发文档](DEVELOPMENT.md)
- [Bug 修复与改进指南](BUG_FIX_AND_IMPROVEMENT_GUIDE.md)
- [更新日志](CHANGELOG.md)
- [演示博客源码](doc/)

## License

[MIT](LICENSE)
