# Hexo Theme Almagest - 快速参考卡

## 快速开始

### 安装主题

```bash
git clone https://cnb.cool/h1s97x/hexo-theme-almagest.git themes/almagest
```

### 配置主题

在 Hexo 的 `_config.yml` 中：

```yaml
theme: almagest
```

### 启动开发服务器

```bash
hexo server
```

## 常用命令

| 命令                     | 说明           |
| ------------------------ | -------------- |
| `hexo new post "标题"`   | 创建新文章     |
| `hexo new page "页面名"` | 创建新页面     |
| `hexo generate`          | 生成静态文件   |
| `hexo server`            | 启动开发服务器 |
| `hexo clean`             | 清除缓存       |
| `hexo deploy`            | 部署网站       |

## 文章 Front Matter

```markdown
---
title: 文章标题
date: 2024-01-01
categories: [分类1, 分类2]
tags: [标签1, 标签2]
excerpt: 文章摘要
cover: /images/cover.jpg
---
```

## 主题配置

> 主题配置支持两种方式：直接修改主题根目录 `_config.yml`，或在站点根目录 `_config.yml` 用 `theme_config:` 覆盖（**推荐**，升级主题不冲突）。站点 `theme_config:` 会与主题默认配置深度合并。

### 基础配置

```yaml
theme_config:
  title: 网站标题
  subtitle: 网站副标题
  description: 网站描述
  author: 作者名称
  language: zh-CN # 或 en, zh-TW
  date_format: YYYY-MM-DD
```

### 菜单配置

```yaml
theme_config:
  menu:
    Home: /
    Archives: /archives/
    Categories: /categories/
    Tags: /tags/
    About: /about/
```

### 样式配置

```yaml
theme_config:
  style:
    primary_color: '#0066cc'
    prefers_theme: 'auto' # 或 'light', 'dark'
    code_theme: 'atom-one-light' # 代码高亮主题
  fonts:
    google_fonts: true # 国内网络可设为 false
  code_highlight:
    enable: true
    cdn: https://cdn.jsdelivr.net/npm/highlight.js@11.8.0
```

### 功能配置

```yaml
theme_config:
  features:
    search: true
    comments: true
    toc: true
    code_copy: true

  services:
    giscus:
      enable: true
      repo: your-username/your-repo
      repo_id: your-repo-id
      category: Announcements
      category_id: your-category-id
```

## 高级功能

### Wiki 系统

```yaml
theme_config:
  wiki:
    enable: true
    projects:
      - name: '项目文档'
        path: '/wiki/project/'
        pages:
          - title: '快速开始'
            path: '/wiki/project/getting-started/'
```

### Topic 系统

```yaml
theme_config:
  topics:
    - name: 'JavaScript 学习路线'
      path: '/topics/javascript-learning/'
      count: 5
```

### Notebooks 系统

```yaml
theme_config:
  notebooks:
    enable: true
    categories:
      learning:
        name: '学习笔记'
        icon: '📚'
        path: '/notebooks/learning/'
```

### 天文功能

```yaml
theme_config:
  astronomy:
    enable: true
    background: static
    events:
      - name: '四象限仪流星雨'
        type: 'meteor_shower'
        date: '2024-01-04'
        visibility: '全球可见'
```

## 模板标签

### 条件判断

```ejs
<% if (condition) { %>
  <!-- 内容 -->
<% } else { %>
  <!-- 其他内容 -->
<% } %>
```

### 循环

```ejs
<% items.forEach(item => { %>
  <div><%= item.name %></div>
<% }); %>
```

### 输出变量

```ejs
<!-- 转义输出 -->
<%= variable %>

<!-- 不转义输出 -->
<%- html_content %>
```

### 包含组件

```ejs
<%- include _partial/component-name %>
```

## 常用变量

| 变量         | 说明           |
| ------------ | -------------- |
| `config`     | Hexo 配置      |
| `page`       | 当前页面对象   |
| `posts`      | 文章列表       |
| `categories` | 分类列表       |
| `tags`       | 标签列表       |
| `__()`       | 多语言翻译函数 |

## 多语言支持

