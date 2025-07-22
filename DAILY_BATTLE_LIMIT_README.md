# Daily Battle Limit System

## Tổng quan

Hệ thống giới hạn số lần đấu cá hàng ngày được thêm vào để cân bằng gameplay và tránh spam đấu cá. Mỗi user chỉ được đấu tối đa **20 lần mỗi ngày**.

## Tính năng chính

### 1. Giới hạn hàng ngày
- **Giới hạn**: 20 lần đấu cá mỗi ngày
- **Reset**: Tự động reset vào 00:00 ngày mai
- **Cooldown**: 1 phút giữa các lần đấu (giữ nguyên)

### 2. Kiểm tra thông minh
- Tự động kiểm tra và reset daily battle count khi sang ngày mới
- Hiển thị số lần đấu còn lại
- Thông báo rõ ràng khi đạt giới hạn

### 3. Ngoại lệ cho Admin
- Administrator không bị giới hạn daily battle limit
- Vẫn áp dụng cooldown 1 phút (có thể thay đổi)

## Thay đổi Database

### Schema Updates
```prisma
model User {
  // ... existing fields ...
  dailyBattleCount      Int                     @default(0)  // Số lần đấu cá trong ngày
  lastBattleReset       DateTime                @default(now()) // Thời gian reset battle count
  // ... existing fields ...
}
```

### Migration
- Migration: `add_daily_battle_limit`
- Thêm 2 fields mới vào User model
- Tự động reset dailyBattleCount về 0 khi sang ngày mới

## Files được cập nhật

### 1. `prisma/schema.prisma`
- Thêm `dailyBattleCount` và `lastBattleReset` vào User model

### 2. `src/utils/fish-battle.ts`
- Thêm `DAILY_BATTLE_LIMIT` constant (20)
- Thêm `checkAndResetDailyBattleCount()` function
- Thêm `incrementDailyBattleCount()` function
- Cập nhật `battleFish()` để kiểm tra daily limit
- Tích hợp daily limit check vào logic đấu cá

### 3. `src/commands/text/ecommerce/fishbattle.ts`
- Thêm kiểm tra daily limit vào `findRandomBattle()`
- Cập nhật help message với thông tin giới hạn
- Hiển thị thông báo khi đạt giới hạn

### 4. `scripts/test-daily-battle-limit.ts` (Mới)
- Test script toàn diện cho daily battle limit system
- Kiểm tra tất cả các trường hợp: ban đầu, tăng count, đạt giới hạn, reset ngày mới

## Cách hoạt động

### 1. Kiểm tra trước khi đấu
```typescript
const dailyLimitCheck = await FishBattleService.checkAndResetDailyBattleCount(userId, guildId);
if (!dailyLimitCheck.canBattle) {
  return { success: false, error: dailyLimitCheck.error };
}
```

### 2. Tăng count sau khi đấu
```typescript
await FishBattleService.incrementDailyBattleCount(userId, guildId);
```

### 3. Reset tự động
- So sánh ngày hiện tại với `lastBattleReset`
- Nếu khác ngày → reset `dailyBattleCount` về 0
- Cập nhật `lastBattleReset` thành ngày hiện tại

## Test Results

```
🧪 Testing Daily Battle Limit System...

1️⃣ Creating test user...
✅ Test user created

2️⃣ Testing initial daily battle limit check...
Initial check result: { canBattle: true, remainingBattles: 20 }
✅ Initial check completed

3️⃣ Testing daily battle count increment...
After 1 battles: { canBattle: true, remainingBattles: 19 }
After 2 battles: { canBattle: true, remainingBattles: 18 }
...
After 5 battles: { canBattle: true, remainingBattles: 15 }
✅ Increment test completed

4️⃣ Testing maximum limit...
At maximum limit: {
  canBattle: false,
  remainingBattles: 0,
  error: 'Bạn đã đạt giới hạn 20 lần đấu cá trong ngày! Vui lòng thử lại vào ngày mai.'
}
✅ Maximum limit test completed

5️⃣ Testing beyond limit...
Beyond limit check: {
  canBattle: false,
  remainingBattles: 0,
  error: 'Bạn đã đạt giới hạn 20 lần đấu cá trong ngày! Vui lòng thử lại vào ngày mai.'
}
✅ Beyond limit test completed

6️⃣ Testing reset for new day...
After reset for new day: { canBattle: true, remainingBattles: 20 }
✅ Reset test completed

🎉 All tests completed successfully!
```

## Sử dụng

### Command cơ bản
```bash
n.fishbattle          # Tìm đối thủ ngẫu nhiên (có kiểm tra daily limit)
n.fishbattle help     # Xem thông tin chi tiết về giới hạn
n.fishbattle ui       # Giao diện đấu cá (có kiểm tra daily limit)
```

### Thông báo khi đạt giới hạn
```
❌ Đã Đạt Giới Hạn Đấu Cá!
Bạn đã đạt giới hạn 20 lần đấu cá trong ngày!

📊 Giới Hạn: 20 lần đấu cá mỗi ngày
🕐 Reset: Vào 00:00 ngày mai
```

### Help message cập nhật
```
⏰ Giới hạn đấu cá
• Tối đa 20 lần đấu cá mỗi ngày
• Reset vào 00:00 ngày mai
• Cooldown 1 phút giữa các lần đấu
```

## Lợi ích

1. **Cân bằng gameplay**: Tránh spam đấu cá liên tục
2. **Tăng tính chiến lược**: User phải cân nhắc khi nào đấu
3. **Giảm tải server**: Hạn chế số lượng request đấu cá
4. **Công bằng**: Tất cả user đều có cùng giới hạn
5. **Linh hoạt**: Admin vẫn có thể đấu không giới hạn

## Tương lai

- Có thể thêm VIP system với giới hạn cao hơn
- Thêm weekly/monthly battle limits
- Tích hợp với reward system (bonus cho user ít đấu)
- Thêm battle pass system 