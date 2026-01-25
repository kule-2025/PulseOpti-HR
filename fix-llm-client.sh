#!/bin/bash

# 修复所有 LLMClient 初始化代码的脚本

echo "开始修复 LLMClient 初始化代码..."

# 需要修复的文件列表
FILES=(
  "src/app/api/ai/resume-parse/route.ts"
  "src/app/api/ai/resume-batch-parse/route.ts"
  "src/app/api/ai/resume-duplicate/route.ts"
  "src/app/api/ai/interview/chat/route.ts"
  "src/app/api/ai/interview/evaluate/route.ts"
  "src/app/api/ai/interview/generate-questions/route.ts"
  "src/app/api/ai/interview/generate-report/route.ts"
  "src/app/api/ai/performance-prediction/route.ts"
  "src/app/api/ai/turnover-alerts/route.ts"
  "src/app/api/ai/turnover-prediction-enhanced/route.ts"
  "src/app/api/ai/turnover-trends/route.ts"
  "src/app/api/human-efficiency/insights/route.ts"
  "src/app/api/human-efficiency/prediction/route.ts"
  "src/lib/ai-analysis.ts"
  "src/lib/ai/enhanced-interview-service.ts"
  "src/lib/ai/enhanced-turnover-prediction.ts"
  "src/lib/ai/multi-model-performance-prediction.ts"
)

# 1. 在文件顶部添加导入语句
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "处理文件: $file"

    # 检查是否已经导入了配置
    if ! grep -q "from '@/lib/ai/config'" "$file"; then
      # 在 LLMClient 导入后添加配置导入
      sed -i "/import.*LLMClient.*from 'coze-coding-dev-sdk'/a import { llmConfig } from '@/lib/ai/config';" "$file"
      echo "  - 添加配置导入"
    fi
  fi
done

# 2. 修复文件顶部的初始化（方式1）
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # 查找并替换初始化代码
    sed -i 's/const llmConfig = new Config();/\/\/ const llmConfig = new Config(); \/\/ 使用统一的配置/g' "$file"
    sed -i 's/const llmClient = new LLMClient(llmConfig);/const llmClient = new LLMClient(llmConfig);/g' "$file"
    echo "  - 注释旧配置（文件顶部）"
  fi
done

# 3. 修复函数内部的初始化（方式2）
# 对于函数内部的初始化，需要手动处理，因为每个文件的情况不同

echo ""
echo "修复完成！"
echo "注意：函数内部的初始化代码需要手动修复"
echo ""
echo "请使用以下模式替换："
echo "  旧代码："
echo "    const config = new Config();"
echo "    const client = new LLMClient(config);"
echo ""
echo "  新代码："
echo "    const config = new Config({"
echo "      apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,"
echo "    });"
echo "    const client = new LLMClient(config);"
