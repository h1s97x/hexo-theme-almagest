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

主题配置在主题根目录 `_config.yml` 中，或通过站点 `_config.yml` 的 `theme_config:` 覆盖。

常用配置项：

```yaml
style:
  primary_color: "#0066cc"     # 主题色
  prefers_theme: "auto"        # auto | light | dark

features:
  search: true                 # 搜索
  toc: true                    # 目录
  reading_time: true           # 阅读时间
  code_copy: true              # 代码复制
  back_to_top: true            # 返回顶部

sidebar:
  enable: true
  position: right

menu:
  Home: /
  Archives: /archives/
  Categories: /categories/
  Tags: /tags/
```

## 文档

- [快速参考卡](QUICK_REFERENCE.md)
- [开发文档](DEVELOPMENT.md)
- [Bug 修复与改进指南](BUG_FIX_AND_IMPROVEMENT_GUIDE.md)
- [更新日志](CHANGELOG.md)
- [演示博客源码](doc/)

## License

[MIT](LICENSE)
