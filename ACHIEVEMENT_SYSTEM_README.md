# 🏆 Hệ Thống Achievement (Danh Hiệu)

## 📋 Tổng Quan

Hệ thống Achievement cho phép quản trị viên tạo và quản lý các danh hiệu cho người chơi. Mỗi achievement có thể được gán cho một user cụ thể và phân loại theo các loại khác nhau.

## 🗄️ Database Schema

### Bảng `Achievement`

```sql
model Achievement {
  id        String   @id @default(cuid())
  name      String   // Tên danh hiệu
  link      String   // Link ảnh danh hiệu
  target    String   // user_id sẽ được nhận danh hiệu
  type      Int      // Loại danh hiệu (0-3)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([target])
  @@index([type])
}
```

### Các Trường Dữ Liệu

| Trường | Kiểu | Mô Tả |
|--------|------|-------|
| `id` | String | ID tự động tạo (cuid) |
| `name` | String | Tên danh hiệu |
| `link` | String | Link ảnh danh hiệu |
| `target` | String | User ID sẽ được nhận danh hiệu |
| `type` | Int | Loại danh hiệu (0-3) |
| `createdAt` | DateTime | Thời gian tạo |
| `updatedAt` | DateTime | Thời gian cập nhật |

### Loại Achievement (type)

| Type | Tên | Mô Tả |
|------|-----|-------|
| 0 | Top câu cá | Danh hiệu cho người câu cá giỏi nhất |
| 1 | Top FishCoin | Danh hiệu cho người có nhiều FishCoin nhất |
| 2 | Top FishBattle | Danh hiệu cho người đấu cá giỏi nhất |
| 3 | Top Custom | Danh hiệu tùy chỉnh |

## 🎮 Discord Commands

### Command Chính: `n.achievement-import`

#### Cách Sử Dụng:
```bash
n.achievement-import [subcommand] [args]
```

#### Subcommands:

##### 1. `help` - Xem hướng dẫn
```bash
n.achievement-import help
```

##### 2. `add` - Thêm achievement
```bash
n.achievement-import add <name> <link> <target_user_id> <type>
```

**Ví dụ:**
```bash
n.achievement-import add "Top Fisher" "https://example.com/badge.png" "123456789" 0
```

##### 3. `list` - Xem danh sách
```bash
n.achievement-import list
```

##### 4. `delete` - Xóa achievement
```bash
n.achievement-import delete <achievement_id>
```

##### 5. `clear` - Xóa tất cả
```bash
n.achievement-import clear
```

##### 6. `form` - Mở form import
```bash
n.achievement-import form
```

## 🖥️ Giao Diện Form

### Form Import Achievement

Khi sử dụng `n.achievement-import form`, sẽ hiển thị giao diện với các nút:

- **➕ Thêm Achievement**: Mở modal form để thêm achievement
- **📊 Danh Sách**: Xem tất cả achievement hiện có
- **⚙️ Quản Lý**: Hướng dẫn quản lý achievement
- **❓ Hướng Dẫn**: Xem hướng dẫn chi tiết
- **❌ Đóng**: Đóng form

### Modal Form Thêm Achievement

Khi nhấn "Thêm Achievement", sẽ mở modal với các trường:

1. **Tên Achievement**: Tên danh hiệu (tối đa 100 ký tự)
2. **Link Ảnh**: URL ảnh danh hiệu (tối đa 500 ký tự)
3. **User ID (Target)**: ID của user sẽ nhận danh hiệu (tối đa 20 ký tự)
4. **Loại (0-3)**: Loại danh hiệu (0: Top câu cá, 1: Top FishCoin, 2: Top FishBattle, 3: Top Custom)

## 🔧 Quyền Truy Cập

- **Chỉ Admin**: Chỉ user có quyền Administrator mới có thể sử dụng
- **Kiểm tra quyền**: Sử dụng `FishBattleService.isAdministrator()`
- **Bảo mật**: Tất cả operations đều được kiểm tra quyền

## 📊 Ví Dụ Sử Dụng

### 1. Tạo Achievement Cho Top Fisher
```bash
n.achievement-import add "Top Fisher Master" "https://example.com/fisher-badge.png" "389957152153796608" 0
```

### 2. Tạo Achievement Cho Top FishCoin
```bash
n.achievement-import add "FishCoin Millionaire" "https://example.com/coin-badge.png" "389957152153796608" 1
```

### 3. Tạo Achievement Cho Top Battle
```bash
n.achievement-import add "Battle Champion" "https://example.com/battle-badge.png" "389957152153796608" 2
```

### 4. Tạo Achievement Custom
```bash
n.achievement-import add "Custom Legend" "https://example.com/custom-badge.png" "389957152153796608" 3
```

## 🧪 Testing

### Test Database
```bash
npx tsx scripts/test-achievement-system.ts
```

### Test Commands
```bash
# Test form
n.achievement-import form

# Test add
n.achievement-import add "Test Achievement" "https://test.com/badge.png" "123456789" 0

# Test list
n.achievement-import list

# Test help
n.achievement-import help
```

## 📁 Files Đã Tạo

### 1. Database Schema
- `prisma/schema.prisma` - Thêm model Achievement

### 2. Discord Commands
- `src/commands/text/admin/achievement-import.ts` - Command chính

### 3. UI Components
- `src/components/MessageComponent/AchievementImportHandler.ts` - Handler cho interactions

### 4. Event Handlers
- `src/events/interactionCreate.ts` - Thêm handler cho achievement interactions

### 5. Test Scripts
- `scripts/test-achievement-system.ts` - Test database operations

## 🎯 Tính Năng

### ✅ Đã Hoàn Thành:
- [x] Database schema với indexes
- [x] Discord command với subcommands
- [x] Form interface với buttons
- [x] Modal form để thêm achievement
- [x] CRUD operations (Create, Read, Update, Delete)
- [x] Admin permission checks
- [x] Error handling
- [x] Test scripts
- [x] Documentation

### 🔄 Có Thể Mở Rộng:
- [ ] Bulk import từ CSV/JSON
- [ ] Achievement templates
- [ ] Achievement categories
- [ ] Achievement requirements
- [ ] Achievement rewards
- [ ] Achievement display system
- [ ] Achievement statistics

## 🚀 Cách Sử Dụng Nhanh

### 1. Tạo Achievement Đầu Tiên
```bash
n.achievement-import form
```
Sau đó nhấn "➕ Thêm Achievement" và điền form.

### 2. Xem Danh Sách
```bash
n.achievement-import list
```

### 3. Xóa Achievement
```bash
n.achievement-import delete <achievement_id>
```

### 4. Xem Hướng Dẫn
```bash
n.achievement-import help
```

## 💡 Lưu Ý Quan Trọng

1. **Quyền Admin**: Chỉ admin mới có thể sử dụng
2. **User ID**: Cần user ID chính xác (có thể lấy bằng cách mention user)
3. **Link Ảnh**: Nên sử dụng link ảnh có thể truy cập được
4. **Type**: Chỉ chấp nhận giá trị 0-3
5. **Backup**: Nên backup trước khi xóa tất cả achievement

## 🎉 Kết Luận

Hệ thống Achievement đã được tạo hoàn chỉnh với:
- ✅ Database schema đầy đủ
- ✅ Discord commands dễ sử dụng
- ✅ Giao diện form thân thiện
- ✅ Bảo mật và quyền truy cập
- ✅ Test scripts đầy đủ
- ✅ Documentation chi tiết

Bây giờ bạn có thể dễ dàng quản lý danh hiệu cho người chơi trong hệ thống! 🏆 