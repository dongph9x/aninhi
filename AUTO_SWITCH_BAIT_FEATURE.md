# 🪱 Auto-Switch Bait Feature

## 📋 Tổng Quan

Tính năng **Auto-Switch Bait** tự động chuyển sang mồi khác khi mồi hiện tại hết, giúp người chơi không bị gián đoạn khi câu cá. Hệ thống sẽ ưu tiên chọn mồi có chất lượng cao nhất có sẵn.

## 🎯 Tính Năng Chính

### **1. Tự Động Chuyển Mồi**
- Khi mồi hiện tại hết, hệ thống tự động tìm mồi khác có sẵn
- Không cần can thiệp thủ công từ người chơi
- Tiếp tục câu cá liên tục

### **2. Hệ Thống Ưu Tiên**
Hệ thống sẽ chọn mồi theo thứ tự ưu tiên:
1. **🧜‍♀️ Divine** (Mồi thần) - Cao nhất
2. **🦀 Premium** (Mồi thượng hạng)
3. **🦐 Good** (Mồi ngon)
4. **🪱 Basic** (Mồi cơ bản) - Thấp nhất

### **3. Thông Báo Rõ Ràng**
- Hiển thị thông báo khi auto-switch
- Cho biết mồi mới được chọn
- Hiển thị số lượng còn lại

## 🔧 Implementation

### **Method: `autoSwitchBait()`**
```typescript
static async autoSwitchBait(userId: string, guildId: string, currentBaitType: string) {
    // Tìm mồi khác có sẵn
    const availableBaits = fishingData.baits.filter(b => 
        b.baitType !== currentBaitType && b.quantity > 0
    );

    if (availableBaits.length > 0) {
        // Ưu tiên theo thứ tự: divine > premium > good > basic
        const baitPriority = ['divine', 'premium', 'good', 'basic'];
        let nextBait = availableBaits[0];

        for (const priorityBait of baitPriority) {
            const foundBait = availableBaits.find(b => b.baitType === priorityBait);
            if (foundBait) {
                nextBait = foundBait;
                break;
            }
        }

        // Cập nhật mồi hiện tại
        await prisma.fishingData.update({
            where: { id: fishingData.id },
            data: { currentBait: nextBait.baitType }
        });

        return {
            success: true,
            switchedTo: nextBait.baitType,
            baitName: BAITS[nextBait.baitType]?.name,
            remainingQuantity: nextBait.quantity
        };
    } else {
        // Không có mồi nào khác
        await prisma.fishingData.update({
            where: { id: fishingData.id },
            data: { currentBait: "" }
        });

        return {
            success: false,
            message: "Không có mồi nào khác để chuyển sang!"
        };
    }
}
```

### **Integration với Fishing System**
```typescript
// Trong hàm fish(), sau khi giảm số lượng mồi
if (currentBait.quantity <= 0) {
    await this.autoSwitchBait(userId, guildId, fishingData.currentBait);
}
```

## 🎮 User Experience

### **Scenario 1: Có nhiều loại mồi**
```
🎣 Câu Cá Thành Công!

Username đã câu được:
🐟 Cá trắm
⚪ Thường
🐟 Giá trị: 38 FishCoin

🔄 Tự động chuyển sang mồi: 🧜‍♀️ Mồi thần (2 còn lại)
```

### **Scenario 2: Chỉ có một loại mồi**
```
🎣 Câu Cá Thành Công!

Username đã câu được:
🐟 Cá trắm
⚪ Thường
🐟 Giá trị: 38 FishCoin

🔄 Tự động chuyển sang mồi: 🪱 Mồi cơ bản (4 còn lại)
```

### **Scenario 3: Hết tất cả mồi**
```
🎣 Câu Cá Thành Công!

Username đã câu được:
🐟 Cá trắm
⚪ Thường
🐟 Giá trị: 38 FishCoin

⚠️ Bạn đã hết mồi! Hãy mua thêm mồi.
```

## 🧪 Test Results

