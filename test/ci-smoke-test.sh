#!/usr/bin/env bash
# Hexo Theme Almagest - CI 冒烟测试
#
# 在临时目录搭建最小 Hexo 站点，安装主题并执行 hexo generate，
# 断言构建成功且关键产物非空（index.html / main.css / search.json / 文章页）。
#
# 用法：
#   bash test/ci-smoke-test.sh              # 默认验证 Hexo 7
#   HEXO_SPEC=hexo@^8 bash test/ci-smoke-test.sh   # 验证 Hexo 8
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_DIR="$(mktemp -d)"
trap 'rm -rf "$DEMO_DIR"' EXIT

# 允许 CI 通过环境变量切换 Hexo 主版本，构建兼容矩阵
HEXO_SPEC="${HEXO_SPEC:-hexo@^7}"

echo "==> 初始化临时 Hexo 站点: $DEMO_DIR (Hexo: $HEXO_SPEC)"
cd "$DEMO_DIR"
npm init -y >/dev/null 2>&1

echo "==> 安装 Hexo 与渲染器"
npm install "$HEXO_SPEC" hexo-renderer-ejs hexo-renderer-stylus hexo-renderer-marked \
  hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag \
  --no-audit --no-fund --loglevel=error >/dev/null

# 让 hexo-cli 识别项目（package.json 需含 hexo 字段；版本取实际安装值）
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.hexo = { version: require('hexo/package.json').version };
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
"

echo "==> 链接主题"
mkdir -p themes/almagest
cp -r "$ROOT"/. themes/almagest/
rm -rf themes/almagest/node_modules themes/almagest/.git

echo "==> 写入站点配置"
cat > _config.yml <<'YAML'
title: Almagest CI
subtitle: smoke test
description: CI smoke test
author: CI
language: en
url: https://example.com
root: /
permalink: :year/:month/:day/:title/
theme: almagest
index_generator:
  path: ''
  per_page: 10
  order_by: -date
per_page: 10
pagination_dir: page
YAML

echo "==> 创建测试文章"
mkdir -p source/_posts
cat > source/_posts/ci-hello.md <<'MD'
---
title: CI Hello
date: 2024-01-01 00:00:00
categories: [Test]
tags: [ci]
---
Hello Almagest smoke test.

![alt text](/images/ci-test.jpg)
MD

echo "==> hexo generate"
./node_modules/.bin/hexo clean >/dev/null
./node_modules/.bin/hexo generate

echo "==> 校验产物"
[ -s public/index.html ] || { echo "FAIL: public/index.html 为空或缺失"; exit 1; }
[ -s public/css/main.css ] || { echo "FAIL: public/css/main.css 为空或缺失"; exit 1; }
[ -s public/search.json ] || { echo "FAIL: public/search.json 缺失"; exit 1; }
[ -s public/2024/01/01/ci-hello/index.html ] || { echo "FAIL: 文章页面缺失"; exit 1; }
grep -q "CI Hello" public/index.html || { echo "FAIL: 首页未渲染文章"; exit 1; }
grep -q "<script src" public/index.html || { echo "FAIL: 首页缺少脚本引用"; exit 1; }
grep -q "data-src" public/2024/01/01/ci-hello/index.html || { echo "FAIL: 文章图片未启用懒加载"; exit 1; }
grep -q "loading=\"lazy\"" public/2024/01/01/ci-hello/index.html || { echo "FAIL: 文章图片缺少 loading=lazy"; exit 1; }
# 评审 Critical 断言：最终渲染 HTML 必须同时包含 src（data-src 由 lazy-load.js 回填），
# 否则支持原生 lazy 的现代浏览器下图片永远无法加载。
grep -Eq "src=\"/images/ci-test.jpg\"|src='/images/ci-test.jpg'" public/2024/01/01/ci-hello/index.html || { echo "FAIL: 文章页图片缺少 src（懒加载会破图）"; exit 1; }
# 评审 Warning 断言：post.content 不被懒加载 filter 污染。
# 搜索索引现为剥离标签后的纯文本（只保留正文文字），因此断言改为：
#   1) 正文必须被索引到（内容未丢）
#   2) 不得出现 data-src（未被 after_render:html 改写）
#   3) 不得出现 HTML 标签（否则索引体积会随整站正文膨胀）
grep -q 'Hello Almagest smoke test.' public/search.json || { echo "FAIL: search.json 未索引正文（内容丢失）"; exit 1; }
if grep -q 'data-src' public/search.json; then echo "FAIL: search.json 出现 data-src（post.content 被污染）"; exit 1; fi
if grep -q '<img' public/search.json; then echo "FAIL: search.json 出现 HTML 标签（索引未剥离标签）"; exit 1; fi

echo "==> 冒烟测试通过"
