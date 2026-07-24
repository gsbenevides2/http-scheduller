#!/usr/bin/env bash
set -euo pipefail

# =========================
# Publica pacote npm de tipos no GitHub Container Registry
# =========================

REGISTRY="ghcr.io"
PACKAGE_NAME="@gsbenevides2/http-scheduller-types"

echo "==> Preparing types package for publish..."
echo "    Registry: ${REGISTRY}"
echo "    Package:  ${PACKAGE_NAME}"
echo "    Version:  ${VERSION}"

echo "==> Configuring npm auth for ${REGISTRY}..."
cat > .npmrc <<EOF
//${REGISTRY}/:_authToken=${TOKEN_GITHUB}
@${REPO_OWNER}:registry=https://${REGISTRY}
always-auth=true
EOF

echo "==> Bumping package version to ${VERSION}..."
# Update version in packages/types/package.json using jq
tmp=$(mktemp)
jq --arg v "${VERSION}" '.version = $v' packages/types/package.json > "${tmp}"
mv "${tmp}" packages/types/package.json

echo "==> Building types package..."
cd packages/types
rm -rf dist
bun run build

echo "==> Publishing package to ${REGISTRY}..."
npm publish --registry "https://${REGISTRY}" --access public

echo "==> Package ${PACKAGE_NAME}@${VERSION} published successfully to ${REGISTRY}"
