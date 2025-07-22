# 🏦 Hệ Thống Bank Chuyển Đổi Tiền Tệ

## 📋 Tổng Quan

Hệ thống **Bank** cho phép người chơi chuyển đổi giữa **AniCoin** và **FishCoin** với tỷ lệ cố định. Đây là cầu nối giữa hai hệ thống kinh tế trong game.

## 🔄 Tỷ Lệ Chuyển Đổi

### **📊 Tỷ Lệ Cố Định:**
- **AniCoin → FishCoin:** 1₳ = 0.5🐟
- **FishCoin → AniCoin:** 1🐟 = 1.5₳

### **💰 Số Tiền Tối Thiểu:**
- **AniCoin → FishCoin:** Tối thiểu 1,000₳
- **FishCoin → AniCoin:** Tối thiểu 1,000🐟

### **💡 Ví Dụ Chuyển Đổi:**
```
💰 AniCoin → FishCoin:
• 1,000₳ → 500🐟
• 2,000₳ → 1,000🐟
• 5,000₳ → 2,500🐟

🐟 FishCoin → AniCoin:
• 1,000🐟 → 1,500₳
• 2,000🐟 → 3,000₳
• 5,000🐟 → 7,500₳
```

## 🛠️ Các File Đã Tạo

### **1. Core Service (`src/utils/bank-service.ts`)**
- **Class:** `BankService`
- **Functions:**
  - `exchangeAniToFish()` - Chuyển AniCoin sang FishCoin
  - `exchangeFishToAni()` - Chuyển FishCoin sang AniCoin
  - `getExchangeRates()` - Lấy tỷ lệ chuyển đổi
  - `calculateExchange()` - Tính toán trước khi chuyển
  - `getBankHistory()` - Lấy lịch sử giao dịch

### **2. Command (`src/commands/text/ecommerce/bank.ts`)**
- **Command:** `n.bank`
- **Subcommands:**
  - `ani <số tiền>` - Chuyển AniCoin sang FishCoin
  - `fish <số tiền>` - Chuyển FishCoin sang AniCoin
  - `rates` - Xem tỷ lệ chuyển đổi
  - `history` - Xem lịch sử giao dịch
  - `calculate <loại> <số tiền>` - Tính toán trước khi chuyển
  - `help` - Xem hướng dẫn

## 🎮 Các Lệnh Sử Dụng

### **Lệnh Cơ Bản:**
```bash
n.bank                    # Xem thông tin ngân hàng
n.bank help              # Xem hướng dẫn chi tiết
n.bank rates             # Xem tỷ lệ chuyển đổi
```

### **Chuyển Đổi Tiền Tệ:**
```bash
n.bank ani 2000          # Chuyển 2,000₳ sang 1,000🐟
n.bank fish 1500         # Chuyển 1,500🐟 sang 2,250₳
n.bank anicoin 5000      # Chuyển 5,000₳ sang 2,500🐟
n.bank fishcoin 3000     # Chuyển 3,000🐟 sang 4,500₳
```

### **Tính Toán Trước:**
```bash
n.bank calculate ani 2000    # Tính 2,000₳ sẽ được bao nhiêu🐟
n.bank calculate fish 1500   # Tính 1,500🐟 sẽ được bao nhiêu₳
```

### **Xem Lịch Sử:**
```bash
n.bank history              # Xem lịch sử giao dịch ngân hàng
n.bank lịch sử              # Xem lịch sử giao dịch ngân hàng
```

## 🧪 Test Results

### **Bank System Test:**
```bash
npx tsx scripts/test-bank-system.ts
```

