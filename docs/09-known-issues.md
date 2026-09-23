# 09 · 实现现状与已知缺陷

> **本文档记录的是当前代码的「真实状态」，不是待办清单。**
> 所有条目均经实际验证（grep / 读源码 / 跑构建），不是推测。
> **改代码前请先读这份文档**，避免在错误前提下工作。

## 分级说明

| 级别           | 含义                                         |
| -------------- | -------------------------------------------- |
| **A · 功能级** | 用户可感知的功能不工作，或产生错误输出       |
| **B · 未接线** | 代码/模板已写好，但缺少接入点，当前不生效    |
| **C · 一致性** | 不产生明显故障，但存在漂移风险或代码质量问题 |

---

## A · 功能级问题（3 项）

### A1. `config` 被遮蔽 → 导航 active 态永不生效、拼接出 `undefined` 链接

**级别**：A ｜ **类型**：真实缺陷

**现象**：

- `wiki` / `topic` / `notebooks` 三种页面的左侧导航，**当前项永远不会高亮**
- 笔记簿页面的「新建笔记」按钮链接渲染成 **`undefinednotebooks/new`**

**根因**：模板首行把 `config` 重新绑定为主题配置（`const config = theme;`），于是 `config.url` 与 `config.root` 都是 `undefined`。

**证据**（实际代码）：

```
layout/_partial/notebooks-nav.ejs:15   class="<%= category.path === config.url + category.path ? 'active' : '' %>"
layout/_partial/notebooks-nav.ejs:35   class="<%= notebook.path === config.url + notebook.path ? 'active' : '' %>"
layout/_partial/notebooks-nav.ejs:55   <a href="<%= config.root %>notebooks/new" class="notebooks-new-btn">
layout/_partial/topic-nav.ejs:14       class="topic-item-link <%= topic.path === config.url + topic.path ? 'active' : '' %>"
layout/_partial/topic-nav.ejs:26       class="<%= subtopic.path === config.url + subtopic.path ? 'active' : '' %>"
layout/_partial/wiki-nav.ejs:22        class="<%= page.path === config.url + page.path ? 'active' : '' %>"
layout/_partial/wiki-nav.ejs:31        class="<%= child.path === config.url + child.path ? 'active' : '' %>"
```

`undefined + category.path` 得到字符串 `"undefined<path>"`，与 `category.path` 比较**恒为 `false`**。

**修复方向**：把 `config.url` / `config.root` 改为站点配置来源（如模板参数 `site.config.url`），
或直接省略前缀只比较 `path`。涉及 7 处。

---

### A2. 返回顶部按钮永不出现

**级别**：A ｜ **类型**：配置开关与实现脱节

**现象**：`features.back_to_top` 默认为 `true`，但按钮**永远不会显示**。

**根因链**：

1. `_config.yml` → `features.back_to_top: true`（默认）
2. `layout.ejs` → 输出 `<button id="back-to-top">`
3. `_layout.styl` → `.back-to-top { display: none; ... &.show { display: flex } }`
4. **没有任何 JS 添加 `.show` 类**

**验证**：

```bash
grep -rn 'back-to-top\|backToTop\|addEventListener(.scroll' source/js/
# → 无任何命中（5 个 JS 文件全部确认没有 scroll 监听）
```

**修复方向**：在 `theme.js` 里补一段 scroll 监听（阈值出现 → 加 `.show`，点击 → `scrollTo({ top: 0 })`），
注意加节流。**这是最容易补的一个缺口，且补齐后即为完整功能。**

---

### A3. 天文日历的事件数据未接入

**级别**：A ｜ **类型**：占位实现

**现象**：日历能正常渲染、能翻月、能高亮今天，但**永远不会显示 `.has-event`**；点任意日期恒显示英文提示 `No events for this day`。

**证据**（`source/js/astronomy.js`）：

