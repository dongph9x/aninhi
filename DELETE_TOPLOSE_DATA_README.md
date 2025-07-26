# 🗑️ Delete TopLose Data Scripts

## 📋 Tổng Quan

Scripts để xóa toàn bộ data `n.toplose` (GameStats) từ database. Data này bao gồm thống kê thua lỗ của tất cả người chơi trong các game khác nhau.

## 🎯 Mục Đích

- **Xóa sạch data**: Xóa toàn bộ GameStats records
- **Reset hệ thống**: Đưa các lệnh `n.toplose` về trạng thái ban đầu
- **Dọn dẹp**: Loại bỏ data cũ không cần thiết

## 📁 Files

### **1. Script TypeScript (`scripts/delete-toplose-data.ts`)**
- **Môi trường**: Local development
- **Database**: Prisma client
- **Sử dụng**: `npx tsx scripts/delete-toplose-data.ts`

### **2. Script Bash (`scripts/delete-toplose-data-docker.sh`)**
- **Môi trường**: Docker environment
- **Database**: PostgreSQL container
- **Sử dụng**: `./scripts/delete-toplose-data-docker.sh`

## 🔧 Cách Sử Dụng

### **Local Environment:**
```bash
# Chạy script TypeScript
npx tsx scripts/delete-toplose-data.ts
```

### **Docker Environment:**
```bash
# Làm cho script có thể thực thi (chỉ cần làm 1 lần)
chmod +x scripts/delete-toplose-data-docker.sh

# Chạy script bash
./scripts/delete-toplose-data-docker.sh
```

## 📊 Data Bị Xóa

### **GameStats Table:**
- `id`: ID của record
- `userId`: ID của user
- `guildId`: ID của guild
- `gameType`: Loại game (blackjack, slots, roulette, coinflip)
- `totalLost`: Tổng số AniCoin thua
- `totalBet`: Tổng số AniCoin đã cược
- `gamesPlayed`: Số trận đã chơi
- `gamesWon`: Số trận thắng
- `biggestLoss`: Thua lớn nhất trong 1 trận
- `createdAt`: Thời gian tạo
- `updatedAt`: Thời gian cập nhật

## ⚠️ Ảnh Hưởng

### **Lệnh Bị Ảnh Hưởng:**
- ❌ `n.toplose` - Hiển thị "Chưa có dữ liệu thua lỗ nào!"
- ❌ `n.toplose all` - Hiển thị "Chưa có dữ liệu thua lỗ nào!"
- ❌ `n.toplose blackjack` - Hiển thị "Chưa có dữ liệu thua lỗ Blackjack nào!"
- ❌ `n.toplose slots` - Hiển thị "Chưa có dữ liệu thua lỗ Slots nào!"
- ❌ `n.toplose roulette` - Hiển thị "Chưa có dữ liệu thua lỗ Roulette nào!"
- ❌ `n.toplose coinflip` - Hiển thị "Chưa có dữ liệu thua lỗ Coin Flip nào!"
- ❌ `n.toplose stats` - Hiển thị "Chưa có dữ liệu thống kê nào!"

### **Tính Năng Bị Ảnh Hưởng:**
- ⚠️ `n.fishing` - Top Lose GIF sẽ không hiển thị cho bất kỳ ai
- ⚠️ Priority system trong fishing sẽ không có Top Lose

### **Data Không Bị Ảnh Hưởng:**
- ✅ Users (thông tin người dùng)
- ✅ Fish (cá)
- ✅ Breeding history (lịch sử lai tạo)
- ✅ Battle history (lịch sử đấu cá)
- ✅ Fish inventory (túi cá)
- ✅ Fish market (chợ cá)
- ✅ Fish food (thức ăn cá)
- ✅ Fishing rods và baits (cần câu và mồi)

## 🧪 Test Results

