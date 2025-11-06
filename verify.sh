#!/bin/bash

echo "========================================="
echo "  AI内容检测系统 - 代码完整性验证"
echo "========================================="
echo ""

# 验证标志
ALL_PASSED=true

# 检查函数
check_file() {
    if [ -f "$1" ]; then
        echo "✓ $1"
    else
        echo "✗ $1 (缺失)"
        ALL_PASSED=false
    fi
}

check_dir() {
    if [ -d "$1" ]; then
        echo "✓ $1/"
    else
        echo "✗ $1/ (缺失)"
        ALL_PASSED=false
    fi
}

echo "1. 验证后端文件..."
echo "-----------------------------------"
check_file "ai-detector-backend/package.json"
check_file "ai-detector-backend/tsconfig.json"
check_file "ai-detector-backend/Dockerfile"
check_file "ai-detector-backend/.env.example"
check_file "ai-detector-backend/src/index.ts"
check_file "ai-detector-backend/src/services/aiDetectionService.ts"
check_file "ai-detector-backend/src/services/fileProcessorService.ts"
check_file "ai-detector-backend/src/controllers/detectionController.ts"
check_file "ai-detector-backend/src/routes/detectionRoutes.ts"
check_file "ai-detector-backend/prisma/schema.prisma"
check_dir "ai-detector-backend/prisma/migrations"
echo ""

echo "2. 验证前端文件..."
echo "-----------------------------------"
check_file "ai-detector-frontend/package.json"
check_file "ai-detector-frontend/tsconfig.json"
check_file "ai-detector-frontend/Dockerfile"
check_file "ai-detector-frontend/nginx.conf"
check_file "ai-detector-frontend/.env.example"
check_file "ai-detector-frontend/src/App.tsx"
check_file "ai-detector-frontend/src/main.tsx"
check_file "ai-detector-frontend/src/components/FileUpload.tsx"
check_file "ai-detector-frontend/src/components/TextInput.tsx"
check_file "ai-detector-frontend/src/components/ResultDisplay.tsx"
check_file "ai-detector-frontend/src/components/HistoryList.tsx"
check_file "ai-detector-frontend/src/lib/api.ts"
check_file "ai-detector-frontend/src/types/api.ts"
echo ""

echo "3. 验证部署配置..."
echo "-----------------------------------"
check_file "docker-compose.yml"
check_file "start.sh"
check_file ".gitignore"
echo ""

echo "4. 验证文档..."
echo "-----------------------------------"
check_file "README.md"
check_file "DEPLOYMENT.md"
check_file "API_TESTING.md"
check_file "QUICK_START.md"
check_file "PROJECT_DELIVERY.md"
echo ""

echo "5. 统计代码行数..."
echo "-----------------------------------"
if [ -f "ai-detector-backend/src/services/aiDetectionService.ts" ]; then
    LINES=$(wc -l < "ai-detector-backend/src/services/aiDetectionService.ts")
    echo "AI检测算法: $LINES 行"
fi

if [ -f "ai-detector-backend/src/controllers/detectionController.ts" ]; then
    LINES=$(wc -l < "ai-detector-backend/src/controllers/detectionController.ts")
    echo "检测控制器: $LINES 行"
fi

if [ -f "ai-detector-frontend/src/App.tsx" ]; then
    LINES=$(wc -l < "ai-detector-frontend/src/App.tsx")
    echo "主应用组件: $LINES 行"
fi

if [ -f "ai-detector-frontend/src/components/ResultDisplay.tsx" ]; then
    LINES=$(wc -l < "ai-detector-frontend/src/components/ResultDisplay.tsx")
    echo "结果展示组件: $LINES 行"
fi
echo ""

echo "========================================="
if [ "$ALL_PASSED" = true ]; then
    echo "✓ 所有文件验证通过"
    echo "========================================="
    echo ""
    echo "下一步: 进行实际部署测试"
    echo "运行: ./start.sh"
    exit 0
else
    echo "✗ 部分文件缺失，请检查"
    echo "========================================="
    exit 1
fi
