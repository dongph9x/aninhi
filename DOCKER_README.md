# 🐳 Docker Setup cho Aninhi Discord Bot

## 📋 Yêu cầu
- Docker 20.10+
- Docker Compose 2.0+
- Discord Bot Token từ Discord Developer Portal
- Discord Client ID từ Discord Developer Portal

## 🚀 Quick Start

### 1. **Clone và Setup**
```bash
# Clone repository
git clone <repository-url>
cd aninhi

# Tạo file .env (optional - có thể mount file .env từ host)
cat > .env << EOF
DATABASE_URL=file:./data/database.db
NODE_ENV=production
EOF
```

### 2. **Chạy Production**
```bash
# Khởi tạo database và chạy bot
docker-compose --profile init up -d

# Hoặc chạy từng bước
docker-compose up -d database-init
docker-compose up -d aninhi-bot
```

### 3. **Development Mode**
```bash
# Chạy development với hot reload
docker-compose -f docker-compose.dev.yml --profile init up -d

# Xem logs
docker-compose -f docker-compose.dev.yml logs -f aninhi-bot-dev
```

## 🔧 Quản lý Container

### **Xem trạng thái**
```bash
# Production
docker-compose ps

# Development
docker-compose -f docker-compose.dev.yml ps
```

### **Xem logs**
```bash
# Production logs
docker-compose logs -f aninhi-bot

# Development logs
docker-compose -f docker-compose.dev.yml logs -f aninhi-bot-dev
```

### **Restart bot**
```bash
# Production
docker-compose restart aninhi-bot

# Development
docker-compose -f docker-compose.dev.yml restart aninhi-bot-dev
```

### **Rebuild và restart**
```bash
# Production
docker-compose up -d --build

# Development
docker-compose -f docker-compose.dev.yml up -d --build
```

## 🗄️ Database Management

### **Truy cập database**
```bash
# Vào container production
docker-compose exec aninhi-bot sh

# Vào container development
docker-compose -f docker-compose.dev.yml exec aninhi-bot-dev sh
```

### **Prisma commands trong container**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio

# Reset database
npx prisma migrate reset
```

### **Backup database**
```bash
# Backup từ production
docker-compose exec aninhi-bot cp /app/data/database.db /app/data/backup-$(date +%Y%m%d-%H%M%S).db

# Copy backup ra host
docker cp aninhi-discord-bot:/app/data/backup-*.db ./backup/
```

## 🔄 Update Bot

### **Update code**
```bash
# Pull code mới
git pull

# Rebuild và restart
docker-compose up -d --build

# Hoặc chỉ restart nếu không có thay đổi code
docker-compose restart aninhi-bot
```

### **Update dependencies**
```bash
# Rebuild image với dependencies mới
docker-compose build --no-cache
docker-compose up -d
```

## 🛠️ Troubleshooting

### **Bot không kết nối**
```bash
# Kiểm tra logs
docker-compose logs aninhi-bot

# Kiểm tra file .env trong container
docker-compose exec aninhi-bot cat /app/.env

# Kiểm tra Discord token
docker-compose exec aninhi-bot node -e "console.log(process.env.DISCORD_TOKEN ? 'Token exists' : 'Token missing')"
```

### **Database issues**
```bash
# Reset database
docker-compose exec aninhi-bot npx prisma migrate reset

# Force push schema
docker-compose exec aninhi-bot npx prisma db push --force-reset

# Check database status
docker-compose exec aninhi-bot npx prisma db pull
```

### **Permission issues**
```bash
# Fix permissions cho thư mục data
sudo chown -R 1000:1000 data/
sudo chmod -R 755 data/

# Fix permissions cho logs
sudo chown -R 1000:1000 logs/
sudo chmod -R 755 logs/
```

### **Container không start**
```bash
# Xem logs chi tiết
docker-compose logs aninhi-bot

# Rebuild từ đầu
docker-compose down
docker system prune -f
docker-compose up -d --build
```

### **Port conflicts**
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :3000

# Thay đổi port trong docker-compose.yml
# ports:
#   - "3001:3000"  # Thay đổi từ 3000 thành 3001
```

## 📊 Monitoring

### **Resource usage**
```bash
# Xem resource usage
docker stats aninhi-discord-bot

# Xem container info
docker inspect aninhi-discord-bot
```

### **Health check**
```bash
# Kiểm tra health status
docker-compose ps

# Xem health check logs
docker inspect aninhi-discord-bot | grep -A 10 "Health"
```

## 🔐 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | Database connection string | ❌ No | `file:./data/database.db` |
| `NODE_ENV` | Environment mode | ❌ No | `production` |
| `DEBUG` | Debug level | ❌ No | - |

**Lưu ý**: `DISCORD_TOKEN` và `DISCORD_CLIENT_ID` sẽ được đọc từ file `.env` được mount vào container.

## 📁 Volumes

| Volume | Description | Purpose |
|--------|-------------|---------|
| `./data:/app/data` | Database files | Persistent storage |
| `./logs:/app/logs` | Log files | Logging |
| `.:/app` | Source code | Development hot reload |

## 🌐 Networks

| Network | Description | Usage |
|---------|-------------|-------|
| `aninhi-network` | Production network | Production containers |
| `aninhi-network-dev` | Development network | Development containers |

## 🏗️ Build Process

### **Production Build**
1. Copy package files
2. Install dependencies
3. Copy source code
4. Generate Prisma client
5. Create data/logs directories
6. Set permissions
7. Run health check
8. Start bot

### **Development Build**
1. Same as production
2. Mount source code for hot reload
3. Run in development mode
4. Enable debug logging

## 🚨 Security Notes

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use secrets management** for production tokens
3. **Regular backups** of database
4. **Monitor logs** for suspicious activity
5. **Update dependencies** regularly

## 📝 Logs

### **Log locations**
- **Container logs**: `docker-compose logs`
- **Application logs**: `./logs/` (mounted volume)
- **Database logs**: Inside container `/app/data/`

### **Log levels**
- **Production**: Error, Warn, Info
- **Development**: Debug, Error, Warn, Info

## 🔄 CI/CD Integration

### **GitHub Actions example**
```yaml
name: Deploy Bot
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to server
        run: |
          docker-compose pull
          docker-compose up -d --build
```

---

**Lưu ý**: Đảm bảo Discord Bot có đủ permissions trong server và được invite với scope phù hợp. 