# 高级功能

## 1. 自定义 CSS

### 添加自定义样式

在 `source/css/` 目录下创建 `custom.styl`：

```stylus
// source/css/custom.styl
// 自定义样式
.my-custom-class
  color: red
```

然后在主题的 `main.styl` 中引入：

```stylus
// 在 main.styl 末尾添加
@import 'custom'
```

### 使用 CSS 变量

主题提供了丰富的 CSS 变量：

```css
:root {
  --color-primary: #4263eb;
  --color-bg: #f0f2f5;
  --color-text: #3c4858;
  --navbar-height: 60px;
}
```

## 2. 自定义 JavaScript

### 添加自定义脚本

在 `source/js/` 目录下创建 `custom.js`：

```javascript
// source/js/custom.js
document.addEventListener('DOMContentLoaded', () => {
  console.log('Custom script loaded');
});
```

然后在 `_config.yml` 中引入：

```yaml
custom_js:
  - /js/custom.js
```

## 3. 扩展布局

### 创建自定义页面模板

在 `layout/` 目录下创建 `.ejs` 文件：

```ejs
<!-- layout/custom.ejs -->
<%- partial('_partial/head') %>
<body>
  <%- partial('_partial/header') %>
  <main class="main">
    <div class="container custom-container">
      <%- page.content %>
    </div>
  </main>
  <%- partial('_partial/footer') %>
  <%- partial('_partial/scripts') %>
</body>
</html>
```

在文章或页面的 Front-matter 中指定模板：

```yaml
---
title: 自定义页面
layout: custom
---
```

## 4. 添加自定义评论系统

### 接入 Waline

```yaml
# 在 _config.yml 中添加
waline:
  serverURL: https://your-waline-server.vercel.app
  path: window.location.pathname
  meta: ['nick', 'mail', 'link']
  requiredMeta: ['nick']
```

### 接入 Twikoo

```yaml
twikoo:
  envId: your-env-id
  region: ap-shanghai
```

## 5. 接入网站统计

### Google Analytics

```yaml
google_analytics: G-XXXXXXXXXX
```

### 百度统计

在 `_config.yml` 中：

```yaml
baidu_analytics: your-baidu-analytics-id
```

## 6. 静态资源 CDN 配置

使用自己的 CDN：

```yaml
static_prefix:
  highlightjs: https://cdn.your-cdn.com/highlight.js/
  katex: https://cdn.your-cdn.com/katex/
  pjax: https://cdn.your-cdn.com/pjax/
```

## 7. 自定义字体

```yaml
font:
  font_size: 16px
  font_family: "'PingFang SC', 'Microsoft YaHei', sans-serif"
  code_font_size: 85%
  letter_spacing: 0.02em
```

## 8. Pjax 配置优化

```yaml
pjax:
  enable: true
  timeout: 10000 # 超时时间 ms
  cacheBust: true # 缓存刷新

pjax_loading:
  enable: true
  color: '#29d' # 进度条颜色
  height: 3 # 进度条高度
```

## 9. 代码高亮增强

### 使用行高亮

````markdown
```javascript
// [!code highlight]
const x = 1; // 这行会高亮
const y = 2;
```
````

### 代码折叠

超过指定行数的代码块会自动显示折叠按钮：

```yaml
code:
  collapse:
    enable: true
    max_lines: 30 # 超过此行数折叠
```

## 10. 国际化

### 添加新语言

在 `languages/` 目录下创建 `ja.yml`：

```yaml
home: ホーム
archive: アーカイブ
category: カテゴリー
tag: タグ
about: について
```

### 修改翻译

编辑现有语言文件：

```yaml
# languages/zh-CN.yml
home: 首页
archive: 归档
category: 分类
tag: 标签
about: 关于
```
