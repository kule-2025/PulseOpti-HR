#!/bin/bash

# 修复 schema 导入路径错误
# 将所有错误的 @/lib/db/schema 替换为正确的 @/storage/database/shared/schema

echo "开始修复 schema 导入路径..."

# 需要修复的文件列表
FILES=(
  "src/app/api/analytics/industry-comparison/route.ts"
  "src/lib/ai/enhanced-turnover-prediction.ts"
  "src/lib/ai/multi-model-performance-prediction.ts"
  "src/lib/analytics/data-collection.ts"
  "src/lib/analytics/industry-benchmark.ts"
  "src/lib/analytics/realtime-dashboard.ts"
  "src/lib/feishu/feishu-service.ts"
  "src/lib/gdpr/gdpr-compliance.ts"
  "src/lib/reports/report-builder.ts"
)

# 统计修复数量
FIXED_COUNT=0
TOTAL_FILES=${#FILES[@]}

# 修复每个文件
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "处理文件: $file"

    # 替换导入路径
    if grep -q "from '@/lib/db/schema'" "$file"; then
      sed -i "s|from '@/lib/db/schema'|from '@/storage/database/shared/schema'|g" "$file"
      echo "  ✓ 修复成功"
      ((FIXED_COUNT++))
    else
      echo "  - 无需修复（已使用正确路径）"
    fi
  else
    echo "  ✗ 文件不存在"
  fi
done

echo ""
echo "========================================"
echo "修复完成"
echo "========================================"
echo "处理文件数: $TOTAL_FILES"
echo "修复成功: $FIXED_COUNT"
echo "无需修复: $((TOTAL_FILES - FIXED_COUNT))"
echo ""

# 处理 src/lib/db/index.ts
echo "特殊处理: src/lib/db/index.ts"
if [ -f "src/lib/db/index.ts" ]; then
  echo "  注意: 此文件是占位符，需要手动检查是否需要修改"
fi
