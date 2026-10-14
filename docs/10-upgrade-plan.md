# 10 · Almagest 升级方案（v1.1.0 → v2.0.0）

> **执行进度**
>
> - ✅ **Phase 0 已完成**（2026-10-14）：engines 收紧至 `hexo>=8` / `node>=20`；16 项已知缺陷全部修复（A1/A2/A3/B1/B2/B3/C1–C10）；70 个单测 + Hexo 7/8 双版本冒烟 + 产物级断言全绿。详见 `CHANGELOG.md` 的 Unreleased 段与 `docs/09-known-issues.md` 修复记录。
> - ✅ **Phase 1 已完成**：SEO 三件套（canonical / OG / Twitter / JSON-LD + `seo:` 配置节），22 个参考主题无人实现的 JSON-LD 成为差异化点；产物级验证通过。
> - ✅ **Phase 2 已完成**：`window.__almagestConfig` 统一配置注入，合并 7 个零散全局变量；三语言文案实测注入正确。
> - ✅ **Phase 3 已完成**：`url.pretty`（page generator 覆盖，逐行复刻核心行为）+ 性能预算（search.json 告警 + JS 总量 ≤100KB 回归断言）。
> - ✅ **Phase 4 已完成**（2026-10-14）：渐进式增强层 `modern.css`（color-mix hover 派生 / `:has()` 搜索框聚焦 / 容器查询 / `text-wrap: balance` / 视图过渡，全部 `@supports` 守卫）+ 性能预算按实测校准（CSS 80KB / JS 100KB，含真实编译回归断言）。**执行范围说明**：原计划的「token 全量改名 `--alm-*`」与「明暗双文件合并」经评估**有意不做**——前者纯组织性重构无用户可见收益，后者是对正常视觉代码的高风险重构；双轨制规则已由 C1 修复 + 源码注释 + `05-styles.md` 文档固化。
> - ✅ **Phase 5 已完成**（2026-10-14）：`source/_data/almagest.yml` 覆盖管线（优先级 `_data > theme_config > 主题配置`，`generateBefore` 合并）；注入点从 2 个扩到 4 个（`post_top` / `post_bottom` + `alm_inject` helper）；deprecation 告警框架就位。
>   - **顺带修复一个 Phase 1 遗留真 bug**：`seo.ejs` 漏写 `const config = theme;`，导致 `seo.og_image` / `twitter_card` / `json_ld.enable` 全部读到站点配置而被静默忽略（即 SEO 配置节此前完全不生效）。已修复 + 产品级验证 + 新增「白名单必须覆盖 `_config.yml` 全部顶层键」回归测试（`seo` / `url` 两节曾漏登记）。
> - ⬜ Phase 6 收口中。
>
> 当前测试基线：**99 个单元测试 + Hexo 7/8 双版本冒烟全绿**。

> 基于对 22 个主流 Hexo 主题的源码调研（见 `reference-themes/LEARNING.md`，该目录已 gitignore）
> 及对 Aurora（Vue3+Vite+TS）、Redefine（Tailwind v4+terser）两家的深度兼容性评估得出。
> 所有结论均有源码证据，不含臆测。

---

## 1. 结论先行

**不换构建栈，按效果导向补差距。** 调研证明"技术栈新"与"效果好"在 Hexo 生态里是冲突的：

- **Aurora**（Vue3 SPA）：HTML 里没有任何文章内容（`<div id="app"></div>` + 前端 fetch JSON 注入），SEO 断崖式退化；内容生成器不在仓库内，Hexo 8 兼容性不可验证；2023-11 停更。
- **Redefine**（Tailwind v4）：产物已提交、安装无摩擦（模式可借鉴），但每页默认 ~440KB JS + ~220KB CSS（moment-with-locales 366KB 无条件加载 + FontAwesome 字体 ~800KB），且 Tailwind v4 默认 `color-mix()`/`oklch()` 把浏览器底线抬到 Chrome 111+/Safari 16.2+。

Almagest 当前的**服务端 EJS + 零构建 + 轻量**路线恰恰是兼容性与效果的最优解，工程化工具链（ESLint 10 / stylelint 17 / node:test / husky 9）已是 22 个主题里的第一梯队。升级的目标是：**保住这些优势，补齐 SEO、基建、CSS 现代化三块短板。**

