# 🏪 Fish Market FishCoin Integration

## 📋 Tổng Quan

Hệ thống **Fish Market** đã được chuyển đổi hoàn toàn sang sử dụng **FishCoin** thay vì AniCoin. Tất cả các giao dịch mua bán cá trên thị trường đều sử dụng FishCoin.

## 🔄 Thay Đổi Chính

### **Trước Đây:**
- Mua bán cá: AniCoin
- Hiển thị giá: "coins"
- Sử dụng `balance` field

### **Bây Giờ:**
- Mua bán cá: **FishCoin** 🐟
- Hiển thị giá: "FishCoin"
- Sử dụng `fishBalance` field

## 🛠️ Các File Đã Cập Nhật

### **1. Core Service (`src/utils/fish-market.ts`)**
- **Function:** `buyFish()`
- **Thay đổi:**
  ```typescript
  // Trước:
  await tx.user.update({
    where: { userId_guildId: { userId, guildId } },
    data: { balance: { decrement: listing.price } }
  });

  // Sau:
  await fishCoinDB.subtractFishCoin(userId, guildId, listing.price, `Buy fish from market: ${listing.fish.species}`);
  await fishCoinDB.addFishCoin(listing.sellerId, guildId, listing.price, `Sold fish in market: ${listing.fish.species}`);
  ```

### **2. Command (`src/commands/text/ecommerce/fishmarket.ts`)**
- **Functions:** `sellFish()`, `buyFish()`, `showMarketListings()`
- **Thay đổi:**
  ```typescript
  // Trước:
  { name: "💰 Giá bán", value: `${price.toLocaleString()} coins`, inline: true }
  
  // Sau:
  { name: "🐟 Giá bán", value: `${price.toLocaleString()} FishCoin`, inline: true }
  ```

### **3. UI Components**
- **File:** `src/components/MessageComponent/FishMarketUI.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  label: `${fish.name} - ${listing.price.toLocaleString()} coins`
  
  // Sau:
  label: `${fish.name} - ${listing.price.toLocaleString()} FishCoin`
  ```

- **File:** `src/components/MessageComponent/FishMarketHandler.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  .setLabel('Giá bán (coins)')
  content: `✅ Đã treo bán **${result.listing.fish.name}** với giá **${price.toLocaleString()}** coins`
  
  // Sau:
  .setLabel('Giá bán (FishCoin)')
  content: `✅ Đã treo bán **${result.listing.fish.name}** với giá **${price.toLocaleString()}** FishCoin`
  ```

- **File:** `src/components/ModalSubmit/MarketSellModal.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  content: `✅ Đã treo bán **${result.listing.fish.name}** với giá **${price.toLocaleString()}** coins`
  
  // Sau:
  content: `✅ Đã treo bán **${result.listing.fish.name}** với giá **${price.toLocaleString()}** FishCoin`
  ```

## 🎮 Các Lệnh Đã Cập Nhật

### **Fish Market Commands:**
```bash
n.fishmarket                    # Xem danh sách cá đang bán (hiển thị giá FishCoin)
n.fishmarket sell <id> <price>  # Bán cá với giá FishCoin
n.fishmarket buy <id>           # Mua cá bằng FishCoin
n.fishmarket my                 # Xem cá của mình đang bán
n.fishmarket search <name>      # Tìm kiếm cá
n.fishmarket filter <options>   # Lọc cá theo tiêu chí
n.fishmarket ui                 # Giao diện UI tương tác
```

### **Ví dụ Sử Dụng:**
```bash
n.fishmarket sell cmd123 5000   # Bán cá với giá 5,000 FishCoin
n.fishmarket buy cmd456         # Mua cá bằng FishCoin
n.fishmarket search "Little"    # Tìm cá có tên chứa "Little"
```

## 🧪 Test Results

### **Fish Market Test:**
```bash
npx tsx scripts/test-fishmarket-fishcoin.ts
```

### **Test Results:**
```
✅ Listed fish on market successfully
   Fish: Cá Market Test
   Price: 2500 FishCoin
   Duration: 24 hours

✅ Bought fish from market successfully
   Fish: Cá Market Test
   Price paid: 2500 FishCoin
   Seller balance after sale: 37500 FishCoin
   Buyer balance after purchase: 7500 FishCoin

✅ Correctly failed to buy fish due to insufficient FishCoin
   Error: Không đủ FishCoin! Cần 10000 FishCoin

✅ Seller has 6 transactions
✅ Buyer has 6 transactions
```

## 💰 Lịch Sử Giao Dịch FishCoin

