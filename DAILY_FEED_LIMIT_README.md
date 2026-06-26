# Daily Feed Limit System

## Tổng quan

Hệ thống giới hạn số lần cho cá ăn hàng ngày được thêm vào để cân bằng gameplay và tránh spam cho cá ăn. Mỗi user chỉ được cho cá ăn tối đa **20 lần mỗi ngày**.

## Tính năng chính

### 1. Giới hạn hàng ngày
- **Giới hạn**: 20 lần cho cá ăn mỗi ngày
- **Reset**: Tự động reset vào 00:00 ngày mai
- **Áp dụng**: Tất cả các loại thức ăn (basic, premium, luxury, legendary)

### 2. Kiểm tra thông minh
- Tự động kiểm tra và reset daily feed count khi sang ngày mới
- Hiển thị số lần cho cá ăn còn lại
- Thông báo rõ ràng khi đạt giới hạn

### 3. Ngoại lệ cho Admin
- Administrator không bị giới hạn daily feed limit
- Có thể cho cá ăn không giới hạn

## Thay đổi Database

### Schema Updates
```prisma
model User {
  // ... existing fields ...
  dailyFeedCount        Int                     @default(0)  // Số lần cho cá ăn trong ngày
  lastFeedReset         DateTime                @default(now()) // Thời gian reset feed count
  // ... existing fields ...
}
```

### Migration
- Migration: `add_daily_feed_limit`
- Thêm 2 fields mới vào User model
- Tự động reset dailyFeedCount về 0 khi sang ngày mới

## Files được cập nhật

### 1. `prisma/schema.prisma`
- Thêm `dailyFeedCount` và `lastFeedReset` vào User model

### 2. `src/utils/fish-feed.ts` (Mới)
- Tạo service mới để quản lý daily feed limit
- `DAILY_FEED_LIMIT` constant (20)
- `checkAndResetDailyFeedCount()` function
- `incrementDailyFeedCount()` function
- `getDailyFeedLimit()` function

### 3. `src/components/MessageComponent/FishBarnUI.ts`
- Thêm `dailyFeedInfo` parameter vào constructor
- Hiển thị thông tin daily feed limit trong embed
- Hiển thị số lần cho cá ăn còn lại hoặc thông báo đạt giới hạn

### 4. `src/commands/text/ecommerce/fishbarn.ts`
- Import `FishFeedService`
- Lấy thông tin daily feed limit khi tạo UI
- Truyền thông tin vào `FishBarnUI` constructor

### 5. `src/components/MessageComponent/FishBarnHandler.ts`
- Import `FishFeedService`
- Kiểm tra daily feed limit trong `handleFeed()` function
- Tăng daily feed count sau khi cho cá ăn thành công
- Cập nhật `createUIWithFishFood()` để truyền daily feed info

### 6. `scripts/test-daily-feed-limit.ts` (Mới)
- Test script toàn diện cho daily feed limit system
- Kiểm tra tất cả các trường hợp: ban đầu, tăng count, đạt giới hạn, reset ngày mới

## Cách hoạt động

### 1. Kiểm tra trước khi cho cá ăn
```typescript
const dailyFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
if (!dailyFeedCheck.canFeed) {
  return interaction.reply({ 
    content: `❌ ${dailyFeedCheck.error}`, 
    ephemeral: true 
  });
}
```

### 2. Tăng count sau khi cho cá ăn
```typescript
await FishFeedService.incrementDailyFeedCount(userId, guildId);
```

### 3. Reset tự động
- So sánh ngày hiện tại với `lastFeedReset`
- Nếu khác ngày → reset `dailyFeedCount` về 0
- Cập nhật `lastFeedReset` thành ngày hiện tại

## Test Results

```
🧪 Testing Daily Feed Limit System...

1️⃣ Creating test user...
✅ Test user created

2️⃣ Testing initial daily feed limit check...
Initial check result: { canFeed: true, remainingFeeds: 20 }
✅ Initial check completed

3️⃣ Testing daily feed count increment...
After 1 feeds: { canFeed: true, remainingFeeds: 19 }
After 2 feeds: { canFeed: true, remainingFeeds: 18 }
...
After 5 feeds: { canFeed: true, remainingFeeds: 15 }
✅ Increment test completed

4️⃣ Testing maximum limit...
At maximum limit: {
  canFeed: false,
  remainingFeeds: 0,
  error: 'Bạn đã đạt giới hạn 20 lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.'
}
✅ Maximum limit test completed

5️⃣ Testing beyond limit...
Beyond limit check: {
  canFeed: false,
  remainingFeeds: 0,
  error: 'Bạn đã đạt giới hạn 20 lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.'
}
✅ Beyond limit test completed

6️⃣ Testing reset for new day...
After reset for new day: { canFeed: true, remainingFeeds: 20 }
✅ Reset test completed

🎉 All tests completed successfully!
```

## Sử dụng

### Command cơ bản
```bash
n.fishbarn          # Mở rương nuôi cá (có hiển thị daily feed limit)
```

### Thông báo khi đạt giới hạn
```
❌ Bạn đã đạt giới hạn 20 lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.
```

### UI hiển thị thông tin
```
🍽️ Giới Hạn Cho Cá Ăn Hôm Nay
✅ Còn 15/20 lần cho cá ăn
```

hoặc

```
🍽️ Giới Hạn Cho Cá Ăn Hôm Nay
❌ Đã đạt giới hạn! (0/20)
Bạn đã đạt giới hạn 20 lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.
```

## Tích hợp với hệ thống hiện tại

### 1. FishBarnUI
- Hiển thị thông tin daily feed limit trong embed
- Tự động cập nhật khi UI được refresh
- Hiển thị rõ ràng trạng thái có thể cho cá ăn hay không

### 2. FishBarnHandler
- Kiểm tra daily feed limit trước khi cho cá ăn
- Tăng count sau khi cho cá ăn thành công
- Cập nhật UI với thông tin mới nhất

### 3. Admin System
- Admin không bị giới hạn daily feed limit
- Có thể cho cá ăn không giới hạn
- Vẫn áp dụng các logic khác (kiểm tra thức ăn, level cá, etc.)

## Lợi ích

1. **Cân bằng gameplay**: Tránh spam cho cá ăn liên tục
2. **Tăng tính chiến lược**: User phải cân nhắc khi nào cho cá ăn
3. **Giảm tải server**: Hạn chế số lượng request cho cá ăn
4. **Công bằng**: Tất cả user đều có cùng giới hạn
5. **Linh hoạt**: Admin vẫn có thể cho cá ăn không giới hạn
6. **Tích hợp tốt**: Hoạt động với tất cả loại thức ăn

## So sánh với Daily Battle Limit

| Tính năng | Daily Battle Limit | Daily Feed Limit |
|-----------|-------------------|------------------|
| Giới hạn | 20 lần đấu cá/ngày | 20 lần cho cá ăn/ngày |
| Reset | 00:00 ngày mai | 00:00 ngày mai |
| Admin | Không bị giới hạn | Không bị giới hạn |
| Cooldown | 1 phút giữa các lần | Không có cooldown |
| UI | Hiển thị trong fishbattle | Hiển thị trong fishbarn |

## Tương lai

- Có thể thêm VIP system với giới hạn cao hơn
- Thêm weekly/monthly feed limits
- Tích hợp với reward system (bonus cho user ít cho cá ăn)
- Thêm feed pass system
- Thêm special events với giới hạn khác nhau 