#!/bin/bash

# 🗑️ Script xóa data n.toplose trong Docker Environment
# Sử dụng: ./scripts/delete-toplose-data-docker.sh

echo "🗑️ Xóa Toàn Bộ Data n.toplose (GameStats) - Docker Environment"
echo ""

# Kiểm tra xem container có đang chạy không
CONTAINER_NAME="aninhi-discord-bot"

if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Container $CONTAINER_NAME không đang chạy!"
    echo "💡 Hãy chạy: docker-compose up -d"
    exit 1
fi

echo "✅ Container $CONTAINER_NAME đang chạy"
echo ""

# 1. Thống kê trước khi xóa
echo "1️⃣ Thống Kê Trước Khi Xóa:"
echo ""

# Đếm tổng số GameStats records
TOTAL_RECORDS=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "SELECT COUNT(*) FROM \"GameStats\";" | tr -d ' ')
echo "   📊 Tổng số GameStats records: $TOTAL_RECORDS"

if [ "$TOTAL_RECORDS" -eq 0 ]; then
    echo "   ✅ Không có GameStats data nào để xóa"
    exit 0
fi

echo ""

# Thống kê theo gameType
echo "   📈 Thống kê theo loại game:"
docker exec $CONTAINER_NAME psql -U postgres -d aninhi -c "
SELECT 
    \"gameType\",
    COUNT(*) as records,
    SUM(\"totalLost\") as total_lost,
    SUM(\"totalBet\") as total_bet,
    SUM(\"gamesPlayed\") as games_played,
    SUM(\"gamesWon\") as games_won
FROM \"GameStats\"
GROUP BY \"gameType\"
ORDER BY \"gameType\";
"

echo ""

# 2. Hiển thị top 5 records có totalLost cao nhất
echo "2️⃣ Top 5 Records Có Total Lost Cao Nhất:"
docker exec $CONTAINER_NAME psql -U postgres -d aninhi -c "
SELECT 
    \"userId\",
    \"gameType\",
    \"totalLost\",
    \"totalBet\",
    \"gamesPlayed\",
    \"gamesWon\",
    \"biggestLoss\"
FROM \"GameStats\"
ORDER BY \"totalLost\" DESC
LIMIT 5;
"

echo ""

# 3. Xác nhận xóa
echo "3️⃣ Xác Nhận Xóa:"
echo "   ⚠️  Bạn sắp xóa $TOTAL_RECORDS GameStats records!"
echo "   ⚠️  Hành động này KHÔNG THỂ HOÀN TÁC!"
echo "   ⚠️  Tất cả dữ liệu n.toplose sẽ bị mất vĩnh viễn!"
echo "   ⚠️  Các lệnh sau sẽ không hoạt động:"
echo "      - n.toplose"
echo "      - n.toplose all"
echo "      - n.toplose blackjack"
echo "      - n.toplose slots"
echo "      - n.toplose roulette"
echo "      - n.toplose coinflip"
echo "      - n.toplose stats"
echo "   ⚠️  Top Lose GIF trong n.fishing sẽ không hiển thị!"
echo ""

read -p "🤔 Bạn có chắc chắn muốn xóa? (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Đã hủy bỏ việc xóa data"
    exit 0
fi

# 4. Bắt đầu xóa
echo "4️⃣ Bắt Đầu Xóa..."
echo ""

# Xóa tất cả GameStats records
DELETED_COUNT=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "DELETE FROM \"GameStats\"; SELECT ROW_COUNT();" | tr -d ' ')

echo "   ✅ Đã xóa $DELETED_COUNT GameStats records"

# 5. Thống kê sau khi xóa
echo ""
echo "5️⃣ Thống Kê Sau Khi Xóa:"

REMAINING_RECORDS=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "SELECT COUNT(*) FROM \"GameStats\";" | tr -d ' ')
echo "   📊 GameStats records còn lại: $REMAINING_RECORDS"

if [ "$REMAINING_RECORDS" -eq 0 ]; then
    echo "   ✅ Đã xóa sạch tất cả GameStats data!"
else
    echo "   ⚠️  Vẫn còn $REMAINING_RECORDS records chưa xóa được"
fi

# 6. Kiểm tra ảnh hưởng
echo ""
echo "6️⃣ Kiểm Tra Ảnh Hưởng:"

# Kiểm tra xem còn user nào không
REMAINING_USERS=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "SELECT COUNT(*) FROM \"User\";" | tr -d ' ')
echo "   👥 Users còn lại: $REMAINING_USERS"

# Kiểm tra xem còn fish nào không
REMAINING_FISH=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "SELECT COUNT(*) FROM \"Fish\";" | tr -d ' ')
echo "   🐟 Fish còn lại: $REMAINING_FISH"

# Kiểm tra xem còn breeding history không
REMAINING_BREEDING=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "SELECT COUNT(*) FROM \"BreedingHistory\";" | tr -d ' ')
echo "   🧬 Breeding history còn lại: $REMAINING_BREEDING"

# Kiểm tra xem còn battle history không
REMAINING_BATTLES=$(docker exec $CONTAINER_NAME psql -U postgres -d aninhi -t -c "SELECT COUNT(*) FROM \"BattleHistory\";" | tr -d ' ')
echo "   ⚔️ Battle history còn lại: $REMAINING_BATTLES"

# 7. Thông báo về các lệnh bị ảnh hưởng
echo ""
echo "7️⃣ Lệnh Bị Ảnh Hưởng:"
echo "   ❌ n.toplose - Sẽ hiển thị \"Chưa có dữ liệu thua lỗ nào!\""
echo "   ❌ n.toplose all - Sẽ hiển thị \"Chưa có dữ liệu thua lỗ nào!\""
echo "   ❌ n.toplose blackjack - Sẽ hiển thị \"Chưa có dữ liệu thua lỗ Blackjack nào!\""
echo "   ❌ n.toplose slots - Sẽ hiển thị \"Chưa có dữ liệu thua lỗ Slots nào!\""
echo "   ❌ n.toplose roulette - Sẽ hiển thị \"Chưa có dữ liệu thua lỗ Roulette nào!\""
echo "   ❌ n.toplose coinflip - Sẽ hiển thị \"Chưa có dữ liệu thua lỗ Coin Flip nào!\""
echo "   ❌ n.toplose stats - Sẽ hiển thị \"Chưa có dữ liệu thống kê nào!\""
echo "   ⚠️  n.fishing - Top Lose GIF sẽ không hiển thị cho bất kỳ ai"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Xóa data n.toplose hoàn tất!"
echo "💡 Lưu ý: Các lệnh n.toplose sẽ không hoạt động cho đến khi có data mới" 