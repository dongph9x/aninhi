# 🎯 Give Command - Test Cases

## Cách sử dụng đúng

### 1. Chuyển tiền bằng mention
```
n.give @username 1000
```
**Expected:** Chuyển 1000 AniCoin cho user được mention

### 2. Chuyển tiền bằng ID
```
n.give 123456789012345678 500
```
**Expected:** Chuyển 500 AniCoin cho user có ID 123456789012345678

### 3. Chuyển tiền với số lớn
```
n.give @username 1000000
```
**Expected:** Chuyển 1,000,000 AniCoin (nếu đủ số dư)

## Các trường hợp lỗi

### 1. Thiếu tham số
```
n.give @username
n.give 1000
n.give
```
**Expected:** Hiển thị hướng dẫn cách dùng

### 2. Người dùng không hợp lệ
```
n.give invalid_user 1000
n.give @ 1000
```
**Expected:** Lỗi "Người dùng không hợp lệ"

### 3. Số tiền không hợp lệ
```
n.give @username 0
n.give @username -100
n.give @username abc
```
**Expected:** Lỗi "Số tiền không hợp lệ"

### 4. Chuyển cho chính mình
```
n.give @yourself 1000
```
**Expected:** Lỗi "Bạn không thể chuyển tiền cho chính mình!"

### 5. Không đủ số dư
```
n.give @username 999999999
```
**Expected:** Lỗi "Số dư không đủ"

## Debug Steps

### Nếu gặp lỗi "Chuyển cho chính mình":

1. **Kiểm tra mention:**
   - Đảm bảo bạn không mention chính mình
   - Thử dùng ID thay vì mention

2. **Kiểm tra ID:**
   - Đảm bảo ID không phải là ID của bạn
   - Copy ID chính xác từ user khác

3. **Kiểm tra syntax:**
   ```
   ✅ n.give @other_user 1000
   ✅ n.give 123456789012345678 1000
   ❌ n.give @yourself 1000
   ❌ n.give 123456789012345678 1000  # nếu đây là ID của bạn
   ```

### Cách lấy User ID:
1. Bật Developer Mode trong Discord
2. Right-click vào user
3. Chọn "Copy ID"

### Test với bot:
```
n.give @BotName 1000
```
**Expected:** Có thể chuyển tiền cho bot

## Expected Embed Responses

### Success:
```
✅ Chuyển Tiền Thành Công

Username đã chuyển 1,000 AniCoin cho @target_user

💰 Số Dư Mới:
• Username: 9,000 AniCoin
• @target_user: 2,000 AniCoin

Chuyển tiền hoàn tất
```

### Error - Self Transfer:
```
❌ Không Thể Chuyển Cho Chính Mình

Bạn không thể chuyển tiền cho chính mình!
```

### Error - Invalid User:
```
❌ Người Dùng Không Hợp Lệ

Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.
```

### Error - Insufficient Balance:
```
❌ Số Dư Không Đủ

Bạn không có đủ AniCoin!

Số dư hiện tại: 1,000 AniCoin
Số tiền muốn chuyển: 10,000 AniCoin
Thiếu: 9,000 AniCoin
```

## Troubleshooting

### Nếu vẫn gặp lỗi:

1. **Kiểm tra bot permissions:**
   - Bot cần quyền đọc tin nhắn
   - Bot cần quyền gửi tin nhắn

2. **Kiểm tra database:**
   - Đảm bảo file `data/ecommerce.json` tồn tại
   - Kiểm tra quyền đọc/ghi file

3. **Kiểm tra logs:**
   - Xem console log của bot
   - Tìm error messages

4. **Test với user khác:**
   - Thử chuyển tiền cho user khác
   - Xem có lỗi tương tự không

### Common Issues:

1. **Wrong prefix:** Sử dụng `n.give` thay vì `p!give`
2. **Self mention:** Không mention chính mình
3. **Invalid ID:** Đảm bảo ID là số và đúng format
4. **Insufficient balance:** Kiểm tra số dư trước khi chuyển 