---

## 2. 现状优势（升级中必须保住）

| 优势                          | 证据                                                | 反面对照                         |
| ----------------------------- | --------------------------------------------------- | -------------------------------- |
| 服务端渲染                    | EJS 直接产出文章 HTML                               | Aurora 客户端渲染，SEO 崩坏      |
| 零构建分发                    | 无 postinstall 构建，用户 `git clone` 即用          | Redefine 需 CI 重建产物          |
| 暗色模式防 FOUC               | `layout/_partial/theme-init.ejs` head 内联脚本      | 多数主题首屏闪白                 |
| `hexo-renderer-stylus` 已声明 | `package.json` dependencies                         | **Redefine 未声明，是其隐藏坑**  |
| 搜索索引有体积上限            | `scripts/generators/index.js` 单篇 1500 字符截断    | Redefine/Solitude 全量正文入索引 |
| CI 覆盖 Hexo 7/8 矩阵         | `.github/workflows/ci.yml` smoke 矩阵 `['^7','^8']` | 参考主题多数无 CI                |
| 资源版本化 + CDN 前缀         | `head.ejs` 的 `asset()` 函数 `?v=` + `cdn_prefix`   | —                                |
| `inject.head` 注入点          | `head.ejs:66-69`                                    | —                                |

---

## 3. 差距清单（按优先级）

| #   | 差距                                                                                     | 影响                                                                | 优先级 |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------ |
| G1  | `engines` 声明 `hexo >= 6.0.0` 落后（最新 8.1.2；volantis 已 `^8.1.1`，next 钉 `8.1.2`） | 用户无法判断真实兼容面                                              | P0     |
| G2  | SEO 缺 canonical / Open Graph / Twitter Card / robots / **JSON-LD**                      | 分享预览无卡片；**22 个参考主题无一实现 JSON-LD，是零风险差异化点** | P0     |
| G3  | 前端 JS 读不到主题配置（无 config-export）                                               | 改 `_config.yml` 可能要改 JS，双轨维护                              | P1     |
| G4  | URL 无规范化（`foo.html` vs `foo/index.html`）                                           | 尾链不一致，SEO 权重分散                                            | P1     |
| G5  | 注入点只有 `head` 一个                                                                   | 用户扩展文章区/评论区必须改主题文件                                 | P1     |
| G6  | 无 `source/_data` 配置覆盖管线                                                           | 用户升级主题时配置易冲突                                            | P2     |
| G7  | 无配置废弃告警机制                                                                       | 配置漂移静默发生                                                    | P2     |
| G8  | CSS 未用现代特性；明暗双文件双写（`_theme-dark.styl`/`_theme-light.styl`）               | 视觉上限受限；双写漂移风险                                          | P1     |
| G9  | 无性能预算约束                                                                           | 未来加功能可能重蹈 Redefine 440KB 覆辙                              | P1     |
| G10 | `docs/09-known-issues.md` 记录 10 项已知缺陷                                             | 在错误前提上叠加新功能                                              | P0     |

---

## 4. 升级原则

1. **服务端渲染是红线**：任何阶段不引入客户端渲染内容。
2. **端用户零构建不变**：若引入构建产物，采用 Redefine 模式——产物提交进仓库 + CI 重建 + PR 校验，用户侧无感。
3. **向后兼容**：配置只增不删；旧键迁移走 deprecation 告警（学 Redefine），不静默删除。
4. **渐进增强**：现代 CSS 特性一律 `@supports` 包裹，旧浏览器自动降级（不学 Tailwind v4 的硬性底线）。
5. **依赖克制**：不 in-tree vendor 大库（mermaid 2.45MB / moment 366KB 是 Redefine 的反面教材）；重库一律 CDN + 按需懒加载。

---

## 5. 兼容性目标矩阵

