# Database Migration Guide

Hướng dẫn chuyển đổi từ JSON sang SQLite Database với Prisma ORM.

## 🚀 Tổng Quan

Dự án đã được nâng cấp từ việc sử dụng file JSON sang SQLite database với Prisma ORM để:

- **Hiệu suất tốt hơn**: Truy vấn nhanh với dữ liệu lớn
- **Tính nhất quán**: ACID properties đảm bảo dữ liệu an toàn
- **Queries phức tạp**: JOIN, GROUP BY, subqueries
- **Concurrent access**: Nhiều người dùng cùng lúc
- **Backup và recovery**: Dễ dàng backup/restore

## 📋 Yêu Cầu

- Node.js 18+
- Yarn hoặc npm
- Bot token từ Discord Developer Portal

## 🛠️ Cài Đặt

### 1. Cài đặt dependencies

```bash
yarn add prisma @prisma/client
yarn add -D @types/node
```

### 2. Khởi tạo Prisma

```bash
npx prisma init
```

### 3. Tạo database và tables

```bash
# Generate Prisma client
yarn db:generate

# Tạo migration và apply
yarn db:migrate
```

### 4. Migrate dữ liệu từ JSON

```bash
# Tạo backup và migrate dữ liệu
yarn migrate:json
```

## 📊 Cấu Trúc Database

### Models

#### User
```sql
- id: String (Primary Key)
- userId: String (Discord User ID)
- guildId: String (Discord Guild ID)
- balance: Int
- dailyStreak: Int
- createdAt: DateTime
- updatedAt: DateTime
```

#### Transaction
```sql
- id: String (Primary Key)
- userId: String
- guildId: String
- amount: Int
- type: String
- description: String?
- createdAt: DateTime
```

#### DailyClaim
```sql
- id: String (Primary Key)
- userId: String
- guildId: String
- claimedAt: DateTime
```

#### SystemSettings
```sql
- id: String (Primary Key)
- key: String (Unique)
- value: String
- description: String?
- updatedAt: DateTime
```

#### BanRecord
```sql
- id: String (Primary Key)
- userId: String
- guildId: String
- moderatorId: String
- reason: String
- banAt: DateTime
- expiresAt: DateTime?
- type: String
- isActive: Boolean
```

## 🔧 Scripts

### Database Management

```bash
# Generate Prisma client
yarn db:generate

# Create and apply migrations
yarn db:migrate

# Open Prisma Studio (GUI)
yarn db:studio

# Reset database
yarn db:reset

# Migrate from JSON to database
yarn migrate:json
```

### Development

```bash
# Start development server
yarn dev

# Start with inspection
yarn dev:inspect

# Production start
yarn start
```

## 📝 Commands Mới

### Ecommerce Commands (Database Version)

- `!daily-db` - Nhận thưởng hàng ngày (database version)
- `!balance-db` - Xem số dư và lịch sử giao dịch
- `!transfer-db @user <amount>` - Chuyển tiền cho user khác

### So Sánh với JSON Version

| Feature | JSON Version | Database Version |
|---------|-------------|------------------|
| Daily Claim | `!daily` | `!daily-db` |
| Balance Check | `!balance` | `!balance-db` |
| Transfer Money | `!give` | `!transfer-db` |
| Data Storage | File-based | SQLite |
| Performance | Slow with large data | Fast queries |
| Concurrent Access | Limited | Full support |
| Backup | Manual | Automated |

## 🔄 Migration Process

### 1. Backup dữ liệu hiện tại

Script migration sẽ tự động tạo backup trong `data/backup/` với timestamp.

### 2. Migrate dữ liệu

```bash
yarn migrate:json
```

Quá trình này sẽ:
- Tạo backup JSON files
- Migrate users từ `ecommerce.json`
- Migrate daily claims
- Migrate system settings
- Migrate ban records từ `bans.json`
- Verify migration

### 3. Verify migration

Script sẽ hiển thị số lượng records đã migrate:
```
👥 Users in database: 5
📅 Daily claims in database: 12
⚙️  Settings in database: 4
🚫 Ban records in database: 2
```

## 🗄️ Database Services

### EcommerceDatabaseService

```typescript
import { ecommerceDB } from '@/utils/ecommerce-db';

// Lấy user
const user = await ecommerceDB.getUser(userId, guildId);

// Cập nhật balance
await ecommerceDB.updateBalance(userId, guildId, amount);

// Daily claim
const result = await ecommerceDB.processDailyClaim(userId, guildId);

// Transfer money
const result = await ecommerceDB.transferMoney(fromId, toId, guildId, amount);
```

### BanDatabaseService

```typescript
import { banDB } from '@/utils/ban-db';

// Tạo ban
await banDB.createBan(userId, guildId, moderatorId, reason, 'temporary', duration);

// Kiểm tra ban
const isBanned = await banDB.isUserBanned(userId, guildId);

// Unban
await banDB.unbanUser(userId, guildId);
```

## 🔍 Monitoring & Debugging

### Prisma Studio

```bash
yarn db:studio
```

Mở browser tại `http://localhost:5555` để xem và edit dữ liệu trực tiếp.

### Logs

Trong development mode, Prisma sẽ log tất cả queries với thời gian thực thi.

### Health Check

```typescript
import { databaseService } from '@/utils/database';

const isHealthy = await databaseService.healthCheck();
```

## 🚨 Troubleshooting

### Database Connection Failed

1. Kiểm tra DATABASE_URL trong environment
2. Đảm bảo thư mục `data/` có quyền write
3. Chạy `yarn db:generate` để regenerate client

### Migration Failed

1. Kiểm tra backup trong `data/backup/`
2. Restore từ backup nếu cần
3. Chạy `yarn db:reset` để reset database
4. Chạy lại `yarn migrate:json`

### Performance Issues

1. Kiểm tra indexes trong schema
2. Sử dụng Prisma Studio để analyze queries
3. Optimize queries với pagination

## 📈 Benefits

### Performance
- **JSON**: O(n) cho tìm kiếm
- **Database**: O(log n) với indexes

### Scalability
- **JSON**: Không hỗ trợ concurrent access
- **Database**: Full ACID compliance

### Features
- **JSON**: Limited querying
- **Database**: Complex queries, joins, aggregations

### Maintenance
- **JSON**: Manual backup/restore
- **Database**: Automated migrations, rollbacks

## 🔮 Future Enhancements

1. **PostgreSQL Migration**: Chuyển sang PostgreSQL cho production
2. **Redis Cache**: Thêm caching layer
3. **Analytics**: Dashboard với thống kê
4. **API**: REST API cho web interface
5. **Backup Automation**: Scheduled backups

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs trong console
2. Verify database connection
3. Check Prisma Studio
4. Review migration logs

---

**Lưu ý**: Sau khi migrate thành công, bạn có thể xóa các file JSON cũ hoặc giữ lại làm backup. 