# 08 · 运行方式

## 0. 最核心的一条：主题不能单独运行

Hexo 主题是**被站点调用的插件**，本身没有入口。因此：

- ❌ **不要** `cd hexo-theme-almagest && hexo server` —— 这里没有 `source/_posts`，没有站点 `_config.yml`
- ✅ 要预览效果，**必须另建一个 Hexo 站点**，把本主题装进去

```
<站点根>/
├── _config.yml          ← 站点配置（含 theme: almagest）
├── source/_posts/       ← 文章
├── themes/almagest/     ← 主题装在这里
└── node_modules/        ← Hexo 引擎
```

## 1. 安装到站点

### 方式 A：npm 安装（面向使用者）

```bash
npm install hexo-theme-almagest
hexo config theme almagest
```

### 方式 B：源码安装（面向开发）

```bash
git clone <repo-url> themes/almagest
```

或建软链，改完立即生效：

```bash
# Linux / macOS
ln -s /path/to/hexo-theme-almagest themes/almagest

# Windows（需管理员权限或开发者模式）
mklink /J themes\almagest F:\code\hexo-theme-almagest
```

然后在站点 `_config.yml` 里：

```yaml
theme: almagest
```

## 2. 本地预览

```bash
# 站点根目录
hexo clean
hexo generate
hexo server          # 默认 http://localhost:4000
```

### 最小可运行站点（从零搭）

```bash
mkdir -p /tmp/almagest-preview && cd /tmp/almagest-preview
npm init -y
npm install hexo hexo-renderer-ejs hexo-renderer-stylus hexo-renderer-marked \
  hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag

ln -s /path/to/hexo-theme-almagest themes/almagest
echo 'theme: almagest' >> _config.yml
npx hexo server
```

> ⚠️ **Hexo 按 `package.json` 的 `dependencies` 决定加载哪些渲染器。** 站点 `package.json` 必须
> 显式声明上面这些包，否则会出现「首页生成了但文章一篇都没有」「`index.md` 被原样复制而不是渲染」
> 这类**不报错但明显不对**的现象。

## 3. 必须对齐的两项站点配置

这两条不配对，功能会**静默失效**（不报错）：

### ① 让前端代码高亮与复制按钮生效 → `syntax_highlighter` 必须留空

```yaml
# 站点 _config.yml
syntax_highlighter:
```

**原因**：若设为 `highlight.js`，Hexo 服务端会渲染出 `<figure class="highlight"><table><td class="gutter">`
结构，而主题的前端脚本（`code-copy.js`、`scripts.ejs` 里的内联高亮）选择器是 `pre code` —— **永远匹配不到**。

留空后由 `hexo-renderer-marked` 输出标准 `<pre><code class="language-x">`，前端接管高亮。

### ② 让目录（TOC）渲染 → 文章 front-matter 显式写 `toc: true`

```yaml
# 文章 front-matter
---
title: 示例文章
toc: true # ← 必须显式写
---
```

**原因**：模板守卫是 `config.features?.toc && page.toc`，而 **`page.toc` 在 Hexo 7 下恒为 `undefined`**
（`toc()` helper 本身是好的）。只有 front-matter 里写了 `toc: true` 才会被赋值为 true。

## 4. 开发命令（`package.json` scripts）

| 命令                     | 实际执行                             | 说明                                |
| ------------------------ | ------------------------------------ | ----------------------------------- |
| `npm run check`          | `npm run lint && npm run style:lint` | **质量总检查**                      |
| `npm run lint`           | `eslint .`                           | JS 检查                             |
| `npm run lint:fix`       | `eslint . --fix`                     | JS 自动修复                         |
| `npm run style:lint`     | `stylelint source/css/**/*.styl`     | Stylus 检查                         |
| `npm run style:lint:fix` | 同上 `--fix`                         | Stylus 自动修复                     |
| `npm run format`         | `prettier --write .`                 | 格式化                              |
| `npm run format:check`   | `prettier --check .`                 | 格式校验                            |
| `npm run test:unit`      | `node --test tests/unit/*.test.js`   | **单元测试（64 个用例）**           |
| `npm run test:cov`       | 加 `--experimental-test-coverage`    | 覆盖率                              |
| `npm run test:smoke`     | `bash tests/smoke.sh`                | **真实构建冒烟测试**                |
| `npm run test`           | `check && test:unit && test:smoke`   | **完整验证**                        |
| `npm run prepare`        | `husky`                              | 装 Git 钩子（npm install 时自动跑） |

