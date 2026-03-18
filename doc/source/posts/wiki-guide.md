---
title: Wiki 系统使用指南
date: 2024-01-01
categories: 高级功能
tags: [Wiki, 文档]
---

# Wiki 系统使用指南

Wiki 系统是 Almagest 主题提供的一个强大的文档管理功能，允许您创建和组织多个文档项目。

## 什么是 Wiki 系统？

Wiki 系统提供了一个结构化的方式来组织和展示文档。它支持：

- **多项目支持**：管理多个独立的文档项目
- **文档树导航**：清晰的层级导航结构
- **父子关系**：文档之间的关联和导航
- **GitHub 编辑链接**：直接在 GitHub 上编辑文档

## 配置 Wiki 系统

在 `_config.yml` 中配置 Wiki 系统：

```yaml
theme:
  wiki:
    enable: true
    projects:
      - name: "项目文档"
        path: "/wiki/project/"
        pages:
          - title: "快速开始"
            path: "/wiki/project/getting-started/"
            description: "快速开始指南"
            children:
              - title: "安装"
                path: "/wiki/project/getting-started/installation/"
              - title: "配置"
                path: "/wiki/project/getting-started/configuration/"
          - title: "API 文档"
            path: "/wiki/project/api/"
            description: "API 参考文档"
      - name: "用户手册"
        path: "/wiki/manual/"
        pages:
          - title: "基础概念"
            path: "/wiki/manual/concepts/"
    edit_url: "https://github.com/your-repo/edit/main/source/"
```

## 创建 Wiki 页面

### 1. 创建 Markdown 文件

在 `source/wiki/` 目录下创建 Markdown 文件：

```
source/
├── wiki/
│   ├── project/
│   │   ├── index.md
│   │   ├── getting-started.md
│   │   └── api.md
│   └── manual/
│       ├── index.md
│       └── concepts.md
```

### 2. 设置 Front Matter

在 Markdown 文件的 Front Matter 中设置 Wiki 相关信息：

```markdown
---
title: 快速开始
layout: wiki
wiki_project: project
wiki_parent: /wiki/project/
wiki_children:
  - title: 安装
    path: /wiki/project/getting-started/installation/
  - title: 配置
    path: /wiki/project/getting-started/configuration/
---

# 快速开始

这是快速开始指南的内容...
```

## Wiki 页面特性

### 文档树导航

Wiki 系统自动生成文档树导航，显示所有项目和页面的层级关系。

### 面包屑导航

在页面顶部显示当前位置的面包屑导航，方便用户了解文档结构。

### 相关页面

在页面底部显示相关的子页面和父页面链接。

### GitHub 编辑链接

在 Wiki 导航中提供"在 GitHub 上编辑"链接，方便用户贡献文档。

## 最佳实践

### 1. 组织结构

- 使用清晰的项目名称
- 按逻辑分组相关文档
- 保持层级不超过 3 层

### 2. 内容编写

- 使用清晰的标题和子标题
- 提供代码示例
- 包含相关链接

### 3. 导航优化

- 为每个页面设置正确的父子关系
- 提供返回上级的链接
- 显示相关页面

## 示例

### 项目文档结构

```
项目文档
├── 快速开始
│   ├── 安装
│   └── 配置
├── API 文档
│   ├── 核心 API
│   └── 扩展 API
└── 常见问题
```

### 页面配置示例

```markdown
---
title: 安装指南
layout: wiki
wiki_project: project
wiki_parent: /wiki/project/getting-started/
description: 详细的安装步骤
---

# 安装指南

## 前置要求

- Node.js 12+
- npm 或 yarn

## 安装步骤

1. 克隆仓库
2. 安装依赖
3. 配置文件
4. 启动项目
```

## 常见问题

**Q: 如何添加新的 Wiki 项目？**
A: 在 `_config.yml` 中的 `theme.wiki.projects` 数组中添加新项目配置。

**Q: 如何修改文档树导航的顺序？**
A: 在配置文件中调整 `pages` 数组的顺序。

**Q: 如何隐藏某个 Wiki 项目？**
A: 在配置中设置 `enable: false` 或从配置中移除该项目。

## 相关资源

- [主题配置指南](../configuration/)
- [Markdown 语法](../markdown/)
- [自定义指南](../customization/)
