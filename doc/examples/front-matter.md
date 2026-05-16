# Front-matter 示例

Front-matter 是文章开头的 YAML/JSON 代码块，用于设置文章的元数据。

## 基本示例

```yaml
---
title: 我的第一篇文章
date: 2024-01-01 12:00:00
categories:
  - 编程
  - JavaScript
tags:
  - 教程
  - 入门
cover: /images/cover.jpg
excerpt: 这是文章的摘要，会显示在列表页
---
```

## 完整 Front-matter

```yaml
---
title: 文章标题
date: 2024-01-01 12:00:00
updated: 2024-01-15 18:00:00
categories:
  - 分类A
  - 分类B
tags:
  - 标签1
  - 标签2
keywords:
  - SEO关键词1
  - SEO关键词2
description: SEO描述
cover: /images/cover.jpg
excerpt: 文章摘要
toc: true # 开启目录
math: true # 开启数学公式
mermaid: true # 开启图表
sticky: true # 置顶文章
password: '' # 文章密码保护
sitemap: true # 加入站点地图
---
```

## 常用配置

### 1. 文章密码保护

```yaml
---
title: 加密文章
password: 123456
---
```

### 2. 文章置顶

```yaml
---
title: 置顶文章
sticky: true
---
```

### 3. 自定义 Banner

```yaml
---
title: 自定义Banner
banner_img: /images/custom-banner.jpg
banner_img_height: 80 # Banner 高度 %
banner_mask_alpha: 0.4 # 遮罩透明度
---
```

### 4. 开启数学公式

```yaml
---
title: 数学文章
math: true
---
```

### 5. 开启图表

```yaml
---
title: 图表文章
mermaid: true
---
```

### 6. 开启懒加载

```yaml
---
title: 文章
lazyload: true
---
```

### 7. 自定义 URL

```yaml
---
title: 文章
urlname: my-custom-url
---
```

### 8. 禁止评论

```yaml
---
title: 文章
comments: false
---
```

### 9. 禁止索引

```yaml
---
title: 文章
no_index: true
---
```

### 10. 设置永久链接

```yaml
---
title: 文章
permalink: /posts/2024/01/my-post.html
---
```

## Front-matter 类型

### YAML 格式（推荐）

```yaml
---
title: 标题
date: 2024-01-01
---
```

### JSON 格式

```json
---
{
  "title": "标题",
  "date": "2024-01-01"
}
---
```

## 特殊字段说明

| 字段         | 类型    | 说明                  |
| ------------ | ------- | --------------------- |
| `title`      | string  | 文章标题              |
| `date`       | date    | 发布日期              |
| `updated`    | date    | 更新日期              |
| `categories` | array   | 分类（支持嵌套）      |
| `tags`       | array   | 标签                  |
| `cover`      | string  | 封面图片路径          |
| `excerpt`    | string  | 文章摘要              |
| `math`       | boolean | 是否渲染数学公式      |
| `mermaid`    | boolean | 是否渲染 Mermaid 图表 |
| `toc`        | boolean | 是否显示目录          |
| `sticky`     | boolean | 是否置顶              |
| `password`   | string  | 阅读密码              |
| `comments`   | boolean | 是否开启评论          |
