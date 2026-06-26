# 🔧 BigInt Games Fix

Sửa lỗi BigInt trong các game commands để hỗ trợ số tiền lớn.

## 🐛 Lỗi đã sửa

### 1. **Slots Command** (`src/commands/text/ecommerce/slots.ts`)
**Lỗi:** `Error adding money: Error: Số tiền phải lớn hơn 0`

**Nguyên nhân:** Khi thắng slots, `win - amount` có thể âm nếu `win` là BigInt và `amount` là number.

**Sửa:**
```typescript
// Trước
await EcommerceService.addMoney(userId, guildId, win - amount, ...);

// Sau
await EcommerceService.addMoney(userId, guildId, BigInt(win) - BigInt(amount), ...);
```

**Thêm sửa:**
```typescript
// Xử lý "all" bet
if (all) {
    amount = Number(currentBalance); // Chuyển BigInt thành number
}

// Kiểm tra balance
if (currentBalance < BigInt(amount) || currentBalance <= 0n) {
    // So sánh BigInt với BigInt
}
```

### 2. **Blackjack Command** (`src/commands/text/ecommerce/blackjack.ts`)
**Lỗi:** `TypeError: Cannot convert a BigInt value to a number`

**Nguyên nhân:** `Math.min(balance, maxBet)` không thể so sánh BigInt với number.

**Sửa:**
```typescript
// Trước
if (bet === "all") bet = Math.min(balance, maxBet);

// Sau
if (bet === "all") bet = Number(balance < BigInt(maxBet) ? balance : BigInt(maxBet));

// Kiểm tra balance
if (balance < BigInt(bet as number)) {
    // So sánh BigInt với BigInt
}
```

### 3. **Coinflip Command** (`src/commands/text/ecommerce/coinflip.ts`)
**Sửa tương tự:**
```typescript
// Xử lý "all" bet
if (bet === "all") {
    bet = Number(currentBalance);
}

// Kiểm tra balance
if (currentBalance === 0n || currentBalance < BigInt(betAmount)) {
    // So sánh BigInt với BigInt
}
```

### 4. **Roulette Command** (`src/commands/text/ecommerce/roulette.ts`)
**Sửa tương tự:**
```typescript
// Xử lý "all" bet
if (betAmountInput.toLowerCase() === "all") {
    betAmount = Number(await EcommerceService.getBalance(userId, guildId));
}

// Kiểm tra balance
if (balance < BigInt(betAmount)) {
    // So sánh BigInt với BigInt
}
```

## 🔧 Nguyên tắc sửa

### 1. **Chuyển đổi BigInt ↔ Number**
- **Khi lấy balance:** `getBalance()` trả về BigInt
- **Khi xử lý "all":** Chuyển BigInt thành Number: `Number(balance)`
- **Khi so sánh:** Chuyển Number thành BigInt: `BigInt(amount)`

### 2. **So sánh BigInt**
```typescript
// Đúng
if (balance < BigInt(amount)) { ... }
if (balance === 0n) { ... }

// Sai
if (balance < amount) { ... }
if (balance === 0) { ... }
```

### 3. **Phép tính với BigInt**
```typescript
// Đúng
const result = BigInt(win) - BigInt(amount);
const total = balance + BigInt(amount);

// Sai
const result = win - amount; // Nếu win là BigInt, amount là number
```

## 🧪 Test Results

```bash
🧪 Testing BigInt compatibility in game commands...

✅ Created test user with 1,000,000 coins

💰 Testing large bet amounts...
✅ Added 50,000 coins successfully
✅ Subtracted 25,000 coins successfully

🎮 Testing game stats with large amounts...
✅ Recorded slots win: bet 10k, won 20k
✅ Recorded blackjack loss: bet 15k, lost 15k
✅ Recorded roulette win: bet 5k, won 10k

💳 Testing balance retrieval...
✅ Current balance: 1,025,000 coins

📊 Testing game stats retrieval...
✅ roulette: bet 5,000, won 10,000, lost 0
✅ blackjack: bet 15,000, won 0, lost 15,000
✅ slots: bet 10,000, won 20,000, lost 0

💸 Testing top lose leaderboard...
✅ 1. User user-bigint-test: 15,000 coins lost

🎉 All BigInt game tests passed!
```

## 📋 Files đã sửa

1. **`src/commands/text/ecommerce/slots.ts`**
   - Sửa phép tính `win - amount`
   - Sửa xử lý "all" bet
   - Sửa kiểm tra balance

2. **`src/commands/text/ecommerce/blackjack.ts`**
   - Sửa `Math.min(balance, maxBet)`
   - Sửa kiểm tra balance

3. **`src/commands/text/ecommerce/coinflip.ts`**
   - Sửa xử lý "all" bet
   - Sửa kiểm tra balance

4. **`src/commands/text/ecommerce/roulette.ts`**
   - Sửa xử lý "all" bet
   - Sửa kiểm tra balance

## ✅ Kết quả

- ✅ Tất cả game commands hoạt động với số tiền lớn
- ✅ Không còn lỗi BigInt conversion
- ✅ Hỗ trợ đầy đủ "all" bet
- ✅ Game stats được ghi chính xác
- ✅ Top lose leaderboard hoạt động với BigInt

## 🚀 Lưu ý

1. **Tương thích ngược:** Các thay đổi này tương thích với dữ liệu cũ
2. **Performance:** BigInt operations có thể chậm hơn một chút so với number
3. **Display:** Sử dụng `.toLocaleString()` để hiển thị BigInt đẹp
4. **Validation:** Luôn kiểm tra BigInt > 0n thay vì > 0

## 🔮 Tương lai

- Có thể cân nhắc sử dụng Decimal.js cho các phép tính tiền tệ phức tạp
- Thêm validation cho số tiền tối đa để tránh overflow
- Tối ưu hóa performance cho các phép tính BigInt lớn 