### **Test Results:**
```
✅ Exchange rates:
   AniCoin → FishCoin: 1000₳ → 500🐟 (Rate: 0.5)
   FishCoin → AniCoin: 1000🐟 → 1500₳ (Rate: 1.5)

✅ Exchange calculations:
   500₳ → 0🐟 (Valid: false)
   1000₳ → 500🐟 (Valid: true)
   2000₳ → 1000🐟 (Valid: true)
   5000₳ → 2500🐟 (Valid: true)

✅ AniCoin to FishCoin exchange successful!
   Exchanged: 2,000₳
   Received: 1000🐟
   Rate: 0.5

✅ FishCoin to AniCoin exchange successful!
   Exchanged: 1500🐟
   Received: 2,250₳
   Rate: 1.5

✅ Error cases:
   Insufficient AniCoin test: ✅ Correctly failed
   Insufficient FishCoin test: ✅ Correctly failed
   Minimum AniCoin test: ✅ Correctly failed
   Minimum FishCoin test: ✅ Correctly failed

✅ Bank history:
   Total transactions: 4
   1. -1,500🐟 - Bank exchange: 1500 FishCoin → 2,250 AniCoin
   2. +1,000🐟 - Bank exchange: 2,000 AniCoin → 1000 FishCoin

✅ Final balances:
   AniCoin: 10,250₳
   FishCoin: 9000🐟
```

## 💰 Hệ Thống Phần Thưởng

### **Cách Tính Chuyển Đổi:**
1. **Kiểm tra số tiền tối thiểu** - Phải đủ 1,000 đơn vị
2. **Kiểm tra số dư** - Phải có đủ tiền để chuyển
3. **Tính toán số tiền nhận** - Dựa trên tỷ lệ cố định
4. **Thực hiện giao dịch** - Trừ tiền cũ, cộng tiền mới
5. **Ghi lại lịch sử** - Trong cả Transaction và FishTransaction

### **Ví Dụ Chi Tiết:**
```
📊 Chuyển 2,000₳ sang FishCoin:
• Kiểm tra: 2,000₳ ≥ 1,000₳ ✅
• Tính toán: 2,000 × 0.5 = 1,000🐟
• Thực hiện: -2,000₳, +1,000🐟
• Kết quả: Nhận được 1,000🐟

📊 Chuyển 1,500🐟 sang AniCoin:
• Kiểm tra: 1,500🐟 ≥ 1,000🐟 ✅
• Tính toán: 1,500 × 1.5 = 2,250₳
• Thực hiện: -1,500🐟, +2,250₳
• Kết quả: Nhận được 2,250₳
```

## 🎮 UI Examples

### **Bank Info Display:**
```
🏦 Ngân Hàng Chuyển Đổi Tiền Tệ

Chào mừng đến với Ngân Hàng! Bạn có thể chuyển đổi giữa AniCoin và FishCoin.

📊 Tỷ Lệ Chuyển Đổi:
• AniCoin → FishCoin: 1₳ = 0.5🐟 (Tối thiểu 1,000₳)
• FishCoin → AniCoin: 1🐟 = 1.5₳ (Tối thiểu 1,000🐟)

💡 Lệnh Sử Dụng:
• n.bank ani <số tiền> - Chuyển AniCoin sang FishCoin
• n.bank fish <số tiền> - Chuyển FishCoin sang AniCoin
• n.bank rates - Xem tỷ lệ chuyển đổi
• n.bank history - Xem lịch sử giao dịch
```

### **Exchange Rates Display:**
```
📊 Tỷ Lệ Chuyển Đổi Tiền Tệ

🏦 Ngân Hàng Chuyển Đổi Tiền Tệ

💰 AniCoin → FishCoin:
• Tối thiểu: 1,000 AniCoin
• Nhận được: 500 FishCoin
• Tỷ lệ: 1₳ = 0.5🐟

🐟 FishCoin → AniCoin:
• Tối thiểu: 1,000 FishCoin
• Nhận được: 1,500 AniCoin
• Tỷ lệ: 1🐟 = 1.5₳

💡 Ví Dụ:
• 2,000₳ → 1,000🐟
• 2,000🐟 → 3,000₳
```

### **Successful Exchange Display:**
```
✅ Chuyển Đổi Thành Công!

Username đã chuyển đổi thành công!

💰 Đã chuyển: 2,000 AniCoin
🐟 Nhận được: 1,000 FishCoin
📊 Tỷ lệ: 1₳ = 0.5🐟

💳 Số dư mới:
• AniCoin: 8,000₳
• FishCoin: 10,500🐟
```

### **Calculation Display:**
```
🧮 Tính Toán Chuyển Đổi

Username - Tính toán chuyển đổi:

💰 Số tiền chuyển: 2,000₳
📊 Tỷ lệ: 1₳ = 0.5🐟
🎯 Sẽ nhận được: 1,000🐟

✅ Hợp lệ để chuyển đổi
```

