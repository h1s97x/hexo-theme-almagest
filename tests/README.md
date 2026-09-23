# 测试

覆盖主题的**构建扩展层**（`scripts/`）。样式、模板与前端脚本不在单测范围内——
其中前端脚本的选择器契约由冒烟测试间接保障。

## 怎么跑

```bash
npm run test          # 全部：lint + stylelint + 单测 + 冒烟
npm run test:unit     # 仅单元测试（秒级）
npm run test:smoke    # 仅冒烟测试（需联网装依赖，约 2 分钟）
npm run test:cov      # 单元测试 + 覆盖率
```

冒烟测试可指定 Hexo 主版本：

```bash
HEXO_SPEC=hexo@^8 bash tests/smoke.sh
```

## 目录

```
tests/
├── setup.js              共享的 hexo mock
├── smoke.sh              冒烟测试：临时目录自建站点并完整构建
├── fixtures/
│   └── data.txt          asset_code 标签的样本文件
└── unit/
    ├── lib.test.js       纯函数层 —— scripts/lib/
    └── scripts.test.js   注册层   —— scripts/*/index.js
```

## 两层测试的分工

### `unit/` —— 覆盖「函数对不对」

Node 内置 `node:test`，无测试框架依赖。

| 文件              | 覆盖对象                                                    | 为什么可以这样测                               |
| ----------------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `lib.test.js`     | `scripts/lib/{text,html,asset,config}.js`                   | 这层不依赖 `hexo`、无副作用，可直接 `require`  |
| `scripts.test.js` | `scripts/{config,filters,generators,helpers,tags}/index.js` | 装了 `setup.js` 的 mock 后，调用注册进去的回调 |

> 注册层脚本是**直接执行的**（靠全局 `hexo` 注册钩子），每个文件末尾的 `module.exports`
> 只为测试服务、Hexo 加载时忽略。测试流程固定为：**装 mock → require 脚本 → 调回调**。
>
> `scripts/events/index.js` 只往控制台打日志，未纳入单测。

### `smoke.sh` —— 覆盖「整体还能不能跑」

单元测试看不见的东西，全部在这层：

```bash
[ -s public/index.html ]     # 首页生成
[ -s public/css/main.css ]   # Stylus 编译通过
[ -s public/search.json ]    # 搜索索引生成
grep -q "<script src" public/index.html    # layout.ejs 外壳已套上
grep -q "data-src" $POST                   # 懒加载生效
grep -Eq "src=\"/images/..." $POST          # 且保留 src（否则破图）
grep -q 'data-src' public/search.json      # 且 content 未被污染
```

它断言的是**产物特征**，不是函数返回值——所以能拦住「代码没错但接不上」这类问题。

## 加用例

- **测纯函数** → 加到 `unit/lib.test.js` 对应的 `describe` 块
- **测注册层行为** → 加到 `unit/scripts.test.js` 对应模块的 `describe` 块；
  需要新的 hexo API 时，在 `setup.js` 的 mock 上补
- **测构建产物** → 在 `smoke.sh` 的「校验产物」段加一条 `|| fail "..."`
- 增删对外扩展点时，同步更新 `scripts.test.js` 里的「注册点契约」断言

## 已知边界

- 覆盖率的整体数字（`test:cov`）会被 `scripts/` 下**未被单测覆盖的注册层**拉低，
  看覆盖率应关注 `scripts/lib/` 这一层
- 前端脚本（`source/js/`）与模板（`layout/`）没有单测；
  两者之间是**字符串级隐式耦合**（选择器 / `window.__almagest*` 变量），
  目前唯一的防线是冒烟测试的产物断言
