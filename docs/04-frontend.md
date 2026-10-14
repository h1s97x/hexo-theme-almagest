# 04 · 前端脚本层（`source/js/`）

5 个文件、共 1,418 行。**无构建步骤**——原样复制到 `public/js/`，不压缩、不转译、不打包。

| 文件           | 行数 | 形态                    | 对外暴露                      | 挂载条件                       |
| -------------- | ---- | ----------------------- | ----------------------------- | ------------------------------ |
| `theme.js`     | 275  | IIFE                    | `window.ThemeManager`         | 无条件                         |
| `search.js`    | 386  | IIFE                    | `window.__almagestSearch`     | `features.search`              |
| `lazy-load.js` | 141  | IIFE                    | 无                            | `image.lazy_load`              |
| `code-copy.js` | 97   | IIFE                    | 无                            | `features.code_copy`           |
| `astronomy.js` | 518  | **全局脚本**（非 IIFE） | 全局常量 + `window.Astronomy` | `features.starfield !== false` |

> **形态不统一**是当前的实际情况：4 个 IIFE + 1 个全局脚本。`astronomy.js` 直接在顶层定义
> 全局常量与 `Astronomy` 对象（历史原因，它是最后加入的模块）。若要统一，建议以 IIFE 为准。

全部脚本用 `defer` 加载，URL 为 `cdn_prefix + path + '?v=' + version`。

## 1. `theme.js` — 明暗切换与移动菜单

**形态**：IIFE，导出 `window.ThemeManager`，派发 `CustomEvent('themechange')`。

**常量**：`STORAGE_KEY = 'theme-preference'`、`THEME_ATTRIBUTE = 'data-theme'`、`LIGHT_THEME = 'light'`、`DARK_THEME = 'dark'`

| 函数                              | 说明                                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------------- |
| `getSystemPreference()`           | `matchMedia('(prefers-color-scheme: dark)')` → `'dark'` / `'light'` / `null`          |
| `getCurrentTheme()`               | 读 `<html data-theme>`，缺省 `'light'`                                                |
| `applyTheme(theme)`               | 仅接受 light/dark，`setAttribute` + 更新按钮态                                        |
| `toggleTheme()`                   | 反色 → apply → 存 localStorage → 派发事件                                             |
| `saveThemePreference(theme)`      | `localStorage.setItem`，`try/catch` 静默失败                                          |
| `updateThemeButtonState(theme)`   | `#theme-toggle` 加/移除 `.dark-mode`，同步 `aria-pressed`                             |
| `dispatchThemeChangeEvent(theme)` | `window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }))`         |
| `setupThemeToggle()`              | `#theme-toggle` 绑 `click` + `keydown`（Enter / Space）                               |
| `listenToSystemPreference()`      | 监听 `matchMedia change`，**仅当用户未存偏好时**才应用系统主题                        |
| `setupMobileMenu()`               | 见下                                                                                  |
| `setupSearchButton()`             | `#search-btn` / `#search-btn-404` → 跳转 `/search/`（**硬编码路径，未走 `url_for`**） |
| `initTheme()`                     | 依次调用上述 setup                                                                    |

**`setupMobileMenu()` 的完整交互**（这是修过 bug 的部分）：

- 按钮 click → `menu.classList.toggle('open')` + 同步 `aria-expanded`
- 菜单内 `<a>` click → 关闭
- `document` click（点在菜单与按钮之外）→ 关闭
- `document` `keydown` Escape → 关闭
- `window` resize 且 `innerWidth >= 768` → 清除 `open`

**对外 API**：`getCurrentTheme` / `setTheme(theme)` / `toggleTheme` / `getSystemPreference` / `onThemeChange(callback)`

**DOM 选择器**：`#theme-toggle`、`.dark-mode`、`#mobile-menu-btn`、`#mobile-menu-toggle`、`#mobile-menu`、`.open`、`#search-btn`、`#search-btn-404`