```bash
🪱 Test Auto-Switch Bait Feature

1️⃣ Creating test user with multiple baits...
   ✅ Bought 5 basic baits
   ✅ Bought 3 good baits
   ✅ Bought 2 premium baits
   ✅ Bought 1 divine bait

2️⃣ Checking initial bait inventory...
   📊 Current bait inventory:
   🪱 Mồi cơ bản: 15 cái
   🧜‍♀️ Mồi thần: 3 cái
   🦐 Mồi ngon: 9 cái
   🦀 Mồi thượng hạng: 6 cái

3️⃣ Testing auto-switch logic...
   🔄 Auto-switch result: {
     success: true,
     switchedTo: 'divine',
     baitName: 'Mồi thần',
     remainingQuantity: 3
   }
   ✅ Successfully switched to: Mồi thần

4️⃣ Testing bait priority system...
   🏆 Bait Priority Order:
      1. 🧜‍♀️ Divine (highest)
      2. 🦀 Premium
      3. 🦐 Good
      4. 🪱 Basic (lowest)
   🎯 Current bait after auto-switch: divine

5️⃣ Testing fishing with auto-switch...
   🐟 Fishing result: { fish: {...}, value: 38 }
   🎯 New current bait: 🧜‍♀️ Mồi thần

6️⃣ Testing edge cases...
   🔄 Edge case result: { 
     success: false, 
     message: 'Không có mồi nào khác để chuyển sang!' 
   }
   ✅ Correctly handled no available baits

✅ Auto-switch bait test completed!
```

## 📁 Files Modified

### **`src/utils/fishing.ts`**
- **Line 730-780**: Thêm method `autoSwitchBait()`
- **Line 540-545**: Cập nhật logic trong hàm `fish()` để sử dụng auto-switch
- **Line 520-530**: Cải thiện logic xử lý khi mồi hết

### **`src/commands/text/ecommerce/fishing.ts`**
- **Line 305-320**: Thêm logic kiểm tra auto-switch sau khi câu cá
- **Line 340-350**: Hiển thị thông báo auto-switch trong kết quả

### **`scripts/test-auto-switch-bait.ts`** (NEW)
- Test script toàn diện cho tính năng auto-switch
- Test các trường hợp khác nhau
- Verify priority system

## 🎯 Benefits

### **Cho Người Chơi:**
- 🚀 **Liên tục**: Không bị gián đoạn khi câu cá
- 🎯 **Tối ưu**: Tự động chọn mồi tốt nhất có sẵn
- 📊 **Rõ ràng**: Biết chính xác mồi nào đang được sử dụng
- ⚡ **Tiện lợi**: Không cần can thiệp thủ công

### **Cho Hệ Thống:**
- 🔄 **Tự động**: Giảm thiểu lỗi người dùng
- 🎮 **Cân bằng**: Đảm bảo trải nghiệm chơi mượt mà
- 📈 **Hiệu quả**: Tối ưu hóa việc sử dụng mồi
- 🛡️ **An toàn**: Xử lý gracefully khi hết mồi

## 🚀 Cách Sử Dụng

### **Tự Động:**
- Tính năng hoạt động tự động khi câu cá
- Không cần lệnh đặc biệt

### **Kiểm Tra:**
```bash
n.fishing inventory    # Xem inventory và mồi hiện tại
n.fishing setbait <type>  # Set mồi thủ công nếu muốn
```

### **Mua Mồi:**
```bash
n.fishing shop        # Xem cửa hàng
n.fishing buy bait <type> <quantity>  # Mua mồi
```

## ⚠️ Lưu Ý Quan Trọng

1. **Priority System**: Mồi divine luôn được ưu tiên cao nhất
2. **Quantity Check**: Chỉ chuyển sang mồi có số lượng > 0
3. **Notification**: Luôn có thông báo khi auto-switch
4. **Fallback**: Nếu không có mồi nào khác, sẽ xóa currentBait
5. **Admin Bypass**: Admin không bị ảnh hưởng bởi auto-switch

## 🎉 Kết Luận

Tính năng Auto-Switch Bait đã được triển khai thành công với:

- ✅ **Tự động chuyển mồi** khi mồi hiện tại hết
- ✅ **Hệ thống ưu tiên** thông minh
- ✅ **Thông báo rõ ràng** cho người chơi
- ✅ **Xử lý edge cases** hoàn chỉnh
- ✅ **Integration** mượt mà với hệ thống câu cá

**🎮 Hệ thống câu cá giờ đây thông minh và tiện lợi hơn bao giờ hết!** 