### **Trước Khi Xóa:**
```
📊 Tổng số GameStats records: 2

📈 Thống kê theo loại game:
🎮 coinflip:
   📊 Records: 2
   💸 Total Lost: 10,000,100 AniCoin
   💰 Total Bet: 10,000,100 AniCoin
   🎯 Games Played: 2
   🏆 Games Won: 0

Top 5 Records Có Total Lost Cao Nhất:
1. User 389957152153796608:
   💸 Lost: 10,000,000 AniCoin
   💰 Bet: 10,000,000 AniCoin
   📊 Games: 1 | 🏆 Won: 0 (0%)
   🎯 Biggest Loss: 10,000,000 AniCoin
2. User 1397381362763169853:
   💸 Lost: 100 AniCoin
   💰 Bet: 100 AniCoin
   📊 Games: 1 | 🏆 Won: 0 (0%)
   🎯 Biggest Loss: 100 AniCoin
```

### **Sau Khi Xóa:**
```
📊 GameStats records còn lại: 0
✅ Đã xóa sạch tất cả GameStats data!

👥 Users còn lại: 12
🐟 Fish còn lại: 34
🧬 Breeding history còn lại: 0
⚔️ Battle history còn lại: 8
```

## 🔄 Workflow

### **Script TypeScript:**
```
1. Kết nối database qua Prisma
2. Thống kê trước khi xóa
3. Hiển thị chi tiết data
4. Xác nhận xóa
5. Xóa từng record
6. Thống kê sau khi xóa
7. Kiểm tra ảnh hưởng
8. Thông báo kết quả
```

### **Script Bash:**
```
1. Kiểm tra Docker container
2. Thống kê trước khi xóa
3. Hiển thị chi tiết data
4. Xác nhận xóa (interactive)
5. Xóa tất cả records
6. Thống kê sau khi xóa
7. Kiểm tra ảnh hưởng
8. Thông báo kết quả
```

## 🛡️ Safety Features

### **Xác Nhận Xóa:**
- ⚠️ Cảnh báo rõ ràng về việc không thể hoàn tác
- ⚠️ Liệt kê tất cả lệnh bị ảnh hưởng
- ⚠️ Yêu cầu xác nhận trước khi xóa (Bash script)

### **Error Handling:**
- ✅ Try-catch blocks để xử lý lỗi
- ✅ Thống kê lỗi và thành công
- ✅ Disconnect database sau khi hoàn thành

### **Progress Tracking:**
- 📊 Hiển thị tiến độ xóa (mỗi 50 records)
- 📊 Thống kê chi tiết trước và sau
- 📊 Báo cáo kết quả cuối cùng

## 📝 Ghi Chú

### **Khi Nào Sử Dụng:**
- 🧹 Dọn dẹp data cũ không cần thiết
- 🔄 Reset hệ thống về trạng thái ban đầu
- 🧪 Testing và development
- 🚀 Production deployment mới

### **Lưu Ý Quan Trọng:**
- ⚠️ **KHÔNG THỂ HOÀN TÁC** - Data bị xóa vĩnh viễn
- ⚠️ Backup database trước khi chạy (nếu cần)
- ⚠️ Kiểm tra môi trường trước khi chạy
- ⚠️ Đảm bảo không có user đang sử dụng hệ thống

### **Recovery:**
- 🔄 Data sẽ được tạo lại khi user chơi game
- 🔄 Các lệnh `n.toplose` sẽ hoạt động bình thường
- 🔄 Top Lose GIF sẽ hiển thị khi có data mới

## 🎯 So Sánh Với Script Xóa Cá GEN 2

### **Tương Tự:**
- ✅ Cấu trúc script giống nhau
- ✅ Thống kê trước và sau khi xóa
- ✅ Error handling và progress tracking
- ✅ Documentation chi tiết

### **Khác Biệt:**
- 🎮 Xóa GameStats thay vì Fish
- 🎮 Ảnh hưởng đến lệnh `n.toplose` thay vì `n.fishbarn`
- 🎮 Không có breeding history để kiểm tra
- 🎮 Có script Docker tương ứng

## 📋 Commands Summary

```bash
# Local environment
npx tsx scripts/delete-toplose-data.ts

# Docker environment
chmod +x scripts/delete-toplose-data-docker.sh
./scripts/delete-toplose-data-docker.sh

# Kiểm tra sau khi xóa
n.toplose
n.toplose all
n.toplose stats
``` 