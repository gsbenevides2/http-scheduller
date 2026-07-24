#!/usr/bin/env bash
set -euo pipefail

# =========================
# Publica pacote npm de tipos no GitHub Container Registry
# =========================

REGISTRY="ghcr.io"
PACKAGE_NAME="@gsbenevides2/http-scheduller"

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

echo "==> Building types package..."
bun run tsc -p tsconfig.build.json

echo "==> Publishing package to ${REGISTRY}..."
npm publish --registry "https://${REGISTRY}" --access public

echo "==> Package ${PACKAGE_NAME}@${VERSION} published successfully to ${REGISTRY}"