```js
// L396
hasEvent(_year, _month, _day) {
  // 事件数据尚未接入，占位返回 false。
  // 接入真实数据后，此处按 (year, month, day) 查询即可点亮 .has-event。
  return false;
},

// L414
noEventsMsg.textContent = window.__almagestNoEventsText || 'No events for this day';
```

**二次问题**：`window.__almagestNoEventsText` **全项目没有任何模板注入它**（已全库检索确认），
所以提示文案恒为英文兜底值——中文站点上会露出英文。

**修复方向**：

1. 在 `astronomy-calendar.ejs` 里注入 `window.__almagestNoEventsText = __('astronomy.no_events')`
2. 在 `hasEvent()` 里读 `config.astronomy.events`（注意它是**服务端配置**，前端拿不到——
   需要在模板里把事件数据序列化成 `window.__almagestAstronomyEvents` 传给 JS）

---

## B · 已实现但未接线（4 项）

### B1. 4 个天文组件模板是「孤儿」

**级别**：B ｜ **类型**：能力未暴露

**现象**：以下 4 个模板**没有被任何模板 include**，且**没有任何配置可以启用它们**：

| 模板                              | 内容                                                      | 数据来源                   |
| --------------------------------- | --------------------------------------------------------- | -------------------------- |
| `_partial/astronomy-card.ejs`     | 天文信息卡（constellation / event / celestial_body 三型） | 需调用方传 `card` 局部变量 |
| `_partial/astronomy-calendar.ejs` | 天文事件日历                                              | `config.astronomy.events`  |
| `_partial/observation-guide.ejs`  | 观星指南                                                  | `page.*` front-matter 字段 |
| `_partial/constellation-nav.ejs`  | 十二星座导航                                              | 代码内硬编码 12 项         |

**注意**：`features.starfield` **只控制** `.starry-background` 节点与 `astronomy.js` 的加载，
**不影响这 4 个模板**。

**同时**：`astronomy.js` 里对应的运行时逻辑（`initAstronomyCards` / `initConstellationNav` / `initCalendar`）
**都已实现并且会执行**——只是找不到 DOM 目标，静默跳过。

**修复方向**（三选一）：

- 在 `_config.yml` 增加 `features.astronomy_widgets` 之类的开关，并在某个页面模板里 include
- 在文档里明确告知「这 4 个是组件库，需手动 include」
- 提供示例页面（如 `source/astronomy/index.md` 演示页）

> 建议至少做第二条——否则使用者永远不知道它们存在。

---

### B2. 3 个 helper 注册但主题零调用

**级别**：B ｜ **类型**：预留 API

| helper             | 模板调用次数 |
| ------------------ | ------------ |
| `get_excerpt`      | 2            |
| `get_reading_time` | 3            |
| `is_featured`      | **0**        |
| `get_categories`   | **0**        |
| `get_tags`         | **0**        |

**判断**：这 3 个是**为使用者预留的模板 API**（让用户在自己页面里调用），主题自身不使用。
**不是 bug，但需要在文档里说明**，否则读者会疑惑「注册了为什么不用」。

---

### B3. `breadcrumb.ejs` 可能永不渲染

**级别**：B ｜ **类型**：依赖外部 generator

**现象**：面包屑导航可能完全不输出。

**根因**：`breadcrumb.ejs` 的所有分支基于 `page.type`，但：

- 主题自带的 `scripts/generators/index.js` **只注入 `layout` 与 `data`，不注入 `type`**
- `page.type` 是否存在取决于官方插件 `hexo-generator-archive / category / tag` 是否安装

这些官方插件未启用时，`breadcrumbs.length` 恒为 1 → `<% if (breadcrumbs.length > 1) %>` 不成立 → 不输出。

**修复方向**：在主题 generator 的 `data` 里补 `type` 字段，或改用 `page.layout` 判断。

---

### B4. 前端 `search.js` 依赖的组件页同样受 B1 影响

