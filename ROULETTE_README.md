# 🎰 Roulette Game - Hướng dẫn sử dụng

## Giới thiệu
Roulette Game là một tính năng mới được thêm vào bot Discord AniHi, cho phép người chơi tham gia trò chơi roulette với nhiều loại cược khác nhau.

## Cách sử dụng

### Cú pháp cơ bản
```
n.roulette <loại cược> <số tiền>
```

### Ví dụ
- `n.roulette red 100` - Cược màu đỏ với 100 AniCoin
- `n.roulette 7 50` - Cược số 7 với 50 AniCoin
- `n.roulette even 200` - Cược chẵn với 200 AniCoin
- `n.roulette all` - Cược tất cả số dư (tối đa 1000 AniCoin)

## Các loại cược

### 1. Cược số cụ thể (0-36)
- **Tỷ lệ thắng:** 35:1
- **Ví dụ:** `n.roulette 7 100`
- **Mô tả:** Cược vào một số cụ thể từ 0 đến 36

### 2. Cược màu
- **Đỏ:** `n.roulette red` hoặc `n.roulette đỏ`
- **Đen:** `n.roulette black` hoặc `n.roulette đen`
- **Tỷ lệ thắng:** 1:1
- **Số đỏ:** 1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
- **Số đen:** 2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35

### 3. Cược chẵn/lẻ
- **Chẵn:** `n.roulette even` hoặc `n.roulette chẵn`
- **Lẻ:** `n.roulette odd` hoặc `n.roulette lẻ`
- **Tỷ lệ thắng:** 1:1
- **Lưu ý:** Số 0 không được tính là chẵn hay lẻ

### 4. Cược thấp/cao
- **Thấp (1-18):** `n.roulette low` hoặc `n.roulette thấp`
- **Cao (19-36):** `n.roulette high` hoặc `n.roulette cao`
- **Tỷ lệ thắng:** 1:1

### 5. Cược cột
- **Cột 1:** `n.roulette column1` hoặc `n.roulette cột1`
- **Cột 2:** `n.roulette column2` hoặc `n.roulette cột2`
- **Cột 3:** `n.roulette column3` hoặc `n.roulette cột3`
- **Tỷ lệ thắng:** 2:1
- **Cột 1:** 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
- **Cột 2:** 2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35
- **Cột 3:** 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36

### 6. Cược hàng (dozen)
- **Hàng 1 (1-12):** `n.roulette dozen1` hoặc `n.roulette hàng1`
- **Hàng 2 (13-24):** `n.roulette dozen2` hoặc `n.roulette hàng2`
- **Hàng 3 (25-36):** `n.roulette dozen3` hoặc `n.roulette hàng3`
- **Tỷ lệ thắng:** 2:1

## Giới hạn cược
- **Tối thiểu:** 10 AniCoin
- **Tối đa:** 1,000 AniCoin
- **Cooldown:** 5 giây giữa các lần chơi

## Cách hoạt động
1. Người chơi nhập lệnh với loại cược và số tiền
2. Bot kiểm tra số dư và trừ tiền cược
3. Bot hiển thị embed "Đang quay..."
4. Sau 2 giây, bot quay số ngẫu nhiên (0-36)
5. Bot kiểm tra kết quả và tính tiền thắng/thua
6. Bot hiển thị kết quả cuối cùng

## Tính năng đặc biệt
- **Hỗ trợ tiếng Việt:** Có thể dùng từ khóa tiếng Việt (đỏ, đen, chẵn, lẻ, v.v.)
- **Hiển thị màu sắc:** Kết quả hiển thị emoji màu tương ứng (🔴⚫🟢)
- **Lịch sử giao dịch:** Tự động ghi lại lịch sử game vào database
- **Chống spam:** Chỉ cho phép 1 ván game tại một thời điểm

## Lưu ý
- Số 0 có màu xanh lá và không được tính vào cược chẵn/lẻ
- Tỷ lệ thắng được tính dựa trên xác suất thực tế của roulette
- Tiền thắng được cộng vào số dư ngay lập tức
- Có thể dùng lệnh `n.roulette` không có tham số để xem hướng dẫn

## Lệnh liên quan
- `n.balance` - Xem số dư
- `n.daily` - Nhận thưởng hàng ngày
- `n.leaderboard` - Xem bảng xếp hạng
- `n.blackjack` - Chơi blackjack
- `n.slots` - Chơi slots
- `n.coinflip` - Tung đồng xu 