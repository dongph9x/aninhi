# 💸 Top Lose System

Hệ thống thống kê và hiển thị những người thua lỗ nhiều nhất trong các trò chơi.

## 🎯 Tính năng

### 📊 Top Lose Leaderboard
- **Top tổng hợp**: Hiển thị top 10 người thua nhiều AniCoin nhất trong tất cả game
- **Top theo game**: Hiển thị top 10 người thua nhiều nhất trong từng loại game cụ thể
- **Thống kê thua lỗ**: Hiển thị thống kê tổng quan về thua lỗ theo từng game

### 🎮 Games được hỗ trợ
- 🎰 **Blackjack** (`blackjack`, `bj`)
- 🎰 **Slots** (`slots`)
- 🎲 **Roulette** (`roulette`)
- 🪙 **Coin Flip** (`coinflip`, `cf`)

## 📋 Lệnh sử dụng

### Lệnh chính: `n.toplose`

#### 1. Top thua lỗ tổng hợp
```bash
n.toplose
n.toplose all
```
Hiển thị top 10 người thua nhiều AniCoin nhất trong tất cả game.

#### 2. Top thua lỗ theo game
```bash
n.toplose blackjack
n.toplose bj
n.toplose slots
n.toplose roulette
n.toplose coinflip
n.toplose cf
```
Hiển thị top 10 người thua nhiều nhất trong game cụ thể.

#### 3. Thống kê thua lỗ
```bash
n.toplose stats
```
Hiển thị thống kê tổng quan về thua lỗ theo từng game.

#### 4. Hướng dẫn
```bash
n.toplose help
```
Hiển thị hướng dẫn sử dụng lệnh.

### Lệnh tích hợp: `n.gamestats`

#### Top thua lỗ nhanh
```bash
n.gamestats lose
n.gamestats losers
```
Hiển thị top thua lỗ tổng hợp (tích hợp trong lệnh gamestats).

## 📈 Thông tin hiển thị

### Top Lose Leaderboard
- 🏆 **Xếp hạng**: Vị trí (🥇🥈🥉 hoặc số thứ tự)
- 👤 **Người chơi**: Mention người dùng
- 💸 **Số tiền thua**: Tổng AniCoin đã thua
- 📊 **Thống kê**: Số trận, số thắng, tỷ lệ thắng
- 💰 **Tổng cược**: Tổng tiền đã cược
- 💵 **Lỗ ròng**: Số tiền lỗ (tổng cược - tổng thua)
- 🎯 **Thua lớn nhất**: Lần thua lớn nhất trong 1 trận

### Thống kê thua lỗ
- 📊 **Tổng trận**: Số trận đã chơi
- 🏆 **Tổng thắng**: Số trận thắng và tỷ lệ thắng
- 💰 **Tổng cược**: Tổng tiền đã cược
- 💸 **Tổng thua**: Tổng tiền đã thua
- 💵 **Lỗ ròng**: Số tiền lỗ tổng hợp
- 🎯 **Thua lớn nhất**: Lần thua lớn nhất trong game
- 👥 **Số người thua**: Số người có thua lỗ

## 🔧 Technical Details

### Database Schema
Sử dụng bảng `GameStats` với các trường:
- `totalLost`: Tổng tiền thua (BigInt)
- `biggestLoss`: Lần thua lớn nhất (BigInt)
- `gamesPlayed`: Số trận đã chơi
- `gamesWon`: Số trận thắng

### API Methods
```typescript
// Top lose cho game cụ thể
GameStatsService.getGameLoseLeaderboard(guildId, gameType, limit)

// Top lose tổng hợp tất cả game
GameStatsService.getOverallLoseLeaderboard(guildId, limit)

// Thống kê thua lỗ server
GameStatsService.getServerLoseStats(guildId)
```

### Cách tính thua lỗ
- **Thua lỗ**: Khi `won = false`, `totalLost` được cộng thêm `bet`
- **Thắng**: Khi `won = true`, `totalWon` được cộng thêm `winnings`
- **Lỗ ròng**: `totalBet - totalLost` (số âm = lỗ, số dương = lãi)

## 🎨 UI/UX Features

### Màu sắc
- **Màu chủ đạo**: `#ff6b6b` (đỏ nhạt) - thể hiện thua lỗ
- **Emoji**: 💸 cho thua lỗ, 🎯 cho thua lớn nhất

### Layout
- **Embed title**: Rõ ràng về loại thống kê
- **Description**: Danh sách người chơi với thông tin chi tiết
- **Footer**: Hướng dẫn sử dụng lệnh khác

### Responsive
- Tự động điều chỉnh theo số lượng người chơi
- Hiển thị "Chưa có dữ liệu" khi không có thống kê
- Giới hạn 10 người chơi mỗi lần hiển thị

## 🚀 Tương lai

### Tính năng có thể thêm
- **Top lose theo thời gian**: Thống kê theo ngày/tuần/tháng
- **Top lose theo level**: Phân loại theo level người chơi
- **Thông báo thua lỗ**: Cảnh báo khi thua quá nhiều
- **Achievement thua lỗ**: Badge cho người thua nhiều nhất
- **Export dữ liệu**: Xuất thống kê ra file

### Cải tiến
- **Pagination**: Phân trang cho danh sách dài
- **Filter**: Lọc theo khoảng thời gian
- **Search**: Tìm kiếm người chơi cụ thể
- **Graph**: Biểu đồ thống kê trực quan

## 📝 Lưu ý

1. **Chỉ hiển thị người có thua**: Chỉ những người có `totalLost > 0` mới xuất hiện
2. **Sắp xếp theo thua lỗ**: Người thua nhiều nhất lên đầu
3. **Real-time**: Thống kê được cập nhật theo thời gian thực
4. **Server-specific**: Mỗi server có thống kê riêng biệt
5. **BigInt support**: Hỗ trợ số tiền lớn không bị overflow 