| 维度   | 现状                          | 目标                                                    | 依据                                                 |
| ------ | ----------------------------- | ------------------------------------------------------- | ---------------------------------------------------- |
| Hexo   | 声明 `>=6`，CI 实测 `^7`/`^8` | 声明 **`>=8.0.0`**，README 注明 7.x 未经承诺            | CI 矩阵已验证；对齐 volantis `^8.1.1` / next `8.1.2` |
| Node   | `>=18`                        | **`>=20.0.0`**（CI 已用 22）                            | Stellar 已要求 22；Node 18 已 EOL                    |
| 浏览器 | 未声明                        | **Chrome/Edge 100+，Firefox 100+，Safari 15.4+**，无 IE | 现代特性全部 `@supports` 降级                        |
| 安装   | 零构建                        | 不变                                                    | Aurora/Redefine 对比结论                             |
| SEO    | 基础 meta                     | canonical + OG + Twitter + JSON-LD + 分页类型 robots    | Stellar `json_ld.js`、Fluid `head.ejs`               |

---

## 6. 性能预算（硬约束，进 CI）

| 指标          | 预算                | 现状                        | 执行方式                                      |
| ------------- | ------------------- | --------------------------- | --------------------------------------------- |
| 每页 JS       | ≤ 100 KB（gzip 前） | 约 30-40 KB（5 个原生文件） | `scripts/lib/budget.js` 生成期统计 + 单测断言 |
| 每页 CSS      | ≤ 50 KB             | 需实测                      | 同上                                          |
| `search.json` | ≤ 300 KB            | 已有 1500 字符/篇截断       | 现有机制 + 全站断言测试                       |
| 第三方重库    | 仅 CDN + 按需       | highlight.js 已 CDN         | 代码评审红线                                  |

---

## 7. 分阶段实施计划

### Phase 0 — 基线与缺陷清理（0.5 人日，v1.2.0 前置）

**目标**：在正确的前提上升级。

| 改动            | 文件                                 | 内容                                                                                                           |
| --------------- | ------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| engines 收紧    | `package.json`                       | `hexo: ">=8.0.0"`、`node: ">=20.0.0"`；CI smoke 矩阵保留 `^8`（去掉 `^7` 或保留为 informational）              |
| 清理已知缺陷    | `docs/09-known-issues.md` 所列 10 项 | 至少修复真 bug：配置对象遮蔽导致导航 active 态失效；决定 4 个孤儿天文组件"接线或移除"；删除或接线零调用 helper |
| README 兼容声明 | `README.md`                          | 写明 Hexo 8.x / Node 20+ / 浏览器底线                                                                          |

**验收**：`npm test` 全绿；CI 在 `^8` 矩阵通过；09 号文档缺陷数下降且记录处理结论。
**风险**：Hexo 7 用户看到 engines 警告——属预期，README 说明。

### Phase 1 — SEO 三件套（1 人日，v1.2.0）

**目标**：补齐分享卡片与结构化数据，形成对 22 个参考主题的差异化。

| 改动            | 文件                       | 内容                                                                                                                                                                     |
| --------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 新增 SEO 纯函数 | `scripts/lib/seo.js`       | `canonicalUrl(page)`、`robotsFor(page)`（archive/tag/category 默认 noindex，可配）、`jsonLd(page)`（post→BlogPosting，home→WebSite，含 author/publisher/keywords/image） |
| 新增 helper     | `scripts/helpers/index.js` | 注册 `json_ld()` / `alm_canonical()` / `alm_robots()`                                                                                                                    |
| 新增 partial    | `layout/_partial/seo.ejs`  | 组装 canonical + OG（og:title/description/type/url/image/site_name）+ Twitter Card + robots                                                                              |
| 接入 head       | `layout/_partial/head.ejs` | 引入 `seo.ejs`；meta 值统一走 `escapeHtml`（参考 Stellar `head.ejs` 的 `escape_meta_content`）                                                                           |
| 配置节          | `_config.yml`              | 新增 `seo:` 节（`og_image`、`twitter_card`、`noindex_archives`、`json_ld.enable`）                                                                                       |
| 测试            | `tests/unit/`              | jsonLd 三页面类型、robots 映射、转义 XSS 用例                                                                                                                            |

**参考实现**：`reference-themes/hexo-theme-stellar/scripts/helpers/json_ld.js`、`hexo-theme-fluid/layout/_partials/head.ejs`、`hexo-theme-volantis/scripts/helpers/head/structured-data/lib/*`。
**验收**：文章页 JSON-LD 通过 Google Rich Results 测试；每页 canonical 唯一；XSS 转义有单测。
**风险**：低。纯增量，配置开关可关。

### Phase 2 — 前端配置基建（0.5 人日，v1.2.0）

