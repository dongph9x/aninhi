# Clear Data Scripts

## Tóm tắt
Các script để clear dữ liệu trong database theo nhiều cách khác nhau.

## Các script có sẵn

### 1. Clear tất cả dữ liệu (`scripts/clear-all-data.ts`)
**Mục đích:** Xóa toàn bộ dữ liệu trong database, reset về trạng thái ban đầu.

**Cách sử dụng:**
```bash
npx tsx scripts/clear-all-data.ts
```

**Dữ liệu sẽ bị xóa:**
- ✅ Fish food
- ✅ Caught fish
- ✅ Fishing rods
- ✅ Fishing baits
- ✅ Fishing data
- ✅ Fish prices
- ✅ Transactions
- ✅ Daily claims
- ✅ Users
- ✅ Tournaments
- ✅ Tournament participants
- ✅ Battle history
- ✅ Battle fish inventory
- ✅ Breeding history
- ✅ Inventory items
- ✅ Moderation logs

### 2. Clear dữ liệu test (`scripts/clear-test-data.ts`)
**Mục đích:** Chỉ xóa dữ liệu test từ các script test.

**Cách sử dụng:**
```bash
npx tsx scripts/clear-test-data.ts
```

**Guild IDs sẽ bị xóa:**
- `test-guild-fishing-bigint`
- `test-guild-give-bigint`
- `test-guild-fishing-shop-bigint`
- `test-guild-sell-fish-bigint`
- `test-guild-tournament-winner-count`
- `test-guild-bigint-fixes`

### 3. Clear dữ liệu cụ thể (`scripts/clear-specific-data.ts`)
**Mục đích:** Cung cấp các function để clear từng loại dữ liệu riêng biệt.

**Cách sử dụng:**
```typescript
import { clearFishingData, clearUserData, clearAllData } from './scripts/clear-specific-data';

// Clear chỉ dữ liệu fishing
await clearFishingData();

// Clear chỉ dữ liệu user
await clearUserData();

// Clear tất cả
await clearAllData();
```

**Các function có sẵn:**
- `clearFishingData()` - Xóa dữ liệu câu cá
- `clearUserData()` - Xóa dữ liệu user
- `clearTournamentData()` - Xóa dữ liệu tournament
- `clearBattleData()` - Xóa dữ liệu battle
- `clearInventoryData()` - Xóa dữ liệu inventory
- `clearTransactionData()` - Xóa dữ liệu transaction
- `clearModerationData()` - Xóa dữ liệu moderation
- `clearGameStats()` - Xóa dữ liệu game stats
- `clearFishPrices()` - Xóa dữ liệu giá cá
- `clearAllData()` - Xóa tất cả

### 4. Xem thống kê dữ liệu (`scripts/show-data-stats.ts`)
**Mục đích:** Hiển thị thống kê chi tiết về dữ liệu trong database.

**Cách sử dụng:**
```bash
npx tsx scripts/show-data-stats.ts
```

**Thông tin hiển thị:**
- 📊 Số lượng records trong từng bảng
- 🏠 Thông tin về guilds và users
- 👤 Thống kê user (tổng số, tổng balance, average daily streak)
- 🎣 Thống kê fishing (tổng cá câu được, tổng thu nhập, thời gian câu)
- 📈 Tổng số records trong database

## Lưu ý quan trọng

### ⚠️ Cảnh báo
- **Dữ liệu sẽ bị xóa vĩnh viễn** - Không thể khôi phục
- **Backup trước khi clear** nếu cần thiết
- **Kiểm tra kỹ** trước khi chạy script

### 🔒 Thứ tự xóa
Các script đã được thiết kế để xóa theo thứ tự đúng, tránh lỗi foreign key constraint:
1. Dữ liệu con (fish food, caught fish, rods, baits)
2. Dữ liệu trung gian (fishing data, transactions)
3. Dữ liệu chính (users, tournaments)

### 📊 Kết quả
Sau khi clear:
- Database sẽ trống sạch (nếu dùng `clear-all-data`)
- Chỉ còn lại schema và cấu trúc bảng
- Có thể bắt đầu lại từ đầu

## Ví dụ sử dụng

### Clear dữ liệu test sau khi test
```bash
# Sau khi chạy các test
npx tsx scripts/test-fishing-bigint.ts
npx tsx scripts/test-give-command.ts

# Clear dữ liệu test
npx tsx scripts/clear-test-data.ts
```

### Clear dữ liệu fishing để test lại
```typescript
import { clearFishingData } from './scripts/clear-specific-data';

// Clear chỉ dữ liệu fishing
await clearFishingData();
console.log('Fishing data cleared, ready for new test');
```

### Reset toàn bộ database
```bash
# Cẩn thận! Sẽ xóa tất cả dữ liệu
npx tsx scripts/clear-all-data.ts
```

## Troubleshooting

### Lỗi Foreign Key Constraint
Nếu gặp lỗi này, hãy chạy lại script. Các script đã được thiết kế để xóa theo thứ tự đúng.

### Lỗi Permission
Đảm bảo có quyền write vào database file.

### Lỗi Database Locked
Đóng tất cả connection đến database trước khi chạy script. 