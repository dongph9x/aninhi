# 🔍 Admin/Owner Filter for Top Lose

## 📋 Tổng Quan

Tính năng này tự động loại bỏ user có role **Administrator** hoặc **Owner** khỏi tất cả các leaderboard thua lỗ (`n.toplose`). Hệ thống đã được cải thiện để bao gồm cả Owner và sử dụng nhiều phương pháp kiểm tra quyền.

## 🎯 Mục Đích

- **Bảo vệ danh tiếng:** Admin và Owner không nên xuất hiện trong danh sách thua lỗ
- **Công bằng:** Đảm bảo người chơi thực sự được công nhận trong leaderboard
- **Tự động:** Không cần can thiệp thủ công, hệ thống tự động lọc
- **Toàn diện:** Loại bỏ Admin/Owner khỏi tất cả vị trí, không chỉ top 1
- **Ưu tiên thông minh:** Top Lose GIF hiển thị cho user thường có thứ hạng cao nhất

## 🔧 Cách Hoạt Động

### **1. Kiểm Tra Role Admin/Owner (3 Phương Pháp)**

#### **Phương Pháp 1: Danh Sách Admin Cứng**
```typescript
const adminUserIds: string[] = [
    '389957152153796608', // Admin user - có quyền sử dụng lệnh admin
    // Thêm ID của các Administrator khác vào đây
];

if (adminUserIds.includes(userId)) {
    return true;
}
```

#### **Phương Pháp 2: Discord Permissions (Khi có Client)**
```typescript
if (client) {
    const guild = await client.guilds.fetch(guildId);
    const member = await guild.members.fetch(userId);
    
    // Kiểm tra quyền Administrator
    if (member.permissions.has('Administrator')) {
        return true;
    }
    
    // Kiểm tra quyền ManageGuild (Server Manager)
    if (member.permissions.has('ManageGuild')) {
        return true;
    }
    
    // Kiểm tra xem có phải là Owner không
    if (guild.ownerId === userId) {
        return true;
    }
}
```

#### **Phương Pháp 3: Database Role Check (Fallback)**
```typescript
const user = await prisma.user.findUnique({
    where: { userId_guildId: { userId, guildId } }
});

return user?.role === 'Administrator' || user?.role === 'ADMIN' || user?.role === 'Owner';
```

### **2. Lọc Khỏi Tất Cả Leaderboard**
```typescript
private static async filterAdminOrOwnerFromLeaderboard(leaderboard: any[], guildId: string, client?: any): Promise<any[]> {
    if (leaderboard.length === 0) return leaderboard;

    const filteredLeaderboard = [];
    
    for (const entry of leaderboard) {
        const isAdminOrOwner = await this.isAdminOrOwner(entry.userId, guildId, client);
        
        if (!isAdminOrOwner) {
            filteredLeaderboard.push(entry);
        } else {
            console.log(`Removing Admin/Owner ${entry.userId} from lose leaderboard`);
        }
    }

    return filteredLeaderboard;
}
```

### **3. Logic Ưu Tiên Top Lose GIF (MỚI)**
```typescript
static async getTopLoseUser(guildId: string, client?: any) {
    // Lấy top 10 users để kiểm tra
    const topLoseUsers = await prisma.gameStats.groupBy({
        by: ['userId'],
        where: { guildId, totalLost: { gt: 0 } },
        _sum: { totalLost: true, totalBet: true, gamesPlayed: true, gamesWon: true, biggestLoss: true },
        orderBy: { _sum: { totalLost: 'desc' } },
        take: 10 // Lấy top 10 để kiểm tra
    });

    // Tìm user đầu tiên không phải Admin/Owner
    for (const entry of topLoseUsers) {
        const isAdminOrOwner = await this.isAdminOrOwner(entry.userId, guildId, client);
        
        if (!isAdminOrOwner) {
            // Tìm thấy user không phải Admin/Owner
            console.log(`Top lose user (after filtering Admin/Owner): ${entry.userId}`);
            return topUser;
        } else {
            console.log(`Skipping Admin/Owner ${entry.userId}, checking next user...`);
        }
    }

    // Nếu tất cả top 10 đều là Admin/Owner
    return null;
}
```

### **4. Áp Dụng Cho Tất Cả Function**
- **Overall Lose Leaderboard:** `getOverallLoseLeaderboard()`
- **Game-Specific Leaderboard:** `getGameLoseLeaderboard()`
- **Top Lose User:** `getTopLoseUser()` (với logic ưu tiên mới)

## 📊 Các Trường Hợp

### ✅ **Trường Hợp 1: Admin/Owner ở Top 1**
```
Trước: 🥇 Administrator (1000 AniCoin thua)
       🥈 User thường (800 AniCoin thua)
Sau:   🥇 User thường (800 AniCoin thua) ← Trở thành top 1
       🥈 User khác (600 AniCoin thua)
```

