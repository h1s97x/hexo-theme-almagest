# 配置详解

本文档详细介绍 Almagest 主题的所有配置项。

## 主题配置

主题配置文件位于 `themes/almagest/_config.yml`。

### 1. 导航栏 (navbar)

```yaml
navbar:
  blog_title: '我的博客' # 导航栏左侧标题
  ground_glass: # 毛玻璃效果（实验性）
    enable: false
    px: 3 # 模糊像素
    alpha: 0.7 # 不透明度
  menu: # 导航菜单
    home: { path: /, icon: home }
    archive: { path: /archives/, icon: archive }
    category: { path: /categories/, icon: category }
    tag: { path: /tags/, icon: tag }
    about: { path: /about/, icon: user }
```

### 2. 首页配置 (index)

```yaml
index:
  banner_img: /images/banner.jpg # Banner 图片
  banner_img_height: 100 # Banner 高度 %
  banner_mask_alpha: 0.3 # 遮罩透明度
  random_img: false # 随机 Banner
  parallax: true # 视差滚动
  slogan:
    enable: true
    typeSpeed: 70 # 打字速度
    cursorChar: '_' # 游标字符
    loop: false # 循环打字
  post_meta:
    date: true
    category: true
    tag: true
  post_sticky:
    enable: true
    icon: 'top'
```

### 3. 文章配置 (article)

```yaml
article:
  reading_time:
    awl: 2 # 平均字长
    wpm: 60 # 每分钟字数
  copyright:
    enable: true
    license: 'BY' # CC 协议
```

### 4. 功能开关 (features)

```yaml
features:
  search:
    enable: true
  toc:
    enable: true
    scroll_follow:
      enable: true
    expand:
      enable: true
      collapse_depth: 2
  code_copy:
    enable: true
  back_to_top:
    enable: true
  lazy_load:
    enable: true
    loading_img: /img/loading.gif
  reading_mode:
    enable: true
  pjax:
    enable: true
  pjax_loading:
    enable: true
    color: '#29d'
    height: 3
  scroll_animation:
    enable: true
```

### 5. 图片配置 (image)

```yaml
image:
  lazy_load: true
  loading_img: /img/loading.gif
  placeholder_color: '#1a1a2e'
  lightbox: true
  img_url_replace:
    - '-slim'
    - ''
```

### 6. 代码高亮 (code)

```yaml
code:
  highlight_line:
    enable: true
  collapse:
    enable: true
    max_lines: 30
```

### 7. 数学公式 (math)

```yaml
math:
  enable: false
  engine: katex # katex 或 mathjax
```

### 8. 暗色模式 (dark_mode)

```yaml
dark_mode:
  enable: true
  default: auto # auto | light | dark
```

### 9. CDN 前缀 (static_prefix)

```yaml
static_prefix:
  highlightjs: //cdn.jsdelivr.net/npm/highlight.js@11.7.0/
  katex: //cdn.jsdelivr.net/npm/katex@0.16.9/
  mathjax: //cdn.jsdelivr.net/npm/mathjax@3.2.2/
  pjax: //cdn.jsdelivr.net/npm/pjax@0.2.8/
```

### 10. 友链页面 (links)

```yaml
links:
  enable: true
  items:
    - title: '博客名'
      intro: '简介'
      link: 'https://example.com'
      avatar: '/images/avatar.png'
```

### 11. 图标库 (iconfont)

```yaml
iconfont: '//at.alicdn.com/t/font_xxxxxx.css'
```

### 12. 颜色配置 (color)

```yaml
color:
  body_bg_color: '#f0f2f5'
  text_color: '#3c4858'
  primary_color: '#4263eb'
  link_color: '#4263eb'
  link_hover_color: '#364fc7'
  navbar_bg_color: 'rgba(255,255,255,0.85)'
  # 暗色主题
  body_bg_color_dark: '#0a0e1a'
  text_color_dark: '#c4c6c9'
  primary_color_dark: '#6c8cef'
```

### 13. Open Graph

```yaml
open_graph:
  enable: true
  twitter_card: summary_large_image
  twitter_id: '@your_twitter_id'
```

## 完整配置示例

参考主题根目录的 `_config.yml` 文件。
