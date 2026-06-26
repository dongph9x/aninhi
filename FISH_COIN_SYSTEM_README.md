# 🐟 Hệ Thống FishCoin

## 📋 Tổng Quan

Hệ thống FishCoin là một đồng tiền riêng biệt dành cho các chức năng liên quan đến cá, tách biệt hoàn toàn với AniCoin thông thường.

## 🎯 Mục Đích

- **Tách biệt kinh tế**: FishCoin chỉ dùng cho hệ thống cá, AniCoin cho các game khác
- **Cân bằng game**: Tránh ảnh hưởng lẫn nhau giữa các hệ thống
- **Quản lý dễ dàng**: Theo dõi riêng biệt giao dịch cá

## 🗄️ Database Schema

### User Model (Cập nhật)
```sql
model User {
  id          String   @id @default(cuid())
  userId      String
  guildId     String
  balance     BigInt   @default(0)  // AniCoin
  fishBalance BigInt   @default(0)  // FishCoin - MỚI
  dailyStreak Int      @default(0)
  // ... other fields
}
```

### FishTransaction Model (Mới)
```sql
model FishTransaction {
  id          String   @id @default(cuid())
  userId      String
  guildId     String
  amount      BigInt
  type        String   // "add", "subtract", "transfer"
  description String?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId, guildId], references: [userId, guildId])
}
```

## 🛠️ Services

### FishCoinService (`src/utils/fish-coin.ts`)

#### Các phương thức chính:
- `getUser(userId, guildId)` - Lấy hoặc tạo user
- `getFishBalance(userId, guildId)` - Lấy số dư FishCoin
- `addFishCoin(userId, guildId, amount, description)` - Thêm FishCoin
- `subtractFishCoin(userId, guildId, amount, description)` - Trừ FishCoin
- `transferFishCoin(fromUserId, toUserId, guildId, amount, description)` - Chuyển FishCoin
- `getFishTransactions(userId, guildId, limit)` - Lịch sử giao dịch
- `hasEnoughFishCoin(userId, guildId, amount)` - Kiểm tra đủ FishCoin
- `getTopFishCoinUsers(guildId, limit)` - Top người chơi

## 🎮 Commands

### User Commands

#### `!fishbalance` (aliases: `!fishbal`, `!fishcoin`, `!fishcoins`, `!fc`)
```bash
!fishbalance
```
**Chức năng:**
- Hiển thị số dư FishCoin và AniCoin
- Lịch sử giao dịch FishCoin gần đây
- Thông tin về hệ thống FishCoin

#### `!fishtransfer` (aliases: `!fishgive`, `!fishsend`, `!ft`)
```bash
!fishtransfer @user <số lượng>
```
**Chức năng:**
- Chuyển FishCoin cho người khác
- Kiểm tra đủ FishCoin trước khi chuyển
- Không thể chuyển cho chính mình

### Admin Commands

#### `!fishgive` (aliases: `!fishadd`)
```bash
!fishgive @user <số lượng>
!fishadd @user <số lượng>    # Thêm FishCoin
```
**Chức năng:**
- Chỉ admin mới có quyền sử dụng
- Thêm FishCoin cho người dùng
- Ghi lại lịch sử admin operation

#### `!fishremove` (aliases: `!fishsubtract`, `!fishminus`)
```bash
!fishremove @user <số lượng>
!fishsubtract @user <số lượng> # Bớt FishCoin
!fishminus @user <số lượng>    # Bớt FishCoin
```
**Chức năng:**
- Chỉ admin mới có quyền sử dụng
- Bớt FishCoin từ tài khoản người dùng
- Kiểm tra đủ FishCoin trước khi bớt
- Ghi lại lịch sử admin operation

### User Commands

#### `!fishtop` (aliases: `!fishleaderboard`, `!fishlb`, `!ftop`)
```bash
!fishtop
```
**Chức năng:**
- Hiển thị top 10 người chơi có nhiều FishCoin nhất
- Hiển thị vị trí của người dùng hiện tại
- Thống kê tổng quan về FishCoin trong server
- Hướng dẫn cách kiếm FishCoin

## 🔄 Cách Hoạt Động

### 1. Tạo User
```typescript
const user = await fishCoinDB.getUser(userId, guildId);
// Tự động tạo với fishBalance = 0 nếu chưa có
```

### 2. Thêm FishCoin
```typescript
await fishCoinDB.addFishCoin(userId, guildId, 1000, 'Daily reward');
// Tự động tạo FishTransaction record
```

### 3. Trừ FishCoin
```typescript
await fishCoinDB.subtractFishCoin(userId, guildId, 500, 'Buy fish food');
// Kiểm tra đủ FishCoin trước khi trừ
```

### 4. Chuyển FishCoin
```typescript
const result = await fishCoinDB.transferFishCoin(
  senderId, receiverId, guildId, 300, 'Gift'
);
// Sử dụng database transaction để đảm bảo an toàn
```

## 📊 Ví Dụ Sử Dụng