> ⚠️ **本文件没有 scroll 监听，也没有 `.back-to-top` 逻辑。** 5 个 JS 文件全部确认无 `scroll` 事件、
> 无 `back-to-top` 字符串。而 `features.back_to_top` 默认为 `true`、`_layout.styl` 里 `.back-to-top`
> 是 `display: none` 且仅 `.show` 时显示——`.show` 类**无人添加**，按钮永不出现。

## 2. `search.js` — 本地检索（含 CJK bigram）

**形态**：IIFE，导出 `window.__almagestSearch`（`setEmptyText` / `setNoResultsText`，运行时覆盖 `__almagestConfig.search` 文案），自动初始化（`readyState` 双重保险）。

### 全部常量

| 常量             | 值                                                                    | 含义                                      |
| ---------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| `DEBOUNCE_MS`    | `150`                                                                 | 输入防抖                                  |
| `MAX_RESULTS`    | `20`                                                                  | 结果上限                                  |
| `EXCERPT_LENGTH` | `150`                                                                 | 摘要字符数                                |
| `TITLE_WEIGHT`   | `10`                                                                  | 标题命中权重                              |
| `BODY_WEIGHT`    | `1`                                                                   | 正文命中权重                              |
| `CJK_RANGE`      | `'\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\u3040-\u30ff\uac00-\ud7af'` | 扩展A + 统一表意 + 兼容表意 + 假名 + 谚文 |
| `NON_WORD`       | `[^0-9a-z{CJK_RANGE}]+`                                               | 分词分隔符                                |

模块级状态：`searchData` / `searchIndex` / `resultCache` / `dataReady` / `debounceTimer`

### `splitWords(lowerText)` — CJK bigram 算法

**输入必须是已 `toLowerCase()` 且 `trim()` 的文本。**

```js
function splitWords(lowerText) {
  const words = [];
  lowerText.split(NON_WORD).forEach(function (raw) {
    if (!raw) return;
    words.push(raw); // ① 整串原样入列
    if (raw.length > 2 && CJK_CHAR.test(raw.charAt(0))) {
      // ② 长度 >2 且首字符是 CJK
      for (let i = 0; i + 2 <= raw.length; i++) {
        words.push(raw.slice(i, i + 2)); // ③ 滑动窗口产出全部 bigram
      }
    }
  });
  return words;
}
```

**行为示例**：

| 输入                 | 输出                                         | 说明                                                   |
| -------------------- | -------------------------------------------- | ------------------------------------------------------ |
| `天文望远镜`（5 字） | `['天文望远镜','天文','文望','望远','远镜']` | 整串 + 4 个 bigram                                     |
| `天文`（2 字）       | `['天文']`                                   | `length > 2` 不成立——**2 字串本身就是 bigram，不再切** |
| `天`（1 字）         | `['天']`                                     | 无 bigram                                              |
| `abc天文`            | `['abc天文']`                                | 首字符非 CJK（`charAt(0)` 判断），**不产 bigram**      |
| `telescope`          | `['telescope']`                              | 英文整词，**不做前缀切分、不做词干化**                 |

> **两个由此推导出的检索特性**：
>
> 1. **中文单字查询**（如"镜"）无索引命中，依赖下面的全量线性扫描兜底
> 2. **英文前缀查询**（如 `tele` 查 `telescope`）同样靠兜底扫描

### 其余函数