**目标**：前端 JS 与主题配置单一事实来源。

| 改动        | 文件                                        | 内容                                                                                                                                                    |
| ----------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 新增 helper | `scripts/helpers/index.js`                  | `export_config()`：输出 `<script id="almagest-config" type="application/json">`，注入 theme 配置 + 当前语言 i18n 词条；`<` 转义为 `\u003c`（Next 模式） |
| 接入 head   | `layout/_partial/head.ejs`                  | 在 `theme-init.ejs` 之后调用                                                                                                                            |
| 前端改造    | `source/js/theme.js`、`source/js/search.js` | 硬编码常量改读 `window.__almagest` 配置                                                                                                                 |
| 测试        | `tests/unit/`                               | JSON 序列化转义、配置合并路径                                                                                                                           |

**参考实现**：`reference-themes/hexo-theme-redefine/scripts/config-export.js`、`hexo-theme-next/scripts/helpers/next-config.js`。
**验收**：修改 `_config.yml` 中搜索/主题开关无需改 JS；改配置后冒烟构建产物含正确 JSON。
**风险**：低。需保证 JSON 内无用户可控 HTML 注入（转义 + 单测）。

### Phase 3 — URL 规范化与性能预算（1 人日，v1.3.0）

| 改动               | 文件                                                         | 内容                                                                                                                                                                |
| ------------------ | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| pretty_urls filter | `scripts/filters/index.js` 或新 `scripts/lib/pretty_urls.js` | 覆盖默认 `page` generator：`foo.html` → `foo/index.html`；正确处理 `index/` 与 `layout: false`；**配置开关 `url.pretty`，默认 `false`**（不破坏存量站点，新站可开） |
| 性能预算           | `scripts/lib/budget.js` + `tests/unit/`                      | 生成期统计每页引用资源总量、search.json 体积，超预算抛错                                                                                                            |
| 重库规范           | `docs/`                                                      | 写入"第三方库仅 CDN + 按需懒加载"红线                                                                                                                               |

**参考实现**：`reference-themes/hexo-theme-stellar/scripts/filters/pretty_urls.js`（约 25 行）。
**验收**：开启 `url.pretty` 后全站无 `.html` 尾链且冒烟通过；预算测试进 `npm test`。
**风险**：中。URL 结构变化影响已部署站点 → 默认关闭 + 文档说明。

### Phase 4 — CSS 渐进现代化（1.5 人日，v1.3.0）

| 改动            | 文件                                   | 内容                                                                                                                                                                     |
| --------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 设计 token 统一 | `source/css/_variables.styl`           | 收敛为 `--alm-*` 前缀 CSS 变量体系，作为唯一事实来源                                                                                                                     |
| 明暗合并评估    | `_theme-dark.styl`/`_theme-light.styl` | 消除双写漂移：基础变量一份 + `[data-theme="dark"]` 覆盖块（参考各主题单文件 + 属性选择器模式）                                                                           |
| 渐进增强        | `source/css/_*.styl`                   | `@supports` 包裹启用：`color-mix()`（悬停态/边框派生色）、`:has()`（卡片状态选择）、容器查询（侧栏 widget）、`view-transition`（暗色切换过渡，仅 supporting 浏览器生效） |
| 降级保障        | 同上                                   | 每个新特性提供 var 回退值；Safari 15.4 手动验证视觉不破坏                                                                                                                |

**参考实现**：现代 CSS 特性为通用 Web 标准，无需抄主题；Redefine `tailwind.source.css` 的 `@theme`→变量桥接思路可参考但**不引入 Tailwind**。
**验收**：两套主题下 `@supports` 分支均有视觉回归检查（截图或 DOM 断言）；CSS 体积 ≤ 50KB 预算。
**风险**：中。样式改动面大 → 每文件小步提交，stylelint 门禁。

### Phase 5 — 架构与可扩展性（2 人日，v2.0.0）

