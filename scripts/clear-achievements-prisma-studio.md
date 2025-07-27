# 🗑️ Xóa Achievement bằng Prisma Studio

## Cách sử dụng Prisma Studio:

### 1. Mở Prisma Studio:
```bash
npm run db:studio
```

### 2. Trong Prisma Studio:
1. Tìm bảng `Achievement`
2. Chọn tất cả records (Ctrl+A hoặc Cmd+A)
3. Nhấn Delete để xóa
4. Xác nhận xóa

### 3. Hoặc sử dụng SQL trực tiếp:
```sql
DELETE FROM Achievement;
```

## 🚀 Các cách xóa achievement:

### ✅ **Cách 1: Discord Command (Khuyến nghị)**
```bash
n.achievement-import clear
```

### ✅ **Cách 2: Script Database**
```bash
npx tsx scripts/clear-all-achievements.ts
```

### ✅ **Cách 3: Prisma Studio**
```bash
npm run db:studio
```

### ✅ **Cách 4: SQL trực tiếp**
```bash
# Mở database file
sqlite3 data/database.db

# Xóa tất cả achievement
DELETE FROM Achievement;

# Kiểm tra
SELECT COUNT(*) FROM Achievement;

# Thoát
.quit
```

## ⚠️ Lưu ý quan trọng:
- **Backup trước khi xóa**: Nên backup database trước khi xóa
- **Không thể hoàn tác**: Hành động xóa không thể hoàn tác
- **Admin permission**: Chỉ admin mới có thể sử dụng Discord command 