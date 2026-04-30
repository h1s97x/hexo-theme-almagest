# Hexo Theme Almagest - 项目规范

## 项目概述

Hexo Theme Almagest 是一个优雅的星空风格 Hexo 博客主题，灵感来自 Stellar 主题。支持深色/浅色主题切换，专为天文爱好者和技术博主设计。

## 技术栈

- **框架**: Hexo >= 6.0.0
- **模板引擎**: EJS
- **样式预处理**: Stylus
- **Node.js**: >= 14.0.0
- **包管理器**: pnpm

## 目录结构

```
hexo-theme-almagest/
├── layout/                     # EJS 模板文件
│   ├── layout.ejs             # 主布局
│   ├── index.ejs              # 首页
│   ├── post.ejs               # 文章页
│   ├── page.ejs               # 页面
│   ├── archive.ejs            # 归档页
│   ├── categories.ejs         # 分类页
│   ├── tags.ejs               # 标签页
│   ├── 404.ejs                # 404 页
│   └── _partial/              # 组件目录
│       ├── head.ejs           # 头部资源
│       ├── header.ejs          # 头部导航
│       ├── footer.ejs          # 页脚
│       ├── navbar.ejs          # 导航栏
│       ├── sidebar.ejs        # 侧边栏
│       ├── toc.ejs             # 文章目录
│       ├── post-nav.ejs        # 文章导航
│       ├── donate.ejs          # 打赏组件
│       ├── comments.ejs       # 评论组件
│       ├── search-box.ejs     # 搜索框
│       ├── pagination.ejs      # 分页
│       ├── post-card.ejs      # 文章卡片
│       ├── categories-widget.ejs
│       ├── tags-widget.ejs
│       ├── breadcrumb.ejs
│       ├── scripts.ejs
│       └── ...                 # 其他组件
├── source/                    # 静态资源
│   ├── css/                  # 样式文件
│   │   ├── main.styl         # 入口文件
│   │   ├── _variables.styl   # 变量
│   │   ├── _mixins.styl      # 混入
│   │   ├── _base.styl        # 基础样式
│   │   ├── _layout.styl      # 布局样式
│   │   ├── _components.styl  # 组件样式
│   │   ├── _components-extra.styl  # 扩展组件
│   │   ├── _responsive.styl # 响应式
│   │   ├── _theme-light.styl # 亮色主题
│   │   ├── _theme-dark.styl  # 暗色主题
│   │   ├── _code-highlight.styl  # 代码高亮
│   │   └── _astronomy.styl   # 星空效果
│   └── js/                   # JavaScript 文件
│       ├── theme.js          # 主题切换
│       ├── search.js         # 搜索功能
│       ├── code-copy.js      # 代码复制
│       ├── lazy-load.js       # 图片懒加载
│       └── astronomy.js       # 星空动画
├── scripts/                  # Hexo 脚本
│   ├── index.js              # 入口
│   ├── events.js             # 事件处理
│   ├── generators.js         # 生成器
│   ├── helpers.js            # 辅助函数
│   ├── filters.js            # 过滤器
│   └── tags.js               # 自定义标签
├── languages/               # 多语言文件
│   ├── zh-CN.yml
│   ├── en.yml
│   └── zh-TW.yml
├── _config.yml              # 主题配置
├── package.json
├── README.md
└── LICENSE
```

## 关键入口 / 核心模块

### 模板入口
- `layout/layout.ejs`: 主布局文件，所有页面都继承此布局
- `layout/post.ejs`: 文章详情页，包含目录、导航、打赏等功能

### 脚本入口
- `scripts/index.js`: 注册所有主题脚本
- `scripts/helpers.js`: 模板辅助函数（时间格式化、阅读时间等）
- `scripts/tags.js`: 自定义标签（note、timeline、folding 等）

### 样式入口
- `source/css/main.styl`: 样式入口，导入所有样式文件

## 运行与预览

### 本地预览

1. 在 Hexo 站点根目录安装主题：
   ```bash
   cd your-hexo-site
   git clone https://github.com/your-username/hexo-theme-almagest.git themes/almagest
   ```

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
- `style.prefers_theme`: 主题偏好 (auto/light/dark)
- `features`: 功能开关（搜索、评论、目录等）
- `toc`: 文章目录配置
- `reading_progress`: 阅读进度条配置
- `donate`: 打赏功能配置

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

| 标签 | 用途 | 示例 |
|------|------|------|
| `{% note %}` | 提示框 | `{% note default %}内容{% endnote %}` |
| `{% timeline %}` | 时间线 | `{% timeline %}...{% endtimeline %}` |
| `{% folding %}` | 折叠块 | `{% folding 标题 %}内容{% endfolding %}` |
| `{% link %}` | 链接卡片 | `{% link url 标题 描述 %}` |
| `{% tabs %}` | 选项卡 | `{% tabs %}...{% endtabs %}` |

## 用户偏好与长期约束

### 代码规范
- JavaScript 使用 ESLint + Prettier
- Stylus 使用 Stylelint + Prettier
- 提交前运行 lint 和 format

### 组件开发
- 新增组件放在 `layout/_partial/` 目录
- 对应样式放在 `source/css/_components-extra.styl`
- 遵循现有的命名约定

### 功能扩展
- 优先使用配置项控制功能开关
- 保持代码简洁，避免过度工程化
- 保持主题的轻量级特性

## 常见问题和预防

### 图片懒加载不生效
- 确认 `source/js/lazy-load.js` 已正确引入
- 确认 `image.lazy_load` 配置已启用

### 星空动画效果不显示
- 确认 `astronomy.enable` 配置为 `true`
- 星空效果仅在暗色主题下显示

### 代码高亮样式异常
- 检查 `_config.yml` 中 `code_theme` 配置
- 确认 CDN 链接可访问

### 评论系统不显示
- 确认对应评论服务（giscus等）的配置正确
- 确认 `features.comments` 已启用