`astronomy.js` 依赖的 4 组选择器中，3 组所在模板是 B1 里的孤儿模板。
若用户不手动 include，这些运行时逻辑永远不会被触发。

---

## C · 一致性与代码质量（10 项）

### C1. 强调色双轨不一致

| 轨道           | 变量                                           | 值                | 作用范围                                                             |
| -------------- | ---------------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| 编译期         | `$primary-color`                               | `#67e8f9`（青）   | `.btn-primary`、`.back-to-top`、`.code-copy-btn:hover`、`.hljs-link` |
| 运行期（亮色） | `--color-accent` / `--color-button-primary-bg` | `#4f46e5`（靛蓝） | 亮色主题下的按钮、链接、强调                                         |

**后果**：亮色主题下同一页面出现**两套强调色并存**。

**另**：`_config.yml` 的 `style.primary_color: '#0066cc'` 仍是原始商务蓝，只用于
`<meta name="theme-color">`。三处颜色互不相同。

**修复方向**：确定一个品牌色，同时改 `_variables.styl` 的 `$primary-color`、
两个 `_theme-*.styl` 的 `--color-accent`、以及 `_config.yml` 的 `style.primary_color`。

---

### C2. 文档漂移：`docs/DEVELOPMENT.md` 的文件树与实际不符

| 文档里写的                       | 实际情况                                          |
| -------------------------------- | ------------------------------------------------- |
| `_partial/categories-widget.ejs` | **不存在**（侧栏分类是内联在 `sidebar.ejs` 里的） |
| `_partial/tags-widget.ejs`       | **不存在**（同上）                                |
| `doc/`                           | 实际目录是 `docs/`                                |

---

### C3. `config.version` 的兜底默认值与实际值不一致

```ejs
layout/_partial/head.ejs:4      const version = config.version || '1.0.0';
layout/_partial/scripts.ejs:7   const version = config.version || '1.0.0';
```

而 `_config.yml` 与 `package.json` 都是 `1.1.0`。未配置 `version` 时会拼出 `?v=1.0.0`，
可能导致缓存刷新失效。

**修复方向**：兜底值改为从 `package.json` 读取，或统一成同一个常量。

---

### C4. `index.ejs` 的死变量

```ejs
layout/index.ejs:4   const per_page = config.pagination?.per_page || 10;
```

计算后**从未使用**。真实每页条数由站点 `per_page` / `index_generator.per_page` 决定。

---

### C5. generator 路径与官方插件重叠

主题自带 `archive` / `categories` / `tags` 三个 generator，与官方插件
`hexo-generator-archive / category / tag` 产出**相同路径**（`/archives/`、`/categories/`、`/tags/`）。

**后果**：后注册者覆盖前者，行为取决于插件加载顺序。

**修复方向**：文档里明确「二选一」，或主题只提供官方没有的 `search` / `search-page`。

---

### C6. `search.js` 缺少 `readyState` 兜底

```js
// search.js —— 只监听 DOMContentLoaded
document.addEventListener('DOMContentLoaded', initSearch);
```

其余 4 个脚本都写了 `if (document.readyState === 'loading') { addEventListener } else { 立即执行 }`
的双重保险。`search.js` 没有。

由于所有脚本都用 `defer` 加载（执行时 `readyState` 通常已是 `interactive`），
`DOMContentLoaded` 可能**已经派发过**，理论上存在初始化不执行的风险。

**修复方向**：与其余 4 个脚本统一写法。

---

### C7. `highlightQuery` 未转义正则元字符

```js
new RegExp('(' + query.split(/\s+/).join('|') + ')', 'gi');
```

用户在搜索框输入 `.` `*` `(` `[` 等字符时，会产生意外的匹配范围，极端情况抛异常。

**修复方向**：对每个分词做 `replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`。

---

### C8. 搜索结果的部分输出未做转义

