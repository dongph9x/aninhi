# 🐟 Hệ Thống Túi Đấu Cá (Battle Fish Inventory)

## 📋 Tổng Quan

Hệ thống túi đấu cá là một tính năng mới cho phép người chơi quản lý cá đấu riêng biệt khỏi túi nuôi cá thông thường. Chỉ những cá đáp ứng điều kiện đặc biệt mới có thể được thêm vào túi đấu.

## ⚔️ Điều Kiện Cá Đấu

### Yêu Cầu Bắt Buộc:
- **Thế hệ 2 trở lên**: Chỉ cá được lai tạo (thế hệ 2+) mới có thể đấu
- **Trưởng thành**: Cá phải đạt level 10 và có status "adult"
- **Thuộc tính di truyền**: Cá phải có stats (strength, agility, intelligence, defense, luck)

### Giới Hạn:
- **Túi đấu tối đa 5 cá**: Mỗi người chơi chỉ có thể có tối đa 5 cá trong túi đấu
- **Cá không thể trùng lặp**: Một cá chỉ có thể ở trong một túi (nuôi hoặc đấu)

## 🎮 Cách Sử Dụng

### Lệnh Cơ Bản:
```bash
n.fishbattle                    # Tìm đối thủ ngẫu nhiên
n.fishbattle help              # Xem hướng dẫn
n.fishbattle list              # Xem túi đấu cá
n.fishbattle add <fish_id>     # Thêm cá vào túi đấu
n.fishbattle remove <fish_id>  # Xóa cá khỏi túi đấu
n.fishbattle stats             # Xem thống kê đấu cá
n.fishbattle history           # Xem lịch sử đấu
n.fishbattle leaderboard       # Bảng xếp hạng đấu cá
```

### Quy Trình Đấu Cá:
1. **Tạo cá thế hệ 2+**: Sử dụng hệ thống lai tạo để tạo cá con
2. **Nuôi cá lên level 10**: Cho cá ăn để đạt trạng thái trưởng thành
3. **Thêm vào túi đấu**: Sử dụng `n.fishbattle add <fish_id>`
4. **Tìm đối thủ**: Sử dụng `n.fishbattle` để tìm đối thủ ngẫu nhiên
5. **Đấu**: React với ⚔️ để bắt đầu trận đấu

## 🏗️ Kiến Trúc Hệ Thống

### Database Schema:
```sql
-- Túi đấu cá
BattleFishInventory {
  id: String
  userId: String
  guildId: String
  capacity: Int (5)
  items: BattleFishInventoryItem[]
}

-- Item trong túi đấu
BattleFishInventoryItem {
  id: String
  battleFishInventoryId: String
  fishId: String (unique)
  fish: Fish
}

-- Lịch sử đấu
BattleHistory {
  id: String
  userId: String
  guildId: String
  fishId: String
  opponentId: String
  opponentUserId: String
  userPower: Int
  opponentPower: Int
  userWon: Boolean
  reward: Int
  battleLog: String (JSON)
  battledAt: DateTime
}
```

### Services:
- **BattleFishInventoryService**: Quản lý túi đấu cá
- **FishBattleService**: Xử lý logic đấu cá
- **FishBreedingService**: Tạo cá thế hệ mới

## 🎯 Tính Năng Chính

### 1. Quản Lý Túi Đấu
- **Thêm cá**: Chỉ cá thế hệ 2+ và trưởng thành
- **Xóa cá**: Loại bỏ cá khỏi túi đấu
- **Xem danh sách**: Hiển thị cá trong túi và cá có thể thêm

### 2. Tìm Đối Thủ
- **Ngẫu nhiên**: Tìm đối thủ ngẫu nhiên trong server
- **Cân bằng**: Chỉ đấu với cá cùng điều kiện (thế hệ 2+, trưởng thành)
- **Đa dạng**: Có thể đấu với cá của người chơi khác

### 3. Hệ Thống Đấu
- **Tính toán sức mạnh**: Dựa trên stats và level
- **Yếu tố may mắn**: Luck stat ảnh hưởng đến kết quả
- **Battle log**: Ghi lại chi tiết trận đấu
- **Phần thưởng**: Người thắng 150%, người thua 30% sức mạnh tổng

### 4. Thống Kê & Lịch Sử
- **Thống kê cá nhân**: Tổng trận, thắng/thua, tỷ lệ thắng
- **Lịch sử đấu**: 5 trận gần nhất với chi tiết
- **Bảng xếp hạng**: Top 10 người chơi đấu cá

