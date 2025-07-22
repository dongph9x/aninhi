# 🏦 Bank UI System Integration

## 📋 Tổng Quan

Hệ thống **Bank UI** cung cấp giao diện tương tác cho việc chuyển đổi tiền tệ giữa AniCoin và FishCoin. Thay vì sử dụng lệnh text, người dùng có thể sử dụng các button và select menu để thực hiện giao dịch một cách trực quan và tiện lợi.

## 🎮 Tính Năng UI

### **🏦 Giao Diện Chính:**
- **Bank Info Embed** - Thông tin tổng quan về ngân hàng
- **Interactive Buttons** - Các nút tương tác cho từng chức năng
- **Amount Select Menus** - Menu chọn số tiền chuyển đổi
- **Confirmation Dialogs** - Hộp thoại xác nhận giao dịch
- **Navigation System** - Hệ thống điều hướng quay lại

### **💱 Các Chức Năng UI:**
1. **Chuyển AniCoin** - Button chuyển AniCoin sang FishCoin
2. **Chuyển FishCoin** - Button chuyển FishCoin sang AniCoin
3. **Xem Tỷ Lệ** - Button xem chi tiết tỷ lệ chuyển đổi
4. **Lịch Sử** - Button xem lịch sử giao dịch
5. **Số Dư** - Button xem số dư hiện tại
6. **Quay Lại** - Button điều hướng về menu chính

## 🛠️ Các File Đã Tạo

### **1. Bank UI (`src/components/MessageComponent/BankUI.ts`)**
- **Class:** `BankUI`
- **Functions:**
  - `createBankInfoEmbed()` - Tạo embed thông tin ngân hàng
  - `createBankButtons()` - Tạo các button tương tác
  - `createRatesEmbed()` - Tạo embed tỷ lệ chuyển đổi
  - `createBalanceEmbed()` - Tạo embed số dư
  - `createHistoryEmbed()` - Tạo embed lịch sử
  - `createAmountSelectMenu()` - Tạo select menu chọn số tiền
  - `createConfirmEmbed()` - Tạo embed xác nhận
  - `createConfirmButtons()` - Tạo button xác nhận
  - `createResultEmbed()` - Tạo embed kết quả
  - `createBackButton()` - Tạo button quay lại

### **2. Bank Handler (`src/components/MessageComponent/BankHandler.ts`)**
- **Class:** `BankHandler`
- **Functions:**
  - `handleButtonInteraction()` - Xử lý button interaction
  - `handleSelectMenuInteraction()` - Xử lý select menu interaction
  - `handleExchangeAni()` - Xử lý chuyển AniCoin
  - `handleExchangeFish()` - Xử lý chuyển FishCoin
  - `handleRates()` - Xử lý xem tỷ lệ
  - `handleHistory()` - Xử lý xem lịch sử
  - `handleBalance()` - Xử lý xem số dư
  - `handleBack()` - Xử lý quay lại
  - `handleAmountSelect()` - Xử lý chọn số tiền
  - `handleConfirm()` - Xử lý xác nhận giao dịch

### **3. Bank Component (`src/components/MessageComponent/Bank.ts`)**
- **File:** Handler chính cho bank UI
- **Functions:**
  - `button()` - Xử lý button interaction
  - `selectMenu()` - Xử lý select menu interaction

### **4. Updated Command (`src/commands/text/ecommerce/bank.ts`)**
- **Command:** `n.bank` (cập nhật để sử dụng UI)
- **Thay đổi:** Sử dụng `BankUI` thay vì embed thủ công

## 🎮 Cách Sử Dụng UI

### **🚀 Khởi Động Bank UI:**
```bash
n.bank                    # Mở giao diện bank với buttons
```

### **💱 Chuyển Đổi Tiền Tệ:**
1. **Nhấn "💰 Chuyển AniCoin"** - Mở menu chọn số tiền AniCoin
2. **Chọn số tiền** - Từ select menu (1,000₳, 2,000₳, 5,000₳, 10,000₳, 20,000₳, 50,000₳)
3. **Xem xác nhận** - Kiểm tra thông tin chuyển đổi
4. **Nhấn "✅ Xác Nhận"** - Thực hiện giao dịch

