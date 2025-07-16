# Docker Setup cho AniHi Discord Bot

## Yêu cầu
- Docker
- Docker Compose
- Bot Token từ Discord Developer Portal

## Cài đặt

### 1. Tạo file .env
```bash
# Tạo file .env trong thư mục gốc
echo "BOT_TOKEN=your_discord_bot_token_here" > .env
```

### 2. Build và chạy Production
```bash
# Build và chạy bot
docker-compose up -d

# Xem logs
docker-compose logs -f discord-bot

# Dừng bot
docker-compose down
```

### 3. Development Mode
```bash
# Chạy trong development mode với hot reload
docker-compose -f docker-compose.dev.yml up -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f discord-bot-dev

# Dừng
docker-compose -f docker-compose.dev.yml down
```

## Quản lý

### Xem trạng thái
```bash
# Kiểm tra container đang chạy
docker-compose ps

# Xem logs real-time
docker-compose logs -f
```

### Restart bot
```bash
# Restart bot
docker-compose restart discord-bot

# Hoặc rebuild và restart
docker-compose up -d --build
```

### Backup dữ liệu
```bash
# Tạo backup
docker-compose --profile backup run --rm backup

# Backup sẽ được lưu trong thư mục ./backups/
```

### Cập nhật bot
```bash
# Pull code mới
git pull

# Rebuild và restart
docker-compose up -d --build
```

## Cấu trúc thư mục
```
aninhi/
├── data/           # Dữ liệu bot (bans.json, etc.)
├── logs/           # Log files
├── backups/        # Backup files
├── .env            # Environment variables
├── Dockerfile      # Docker configuration
├── docker-compose.yml          # Production compose
├── docker-compose.dev.yml      # Development compose
└── .dockerignore   # Files to exclude from build
```

## Troubleshooting

### Bot không kết nối
```bash
# Kiểm tra logs
docker-compose logs discord-bot

# Kiểm tra BOT_TOKEN
docker-compose exec discord-bot env | grep BOT_TOKEN
```

### Permission issues
```bash
# Fix permissions cho thư mục data
sudo chown -R 1000:1000 data/
```

### Container không start
```bash
# Xem logs chi tiết
docker-compose logs discord-bot

# Rebuild từ đầu
docker-compose down
docker system prune -f
docker-compose up -d --build
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `BOT_TOKEN` | Discord Bot Token | Yes |
| `NODE_ENV` | Environment (production/development) | No |
| `DEBUG` | Debug level | No |

## Volumes

- `./data:/app/data` - Dữ liệu bot (bans, tournaments, etc.)
- `./logs:/app/logs` - Log files
- `./backups:/backups` - Backup files

## Networks

- `bot-network` - Network cho production
- `bot-network-dev` - Network cho development

## Health Check

Bot có health check tự động mỗi 30 giây. Nếu bot không phản hồi, container sẽ được restart.

## Monitoring

```bash
# Xem resource usage
docker stats aninhi-discord-bot

# Xem container info
docker inspect aninhi-discord-bot

# Pull image
docker pull node:18-alpine

# Khởi tạo/migrate database
docker compose up -d database-init
``` 