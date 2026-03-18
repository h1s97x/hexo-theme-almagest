---
title: Notebooks 系统使用指南
date: 2024-01-01
categories: 高级功能
tags: [Notebooks, 笔记]
---

# Notebooks 系统使用指南

Notebooks 系统是 Almagest 主题提供的一个强大的笔记管理功能，允许您创建和组织个人笔记。

## 什么是 Notebooks 系统？

Notebooks 系统提供了一个结构化的方式来组织和展示个人笔记。它支持：

- **笔记分类**：按类别组织笔记
- **快速创建**：快速创建新笔记
- **笔记模板**：使用预定义的笔记模板
- **笔记导航**：清晰的笔记导航结构

## 配置 Notebooks 系统

在 `_config.yml` 中配置 Notebooks 系统：

```yaml
theme:
  notebooks:
    enable: true
    categories:
      learning:
        name: "学习笔记"
        icon: "📚"
        path: "/notebooks/learning/"
        notebooks:
          - title: "JavaScript 笔记"
            path: "/notebooks/learning/javascript/"
            count: 12
          - title: "Python 笔记"
            path: "/notebooks/learning/python/"
            count: 8
      reading:
        name: "阅读笔记"
        icon: "📖"
        path: "/notebooks/reading/"
        notebooks:
          - title: "技术书籍"
            path: "/notebooks/reading/tech-books/"
            count: 5
      ideas:
        name: "想法和灵感"
        icon: "💡"
        path: "/notebooks/ideas/"
        notebooks:
          - title: "项目想法"
            path: "/notebooks/ideas/projects/"
            count: 3
```

## 创建 Notebooks 页面

### 1. 创建笔记本目录

在 `source/notebooks/` 目录下创建笔记本目录：

```
source/
├── notebooks/
│   ├── learning/
│   │   ├── index.md
│   │   ├── javascript/
│   │   │   ├── index.md
│   │   │   ├── variables.md
│   │   │   └── functions.md
│   │   └── python/
│   │       └── index.md
│   ├── reading/
│   │   └── index.md
│   └── ideas/
│       └── index.md
```

### 2. 创建笔记本首页

创建笔记本的 `index.md` 文件：

```markdown
---
title: JavaScript 笔记
layout: notebooks
notebook_category: learning
notebook_name: javascript
description: JavaScript 学习笔记集合
---

# JavaScript 笔记

这是我的 JavaScript 学习笔记...

## 最近笔记

- [变量和数据类型](./variables.md)
- [函数和作用域](./functions.md)
```

### 3. 创建单个笔记

创建单个笔记文件：

```markdown
---
title: 变量和数据类型
date: 2024-01-01
categories: JavaScript
tags: [变量, 数据类型]
notebook: javascript
---

# 变量和数据类型

## 概述

JavaScript 中的变量用于存储数据值...

## 变量声明

### var

```javascript
var x = 5;
```

### let

```javascript
let y = 10;
```

### const

```javascript
const z = 15;
```

## 数据类型

- 字符串
- 数字
- 布尔值
- 对象
- 数组
```

## Notebooks 页面特性

### 笔记分类

按类别组织笔记，方便查找和浏览。

### 笔记卡片

在 Notebooks 页面上显示笔记本卡片，包含笔记本信息和最近笔记。

### 快速创建

提供快速创建新笔记的按钮和链接。

### 笔记导航

在侧边栏显示所有笔记本和笔记，方便导航。

## 最佳实践

### 1. 分类规划

- 选择合适的分类
- 保持分类数量适中（3-5 个）
- 使用清晰的分类名称

### 2. 笔记编写

- 使用清晰的标题
- 组织内容结构
- 添加相关标签
- 包含代码示例

### 3. 笔记管理

- 定期更新笔记
- 添加日期信息
- 使用一致的格式
- 提供相关链接

## 示例

### 笔记本结构

```
学习笔记
├── JavaScript 笔记
│   ├── 变量和数据类型
│   ├── 函数和作用域
│   └── 异步编程
├── Python 笔记
│   ├── 基础语法
│   └── 面向对象编程
阅读笔记
├── 技术书籍
│   ├── 《JavaScript 高级程序设计》
│   └── 《深入浅出 Node.js》
想法和灵感
├── 项目想法
│   ├── 个人博客系统
│   └── 任务管理应用
```

### 完整配置示例

```yaml
theme:
  notebooks:
    enable: true
    categories:
      learning:
        name: "学习笔记"
        icon: "📚"
        path: "/notebooks/learning/"
        count: 20
        notebooks:
          - title: "JavaScript 笔记"
            path: "/notebooks/learning/javascript/"
            count: 12
          - title: "Python 笔记"
            path: "/notebooks/learning/python/"
            count: 8
      reading:
        name: "阅读笔记"
        icon: "📖"
        path: "/notebooks/reading/"
        count: 5
      ideas:
        name: "想法和灵感"
        icon: "💡"
        path: "/notebooks/ideas/"
        count: 3
```

## 常见问题

**Q: 如何添加新的笔记本分类？**
A: 在 `_config.yml` 中的 `theme.notebooks.categories` 中添加新分类。

**Q: 如何改变笔记本的顺序？**
A: 在配置中调整 `notebooks` 数组的顺序。

**Q: 如何快速创建新笔记？**
A: 点击"新建笔记本"按钮，或在相应目录下创建新的 Markdown 文件。

**Q: 笔记本支持嵌套吗？**
A: 目前支持一级分类和笔记本。如需更深层次的组织，可以使用标签。

**Q: 如何导出笔记？**
A: 笔记以 Markdown 格式存储，可以直接导出或转换为其他格式。

## 相关资源

- [主题配置指南](../configuration/)
- [Markdown 语法](../markdown/)
- [自定义指南](../customization/)
