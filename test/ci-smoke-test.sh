#!/usr/bin/env bash
# Hexo Theme Almagest - CI 冒烟测试
#
# 在临时目录搭建最小 Hexo 站点，安装主题并执行 hexo generate，
# 断言构建成功且关键产物非空（index.html / main.css / search.json / 文章页）。
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_DIR="$(mktemp -d)"
trap 'rm -rf "$DEMO_DIR"' EXIT

echo "==> 初始化临时 Hexo 站点: $DEMO_DIR"
cd "$DEMO_DIR"
npm init -y >/dev/null 2>&1

echo "==> 安装 Hexo 与渲染器"
npm install hexo@^7 hexo-renderer-ejs hexo-renderer-stylus hexo-renderer-marked \
  hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag \
  --no-audit --no-fund --loglevel=error >/dev/null

# 让 hexo-cli 识别项目（package.json 需含 hexo 字段）
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.hexo = { version: '7.0.0' };
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

echo "==> 冒烟测试通过"