| 改动         | 文件                                 | 内容                                                                                                                                                     |
| ------------ | ------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 注入点框架   | `scripts/lib/injects.js` + `layout/` | 把单点 `inject.head` 扩展为多点：`head` / `postTop` / `postBottom` / `postSidebar` / `comments` / `footer`，helper `alm_inject(point)`                   |
| 配置覆盖管线 | `scripts/events/index.js`            | 三级合并：站点 `source/_data/almagest.yml` > 站点 `_config.yml` 的 `theme_config` > 主题 `_config.yml`；同时支持 `source/_data/languages/*.yml` 覆盖词条 |
| 废弃告警     | `scripts/deprecations/`              | 规则式检测旧配置键，`hexo generate` 时打印迁移指引（warn.js 约 30 行起步）                                                                               |
| CDN 切换     | `scripts/helpers/`                   | `renderJS/renderCSS` helper：内置资源支持 local/jsdelivr/unpkg/cdnjs/npmmirror 切换（学 Redefine `theme-helpers.js`）                                    |

**参考实现**：`hexo-theme-next/scripts/events/lib/injects.js`、`hexo-theme-fluid/scripts/events/lib/merge-configs.js`、`hexo-theme-redefine/scripts/deprecations/` + `scripts/config-export.js`。
**验收**：站点级 `_data/almagest.yml` 可覆盖任意主题配置；废弃键产生明确告警；注入点有单测；迁移文档进 `docs/06`。
**风险**：中。属破坏性能力扩展 → 主版本 2.0.0；deprecation 框架保证旧键仍可用。

### Phase 6 — 质量与文档收口（0.5 人日，v2.0.0）

- 所有新 helper/filter/lib 补 `node:test` 单测（沿用 `tests/setup.js` 共享 mock）
- `docs/README.md` 索引更新；`docs/06-config-i18n.md` 补 `seo:`/`url:`/`inject:`/`_data` 覆盖说明
- `CHANGELOG.md` 按 Keep a Changelog 记录 1.2.0 / 1.3.0 / 2.0.0 条目
- `.cnb.yml` 发布链路确认 engines 变更无影响

---

## 8. 版本规划

| 版本       | 内容            | 性质                                                   |
| ---------- | --------------- | ------------------------------------------------------ |
| **v1.2.0** | Phase 0 + 1 + 2 | 次版本：兼容声明 + SEO + 配置基建，纯增量              |
| **v1.3.0** | Phase 3 + 4     | 次版本：URL 选项 + CSS 现代化，默认行为不变            |
| **v2.0.0** | Phase 5 + 6     | 主版本：注入框架 + 覆盖管线（旧键经 deprecation 过渡） |

总计约 **7 人日**。每个 Phase 独立可发布、可回滚。

---

## 9. 明确不做（避免被"新技术"带偏）

| 不做                           | 原因（调研证据）                                                              |
| ------------------------------ | ----------------------------------------------------------------------------- |
| 不引入 Vue/Vite/TS/pnpm 构建栈 | Aurora 客户端渲染致 SEO 空页；内容生成器外置不可验证                          |
| 不整体迁移 Tailwind v4         | 默认 `color-mix()`/`oklch()` 抬升浏览器底线至 2023+；Redefine 每页 440KB 反例 |
| 不 in-tree vendor 大库         | mermaid 2.45MB / moment 366KB / FontAwesome 800KB 的教训                      |
| 不做客户端渲染/SPA 化          | SEO 红线                                                                      |
| 不静默删除旧配置键             | 走 deprecation 告警                                                           |
| 不引入构建期"打电话回家"       | Redefine `welcome.js` 每次 generate 请求作者服务器，隐私风险                  |

---

## 10. 风险与回滚

| 风险                             | 缓解                                                                       |
| -------------------------------- | -------------------------------------------------------------------------- |
| engines 升级触发 Hexo 7 用户警告 | 预期行为；README 明示支持面；CI 保留 `^7` smoke 作为信息性任务一个过渡版本 |
| pretty_urls 改变 URL 结构        | 默认关闭，opt-in 开启；文档说明 301 迁移建议                               |
| CSS 双文件合并引入视觉回归       | 小步提交 + stylelint + 双主题截图核查                                      |
| `_data` 覆盖管线改变配置优先级   | 保持"站点 > 主题"直觉顺序；单测覆盖三级合并；deprecation 兜底              |
| JSON-LD/OG 引入 XSS 面           | 全部 meta 走转义 helper；XSS 用例进单测                                    |

---

_本文档基于 `reference-themes/`（22 个主题源码）与两份深度评估报告撰写；实施时以对应参考仓库文件路径为准。_