| 函数                                        | 说明                                                                                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `indexWords(lowerText, docIndex)`           | 对每个词写入倒排表 `searchIndex[word] = [docIndex, ...]`（`indexOf` 去重）                                                                                                 |
| `buildSearchIndex()`                        | 归一化 `searchData` 为 `{title,url,date,text}`；`text` 缺失时**回退读旧字段 `content`**；预计算 `doc._title` / `doc._text` 小写副本；对两者分别 `indexWords`               |
| `initSearch()`                              | 取 `#search-form` / `#search-input` / `#search-results`，任一缺失即 return；读 URL 的 `?q=` 并预填；绑 `submit`（立即执行，清防抖）与 `input`（150ms 防抖）                |
| `loadSearchData(done)`                      | `dataReady` 为真则直接回调（**全站只加载一次**）；URL 取 `__almagestConfig.search.url \|\| '/search.json'`；`fetch` 不存在 → 空数据集降级；失败 `console.error` 后同样降级 |
| `performSearch(query, container)`           | 见下                                                                                                                                                                       |
| `showMessage(container, text)`              | `innerHTML = '<div class="no-results"><p>' + text + '</p></div>'`（text 经 `escapeHtml` 转义）                                                                             |
| `displayResults(results, container, query)` | 拼 `.search-results-list` → `.search-result-item`（标题 + 摘要 + URL）                                                                                                     |
| `getExcerpt(content, query, length)`        | 命中位置**前移 50 字符**为起点，两端补 `...`                                                                                                                               |
| `highlightQuery(text, query)`               | `query.split(/\s+/).join('\|')` 作正则，`replace(..., '<mark>$1</mark>')`。**未做正则元字符转义**                                                                          |
| `escapeHtml(text)`                          | 映射 `& < > " '`                                                                                                                                                           |

**`performSearch` 的检索与打分**：

```
1. cacheKey = query.toLowerCase()，命中 resultCache 直接返回
2. queryWords = splitWords(cacheKey)，空则返回空结果
3. 【倒排】遍历 queryWords 查 searchIndex[word]，命中的文档下标入 candidates，indexedHitCount++
4. 【兜底】当 indexedHitCount === 0 → 对全部 searchData 线性扫描
          （用预计算的 _title / _text 做 indexOf）
5. 【打分】对每个候选：标题命中 +10，正文命中 +1；score > 0 才收集
6. 【排序】仅按 score 降序（无次级排序，日期不参与）
7. 写入 resultCache 后 displayResults
```

**依赖的全局变量**：`window.__almagestConfig.search`（`url` / `empty` / `noResults`，由 `scripts.ejs` 统一注入；空输入与无结果是两个独立文案）

**DOM 选择器**：`#search-form`、`#search-input`、`#search-results`；产出 `.no-results`、`.search-results-list`、`.search-result-item`、`.result-title`、`.result-excerpt`、`.result-link`、`<mark>`

## 3. `lazy-load.js` — 图片懒加载兜底

**形态**：IIFE，无导出。
**常量**：`LOADED_CLASS = 'loaded'`、`ERROR_CLASS = 'error'`

| 函数              | 说明                                                                                                                                                 |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ensureSrc(img)`  | 缺 `src` 且有 `data-src` → 赋值；有 `data-srcset` → 赋值 `srcset`；支持原生 lazy 且无 `loading` → 设 `img.loading = 'lazy'`                          |
| `bindState(img)`  | 缓存命中（`complete && naturalWidth > 0`）直接加 `.loaded`；否则绑一次性 `load` / `error`。**`error` 时移除 `data-src` 防反复触发破图**              |
| `loadAllImages()` | 对 `img[data-src]` 全量 `ensureSrc`（无 IO 时的兜底）                                                                                                |
| `initLazyLoad()`  | 三分支：①无 `IntersectionObserver` → 全量加载；②有原生 lazy → 全量 `ensureSrc` 后返回；③老浏览器 + IO → 用 `rootMargin: '50px 0px'` 的观察器按需加载 |

**DOM 选择器**：`img[data-src]`；产出 `.loaded` / `.error`
**依赖**：`window.IntersectionObserver`、`HTMLImageElement.prototype.loading`

## 4. `code-copy.js` — 代码复制按钮

**形态**：IIFE，无导出。

| 函数             | 说明                                                                                                                                                                                          |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initCodeCopy()` | `querySelectorAll('pre code')`；取其 `parentElement`（即 `pre`）；`pre.querySelector('.code-copy-btn')` 已存在则跳过（**幂等**）；创建按钮、绑 click、`pre.style.position='relative'`、append |
| `copyText(text)` | 优先 `navigator.clipboard.writeText`；否则 `execCommand('copy')` 兜底（建隐藏 `textarea` → `select()` → `execCommand` → `removeChild`）。返回 `Promise`                                       |

