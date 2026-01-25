#!/bin/bash

# GitHub 仓库创建脚本
# 使用此脚本在个人账号或组织下创建仓库

set -e

# 配置
GITHUB_TOKEN=""  # 请在运行脚本前设置此环境变量或替换为你的 token
REPO_NAME="pulseopti-hr"
REPO_DESCRIPTION="PulseOpti HR 脉策聚效 - 赋能企业人力资源管理SaaS平台"
PRIVATE="false"

# 检查 token 是否设置
if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ 错误：GITHUB_TOKEN 未设置"
  echo "请使用以下命令设置 token："
  echo "export GITHUB_TOKEN='your_github_token_here'"
  exit 1
fi

# 选择所有者（个人账号或组织）
# 选项 1: 个人账号（替换 YOUR_USERNAME）
# OWNER="yourusername"

# 选项 2: 组织
OWNER="tomato-ai-writer"

# 创建仓库
echo "正在创建仓库: $OWNER/$REPO_NAME..."

response=$(curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/orgs/$OWNER/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"$REPO_DESCRIPTION\",
    \"private\": $PRIVATE,
    \"auto_init\": false
  }" || curl -s -X POST \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/repos \
  -d "{
    \"name\": \"$REPO_NAME\",
    \"description\": \"$REPO_DESCRIPTION\",
    \"private\": $PRIVATE,
    \"auto_init\": false
  }")

# 检查响应
if echo "$response" | grep -q "html_url"; then
  repo_url=$(echo "$response" | grep -o '"html_url": "[^"]*"' | cut -d'"' -f4)
  echo "✅ 仓库创建成功！"
  echo "📍 仓库地址: $repo_url"
  echo ""
  echo "请手动在项目目录执行以下命令推送代码："
  echo "git remote add tomato-ai-writer https://github.com/$OWNER/$REPO_NAME.git"
  echo "git push tomato-ai-writer main"
else
  echo "❌ 仓库创建失败"
  echo "错误信息:"
  echo "$response"
  exit 1
fi
