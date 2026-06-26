# FishBarn Duplicate Custom ID Fix

## Tóm tắt
Đã sửa lỗi Discord API Error 50035 khi FishBarn UI tạo components với duplicate custom_id.

## Lỗi gốc

```
DiscordAPIError[50035]: Invalid Form Body
components[2].components[0].custom_id[COMPONENT_CUSTOM_ID_DUPLICATED]: Component custom id cannot be duplicated
components[2].components[1].custom_id[COMPONENT_CUSTOM_ID_DUPLICATED]: Component custom id cannot be duplicated
components[2].components[2].custom_id[COMPONENT_CUSTOM_ID_DUPLICATED]: Component custom id cannot be duplicated
```

## Nguyên nhân
- Discord yêu cầu mỗi component phải có unique custom_id
- FishBarn UI đang push `actionRow1` vào components nhiều lần
- Select menu trong `handleNoFood` sử dụng JSON string làm custom_id

## Thay đổi

### 1. Cập nhật FishBarnUI - Fix duplicate actionRow1
**File:** `src/components/MessageComponent/FishBarnUI.ts`

**Thay đổi:**
- Loại bỏ việc push `actionRow1` nhiều lần trong food selection logic

**Code trước:**
```typescript
if (availableFoodOptions.length > 0) {
  const foodSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(/* ... */);
  components.push(actionRow1, foodSelectRow);
} else {
  const noFoodRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(/* ... */);
  components.push(actionRow1, noFoodRow);
}
```

**Code sau:**
```typescript
if (availableFoodOptions.length > 0) {
  const foodSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
    .addComponents(/* ... */);
  components.push(foodSelectRow);
} else {
  const noFoodRow = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(/* ... */);
  components.push(noFoodRow);
}
```

### 2. Cập nhật FishBarnHandler - Fix JSON custom_id
**File:** `src/components/MessageComponent/FishBarnHandler.ts`

**Thay đổi:**
- Thay đổi custom_id từ JSON string thành simple string
- Thêm handler cho custom_id mới

**Code trước:**
```typescript
const row = new ActionRowBuilder<StringSelectMenuBuilder>()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId(JSON.stringify({ n: "BuyFishFood", d: {} }))
      .setPlaceholder("Chọn loại thức ăn...")
      // ...
  );
```

**Code sau:**
```typescript
const row = new ActionRowBuilder<StringSelectMenuBuilder>()
  .addComponents(
    new StringSelectMenuBuilder()
      .setCustomId('fishbarn_buy_fish_food')
      .setPlaceholder("Chọn loại thức ăn...")
      // ...
  );
```

### 3. Thêm handler cho BuyFishFood
**File:** `src/components/MessageComponent/FishBarnHandler.ts`

**Thêm:**
```typescript
case 'fishbarn_buy_fish_food':
  if (interaction.isStringSelectMenu()) {
    await this.handleBuyFishFood(interaction, userId, guildId);
  }
  break;
```

**Thêm function:**
```typescript
private static async handleBuyFishFood(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
  const foodType = interaction.values[0];
  
  // Mua thức ăn
  const { FishFoodService } = await import('@/utils/fish-food');
  const result = await FishFoodService.buyFishFood(userId, guildId, foodType as any, 1);
  
  if (!result.success) {
    return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
  }
  
  // Quay lại FishBarn
  await this.handleBackToBarn(interaction, userId, guildId);
  
  // Gửi thông báo thành công
  const embed = new EmbedBuilder()
    .setTitle('🛒 Mua Thức Ăn Thành Công!')
    .setColor('#00FF00')
    .addFields(
      { name: '🍽️ Thức Ăn', value: result.foodInfo?.name || 'Unknown', inline: true },
      { name: '💰 Giá', value: (result.totalCost || 0).toLocaleString(), inline: true },
      { name: '📦 Số lượng', value: (result.quantity || 0).toString(), inline: true }
    );
  
  await interaction.followUp({ embeds: [embed], ephemeral: true });
}
```