**反馈**：成功 → 按钮文字改 `__almagestConfig.copy.copied` + 加 `.copied` 类，`setTimeout(2000)` 复位；失败 → `console.error` + 文字改 `__almagestConfig.copy.failed`。

**依赖的全局变量**：`window.__almagestConfig.copy`（`copy` / `copied` / `failed`）——由 `_partial/scripts.ejs` 统一注入。

**DOM 选择器**：`pre code`、`pre`、`.code-copy-btn`

## 5. `astronomy.js` — 星空 + 日历 + 天文组件

**形态**：**非 IIFE**。顶层定义全局常量，暴露 `window.Astronomy`（对象字面量）。末尾带 readyState 判断自动 `Astronomy.init()`。

### 顶层常量

| 常量                      | 值                                                                        | 含义                       |
| ------------------------- | ------------------------------------------------------------------------- | -------------------------- |
| `STAR_AREA_PER_STAR`      | `9000`                                                                    | 每 9000 平方 CSS px 一颗星 |
| `MIN_STARS` / `MAX_STARS` | `60` / `220`                                                              | 星数上下限                 |
| `STAR_COLORS`             | `['255,255,255','207,228,255','184,200,255','255,233,196','213,200,255']` | 5 色（冷白 / 暖白 / 蓝紫） |
| `METEOR_MIN_INTERVAL`     | `6000`                                                                    | 流星最短间隔 ms            |
| `METEOR_MAX_INTERVAL`     | `16000`                                                                   | 流星最长间隔 ms            |
| `METEOR_DURATION`         | `900`                                                                     | 流星存活 ms                |

### `init()` 调用顺序

`initStarryBackground()` → `initConstellationNav()` → `initAstronomyCards()` → `initCalendar()`

### `initStarryBackground()` — 星空主循环

- 取 `.starry-background`，缺失 return；创建 `<canvas class="starfield-canvas">` 并 append
- 非减动效时给 canvas 加 `.twinkle` 类（CSS 做整体 opacity 呼吸，**避免上百节点各自做 DOM 动画**）
- 闭包状态：`width / height / dpr / stars[] / meteors[] / rafId / resizeTimer / meteorTimer`

**星点数据结构**（`buildStars()`）：

```js
count = min(220, max(60, round(width * height / 9000)))
每颗星：{
  x, y,                                        // 随机位置
  r:      Math.random() * 1.1 + 0.3,           // 半径 0.3 ~ 1.4
  base:   Math.random() * 0.45 + 0.3,          // 基础亮度 0.3 ~ 0.75
  amp:    Math.random() * 0.35 + 0.1,          // 闪烁幅度 0.1 ~ 0.45
  spd:    Math.random() * 0.9 + 0.35,          // 闪烁速度 0.35 ~ 1.25
  ph:     Math.random() * Math.PI * 2,         // 相位（各自错开）
  color:  STAR_COLORS[随机]
}
```

**闪烁算法**（`drawStars(now)`）：每颗星独立相位正弦

```js
t = (now / 1000) * s.spd + s.ph;
alpha = s.base + Math.sin(t) * s.amp; // 在 [base-amp, base+amp] 间往返
if (alpha < 0.05) alpha = 0.05; // 下限钳制
if (alpha > 1) alpha = 1; // 上限钳制
```

周期约 1.5s ~ 4.5s（由 `spd` 决定）。填充色 `rgba(<color>, <alpha>)`，用 `ctx.arc` 画圆。

**流星**：

