# 05 · 样式体系（`source/css/`）

13 个 Stylus 文件 → 编译成**单个 `main.css`**。

## 1. 文件清单与职责

| 文件                       | 行数 | 职责                                                                                 |
| -------------------------- | ---- | ------------------------------------------------------------------------------------ |
| `main.styl`                | 32   | **唯一入口**，按序 `@import` 其余 12 个                                              |
| `_variables.styl`          | 265  | 全部**编译期**设计 token + 只读别名                                                  |
| `_mixins.styl`             | 34   | 5 个 mixin                                                                           |
| `_base.styl`               | 430  | reset / 排版 / 表单 / 表格 / 工具类 / 星云分层                                       |
| `_layout.styl`             | 647  | header / 内容容器 / 侧栏 / 页脚 / 返回顶部 / 栅格 / 间距工具                         |
| `_components.styl`         | 530  | 按钮 / 标签与标签云 / 提示 / 分页 / 搜索 / widget / 文章与归档 / 面包屑 / 懒加载图片 |
| `_responsive.styl`         | 690  | 移动优先三断点（< 768 / ≥ 768 / ≥ 992）+ ≥ 1200 / ≥ 1400 + 打印                      |
| `_theme-light.styl`        | 265  | 亮色**运行期**变量块 ×2 + 亮色组件覆盖                                               |
| `_theme-dark.styl`         | 264  | 暗色**运行期**变量块 ×2 + 暗色组件覆盖                                               |
| `_code-highlight.styl`     | 175  | `pre` / `code` / 行号 / `.code-copy-btn`（**权威定义**）/ hljs token 配色            |
| `_astronomy.styl`          | 360  | 星空层 / 天文卡片 / 星图导航 / 天文日历 / 观测指南 + `twinkle` 关键帧                |
| `_astronomy-calendar.styl` | 33   | 日历独有补充选择器                                                                   |
| `_observation-guide.styl`  | 38   | 观测指南独有补充选择器                                                               |

## 2. `main.styl` 的 import 顺序（决定层叠）

```stylus
@import '_variables'
@import '_mixins'
@import '_base'
@import '_layout'
@import '_components'
@import '_responsive'
@import '_theme-light'
@import '_theme-dark'
@import '_code-highlight'
@import '_astronomy'
@import '_astronomy-calendar'
@import '_observation-guide'
```

**顺序带来的 4 个约束**（改样式前必须知道）：

| 顺序                                        | 后果                                                                                                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `_responsive` 在 `_layout` **之后**         | 它的顶层 `display: none`（`.sidebar`、`.mobile-menu`）会覆盖 `_layout`。因此 **`_layout.styl` 里的 `.sidebar` 故意不设 `display`**（源码注释明确） |
| `_theme-dark` 在 `_theme-light` **之后**    | 同优先级下暗色胜出                                                                                                                                 |
| `_code-highlight` 在 `_components` **之后** | `.code-copy-btn` 的**权威定义在 `_code-highlight.styl`**；`_components.styl` 里的重复块已删除，仅留注释指向                                        |
| `_astronomy` 在最后，其后再跟两个补充文件   | 天文样式优先级最高，修改时注意别被前面的通用规则干扰                                                                                               |

## 3. 双轨制配色（本主题最大的坑）

样式层**同时存在两套变量**，各有各的生效方式：

|          | 编译期（Stylus `$var`）               | 运行期（CSS `var(--x)`）                 |
| -------- | ------------------------------------- | ---------------------------------------- |
| 定义位置 | `_variables.styl`                     | `_theme-light.styl` / `_theme-dark.styl` |
| 生效方式 | 构建时替换为字面量                    | 浏览器实时解析                           |
| 可用于   | 任何 Stylus 表达式 / 函数 / 条件      | 仅 CSS 属性值                            |
| 典型用途 | 间距、断点、阴影、z-index、不易变常量 | **颜色**（要随主题切换）                 |

**两者可以在同一条声明里混用**，例如 `_layout.styl` 的 `.back-to-top`：

```stylus
.back-to-top
  background-image: var(--grad-primary)          // 运行期渐变
  background-color: $primary-color               // 编译期青色
  box-shadow: $shadow-deep-md, $glow-primary-soft // 编译期深空阴影 + 星辉
```

### ⚠️ 由此产生的一处真实不一致

| 轨道           | 变量                                           | 值                | 作用于                                                               |
| -------------- | ---------------------------------------------- | ----------------- | -------------------------------------------------------------------- |
| 编译期         | `$primary-color`                               | `#67e8f9`（青）   | `.btn-primary`、`.back-to-top`、`.code-copy-btn:hover`、`.hljs-link` |
| 运行期（亮色） | `--color-accent` / `--color-button-primary-bg` | `#4f46e5`（靛蓝） | 亮色主题下的按钮、链接、强调                                         |