### Kiểm tra balance
```
User: !fishbalance

🐟 Thông Tin FishCoin
Username

🐟 FishCoin hiện tại: 1,500 FishCoin
💎 AniCoin hiện tại: 50,000 AniCoin
🔥 Chuỗi hàng ngày: 7 ngày

📋 Lịch Sử Giao Dịch FishCoin Gần Đây
🐟 1,000 FishCoin - Daily reward (20/01/2024)
💸 500 FishCoin - Buy fish food (19/01/2024)
🐟 2,000 FishCoin - Sell fish (18/01/2024)
```

### Chuyển FishCoin
```
User: !fishtransfer @friend 500

✅ Chuyển FishCoin Thành Công
Username đã chuyển 500 FishCoin cho friend

Số dư sau chuyển:
🐟 Username: 1,000 FishCoin
🐟 friend: 500 FishCoin
```

### Admin thêm FishCoin
```
Admin: !fishgive @user 1000

✅ Admin FishCoin Operation
Admin: AdminName
Người dùng: Username
Thao tác: Thêm 1,000 FishCoin

Số dư thay đổi:
🐟 Trước: 500 FishCoin
🐟 Sau: 1,500 FishCoin
📊 Thay đổi: +1,000 FishCoin
```

### Admin bớt FishCoin
```
Admin: !fishremove @user 500

✅ Admin Removed FishCoin
Admin: AdminName
Người dùng: Username
Thao tác: Bớt 500 FishCoin

Số dư thay đổi:
🐟 Trước: 1,500 FishCoin
🐟 Sau: 1,000 FishCoin
📊 Thay đổi: -500 FishCoin
```

### Xem Top FishCoin
```
User: !fishtop

🏆 FishCoin Leaderboard
Top 10 người chơi có nhiều FishCoin nhất

🏆 Top FishCoin Players
🥇 Username1 - 5,000 🐟
🥈 Username2 - 3,500 🐟
🥉 Username3 - 3,000 🐟
4. Username4 - 2,500 🐟
5. Username5 - 2,000 🐟

📊 Thống Kê
🐟 Tổng FishCoin: 16,000
📈 Trung bình: 3,200 FishCoin
👥 Người chơi: 5 người

🎯 Vị Trí Của Bạn
🏆 Rank: #2
🐟 FishCoin: 3,500
```

## 🧪 Testing

### Test Script
```bash
npx tsx scripts/test-fish-coin-system.ts
```

### Test Results
```
🧪 Testing FishCoin System...

✅ User created: test_user_fishcoin
   AniCoin balance: 10000
   FishCoin balance: 0

✅ Added 1000 FishCoin
   New balance: 1000

✅ Subtracted 200 FishCoin
   New balance: 800

✅ Transferred 300 FishCoin
   Sender balance: 500
   Receiver balance: 300

✅ Found 3 transactions
   1. transfer: -300 FishCoin - Test transfer FishCoin
   2. subtract: -200 FishCoin - Test subtract FishCoin
   3. add: 1000 FishCoin - Test add FishCoin

✅ All FishCoin system tests completed successfully!
```

## 🔧 Tích Hợp Với Hệ Thống Cá

### Các chức năng sẽ sử dụng FishCoin:
1. **Mua thức ăn cá** - Thay vì AniCoin
2. **Mua bán cá** - Giá cá tính bằng FishCoin
3. **Phần thưởng đấu cá** - Nhận FishCoin thay vì AniCoin
4. **Tournament entry fee** - Đăng ký giải đấu bằng FishCoin
5. **Fish market** - Giao dịch cá bằng FishCoin

### Migration Plan:
1. ✅ Tạo FishCoin system
2. 🔄 Cập nhật fish food system
3. 🔄 Cập nhật fish market system
4. 🔄 Cập nhật fish battle rewards
5. 🔄 Cập nhật tournament system

## ⚠️ Lưu Ý Quan Trọng

1. **Tách biệt hoàn toàn**: FishCoin và AniCoin không thể chuyển đổi lẫn nhau
2. **Lịch sử riêng**: Mỗi loại coin có lịch sử giao dịch riêng
3. **Admin control**: Chỉ admin mới có thể thêm/bớt FishCoin
4. **Backup**: Hệ thống tự động backup giao dịch FishCoin
5. **Performance**: Sử dụng BigInt để hỗ trợ số lượng lớn

## 🚀 Tính Năng Tương Lai

1. **FishCoin Daily**: Nhận FishCoin hàng ngày
2. **FishCoin Shop**: Cửa hàng riêng cho FishCoin
3. **FishCoin Leaderboard**: Bảng xếp hạng FishCoin
4. **FishCoin Exchange**: Chuyển đổi giữa AniCoin và FishCoin (có thể)
5. **FishCoin Events**: Sự kiện đặc biệt cho FishCoin

---

**Hệ thống FishCoin đã sẵn sàng để tích hợp với các chức năng cá!** 🐟✨ 