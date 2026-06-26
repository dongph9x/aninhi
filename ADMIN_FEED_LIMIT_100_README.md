# 👑 Admin Daily Feed Limit: 100 Times Per Day

## 📋 Tổng Quan

Hệ thống giới hạn cho cá ăn hàng ngày đã được cập nhật để phân biệt giữa **Admin** và **User thường**:

- **👑 Admin**: 100 lần cho cá ăn mỗi ngày
- **👤 User thường**: 20 lần cho cá ăn mỗi ngày

## ✨ Tính Năng Mới

### 1. **Phân Biệt Quyền Hạn**
- **Admin**: Được ưu tiên với giới hạn cao hơn (100 lần/ngày)
- **User thường**: Giữ nguyên giới hạn cũ (20 lần/ngày)
- **Tự động nhận diện**: Bot tự động kiểm tra quyền admin

### 2. **Hiển Thị UI Thông Minh**
- **Admin**: Hiển thị `👑 Admin` badge và giới hạn 100
- **User thường**: Hiển thị giới hạn 20 bình thường
- **Thông tin rõ ràng**: Số lần còn lại và tổng giới hạn

### 3. **Kiểm Tra Quyền Tự Động**
- Sử dụng `FishBattleService.isAdministrator()` để kiểm tra
- Không cần cấu hình thủ công
- Hoạt động với tất cả server

## 🔧 Thay Đổi Kỹ Thuật

### 1. **FishFeedService Constants**
```typescript
export class FishFeedService {
  private static readonly DAILY_FEED_LIMIT = 20; // User thường
  private static readonly ADMIN_DAILY_FEED_LIMIT = 100; // Admin
}
```

### 2. **Logic Kiểm Tra Quyền**
```typescript
// Kiểm tra quyền admin
const { FishBattleService } = await import('./fish-battle');
const isAdmin = await FishBattleService.isAdministrator(userId, guildId);

// Xác định giới hạn dựa trên quyền
const dailyLimit = isAdmin ? this.ADMIN_DAILY_FEED_LIMIT : this.DAILY_FEED_LIMIT;
```

### 3. **Return Type Mới**
```typescript
static async checkAndResetDailyFeedCount(userId: string, guildId: string): Promise<{
  canFeed: boolean;
  remainingFeeds: number;
  error?: string;
  isAdmin?: boolean; // Thêm field mới
}>
```

### 4. **UI Hiển Thị Thông Minh**
```typescript
const isAdmin = this.dailyFeedInfo.isAdmin;
const limitText = isAdmin ? '100' : '20';
const adminBadge = isAdmin ? ' 👑 Admin' : '';

embed.addFields({
  name: `🍽️ Giới Hạn Cho Cá Ăn Hôm Nay${adminBadge}`,
  value: `✅ Còn **${this.dailyFeedInfo.remainingFeeds}/${limitText}** lần cho cá ăn`,
  inline: true
});
```

## 📊 Ví Dụ Hiển Thị

### **👑 Admin User:**
```
🍽️ Giới Hạn Cho Cá Ăn Hôm Nay 👑 Admin
✅ Còn **95/100** lần cho cá ăn
```

### **👤 Regular User:**
```
🍽️ Giới Hạn Cho Cá Ăn Hôm Nay
✅ Còn **15/20** lần cho cá ăn
```

### **Khi Đạt Giới Hạn:**
```
🍽️ Giới Hạn Cho Cá Ăn Hôm Nay 👑 Admin
❌ **Đã đạt giới hạn!** (0/100)
Bạn đã đạt giới hạn 100 lần cho cá ăn trong ngày! Vui lòng thử lại vào ngày mai.
```

## 🧪 Testing

### **Script Test:**
```bash
npx tsx scripts/test-admin-feed-limit.ts
```

### **Kết Quả Mong Đợi:**
```
🎉 SUCCESS: Admin vs Regular User Daily Feed Limit is working correctly!
✅ Admin users can feed fish 100 times per day
✅ Regular users remain limited to 20 times per day
✅ UI will display different limits for different user types
```

## 🔄 Files Đã Cập Nhật

### 1. **Services**
- `src/utils/fish-feed.ts`
  - Thêm `ADMIN_DAILY_FEED_LIMIT = 100`
  - Cập nhật logic kiểm tra quyền admin
  - Thêm field `isAdmin` vào return type
  - Thêm method `getDailyFeedLimitForUser()`

### 2. **UI Components**
- `src/components/MessageComponent/FishBarnUI.ts`
  - Cập nhật constructor để nhận `isAdmin`
  - Hiển thị badge 👑 Admin cho admin users
  - Hiển thị giới hạn khác nhau (100 vs 20)

### 3. **Commands & Handlers**
- `src/commands/text/ecommerce/fishbarn.ts`
- `src/components/MessageComponent/FishBarnHandler.ts`
  - Tự động truyền thông tin `isAdmin` vào UI

## 🎯 Cách Hoạt Động

### **1. Khi User Mở FishBarn:**
1. Bot kiểm tra quyền admin của user
2. Xác định giới hạn phù hợp (100 hoặc 20)
3. Hiển thị UI với thông tin tương ứng

### **2. Khi User Cho Cá Ăn:**
1. Kiểm tra daily feed count hiện tại
2. So sánh với giới hạn dựa trên quyền
3. Cho phép hoặc từ chối dựa trên giới hạn

### **3. Reset Hàng Ngày:**
1. Tự động reset vào 00:00 ngày mai
2. Admin: reset về 0/100
3. User thường: reset về 0/20

## 🔮 Tương Lai

- **VIP System**: Có thể thêm các level VIP khác nhau
- **Custom Limits**: Admin có thể set giới hạn tùy chỉnh cho từng user
- **Server Settings**: Có thể cấu hình giới hạn khác nhau cho từng server
- **Temporary Boosts**: Event đặc biệt với giới hạn cao hơn

## ✅ Lợi Ích

1. **Công Bằng**: Admin có quyền ưu tiên hợp lý
2. **Linh Hoạt**: Hỗ trợ quản lý server tốt hơn
3. **Trực Quan**: UI hiển thị rõ ràng quyền hạn
4. **Tự Động**: Không cần cấu hình thủ công
5. **Tương Thích**: Hoạt động với tất cả server hiện có