**同一页面会出现两套强调色并存**（青色元素与靛蓝元素同时可见）。改主题色时要同时改这两处，否则漂移会加剧。详见 [09 · 已知缺陷](09-known-issues.md)。

### 只读别名（`_variables.styl` L128-159）

文件里存在两套命名，互为别名：

| 别名组                                                           | 源变量                               |
| ---------------------------------------------------------------- | ------------------------------------ |
| `$space-xs / sm / md / lg / xl / 2xl / 3xl / 4xl`                | `$spacing-*`                         |
| `$color-primary / secondary / success / warning / danger / info` | `$primary-color` 等                  |
| `$color-primary-light / dark`、`$color-accent-2/3/4`             | 对应 `$*-color` / `$accent-*`        |
| `$gap-xs / sm / md / lg / xl`                                    | `$spacing-*`（**gap 没有独立刻度**） |

**它们为什么存在**：历史上样式文件混用了两套命名（`$spacing-*` vs `$space-*`、`$-color` vs `$color-`），为兼容而并存。

> **关键认知**：Stylus 变量**按值传递**，别名是**赋值那一刻的快照**，属**只读**。
> 改色/改间距**必须改源变量**（`$spacing-*`、`$*-color`），改别名不会影响已展开的地方，
> 会导致两套命名漂移、样式不一致。

**实际使用情况**：`_layout.styl` / `_components.styl` / `_astronomy.styl` / `_responsive.styl` 里**几乎全用 `$space-*`** —— 别名才是主用面，源变量反而少用。

## 4. 明暗主题的「双文件双写」

`_theme-light.styl`（265 行）与 `_theme-dark.styl`（264 行）**每份内部把同一组变量写两遍**，外加一个组件覆盖块：

### `_theme-light.styl` 结构

| 行段     | 选择器                                                         | 作用                                                                                                  |
| -------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| L5-87    | `:root, [data-theme='light']`                                  | 显式亮色 **+ 无属性时 `:root` 默认基线**（亮色是兜底默认）                                            |
| L93-175  | `@media (prefers-color-scheme: light) :root:not([data-theme])` | 系统自动亮色（仅用户未手动设过时生效）                                                                |
| L181-263 | `[data-theme='light']`                                         | 组件级覆盖（a / button / code / table / input / .tag / .alert / blockquote / .card），**无 `@media`** |

### `_theme-dark.styl` 结构

| 行段     | 选择器                                                        | 作用                                  |
| -------- | ------------------------------------------------------------- | ------------------------------------- |
| L5-86    | `[data-theme='dark']`                                         | ⚠️ **不含 `:root`**——暗色不做默认基线 |
| L92-174  | `@media (prefers-color-scheme: dark) :root:not([data-theme])` | 系统自动暗色                          |
| L180-262 | `[data-theme='dark']`                                         | 组件级覆盖，**无 `@media`**           |

**维护代价**：一组颜色改动要在 **4 个地方**同步（2 文件 × 2 处）。漏改的典型症状是
「系统暗色正常、手动切暗色颜色不对」这类偏门 bug。

> **为什么组件覆盖块只写 `[data-theme]` 不写 `@media`**：系统自动模式（无 `data-theme`）下，
> 组件级微调走的是 `_base.styl` 里 `var()` 消费的运行期变量，不依赖主题文件的组件块。

### 运行期变量清单（约 40+ 个）

```
--color-bg  --color-bg-secondary  --color-bg-elevated  --color-hover-bg
--color-text  --color-text-secondary  --color-text-tertiary
--color-border  --color-border-light
--color-code-*（8 个）        --color-table-*
--color-input-*              --color-tag-*
--color-link  --color-hover  --color-active  --color-link-accent
--color-button-primary-*
--color-accent  --color-accent-2  --color-accent-3  --color-accent-4
--color-glass-bg  --color-glass-border  --color-glass-blur
--color-alert-*（success / warning / danger / info，各 bg + text）
--color-shadow  --color-shadow-dark  --color-image-placeholder
--grad-primary  --grad-text
--shadow-card  --shadow-card-hover  --glow-primary  --glow-soft
```

> `--color-image-placeholder` 在 `_components.styl` 以 `var(--color-image-placeholder, #f0f0f0)`
> 兜底引用，**未见显式定义**——它由 `_partial/head.ejs` 根据 `image.placeholder_color` 内联到 `:root`。

## 5. `_mixins.styl`（5 个 mixin）