## 🔧 Cài Đặt & Migration

### 1. Tạo Migration:
```bash
npx prisma migrate dev --name add_battle_fish_inventory
```

### 2. Generate Prisma Client:
```bash
npx prisma generate
```

### 3. Test System:
```bash
yarn tsx scripts/test-battle-fish-inventory.ts
```

## 📊 Ví Dụ Sử Dụng

### Tạo Cá Đấu:
```bash
# 1. Tạo cá thế hệ 1
n.fishbarn  # Mở rương nuôi cá

# 2. Lai tạo để tạo cá thế hệ 2
# (Sử dụng hệ thống breeding)

# 3. Nuôi cá lên level 10
# (Cho cá ăn)

# 4. Thêm vào túi đấu
n.fishbattle add <fish_id>

# 5. Xem túi đấu
n.fishbattle list

# 6. Tìm đối thủ
n.fishbattle
```

### Kết Quả Đấu:
```
⚔️ Tìm Thấy Đối Thủ!
🐟 Cá của bạn: Gen 2 Battle Fish (Lv.10)
🐟 Đối thủ: Gen 3 Elite Fish (Lv.10)
💪 Sức mạnh: 350 vs 380

📊 Stats của bạn:
💪70 🏃60 🧠65 🛡️55 🍀60

📊 Stats đối thủ:
💪80 🏃75 🧠70 🛡️65 🍀70

React với ⚔️ để bắt đầu đấu!
```

## 🎨 UI/UX Features

### Embed Messages:
- **Màu sắc phân biệt**: Xanh cho thành công, đỏ cho lỗi, vàng cho thông báo
- **Thông tin chi tiết**: Hiển thị đầy đủ stats và thông tin cá
- **Hướng dẫn rõ ràng**: Mỗi lệnh có hướng dẫn cụ thể

### Interactive Elements:
- **Reaction buttons**: ⚔️ để xác nhận đấu
- **Timeout handling**: Tự động hủy nếu không phản hồi
- **Error handling**: Thông báo lỗi chi tiết và hướng dẫn khắc phục

## 🔮 Tính Năng Tương Lai

### Có Thể Phát Triển:
- **Tournament system**: Giải đấu định kỳ
- **Team battles**: Đấu theo đội
- **Special abilities**: Kỹ năng đặc biệt cho cá
- **Equipment system**: Trang bị cho cá đấu
- **Ranking tiers**: Hệ thống xếp hạng theo cấp độ

### Cải Tiến:
- **AI opponents**: Đối thủ AI thông minh hơn
- **Battle animations**: Hiệu ứng đấu đẹp mắt
- **Spectator mode**: Chế độ xem đấu
- **Betting system**: Đặt cược cho trận đấu

## 🐛 Troubleshooting

### Lỗi Thường Gặp:
1. **"Chỉ cá thế hệ 2 trở lên mới có thể đấu!"**
   - Giải pháp: Sử dụng hệ thống breeding để tạo cá thế hệ 2+

2. **"Chỉ cá trưởng thành mới có thể đấu!"**
   - Giải pháp: Nuôi cá lên level 10

3. **"Túi đấu cá đã đầy!"**
   - Giải pháp: Xóa bớt cá khỏi túi đấu hoặc nâng cấp capacity

4. **"Không có đối thủ nào trong server!"**
   - Giải pháp: Chờ người chơi khác thêm cá vào túi đấu

### Debug Commands:
```bash
# Test battle inventory system
yarn tsx scripts/test-battle-fish-inventory.ts

# Test complete battle system
yarn tsx scripts/test-fish-breeding-and-battle.ts
```

## 📈 Performance & Optimization

### Database Indexes:
- `userId_guildId` trên BattleFishInventory
- `battleFishInventoryId` trên BattleFishInventoryItem
- `userId_guildId` và `battledAt` trên BattleHistory

### Caching Strategy:
- Cache battle inventory trong memory
- Lazy loading cho battle history
- Optimized queries với Prisma

### Scalability:
- Support multiple guilds
- Efficient battle matching
- Minimal database queries per battle

---

**🎉 Hệ thống túi đấu cá đã sẵn sàng! Chỉ những cá thế hệ 2+ mới có thể tham gia đấu, tạo ra một hệ thống cạnh tranh công bằng và thú vị!** 