| 函数               | 逻辑                                                                                                                                                                                                                                |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `spawnMeteor()`    | `startX = random * width * 0.9`；`startY = random * height * 0.4`（**只在上半部生成**）；`angle = π/5 + random * π/12`（36°~51°）；`len = random*90 + 70`；`speed = random*0.35 + 0.5`；push `{x, y, dx, dy, len, born, life: 900}` |
| `scheduleMeteor()` | `delay = 6000 + random * 10000`；`setTimeout` 内 `spawnMeteor()` 后**递归调度**（自维持）                                                                                                                                           |
| `drawMeteors(now)` | **倒序遍历**便于 splice；`age >= life` 移除。位置按「已飞距离」推进：`traveled = age * dx / 16.7`（按 60fps 归一）。淡入淡出：`p < 0.2` 渐显、`p > 0.6` 渐隐                                                                        |

**拖尾渐变**：`createLinearGradient(tail → head)`，三个色标
`0 → rgba(103,232,249,0)`、`0.6 → rgba(150,220,255, 0.5*fade)`、`1 → rgba(255,255,255, 0.9*fade)`；
`lineWidth = 1.6`、`lineCap = 'round'`。

**主循环**：`frame(now)` → `clearRect` → `drawStars` → `drawMeteors` → `requestAnimationFrame(frame)`

**尺寸与 DPR**（`resize()`）：

- `dpr = min(window.devicePixelRatio || 1, 2)`（**上限 2**，避免高 DPI 设备开销过大）
- `width = window.innerWidth`、`height = window.innerHeight`

> ⚠️ **必须用视口尺寸，不能用 `clientHeight`**。`.starry-background` 是 `position: fixed`，
> 取 `clientHeight` 会拿到文档总高度，导致画布被拉长成数千像素、星点被摊薄。
> 这是修过的真实 bug。

- `canvas.width = floor(width*dpr)`、`style.width = width + 'px'`、`ctx.setTransform(dpr,0,0,dpr,0,0)`
- 每次 resize 都重建星点

**停帧机制**：`document.hidden` → `stop()`（`cancelAnimationFrame`）+ 清流星定时器；可见 → `start()` + 若未在调度则重新 `scheduleMeteor()`。
**resize 防抖**：**160ms**（`setTimeout` + `clearTimeout`）。

**减动效**：`prefersReducedMotion()` 为真时只画一帧（`drawStatic()`），不启动 RAF、不调度流星。

### `initCalendar()` — 月历