| mixin               | 签名                                                           | 展开为                                                           |
| ------------------- | -------------------------------------------------------------- | ---------------------------------------------------------------- |
| `smooth-transition` | `(properties = background-color, duration = $transition-base)` | `transition: properties duration`                                |
| `text-ellipsis`     | `()`                                                           | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` |
| `clearfix`          | `()`                                                           | `&::after { content: ''; display: table; clear: both }`          |
| `vertical-center`   | `()`                                                           | `display: flex; align-items: center; justify-content: center`    |
| `card-base`         | `()`                                                           | 卡片基础样式（背景 + 边框 + 圆角 + 内距 + 过渡）                 |

> `card-base` **定义了但未被调用**（`_components.styl` 的 `.widget` 等是手写的），属预留。

## 6. 几何手法现状（重要）

全 `source/` 检索结果：

| 手法               | 使用情况                                                                              |
| ------------------ | ------------------------------------------------------------------------------------- |
| `clip-path`        | **仅 1 处** —— `_base.styl:428` 的 `.sr-only { clip-path: inset(50%) }`（无障碍隐藏） |
| `skewX` / `skew()` | **0 处**                                                                              |
| `polygon()`        | **0 处**                                                                              |

**即主题当前完全没有使用斜切或多边形裁剪做视觉。** 若要做"硬边几何"方向的改造，这里是从零开始——
`_mixins.styl` 里加切角 mixin 是成本最低的切入点（参考 [调研报告](../../almagest-参考主题调研.html) 里 Icarus 的 5 个 `cut-corner` mixin）。

## 7. 设计 token 全清单

### 圆角

| token                 | 值       |
| --------------------- | -------- |
| `$border-radius-sm`   | `4px`    |
| `$border-radius-md`   | `8px`    |
| `$border-radius-lg`   | `12px`   |
| `$border-radius-xl`   | `16px`   |
| `$border-radius-full` | `9999px` |

### 阴影与光晕

| token                | 值                                                                         |
| -------------------- | -------------------------------------------------------------------------- |
| `$shadow-sm`         | `0 1px 2px 0 rgba(22,30,51,.05)`                                           |
| `$shadow-md`         | `0 4px 6px -1px rgba(22,30,51,.08), 0 2px 4px -1px rgba(22,30,51,.05)`     |
| `$shadow-lg`         | `0 10px 15px -3px rgba(22,30,51,.1), 0 4px 6px -2px rgba(22,30,51,.05)`    |
| `$shadow-xl`         | `0 20px 25px -5px rgba(22,30,51,.12), 0 10px 10px -5px rgba(22,30,51,.04)` |
| `$shadow-deep-sm`    | `0 8px 24px -12px rgba(0,0,0,.7)`                                          |
| `$shadow-deep-md`    | `0 18px 50px -20px rgba(0,0,0,.85)`                                        |
| `$shadow-deep-lg`    | `0 30px 80px -30px rgba(0,0,0,.9)`                                         |
| `$glow-primary`      | `0 0 0 1px rgba(103,232,249,.18), 0 8px 32px -12px rgba(103,232,249,.45)`  |
| `$glow-primary-soft` | `0 8px 40px -18px rgba(103,232,249,.35)`                                   |
| `$glow-violet`       | `0 8px 40px -18px rgba(167,139,250,.4)`                                    |

### 玻璃态

| token           | 值                      |
| --------------- | ----------------------- |
| `$glass-bg`     | `rgba(19,24,41,.55)`    |
| `$glass-border` | `rgba(137,160,214,.14)` |

### 过渡与动画

| token                                                         | 值                      |
| ------------------------------------------------------------- | ----------------------- |
| `$transition-fast`                                            | `150ms ease-in-out`     |
| `$transition-base`                                            | `250ms ease-in-out`     |
| `$transition-slow`                                            | `350ms ease-in-out`     |
| `$animation-duration-fast/base/slow`                          | `150ms / 250ms / 350ms` |
| `$animation-timing-ease-in / ease-out / ease-in-out / linear` | 对应 CSS 关键字         |

> **全部过渡统一 `ease-in-out`**——没有使用 `cubic-bezier` 自定义缓动（如回弹）。
> 若要增加"弹性"观感，这是需要新增 token 的地方。

### 关键帧动画（2 个）

| 名称                   | 定义位置           | 内容                               |
| ---------------------- | ------------------ | ---------------------------------- |
| `twinkle`              | `_astronomy.styl`  | `opacity: 0.55 → 1`，`8s` / `6s`   |
| `almagest-img-fade-in` | `_components.styl` | `opacity: 0 → 1`（懒加载图片载入） |

### 其他 token 组

- **间距**：`$spacing-*`（xs 至 4xl，别名 `$space-*` / `$gap-*`）
- **边框宽**：`$border-width-thin / normal / thick = 1 / 2 / 3px`
- **字体**：`$font-family-base / heading / code / serif`、字号 / 字重 / 行高 / 字距若干
- **断点**：`$breakpoint-*`
- **z-index**：`$z-index-*`
- **渐变**：`$grad-primary` / `$grad-primary-soft` / `$grad-text` / `$grad-surface`
- **星云**：`$nebula-a` / `$nebula-b`
- **代码色**：`$code-bg / text / keyword / string / comment / number / function / attr`

---

**上一篇**：[04 · 前端脚本层](04-frontend.md) ｜ **下一篇**：[06 · 配置与多语言](06-config-i18n.md)
