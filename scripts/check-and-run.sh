#!/bin/bash

# Script để kiểm tra cấu hình và chạy bot
# Sử dụng: ./scripts/check-and-run.sh

set -e

echo "🔍 Checking bot configuration..."

# Kiểm tra file .env
if [ ! -f ".env" ]; then
    echo "❌ File .env không tồn tại!"
    echo "💡 Chạy: ./scripts/add-bot-token.sh"
    exit 1
fi

# Kiểm tra BOT_TOKEN
if ! grep -q "BOT_TOKEN" ".env"; then
    echo "❌ BOT_TOKEN chưa được cấu hình!"
    echo "💡 Chạy: ./scripts/add-bot-token.sh"
    exit 1
fi

# Kiểm tra token có phải là placeholder không
if grep -q "your_discord_bot_token_here" ".env"; then
    echo "❌ BOT_TOKEN vẫn là placeholder!"
    echo "🔑 Vui lòng cập nhật Discord Bot Token trong file .env"
    echo "🔗 Lấy token tại: https://discord.com/developers/applications"
    exit 1
fi

# Kiểm tra DATABASE_URL
if ! grep -q "DATABASE_URL" ".env"; then
    echo "❌ DATABASE_URL chưa được cấu hình!"
    exit 1
fi

echo "✅ Configuration looks good!"

# Hỏi người dùng muốn chạy gì
echo ""
echo "🚀 Chọn cách chạy bot:"
echo "1) Docker Compose (Production)"
echo "2) Docker Compose Dev (Development)"
echo "3) Local (yarn dev)"
echo "4) Local (yarn start)"
echo "5) Chỉ kiểm tra cấu hình"
echo ""
read -p "Nhập lựa chọn (1-5): " choice

case $choice in
    1)
        echo "🐳 Starting with Docker Compose (Production)..."
        docker compose up -d --build
        ;;
    2)
        echo "🐳 Starting with Docker Compose Dev..."
        docker compose -f docker-compose.dev.yml up -d --build
        ;;
    3)
        echo "💻 Starting locally with yarn dev..."
        yarn dev
        ;;
    4)
        echo "💻 Starting locally with yarn start..."
        yarn start
        ;;
    5)
        echo "✅ Configuration check completed!"
        ;;
    *)
        echo "❌ Lựa chọn không hợp lệ!"
        exit 1
        ;;
esac 