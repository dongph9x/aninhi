# Hệ Thống Cooldown Battle Cá

## Tổng Quan

Hệ thống cooldown battle cá đã được thêm vào để giới hạn tần suất đấu của người chơi, đảm bảo game cân bằng và tránh spam battle.

## Tính Năng

### ⏰ Cooldown 1 Phút
- Mỗi lần battle thành công, người chơi phải chờ 1 phút mới có thể battle tiếp
- Cooldown được tính riêng cho từng user trong từng server
- Thời gian chờ được hiển thị chính xác đến giây

### 👑 Administrator Bypass
- Administrator có thể battle mà không cần chờ cooldown
- Danh sách Administrator được cấu hình trong code
- Có thể mở rộng để kiểm tra role Discord trong tương lai

### 🔄 Tự Động Reset
- Cooldown tự động reset sau 30 giây
- Không cần restart bot
- Hoạt động ngay cả khi bot offline

## Cách Hoạt Động

### 1. Kiểm Tra Cooldown
```typescript
const cooldownCheck = FishBattleService.checkBattleCooldown(userId, guildId);
if (!cooldownCheck.canBattle) {
  const remainingSeconds = Math.ceil((cooldownCheck.remainingTime || 0) / 1000);
  // Hiển thị thông báo chờ
}
```

### 2. Cập Nhật Cooldown
```typescript
// Sau khi battle thành công
if (!isAdmin) {
  FishBattleService.updateBattleCooldown(userId, guildId);
}
```

### 3. Kiểm Tra Administrator
```typescript
const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
```

## Cấu Hình Administrator

Để thêm Administrator, cập nhật danh sách trong `src/utils/fish-battle.ts`:

```typescript
const adminUserIds: string[] = [
  '123456789012345678', // Thêm Discord User ID của Administrator
  '876543210987654321'  // Có thể thêm nhiều Administrator
];
```

## Thông Báo Lỗi

Khi người chơi cố gắng battle trong thời gian cooldown:

```
⏰ Bạn cần chờ 25 giây nữa mới có thể đấu!
```

## Testing

### Test Scripts
- `scripts/test-battle-cooldown.ts` - Test cơ bản hệ thống cooldown
- `scripts/test-cooldown-simple.ts` - Test đơn giản không cần database
- `scripts/test-battle-with-cooldown.ts` - Test battle thực tế với cooldown

### Chạy Test
```bash
npx tsx scripts/test-cooldown-simple.ts
```

## Kết Quả Test

```
🧪 Testing Simple Cooldown System...

📋 Test 1: Kiểm tra cooldown ban đầu
✅ Kết quả: Có thể đấu

📋 Test 2: Cập nhật cooldown
✅ Đã cập nhật cooldown

📋 Test 3: Kiểm tra cooldown sau khi cập nhật
✅ Kết quả: Không thể đấu
⏰ Thời gian chờ còn lại: 60s

📋 Test 4: Kiểm tra quyền Administrator
✅ Là Administrator: Không

📋 Test 5: Mô phỏng Administrator bypass cooldown
🔍 Kiểm tra cooldown trước khi bypass...
✅ Có thể battle: Không
🔧 Xóa cooldown (mô phỏng Administrator)...
✅ Sau khi bypass: Có thể đấu

📋 Test 6: Kiểm tra cooldown cho user khác
✅ User other-user-456 có thể đấu: Có

🎉 Tất cả tests hoàn thành!
```

## Lợi Ích

1. **Cân Bằng Game**: Ngăn chặn spam battle
2. **Trải Nghiệm Tốt**: Người chơi có thời gian suy nghĩ
3. **Hiệu Suất**: Giảm tải cho server
4. **Công Bằng**: Mọi người chơi đều tuân theo quy tắc
5. **Linh Hoạt**: Administrator có thể bypass khi cần

## Tương Lai

- [ ] Tích hợp với Discord role system
- [ ] Cấu hình cooldown theo level
- [ ] Cooldown khác nhau cho các loại battle
- [ ] Thống kê cooldown usage 