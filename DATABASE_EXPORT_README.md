# 📤 Database Export Guide

Hướng dẫn export database trực tiếp từ cache/Prisma database mà bot đang sử dụng.

## 🚀 Cách 1: Export nhanh

### Sử dụng script:
```bash
# Export nhanh từ cache
npm run db:export

# Hoặc chạy trực tiếp
./scripts/export-database-from-cache.sh
```

**Kết quả:**
- Export Prisma database (database thực tế)
- Export data database (để so sánh)
- Tạo file info với thông tin balance
- Lưu trong thư mục `./exports/`

## 🚀 Cách 2: Export chi tiết

### Sử dụng script:
```bash
# Export chi tiết với report
npm run db:export:detailed

# Hoặc chạy trực tiếp
./scripts/export-database-detailed.sh
```

**Kết quả:**
- Export cả hai database
- Export Prisma schema và package.json
- Tạo report chi tiết
- Tạo script restore tự động
- Lưu trong thư mục `./exports/export-YYYYMMDD-HHMMSS/`

## 🚀 Cách 3: Export thủ công

### Export Prisma database (khuyến nghị):
```bash
# Copy từ container
docker cp aninhi-discord-bot:/app/prisma/data/database.db ./exports/prisma-database-$(date +%Y%m%d-%H%M%S).db
```

### Export data database:
```bash
# Copy từ container
docker cp aninhi-discord-bot:/app/data/database.db ./exports/data-database-$(date +%Y%m%d-%H%M%S).db
```

### Export Prisma cache info:
```bash
# Copy schema
docker cp aninhi-discord-bot:/app/node_modules/.prisma/client/schema.prisma ./exports/prisma-schema.prisma

# Copy package.json
docker cp aninhi-discord-bot:/app/node_modules/.prisma/client/package.json ./exports/prisma-package.json
```

## 📊 So sánh Database

### Kiểm tra balance:
```bash
# Kiểm tra Prisma database
sqlite3 ./exports/prisma-database-*.db "SELECT balance FROM User WHERE userId = '389957152153796608';"

# Kiểm tra data database
sqlite3 ./exports/data-database-*.db "SELECT balance FROM User WHERE userId = '389957152153796608';"
```

### Kiểm tra số lượng users:
```bash
# Đếm users trong Prisma database
sqlite3 ./exports/prisma-database-*.db "SELECT COUNT(*) FROM User;"

# Đếm users trong data database
sqlite3 ./exports/data-database-*.db "SELECT COUNT(*) FROM User;"
```

## 🔄 Restore từ Export

### Sử dụng script restore (nếu có):
```bash
cd ./exports/export-YYYYMMDD-HHMMSS/
./restore.sh
```

### Restore thủ công:
```bash
# Backup database hiện tại
cp ./data/database.db ./data/database.db.backup-$(date +%s)
cp ./prisma/data/database.db ./data/prisma-database.db.backup-$(date +%s)

# Restore từ export
cp ./exports/prisma-database-*.db ./data/database.db
cp ./exports/prisma-database-*.db ./prisma/data/database.db

# Restart bot
docker compose down && docker compose up -d --build
```

## 📁 Cấu trúc Export

### Export nhanh:
```
exports/
├── database-export-20250717-143000.db    # Prisma database
├── data-database-20250717-143000.db      # Data database
└── export-info-20250717-143000.txt       # Thông tin export
```

### Export chi tiết:
```
exports/
└── export-20250717-143000/
    ├── prisma-database.db                 # Database chính
    ├── data-database.db                   # Database phụ
    ├── prisma-schema.prisma               # Prisma schema
    ├── prisma-package.json                # Prisma client info
    ├── export-report.txt                  # Report chi tiết
    └── restore.sh                         # Script restore
```

## 🎯 Workflow khuyến nghị

### 1. Export database:
```bash
# Export chi tiết
npm run db:export:detailed
```

### 2. Kiểm tra export:
```bash
# Xem report
cat ./exports/export-*/export-report.txt

# Kiểm tra balance
sqlite3 ./exports/export-*/prisma-database.db "SELECT balance FROM User WHERE userId = '389957152153796608';"
```

### 3. Restore (nếu cần):
```bash
# Sử dụng script restore
cd ./exports/export-*/
./restore.sh
```

## ⚠️ Lưu ý quan trọng

1. **Prisma database là nguồn chính xác** - bot đang đọc từ đây
2. **Data database có thể cũ** - do volume mount issues
3. **Luôn backup trước khi restore**
4. **Restart bot sau khi restore** để đồng bộ cache

## 🔍 Troubleshooting

### Container không chạy:
```bash
# Start container
docker compose up -d

# Kiểm tra status
docker ps
```

### Export thất bại:
```bash
# Kiểm tra quyền
ls -la ./exports/

# Tạo thư mục
mkdir -p ./exports
```

### Database không khớp:
```bash
# Sync database
npm run db:sync:prisma

# Kiểm tra lại
./scripts/check-balance.sh
```

## 📊 Ví dụ Output

### Export nhanh:
```
📤 Exporting database from Prisma cache...

📋 Copying Prisma database from container...
📋 Copying data database from container...

📊 Exported files:
-rw-r--r--  1 user  staff  450560 Jul 17 14:30 exports/database-export-20250717-143000.db
-rw-r--r--  1 user  staff  450560 Jul 17 14:30 exports/data-database-20250717-143000.db

💰 Balance verification from exported database:
Prisma database balance: 1059399
Data database balance: 959399

✅ Database export completed!
📁 Location: ./exports/
```

### Export chi tiết:
```
📤 Detailed Database Export from Cache...

📁 Export directory: ./exports/export-20250717-143000
📋 Copying databases from container...
📋 Copying Prisma cache information...
🔍 Analyzing databases...
📝 Creating detailed report...
📝 Creating restore script...

✅ Detailed export completed!
📁 Export directory: ./exports/export-20250717-143000

📊 Summary:
  Prisma DB: 440K, 13 users, balance: 1059399
  Data DB: 440K, 13 users, balance: 959399

📄 Files created:
-rw-r--r--  1 user  staff  450560 Jul 17 14:30 prisma-database.db
-rw-r--r--  1 user  staff  450560 Jul 17 14:30 data-database.db
-rw-r--r--  1 user  staff     580 Jul 17 14:30 prisma-schema.prisma
-rw-r--r--  1 user  staff    4326 Jul 17 14:30 prisma-package.json
-rw-r--r--  1 user  staff    1024 Jul 17 14:30 export-report.txt
-rwxr-xr-x  1 user  staff     512 Jul 17 14:30 restore.sh

🚀 To restore: cd ./exports/export-20250717-143000 && ./restore.sh
``` 