### **Seller Transactions:**
```
1. add: 2500 FishCoin - Sold fish in market: Cá Market Test
2. add: 10000 FishCoin - Test FishCoin for seller
3. add: 2500 FishCoin - Sold fish in market: Cá Market Test
```

### **Buyer Transactions:**
```
1. subtract: -2500 FishCoin - Buy fish from market: Cá Market Test
2. add: 5000 FishCoin - Test FishCoin for buyer
3. subtract: -2500 FishCoin - Buy fish from market: Cá Market Test
```

## 🎮 UI Updates

### **Market Listings Display:**
```
🏪 Fish Market

🐟 Cá Market Test (Lv.5, Gen.2) - 🐟2,500
**Power:** 150 | **Rarity:** rare | **Còn lại:** 24h
**Stats:** 💪30 🏃30 🧠30 🛡️30 🍀30
**ID:** `cmd123` | **Người bán:** @username
```

### **Success Messages:**
```
✅ Đã treo bán cá thành công!

🐟 Cá Market Test đã được đưa lên market
🐟 Giá bán: 2,500 FishCoin
⏰ Thời gian: 24 giờ
📊 Thông tin cá: Level: 5 | Gen: 2 | Power: 150
```

### **Buy Success:**
```
🛒 Mua cá thành công!

🐟 Cá Market Test đã được thêm vào inventory của bạn
🐟 Giá đã trả: 2,500 FishCoin
📊 Thông tin cá: Level: 5 | Gen: 2 | Power: 150
```

## ⚠️ Lưu Ý Quan Trọng

1. **Kiểm tra đủ FishCoin:** Hệ thống sẽ kiểm tra đủ FishCoin trước khi cho phép mua
2. **Transaction safety:** Sử dụng FishCoinService để đảm bảo tính nhất quán
3. **Inventory transfer:** Cá sẽ được chuyển từ inventory của seller sang buyer
4. **Error handling:** Hiển thị thông báo lỗi rõ ràng với số FishCoin cần thiết
5. **Listing cleanup:** Tự động xóa listing sau khi mua thành công

## 🔧 Technical Details

### **Transaction Flow:**
1. **Kiểm tra đủ FishCoin** - `fishCoinDB.hasEnoughFishCoin()`
2. **Trừ FishCoin người mua** - `fishCoinDB.subtractFishCoin()`
3. **Cộng FishCoin người bán** - `fishCoinDB.addFishCoin()`
4. **Chuyển cá** - Update fish ownership
5. **Xóa listing** - Remove from market
6. **Chuyển inventory** - Move to buyer's inventory

### **Error Handling:**
```typescript
// Kiểm tra đủ FishCoin
const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, listing.price);
if (!hasEnoughFishCoin) {
  return { success: false, error: `Không đủ FishCoin! Cần ${listing.price} FishCoin` };
}
```

### **Database Operations:**
- Sử dụng `prisma.$transaction()` để đảm bảo tính nhất quán
- Xóa cá khỏi inventory của seller trước khi thêm vào buyer
- Ghi lại tất cả giao dịch trong `FishTransaction` table

## 📊 Performance Improvements

1. **Reduced transaction timeouts:** Tách FishCoin operations khỏi database transactions
2. **Better error handling:** Rõ ràng hơn về FishCoin requirements
3. **Consistent logging:** Tất cả giao dịch đều được ghi lại
4. **Inventory management:** Tự động quản lý inventory khi chuyển cá

## 🚀 Tính Năng Tương Lai

1. **FishCoin market fees:** Phí giao dịch thị trường
2. **FishCoin market rewards:** Thưởng cho người bán cá hiếm
3. **FishCoin market statistics:** Thống kê giao dịch FishCoin
4. **FishCoin market leaderboard:** Bảng xếp hạng người bán cá

---

## 🎉 **Hoàn Thành Tích Hợp Fish Market!**

### ✅ **Đã Thành Công:**
- 🏪 **Listing fish** - Bán cá với giá FishCoin
- 🛒 **Buying fish** - Mua cá bằng FishCoin
- 💰 **All transactions** - Tất cả giao dịch đều sử dụng FishCoin
- 📊 **Price displays** - Hiển thị giá FishCoin trong tất cả UI
- 🔄 **Inventory transfer** - Tự động chuyển cá giữa inventory

### 🎮 **Cách Sử Dụng:**
- Tất cả giao dịch market đều sử dụng FishCoin 🐟
- Kiểm tra balance với `!fishbalance`
- Xem market với `n.fishmarket`
- Mua bán cá với FishCoin

**🎉 Fish Market đã hoàn toàn sử dụng FishCoin!** 🐟✨ 