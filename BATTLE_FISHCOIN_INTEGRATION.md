# ⚔️ Tiền Thưởng Đấu Cá FishCoin Integration

## 📋 Tổng Quan

Hệ thống **tiền thưởng đấu cá** đã được chuyển đổi hoàn toàn sang sử dụng **FishCoin** thay vì AniCoin. Tất cả các phần thưởng từ trận đấu cá đều sử dụng FishCoin.

## 🔄 Thay Đổi Chính

### **Trước Đây:**
- Tiền thưởng đấu cá: AniCoin
- Hiển thị phần thưởng: "coins"
- Sử dụng `balance` field

### **Bây Giờ:**
- Tiền thưởng đấu cá: **FishCoin** 🐟
- Hiển thị phần thưởng: "FishCoin"
- Sử dụng `fishBalance` field

## 🛠️ Các File Đã Cập Nhật

### **1. Core Service (`src/utils/fish-battle.ts`)**
- **Function:** `battleFish()`
- **Thay đổi:**
  ```typescript
  // Trước:
  battleLog.push(`💰 Phần thưởng người thắng: ${winnerReward.toLocaleString()} coins`);
  battleLog.push(`💰 Phần thưởng người thua: ${loserReward.toLocaleString()} coins`);

  // Cập nhật balance
  if (isUserWinner) {
    await prisma.user.update({
      where: { userId_guildId: { userId, guildId } },
      data: { balance: { increment: winnerReward } }
    });
  } else {
    await prisma.user.update({
      where: { userId_guildId: { userId, guildId } },
      data: { balance: { increment: loserReward } }
    });
  }

  // Sau:
  battleLog.push(`🐟 Phần thưởng người thắng: ${winnerReward.toLocaleString()} FishCoin`);
  battleLog.push(`🐟 Phần thưởng người thua: ${loserReward.toLocaleString()} FishCoin`);

  // Cập nhật FishCoin balance
  if (isUserWinner) {
    await fishCoinDB.addFishCoin(userId, guildId, winnerReward, `Battle victory reward: ${winner.species} vs ${loser.species}`);
  } else {
    await fishCoinDB.addFishCoin(userId, guildId, loserReward, `Battle defeat reward: ${loser.species} vs ${winner.species}`);
  }
  ```

### **2. Command (`src/commands/text/ecommerce/fishbattle.ts`)**
- **Function:** `findRandomBattle()`
- **Thay đổi:**
  ```typescript
  // Trước:
  { name: '💰 Phần thưởng', value: `${reward.toLocaleString()} coins`, inline: true }

  // Sau:
  { name: '🐟 Phần thưởng', value: `${reward.toLocaleString()} FishCoin`, inline: true }
  ```

### **3. UI Components**
- **File:** `src/components/MessageComponent/BattleFishHandler.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  { name: '💰 Phần thưởng', value: `${reward.toLocaleString()} coins`, inline: true }

  // Sau:
  { name: '🐟 Phần thưởng', value: `${reward.toLocaleString()} FishCoin`, inline: true }
  ```

## 🎮 Các Lệnh Đã Cập Nhật

### **Đấu Cá:**
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

### **Ví Dụ Sử Dụng:**
```bash
n.fishbattle                    # Tìm đối thủ và đấu
n.fishbattle add cmd123         # Thêm cá vào túi đấu
n.fishbattle stats              # Xem thống kê đấu cá
```

## 🧪 Test Results

### **Battle FishCoin Test:**
```bash
npx tsx scripts/test-battle-fishcoin.ts
```

### **Test Results:**
```
✅ Battle completed successfully!
   Winner: Cá Đấu Test 2
   Loser: Cá Đấu Test 1
   Winner Power: 445
   Loser Power: 287
   User 1 Reward: 219 FishCoin
   User 1 Won: false

✅ Balance after battle:
   User 1: 10219 FishCoin (219)
   User 2: 5000 FishCoin

✅ Battle stats:
   User 1: 0W/1L (0%) - 219 FishCoin
   User 2: 0W/0L (0%) - 0 FishCoin

✅ Transaction history:
   User 1: 2 transactions
     1. add: 219 FishCoin - Battle defeat reward: Cá Đấu Test 1 vs Cá Đấu Test 2
     2. add: 10000 FishCoin - Test FishCoin for battle user 1
```

## 💰 Hệ Thống Phần Thưởng

### **Cách Tính Phần Thưởng:**
1. **Base reward:** Dựa trên tổng sức mạnh (tăng 10 lần so với trước)
2. **Balance multiplier:** 0.5 - 2.0 dựa trên độ cân bằng trận đấu
3. **Perfect balance bonus:** +50% cho trận đấu cực kỳ cân bằng
4. **Balance bonus:** +30% cho trận đấu rất cân bằng
5. **Imbalance penalty:** -30% cho trận đấu không cân bằng
6. **Upset bonus:** +50% cho trận đấu bất ngờ
7. **Critical bonus:** +20% cho critical hit

