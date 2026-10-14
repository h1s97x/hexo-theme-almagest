#!/usr/bin/env bash
#
# 冒烟测试：在临时目录里自建一个最小 Hexo 站点，完整跑一遍 hexo generate，
# 再对产物做断言。
#
# 这是唯一能验证「主题整体还能构建」的检查——单元测试只覆盖函数级行为。
#
# 用法：
#   bash tests/smoke.sh                     # 默认 Hexo 8（engines 声明版本）
#   HEXO_SPEC=hexo@^7 bash tests/smoke.sh   # 指定 Hexo 主版本（CI 观测矩阵 7/8）
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

HEXO_SPEC="${HEXO_SPEC:-hexo@^8}"

echo "==> 初始化临时站点: $WORK  (Hexo: $HEXO_SPEC)"
cd "$WORK"
npm init -y >/dev/null 2>&1

echo "==> 安装 Hexo 与渲染器"
npm install "$HEXO_SPEC" hexo-renderer-ejs hexo-renderer-stylus hexo-renderer-marked \
  hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag \
  --no-audit --no-fund --loglevel=error >/dev/null

# hexo-cli 通过 package.json 的 hexo 字段识别项目，版本取实际安装值
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
# reference-themes/ 是学习参考用的第三方主题克隆（已 gitignore），
# 其中嵌套的 layout/（如 sakura 的 themes/Sakura/layout/）会被 Hexo 的
# 视图处理器按同名视图注册，覆盖主题自身的 post/categories/tags 等模板，
# 导致构建失败。复制成主题时必须剔除。
rm -rf themes/almagest/reference-themes

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
fail() { echo "FAIL: $1"; exit 1; }

POST=public/2024/01/01/ci-hello/index.html

# --- 构建完整性 ---
[ -s public/index.html ] || fail "public/index.html 缺失或为空"
[ -s public/css/main.css ] || fail "public/css/main.css 缺失或为空（Stylus 编译失败？）"
[ -s public/search.json ] || fail "public/search.json 缺失"
[ -s "$POST" ] || fail "文章页面缺失"

# --- 外壳与内容 ---
# '<script src' 只出现在 layout.ejs → 该断言同时验证「页面外壳已套上」
grep -q "CI Hello" public/index.html || fail "首页未渲染文章"
grep -q "<script src" public/index.html || fail "首页缺少脚本引用（layout 外壳未生效）"

# --- 图片懒加载：必须同时保留 src ---
# 只加 data-src 而删掉 src，会导致现代浏览器下图片永久破图
grep -q "data-src" "$POST" || fail "文章图片未启用懒加载（缺 data-src）"
grep -q 'loading="lazy"' "$POST" || fail "文章图片缺少 loading=lazy"
grep -Eq "src=\"/images/ci-test.jpg\"|src='/images/ci-test.jpg'" "$POST" \
  || fail "文章页图片缺少 src（懒加载会破图）"

# --- search.json 不被懒加载污染 ---
# 懒加载挂在 after_render:html（渲染层）而非 after_post_render，
# 因此 post.content 保持原始 src，下游消费者不受影响。
grep -q 'Hello Almagest smoke test.' public/search.json || fail "search.json 未索引正文（内容丢失）"
if grep -q 'data-src' public/search.json; then
  fail "search.json 出现 data-src（post.content 被污染）"
fi
if grep -q '<img' public/search.json; then
  fail "search.json 出现 HTML 标签（索引未剥离标签，体积会膨胀）"
fi

echo "==> 冒烟测试通过"
