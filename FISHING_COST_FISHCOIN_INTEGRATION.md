# 🎣 Phí Câu Cá & Thức Ăn FishCoin Integration

## 📋 Tổng Quan

Hệ thống **phí câu cá** và **mua thức ăn cho cá** đã được chuyển đổi hoàn toàn sang sử dụng **FishCoin** thay vì AniCoin. Tất cả các chi phí liên quan đến câu cá và nuôi cá đều sử dụng FishCoin.

## 🔄 Thay Đổi Chính

### **Trước Đây:**
- Phí câu cá: 10 AniCoin
- Mua thức ăn: AniCoin
- Hiển thị giá: "coins" hoặc "AniCoin"

### **Bây Giờ:**
- Phí câu cá: **10 FishCoin** 🐟
- Mua thức ăn: **FishCoin** 🐟
- Hiển thị giá: "FishCoin"

## 🛠️ Các File Đã Cập Nhật

### **1. Core Service (`src/utils/fishing.ts`)**
- **Constant:** `FISHING_COST = 10`
- **Function:** `fish()`
- **Thay đổi:**
  ```typescript
  // Trước:
  if (!balance || Number(balance.balance) < FISHING_COST) {
    throw new Error(`Bạn cần ít nhất ${FISHING_COST} AniCoin để câu cá!`);
  }
  await tx.user.update({
    where: { userId_guildId: { userId, guildId } },
    data: { balance: { decrement: FISHING_COST } }
  });

  // Sau:
  const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, FISHING_COST);
  if (!hasEnoughFishCoin) {
    throw new Error(`Bạn cần ít nhất ${FISHING_COST} FishCoin để câu cá!`);
  }
  await fishCoinDB.subtractFishCoin(userId, guildId, FISHING_COST, 'Fishing cost');
  ```

### **2. Fish Food Service (`src/utils/fish-food.ts`)**
- **Function:** `buyFishFood()`
- **Thay đổi:**
  ```typescript
  // Trước:
  if (!user || Number(user.balance) < totalCost) {
    return { success: false, error: `Không đủ AniCoin! Cần ${totalCost.toLocaleString()} AniCoin` };
  }
  await tx.user.update({
    where: { userId_guildId: { userId, guildId } },
    data: { balance: { decrement: totalCost } }
  });

  // Sau:
  const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, totalCost);
  if (!hasEnoughFishCoin) {
    return { success: false, error: `Không đủ FishCoin! Cần ${totalCost.toLocaleString()} FishCoin` };
  }
  await fishCoinDB.subtractFishCoin(userId, guildId, totalCost, `Buy fish food: ${foodInfo.name} x${quantity}`);
  ```

### **3. Command (`src/commands/text/ecommerce/fishing.ts`)**
- **Functions:** `fishWithAnimation()`, `buyItem()`, `showInventory()`, `showHelp()`
- **Thay đổi:**
  ```typescript
  // Trước:
  .setDescription("Bạn cần ít nhất 10 AniCoin để câu cá!")
  `🐟 **Giá trị:** ${value} AniCoin`
  `🐟 **Giá:** ${rod.price} AniCoin`
  "• Mỗi lần câu tốn 10 AniCoin"

  // Sau:
  .setDescription("Bạn cần ít nhất 10 FishCoin để câu cá!")
  `🐟 **Giá trị:** ${value} FishCoin`
  `🐟 **Giá:** ${rod.price} FishCoin`
  "• Mỗi lần câu tốn 10 FishCoin"
  ```

### **4. UI Components**
- **File:** `src/components/MessageComponent/FishBarnUI.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  description: `Power: ${totalPower} - ${fish.status} - ${finalValue.toLocaleString()} coins`
  description: `Còn lại: ${food.quantity} | Giá: ${food.foodInfo.price.toLocaleString()} coins`
  text += `**Giá trị:** ${finalValue.toLocaleString()} coins`

  // Sau:
  description: `Power: ${totalPower} - ${fish.status} - ${finalValue.toLocaleString()} FishCoin`
  description: `Còn lại: ${food.quantity} | Giá: ${food.foodInfo.price.toLocaleString()} FishCoin`
  text += `**Giá trị:** ${finalValue.toLocaleString()} FishCoin`
  ```

