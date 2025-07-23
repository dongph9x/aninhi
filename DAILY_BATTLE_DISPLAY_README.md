# ⏰ Hiển Thị Giới Hạn Đấu Cá Hàng Ngày

## 📋 Tổng Quan

Tính năng hiển thị giới hạn đấu cá hàng ngày đã được thêm vào lệnh `n.fishbattle` để người dùng có thể theo dõi số lần đấu cá còn lại trong ngày. Hệ thống giới hạn 20 lần đấu cá mỗi ngày và tự động reset vào 00:00 ngày mai.

## 🎯 Tính Năng Chính

### 1. **Hiển Thị Số Lần Đấu Còn Lại**
- Hiển thị trong embed khi tìm đối thủ: `✅ Còn **X/20** lần đấu cá`
- Cập nhật real-time sau mỗi lần đấu
- Hiển thị rõ ràng và dễ hiểu

### 2. **Thông Báo Khi Đạt Giới Hạn**
- Hiển thị thông báo lỗi khi đạt 20 lần đấu
- Thông tin về thời gian reset
- Hướng dẫn thử lại vào ngày mai

### 3. **Tích Hợp Với UI Đấu Cá**
- Hiển thị trong giao diện đấu cá (`n.fishbattle ui`)
- Thông tin daily limit trong BattleFishUI
- Cập nhật tự động khi tương tác

## 🎮 Cách Sử Dụng

### Lệnh Cơ Bản
```bash
n.fishbattle                    # Tìm đối thủ và hiển thị daily limit
n.fishbattle ui                 # Giao diện đấu cá với daily limit
n.fishbattle help               # Xem hướng dẫn với thông tin giới hạn
```

### Ví Dụ Hiển Thị
```
⚔️ Tìm Thấy Đối Thủ!
🐟 Cá của bạn: Gen 2 Battle Fish (Lv.10)
🐟 Đối thủ: Gen 3 Elite Fish (Lv.10)
💪 Sức mạnh: 350 vs 380
📊 Stats của bạn: 💪70 🏃60 🧠65 🛡️55 🍀60
📊 Stats đối thủ: 💪80 🏃75 🧠70 🛡️65 🍀70
⏰ Giới Hạn Đấu Cá Hôm Nay: ✅ Còn 15/20 lần đấu cá
```

## 🔧 Cách Hoạt Động

### 1. Kiểm Tra Daily Limit
```typescript
const dailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
if (!dailyLimitCheck.canBattle) {
    // Hiển thị thông báo đạt giới hạn
    return message.reply({ embeds: [limitEmbed] });
}
```

### 2. Hiển Thị Trong Embed
```typescript
.addFields({
    name: '⏰ Giới Hạn Đấu Cá Hôm Nay', 
    value: `✅ Còn **${dailyLimitCheck.remainingBattles}/20** lần đấu cá`, 
    inline: true 
})
```

### 3. Tăng Count Sau Khi Đấu
```typescript
// Sau khi đấu thành công
await FishBattleService.incrementDailyBattleCount(userId, guildId);
```

## 📊 Các Trạng Thái Hiển Thị

### ✅ Còn Lần Đấu
```
⏰ Giới Hạn Đấu Cá Hôm Nay: ✅ Còn 15/20 lần đấu cá
```

### ❌ Đạt Giới Hạn
```
❌ Đã Đạt Giới Hạn Đấu Cá!
Bạn đã đạt giới hạn 20 lần đấu cá trong ngày!

📊 Giới Hạn: 20 lần đấu cá mỗi ngày
🕐 Reset: Vào 00:00 ngày mai
```

### 👑 Admin User
- Admin không bị giới hạn daily battle limit
- Vẫn hiển thị thông tin daily limit (nếu có)
- Có thể đấu không giới hạn

## 🧪 Testing

### Test Script
```bash
npx tsx scripts/test-daily-battle-display.ts
```

