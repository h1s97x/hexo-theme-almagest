# Hexo Theme Almagest

一个优雅的星空风格 Hexo 博客主题，灵感来自 Stellar 主题。支持深色/浅色主题切换，专为天文爱好者和技术博主设计。

## 特性

- **双主题支持**: 支持浅色和深色主题，支持跟随系统自动切换
- **星空背景效果**: 暗色主题下精美的星星动画效果
- **响应式设计**: 完美适配桌面端和移动端
- **丰富功能**: 文章目录、代码高亮、代码复制、图片懒加载等
- **自定义标签**: 内置多种实用标签（note、timeline、folding 等）
- **SEO 优化**: 支持 Open Graph、Twitter Card 等
- **评论系统**: 支持 Giscus、Disqus 等评论系统
- **模块化设计**: 清晰的代码结构，易于定制

## 预览

> 主题预览截图（建议自行截图替换）

## 安装

### 方式一（推荐）：克隆到主题目录

```bash
cd your-hexo-site
git clone https://github.com/your-username/hexo-theme-almagest.git themes/almagest
```

### 方式二：npm 安装

```bash
cd your-hexo-site
npm install hexo-theme-almagest --save
```

然后在 Hexo 配置文件中：

```yaml
theme: almagest
```

## 配置

### 基础配置

在 Hexo 站点的 `_config.yml` 中配置：

```yaml
# 站点配置
title: 我的博客
subtitle: 技术分享与生活记录
author: 博主名称
language: zh-CN

# 主题配置
theme: almagest

# URL 配置
url: https://example.com
root: /
```

### 主题配置

在 `themes/almagest/_config.yml` 中配置主题选项：

```yaml
# 基础信息
title: "博客标题"
subtitle: "博客副标题"
author: "作者名称"

# 样式配置
style:
  primary_color: "#4a90d9"      # 主题色
  accent_color: "#06b6d4"        # 强调色
  prefers_theme: "auto"          # 主题偏好: auto | light | dark
  enable_starry_background: true # 星空背景效果

# 导航菜单
menu:
  首页: /
  归档: /archives/
  分类: /categories/
  标签: /tags/
  关于: /about/

# 功能开关
features:
  search: true           # 搜索功能
  comments: true          # 评论系统
  toc: true               # 文章目录
  code_copy: true         # 代码复制
  back_to_top: true       # 返回顶部
  reading_time: true      # 阅读时间
  word_count: true        # 字数统计

# 社交链接
social:
  github: "https://github.com/your-username"
  email: "your.email@example.com"
```

## 文章 Front Matter

```markdown
---
title: 文章标题
date: 2024-01-01 12:00:00
categories:
  - 分类1
  - 分类2
tags:
  - 标签1
  - 标签2
cover: /images/cover.jpg    # 封面图片
excerpt: 文章摘要            # 摘要（可选）
---
```

## 自定义标签

### Note 标签

```markdown
{% note default %}
默认提示框内容
{% endnote %}

{% note primary %}
主要提示框
{% endnote %}

{% note success %}
成功提示框
{% endnote %}

{% note warning %}
警告提示框
{% endnote %}

{% note danger %}
危险提示框
{% endnote %}
```

### Timeline 时间线

```markdown
{% timeline %}
<!-- node 第一阶段 -->
内容...

<!-- node 第二阶段 -->
内容...
{% endtimeline %}
```

### Folding 折叠块

```markdown
{% folding 点击展开查看更多 %}
这里是折叠的内容
支持 Markdown 格式
{% endfolding %}
```

### Quote 引用块

```markdown
{% quot 引用内容 %}
{% quot 引用内容 icon:hashtag %}
```

### Checkbox 任务列表

```markdown
{% checkbox checked:true 已完成的任务 %}
{% checkbox 未完成的任务 %}
```

### Link Card 链接卡片

```markdown
{% link https://example.com 链接标题 链接描述 %}
```

### Button 按钮

```markdown
{% button 点击这里 https://example.com primary %}
```

### Image with Caption

```markdown
{% image https://example.com/image.jpg 图片描述 图片说明 %}
```

### Tabs 选项卡

```markdown
{% tabs 标签页 %}
<!-- tab 标签1 -->
内容1
<!-- tab 标签2 -->
内容2
<!-- tab -->
内容3
{% endtabs %}
```

## 页面创建

### 关于页面

```bash
hexo new page about
```

编辑 `source/about/index.md`：

```markdown
---
title: 关于
date: 2024-01-01
type: about
---

这里写关于页面的内容...
```

### 分类页面

```bash
hexo new page categories
```

编辑 `source/categories/index.md`：

```markdown
---
title: 分类
date: 2024-01-01
type: categories
---
```

### 标签页面

```bash
hexo new page tags
```

编辑 `source/tags/index.md`：

```markdown
---
title: 标签
date: 2024-01-01
type: tags
---
```

### 友链页面

```bash
hexo new page links
```

编辑 `source/links/index.md`：

```markdown
---
title: 友情链接
date: 2024-01-01
type: links
---

{% links %}
- site:
    name: 博客名称
    url: https://example.com
    avatar: https://example.com/avatar.png
    description: 博客描述
{% endlinks %}
```

## 评论系统

### Giscus（推荐）

1. 访问 [Giscus](https://giscus.app) 生成配置
2. 在主题配置中启用：

```yaml
services:
  giscus:
    enable: true
    repo: "your-username/your-repo"
    repo_id: "your-repo-id"
    category: "Announcements"
    category_id: "your-category-id"
    mapping: "pathname"
    theme: "dark_dimmed"
    lang: "zh-CN"
```

## 开发

### 项目结构

```
hexo-theme-almagest/
├── layout/                 # EJS 模板文件
│   ├── layout.ejs         # 主布局
│   ├── index.ejs          # 首页
│   ├── post.ejs           # 文章页
│   └── _partial/          # 组件目录
├── source/                # 静态资源
│   ├── css/              # 样式文件 (Stylus)
│   └── js/               # JavaScript 文件
├── scripts/              # Hexo 脚本
├── languages/            # 多语言文件
├── _config.yml          # 主题配置
└── package.json
```

### 开发命令

```bash
# 安装依赖
pnpm install

# 代码检查
pnpm lint
pnpm style:lint

# 代码格式化
pnpm format
```

### 添加自定义样式

在 `source/css/` 目录下创建自定义样式文件，然后在 `main.styl` 中导入。

### 添加自定义脚本

在 `source/js/` 目录下创建自定义脚本，然后在 `layout/_partial/scripts.ejs` 中引入。

## 更新

```bash
cd themes/almagest
git pull
```

## 许可证

[MIT License](LICENSE)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 致谢

- [Hexo](https://hexo.io/)
- [Stellar Theme](https://github.com/xaoxuu/hexo-theme-stellar)
- [Hexo Theme Next](https://github.com/next-theme/hexo-theme-next)