| 状态 / 方法              | 说明                                                                                                                                                                                                                                                                                              |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Astronomy._calView`     | `{ year, month }`，初始为**今天**（挂在 `Astronomy` 上，不是闭包）                                                                                                                                                                                                                                |
| `renderCalendar()`       | 计算当月首日/天数/起始星期；写 `.current-month` 为 `year + ' / ' + String(month+1).padStart(2,'0')`；清空既有 `.calendar-day`；补 `startingDayOfWeek` 个 `.calendar-day.empty`；生成 1..daysInMonth 的日期格，今天加 `.today`，`hasEvent()` 为真加 `.has-event`；每格绑 click → `showDayEvents()` |
| `previousMonth()`        | `month -= 1`，`< 0` → `month = 11; year -= 1`；重绘                                                                                                                                                                                                                                               |
| `nextMonth()`            | `month += 1`，`> 11` → `month = 0; year += 1`；重绘                                                                                                                                                                                                                                               |
| `hasEvent(y, m, d)`      | ⚠️ **恒 `return false`**（事件数据未接入，源码注释已注明）                                                                                                                                                                                                                                        |
| `showDayEvents(y, m, d)` | 清空 `.calendar-events`，展示当天事件列表；无事件时插入 `<p>` 文本 `__almagestConfig.astronomy.noEvents`                                                                                                                                                                                          |

> 「无事件」文案已随 Phase 2 迁入 `__almagestConfig.astronomy.noEvents`（三语言齐全）。

### 其余方法

| 方法                                       | 说明                                                                                                                                                                                  |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `initConstellationNav()`                   | `.constellation-item` 绑 `mouseenter`/`mouseleave` 加/移 `.hover`。**不接管 click**（注释：旧实现 `preventDefault()` 后用可能为 null 的 href 赋值会跳到 `/null`，故改由锚点原生跳转） |
| `initAstronomyCards()`                     | `.astronomy-card` 逐卡设 `tabindex="0"` 保证键盘可达；**已含 `a`/`button` 的卡跳过**。悬停位移交给 CSS                                                                                |
| `getConstellationByDate(date)`             | 内置 12 项 `{name, start:[月,日], end:[月,日]}`；**摩羯座跨年**（`[12,22] ~ [1,19]`）单独处理                                                                                         |
| `getVisibleConstellations(lat, lon, date)` | 简化实现，返回 `constellation ? [constellation] : []`                                                                                                                                 |
| `getObservationTips(lat, lon, date)`       | 按纬度正负返回"午夜后/午夜前最佳" + 3 条固定建议                                                                                                                                      |

**DOM 选择器**：`.starry-background`、`.starfield-canvas`（产出）、`.constellation-item`、`.hover`、`.astronomy-card`、`.astronomy-calendar`、`.calendar-nav button:first-child`、`.calendar-nav button:last-child`、`.calendar-grid`、`.calendar-day`、`.calendar-day.empty`、`.today`、`.has-event`、`.current-month`、`.calendar-events`

> 模板侧匹配情况：`.starry-background`（`layout.ejs`）、`.constellation-item`（`constellation-nav.ejs`）、
> `.astronomy-card`（`astronomy-card.ejs`）、`.astronomy-calendar` 系列（`astronomy-calendar.ejs`）
> **均匹配**。注意 `.calendar-day-header` 是 `.calendar-grid` 内已有子节点，JS 只 append 日期格、
> 不删除表头，因此不会被清掉。

## 6. 全局变量契约汇总

| 全局变量                           | 注入方                   | 消费方         | 缺失时行为             |
| ---------------------------------- | ------------------------ | -------------- | ---------------------- |
| `window.__almagestConfig`          | `_partial/scripts.ejs`   | 全部前端脚本   | 各消费方回落内置缺省值 |
| `window.__almagestAstronomyEvents` | `astronomy-calendar.ejs` | `astronomy.js` | 视为无事件             |

**`window.__almagestConfig` 结构**（`alm_export_config` helper 生成，`<script type="application/json">` + `\u` 转义）：

```json
{
  "version": "1.1.0",
  "copy": { "copy": "…", "copied": "…", "failed": "…" },
  "search": { "url": "/search.json", "empty": "…", "noResults": "…" },
  "astronomy": { "noEvents": "…" }
}
```

> **迁移说明（Phase 2）**：此前的 `__almagestCopyText` / `__almagestCopiedText` /
> `__almagestCopyFailedText` / `__almagestSearchUrl` / `__almagestSearchEmpty` /
> `__almagestSearchNoResults` / `__almagestNoEventsText` 七个零散全局变量已全部
> 合并进 `__almagestConfig`，模板侧不再逐个注入。`window.__almagestSearch.setEmptyText` /
> `setNoResultsText` 两个 setter 保留（运行时改的是内存中的配置副本）。

## 7. DOM 选择器契约

前端脚本依赖的选择器**全部存在对应的模板产出**（已逐个核对）。这是主题做得比较扎实的一点——
但注意：`astronomy.js` 依赖的 4 组选择器所在的模板**有 3 个是孤儿**（没有任何页面 include），
所以它们只有在用户手动 include 后才会生效。

---

**上一篇**：[03 · Hexo 脚本层](03-scripts.md) ｜ **下一篇**：[05 · 样式体系](05-styles.md)
