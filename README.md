# Hexo Theme Almagest

一个优雅的星空风格 Hexo 博客主题，灵感来自 Stellar 主题。支持深色/浅色主题切换，专为天文爱好者和技术博主设计。

## 特性

| 分类     | 功能                                                                            |
| -------- | ------------------------------------------------------------------------------- |
| **主题** | 深色/浅色主题、自动跟随系统、Pjax 无刷新导航                                    |
| **首页** | Banner 头图、随机图片、打字机效果、星空背景                                     |
| **文章** | 目录（跟随滚动/折叠）、阅读时间、字数统计、版权声明、代码高亮、行高亮、代码折叠 |
| **样式** | 滚动条样式、标签云颜色、导航栏毛玻璃、响应式设计                                |
| **功能** | 搜索增强、图片灯箱、懒加载、脚注语法、友链页面、Open Graph SEO                  |
| **评论** | Giscus、Disqus、Google Analytics、不蒜子统计                                    |

## 安装

```bash
cd your-hexo-site
git clone https://github.com/h1s97x/hexo-theme-almagest.git themes/almagest
```

修改 Hexo 站点 `_config.yml`：

```yaml
theme: almagest
```

## 快速配置

在 `themes/almagest/_config.yml` 中：

```yaml
# 基础信息
title: '博客标题'
author: '作者名称'

# 暗色模式
dark_mode:
  enable: true
  default: auto # auto | light | dark

# 功能开关
features:
  search: true
  comments: true
  toc: true
  code_copy: true
  back_to_top: true
  reading_time: true
  pjax: true
  scroll_animation: true

# 导航菜单
menu:
  首页: /
  归档: /archives/
  分类: /categories/
  标签: /tags/
  关于: /about/
  友链: /links/
```

## 功能配置

### 首页 Banner

```yaml
index:
  banner_img: /images/banner.jpg
  banner_img_height: 100
  banner_mask_alpha: 0.3
  random_img: false # 设为 true 使用随机图片
  parallax: true
  slogan:
    enable: true
    typeSpeed: 70
    cursorChar: '_'
    loop: false
```

将随机图片放在 `source/img/random/` 目录。

### 代码高亮

```yaml
code:
  highlight_line:
    enable: true # 行高亮
  collapse:
    enable: true # 代码折叠
    max_lines: 30
```

行高亮用法：

````markdown
```javascript
// [!code highlight]
const x = 1; // 这行会高亮
```
````

### 文章目录

```yaml
toc:
  expand_all: true
  scroll_follow:
    enable: true # 跟随滚动
  expand:
    enable: true # 展开/折叠
    collapse_depth: 2
```

### 搜索功能

需要安装 `hexo-generator-searchdb`：

```bash
npm install hexo-generator-searchdb --save
```

```yaml
search:
  enable: true
  path: /local-search.xml
  field: post
  content: true
```

### Open Graph / Twitter Card

```yaml
open_graph:
  enable: true
  twitter_card: summary_large_image
  twitter_id: '@your_twitter_id'
```

### 评论系统 (Giscus)

1. 访问 [giscus.app](https://giscus.app) 生成配置
2. 在仓库设置中启用 GitHub Discussions

```yaml
services:
  giscus:
    enable: true
    repo: 'your-username/your-repo'
    repo_id: 'xxx'
    category: 'Announcements'
    category_id: 'xxx'
```

### 访问统计

```yaml
analytics:
  enable: true
  service: 'busuanzi' # busuanzi | google
```

### 数学公式

```yaml
math:
  enable: true
  engine: 'katex' # katex | mathjax
```

### Mermaid 图表

```yaml
mermaid:
  enable: true
```

## 文章 Front Matter

```markdown
---
title: 文章标题
date: 2024-01-01 12:00:00
categories:
  - 分类
tags:
  - 标签
cover: /images/cover.jpg
excerpt: 摘要
sticky: true # 置顶
math: true # 启用数学公式
---
```

## 自定义标签

### Note 提示框

```markdown
{% note default %}默认提示{% endnote %}
{% note primary %}主要提示{% endnote %}
{% note success %}成功提示{% endnote %}
{% note warning %}警告提示{% endnote %}
{% note danger %}危险提示{% endnote %}
```

### 时间线

```markdown
{% timeline %}

<!-- timeline 2024 -->

- 事件1
- 事件2
<!-- timeline 2023 -->
- 事件3
  {% endtimeline %}
```

### 折叠块

```markdown
{% folding 点击展开 %}
这是隐藏的内容
{% endfolding %}
```

### 友链卡片

```markdown
{% link url 标题 描述 %}
```

### 代码组/选项卡

```markdown
{% tabs tab1 %}

<!-- tab -->

第一个标签的内容

<!-- tab -->

第二个标签的内容
{% endtabs %}
```

## 页面创建

```bash
# 关于页面
hexo new page about

# 友链页面
hexo new page links
```

关于页面 `source/about/index.md`：

```markdown
---
title: 关于
date: 2024-01-01
---

# 头像

![avatar](图片地址)

# 名称

你的名字

# 简介

个人简介...
```

友链页面 `source/links/index.md`：

```markdown
---
title: 友情链接
date: 2024-01-01
type: links
---

# 友链

{% links %}

- site:
  name: 博客名称
  url: https://example.com
  avatar: https://example.com/avatar.png
  description: 博客描述
  {% endlinks %}
```

## 开发

### 项目结构

```
hexo-theme-almagest/
├── layout/              # EJS 模板
│   ├── index.ejs       # 首页
│   ├── post.ejs        # 文章页
│   └── _partial/        # 组件
├── source/
│   ├── css/            # Stylus 样式
│   └── js/              # JavaScript
├── scripts/            # Hexo 脚本
├── languages/           # i18n 文件
├── _config.yml         # 主题配置
└── package.json
```

### 开发命令

```bash
pnpm install
pnpm lint        # ESLint 检查
pnpm style:lint  # Stylelint 检查
pnpm format      # 代码格式化
```

### 代码规范

- JavaScript: ESLint + Prettier
- Stylus: Stylelint + Prettier
- 提交前运行 `pnpm lint && pnpm format`

## 文档

更多详细文档请参考 [doc](./doc/) 目录：

- [文档目录](./doc/README.md) - 文档索引
- [快速开始](./doc/guide/getting-started.md) - 安装与基础配置
- [配置详解](./doc/guide/config.md) - 完整配置说明
- [进阶教程](./doc/guide/advanced.md) - 高级功能教程
- [Front Matter](./doc/examples/front-matter.md) - 文章元数据
- [自定义标签](./doc/examples/tags.md) - 标签使用示例

## 许可证

[MIT License](LICENSE)