### 单元测试

用 Node 内置 `node:test`，**不需要任何测试框架**。测试按层合并为 2 个文件，5 个注册层模块共用一份 hexo mock：

```
tests/
├── setup.js               共享的 hexo mock（消除 5 份重复）
└── unit/
    ├── lib.test.js        纯函数层：text / html / asset / config
    └── scripts.test.js    注册层：config / filters / generators / helpers / tags
```

**64 个用例 / 159 条断言**，覆盖 `scripts/` 的行为分支。加用例的姿势见 [tests/README.md](../tests/README.md)。

### 冒烟测试（`tests/smoke.sh`）

**这是最有价值的验证手段**——它会在临时目录自建一个真实 Hexo 站点并完整构建：

```bash
bash tests/smoke.sh                      # 默认 Hexo 7
HEXO_SPEC=hexo@^8 bash tests/smoke.sh    # Hexo 8（CI 跑兼容矩阵）
```

断言清单：

| 断言                                    | 防的是什么                   |
| --------------------------------------- | ---------------------------- |
| `public/index.html` 非空                | 首页没生成                   |
| `public/css/main.css` 非空              | Stylus 编译失败              |
| `public/search.json` 存在               | 搜索索引没生成               |
| 文章页存在                              | 文章没渲染                   |
| 首页含 `CI Hello`                       | 未渲染文章                   |
| 首页含 `<script src`                    | **`layout.ejs` 外壳未套上**  |
| 文章页含 `data-src` 与 `loading="lazy"` | 懒加载 filter 未生效         |
| 文章页含原始 `src`                      | **只加 `data-src` 会破图**   |
| `search.json` 含正文文本                | 索引内容丢失                 |
| `search.json` 不含 `data-src`           | `post.content` 被懒加载污染  |
| `search.json` 不含 `<img`               | 索引未剥离标签（体积会膨胀） |

> 本地 npm 源慢时可先设：`export npm_config_registry=https://registry.npmmirror.com`

## 5. CI 流水线

仓库有**两套**内容等价的流水线配置：

### `.github/workflows/ci.yml`（GitHub Actions）

| Job       | 内容                                          | 备注                                     |
| --------- | --------------------------------------------- | ---------------------------------------- |
| `quality` | `npm install` → ESLint → Stylelint → 单元测试 | 约 1 分钟                                |
| `smoke`   | 冒烟测试，`matrix.hexo = ['^7','^8']`         | **`fail-fast: false`**，两个版本都要跑完 |

触发：`push` / `pull_request`（限 `main`）+ `workflow_dispatch` 手动触发。
带 `concurrency` 配置，同一分支的旧运行会被自动取消。

> ⚠️ **两处必须注意的实现约束**：
>
> 1. 本仓库的 `package-lock.json` **被 `.gitignore` 排除且未跟踪**，所以只能用 `npm install`，
>    **用 `npm ci` 会直接失败**
> 2. 同理**不能启用 `setup-node` 的 `cache: npm`**（该选项依赖 lock 文件）
>
> 想启用缓存与 `npm ci`，需要先把 `package-lock.json` 纳入版本控制。

### `.cnb.yml`（CNB 云原生构建）

| 触发                         | 执行内容                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------- |
| `main.push`                  | install → lint → stylelint → unit-test → smoke(Hexo 7) → smoke(Hexo 8) → 同步到 GitHub |
| `pull_request`               | 同上质量检查（不同步）                                                                 |
| `auto_tag`（Tag 页手动触发） | 基于 Conventional Commits 自动计算版本号并打 `vX.Y.Z`                                  |
| `tag_push`（推 `v*` 标签）   | 质量检查 → 生成 CHANGELOG → 创建 Release → 发布 npm 制品                               |
| `issue.open`                 | 自动把新 Issue 指派给 owner                                                            |

