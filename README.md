# Aninhi Discord Bot

Một Discord bot với hệ thống economy và moderation hoàn chỉnh, sử dụng SQLite database với Prisma ORM.

## 🚀 Tính năng

### 💰 Economy System
- **Daily Rewards**: Nhận thưởng hàng ngày với streak bonus
- **Balance Management**: Quản lý số dư và giao dịch
- **Money Transfer**: Chuyển tiền giữa người dùng
- **Leaderboard**: Bảng xếp hạng người giàu nhất

### 🎮 Game System
- **Blackjack**: Chơi blackjack với bot
- **Coinflip**: Đoán mặt đồng xu
- **Slots**: Máy đánh bạc với nhiều tỷ lệ thắng
- **Roulette**: Roulette với nhiều loại cược
- **Fishing**: Hệ thống câu cá với cần câu và mồi
- **Tournament**: Tạo và tham gia giải đấu

### 🛡️ Moderation System
- **Ban/Unban**: Cấm và bỏ cấm người dùng
- **Banlist**: Xem danh sách người bị cấm
- **Temporary/Permanent Bans**: Hỗ trợ cấm tạm thời và vĩnh viễn

## 🗄️ Database Schema

Bot sử dụng SQLite với các bảng chính:

- **User**: Thông tin người dùng và số dư
- **Transaction**: Lịch sử giao dịch
- **DailyClaim**: Lịch sử nhận daily
- **GameStats**: Thống kê game
- **FishingData**: Dữ liệu câu cá
- **Tournament**: Thông tin giải đấu
- **BanRecord**: Lịch sử cấm

## 📦 Cài đặt

### Yêu cầu
- Node.js 18+
- Yarn hoặc npm

### Bước 1: Clone repository
```bash
git clone <repository-url>
cd aninhi
```

### Bước 2: Cài đặt dependencies
```bash
yarn install
```

### Bước 3: Cấu hình môi trường
```bash
# Tạo file .env trong thư mục env/
cp env/.env.example env/.env

# Cấu hình các biến môi trường
DATABASE_URL="file:../data/database.db"
DISCORD_TOKEN="your-discord-token"
DISCORD_CLIENT_ID="your-client-id"
```

### Bước 4: Khởi tạo database
```bash
# Tạo migration và áp dụng
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### Bước 5: Chạy bot
```bash
# Development
yarn dev

# Production
yarn build
yarn start
```

## 🎯 Lệnh sử dụng

### Economy Commands
- `n.daily` - Nhận thưởng hàng ngày
- `n.balance` - Xem số dư
- `n.give <user> <amount>` - Chuyển tiền
- `n.leaderboard` - Bảng xếp hạng

### Game Commands
- `n.blackjack <bet>` - Chơi blackjack
- `n.coinflip [head/tail] [amount]` - Đoán mặt đồng xu
- `n.slots [amount]` - Chơi slots
- `n.roulette <bet_type> <amount>` - Chơi roulette
- `n.fishing` - Câu cá
- `n.fishing shop` - Cửa hàng câu cá
- `n.fishing buy <item> [quantity]` - Mua vật phẩm
- `n.fishing sell <fish> [quantity]` - Bán cá
- `n.tournament create_<name>_<desc>_<fee>_<prize>_<max>_<time>` - Tạo giải đấu
- `n.tournament join <id>` - Tham gia giải đấu
- `n.tournament list` - Danh sách giải đấu

### Moderation Commands
- `n.ban <user> <reason>` - Cấm người dùng
- `n.unban <user>` - Bỏ cấm người dùng
- `n.banlist` - Xem danh sách cấm

## 🛠️ Development

### Database Management
```bash
# Xem database với Prisma Studio
npx prisma studio

# Tạo migration mới
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset
```

### Testing
```bash
# Chạy test script
yarn test:commands
```

### Code Structure
```
src/
├── commands/          # Lệnh bot
│   ├── slash/        # Slash commands
│   └── text/         # Text commands
│       ├── ecommerce/ # Economy & game commands
│       └── moderation/ # Moderation commands
├── utils/            # Utilities & services
│   ├── ecommerce-db.ts  # Economy database service
│   ├── gameStats.ts     # Game statistics service
│   ├── fishing.ts       # Fishing system service
│   └── tournament.ts    # Tournament service
├── classes/          # Bot classes
└── events/           # Event handlers
```

## 🔧 Cấu hình

### Game Settings
- **Max Bet**: 300,000 AniCoin
- **Fishing Cooldown**: 30 giây
- **Daily Cooldown**: 24 giờ
- **Tournament Auto-end**: Tự động kết thúc sau thời gian đăng ký

### Fishing System
- **Cần câu**: 5 loại (basic, copper, silver, gold, diamond)
- **Mồi**: 4 loại (basic, good, premium, divine)
- **Cá**: 16 loại với 4 độ hiếm (common, rare, epic, legendary)

### Roulette Bets
- **Số cụ thể**: 35:1
- **Màu (đỏ/đen)**: 1:1
- **Chẵn/lẻ**: 1:1
- **Thấp/cao**: 1:1
- **Cột**: 2:1
- **Hàng**: 2:1

## 📊 Thống kê

Bot tự động ghi lại:
- Lịch sử giao dịch
- Thống kê game (số lần chơi, thắng/thua, tiền cược)
- Dữ liệu câu cá (cá bắt được, cần câu, mồi)
- Lịch sử giải đấu
- Lịch sử cấm

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🆘 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra logs
2. Xem database với Prisma Studio
3. Tạo issue với thông tin chi tiết

---

**Lưu ý**: Bot đã được chuyển đổi hoàn toàn từ JSON sang SQLite database để cải thiện hiệu suất và tính nhất quán của dữ liệu. 