#!/bin/bash

# Script để thêm BOT_TOKEN vào file .env
# Sử dụng: ./scripts/add-bot-token.sh

set -e

ENV_FILE=".env"

echo "🔧 Adding BOT_TOKEN to .env file..."

# Kiểm tra file .env có tồn tại không
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ File .env không tồn tại!"
    echo "📝 Tạo file .env..."
    echo 'DATABASE_URL="file:./data/database.db"' > "$ENV_FILE"
fi

# Kiểm tra BOT_TOKEN đã có chưa
if grep -q "BOT_TOKEN" "$ENV_FILE"; then
    echo "⚠️  BOT_TOKEN đã tồn tại trong .env"
    echo "📋 Nội dung hiện tại:"
    grep "BOT_TOKEN" "$ENV_FILE"
    echo ""
    echo "🔧 Để thay đổi token, hãy chỉnh sửa file .env thủ công"
    exit 0
fi

# Thêm BOT_TOKEN vào cuối file
echo "" >> "$ENV_FILE"
echo 'BOT_TOKEN="your_discord_bot_token_here"' >> "$ENV_FILE"

echo "✅ Đã thêm BOT_TOKEN vào .env"
echo ""
echo "📋 Nội dung file .env:"
cat "$ENV_FILE"
echo ""
echo "🔑 Vui lòng thay thế 'your_discord_bot_token_here' bằng Discord Bot Token thực"
echo "🔗 Lấy token tại: https://discord.com/developers/applications"
echo ""
echo "💡 Sau khi cập nhật token, chạy lại: ./scripts/setup-env.sh" 