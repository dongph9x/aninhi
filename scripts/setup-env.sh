#!/bin/bash

# Script để setup environment variables
# Sử dụng: ./scripts/setup-env.sh

set -e

ENV_FILE=".env"
EXAMPLE_FILE=".env.example"

echo "🔧 Setting up environment variables..."

# Tạo file .env.example nếu chưa có
if [ ! -f "$EXAMPLE_FILE" ]; then
    echo "📝 Creating .env.example..."
    cat > "$EXAMPLE_FILE" << EOF
# Database Configuration
DATABASE_URL="file:./data/database.db"

# Discord Bot Configuration
BOT_TOKEN="your_discord_bot_token_here"

# Optional: Environment
NODE_ENV="production"

# Optional: Debug mode
DEBUG="bot:*"
EOF
    echo "✅ Created .env.example"
fi

# Kiểm tra file .env
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File .env không tồn tại!"
    echo "📋 Vui lòng tạo file .env với nội dung:"
    echo ""
    cat "$EXAMPLE_FILE"
    echo ""
    echo "🔑 Lấy Discord Bot Token tại: https://discord.com/developers/applications"
    exit 1
fi

# Kiểm tra BOT_TOKEN
if ! grep -q "BOT_TOKEN" "$ENV_FILE"; then
    echo "⚠️  BOT_TOKEN chưa được cấu hình trong .env"
    echo "📋 Vui lòng thêm dòng sau vào file .env:"
    echo "BOT_TOKEN=\"your_discord_bot_token_here\""
    echo ""
    echo "🔑 Lấy Discord Bot Token tại: https://discord.com/developers/applications"
    exit 1
fi

# Kiểm tra token có phải là placeholder không
if grep -q "your_discord_bot_token_here" "$ENV_FILE"; then
    echo "⚠️  BOT_TOKEN vẫn là placeholder!"
    echo "📋 Vui lòng thay thế 'your_discord_bot_token_here' bằng token thực"
    echo ""
    echo "🔑 Lấy Discord Bot Token tại: https://discord.com/developers/applications"
    exit 1
fi

echo "✅ Environment variables configured correctly!"
echo "🚀 Bạn có thể chạy bot bây giờ" 