## ⚠️ Lưu Ý Quan Trọng

1. **Tỷ lệ cố định:** Không thay đổi theo thời gian
2. **Số tiền tối thiểu:** Phải đủ 1,000 đơn vị mỗi loại
3. **Giao dịch không hoàn tác:** Không thể hủy sau khi chuyển
4. **Kiểm tra kỹ:** Sử dụng `calculate` trước khi chuyển
5. **Lịch sử đầy đủ:** Tất cả giao dịch đều được ghi lại

## 🔧 Technical Details

### **Transaction Flow:**
1. **Validation** - Kiểm tra số tiền tối thiểu và số dư
2. **Calculation** - Tính toán số tiền nhận được
3. **Deduction** - Trừ tiền từ tài khoản gốc
4. **Addition** - Cộng tiền vào tài khoản đích
5. **Logging** - Ghi lại giao dịch trong cả hai bảng

### **Error Handling:**
```typescript
// Kiểm tra số tiền tối thiểu
if (amount < this.EXCHANGE_RATES.aniToFish.minAmount) {
  return {
    success: false,
    error: `Số tiền tối thiểu để chuyển đổi là ${this.EXCHANGE_RATES.aniToFish.minAmount.toLocaleString()} AniCoin`
  };
}

// Kiểm tra số dư
if (Number(user.balance) < amount) {
  return {
    success: false,
    error: `Không đủ AniCoin! Số dư hiện tại: ${Number(user.balance).toLocaleString()} AniCoin`
  };
}
```

### **Database Operations:**
- Sử dụng `prisma.user.update()` cho AniCoin
- Sử dụng `fishCoinDB.addFishCoin()` và `fishCoinDB.subtractFishCoin()` cho FishCoin
- Ghi lại tất cả giao dịch trong `Transaction` và `FishTransaction` tables
- Không sử dụng transaction để tránh timeout

## 📊 Performance Improvements

1. **Fixed rates:** Tỷ lệ cố định, không cần tính toán phức tạp
2. **Efficient validation:** Kiểm tra nhanh số tiền tối thiểu
3. **Direct operations:** Không sử dụng transaction để tăng tốc
4. **Clear logging:** Ghi lại rõ ràng tất cả giao dịch
5. **User-friendly:** Giao diện dễ sử dụng với nhiều alias

## 🚀 Tính Năng Tương Lai

1. **Dynamic rates:** Tỷ lệ thay đổi theo thời gian
2. **Exchange fees:** Phí chuyển đổi
3. **Bulk exchange:** Chuyển đổi số lượng lớn
4. **Exchange limits:** Giới hạn chuyển đổi hàng ngày
5. **Exchange bonuses:** Thưởng cho giao dịch lớn

---

## 🎉 **Hoàn Thành Hệ Thống Bank!**

### ✅ **Đã Thành Công:**
- 💱 **AniCoin ↔ FishCoin exchange** - Chuyển đổi hai chiều
- 📊 **Fixed exchange rates** - Tỷ lệ cố định rõ ràng
- 💰 **Minimum amount requirements** - Yêu cầu số tiền tối thiểu
- 📝 **Transaction logging** - Ghi lại tất cả giao dịch
- 📋 **Exchange history** - Lịch sử giao dịch đầy đủ
- 🧮 **Pre-calculation tool** - Tính toán trước khi chuyển

### 🎮 **Cách Sử Dụng:**
- Chuyển AniCoin: `n.bank ani <số tiền>`
- Chuyển FishCoin: `n.bank fish <số tiền>`
- Xem tỷ lệ: `n.bank rates`
- Tính toán: `n.bank calculate <ani/fish> <số tiền>`
- Xem lịch sử: `n.bank history`

### 📊 **Tỷ Lệ Chuyển Đổi:**
- **AniCoin → FishCoin:** 1₳ = 0.5🐟 (Tối thiểu 1,000₳)
- **FishCoin → AniCoin:** 1🐟 = 1.5₳ (Tối thiểu 1,000🐟)

**🎉 Hệ thống Bank đã hoàn thành và sẵn sàng sử dụng!** 🏦✨ 