### **📊 Xem Thông Tin:**
- **"📊 Xem Tỷ Lệ"** - Xem chi tiết tỷ lệ chuyển đổi
- **"📋 Lịch Sử"** - Xem lịch sử giao dịch gần đây
- **"💳 Số Dư"** - Xem số dư hiện tại và gợi ý chuyển đổi

### **🔙 Điều Hướng:**
- **"🔙 Quay Lại"** - Quay về menu chính
- **"❌ Hủy"** - Hủy giao dịch và quay lại

## 🧪 Test Results

### **Bank UI Test:**
```bash
npx tsx scripts/test-bank-ui.ts
```

### **Test Results:**
```
✅ Bank info embed created successfully
   Title: 🏦 Ngân Hàng Chuyển Đổi Tiền Tệ
   Description length: 433 characters

✅ Bank buttons created successfully
   Number of rows: 2
   Row 1 buttons: 2
   Row 2 buttons: 3

✅ AniCoin select menu created successfully
   Custom ID: bank_amount_anicoin
   Options count: 6

✅ FishCoin select menu created successfully
   Custom ID: bank_amount_fishcoin
   Options count: 6

✅ Button custom IDs:
   bank_exchange_ani
   bank_exchange_fish
   bank_rates
   bank_history
   bank_balance

✅ All Bank UI tests completed successfully!
```

## 🎮 UI Examples

### **🏦 Bank Info Display:**
```
🏦 Ngân Hàng Chuyển Đổi Tiền Tệ

Chào mừng đến với Ngân Hàng! Bạn có thể chuyển đổi giữa AniCoin và FishCoin.

📊 Tỷ Lệ Chuyển Đổi:
• AniCoin → FishCoin: 1₳ = 0.5🐟 (Tối thiểu 1,000₳)
• FishCoin → AniCoin: 1🐟 = 1.5₳ (Tối thiểu 1,000🐟)

💡 Sử Dụng:
• Nhấn Chuyển AniCoin để đổi AniCoin sang FishCoin
• Nhấn Chuyển FishCoin để đổi FishCoin sang AniCoin
• Nhấn Xem Tỷ Lệ để xem chi tiết tỷ lệ chuyển đổi
• Nhấn Lịch Sử để xem giao dịch gần đây

[💰 Chuyển AniCoin] [🐟 Chuyển FishCoin]
[📊 Xem Tỷ Lệ] [📋 Lịch Sử] [💳 Số Dư]
```

### **💰 Amount Selection Display:**
```
💰 Chuyển AniCoin Sang FishCoin

Chọn số tiền AniCoin bạn muốn chuyển đổi:

[Select Menu: 1,000₳ → 500🐟 | 2,000₳ → 1,000🐟 | 5,000₳ → 2,500🐟 | ...]

[🔙 Quay Lại]
```

### **💱 Confirmation Display:**
```
💱 Xác Nhận Chuyển Đổi

📊 Thông Tin Chuyển Đổi:

💰 Số tiền chuyển: 2,000₳
🎯 Sẽ nhận được: 1,000🐟
📈 Tỷ lệ: 1₳ = 0.5🐟

✅ Giao dịch hợp lệ

[✅ Xác Nhận] [❌ Hủy]
```

### **✅ Success Display:**
```
✅ Chuyển Đổi Thành Công!

Username đã chuyển đổi thành công!

💰 Đã chuyển: 2,000 AniCoin
🐟 Nhận được: 1,000 FishCoin
📊 Tỷ lệ: 1₳ = 0.5🐟

💳 Số Dư Mới:
• AniCoin: 8,000₳
• FishCoin: 10,500🐟

[🔙 Quay Lại]
```

## 🔧 Technical Details

### **UI Flow:**
1. **Main Menu** - Hiển thị thông tin và các button chính
2. **Currency Selection** - Chọn loại tiền tệ để chuyển
3. **Amount Selection** - Chọn số tiền từ select menu
4. **Confirmation** - Xác nhận thông tin giao dịch
5. **Execution** - Thực hiện giao dịch
6. **Result** - Hiển thị kết quả và số dư mới
7. **Navigation** - Quay lại menu chính

