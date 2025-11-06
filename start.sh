#!/bin/bash

echo "========================================="
echo "  AI内容检测系统 - 启动脚本"
echo "========================================="
echo ""

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "错误: 未安装Docker，请先安装Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "错误: 未安装Docker Compose，请先安装Docker Compose"
    exit 1
fi

# 检查环境变量文件
if [ ! -f ai-detector-backend/.env ]; then
    echo "警告: 后端环境变量文件不存在"
    echo "正在从模板创建..."
    cp ai-detector-backend/.env.example ai-detector-backend/.env
    echo "请编辑 ai-detector-backend/.env 文件，设置数据库密码等配置"
    echo ""
fi

if [ ! -f ai-detector-frontend/.env.production ]; then
    echo "警告: 前端环境变量文件不存在"
    echo "正在从模板创建..."
    cp ai-detector-frontend/.env.example ai-detector-frontend/.env.production
    echo ""
fi

# 启动服务
echo "正在启动服务..."
docker-compose up -d

echo ""
echo "========================================="
echo "服务启动完成！"
echo "========================================="
echo ""
echo "前端地址: http://localhost"
echo "后端API: http://localhost:3001"
echo ""
echo "查看日志: docker-compose logs -f"
echo "停止服务: docker-compose down"
echo ""
echo "首次启动可能需要几分钟时间构建镜像"
echo "========================================="