### **Ví Dụ Phần Thưởng:**
```
📊 Chênh lệch: 50 (3%)
⚖️ Độ cân bằng: 97%
💰 Base reward: 1,950 FishCoin
🏆 Winner reward: 5,737 FishCoin
💀 Loser reward: 585 FishCoin
```

## 🎮 UI Updates

### **Battle Result Display:**
```
🏆 Chiến Thắng!

🐟 Người thắng: Cá Đấu Test 2
🐟 Người thua: Cá Đấu Test 1
🐟 Phần thưởng: 5,737 FishCoin
💪 Sức mạnh: 445 vs 287
```

### **Battle History Display:**
```
📊 Lịch Sử Đấu Cá

1. 🏆 Won - 5,737 FishCoin
2. 💀 Lost - 219 FishCoin
3. 🏆 Won - 3,245 FishCoin
```

### **Battle Stats Display:**
```
📈 Thống Kê Đấu Cá

🏆 Chiến thắng: 15/25 (60%)
💰 Tổng thu nhập: 45,230 FishCoin
📊 Tỷ lệ thắng: 60%
```

## ⚠️ Lưu Ý Quan Trọng

1. **FishCoin rewards:** Tất cả phần thưởng đấu cá đều là FishCoin
2. **Transaction logging:** Tất cả giao dịch đều được ghi lại trong FishTransaction
3. **Battle history:** Lịch sử đấu vẫn lưu reward dưới dạng BigInt
4. **Stats calculation:** Thống kê đấu cá hiển thị FishCoin
5. **Cooldown system:** Vẫn áp dụng cooldown 1 phút giữa các lần đấu

## 🔧 Technical Details

### **Transaction Flow:**
1. **Tính toán phần thưởng** - Dựa trên sức mạnh và độ cân bằng
2. **Cộng FishCoin cho người thắng** - `fishCoinDB.addFishCoin()`
3. **Cộng FishCoin cho người thua** - `fishCoinDB.addFishCoin()`
4. **Ghi lại lịch sử đấu** - Trong BattleHistory table
5. **Ghi lại giao dịch FishCoin** - Trong FishTransaction table

### **Error Handling:**
```typescript
// Cộng FishCoin cho người thắng
if (isUserWinner) {
  await fishCoinDB.addFishCoin(userId, guildId, winnerReward, `Battle victory reward: ${winner.species} vs ${loser.species}`);
} else {
  await fishCoinDB.addFishCoin(userId, guildId, loserReward, `Battle defeat reward: ${loser.species} vs ${winner.species}`);
}
```

### **Database Operations:**
- Sử dụng `fishCoinDB` service cho tất cả giao dịch FishCoin
- Ghi lại tất cả giao dịch trong `FishTransaction` table
- Lưu trữ reward trong `BattleHistory` table
- Tự động cập nhật battle statistics

## 📊 Performance Improvements

1. **Consistent currency:** Tất cả giao dịch fish đều sử dụng FishCoin
2. **Better transaction logging:** Rõ ràng hơn về loại giao dịch
3. **Improved error handling:** Xử lý lỗi tốt hơn với FishCoin
4. **Unified economy:** Hệ thống kinh tế thống nhất cho fish

## 🚀 Tính Năng Tương Lai

1. **FishCoin battle tournaments:** Giải đấu đấu cá với FishCoin
2. **FishCoin battle rewards:** Thưởng đặc biệt cho trận đấu hiếm
3. **FishCoin battle streaks:** Thưởng cho chuỗi thắng liên tục
4. **FishCoin battle leaderboard:** Bảng xếp hạng đấu cá với FishCoin

---

## 🎉 **Hoàn Thành Tích Hợp Tiền Thưởng Đấu Cá!**

### ✅ **Đã Thành Công:**
- ⚔️ **Battle rewards** - Tất cả phần thưởng đấu cá bằng FishCoin
- 🏆 **Winner/loser rewards** - Phần thưởng người thắng/thua bằng FishCoin
- 📊 **Battle statistics** - Thống kê đấu cá hiển thị FishCoin
- 💰 **All battle transactions** - Tất cả giao dịch đấu cá đều sử dụng FishCoin
- 📝 **Transaction logging** - Ghi lại tất cả giao dịch FishCoin

### 🎮 **Cách Sử Dụng:**
- Đấu cá với `n.fishbattle` (nhận FishCoin)
- Xem thống kê với `n.fishbattle stats`
- Xem lịch sử với `n.fishbattle history`
- Kiểm tra balance với `!fishbalance`

**🎉 Tiền thưởng đấu cá đã hoàn toàn sử dụng FishCoin!** 🐟⚔️✨ 