### ⚠️ 主仓方向决定了 GitHub Actions 的实际作用

`.cnb.yml` 的 `sync-to-github` 是 **`force: true`（强制覆盖）**，即：

```
开发 → push 到 CNB → CNB 跑 CI → 同步覆盖 GitHub main → GitHub 上的 push 由机器人产生
```

**后果**：

- GitHub Actions 触发时机在「同步**之后**」，**起不到「PR 阶段拦截」的作用**
- 两套 CI 会**跑两遍同样的检查**（重复消耗）
- GitHub 侧的 PR 无法作为开发入口（force push 会覆盖）

若要让 GitHub Actions 真正承担质量门禁，需要**反转主仓方向**（GitHub 主、CNB 镜像）。

> **三个注册 filter 都没有显式 priority**，依赖 Hexo 默认 10。若将来与其它插件协作，需显式指定。

## 6. 发布流程

1. **打 Tag**：在仓库 Tag 列表页点「自动生成 Tag」，CI 按 Conventional Commits 算版本号
2. **自动发布**：推 `v*` 后 CI 依次执行质量检查 → 生成 CHANGELOG → 创建 Release → 发 npm
3. **手动发 npm**：`CNB_TOKEN=xxx bash npm-publish.sh`（默认发到 CNB toolkit 制品库）

> **提交信息规范**：`feat:` / `fix:` / `docs:` / `refactor:` / `chore:` 等 Conventional Commits 前缀，
> 因为版本号是自动算出来的。

## 7. 首次上手检查清单

在开始改代码前，建议按顺序确认：

- [ ] `npm install` 成功（会触发 husky 安装钩子）
- [ ] `npm run check` 通过（eslint + stylelint 全绿）
- [ ] `npm run test:unit` 通过（91 个用例）
- [ ] `bash tests/smoke.sh` 通过（真实构建）
- [ ] 有一个可预览的 Hexo 站点，且站点 `syntax_highlighter` **留空**
- [ ] 测试文章的 front-matter 写了 `toc: true`
- [ ] **读过 [09 · 实现现状与已知缺陷](09-known-issues.md)** —— 避免在错误前提上工作

## 8. 常见现象与原因速查

| 现象                 | 最可能的原因                                                                                            |
| -------------------- | ------------------------------------------------------------------------------------------------------- |
| 代码块没有语法着色   | 站点 `syntax_highlighter` 没留空；或 `code_highlight.cdn` 用了 npm 包路径而非 `@highlightjs/cdn-assets` |
| 代码块没有复制按钮   | 同上（选择器 `pre code` 匹配不到 `<figure class="highlight">`）                                         |
| 目录（TOC）不显示    | 文章 front-matter 没写 `toc: true`                                                                      |
| 星空背景不显示       | `.starry-background` 节点缺失，或 `features.starfield: false`，或 CSS 层级被不透明底色盖住              |
| 图片不显示 / 破图    | 懒加载只加了 `data-src` 却删掉了 `src`                                                                  |
| 返回顶部按钮不出现   | **已知缺陷**——没有对应 JS，见 [09](09-known-issues.md)                                                  |
| 改完配置没生效       | Hexo 缓存 → `hexo clean && hexo generate`                                                               |
| 改完 CSS/JS 页面没变 | `cdn_prefix` / `version` 的 `?v=` 缓存 → 改 `version` 或强制刷新                                        |
| 切了主题颜色不对     | 双轨制漏改一边（编译期 `$var` vs 运行期 `var(--x)`）                                                    |
| 首页生成了但文章全空 | 站点 `package.json` 没声明渲染器 / generator                                                            |

---

**上一篇**：[07 · 依赖关系](07-dependencies.md) ｜ **下一篇**：[09 · 实现现状与已知缺陷](09-known-issues.md)
