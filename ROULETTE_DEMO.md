# 🎰 Roulette Game - Demo Test Cases

## Test Cases để kiểm tra chức năng

### 1. Test Help Command
```
n.roulette
```
**Expected:** Hiển thị embed hướng dẫn với tất cả loại cược

### 2. Test Cược Số
```
n.roulette 7 100
n.roulette 0 50
n.roulette 36 200
```
**Expected:** 
- Cược số 7, 0, 36 với số tiền tương ứng
- Tỷ lệ thắng 35:1
- Hiển thị kết quả với emoji màu

### 3. Test Cược Màu
```
n.roulette red 100
n.roulette đỏ 100
n.roulette black 100
n.roulette đen 100
```
**Expected:**
- Cược màu đỏ/đen
- Tỷ lệ thắng 1:1
- Hỗ trợ cả tiếng Anh và tiếng Việt

### 4. Test Cược Chẵn/Lẻ
```
n.roulette even 100
n.roulette chẵn 100
n.roulette odd 100
n.roulette lẻ 100
```
**Expected:**
- Cược chẵn/lẻ
- Tỷ lệ thắng 1:1
- Số 0 không được tính

### 5. Test Cược Thấp/Cao
```
n.roulette low 100
n.roulette thấp 100
n.roulette high 100
n.roulette cao 100
```
**Expected:**
- Low: 1-18, High: 19-36
- Tỷ lệ thắng 1:1

### 6. Test Cược Cột
```
n.roulette column1 100
n.roulette cột1 100
n.roulette column2 100
n.roulette cột2 100
n.roulette column3 100
n.roulette cột3 100
```
**Expected:**
- Cột 1: 1,4,7,10,13,16,19,22,25,28,31,34
- Cột 2: 2,5,8,11,14,17,20,23,26,29,32,35
- Cột 3: 3,6,9,12,15,18,21,24,27,30,33,36
- Tỷ lệ thắng 2:1

### 7. Test Cược Hàng
```
n.roulette dozen1 100
n.roulette hàng1 100
n.roulette dozen2 100
n.roulette hàng2 100
n.roulette dozen3 100
n.roulette hàng3 100
```
**Expected:**
- Hàng 1: 1-12
- Hàng 2: 13-24
- Hàng 3: 25-36
- Tỷ lệ thắng 2:1

### 8. Test Giới Hạn Tiền
```
n.roulette red 5    # Dưới minimum
n.roulette red 2000 # Trên maximum
n.roulette red all  # Cược tất cả
```
**Expected:**
- Lỗi nếu dưới 10 AniCoin
- Lỗi nếu trên 1000 AniCoin
- Cược tất cả số dư (tối đa 1000)

### 9. Test Không Đủ Tiền
```
n.roulette red 999999
```
**Expected:** Lỗi không đủ AniCoin

### 10. Test Cooldown
```
n.roulette red 100
n.roulette black 100  # Ngay lập tức
```
**Expected:** Lỗi cooldown hoặc game đang chạy

### 11. Test Loại Cược Không Hợp Lệ
```
n.roulette invalid 100
n.roulette 37 100
n.roulette -1 100
```
**Expected:** Lỗi loại cược không hợp lệ

## Expected Results

### Embed Structure
```
🎰 Roulette

Username

🎯 Cược: [Loại cược]
💰 Số tiền: [Số tiền] AniCoin
🎲 Kết quả: [Emoji màu] [Số]

🎉 THẮNG! +[Tiền thắng] AniCoin
💵 Tổng nhận: [Tổng] AniCoin

Tỷ lệ thắng: [Tỷ lệ]:1
```

### Color Mapping
- 🔴 Red numbers: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
- ⚫ Black numbers: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
- 🟢 Green number: 0

### Payout Ratios
- Number (0-36): 35:1
- Red/Black: 1:1
- Even/Odd: 1:1
- Low/High: 1:1
- Columns: 2:1
- Dozens: 2:1

## Database Integration
- Ghi lại transaction với type: "roulette"
- Ghi lại bet amount và win amount
- Ghi lại result: "win" hoặc "lose"
- Cập nhật balance người chơi 