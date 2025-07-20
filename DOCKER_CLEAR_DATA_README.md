# Clear Data trong Docker

## Tóm tắt
Hướng dẫn cách clear dữ liệu khi chạy dự án bằng Docker.

## Các script có sẵn

### 1. Clear tất cả dữ liệu (`scripts/docker-clear-all.sh`)
**Mục đích:** Xóa toàn bộ dữ liệu trong Docker container.

**Cách sử dụng:**
```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x scripts/docker-clear-all.sh

# Chạy script
./scripts/docker-clear-all.sh
```

**Hoặc chạy trực tiếp:**
```bash
docker exec aninhi-app npx tsx scripts/clear-all-data.ts
```

### 2. Clear dữ liệu test (`scripts/docker-clear-test.sh`)
**Mục đích:** Chỉ xóa dữ liệu test trong Docker container.

**Cách sử dụng:**
```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x scripts/docker-clear-test.sh

# Chạy script
./scripts/docker-clear-test.sh
```

**Hoặc chạy trực tiếp:**
```bash
docker exec aninhi-app npx tsx scripts/clear-test-data.ts
```

### 3. Xem thống kê dữ liệu (`scripts/docker-stats.sh`)
**Mục đích:** Xem thống kê dữ liệu trong Docker container.

**Cách sử dụng:**
```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x scripts/docker-stats.sh

# Chạy script
./scripts/docker-stats.sh
```

**Hoặc chạy trực tiếp:**
```bash
docker exec aninhi-app npx tsx scripts/show-data-stats.ts
```

### 4. Menu tương tác (`scripts/clear-data-docker.sh`)
**Mục đích:** Menu tương tác để chọn loại dữ liệu cần clear.

**Cách sử dụng:**
```bash
# Cấp quyền thực thi (chỉ cần làm 1 lần)
chmod +x scripts/clear-data-docker.sh

# Chạy script
./scripts/clear-data-docker.sh
```

## Cách sử dụng nhanh

### Bước 1: Cấp quyền thực thi
```bash
chmod +x scripts/docker-*.sh
chmod +x scripts/clear-data-docker.sh
```

### Bước 2: Chạy script
```bash
# Clear test data (an toàn)
./scripts/docker-clear-test.sh

# Xem thống kê
./scripts/docker-stats.sh

# Clear all data (nguy hiểm!)
./scripts/docker-clear-all.sh
```

## Lệnh Docker trực tiếp

### Kiểm tra container
```bash
# Xem danh sách container đang chạy
docker ps

# Xem logs của container
docker logs aninhi-app
```

### Chạy script trong container
```bash
# Clear all data
docker exec aninhi-app npx tsx scripts/clear-all-data.ts

# Clear test data
docker exec aninhi-app npx tsx scripts/clear-test-data.ts

# Show stats
docker exec aninhi-app npx tsx scripts/show-data-stats.ts
```

### Chạy lệnh tùy chỉnh
```bash
# Vào shell của container
docker exec -it aninhi-app /bin/bash

# Trong container, chạy:
npx tsx scripts/show-data-stats.ts
```

## Troubleshooting

### Lỗi "Container not running"
```bash
# Khởi động container
docker-compose up -d

# Hoặc
docker start aninhi-app
```

### Lỗi "Permission denied"
```bash
# Cấp quyền thực thi
chmod +x scripts/docker-*.sh
```

### Lỗi "Container name not found"
Kiểm tra tên container thực tế:
```bash
docker ps
```

Nếu tên khác `aninhi-app`, sửa trong script hoặc dùng lệnh trực tiếp:
```bash
docker exec <TÊN_CONTAINER_THỰC_TẾ> npx tsx scripts/clear-all-data.ts
```

### Lỗi "Database locked"
```bash
# Restart container
docker-compose restart

# Hoặc
docker restart aninhi-discord-bot
```

### Lỗi "Foreign key constraint violated"
```bash
# Script đã được sửa để xóa theo đúng thứ tự
# Nếu vẫn gặp lỗi, thử restart container trước:
docker restart aninhi-discord-bot

# Sau đó chạy lại script
./scripts/docker-run-script.sh clear-all-data
```

## Ví dụ sử dụng

### Clear test data sau khi test
```bash
# Chạy test
docker exec aninhi-app npx tsx scripts/test-fishing-bigint.ts

# Clear test data
./scripts/docker-clear-test.sh
```

### Kiểm tra dữ liệu trước khi clear
```bash
# Xem thống kê
./scripts/docker-stats.sh

# Clear nếu cần
./scripts/docker-clear-all.sh
```

### Reset toàn bộ database
```bash
# ⚠️ CẨN THẬN! Sẽ xóa tất cả dữ liệu
./scripts/docker-clear-all.sh
```

## Lưu ý quan trọng

### ⚠️ Cảnh báo
- **Dữ liệu sẽ bị xóa vĩnh viễn** trong container
- **Backup database** trước khi clear nếu cần
- **Kiểm tra kỹ** trước khi chạy script clear all
- **Script đã được sửa** để xóa theo đúng thứ tự foreign key constraints

### 🔧 Thứ tự thực hiện
1. Đảm bảo container đang chạy
2. Cấp quyền thực thi cho script
3. Chạy script theo nhu cầu
4. Kiểm tra kết quả

### 📊 Kết quả
Sau khi clear:
- Database trong container sẽ trống sạch
- Bot sẽ hoạt động như mới
- Có thể bắt đầu lại từ đầu 