| 位置                           | 问题                                 |
| ------------------------------ | ------------------------------------ |
| `displayResults` 的 `item.url` | 未转义直插 `href`                    |
| `showMessage` 的 `text`        | 未转义直插 `innerHTML`               |
| `highlightQuery` 的返回        | 未 HTML 转义（虽已用 `<mark>` 包裹） |

**风险评估**：`search.json` 的内容来自**作者自己的文章**，静态站点场景下不是外部输入，
**实际安全风险低**。但从健壮性看，一旦文章标题含 `<` 或 `&` 就会渲染异常。

**修复方向**：复用文件内已有的 `escapeHtml()`。

---

### C9. 搜索页的「空输入」与「无结果」用了同一文案

`layout/search.ejs` 同时把 `__almagestSearchEmpty` 与 `__almagestSearchNoResults`
赋成了 `__('search_no_results')`。用户体验上，"请输入关键词"和"没找到结果"应该分开。

---

### C10. `read_time` 的占位模板未被替换

```yaml
# languages/en.yml
read_time: '{{count}} min read'
```

前端脚本**没有做 `{{count}}` 替换**。实际阅读时间由 `get_reading_time` helper 返回数字，
模板自行拼接——这个 `{{count}}` 模板字符串是**未被使用**的写法。

---

## 汇总表

| 编号 | 问题                                                 | 级别 | 影响面                        |
| ---- | ---------------------------------------------------- | ---- | ----------------------------- |
| A1   | `config` 遮蔽导致导航 active 失效 + `undefined` 链接 | A    | wiki / topic / notebooks 三页 |
| A2   | 返回顶部按钮永不出现                                 | A    | 全站                          |
| A3   | 天文日历事件数据未接入 + 提示文案未 i18n             | A    | 天文日历                      |
| B1   | 4 个天文组件模板是孤儿                               | B    | 天文组件                      |
| B2   | 3 个 helper 零调用                                   | B    | 使用者 API                    |
| B3   | `breadcrumb.ejs` 可能永不渲染                        | B    | 面包屑                        |
| C1   | 强调色双轨不一致（三处颜色互不相同）                 | C    | 全站配色                      |
| C2   | `docs/DEVELOPMENT.md` 文件树漂移                     | C    | 文档                          |
| C3   | `version` 兜底值 `1.0.0` ≠ 实际 `1.1.0`              | C    | 缓存刷新                      |
| C4   | `index.ejs` 死变量 `per_page`                        | C    | —                             |
| C5   | generator 路径与官方插件重叠                         | C    | 归档/分类/标签页              |
| C6   | `search.js` 缺 `readyState` 兜底                     | C    | 搜索初始化                    |
| C7   | `highlightQuery` 未转义正则元字符                    | C    | 搜索高亮                      |
| C8   | 搜索结果部分输出未转义                               | C    | 搜索渲染                      |
| C9   | 「空输入」与「无结果」同文案                         | C    | 搜索体验                      |
| C10  | `read_time` 占位模板未被使用                         | C    | 多语言                        |

## 建议的修复优先级

**第一梯队（用户可感知 + 改动小）**

1. **A2 返回顶部** —— 补 20 行 JS 即可，功能立刻完整
2. **C1 强调色统一** —— 纯改值，消除视觉不一致
3. **A1 导航 active 态** —— 7 处替换，修掉 `undefined` 链接这个明显错误

**第二梯队（能力暴露）**

4. **A3 日历事件接入** + 补 i18n 文案
5. **B1 天文组件文档化**（至少让使用者知道它们存在）

**第三梯队（健壮性）**

6. C3 / C4 / C6 / C7 / C8 / C9 / C10 —— 逐个清理
7. C2 文档同步（本文档已可作为基准）
8. C5 决定「主题 generator 与官方插件」的取舍策略

---

**上一篇**：[08 · 运行方式](08-getting-started.md) ｜ **返回**：[Wiki 首页](README.md)
