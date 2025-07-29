# 🔍 Administrator Filter for Top Lose

## 📋 Tổng Quan
Tính năng này tự động loại bỏ user có role **Administrator** khỏi vị trí **top 1** trong các leaderboard thua lỗ (`n.toplose`).

## 🎯 Mục Đích
- **Bảo vệ danh tiếng:** Administrator không nên xuất hiện ở top 1 trong danh sách thua lỗ
- **Công bằng:** Đảm bảo người chơi thực sự được công nhận ở vị trí top 1
- **Tự động:** Không cần can thiệp thủ công, hệ thống tự động lọc

## 🔧 Cách Hoạt Động

### **1. Kiểm Tra Role Administrator**
```typescript
private static async isAdministrator(userId: string, guildId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
        where: {
            userId_guildId: { userId, guildId }
        }
    });
    
    return user?.role === 'Administrator' || user?.role === 'ADMIN';
}
```

### **2. Lọc Khỏi Top 1**
```typescript
private static async filterAdministratorFromTop1(leaderboard: any[], guildId: string): Promise<any[]> {
    if (leaderboard.length === 0) return leaderboard;

    const top1 = leaderboard[0];
    const isTop1Admin = await this.isAdministrator(top1.userId, guildId);

    if (isTop1Admin) {
        console.log(`Removing Administrator ${top1.userId} from top 1 lose leaderboard`);
        return leaderboard.slice(1); // Loại bỏ top 1 nếu là admin
    }

    return leaderboard;
}
```

### **3. Áp Dụng Cho Tất Cả Leaderboard**
- **Overall Lose Leaderboard:** `getOverallLoseLeaderboard()`
- **Game-Specific Leaderboard:** `getGameLoseLeaderboard()`
- **Top Lose User:** `getTopLoseUser()`

## 📊 Các Trường Hợp

### ✅ **Trường Hợp 1: Administrator ở Top 1**
```
Trước: 🥇 Administrator (1000 AniCoin thua)
Sau:   🥇 User thường (800 AniCoin thua)
       🥈 User khác (600 AniCoin thua)
```

### ✅ **Trường Hợp 2: Administrator không ở Top 1**
```
Kết quả: Không thay đổi
🥇 User thường (1000 AniCoin thua)
🥈 Administrator (800 AniCoin thua) ← Vẫn hiển thị
```

### ✅ **Trường Hợp 3: Chỉ có Administrator**
```
Trước: 🥇 Administrator (1000 AniCoin thua)
Sau:   "Chưa có dữ liệu thua lỗ nào!"
```

## 🎮 Lệnh Bị Ảnh Hưởng

### **1. `n.toplose` (Overall)**
- Loại bỏ Administrator khỏi top 1 tổng hợp
- Hiển thị top 10 người thua lỗ nhiều nhất (không tính admin ở top 1)

### **2. `n.toplose blackjack`**
- Loại bỏ Administrator khỏi top 1 Blackjack
- Hiển thị top 10 người thua lỗ Blackjack

### **3. `n.toplose slots`**
- Loại bỏ Administrator khỏi top 1 Slots
- Hiển thị top 10 người thua lỗ Slots

### **4. `n.toplose roulette`**
- Loại bỏ Administrator khỏi top 1 Roulette
- Hiển thị top 10 người thua lỗ Roulette

### **5. `n.toplose coinflip`**
- Loại bỏ Administrator khỏi top 1 Coin Flip
- Hiển thị top 10 người thua lỗ Coin Flip

## 🔍 Logic Kiểm Tra

### **Role Detection**
```typescript
// Kiểm tra role trong database
const user = await prisma.user.findUnique({
    where: { userId_guildId: { userId, guildId } }
});

// Hỗ trợ nhiều format role
return user?.role === 'Administrator' || user?.role === 'ADMIN';
```

### **Filter Logic**
```typescript
// Chỉ lọc top 1, không ảnh hưởng các vị trí khác
if (isTop1Admin) {
    return leaderboard.slice(1); // Bỏ top 1
}
return leaderboard; // Giữ nguyên
```

## 📈 Tác Động

### **✅ Tích Cực**
- **Bảo vệ danh tiếng:** Admin không bị "xấu mặt" ở top 1
- **Công bằng:** Người chơi thực sự được công nhận
- **Tự động:** Không cần can thiệp thủ công

### **⚠️ Lưu Ý**
- **Chỉ ảnh hưởng top 1:** Admin vẫn hiển thị ở các vị trí khác
- **Logging:** Có log khi loại bỏ admin khỏi top 1
- **Performance:** Thêm 1 query để kiểm tra role

## 🧪 Testing

### **Test Script**
```bash
npx tsx scripts/test-admin-filter-toplose.ts
```

### **Expected Output**
```
🔍 Testing Administrator Filter for Top Lose...

1. Testing Overall Lose Leaderboard:
   Found 0 users in overall leaderboard

2. Testing Game-Specific Lose Leaderboard:
   Found 0 users in blackjack leaderboard

3. Testing Top Lose User:
   No top lose user found (possibly filtered out Administrator)

✅ Administrator Filter Test Completed!
🔍 Logic: Administrators are filtered out from top 1 positions
```

## 📝 Changelog

### **Version 1.0.0**
- ✅ Thêm function `isAdministrator()` để kiểm tra role
- ✅ Thêm function `filterAdministratorFromTop1()` để lọc
- ✅ Áp dụng filter cho `getOverallLoseLeaderboard()`
- ✅ Áp dụng filter cho `getGameLoseLeaderboard()`
- ✅ Áp dụng filter cho `getTopLoseUser()`
- ✅ Thêm logging khi loại bỏ admin
- ✅ Tạo test script để kiểm tra logic

## 🎯 Kết Quả

Bây giờ khi sử dụng lệnh `n.toplose`, nếu user có role **Administrator** đang ở vị trí **top 1**, họ sẽ tự động bị loại bỏ khỏi danh sách và user ở vị trí thứ 2 sẽ trở thành top 1.

**Ví dụ:**
```
🥇 User thường (1000 AniCoin thua) ← Trở thành top 1
🥈 User khác (800 AniCoin thua)
🥉 User khác (600 AniCoin thua)
```

Thay vì:
```
🥇 Administrator (1000 AniCoin thua) ← Bị loại bỏ
🥈 User thường (800 AniCoin thua)
🥉 User khác (600 AniCoin thua)
```