- **File:** `src/components/MessageComponent/BattleFishUI.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  `💪 Power: ${power} | 💰 ${fish.value.toLocaleString()} coins`
  .setDescription(`Power: ${power} | 💰${fish.value.toLocaleString()} | ${status}`)

  // Sau:
  `💪 Power: ${power} | 🐟 ${fish.value.toLocaleString()} FishCoin`
  .setDescription(`Power: ${power} | 🐟${fish.value.toLocaleString()} | ${status}`)
  ```

- **File:** `src/components/MessageComponent/BattleFishHandler.ts`
- **Thay đổi:**
  ```typescript
  // Trước:
  value: `🐟 ${userFishName} vs ${opponentFishName} | 💰 ${reward} coins`
  value: `🏆 ${user.wins}W/${user.totalBattles}L | 💰 ${totalEarnings.toLocaleString()} coins`
  { name: '💰 Phần thưởng', value: `${reward.toLocaleString()} coins` }

  // Sau:
  value: `🐟 ${userFishName} vs ${opponentFishName} | 🐟 ${reward} FishCoin`
  value: `🏆 ${user.wins}W/${user.totalBattles}L | 🐟 ${totalEarnings.toLocaleString()} FishCoin`
  { name: '🐟 Phần thưởng', value: `${reward.toLocaleString()} FishCoin` }
  ```

## 🎮 Các Lệnh Đã Cập Nhật

### **Câu Cá:**
```bash
n.fishing                    # Câu cá (tốn 10 FishCoin)
n.fish                      # Câu cá (tốn 10 FishCoin)
```

### **Mua Cần Câu:**
```bash
n.fishing buy basic 1       # Mua cần câu cơ bản (100 FishCoin)
n.fishing buy copper 1      # Mua cần câu đồng (1,000 FishCoin)
n.fishing buy silver 1      # Mua cần câu bạc (5,000 FishCoin)
n.fishing buy gold 1        # Mua cần câu vàng (15,000 FishCoin)
n.fishing buy diamond 1     # Mua cần câu kim cương (50,000 FishCoin)
```

### **Mua Mồi:**
```bash
n.fishing buy basic 5       # Mua mồi cơ bản x5 (50 FishCoin)
n.fishing buy premium 3     # Mua mồi thượng hạng x3 (600 FishCoin)
n.fishing buy luxury 2      # Mua mồi xa xỉ x2 (1,000 FishCoin)
```

### **Mua Thức Ăn (Qua UI):**
- **Thức Ăn Cơ Bản:** 10,000 FishCoin (+1 exp)
- **Thức Ăn Cao Cấp:** 30,000 FishCoin (+3 exp)
- **Thức Ăn Xa Xỉ:** 50,000 FishCoin (+5 exp)
- **Thức Ăn Huyền Thoại:** 100,000 FishCoin (+10 exp)

## 🧪 Test Results

### **Complete System Test:**
```bash
npx tsx scripts/test-complete-fishcoin-system.ts
```

### **Test Results:**
```
✅ Bought fishing rod: Cần câu đồng (1000 FishCoin)
✅ Bought fishing bait: Mồi thượng hạng x3 (600 FishCoin)
   User 1 balance after fishing setup: 100200 FishCoin

✅ Bought fish food: Thức Ăn Cao Cấp x2 (60000 FishCoin)

✅ All FishCoin system tests completed successfully!

📋 FishCoin now used for:
   🎣 Fishing rods and bait
   🍽️ Fish food
   💰 All fish-related transactions
```

## 💰 Chi Phí Chi Tiết

### **Phí Câu Cá:**
- **Mỗi lần câu:** 10 FishCoin
- **Cooldown:** 30 giây
- **Admin bypass:** Có thể câu liên tục (vẫn tốn phí)

### **Giá Cần Câu:**
- 🎣 **Cần câu cơ bản:** 100 FishCoin
- 🎣 **Cần câu đồng:** 1,000 FishCoin
- 🎣 **Cần câu bạc:** 5,000 FishCoin
- 🎣 **Cần câu vàng:** 15,000 FishCoin
- 💎 **Cần câu kim cương:** 50,000 FishCoin

### **Giá Mồi:**
- 🪱 **Mồi cơ bản:** 10 FishCoin
- 🪱 **Mồi thượng hạng:** 200 FishCoin
- 🪱 **Mồi xa xỉ:** 500 FishCoin

### **Giá Thức Ăn:**
- 🍞 **Thức Ăn Cơ Bản:** 10,000 FishCoin (+1 exp)
- 🥩 **Thức Ăn Cao Cấp:** 30,000 FishCoin (+3 exp)
- 🦐 **Thức Ăn Xa Xỉ:** 50,000 FishCoin (+5 exp)
- 🌟 **Thức Ăn Huyền Thoại:** 100,000 FishCoin (+10 exp)

