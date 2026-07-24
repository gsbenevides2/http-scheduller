#!/usr/bin/env bash
set -euo pipefail

echo "Building types package..."
cd packages/types
bun install
bun run build

echo "Types package built successfully"
