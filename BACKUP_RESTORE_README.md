# 💾 Backup & Restore Database

Hướng dẫn sử dụng các lệnh backup và restore database đã được cập nhật để sử dụng Prisma database thực tế.

## 🔄 Thay đổi quan trọng

### Trước đây:
- Backup từ: `data/database.db` (database cũ)
- Restore vào: `data/database.db` (database cũ)

### Bây giờ:
- Backup từ: `prisma/data/database.db` (database thực tế bot đang dùng)
- Restore vào: Cả `data/database.db` và `prisma/data/database.db`

## 📋 Lệnh Backup

### `n.backupdb`
Backup database từ Prisma database thực tế (database mà bot đang sử dụng).

**Tính năng:**
- ✅ Backup từ Prisma database (database thực tế)
- ✅ Fallback về data database nếu Prisma không tồn tại
- ✅ Hiển thị nguồn database được backup
- ✅ Gửi file qua Discord nếu < 8MB
- ✅ Lưu vào `data/backup/` nếu > 8MB

**Ví dụ output:**
```
✅ Đã backup database thành công!
📊 Nguồn: Prisma Database
📁 Kích thước: 440 KB
```

## 📋 Lệnh Restore

### `n.restoredb` hoặc `n.importdb`
Restore database từ file backup, cập nhật cả data và Prisma database.

**Tính năng:**
- ✅ Backup database hiện tại trước khi restore
- ✅ Restore vào cả data và Prisma database
- ✅ Hướng dẫn restart bot sau khi restore
- ✅ Kiểm tra định dạng file (.db)

**Ví dụ output:**
```
💾 Đã backup data database: database.db.backup-1752738000000
💾 Đã backup prisma database: prisma-database.db.backup-1752738000001

✅ Đã restore database thành công!

📁 File: database-backup.db
📊 Kích thước: 440 KB
🕐 Thời gian: 17/7/2025 14:30:00
🔄 Đã cập nhật: Data Database + Prisma Database

🚀 Bước tiếp theo:
1. `docker-compose down`
2. `docker-compose up -d --build`
3. `n.balance` để kiểm tra dữ liệu

💡 Lý do restart: Đảm bảo bot đọc database mới và đồng bộ cache
```

## 🔧 Scripts hỗ trợ

### Sync Database:
```bash
# Sync từ Prisma database (khuyến nghị)
npm run db:sync:prisma

# Sync từ data database (cũ)
npm run db:sync:container

# Sync đơn giản
npm run db:sync
```

### Check Balance:
```bash
# Kiểm tra balance từ nhiều nguồn
./scripts/check-balance.sh
```

### Check Prisma Cache:
```bash
# Kiểm tra Prisma cache và connection
./scripts/check-prisma-cache.sh
```

## 🎯 Workflow khuyến nghị

### 1. Backup Database:
```bash
# Trong Discord
n.backupdb
```

### 2. Restore Database:
```bash
# 1. Upload file backup (.db) lên Discord
# 2. Gõ lệnh
n.restoredb

# 3. Restart bot
docker compose down
docker compose up -d --build

# 4. Kiểm tra dữ liệu
n.balance
```

### 3. Sync Database (nếu cần):
```bash
# Sync từ Prisma database
npm run db:sync:prisma

# Mở Prisma Studio
npm run db:studio:correct
```

## ⚠️ Lưu ý quan trọng

1. **Luôn backup trước khi restore**
2. **Restart bot sau khi restore** để đồng bộ cache
3. **Kiểm tra dữ liệu** sau khi restore
4. **Prisma database là nguồn chính xác** bot đang sử dụng

## 🔍 Troubleshooting

### Backup không thành công:
```bash
# Kiểm tra database files
ls -la data/database.db
ls -la prisma/data/database.db

# Sync database
npm run db:sync:prisma
```

### Restore không thành công:
```bash
# Kiểm tra file backup
ls -la data/backup/

# Kiểm tra quyền file
chmod 644 data/database.db
chmod 644 prisma/data/database.db
```

### Bot không đọc database mới:
```bash
# Restart hoàn toàn
docker compose down
docker compose up -d --build

# Hoặc reset Prisma cache
./scripts/reset-prisma-cache.sh
```

## 📊 Database Files

```
aninhi/
├── data/
│   ├── database.db                    # Data database
│   ├── database.db.backup-*           # Backup files
│   └── backup/                        # Backup có tổ chức
├── prisma/
│   └── data/
│       └── database.db                # Prisma database (thực tế)
└── scripts/
    ├── sync-prisma-database.sh        # Sync từ Prisma
    ├── check-balance.sh               # Check balance
    └── check-prisma-cache.sh          # Check cache
``` 