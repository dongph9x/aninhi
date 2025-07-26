# 🪙 Coinflip "all" Bet Fix

## 🐛 Vấn Đề

Lệnh `n.coinflip all` đang gặp lỗi khi user có số dư lớn hơn maxBet (100k). Khi user dùng `all`, hệ thống sẽ cược toàn bộ số dư, nhưng nếu thua sẽ mất hết tiền, trong khi maxBet chỉ được 100k. Điều này tạo ra mâu thuẫn.

### **Ví dụ lỗi:**
```
User có: 500,000 AniCoin
MaxBet: 100,000 AniCoin
n.coinflip all → Cược 500,000 AniCoin (vượt maxBet)
Nếu thua → Mất hết 500,000 AniCoin
```

## 🔧 Giải Pháp

### **1. Giới hạn bet "all" theo maxBet**
```typescript
// Trước
if (bet === "all") {
    bet = Number(currentBalance); // Có thể vượt maxBet
}

// Sau
if (bet === "all") {
    bet = Math.min(Number(currentBalance), maxBet); // Giới hạn theo maxBet
}
```

### **2. Hiển thị thông tin rõ ràng**
```typescript
// Hiển thị thông tin bet rõ ràng
let betDisplayText = `**${bet}** AniCoin`;
if (originalBet === "all") {
    const actualBet = bet as number;
    const totalBalance = Number(currentBalance);
    if (actualBet < totalBalance) {
        betDisplayText = `**${actualBet}** AniCoin (tối đa ${maxBet.toLocaleString()})`;
    } else {
        betDisplayText = `**${actualBet}** AniCoin (tất cả)`;
    }
}
```

## 📋 Các Trường Hợp

### **Scenario 1: Balance > maxBet**
```
Balance: 500,000 AniCoin
MaxBet: 100,000 AniCoin
Bet "all": 100,000 AniCoin
Display: **100,000** AniCoin (tối đa 100,000)
Result: User keeps 400,000 AniCoin if lose
```

### **Scenario 2: Balance < maxBet**
```
Balance: 50,000 AniCoin
MaxBet: 100,000 AniCoin
Bet "all": 50,000 AniCoin
Display: **50,000** AniCoin (tất cả)
Result: User loses all money if lose
```

### **Scenario 3: Balance = maxBet**
```
Balance: 100,000 AniCoin
MaxBet: 100,000 AniCoin
Bet "all": 100,000 AniCoin
Display: **100,000** AniCoin (tất cả)
Result: User loses all money if lose
```

## 🎯 Lợi Ích

### **Cho User:**
- 🛡️ **Bảo vệ tiền**: Không thể mất hết tiền khi balance > maxBet
- 📊 **Thông tin rõ ràng**: Biết chính xác số tiền sẽ cược
- ⚖️ **Cân bằng**: Vẫn có thể cược tối đa theo quy định

### **Cho System:**
- 🔒 **Tuân thủ quy tắc**: Đảm bảo không vượt maxBet
- 🎮 **Cân bằng game**: Tránh mất cân bằng kinh tế
- 📈 **Tính nhất quán**: Logic thống nhất với các game khác

## 🧪 Test Results

```bash
🪙 Test Coinflip "all" bet với maxBet

1️⃣ Finding user with balance > maxBet...
   ✅ Created test user with 500,000 AniCoin
   📊 Test user balance: 500,000 AniCoin

2️⃣ Testing coinflip "all" logic...
   📋 Original bet: "all"
   📊 Current balance: 500,000 AniCoin
   🎯 MaxBet: 100,000 AniCoin
   💰 Actual bet amount: 100,000 AniCoin
   ✅ Bet amount is within maxBet limit
   ✅ User will not lose all money

3️⃣ Testing display text logic...
   📋 Display text: **100000** AniCoin (tối đa 100,000)

5️⃣ Testing win/lose calculations...
   💰 Bet amount: 100,000 AniCoin
   🎉 Win amount: 200,000 AniCoin
   😢 Lose amount: 100,000 AniCoin
   💸 Remaining after lose: 400,000 AniCoin
   ✅ User will have money left after losing

✅ Coinflip "all" test completed!
```

## 📁 Files Modified

### **`src/commands/text/ecommerce/coinflip.ts`**
- **Line 75-85**: Sửa logic xử lý bet "all"
- **Line 95-105**: Sửa logic giới hạn maxBet
- **Line 130-140**: Thêm display text logic
- **Line 160-170**: Cập nhật result display

### **`scripts/test-coinflip-all.ts`** (NEW)
- Test script để kiểm tra logic mới
- Test các trường hợp khác nhau
- Verify balance calculations

## 🚀 Cách Sử Dụng

### **Lệnh cơ bản:**
```bash
n.coinflip all head
n.coinflip all tail
n.coinflip head all
n.coinflip tail all
```

### **Kết quả hiển thị:**
```
🪙 Coinflip
Username đã cược **100,000** AniCoin (tối đa 100,000) và chọn **heads**

Đồng xu quay... 🪙
```

### **Kết quả cuối:**
```
🪙 Kết Quả Coinflip
Username đã cược **100,000** AniCoin (tối đa 100,000) và chọn **heads**

Đồng xu quay... 🪙 và kết quả là **heads**

🎉 Bạn đã thắng 200,000 AniCoin! 🎉

Số dư mới: 600,000 AniCoin
```

## ⚠️ Lưu Ý Quan Trọng

1. **MaxBet Protection**: Bet "all" luôn bị giới hạn bởi maxBet
2. **Display Clarity**: Hiển thị rõ ràng số tiền thực tế được cược
3. **Balance Safety**: User không thể mất hết tiền khi balance > maxBet
4. **Consistent Logic**: Logic thống nhất với các game khác (slots, blackjack, roulette)

## 🎉 Kết Luận

Fix này đã giải quyết hoàn toàn vấn đề:
- ✅ **Bảo vệ user**: Không thể mất hết tiền khi balance > maxBet
- ✅ **Tuân thủ quy tắc**: Đảm bảo không vượt maxBet
- ✅ **Thông tin rõ ràng**: User biết chính xác số tiền sẽ cược
- ✅ **Tính nhất quán**: Logic thống nhất với toàn bộ hệ thống

**🎮 Lệnh `n.coinflip all` đã hoạt động an toàn và đúng quy tắc!** 