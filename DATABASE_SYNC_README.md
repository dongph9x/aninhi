# 🔄 Database Synchronization Guide

Hướng dẫn đồng bộ database giữa Docker container và host machine để đảm bảo dữ liệu chính xác.

## 🚨 Vấn đề thường gặp

Khi số liệu `n.balance` không khớp với Prisma Studio, nguyên nhân thường là:
- Database trong container khác với database trên host
- Prisma Studio đọc từ database cũ
- Volume mount không đồng bộ

## 🔧 Giải pháp

### Bước 1: Sync database từ container về host

```bash
# Sync database từ container về host
npm run db:sync:container

# Hoặc chạy trực tiếp
./scripts/sync-database-from-container.sh
```

### Bước 2: Mở Prisma Studio với database đúng

```bash
# Mở Prisma Studio với database đã sync
npm run db:studio:correct

# Hoặc chạy trực tiếp
./scripts/start-prisma-studio-correct.sh
```

### Bước 3: Truy cập Prisma Studio

- **URL**: http://localhost:5555
- **Database**: `./prisma/data/database.db` (đã sync từ container)

## 📊 Scripts có sẵn

### Sync Scripts:
- `npm run db:sync` - Sync từ host sang Prisma (cũ)
- `npm run db:sync:container` - Sync từ container về host (khuyến nghị)

### Studio Scripts:
- `npm run db:studio` - Prisma Studio mặc định
- `npm run db:studio:host` - Prisma Studio từ host
- `npm run db:studio:correct` - Prisma Studio với database đúng (khuyến nghị)

## 🔍 Kiểm tra database

### Kiểm tra balance của user cụ thể:
```bash
# Kiểm tra database host
sqlite3 data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';"

# Kiểm tra database Prisma
sqlite3 prisma/data/database.db "SELECT balance FROM User WHERE userId = '389957152153796608';"
```

### Kiểm tra số lượng users:
```bash
# Đếm users trong database
sqlite3 data/database.db "SELECT COUNT(*) FROM User;"
```

## 🐳 Docker Commands

### Copy database từ container:
```bash
# Copy database từ container về host
docker cp aninhi-discord-bot:/app/data/database.db ./data/database.db

# Copy database từ container sang Prisma
docker cp aninhi-discord-bot:/app/data/database.db ./prisma/data/database.db
```

### Kiểm tra container:
```bash
# Xem container đang chạy
docker ps

# Xem logs container
docker logs aninhi-discord-bot
```

## 📁 Cấu trúc database files

```
aninhi/
├── data/
│   ├── database.db                    # Database chính (từ container)
│   ├── database.db.backup-*           # Backup files
│   └── backup/                        # Backup có tổ chức
├── prisma/
│   └── data/
│       └── database.db                # Database cho Prisma Studio
└── scripts/
    ├── sync-database.sh               # Sync cũ
    ├── sync-database-from-container.sh # Sync mới (khuyến nghị)
    ├── start-prisma-studio.sh         # Studio cũ
    └── start-prisma-studio-correct.sh # Studio mới (khuyến nghị)
```

## ⚠️ Lưu ý quan trọng

1. **Luôn sync trước khi xem Prisma Studio**
2. **Database trong container là nguồn chính xác**
3. **Backup tự động được tạo khi sync**
4. **Kiểm tra balance trước và sau khi sync**

## 🎯 Workflow khuyến nghị

```bash
# 1. Sync database từ container
npm run db:sync:container

# 2. Mở Prisma Studio
npm run db:studio:correct

# 3. Mở browser: http://localhost:5555

# 4. Kiểm tra dữ liệu trong Prisma Studio
```

## 🔧 Troubleshooting

### Database không sync:
```bash
# Kiểm tra container có chạy không
docker ps | grep aninhi-discord-bot

# Restart container nếu cần
docker compose restart
```

### Prisma Studio không mở:
```bash
# Kiểm tra port 5555
lsof -i :5555

# Kill process nếu cần
kill -9 <PID>
```

### DATABASE_URL không đúng:
```bash
# Set DATABASE_URL thủ công
export DATABASE_URL="file:./prisma/data/database.db"
npx prisma studio
``` 