### ✅ **Trường Hợp 2: Admin/Owner ở vị trí khác**
```
Trước: 🥇 User thường (1000 AniCoin thua)
       🥈 Administrator (800 AniCoin thua) ← Bị loại bỏ
       🥉 User khác (600 AniCoin thua)
Sau:   🥇 User thường (1000 AniCoin thua)
       🥈 User khác (600 AniCoin thua)
```

### ✅ **Trường Hợp 3: Top Lose GIF Logic**
```
Trước: 🥇 Administrator (1000 AniCoin thua) ← Top 1
       🥈 User thường (800 AniCoin thua) ← Top 2
Sau:   User thường sẽ thấy Top Lose GIF (vì Admin bị bỏ qua)
```

### ✅ **Trường Hợp 4: Chỉ có Admin/Owner**
```
Trước: 🥇 Administrator (1000 AniCoin thua)
       🥈 Owner (800 AniCoin thua)
Sau:   "Chưa có dữ liệu thua lỗ nào!"
       Không có Top Lose GIF
```

## 🎮 Lệnh Bị Ảnh Hưởng

### **1. `n.toplose` (Overall)**
- Loại bỏ Admin/Owner khỏi tất cả vị trí
- Hiển thị top 10 người thua lỗ nhiều nhất (không tính admin/owner)

### **2. `n.toplose blackjack`**
- Loại bỏ Admin/Owner khỏi tất cả vị trí
- Hiển thị top 10 người thua lỗ Blackjack

### **3. `n.toplose slots`**
- Loại bỏ Admin/Owner khỏi tất cả vị trí
- Hiển thị top 10 người thua lỗ Slots

### **4. `n.toplose roulette`**
- Loại bỏ Admin/Owner khỏi tất cả vị trí
- Hiển thị top 10 người thua lỗ Roulette

### **5. `n.toplose coinflip`**
- Loại bỏ Admin/Owner khỏi tất cả vị trí
- Hiển thị top 10 người thua lỗ Coin Flip

### **6. `n.gamestats lose`**
- Loại bỏ Admin/Owner khỏi tất cả vị trí
- Hiển thị top thua lỗ tổng hợp

### **7. Top Lose GIF trong `n.fishing` (MỚI)**
- **Logic cũ:** Admin/Owner ở top 1 → Không hiển thị Top Lose GIF
- **Logic mới:** Admin/Owner ở top 1 → Bỏ qua → Hiển thị Top Lose GIF cho user thường có thứ hạng cao nhất
- **Ưu tiên:** User thường có thứ hạng cao nhất sẽ thấy Top Lose GIF

## 🔍 Logic Kiểm Tra

### **Priority Order**
1. **Danh sách Admin cứng** (luôn hoạt động)
2. **Discord permissions** (khi có client)
3. **Database role check** (fallback)

### **Filter Logic**
```typescript
// Lọc tất cả Admin/Owner, không chỉ top 1
for (const entry of leaderboard) {
    const isAdminOrOwner = await this.isAdminOrOwner(entry.userId, guildId, client);
    
    if (!isAdminOrOwner) {
        filteredLeaderboard.push(entry);
    } else {
        console.log(`Removing Admin/Owner ${entry.userId} from lose leaderboard`);
    }
}
```

### **Top Lose GIF Logic (MỚI)**
```typescript
// Tìm user đầu tiên không phải Admin/Owner
for (const entry of topLoseUsers) {
    const isAdminOrOwner = await this.isAdminOrOwner(entry.userId, guildId, client);
    
    if (!isAdminOrOwner) {
        // Tìm thấy user không phải Admin/Owner
        return topUser; // Trả về user thường có thứ hạng cao nhất
    } else {
        console.log(`Skipping Admin/Owner ${entry.userId}, checking next user...`);
    }
}
```

## 📈 Tác Động

### **✅ Tích Cực**
- **Bảo vệ danh tiếng:** Admin và Owner không bị "xấu mặt" trong toplose
- **Công bằng:** Người chơi thực sự được công nhận
- **Tự động:** Không cần can thiệp thủ công
- **Toàn diện:** Loại bỏ khỏi tất cả vị trí, không chỉ top 1
- **Ưu tiên thông minh:** Top Lose GIF hiển thị cho user thường có thứ hạng cao nhất

### **⚠️ Lưu Ý**
- **Ảnh hưởng tất cả vị trí:** Admin/Owner bị loại bỏ hoàn toàn
- **Logging:** Có log khi loại bỏ admin/owner
- **Performance:** Thêm query để kiểm tra role
- **Client dependency:** Discord permissions chỉ hoạt động khi có client
- **Top Lose GIF:** Hiển thị cho user thường có thứ hạng cao nhất

## 🧪 Testing

### **Test Script**
```bash
npx tsx scripts/test-admin-owner-filter-toplose.ts
npx tsx scripts/test-toplose-commands.ts
npx tsx scripts/test-top-lose-priority.ts
```