### **Component Structure:**
```typescript
BankUI (Static Class)
├── createBankInfoEmbed()
├── createBankButtons()
├── createRatesEmbed()
├── createBalanceEmbed()
├── createHistoryEmbed()
├── createAmountSelectMenu()
├── createConfirmEmbed()
├── createConfirmButtons()
├── createResultEmbed()
└── createBackButton()

BankHandler (Static Class)
├── handleButtonInteraction()
├── handleSelectMenuInteraction()
├── handleExchangeAni()
├── handleExchangeFish()
├── handleRates()
├── handleHistory()
├── handleBalance()
├── handleBack()
├── handleAmountSelect()
└── handleConfirm()
```

### **Custom IDs:**
- `bank_exchange_ani` - Chuyển AniCoin
- `bank_exchange_fish` - Chuyển FishCoin
- `bank_rates` - Xem tỷ lệ
- `bank_history` - Xem lịch sử
- `bank_balance` - Xem số dư
- `bank_back` - Quay lại
- `bank_amount_anicoin` - Select menu AniCoin
- `bank_amount_fishcoin` - Select menu FishCoin
- `bank_confirm_anicoin_<amount>` - Xác nhận AniCoin
- `bank_confirm_fishcoin_<amount>` - Xác nhận FishCoin

## 📊 Performance Improvements

1. **Interactive UI:** Giao diện tương tác thay vì lệnh text
2. **Quick Selection:** Select menu với các mức tiền phổ biến
3. **Visual Feedback:** Embed màu sắc và emoji trực quan
4. **Navigation System:** Hệ thống điều hướng dễ dàng
5. **Error Handling:** Xử lý lỗi với thông báo rõ ràng
6. **Real-time Updates:** Cập nhật số dư ngay lập tức

## 🚀 Tính Năng Tương Lai

1. **Custom Amount Input:** Nhập số tiền tùy chỉnh
2. **Bulk Exchange:** Chuyển đổi số lượng lớn
3. **Exchange History Charts:** Biểu đồ lịch sử giao dịch
4. **Exchange Alerts:** Thông báo khi tỷ lệ thay đổi
5. **Quick Exchange:** Giao dịch nhanh với preset
6. **Exchange Calculator:** Máy tính chuyển đổi tích hợp

---

## 🎉 **Hoàn Thành Bank UI System!**

### ✅ **Đã Thành Công:**
- 🏦 **Interactive Bank Interface** - Giao diện tương tác hoàn chỉnh
- 💰 **AniCoin/FishCoin Exchange UI** - UI chuyển đổi tiền tệ
- 📊 **Exchange Rates Display** - Hiển thị tỷ lệ chuyển đổi
- 📋 **Transaction History UI** - Giao diện lịch sử giao dịch
- 💳 **Balance Display** - Hiển thị số dư và gợi ý
- 🎯 **Amount Selection Menus** - Menu chọn số tiền
- ✅ **Confirmation Dialogs** - Hộp thoại xác nhận
- 🔙 **Navigation System** - Hệ thống điều hướng

### 🎮 **Cách Sử Dụng:**
- Mở UI: `n.bank`
- Chuyển AniCoin: Nhấn "💰 Chuyển AniCoin" → Chọn số tiền → Xác nhận
- Chuyển FishCoin: Nhấn "🐟 Chuyển FishCoin" → Chọn số tiền → Xác nhận
- Xem thông tin: Nhấn các button tương ứng
- Điều hướng: Sử dụng "🔙 Quay Lại"

### 📊 **Tỷ Lệ Chuyển Đổi:**
- **AniCoin → FishCoin:** 1₳ = 0.5🐟 (Tối thiểu 1,000₳)
- **FishCoin → AniCoin:** 1🐟 = 1.5₳ (Tối thiểu 1,000🐟)

**🎉 Bank UI đã hoàn thành và sẵn sàng sử dụng!** 🏦✨ 