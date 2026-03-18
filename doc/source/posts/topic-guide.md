---
title: Topic 系统使用指南
date: 2024-01-01
categories: 高级功能
tags: [Topic, 系列文章]
---

# Topic 系统使用指南

Topic 系统是 Almagest 主题提供的一个强大的系列文章管理功能，允许您组织相关的文章成为一个系列。

## 什么是 Topic 系统？

Topic 系统提供了一个结构化的方式来组织和展示系列文章。它支持：

- **系列文章管理**：将相关文章组织成一个系列
- **专栏导航**：快速访问不同的专栏
- **文章排序**：自动排序系列中的文章
- **相关专栏**：显示相关的其他专栏

## 配置 Topic 系统

在 `_config.yml` 中配置 Topic 系统：

```yaml
theme:
  topics:
    - name: "JavaScript 学习路线"
      path: "/topics/javascript-learning/"
      count: 5
      subtopics:
        - name: "基础概念"
          path: "/topics/javascript-learning/basics/"
        - name: "高级特性"
          path: "/topics/javascript-learning/advanced/"
    - name: "Web 开发最佳实践"
      path: "/topics/web-best-practices/"
      count: 8
  topics_archive_url: "/topics/"
```

## 创建 Topic 页面

### 1. 创建 Topic 页面

在 `source/topics/` 目录下创建 Markdown 文件：

```
source/
├── topics/
│   ├── javascript-learning/
│   │   ├── index.md
│   │   ├── basics.md
│   │   └── advanced.md
│   └── web-best-practices/
│       └── index.md
```

### 2. 设置 Front Matter

在 Markdown 文件的 Front Matter 中设置 Topic 相关信息：

```markdown
---
title: JavaScript 学习路线
layout: topic
topic_name: javascript-learning
description: 从零开始学习 JavaScript
articles:
  - title: 变量和数据类型
    path: /posts/js-variables/
    date: 2024-01-01
  - title: 函数和作用域
    path: /posts/js-functions/
    date: 2024-01-02
related_topics:
  - title: Web 开发最佳实践
    path: /topics/web-best-practices/
---

# JavaScript 学习路线

这是一个完整的 JavaScript 学习系列...
```

## 在文章中使用 Topic

### 1. 标记文章属于某个 Topic

在文章的 Front Matter 中添加 `topic` 字段：

```markdown
---
title: 变量和数据类型
date: 2024-01-01
categories: JavaScript
tags: [变量, 数据类型]
topic: javascript-learning
topic_order: 1
---

# 变量和数据类型

这是 JavaScript 学习路线系列的第一篇文章...
```

### 2. 自动生成 Topic 导航

系统会自动根据 `topic` 字段生成 Topic 导航和相关链接。

## Topic 页面特性

### 系列文章列表

在 Topic 页面上显示该系列的所有文章，按顺序排列。

### 文章导航

在系列文章中显示上一篇和下一篇的导航链接。

### 专栏导航

在侧边栏显示所有可用的专栏，方便用户切换。

### 相关专栏

在页面底部显示相关的其他专栏。

## 最佳实践

### 1. 系列规划

- 选择相关的主题
- 规划系列的文章数量
- 确定文章的顺序

### 2. 文章编写

- 在系列开始提供概述
- 每篇文章都要清晰标记系列信息
- 在文章末尾提供导航链接

### 3. 导航优化

- 使用清晰的系列名称
- 提供系列描述
- 显示文章计数

## 示例

### 系列文章结构

```
JavaScript 学习路线
├── 第 1 篇：变量和数据类型
├── 第 2 篇：函数和作用域
├── 第 3 篇：对象和数组
├── 第 4 篇：异步编程
└── 第 5 篇：模块化开发
```

### 完整配置示例

```yaml
theme:
  topics:
    - name: "JavaScript 学习路线"
      path: "/topics/javascript-learning/"
      count: 5
      subtopics:
        - name: "基础概念"
          path: "/topics/javascript-learning/basics/"
        - name: "高级特性"
          path: "/topics/javascript-learning/advanced/"
        - name: "实战项目"
          path: "/topics/javascript-learning/projects/"
```

## 常见问题

**Q: 如何添加新的 Topic？**
A: 在 `_config.yml` 中的 `theme.topics` 数组中添加新 Topic 配置。

**Q: 如何改变 Topic 中文章的顺序？**
A: 在 Topic 页面的 Front Matter 中调整 `articles` 数组的顺序，或在文章中设置 `topic_order` 字段。

**Q: 一篇文章可以属于多个 Topic 吗？**
A: 目前系统支持一篇文章属于一个 Topic。如需多个，可以使用标签功能。

**Q: 如何显示 Topic 的文章计数？**
A: 在配置中设置 `count` 字段，系统会自动显示。

## 相关资源

- [主题配置指南](../configuration/)
- [文章编写指南](../writing/)
- [自定义指南](../customization/)
