#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

echo "Running database migrations..."

# 检查是否设置了 DATABASE_URL
if [ -z "${DATABASE_URL}" ]; then
  echo "Error: DATABASE_URL environment variable is not set"
  echo "Please set it before running migrations"
  exit 1
fi

# 生成迁移文件（如果需要）
echo "Generating migration files..."
npx drizzle-kit generate:pg

# 推送 schema 到数据库（开发环境）
echo "Pushing schema to database..."
npx drizzle-kit push:pg

echo "Database migrations completed successfully!"
