# 🎣 Tích Hợp FishCoin Vào Hệ Thống Fishing

## 📋 Tổng Quan

Hệ thống fishing đã được cập nhật để sử dụng **FishCoin** thay vì AniCoin cho tất cả các giao dịch liên quan đến câu cá.

## 🔄 Thay Đổi Chính

### **Trước Đây:**
- Mua cần câu: AniCoin
- Mua mồi: AniCoin
- Hiển thị giá: ₳ (AniCoin symbol)

### **Bây Giờ:**
- Mua cần câu: **FishCoin** 🐟
- Mua mồi: **FishCoin** 🐟
- Hiển thị giá: 🐟 (FishCoin symbol)

## 🛠️ Các File Đã Cập Nhật

### **1. `src/utils/fishing.ts`**
- ✅ Cập nhật `buyRod()` để sử dụng FishCoin
- ✅ Cập nhật `buyBait()` để sử dụng FishCoin
- ✅ Sử dụng `fishCoinDB.hasEnoughFishCoin()` để kiểm tra balance
- ✅ Sử dụng `fishCoinDB.subtractFishCoin()` để trừ tiền
- ✅ Ghi lại lịch sử giao dịch FishCoin

### **2. `src/components/MessageComponent/BuyBaitQuantity.ts`**
- ✅ Hiển thị giá bằng FishCoin thay vì AniCoin
- ✅ Cập nhật emoji từ 💰 thành 🐟

### **3. `src/components/MessageComponent/BuyBait.ts`**
- ✅ Hiển thị giá bằng FishCoin trong dropdown
- ✅ Cập nhật label và description

### **4. `src/components/MessageComponent/BuyRod.ts`**
- ✅ Hiển thị giá bằng FishCoin
- ✅ Cập nhật emoji từ 💰 thành 🐟

### **5. `src/components/MessageComponent/FishingShop.ts`**
- ✅ Hiển thị giá mồi bằng FishCoin
- ✅ Cập nhật symbol từ ₳ thành 🐟

### **6. `src/commands/text/ecommerce/fishing.ts`**
- ✅ Cập nhật shop display để hiển thị FishCoin
- ✅ Cập nhật success messages

## 🎯 Các Lệnh Đã Cập Nhật

### **Mua Cần Câu:**
```bash
n.fishing buy copper 1
# Hoặc qua UI: FishingShop -> Buy Rod
```
**Giá cần câu:**
- 🎣 Cần câu cơ bản: 100 🐟
- 🎣 Cần câu đồng: 1,000 🐟
- 🎣 Cần câu bạc: 5,000 🐟
- 🎣 Cần câu vàng: 15,000 🐟
- 💎 Cần câu kim cương: 50,000 🐟

### **Mua Mồi:**
```bash
n.fishing buy premium 5
# Hoặc qua UI: FishingShop -> Buy Bait
```
**Giá mồi:**
- 🪱 Mồi cơ bản: 10 🐟
- 🦐 Mồi ngon: 50 🐟
- 🦀 Mồi thượng hạng: 200 🐟
- 🧜‍♀️ Mồi thần: 1,000 🐟

## 🧪 Test Results

### **Test Script:**
```bash
npx tsx scripts/test-fishing-fishcoin.ts
```

### **Test Results:**
```
✅ Successfully bought fishing rod: Cần câu đồng
   Price: 1000 FishCoin
   Durability: 25
   Rarity bonus: 2%

✅ Successfully bought fishing bait: Mồi thượng hạng
   Quantity: 5
   Price per bait: 200 FishCoin
   Total cost: 1000 FishCoin
   Rarity bonus: 6%

✅ Correctly failed with insufficient FishCoin: Không đủ FishCoin! Cần 50000 FishCoin
```

## 💰 Lịch Sử Giao Dịch FishCoin

Tất cả giao dịch mua cần câu và mồi đều được ghi lại trong `FishTransaction`:

```
✅ FishCoin transactions:
   1. subtract: -5000 FishCoin - Buy fishing rod: Cần câu bạc
   2. subtract: -500 FishCoin - Buy fishing bait: Mồi ngon x10
   3. subtract: -1000 FishCoin - Buy fishing bait: Mồi thượng hạng x5
   4. subtract: -1000 FishCoin - Buy fishing rod: Cần câu đồng
```

## 🎮 UI Updates

### **Shop Display:**
```
🏪 Cửa Hàng Câu Cá

🎣 Cần câu đồng - 1,000🐟 | Độ bền: 25 | Bonus: +2%
🎣 Cần câu bạc - 5,000🐟 | Độ bền: 50 | Bonus: +4%

🪱 Mồi cơ bản - 10🐟 | Bonus: +0%
🦐 Mồi ngon - 50🐟 | Bonus: +3%
🦀 Mồi thượng hạng - 200🐟 | Bonus: +6%
```

### **Success Messages:**
```
✅ Mua Thành Công!

Username đã mua:

🎣 Cần câu đồng
🐟 Giá: 1,000 FishCoin
🔧 Độ bền: 25
📈 Tăng tỷ lệ hiếm: +2%

🦀 Mồi thượng hạng x5
🐟 Tổng giá: 1,000 FishCoin
📈 Tăng tỷ lệ hiếm: +6%
```

## ⚠️ Lưu Ý Quan Trọng

1. **Tách biệt hoàn toàn:** FishCoin và AniCoin không thể chuyển đổi lẫn nhau
2. **Kiểm tra balance:** Hệ thống tự động kiểm tra đủ FishCoin trước khi mua
3. **Lịch sử đầy đủ:** Tất cả giao dịch đều được ghi lại với mô tả chi tiết
4. **Admin bypass:** Admin vẫn có thể câu cá mà không cần cần câu/mồi
5. **Tự động set:** Hệ thống tự động đặt cần câu/mồi đầu tiên làm hiện tại

## 🔧 Technical Details

### **Database Changes:**
- Sử dụng `fishBalance` thay vì `balance` cho fishing purchases
- Ghi lại giao dịch trong `FishTransaction` table
- Sử dụng `fishCoinDB` service cho tất cả operations

### **Error Handling:**
- Kiểm tra đủ FishCoin trước khi thực hiện giao dịch
- Hiển thị thông báo lỗi rõ ràng với số FishCoin cần thiết
- Rollback tự động nếu có lỗi

### **Performance:**
- Tách riêng FishCoin operations khỏi database transactions
- Tránh transaction timeout issues
- Sử dụng BigInt cho số lượng lớn

## 🚀 Tính Năng Tương Lai

1. **FishCoin rewards:** Nhận FishCoin khi câu được cá hiếm
2. **FishCoin daily:** Nhận FishCoin hàng ngày cho fishing
3. **FishCoin tournaments:** Giải đấu câu cá với FishCoin prizes
4. **FishCoin market:** Mua bán cá bằng FishCoin
5. **FishCoin leaderboard:** Bảng xếp hạng FishCoin fishing

---

**🎉 Hệ thống fishing đã hoàn toàn tích hợp với FishCoin!** 🐟✨ 