### Test Results
```
🧪 Testing Daily Battle Limit Display...

2️⃣ Testing initial daily battle limit display...
Initial daily battle info:
   Can battle: true
   Remaining battles: 20/20
   Error: None

3️⃣ Testing display after 5 battles...
After 5 battles:
   Can battle: true
   Remaining battles: 15/20
   Error: None

4️⃣ Testing display at maximum limit...
At maximum limit:
   Can battle: false
   Remaining battles: 0/20
   Error: Bạn đã đạt giới hạn 20 lần đấu cá trong ngày!

5️⃣ Testing display after new day reset...
After reset for new day:
   Can battle: true
   Remaining battles: 20/20
   Error: None
```

## 🎨 Giao Diện UI

### BattleFishUI Component
```typescript
// Trong src/components/MessageComponent/BattleFishUI.ts
if (this.dailyBattleInfo) {
    if (this.dailyBattleInfo.canBattle) {
        embed.addFields({
            name: '⏰ Giới Hạn Đấu Cá Hôm Nay',
            value: `✅ Còn **${this.dailyBattleInfo.remainingBattles}/20** lần đấu cá`,
            inline: true
        });
    } else {
        embed.addFields({
            name: '⏰ Giới Hạn Đấu Cá Hôm Nay',
            value: `❌ **Đã đạt giới hạn!** (0/20)\n${this.dailyBattleInfo.error || 'Vui lòng thử lại vào ngày mai'}`,
            inline: true
        });
    }
}
```

## 📱 Các Lệnh Đã Cập Nhật

### 1. `n.fishbattle`
- Hiển thị daily limit khi tìm đối thủ
- Thông báo khi đạt giới hạn
- Cập nhật count sau khi đấu

### 2. `n.fishbattle ui`
- Hiển thị daily limit trong giao diện
- Cập nhật real-time khi tương tác
- Thông tin chi tiết về giới hạn

### 3. `n.fishbattle help`
- Thông tin về daily limit trong help
- Hướng dẫn sử dụng
- Giải thích giới hạn

## 🔄 Tích Hợp Với Hệ Thống

### Database Schema
```prisma
model User {
  dailyBattleCount      Int     @default(0)  // Số lần đấu cá trong ngày
  lastBattleReset       DateTime @default(now()) // Thời gian reset battle count
}
```

### Service Functions
```typescript
// Kiểm tra và reset daily battle count
FishBattleService.checkAndResetDailyBattleCount(userId, guildId)

// Tăng daily battle count
FishBattleService.incrementDailyBattleCount(userId, guildId)
```

## 🎯 Lợi Ích

### Cho Người Chơi
- **Theo dõi dễ dàng**: Biết chính xác số lần đấu còn lại
- **Lập kế hoạch**: Sắp xếp thời gian đấu hợp lý
- **Tránh spam**: Hiểu rõ giới hạn để không lãng phí

### Cho Hệ Thống
- **Cân bằng gameplay**: Tránh spam đấu cá
- **Giảm tải server**: Hạn chế số lượng request
- **Công bằng**: Tất cả user đều có cùng giới hạn

## 🚀 Tương Lai

- **VIP system**: Giới hạn cao hơn cho VIP
- **Weekly/Monthly limits**: Giới hạn theo tuần/tháng
- **Battle pass**: Hệ thống battle pass với giới hạn đặc biệt
- **Events**: Sự kiện với giới hạn khác nhau

## 🎉 Kết Luận

Tính năng hiển thị daily battle limit đã được tích hợp hoàn chỉnh vào hệ thống đấu cá:

✅ **Hiển thị rõ ràng** - Người dùng biết chính xác số lần đấu còn lại  
✅ **Cập nhật real-time** - Thông tin luôn chính xác  
✅ **Tích hợp UI** - Hiển thị trong cả lệnh và giao diện  
✅ **Thông báo thông minh** - Hướng dẫn khi đạt giới hạn  
✅ **Testing đầy đủ** - Đảm bảo hoạt động ổn định  

**Bây giờ người dùng có thể theo dõi số lần đấu cá một cách dễ dàng và trực quan!** 🎮⚔️ 