# 截图 / Screenshots

> Hexo Theme Almagest 星空化改造的验收截图。均为 Chromium 1440×900 实机渲染（移动端 375×812）。

| 文件 | 说明 |
|---|---|
| `home-dark.png` | 首页 · 暗色（深空底 + 星空 + 玻璃卡片） |
| `home-light.png` | 首页 · 亮色（月白冷调） |
| `article-dark.png` | 文章详情 · 暗色（含目录） |
| `article-light.png` | 文章详情 · 亮色 |
| `code-highlight-dark.png` | 代码高亮 · 暗色（atom-one-dark） |
| `code-highlight-light.png` | 代码高亮 · 亮色 |
| `category-dark.png` | 分类页 · 暗色（标题显示分类名） |
| `category-light.png` | 分类页 · 亮色 |
| `tag.png` | 标签页（标题显示标签名） |
| `tags.png` | 标签云总览 |
| `archives.png` | 归档页 |
| `about.png` | 独立页面 |
| `mobile-home.png` | 移动端 · 首页 |
| `mobile-menu.png` | 移动端 · 汉堡菜单展开 |
| `mobile-article.png` | 移动端 · 文章页 |

## 如何复现

```bash
hexo clean && hexo generate && hexo server
```

注意：截图中的代码高亮、复制按钮与目录依赖以下配置，否则不会出现 ——

```yaml
# 站点 _config.yml
syntax_highlighter:      # 必须留空
```

```yaml
# 文章 front-matter
toc: true                # 必须显式声明
```
