# 06 · 配置与多语言

## 第一部分：`_config.yml`（主题配置，312 行）

### 配置覆盖机制

站点侧通过 `theme_config:` 覆盖主题配置，Hexo 做**深度合并**：

```yaml
# 站点 _config.yml
theme: almagest
theme_config:
  title: '我的博客'
  features:
    comments: false
```

> `scripts/config/index.js` 会在构建时同步 `version`：若站点**未显式**在 `theme_config` 里
> 覆盖 `version`，则自动对齐 `package.json` 的版本号。

### 顶层分组清单（16 组）

#### ① 基础配置（扁平键）

| 键            | 默认值                                               | 用途                                            |
| ------------- | ---------------------------------------------------- | ----------------------------------------------- |
| `title`       | `'My Blog'`                                          | 导航栏 / 页脚 / 页面标题                        |
| `subtitle`    | `'A minimal and elegant theme'`                      | 首页                                            |
| `description` | `'Personal blog powered by Hexo and Almagest Theme'` | meta description + 侧边栏简介                   |
| `author`      | `'Your Name'`                                        | meta author + 页脚版权                          |
| `language`    | `en`                                                 | 对应 `languages/` 下的 `en` / `zh-CN` / `zh-TW` |
| `date_format` | `'YYYY-MM-DD'`                                       | 卡片与详情页日期格式                            |

#### ② `style:`

| 键                  | 默认值             | 说明                                                |
| ------------------- | ------------------ | --------------------------------------------------- |
| `primary_color`     | `'#0066cc'`        | `<meta name="theme-color">`（浏览器地址栏主题色）   |
| `prefers_theme`     | `'auto'`           | `auto` / `light` / `dark` 三值枚举                  |
| `smooth_transition` | `true`             | 平滑过渡                                            |
| `code_theme`        | `'atom-one-light'` | 高亮样式主题，优先级**高于** `code_highlight.theme` |

#### ③ `code_highlight:`

| 键       | 默认值                                                           | 说明                                                       |
| -------- | ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `enable` | `true`                                                           | 是否加载 highlight.js 样式表 + 运行库                      |
| `cdn`    | `'https://cdn.jsdelivr.net/npm/@highlightjs/cdn-assets@11.12.0'` | **包根地址**，模板自行拼 `/highlight.min.js` 与 `/styles/` |
| `theme`  | `'atom-one-light'`                                               | 高亮样式主题名                                             |

> `_config.yml` 此处有**大段警告注释**：必须用浏览器构建产物 `@highlightjs/cdn-assets`，
> **不能**改成 npm 包的 `highlight.js/lib/common.min.js`——后者仅 ~2.5KB、内部调用 `require()`，
> 浏览器会抛 `require is not defined`，`window.hljs` 恒为 `undefined`。
> 同时给出国内镜像示例（staticfile / bootcdn）。

#### ④ `fonts:`

| 键                 | 默认值                                                                                                        |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| `google_fonts`     | `true`（国内网络建议 `false`）                                                                                |
| `google_fonts_url` | `'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'`（可换 `fonts.loli.net`） |

#### ⑤ `menu:`

默认 5 项：`Home: /`、`Archives: /archives/`、`Categories: /categories/`、`Tags: /tags/`、`About: /about/`

格式为 `显示名称: 路径`，**支持多级子菜单**（文件内附被注释的示例）。

#### ⑥ `sidebar:`

| 键         | 默认值  | 说明             |
| ---------- | ------- | ---------------- |
| `enable`   | `true`  | 总开关           |
| `position` | `right` | `left` / `right` |
| `width`    | `300`   | 像素             |

#### ⑦ `features:` — 8 个功能开关，全部默认 `true`

| 键             | 控制什么                                         | 前端挂载                                      |
| -------------- | ------------------------------------------------ | --------------------------------------------- |
| `search`       | `/search/` 页 + `search.json` + 搜索按钮         | `search.js`                                   |
| `comments`     | 评论区（配合 `services.giscus`）                 | —                                             |
| `toc`          | 目录（**还需文章 front-matter 写 `toc: true`**） | —                                             |
| `code_copy`    | 代码复制按钮                                     | `code-copy.js`                                |
| `back_to_top`  | 返回顶部按钮                                     | ⚠️ **无对应 JS**，见 [09](09-known-issues.md) |
| `reading_time` | 阅读时间                                         | —                                             |
| `show_excerpt` | 卡片摘要                                         | —                                             |
| `starfield`    | 星空背景 + 天文组件                              | `astronomy.js`                                |

> **判定风格不统一**：`search` / `comments` / `toc` / `code_copy` / `reading_time` 用**真值判断**；
> `show_excerpt` / `starfield` 用 **`!== false` 空值判断**（不写即开）。

#### ⑧ `search:`

| 键             | 默认值 | 说明                       |
| -------------- | ------ | -------------------------- |
| `index_length` | `1500` | 单篇进入索引的正文长度上限 |

> 此处有大段体积估算注释：总体积 ≈ 文章数 × `index_length`，附「500 篇 / 1500 字 → 英文 ~750KB、
> 中文 ~2.2MB、gzip 约 1/3」的实测参考；建议 600~800；**调小可能导致长文后半部分搜不到**。

#### ⑨ `social:`

`github` / `twitter` / `weibo` / `zhihu` / `email`，**空串表示不显示对应图标**。

#### ⑩ `services:`

