# Contributing to Hexo Theme Almagest

感谢你愿意为 **Hexo Theme Almagest** 贡献代码！🎉

本指南帮助你了解如何参与开发、提交代码、报告问题以及参与社区讨论。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [提交功能建议](#提交功能建议)
  - [提交代码](#提交代码)
  - [改进文档](#改进文档)
- [开发环境](#开发环境)
- [代码规范](#代码规范)
- [提交信息规范](#提交信息规范)
- [分支与版本管理](#分支与版本管理)
- [发布流程](#发布流程)

## 行为准则

- **友善沟通**：尊重每一位贡献者，避免人身攻击与无关争论。
- **先搜索再提问**：提交 Issue 前先搜索是否已有相同问题或讨论。
- **最小化改动**：PR 尽量聚焦单一目标，便于评审与回滚。
- **保持风格一致**：新代码遵循项目已有的代码风格与文档规范。

## 如何贡献

### 报告 Bug

1. 使用 [Bug 报告模板](https://cnb.cool/h1s97x/hexo-theme-almagest/-/issues/new) 创建 Issue。
2. 提供**完整可复现**的信息：主题版本、Hexo 版本、复现步骤、错误日志、截图。
3. 如果问题能通过最小化仓库复现，请附上仓库链接。

### 提交功能建议

1. 使用 [功能建议模板](https://cnb.cool/h1s97x/hexo-theme-almagest/-/issues/new) 创建 Issue。
2. 清晰描述**功能描述**、**使用场景**与**参考实现**。

### 提交代码

#### 第一步：Fork 并克隆

```bash
git clone https://cnb.cool/<your-name>/hexo-theme-almagest.git
cd hexo-theme-almagest
git remote add upstream https://cnb.cool/h1s97x/hexo-theme-almagest.git
git fetch upstream
```

#### 第二步：创建功能分支

```bash
git checkout -b feat/my-new-feature upstream/main
```

分支命名建议：

| 前缀        | 用途     |
| ----------- | -------- |
| `feat/`     | 新功能   |
| `fix/`      | Bug 修复 |
| `docs/`     | 文档修改 |
| `refactor/` | 重构     |
| `perf/`     | 性能优化 |

#### 第三步：开发并验证

```bash
npm install
npm run check        # eslint + stylelint
npm run test:unit    # 单元测试
npm test             # 全部检查 + 冒烟测试
```

> 提交前请确保 `npm test` 全部通过（包含真实 Hexo 构建冒烟测试）。

#### 第四步：提交并推送

```bash
git add -A
git commit -m "feat: 描述你的改动"
git push origin feat/my-new-feature
```

#### 第五步：创建 Pull Request

前往 [CNB 仓库](https://cnb.cool/h1s97x/hexo-theme-almagest/-/pulls) 创建 PR，并在描述中说明：

- 改动目的与解决的问题（关联 Issue 编号）
- 主要变更点
- 验证方式（本地测试结果）

### 改进文档

文档是项目的重要组成部分，欢迎任何修正：

- 修正错别字、过时内容、失效链接
- 补充配置说明与示例
- 完善 [QUICK_REFERENCE.md](QUICK_REFERENCE.md)、[DEVELOPMENT.md](DEVELOPMENT.md)

## 开发环境

项目对 Node.js 有两类不同的要求，请注意区分：

| 场景                            | Node.js 要求 | 说明                                                      |
| ------------------------------- | ------------ | --------------------------------------------------------- |
| **使用主题**（`hexo generate`） | `>= 18`      | 由 `engines.node` 声明，取决于 `hexo-util@4` 等运行时依赖 |
| **开发主题**（跑 lint / 测试）  | `>= 22.22.1` | 取决于开发工具链（主要是 `lint-staged@17`）               |

```bash
npm install
npm run check          # lint 检查
npm run test:unit      # 单元测试
bash test/ci-smoke-test.sh   # 构建冒烟测试（默认 Hexo 7）
```

完整的开发流程与项目结构说明见 [DEVELOPMENT.md](DEVELOPMENT.md)。

> 文档（README / 快速参考 / 开发指南 / 贡献指南等）统一收录在 `doc/` 目录下。

## 代码规范

| 工具      | 范围                   | 命令                 |
| --------- | ---------------------- | -------------------- |
| ESLint    | 全部 `*.js`            | `npm run lint`       |
| Stylelint | `source/css/**/*.styl` | `npm run style:lint` |
| Prettier  | 全部文件               | `npm run format`     |

- 使用 **2 空格缩进**，遵循 [.editorconfig](../.editorconfig)。
- JavaScript 遵循 [eslint.config.js](../eslint.config.js) 规则（ESLint 9+ 的 **flat config** 格式，`.eslintrc.json` 已在 ESLint 10 被移除）。
- 样式遵循 [.stylelintrc.json](../.stylelintrc.json) 规则。
- Prettier 会跳过 [.prettierignore](../.prettierignore) 中声明的文件 —— 其中 `source/css/` 因 Prettier 不支持 Stylus 语法而排除，样式格式统一由 Stylelint 负责。
- **ESLint 只管代码质量，Prettier 只管代码格式**，两者职责不重叠，不会互相覆盖。
- 提交前会通过 husky + lint-staged 自动执行格式化。

## 提交信息规范

使用 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 规范：

```text
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Type 类型**：

| 类型       | 说明                        |
| ---------- | --------------------------- |
| `feat`     | 新功能                      |
| `fix`      | Bug 修复                    |
| `docs`     | 文档变更                    |
| `style`    | 样式/格式调整（不影响逻辑） |
| `refactor` | 重构（不新增功能不修 Bug）  |
| `perf`     | 性能优化                    |
| `test`     | 测试相关                    |
| `chore`    | 构建/工具链/依赖等杂项      |

**示例**：

```text
feat(search): 支持按标签过滤搜索结果

- 新增 tag 过滤参数
- 更新搜索生成器与前端逻辑
- 补充单元测试

Closes #12
```

> 版本发布（`git-auto-tag`）依赖 commit 类型自动判定版本升级（`feat` → minor，`fix`/`perf` → patch），请务必使用规范前缀。

## 分支与版本管理

- `main` 为受保护默认分支，所有变更通过 PR 合入。
- 版本号遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/)。
- 发布流程由 CNB 流水线自动执行（见下方「发布流程」）。

## 发布流程

项目已接入 CNB 云原生构建自动发布：

1. **自动打 Tag**：在仓库的 **Tag 列表页面**点击「自动生成 Tag」，流水线基于
   [Conventional Commits](https://www.conventionalcommits.org/zh-hans/) 分析提交信息，
   自动计算下一个版本号并创建 `vX.Y.Z` 标签。
2. **发布 Release**：`tag_push` 事件触发后，流水线自动生成 CHANGELOG 并创建
   CNB Release（版本描述自动从 CHANGELOG 读取）。
3. **发布 npm 制品**：流水线将主题打包发布到 CNB npm 制品库
   `npm.cnb.cool/h1s97x/toolkit/-/packages/`。

> 若需手动发布，可执行 `bash npm-publish.sh`（需配置制品库令牌）。

---

再次感谢你的贡献！如有任何疑问，欢迎在 [Issue](https://cnb.cool/h1s97x/hexo-theme-almagest/-/issues) 中提出。
