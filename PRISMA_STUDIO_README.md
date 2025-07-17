# 🔍 Prisma Studio - Xem Database

Hướng dẫn cách mở port để xem dữ liệu database bằng Prisma Studio.

## 🚀 Cách 1: Chạy từ Host (Khuyến nghị)

### Sử dụng script:
```bash
# Chạy script tự động
./scripts/start-prisma-studio.sh

# Hoặc sử dụng npm script
npm run db:studio:host
```

### Chạy trực tiếp:
```bash
# Generate Prisma client (nếu chưa có)
npx prisma generate

# Chạy Prisma Studio
npx prisma studio --hostname 0.0.0.0 --port 5555
```

## 🐳 Cách 2: Chạy trong Docker

### Chạy service Prisma Studio:
```bash
# Chạy chỉ service Prisma Studio
docker compose --profile studio up prisma-studio

# Hoặc chạy tất cả services
docker compose --profile studio up -d
```

### Truy cập:
- **URL**: http://localhost:5555
- **Host**: 0.0.0.0
- **Port**: 5555

## 📊 Tính năng Prisma Studio

### Xem dữ liệu:
- ✅ Xem tất cả tables
- ✅ Xem records trong mỗi table
- ✅ Tìm kiếm và lọc dữ liệu
- ✅ Sắp xếp theo cột

### Chỉnh sửa dữ liệu:
- ✅ Thêm records mới
- ✅ Sửa records hiện có
- ✅ Xóa records
- ✅ Import/Export data

### Database Schema:
- ✅ Xem cấu trúc tables
- ✅ Xem relationships
- ✅ Xem indexes

## 🗂️ Các Tables có sẵn:

1. **User** - Thông tin người dùng
2. **Transaction** - Lịch sử giao dịch
3. **DailyClaim** - Lịch sử nhận daily
4. **GameStats** - Thống kê game
5. **FishingData** - Dữ liệu câu cá
6. **FishingRod** - Cần câu
7. **FishingBait** - Mồi câu
8. **CaughtFish** - Cá đã bắt
9. **Tournament** - Giải đấu
10. **TournamentParticipant** - Người tham gia giải
11. **TournamentMessage** - Tin nhắn giải đấu
12. **Inventory** - Túi đồ
13. **InventoryItem** - Vật phẩm trong túi
14. **ItemTemplate** - Mẫu vật phẩm
15. **ModerationLog** - Log moderation
16. **SystemSettings** - Cài đặt hệ thống
17. **BanRecord** - Lịch sử ban
18. **FishPrice** - Giá cá

## ⚠️ Lưu ý quan trọng:

1. **Backup trước khi chỉnh sửa**: Luôn backup database trước khi thay đổi dữ liệu
2. **Chỉ admin sử dụng**: Chỉ admin mới nên truy cập Prisma Studio
3. **Cẩn thận khi xóa**: Xóa dữ liệu có thể ảnh hưởng đến bot
4. **Kiểm tra relationships**: Một số records có thể liên kết với nhau

## 🔧 Troubleshooting:

### Port 5555 đã được sử dụng:
```bash
# Kiểm tra port đang sử dụng
lsof -i :5555

# Kill process nếu cần
kill -9 <PID>

# Hoặc dùng port khác
npx prisma studio --port 5556
```

### Database không tìm thấy:
```bash
# Kiểm tra file database
ls -la data/database.db

# Kiểm tra DATABASE_URL
echo $DATABASE_URL
```

### Prisma client chưa generate:
```bash
# Generate Prisma client
npx prisma generate
```

## 📝 Ví dụ sử dụng:

```bash
# 1. Mở Prisma Studio
npm run db:studio:host

# 2. Mở browser: http://localhost:5555

# 3. Chọn table "User" để xem danh sách users

# 4. Chọn table "Transaction" để xem lịch sử giao dịch

# 5. Sử dụng filter để tìm kiếm dữ liệu cụ thể
``` 