| 服务               | 键                                                                                                                                                                                                                                      |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `giscus`           | `enable: false`、`repo`、`repo_id`、`category: 'Announcements'`、`category_id`、`mapping: 'pathname'`、`reactions_enabled: true`、`emit_metadata: false`、`input_position: 'bottom'`、`theme: 'light'`、`lang: 'en'`、`loading: 'lazy'` |
| `google_analytics` | `enable: false`、`tracking_id`                                                                                                                                                                                                          |
| `baidu_analytics`  | `enable: false`、`tracking_id`                                                                                                                                                                                                          |

#### ⑪ `pagination:`

`per_page: 10`、`type: 'pagination'`（`pagination` / `infinite`）

#### ⑫ `article:`

`excerpt_length: 200`、`show_updated: true`、`show_reading_time: true`

#### ⑬ `page:`

`show_updated: true`

#### ⑭ `image:`

| 键                  | 默认值      | 说明                                                             |
| ------------------- | ----------- | ---------------------------------------------------------------- |
| `lazy_load`         | `true`      | 最终 HTML 会添加 `loading="lazy" + data-src`，**始终保留 `src`** |
| `placeholder_color` | `'#f0f0f0'` | 懒加载占位 / 破图背景色                                          |

#### ⑮ `inject:`

`head: ''`、`body_end: ''` —— 自定义 HTML 注入点

#### ⑯ 高级（扁平键）

| 键           | 默认值    | 说明                                                            |
| ------------ | --------- | --------------------------------------------------------------- |
| `debug`      | `false`   | 调试模式                                                        |
| `cdn_prefix` | `''`      | 资源统一前缀（便于部署 CDN）                                    |
| `version`    | `'1.1.0'` | 缓存版本号，拼在 `?v=` 后。**升级后需同步修改**，否则命中旧缓存 |

> 文件尾部还有一段「性能优化提示」注释（非配置项）：① Stylus 压缩 `stylus.compress: true`；
> ② Google Fonts 国内建议关闭；③ 图片懒加载默认开启。

### ⚠️ 配置项与实际能力的落差

以下几组配置被 `scripts/lib/config.js` 的白名单承认（因此不会报"未知配置项"），
但**主题 `_config.yml` 里没有它们**，也没有默认值——需要用户在站点 `theme_config:` 里自行定义：

| 配置组                            | 用途                       | 消费位置                 |
| --------------------------------- | -------------------------- | ------------------------ |
| `astronomy.events`                | 天文日历的"即将到来事件"   | `astronomy-calendar.ejs` |
| `wiki.projects` / `wiki.edit_url` | Wiki 侧栏项目树 / 编辑链接 | `wiki-nav.ejs`           |
| `topics` / `topics_archive_url`   | 专题侧栏                   | `topic-nav.ejs`          |
| `notebooks.categories`            | 笔记簿侧栏                 | `notebooks-nav.ejs`      |

## 第二部分：`languages/`（3 个文件）

| 文件        | 行数 | 语言     |
| ----------- | ---- | -------- |
| `en.yml`    | 162  | 英语     |
| `zh-CN.yml` | 161  | 简体中文 |
| `zh-TW.yml` | 161  | 繁体中文 |

**叶子键数量：三者均为 116 个**，键集合**完全一致**（无缺失、无多余、无重复、无空值）。

> `zh-TW.yml` 正文用词偶有混入简体字（如「菜单」「项目」「加載」），同时保留了「麵包屑」这类
> 繁体写法，属翻译质量问题。

### 键的组织方式

**55 个顶层扁平键**，按注释分组：

```
导航(5) / 分页(3) / 文章(8) / 侧边栏(2) / 评论(1) / 目录(2) /
无障碍(6) / 社交(1) / 页脚(3) / 搜索(5) / 分类(2) / 标签(3) /
归档(2) / 404(8) / 图片(2) / 代码(2)
```

**4 个嵌套分组**：

| 分组        | 子键数 | 内容                                                                                   |
| ----------- | ------ | -------------------------------------------------------------------------------------- |
| `wiki`      | 5      | Wiki 相关文案                                                                          |
| `topic`     | 5      | 专题相关文案                                                                           |
| `notebooks` | 7      | 笔记簿相关文案                                                                         |
| `astronomy` | **44** | 日历月份名、星期 `sunday..saturday`、事件/观测字段、**12 星座译名**（`aries..pisces`） |

### 带占位模板的键

```yaml
# en.yml
read_time: '{{count}} min read'

# zh-CN.yml / zh-TW.yml
read_time: '{{count}} 分钟阅读'
```

> 前端脚本目前**没有做 `{{count}}` 的替换**——这是文案模板 vs 实际拼接方式之间的潜在不一致点。
> 实际阅读时间由 `get_reading_time` helper 返回数字，模板自行拼接。

### 三份文件的差异

| 差异项 | 详情                                                                                                                                                            |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 注释   | 仅 `en.yml` 顶部多一行 `# Theme name in footer (branding)`                                                                                                      |
| 键顺序 | 「无障碍」组顺序不同：`en` 为 `toggle_theme, toggle_menu, back_to_top`；`zh-CN` / `zh-TW` 为 `back_to_top, toggle_theme, toggle_menu`（**键相同，仅顺序差异**） |

### 新增语言键的检查清单

1. 在 `_config.yml` 的 `language` 里确认目标语言已有文件
2. 三个文件**同时**加键（键集合必须一致，否则某语言下会显示键名）
3. 模板中用 `<%= __('key_name') %>` 调用
4. 前端需要的文案，通过 `_partial/scripts.ejs` 注入成 `window.__almagest*` 变量传给 JS

---

**上一篇**：[05 · 样式体系](05-styles.md) ｜ **下一篇**：[07 · 依赖关系](07-dependencies.md)
