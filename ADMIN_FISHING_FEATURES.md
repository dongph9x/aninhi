# 🎣 Admin Fishing Features

## Tổng quan
Hệ thống câu cá và nuôi cá huyền thoại đã được cập nhật với các tính năng đặc biệt dành cho Administrator.

## 👑 Tính năng Admin

### 1. Câu Cá Huyền Thoại
- **Tính năng:** Administrator luôn câu được cá huyền thoại (100% tỷ lệ)
- **Cách hoạt động:** Khi Admin sử dụng lệnh `n.fishing`, hệ thống sẽ tự động chọn cá huyền thoại ngẫu nhiên
- **Thông báo:** Khi Admin câu được cá huyền thoại, sẽ có thông báo đặc biệt "👑 **Admin đã câu được cá huyền thoại!**"

### 2. Bypass Cooldown Câu Cá
- **Tính năng:** Administrator có thể câu cá liên tục không cần đợi cooldown 30 giây
- **Cách hoạt động:** Hệ thống bỏ qua kiểm tra cooldown cho Admin
- **Lưu ý:** Vẫn phải trả phí 10 AniCoin mỗi lần câu

### 3. Bypass Cooldown Cho Cá Ăn
- **Tính năng:** Administrator có thể cho cá ăn liên tục không cần đợi cooldown 1 giờ
- **Cách hoạt động:** Trong rương nuôi cá (`n.fishbarn`), Admin có thể cho cá ăn ngay lập tức
- **Lưu ý:** Vẫn tuân theo logic exp = 0 thì bypass cooldown

## 🔧 Cách Hoạt Động

### Kiểm Tra Quyền Admin
```typescript
const member = await message.guild?.members.fetch(userId);
const isAdmin = member?.permissions.has('Administrator') || false;
```

### Câu Cá Với Admin Bypass
```typescript
// Trong FishingService.fish()
const result = await FishingService.fish(userId, guildId, isAdmin);
```

### Cho Cá Ăn Với Admin Bypass
```typescript
// Trong FishBreedingService.feedFish()
const result = await FishBreedingService.feedFish(userId, fishId, isAdmin);
```

## 📊 Kết Quả Test

### Câu Cá Huyền Thoại
- **Tỷ lệ câu được:** 100% (10/10 lần test)
- **Loại cá:** Cá voi, Cá mực khổng lồ, Cá rồng biển, Cá thần
- **Giá trị:** 7,000 - 73,000 AniCoin

### Bypass Cooldown
- **Câu cá:** Có thể câu liên tục không đợi
- **Cho ăn:** Có thể cho cá ăn liên tục không đợi

## 🎮 Lệnh Sử Dụng

### Câu Cá (Admin)
```bash
n.fishing
# Hoặc
n.fish
```

### Mở Rương Nuôi Cá (Admin)
```bash
n.fishbarn
# Hoặc
n.fb
```

## ⚠️ Lưu Ý Quan Trọng

1. **Quyền Administrator:** Chỉ user có quyền Administrator mới được hưởng các tính năng này
2. **Chi phí:** Vẫn phải trả phí câu cá và các chi phí khác bình thường
3. **Cân bằng game:** Tính năng này chỉ dành cho Admin để test và quản lý hệ thống
4. **Logging:** Tất cả hoạt động Admin đều được log để theo dõi

## 🧪 Test Scripts

### Test Admin Fishing
```bash
npx tsx scripts/test-admin-fishing.ts
```

### Test Fish Breeding System
```bash
npx tsx scripts/test-fish-breeding-system.ts
```

## 📝 Changelog

### Version 1.0.0
- ✅ Thêm tính năng Admin luôn câu được cá huyền thoại
- ✅ Thêm tính năng Admin bypass cooldown câu cá
- ✅ Thêm tính năng Admin bypass cooldown cho cá ăn
- ✅ Thêm thông báo đặc biệt cho Admin
- ✅ Thêm test scripts để kiểm tra tính năng

---

**Lưu ý:** Các tính năng này chỉ hoạt động cho user có quyền Administrator trong Discord server. 