### **Expected Output**
```
🏆 Test Top Lose Priority System...

2️⃣ Getting all users with game stats (unfiltered):
   📊 Found 2 users with game stats:
   🥇 User ID: 389957152153796608 - ❌ Admin/Owner
   🥈 User ID: 1397381362763169853 - ✅ Regular User

4️⃣ Testing getTopLoseUser (with new logic):
Skipping Admin/Owner 389957152153796608, checking next user...
Top lose user (after filtering Admin/Owner): 1397381362763169853 with 1,000 lost
   ✅ Top lose user found: 1397381362763169853
   📊 Original position: 🥈 (2th place)
   📊 Admin/Owner users skipped: 1
   🎣 This user will see Top Lose GIF in n.fishing

✅ Top Lose Priority Test Completed!
```

## 📝 Changelog

### **Version 2.1.0 (MỚI)**
- ✅ Cải thiện logic `getTopLoseUser()` để ưu tiên user thường
- ✅ Khi top 1 là Admin/Owner → Bỏ qua → Lấy top 2
- ✅ Top Lose GIF hiển thị cho user thường có thứ hạng cao nhất
- ✅ Tạo test script `test-top-lose-priority.ts`
- ✅ Cập nhật documentation với logic mới

### **Version 2.0.0**
- ✅ Thêm kiểm tra Owner (guild.ownerId)
- ✅ Thêm kiểm tra ManageGuild permission
- ✅ Cải thiện logic lọc (loại bỏ tất cả vị trí, không chỉ top 1)
- ✅ Thêm client parameter cho tất cả function
- ✅ Cập nhật tất cả command để truyền client
- ✅ Tạo test script mới
- ✅ Cập nhật documentation

### **Version 1.0.0 (CŨ)**
- ✅ Thêm function `isAdministrator()` để kiểm tra role
- ✅ Thêm function `filterAdministratorFromTop1()` để lọc
- ✅ Áp dụng filter cho `getOverallLoseLeaderboard()`
- ✅ Áp dụng filter cho `getGameLoseLeaderboard()`
- ✅ Áp dụng filter cho `getTopLoseUser()`
- ✅ Thêm logging khi loại bỏ admin
- ✅ Tạo test script để kiểm tra logic

## 🎯 Kết Quả

Bây giờ khi sử dụng lệnh `n.toplose`, tất cả user có role **Administrator** hoặc **Owner** sẽ tự động bị loại bỏ khỏi danh sách và chỉ hiển thị những người chơi thực sự.

**Ví dụ:**
```
🥇 User thường (1000 AniCoin thua) ← Trở thành top 1
🥈 User khác (800 AniCoin thua)
🥉 User khác (600 AniCoin thua)
```

Thay vì:
```
🥇 Administrator (1000 AniCoin thua) ← Bị loại bỏ
🥈 Owner (800 AniCoin thua) ← Bị loại bỏ
🥉 User thường (600 AniCoin thua) ← Trở thành top 1
```

### **🎣 Top Lose GIF Logic Mới:**
- **Trước:** Admin ở top 1 → Không hiển thị Top Lose GIF
- **Bây giờ:** Admin ở top 1 → Bỏ qua → User thường có thứ hạng cao nhất sẽ thấy Top Lose GIF

## 🔧 Cách Thêm Admin Mới

### **Phương Pháp 1: Thêm vào Danh Sách ID**
1. Mở file `src/utils/gameStats.ts`
2. Tìm mảng `adminUserIds`
3. Thêm User ID mới vào danh sách
4. Restart bot

```typescript
const adminUserIds: string[] = [
    '389957152153796608', // Admin hiện tại
    '123456789012345678', // Admin mới
];
```

### **Phương Pháp 2: Cấp Quyền Discord**
1. Vào Discord Server Settings
2. Chọn Roles
3. Tạo role mới hoặc chỉnh sửa role hiện có
4. Cấp quyền `Administrator` hoặc `Manage Server`
5. Gán role cho user

### **Phương Pháp 3: Cập Nhật Database**
```sql
UPDATE "User" 
SET role = 'Administrator' 
WHERE "userId" = '123456789012345678' AND "guildId" = 'guild_id_here';
```

## 🎉 Kết Luận

Hệ thống **Admin/Owner Filter** đã được cải thiện hoàn toàn với:

- 🔍 **Kiểm tra toàn diện:** 3 phương pháp kiểm tra quyền
- 🛡️ **Bảo mật cao:** Hỗ trợ cả Discord permissions và database
- ⚡ **Hiệu suất tốt:** Fallback system an toàn
- 🎯 **Chính xác:** Loại bỏ Admin/Owner khỏi tất cả vị trí
- 🎣 **Ưu tiên thông minh:** Top Lose GIF hiển thị cho user thường có thứ hạng cao nhất
- 🔧 **Dễ bảo trì:** Modular design, dễ mở rộng
- 📊 **Logging đầy đủ:** Theo dõi mọi thay đổi

**🎮 Hệ thống đã sẵn sàng bảo vệ danh tiếng Admin/Owner và ưu tiên user thường!**