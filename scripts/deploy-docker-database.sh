#!/bin/bash

# 🐳 Deploy Docker Database
# Script này deploy database trong Docker container

echo "🐳 Deploying Docker Database..."

# 1. Dừng container hiện tại nếu có
echo "1️⃣ Dừng container hiện tại..."
docker-compose down

# 2. Build lại image
echo "2️⃣ Build lại Docker image..."
docker-compose build

# 3. Khởi tạo database
echo "3️⃣ Khởi tạo database..."
docker-compose --profile init up database-init

# 4. Kiểm tra kết quả
if [ $? -eq 0 ]; then
    echo "✅ Database đã được khởi tạo thành công!"
else
    echo "❌ Có lỗi khi khởi tạo database!"
    exit 1
fi

# 5. Khởi động bot
echo "4️⃣ Khởi động bot..."
docker-compose up -d aninhi-bot

# 6. Kiểm tra logs
echo "5️⃣ Kiểm tra logs..."
sleep 5
docker-compose logs aninhi-bot

echo "🎉 Deploy hoàn tất!"
echo "📊 Để xem logs: docker-compose logs -f aninhi-bot"
echo "🔧 Để vào container: docker-compose exec aninhi-bot sh" 