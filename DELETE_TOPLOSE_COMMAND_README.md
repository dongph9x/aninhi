# 🗑️ Command n.delete toplose

## 📋 Tổng Quan

Command `n.delete toplose` được tạo để hỗ trợ xóa dữ liệu `n.toplose` một cách an toàn và có xác nhận. Command này cung cấp thống kê chi tiết trước khi xóa và yêu cầu xác nhận để tránh xóa nhầm dữ liệu.

## 🎯 Mục Đích

- **Xóa dữ liệu n.toplose**: Xóa tất cả GameStats records trong server
- **Thống kê trước khi xóa**: Hiển thị chi tiết dữ liệu sẽ bị xóa
- **Xác nhận an toàn**: Yêu cầu xác nhận trước khi thực hiện xóa
- **Thông báo rõ ràng**: Cảnh báo về các lệnh sẽ bị ảnh hưởng

## 📝 Cú Pháp

### Xem thống kê và xác nhận xóa
```
n.delete toplose
```

### Xác nhận xóa dữ liệu
```
n.delete toplose confirm
```

### Xem hướng dẫn
```
n.delete help
```

## 🔧 Tính Năng

### 1. Thống Kê Trước Khi Xóa
- Đếm tổng số GameStats records
- Thống kê theo loại game (blackjack, slots, roulette, coinflip)
- Hiển thị số trận và số AniCoin thua cho mỗi game

### 2. Cảnh Báo Chi Tiết
- Cảnh báo hành động không thể hoàn tác
- Liệt kê các lệnh sẽ bị ảnh hưởng
- Thông báo về Top Lose GIF sẽ không hiển thị

### 3. Xác Nhận An Toàn
- Yêu cầu gõ `n.delete toplose confirm` để xác nhận
- Hiển thị số lượng records đã xóa
- Thống kê sau khi xóa

## 📊 Output Mẫu

### Khi có dữ liệu để xóa:
```
🗑️ Xóa Dữ Liệu n.toplose

📊 Thống kê trước khi xóa:

📈 Tổng số GameStats records: 5

🎮 Thống kê theo loại game:
• Blackjack: 2 trận, 150,000 AniCoin thua
• Coin Flip: 3 trận, 75,000 AniCoin thua

⚠️ Cảnh báo:
• Hành động này KHÔNG THỂ HOÀN TÁC!
• Tất cả dữ liệu n.toplose sẽ bị mất vĩnh viễn!
• Các lệnh sau sẽ không hoạt động:
  - n.toplose
  - n.toplose all
  - n.toplose blackjack
  - n.toplose slots
  - n.toplose roulette
  - n.toplose coinflip
  - n.toplose stats
• Top Lose GIF trong n.fishing sẽ không hiển thị!

🤔 Bạn có chắc chắn muốn xóa?
Gõ n.delete toplose confirm để xác nhận xóa.
```

### Khi xác nhận xóa:
```
🗑️ Xác Nhận Xóa Dữ Liệu n.toplose

🔄 Đang xóa dữ liệu n.toplose...

✅ Đã xóa thành công:
• 5 GameStats records
• Tất cả dữ liệu n.toplose đã bị xóa

📊 Thống kê sau khi xóa:
• GameStats records còn lại: 0

🎉 Xóa hoàn tất!
• Tất cả dữ liệu n.toplose đã được xóa sạch
• Các lệnh n.toplose sẽ không hoạt động cho đến khi có data mới
• Top Lose GIF trong n.fishing sẽ không hiển thị

💡 Lưu ý: Dữ liệu sẽ được tạo lại khi người dùng chơi game
```

### Khi không có dữ liệu:
```
🗑️ Xóa Dữ Liệu n.toplose

✅ Không có dữ liệu n.toplose nào để xóa!
```

## 🛡️ Bảo Mật

### Xác Nhận 2 Bước
1. **Bước 1**: `n.delete toplose` - Xem thống kê và cảnh báo
2. **Bước 2**: `n.delete toplose confirm` - Xác nhận xóa

### Cảnh Báo Chi Tiết
- Hiển thị rõ ràng các lệnh sẽ bị ảnh hưởng
- Cảnh báo về hành động không thể hoàn tác
- Thông báo về ảnh hưởng đến Top Lose GIF

## 🔄 Lệnh Bị Ảnh Hưởng

Sau khi xóa dữ liệu `n.toplose`, các lệnh sau sẽ không hoạt động:

- `n.toplose` - Sẽ hiển thị "Chưa có dữ liệu thua lỗ nào!"
- `n.toplose all` - Sẽ hiển thị "Chưa có dữ liệu thua lỗ nào!"
- `n.toplose blackjack` - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Blackjack nào!"
- `n.toplose slots` - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Slots nào!"
- `n.toplose roulette` - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Roulette nào!"
- `n.toplose coinflip` - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Coin Flip nào!"
- `n.toplose stats` - Sẽ hiển thị "Chưa có dữ liệu thống kê nào!"

## 🎮 Ảnh Hưởng Đến Game

- **Top Lose GIF**: Sẽ không hiển thị trong lệnh `n.fishing`
- **Dữ liệu mới**: Sẽ được tạo lại khi người dùng chơi game

## 📁 Files Được Tạo/Sửa Đổi

### Files Mới
- `src/commands/text/ecommerce/delete.ts` - Command chính

### Files Được Sửa Đổi
- `src/utils/gameStats.ts` - Thêm method `deleteAllGameStats`

### Files Test
- `scripts/test-delete-toplose-command.ts` - Script test

## 🧪 Test Results

```
🧪 Test Command n.delete toplose

1️⃣ Kiểm tra dữ liệu hiện tại:
   📊 GameStats records hiện tại: 0

2️⃣ Tạo dữ liệu test:
   ✅ Đã tạo dữ liệu test

3️⃣ Test thống kê trước khi xóa:
   📊 Server GameStats: 2 loại game
   📈 Server Lose Stats: 2 loại game
   🎮 blackjack: 1 trận, 100,000 AniCoin thua
   🎮 coinflip: 1 trận, 50,000 AniCoin thua

4️⃣ Test method deleteAllGameStats:
   🗑️ Đã xóa: 2 GameStats records

5️⃣ Kiểm tra sau khi xóa:
   📊 GameStats records còn lại: 0
   📊 Server GameStats còn lại: 0 loại game

✅ Test command n.delete toplose hoàn tất!
```

## 💡 Sử Dụng

### Trường Hợp 1: Xem thống kê trước khi xóa
```
n.delete toplose
```

### Trường Hợp 2: Xác nhận xóa dữ liệu
```
n.delete toplose confirm
```

### Trường Hợp 3: Xem hướng dẫn
```
n.delete help
```

## ⚠️ Lưu Ý Quan Trọng

1. **Không thể hoàn tác**: Hành động xóa không thể hoàn tác
2. **Xác nhận bắt buộc**: Phải gõ `confirm` để xác nhận xóa
3. **Ảnh hưởng rộng**: Nhiều lệnh sẽ bị ảnh hưởng
4. **Dữ liệu mới**: Sẽ được tạo lại khi người dùng chơi game

## 🔧 Troubleshooting

### Lỗi thường gặp:
- **"Không có dữ liệu n.toplose nào để xóa!"**: Database không có GameStats records
- **"Có lỗi xảy ra khi thống kê dữ liệu n.toplose!"**: Lỗi database connection
- **"Có lỗi xảy ra khi xóa dữ liệu n.toplose!"**: Lỗi khi xóa records

### Giải pháp:
- Kiểm tra kết nối database
- Kiểm tra quyền truy cập database
- Restart bot nếu cần thiết 