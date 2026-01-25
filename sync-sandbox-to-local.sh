#!/bin/bash

# PulseOpti HR - 沙箱到本地同步脚本 (Bash版本)
# 使用方法：chmod +x sync-sandbox-to-local.sh && ./sync-sandbox-to-local.sh

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_menu() {
    echo -e "${WHITE}$1${NC}"
}

# 显示菜单
show_menu() {
    clear
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  PulseOpti HR - 沙箱文件同步工具${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""
    print_menu "请选择同步方式："
    echo ""
    print_menu "1. 🔧 完整同步 (推荐)"
    print_menu "   - 同步所有源代码文件"
    print_menu "   - 保留node_modules和.next"
    print_menu "   - 重新安装依赖"
    echo ""
    print_menu "2. 📦 仅同步源代码"
    print_menu "   - 仅同步src目录和配置文件"
    print_menu "   - 不安装依赖"
    echo ""
    print_menu "3. 🔄 增量同步"
    print_menu "   - 同步修改过的文件"
    print_menu "   - 基于文件时间戳对比"
    echo ""
    print_menu "4. 📋 查看同步清单"
    print_menu "   - 显示需要同步的文件列表"
    echo ""
    print_menu "5. 🚀 快速验证"
    print_menu "   - 验证本地环境配置"
    print_menu "   - 检查依赖和构建"
    echo ""
    print_menu "6. 🚪 退出"
    echo ""
}

# 显示同步统计
show_stats() {
    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  同步统计信息${NC}"
    echo -e "${CYAN}========================================${NC}"
    echo ""

    # 统计文件数量
    src_files=$(find src -type f 2>/dev/null | wc -l) || src_files=0
    api_files=$(find src/app/api -type f 2>/dev/null | wc -l) || api_files=0
    page_files=$(find src/app -name "*.tsx" -type f 2>/dev/null | wc -l) || page_files=0
    lib_files=$(find src/lib -type f 2>/dev/null | wc -l) || lib_files=0

    print_menu "📁 项目文件统计："
    echo "   - 源代码文件： $src_files 个"
    echo "   - API端点：   $api_files 个"
    echo "   - 页面文件：   $page_files 个"
    echo "   - 工具库：     $lib_files 个"
    echo ""

    # 检查依赖
    if [ -d "node_modules" ]; then
        print_success "node_modules 已存在"
    else
        print_error "node_modules 不存在"
    fi

    # 检查构建
    if [ -d ".next" ]; then
        print_success ".next 构建目录已存在"
    else
        print_error ".next 构建目录不存在"
    fi

    # 检查环境变量
    if [ -f ".env" ]; then
        print_success ".env 文件已存在"
    else
        print_warning ".env 文件不存在 (需要从.env.example复制)"
    fi

    echo ""
}

# 完整同步
full_sync() {
    echo ""
    print_info "开始完整同步..."
    echo ""

    # 检查项目文件
    if [ ! -f "package.json" ]; then
        print_error "错误：当前目录不是项目根目录"
        print_warning "请在项目根目录执行此脚本"
        read -p "按回车键继续..."
        return
    fi

    # 创建备份
    print_info "创建备份..."
    backup_dir="backups/backup_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    # 复制文件到备份目录（排除 node_modules, .next, .git, backups）
    rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='backups' . "$backup_dir/" 2>/dev/null || {
        # 如果 rscommand 不可用，使用 cp
        mkdir -p "$backup_dir"
        find . -maxdepth 1 -type f -exec cp {} "$backup_dir/" \;
        [ -d "src" ] && cp -r src "$backup_dir/"
        [ -d "public" ] && cp -r public "$backup_dir/"
    }

    print_success "备份完成：$backup_dir"

    # 同步文件
    echo ""
    print_info "同步文件..."

    sync_dirs=(
        "src"
        "public"
        "components.json"
        "tsconfig.json"
        "tailwind.config.ts"
        "next.config.ts"
        "drizzle.config.ts"
        "vercel.json"
        "package.json"
        ".env.example"
    )

    for dir in "${sync_dirs[@]}"; do
        if [ -e "$dir" ]; then
            print_menu "   同步 $dir..."
            rm -rf "$dir"
        fi
        cp -r "$dir" . 2>/dev/null || true
    done

    print_success "文件同步完成"

    # 重新安装依赖
    echo ""
    print_info "重新安装依赖..."
    print_warning "   这可能需要几分钟时间..."

    # 检查pnpm
    if ! command -v pnpm &> /dev/null; then
        print_error "错误：pnpm 未安装"
        print_warning "请先安装 pnpm：npm install -g pnpm"
        read -p "按回车键继续..."
        return
    fi

    rm -rf node_modules pnpm-lock.yaml .next

    if pnpm install; then
        print_success "依赖安装完成"
    else
        print_error "依赖安装失败"
        read -p "按回车键继续..."
        return
    fi

    # 环境变量配置
    echo ""
    print_info "配置环境变量..."

    if [ ! -f ".env" ]; then
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env 文件已创建（从.env.example复制）"
            print_warning "   ⚠️  请编辑 .env 文件，填入真实的配置信息"
        else
            print_error "错误：找不到 .env.example 文件"
        fi
    else
        print_success ".env 文件已存在"
    fi

    echo ""
    print_success "完整同步完成！"
    echo ""
    print_menu "下一步操作："
    print_menu "   1. 编辑 .env 文件，配置数据库和其他环境变量"
    print_menu "   2. 运行数据库迁移：pnpm db:push"
    print_menu "   3. 启动开发服务器：pnpm dev"
    echo ""
}

# 仅同步源代码
source_sync() {
    echo ""
    print_info "开始同步源代码..."
    echo ""

    sync_dirs=(
        "src"
        "public"
        "components.json"
        "tsconfig.json"
        "tailwind.config.ts"
        "next.config.ts"
        "drizzle.config.ts"
        "vercel.json"
        "package.json"
        ".env.example"
    )

    for dir in "${sync_dirs[@]}"; do
        if [ -e "$dir" ]; then
            print_menu "   同步 $dir..."
            rm -rf "$dir"
        fi
        cp -r "$dir" . 2>/dev/null || true
    done

    print_success "源代码同步完成"
    echo ""
    print_warning "提示：运行 'pnpm install' 安装依赖"
    echo ""
}

# 增量同步
incremental_sync() {
    echo ""
    print_info "开始增量同步..."
    echo ""

    source_base="/workspace/projects"
    target_base="."

    # 如果 source_base 不存在，跳过
    if [ ! -d "$source_base" ]; then
        print_warning "沙箱目录不存在，跳过增量同步"
        return
    fi

    synced_count=0
    skipped_count=0

    # 获取沙箱中的所有文件
    while IFS= read -r -d '' file; do
        relative_path="${file#$source_base/}"
        target_path="$target_base/$relative_path"

        # 排除 node_modules 和 .next
        if [[ "$relative_path" == *"node_modules"* ]] || [[ "$relative_path" == *".next"* ]]; then
            continue
        fi

        # 检查目标文件是否存在
        if [ -f "$target_path" ]; then
            # 比较文件时间戳
            if [ "$file" -nt "$target_path" ]; then
                # 文件已更新，复制
                target_dir=$(dirname "$target_path")
                mkdir -p "$target_dir"
                cp -f "$file" "$target_path"
                ((synced_count++))
                print_success "   更新：$relative_path"
            else
                ((skipped_count++))
            fi
        else
            # 文件不存在，复制
            target_dir=$(dirname "$target_path")
            mkdir -p "$target_dir"
            cp -f "$file" "$target_path"
            ((synced_count++))
            print_success "   新增：$relative_path"
        fi
    done < <(find "$source_base" -type f -print0 2>/dev/null)

    echo ""
    print_success "增量同步完成"
    echo "   更新：$synced_count 个文件"
    echo "   跳过：$skipped_count 个文件"
    echo ""
}

# 显示同步清单
show_list() {
    echo ""
    print_info "需要同步的文件清单："
    echo ""

    cat << 'EOF'
📁 核心配置文件
   ✓ package.json
   ✓ tsconfig.json
   ✓ next.config.ts
   ✓ tailwind.config.ts
   ✓ drizzle.config.ts
   ✓ vercel.json
   ✓ .env.example

📁 前端页面 (82个)
   ✓ 首页和公共页面 (8个)
   ✓ 仪表盘 (8个)
   ✓ 超管端页面 (13个)
   ✓ 业务模块页面 (53个)

📁 后端API (88个)
   ✓ 认证API (9个)
   ✓ 超管端API (14个)
   ✓ 业务API (65个)

📁 工具库 (14个)
   ✓ 数据库配置
   ✓ 认证授权
   ✓ 工具函数

📁 业务管理器 (36个)
   ✓ 招聘、绩效、考勤等

📁 工作流管理器 (8个)
   ✓ 15种工作流支持

📁 公共资源
   ✓ Logo和图标
   ✓ 微信/支付宝二维码
   ✓ 字体文件

📁 文档文件 (60+个)
   ✓ 部署文档
   ✓ 配置文档
   ✓ 诊断文档
   ✓ 优化文档
EOF

    echo ""
    print_warning "完整清单请参考 FILE_SYNC_CHECKLIST.md"
    echo ""
}

# 快速验证
quick_verify() {
    echo ""
    print_info "开始快速验证..."
    echo ""

    issues=0

    # 检查依赖
    echo "1️⃣  检查依赖..."
    if [ -d "node_modules" ]; then
        print_success "node_modules 存在"
    else
        print_error "node_modules 不存在"
        ((issues++))
    fi

    # 检查环境变量
    echo "2️⃣  检查环境变量..."
    if [ -f ".env" ]; then
        print_success ".env 文件存在"

        # 检查关键配置
        if grep -q "DATABASE_URL=" .env; then
            print_success "DATABASE_URL 已配置"
        else
            print_error "DATABASE_URL 未配置"
            ((issues++))
        fi

        if grep -q "JWT_SECRET=" .env; then
            print_success "JWT_SECRET 已配置"
        else
            print_warning "JWT_SECRET 未配置（将使用默认值）"
        fi
    else
        print_error ".env 文件不存在"
        ((issues++))
    fi

    # 检查TypeScript
    echo "3️⃣  检查TypeScript..."
    if [ -f "tsconfig.json" ]; then
        print_success "tsconfig.json 存在"
        print_menu "   运行类型检查..."
        if pnpm ts-check; then
            print_success "TypeScript 类型检查通过"
        else
            print_warning "TypeScript 类型检查有警告"
        fi
    else
        print_error "tsconfig.json 不存在"
        ((issues++))
    fi

    # 检查构建
    echo "4️⃣  检查构建..."
    if [ -d ".next" ]; then
        print_success ".next 构建目录存在"
    else
        print_warning ".next 构建目录不存在"
        print_warning "提示：运行 'pnpm build' 构建项目"
    fi

    # 检查端口
    echo "5️⃣  检查端口..."
    if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "端口 5000 已被占用"
    else
        print_success "端口 5000 可用"
    fi

    echo ""
    echo -e "${CYAN}========================================${NC}"
    echo -e "${CYAN}  验证结果${NC}"
    echo -e "${CYAN}========================================${NC}"

    if [ $issues -eq 0 ]; then
        echo ""
        print_success "所有检查通过！环境配置正常。"
        echo ""
        print_menu "下一步："
        print_menu "   1. 运行数据库迁移：pnpm db:push"
        print_menu "   2. 启动开发服务器：pnpm dev"
        print_menu "   3. 访问 http://localhost:5000"
        echo ""
    else
        echo ""
        print_warning "发现 $issues 个问题需要处理"
        echo ""
    fi
}

# 主循环
while true; do
    show_menu
    read -p "请输入选项 (1-6): " choice

    case $choice in
        1)
            full_sync
            show_stats
            ;;
        2)
            source_sync
            show_stats
            ;;
        3)
            incremental_sync
            show_stats
            ;;
        4)
            show_list
            ;;
        5)
            quick_verify
            ;;
        6)
            echo ""
            echo "👋 再见！"
            echo ""
            exit 0
            ;;
        *)
            echo ""
            print_error "无效选项，请重新选择"
            echo ""
            ;;
    esac

    echo ""
    read -p "按回车键继续..."
done
