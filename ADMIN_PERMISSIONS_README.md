# 👑 Hệ Thống Quyền Admin

## Tổng Quan

Hệ thống quyền admin đã được cập nhật để hỗ trợ cả **danh sách ID cứng** và **quyền Discord**. Điều này giúp linh hoạt hơn trong việc quản lý quyền admin.

## 🔧 Cách Hoạt Động

### 1. Kiểm Tra Danh Sách ID (Fallback)
- Hệ thống đầu tiên kiểm tra xem User ID có trong danh sách admin cứng không
- Danh sách được lưu trong `src/utils/fish-battle.ts`
- Luôn hoạt động, không phụ thuộc vào Discord API

### 2. Kiểm Tra Quyền Discord (Khi có Client)
- Nếu có client context, hệ thống sẽ kiểm tra quyền Discord
- Hỗ trợ quyền `Administrator` và `ManageGuild`
- Chỉ hoạt động khi có client từ message hoặc interaction

## 📋 Danh Sách Admin Hiện Tại

**File:** `src/utils/fish-battle.ts`

```typescript
const adminUserIds: string[] = [
  '389957152153796608', // Admin user - có quyền sử dụng lệnh admin
  // Thêm ID của các Administrator khác vào đây
  // Ví dụ: '123456789012345678'
  // Thêm User ID của user bạn muốn cấp quyền admin ở đây
];
```

## 🛠️ Cách Thêm Admin Mới

### Phương Pháp 1: Thêm vào Danh Sách ID
1. Mở file `src/utils/fish-battle.ts`
2. Tìm mảng `adminUserIds`
3. Thêm User ID mới vào danh sách
4. Restart bot

```typescript
const adminUserIds: string[] = [
  '389957152153796608', // Admin hiện tại
  '123456789012345678', // Admin mới
];
```

### Phương Pháp 2: Cấp Quyền Discord
1. Vào Discord Server Settings
2. Chọn Roles
3. Tạo role mới hoặc chỉnh sửa role hiện có
4. Cấp quyền `Administrator` hoặc `Manage Server`
5. Gán role cho user

## 🎯 Các Lệnh Admin

### Lệnh FishCoin
- `!fishgive @user <amount>` - Thêm FishCoin
- `!fishremove @user <amount>` - Bớt FishCoin
- `!fishset @user <amount>` - Set FishCoin (chưa implement)

### Lệnh Test
- `!testuser` - Test user thường
- `!simulateuser` - Simulate user thường

### Lệnh Khác
- `!backupdb` - Backup database
- `!dbstatus` - Kiểm tra trạng thái database
- `!maintenance` - Bật/tắt chế độ bảo trì

## 🔍 Kiểm Tra Quyền Admin

### Trong Code
```typescript
const { FishBattleService } = await import('@/utils/fish-battle');
const isAdmin = await FishBattleService.isAdministrator(userId, guildId, client);
```

### Test Script
```bash
npx tsx scripts/test-admin-permissions.ts
```

## ⚠️ Lưu Ý Quan Trọng

### 1. Client Context
- Discord permissions chỉ hoạt động khi có client context
- Từ message: `message.client`
- Từ interaction: `interaction.client`

### 2. Fallback System
- Nếu không có client hoặc Discord API lỗi
- Hệ thống sẽ fallback về danh sách ID
- Đảm bảo luôn có cách kiểm tra quyền

### 3. Security
- Danh sách ID được hardcode trong code
- Cần restart bot khi thay đổi danh sách
- Discord permissions an toàn hơn vì có thể thay đổi real-time

## 🧪 Testing

### Test Admin Check
```bash
npx tsx scripts/test-admin-check.ts
```

### Test Admin Permissions
```bash
npx tsx scripts/test-admin-permissions.ts
```

### Test Admin Commands
```bash
npx tsx scripts/test-admin-feed-fish.ts
npx tsx scripts/test-admin-fishing.ts
```

## 📊 Kết Quả Test

```
🧪 Testing Admin Permissions...

📋 Testing: User trong danh sách admin
   User ID: 389957152153796608
   Guild ID: test-guild-admin-permissions
   Is Admin (ID list only): true
   Is Admin (with null client): true

📋 Testing: User thường (không trong danh sách)
   User ID: 123456789012345678
   Guild ID: test-guild-admin-permissions
   Is Admin (ID list only): false
   Is Admin (with null client): false
```

## 🎉 Kết Luận

Hệ thống quyền admin đã được cải thiện với:

✅ **Hỗ trợ cả ID list và Discord permissions**  
✅ **Fallback system an toàn**  
✅ **Linh hoạt trong quản lý quyền**  
✅ **Backward compatibility**  
✅ **Testing scripts đầy đủ**  

Bây giờ bạn có thể:
1. Thêm User ID vào danh sách để cấp quyền admin ngay lập tức
2. Hoặc cấp quyền Discord để quản lý quyền linh hoạt hơn
3. Sử dụng cả hai phương pháp cùng lúc 