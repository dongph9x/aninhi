# 🐟 FishBarn Sell Confirmation Feature

## 📋 Tổng Quan

Tính năng **Popup Xác Nhận Bán Cá** trong `n.fishbarn` giúp người dùng tránh bán nhầm cá quý giá bằng cách hiển thị popup xác nhận trước khi thực hiện hành động bán.

## 🎯 Mục Đích

- **Tránh bán nhầm**: Ngăn chặn việc bán nhầm cá do click sai
- **Hiển thị thông tin chi tiết**: Cho người dùng xem lại thông tin cá trước khi bán
- **Hiển thị giá bán**: Tính toán và hiển thị giá bán chính xác
- **Cảnh báo không thể hoàn tác**: Nhắc nhở rằng hành động này không thể hoàn tác

## 🔧 Cách Hoạt Động

### **1. Khi người dùng click "Bán Cá":**
- Hiển thị popup xác nhận thay vì bán ngay lập tức
- Popup chứa thông tin chi tiết về cá
- Hiển thị giá bán đã tính toán (bao gồm level bonus)

### **2. Thông tin hiển thị trong popup:**
- 🐟 **Tên cá**: Tên loài cá
- 📊 **Level**: Cấp độ hiện tại
- 🏷️ **Thế hệ**: Generation của cá
- 💰 **Giá bán**: Giá đã tính toán (base value + level bonus)
- ⭐ **Độ hiếm**: Rarity của cá
- 📈 **Trạng thái**: Status hiện tại

### **3. Buttons xác nhận:**
- **✅ Xác Nhận Bán**: Thực hiện bán cá
- **❌ Hủy Bỏ**: Đóng popup, không bán

## 🛠️ Files Đã Cập Nhật

### **1. FishBarnHandler (`src/components/MessageComponent/FishBarnHandler.ts`)**

#### **Thay đổi `handleSell`:**
```typescript
private static async handleSell(interaction, userId, guildId) {
  // Lấy thông tin cá để hiển thị trong popup xác nhận
  const inventory = await FishInventoryService.getFishInventory(userId, guildId);
  const selectedFish = inventory.items.find(item => item.fish.id === selectedFishId)?.fish;
  
  // Tính giá bán
  const levelBonus = selectedFish.level > 1 ? (selectedFish.level - 1) * 0.02 : 0;
  const finalValue = Math.floor(Number(selectedFish.value) * (1 + levelBonus));
  
  // Tạo embed xác nhận bán
  const confirmEmbed = new EmbedBuilder()
    .setTitle('⚠️ Xác Nhận Bán Cá')
    .setColor('#FFA500')
    .setDescription('Bạn có chắc chắn muốn bán con cá này không?')
    .addFields(
      { name: '🐟 Tên cá', value: selectedFish.species, inline: true },
      { name: '📊 Level', value: selectedFish.level.toString(), inline: true },
      { name: '🏷️ Thế hệ', value: `Gen.${selectedFish.generation}`, inline: true },
      { name: '💰 Giá bán', value: `${finalValue.toLocaleString()} FishCoin`, inline: true },
      { name: '⭐ Độ hiếm', value: selectedFish.rarity, inline: true },
      { name: '📈 Trạng thái', value: selectedFish.status, inline: true }
    )
    .setFooter({ text: 'Hành động này không thể hoàn tác!' })
    .setTimestamp();
  
  // Tạo buttons xác nhận
  const confirmRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`fishbarn_confirm_sell_${selectedFishId}`)
        .setLabel('✅ Xác Nhận Bán')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('💰'),
      new ButtonBuilder()
        .setCustomId('fishbarn_cancel_sell')
        .setLabel('❌ Hủy Bỏ')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🚫')
    );
  
  await interaction.reply({
    embeds: [confirmEmbed],
    components: [confirmRow],
    ephemeral: true
  });
}
```