### 在模板中使用翻译

```ejs
<%= __('key') %>
```

### 语言文件结构

```yaml
# languages/zh-CN.yml
home: 首页
about: 关于
```

## 代码规范

### JavaScript

```javascript
// 使用 const/let
const MAX_ITEMS = 10;

// 使用单引号
const name = 'John';

// 使用分号
const value = 42;

// 函数名使用 camelCase
function getUserName() {}
```

### Stylus

```stylus
// 变量使用 $prefix-name
$primary-color = #0066cc

// 混入使用 mixin-name
mixin-button()
  padding: 0.5rem 1rem

// 类名使用 kebab-case
.button-primary
  background: $primary-color
```

## 常见问题

### 如何添加自定义 CSS？

在 `source/css/` 目录下创建新文件，然后在 `main.styl` 中导入。

### 如何添加自定义 JavaScript？

在 `source/js/` 目录下创建新文件，然后在模板中引入。

### 如何修改主题颜色？

编辑 `source/css/_variables.styl` 文件中的颜色变量。

### 如何启用评论功能？

在配置中启用 Giscus 并填写相关信息。

### 如何使用搜索功能？

搜索功能默认启用，无需额外配置。

## 文件结构

```
hexo-theme-almagest/
├── layout/              # 模板文件
├── source/              # 静态资源
│   ├── css/            # 样式文件
│   └── js/             # JavaScript 文件
├── scripts/            # Hexo 脚本与工具
├── languages/          # 多语言文件
├── doc/                # 文档与演示博客源码
├── test/               # 单元测试与冒烟测试
├── _config.yml         # 主题配置示例
├── README.md           # 项目说明
└── package.json        # 项目配置
```

## 性能优化建议

1. **启用图片懒加载**：自动启用
2. **压缩图片**：使用 TinyPNG 等工具
3. **使用 CDN**：加速静态资源
4. **启用缓存**：设置浏览器缓存
5. **最小化 CSS/JS**：自动处理

## SEO 优化建议

1. **添加 Meta 标签**：在 Front Matter 中设置
2. **使用清晰的 URL**：避免特殊字符
3. **添加内部链接**：链接到相关文章
4. **提供 Sitemap**：自动生成
5. **提交到搜索引擎**：Google Search Console

## 部署

### 部署到 GitHub Pages

```bash
hexo deploy
```

> 需在站点 `_config.yml` 中配置 `deploy` 类型与目标仓库，并保证 `hexo-deployer-git` 已安装。

### 部署到 EdgeOne Pages（推荐）

仓库已接入 CNB 云原生构建部署能力：

1. 在 EdgeOne 创建 Pages 项目 `hexo-theme-almagest-demo`
2. 在密钥仓库 `h1s97x/secret-env` 的 `env.yml` 配置 `EDGEONE_PAGES_API_TOKEN`
3. 在仓库 **「部署」入口** 选择 `production` 环境，流水线自动构建 `doc/` 演示博客并部署

### 手动构建 Demo 站点

```bash
bash scripts/build-demo.sh   # 输出到 .demo/public
```

## 发布与版本管理

- **自动打 Tag**：仓库 Tag 列表页点击「自动生成 Tag」，基于 Conventional Commits 计算版本号
- **自动发布**：推送 `v*` 标签后自动生成 CHANGELOG + 创建 Release + 发布 npm 制品
- **手动发布 npm**：`CNB_TOKEN=xxx bash npm-publish.sh`

## 获取帮助

- 查看[演示博客文档](./source/)
- 查看[常见问题](./source/posts/faq.md)
- 查看[开发指南](./DEVELOPMENT.md)
- 查看[贡献指南](./CONTRIBUTING.md)
- 提交 [Issue](https://cnb.cool/h1s97x/hexo-theme-almagest/-/issues/new)

## 相关链接

- [Hexo 官方网站](https://hexo.io/)
- [CNB 仓库](https://cnb.cool/h1s97x/hexo-theme-almagest)
- [项目文档](../README.md)
- [开发指南](./DEVELOPMENT.md)

---

**最后更新**: 2025-01-01