## 🎮 UI Updates

### **Fishing Command Display:**
```
🎣 Câu Cá Thành Công!

🐟 **Cá đã bắt:** Cá rô phi
🐟 **Giá trị:** 46 FishCoin
🐟 **Số dư mới:** 1,036 FishCoin
```

### **Shop Display:**
```
🏪 Cửa Hàng Câu Cá

🎣 **Cần câu đồng:** 1,000 FishCoin
🪱 **Mồi thượng hạng:** 200 FishCoin
```

### **Inventory Display:**
```
🎒 Túi Đồ Câu Cá

🐟 **Cá rô phi** x3 (46 FishCoin)
🐟 **Cá chép** x1 (32 FishCoin)
```

### **Help Display:**
```
📖 Hướng Dẫn Câu Cá

• Mỗi lần câu tốn 10 FishCoin
• Cần cần câu và mồi để câu cá
• Cá huyền thoại được thêm vào rương nuôi
```

## ⚠️ Lưu Ý Quan Trọng

1. **Kiểm tra đủ FishCoin:** Hệ thống sẽ kiểm tra đủ FishCoin trước khi cho phép câu cá
2. **Transaction safety:** Sử dụng FishCoinService để đảm bảo tính nhất quán
3. **Error handling:** Hiển thị thông báo lỗi rõ ràng với số FishCoin cần thiết
4. **Admin bypass:** Admin vẫn phải trả phí câu cá nhưng có thể câu liên tục
5. **Inventory management:** Tự động quản lý cần câu và mồi

## 🔧 Technical Details

### **Transaction Flow:**
1. **Kiểm tra đủ FishCoin** - `fishCoinDB.hasEnoughFishCoin()`
2. **Trừ FishCoin câu cá** - `fishCoinDB.subtractFishCoin()`
3. **Chọn cá ngẫu nhiên** - Dựa trên cần câu và mồi
4. **Cộng cá vào inventory** - Tự động thêm vào túi
5. **Ghi lại giao dịch** - Trong FishTransaction table

### **Error Handling:**
```typescript
// Kiểm tra đủ FishCoin
const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, FISHING_COST);
if (!hasEnoughFishCoin) {
  throw new Error(`Bạn cần ít nhất ${FISHING_COST} FishCoin để câu cá!`);
}
```

### **Database Operations:**
- Sử dụng `fishCoinDB` service cho tất cả giao dịch FishCoin
- Ghi lại tất cả giao dịch trong `FishTransaction` table
- Tự động quản lý balance và inventory

## 📊 Performance Improvements

1. **Reduced transaction timeouts:** Tách FishCoin operations khỏi database transactions
2. **Better error handling:** Rõ ràng hơn về FishCoin requirements
3. **Consistent logging:** Tất cả giao dịch đều được ghi lại
4. **Inventory management:** Tự động quản lý cần câu và mồi

## 🚀 Tính Năng Tương Lai

1. **FishCoin fishing rewards:** Thưởng FishCoin cho câu cá hiếm
2. **FishCoin fishing streaks:** Thưởng cho chuỗi câu cá liên tục
3. **FishCoin fishing tournaments:** Giải đấu câu cá với FishCoin
4. **FishCoin fishing leaderboard:** Bảng xếp hạng người câu cá

---

## 🎉 **Hoàn Thành Tích Hợp Phí Câu Cá & Thức Ăn!**

### ✅ **Đã Thành Công:**
- 🎣 **Phí câu cá** - 10 FishCoin mỗi lần câu
- 🛒 **Mua cần câu** - Tất cả cần câu bằng FishCoin
- 🪱 **Mua mồi** - Tất cả mồi bằng FishCoin
- 🍽️ **Mua thức ăn** - Tất cả thức ăn bằng FishCoin
- 💰 **All transactions** - Tất cả giao dịch đều sử dụng FishCoin
- 📊 **Price displays** - Hiển thị giá FishCoin trong tất cả UI

### 🎮 **Cách Sử Dụng:**
- Câu cá với `n.fishing` (tốn 10 FishCoin)
- Mua cần câu và mồi với `n.fishing buy`
- Mua thức ăn qua UI trong `n.fishbarn`
- Kiểm tra balance với `!fishbalance`

**🎉 Phí câu cá và mua thức ăn đã hoàn toàn sử dụng FishCoin!** 🐟✨ 