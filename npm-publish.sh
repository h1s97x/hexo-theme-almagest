#!/usr/bin/env bash
# ============================================================
# Hexo Theme Almagest - npm 制品发布脚本
#
# 用法:
#   bash npm-publish.sh                     # 发布当前版本到 CNB npm 制品库
#   NPM_REGISTRY=<url> bash npm-publish.sh  # 发布到指定 registry
#
# 环境变量:
#   CNB_TOKEN          制品库访问令牌（必填）
#   NPM_REGISTRY       制品库地址（默认 CNB toolkit 制品库）
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

# 默认发布到 CNB npm 制品库（h1s97x/toolkit）
NPM_REGISTRY="${NPM_REGISTRY:-https://npm.cnb.cool/h1s97x/toolkit/-/packages/}"

if [[ -z "${CNB_TOKEN:-}" ]]; then
  echo "❌ 缺少 CNB_TOKEN 环境变量（制品库访问令牌）" >&2
  echo "   请在密钥仓库中配置，或在本地 .npmrc 配置凭据后手动发布。" >&2
  exit 1
fi

VERSION="$(node -p "require('./package.json').version")"
echo "==> 发布 hexo-theme-almagest@${VERSION} -> ${NPM_REGISTRY}"

# 使用临时 .npmrc，避免污染仓库
NPMRC="$(mktemp)"
trap 'rm -f "$NPMRC"' EXIT
cat > "$NPMRC" <<EOF
registry=${NPM_REGISTRY}
always-auth=true
//$(echo "${NPM_REGISTRY#https://}" | sed 's#/#/#g'):_authToken=${CNB_TOKEN}
EOF

npm publish --userconfig "$NPMRC" --access public
echo "✅ 发布成功: hexo-theme-almagest@${VERSION}"
