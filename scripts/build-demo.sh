#!/usr/bin/env bash
# ============================================================
# Hexo Theme Almagest - Demo 站点构建脚本
#
# 用法:
#   bash scripts/build-demo.sh [输出目录]
#
# 默认输出到 .demo/public，供 CNB 流水线部署 EdgeOne Pages / 静态托管使用。
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEMO_DIR="${ROOT}/.demo"
OUTPUT_DIR="${1:-${DEMO_DIR}/public}"

echo "==> 构建 Hexo Theme Almagest Demo 站点"
echo "    Demo 源码: ${ROOT}/doc"
echo "    输出目录:  ${OUTPUT_DIR}"

# 1. 准备 Demo 站点目录
rm -rf "$DEMO_DIR"
mkdir -p "$DEMO_DIR/themes"
cp -r "$ROOT"/doc/. "$DEMO_DIR/"
rm -rf "$DEMO_DIR/themes"

# 2. 链接主题
mkdir -p "$DEMO_DIR/themes/almagest"
# 排除 node_modules / .git / demo 构建产物，避免递归复制
# rsync 可能不可用，使用 tar 管道实现排除复制
(cd "$ROOT" && tar --exclude='./node_modules' --exclude='./.git' --exclude='./.demo' \
  --exclude='./public' --exclude='./db.json' --exclude='./.cnb' \
  -cf - .) | (mkdir -p "$DEMO_DIR/themes/almagest" && tar -xf - -C "$DEMO_DIR/themes/almagest")

# 3. 初始化站点 package.json 并安装依赖
cd "$DEMO_DIR"
# .demo 目录名不是合法 npm 包名，需显式指定 name
npm init -y --scope=almagest-demo >/dev/null 2>&1 || \
  node -e "require('fs').writeFileSync('package.json', JSON.stringify({name:'almagest-demo',version:'1.0.0'}, null, 2))"
node -e "
const fs = require('fs');
const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
p.hexo = { version: '7.0.0' };
fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
"
echo "==> 安装 Hexo 与依赖（首次较慢）"
npm install hexo@^7 hexo-renderer-ejs hexo-renderer-stylus hexo-renderer-marked \
  hexo-generator-index hexo-generator-archive hexo-generator-category hexo-generator-tag \
  --no-audit --no-fund --loglevel=error

# 4. 构建
echo "==> hexo generate"
./node_modules/.bin/hexo clean >/dev/null
./node_modules/.bin/hexo generate

# 5. 断言产物非空
[ -s public/index.html ] || { echo "FAIL: demo index.html 为空或缺失"; exit 1; }
[ -s public/css/main.css ] || { echo "FAIL: demo main.css 为空或缺失"; exit 1; }

echo "==> Demo 构建成功: ${OUTPUT_DIR}"
echo "    文件数: $(find public -type f | wc -l)"