## Test Results

```
🧪 Test 1: Check inventory
   Total fish in inventory: 1
   Non-max level fish (< 10): 1
   Selected fish ID: cmdbvz0cv000xrw1a6iwo57l8
   ✅ Inventory check successful!

🧪 Test 2: Simulate createUIWithFishFood
   Auto-selected fish ID: cmdbvz0cv000xrw1a6iwo57l8
   Final selected fish ID: cmdbvz0cv000xrw1a6iwo57l8
   Breeding mode: false
   ✅ createUIWithFishFood simulation successful!

🧪 Test 3: Simulate handleBackToBarn
   Selected fish ID: cmdbvz0cv000xrw1a6iwo57l8
   Selected food type: basic
   Breeding mode: false
   Available fish count: 1
   Row 1 components: [ 'fishbarn_feed', 'fishbarn_sell', 'fishbarn_breed' ]
   Row 2 components: [ 'fishbarn_select_fish' ]
   Row 3 components: [ 'fishbarn_select_food' ]
   Row 4 components: [ 'fishbarn_close' ]
   All custom IDs: [
     'fishbarn_feed',
     'fishbarn_sell',
     'fishbarn_breed',
     'fishbarn_select_fish',
     'fishbarn_select_food',
     'fishbarn_close'
   ]
   ✅ No duplicate custom IDs found
   ✅ handleBackToBarn simulation successful!
```

## Logic hoạt động

### Trước khi fix:
- ❌ `actionRow1` được push nhiều lần vào components
- ❌ Select menu sử dụng JSON string làm custom_id
- ❌ Discord API từ chối request vì duplicate custom_id
- ❌ FishBarn command bị lỗi

### Sau khi fix:
- ✅ `actionRow1` chỉ được push 1 lần
- ✅ Select menu sử dụng simple string làm custom_id
- ✅ Mỗi component có unique custom_id
- ✅ Discord API chấp nhận request
- ✅ FishBarn command hoạt động bình thường

## Cách hoạt động

1. **Normal mode:** `actionRow1` + `selectRow` + `foodSelectRow` + `closeRow`
2. **No food mode:** `actionRow1` + `noFoodRow` + `closeRow`
3. **Buy food mode:** `buyFoodRow` + `backRow`
4. **Mỗi row:** Chỉ được push 1 lần vào components

## Lưu ý quan trọng

1. **Unique custom_id** - Mỗi component có custom_id duy nhất
2. **No duplicate rows** - Không push cùng một row nhiều lần
3. **Simple custom_id** - Sử dụng simple string thay vì JSON
4. **Proper handlers** - Mỗi custom_id có handler tương ứng

## Trạng thái

✅ **Đã hoàn thành** - Fix lỗi duplicate custom_id
✅ **Đã test** - Tất cả logic hoạt động đúng
✅ **Tuân thủ Discord rules** - Không bao giờ có duplicate custom_id

## Script test

```bash
# Test FishBarn duplicate IDs
./scripts/docker-run-script.sh test-fishbarn-duplicate-ids

# Test FishBarn handlers
./scripts/docker-run-script.sh test-fishbarn-handlers
```

## Files đã sửa

- `src/components/MessageComponent/FishBarnUI.ts` - Loại bỏ duplicate actionRow1
- `src/components/MessageComponent/FishBarnHandler.ts` - Fix JSON custom_id và thêm handler
- `scripts/test-fishbarn-duplicate-ids.ts` - Script test mới
- `scripts/test-fishbarn-handlers.ts` - Script test mới
- `FISHBARN_DUPLICATE_IDS_FIX_README.md` - Documentation

## Kết luận

Lỗi Discord API Error 50035 đã được fix bằng cách loại bỏ duplicate custom_id và sử dụng simple string thay vì JSON. FishBarn command giờ đây sẽ hoạt động bình thường mà không bị lỗi duplicate custom_id. 