#### **Thêm handlers mới:**
```typescript
// Xử lý xác nhận bán
private static async handleConfirmSell(interaction, userId, guildId, fishId) {
  const result = await FishInventoryService.sellFishFromInventory(userId, guildId, fishId);
  // ... logic bán cá và cập nhật UI
}

// Xử lý hủy bỏ
private static async handleCancelSell(interaction, userId, guildId) {
  await interaction.update({
    content: '❌ Đã hủy bỏ việc bán cá!',
    embeds: [],
    components: [],
  });
}
```

### **2. FishBreedingService (`src/utils/fish-breeding.ts`)**

#### **Thêm method kiểm tra:**
```typescript
/**
 * Check if fish is in battle inventory
 */
static async checkFishInBattleInventory(fishId: string) {
  const isInBattleInventory = await prisma.battleFishInventoryItem.findFirst({
    where: { fishId },
  });
  return !!isInBattleInventory;
}
```

## 🎮 Cách Sử Dụng

### **1. Mở FishBarn:**
```bash
n.fishbarn
```

### **2. Chọn cá để bán:**
- Chọn cá từ danh sách trong FishBarn UI

### **3. Click "Bán Cá":**
- Popup xác nhận sẽ xuất hiện với thông tin chi tiết

### **4. Xác nhận hoặc hủy bỏ:**
- **✅ Xác Nhận Bán**: Bán cá và nhận FishCoin
- **❌ Hủy Bỏ**: Đóng popup, không bán

## 🧪 Test Scripts

### **1. Tạo cá test:**
```bash
npx tsx scripts/create-test-fish-for-sell-confirmation.ts
```

### **2. Test popup xác nhận:**
```bash
npx tsx scripts/test-fishbarn-sell-confirmation.ts
```

## 📊 Kết Quả Test

### **Test Output:**
```
🐟 Test FishBarn Sell Confirmation Popup

1️⃣ Checking current inventory...
📊 Found 1 fish in inventory

2️⃣ Selected fish for testing:
   🐟 Species: Cá Test Bán
   📊 Level: 5
   🏷️ Generation: Gen.2
   ⭐ Rarity: rare
   📈 Status: adult
   💰 Base Value: 5,000 FishCoin

3️⃣ Calculating expected sell price...
   📈 Level Bonus: +8.0%
   💰 Final Price: 5,400 FishCoin

4️⃣ Simulating confirmation popup...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Xác Nhận Bán Cá
Bạn có chắc chắn muốn bán con cá này không?

🐟 Tên cá: Cá Test Bán
📊 Level: 5
🏷️ Thế hệ: Gen.2
💰 Giá bán: 5,400 FishCoin
⭐ Độ hiếm: rare
📈 Trạng thái: adult

Hành động này không thể hoàn tác!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

5️⃣ Confirmation buttons:
   [✅ Xác Nhận Bán] [❌ Hủy Bỏ]
```

## 🎯 Lợi Ích

### **Cho Người Dùng:**
- ✅ **An toàn**: Tránh bán nhầm cá quý
- ✅ **Minh bạch**: Xem rõ thông tin trước khi bán
- ✅ **Kiểm soát**: Có thể hủy bỏ nếu không muốn bán
- ✅ **Thông tin đầy đủ**: Biết chính xác giá sẽ nhận

### **Cho Hệ Thống:**
- ✅ **Giảm lỗi**: Ít trường hợp bán nhầm
- ✅ **UX tốt hơn**: Trải nghiệm người dùng mượt mà
- ✅ **Dễ bảo trì**: Code rõ ràng, dễ debug

## 🔄 Workflow

```
1. User opens n.fishbarn
2. User selects a fish
3. User clicks "Bán Cá" button
4. Confirmation popup appears
5. User reviews fish information and price
6. User clicks "✅ Xác Nhận Bán" or "❌ Hủy Bỏ"
7. If confirmed: Fish is sold, user receives FishCoin
8. If cancelled: Popup closes, no action taken
```

## 📝 Ghi Chú

- **Level Bonus**: Tăng 2% giá trị cho mỗi level > 1
- **Ephemeral**: Popup chỉ hiển thị cho người dùng thực hiện
- **Battle Inventory Check**: Không thể bán cá đang trong túi đấu
- **Real-time Price**: Giá được tính toán theo thời gian thực 