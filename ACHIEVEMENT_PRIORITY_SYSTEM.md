# 🏆 Achievement Priority System - INTEGRATED

## 📋 Tổng Quan

Hệ thống **Achievement Priority** đã được tích hợp hoàn toàn vào lệnh `n.fishing`. Khi user có achievement trong bảng `Achievement`, hệ thống sẽ hiển thị **tên và link ảnh** của achievement đó thay vì các GIF mặc định, với **priority cao nhất**.

## 🎯 Priority Order (MỚI)

### **1. 🏅 Achievement (HIGHEST PRIORITY)**
- **Ưu tiên cao nhất**
- Hiển thị **Achievement Embed** + **Fishing Embed**
- Sử dụng **tên và link ảnh** từ bảng `Achievement`
- Bỏ qua tất cả các role khác

### **2. 👑 Admin (SECOND PRIORITY)**
- **Ưu tiên thấp hơn Achievement**
- Hiển thị Admin GIF + Fishing GIF
- Chỉ hiển thị khi không có Achievement

### **3. 🏆 Top 1 Fisher (THIRD PRIORITY)**
- **Ưu tiên thấp hơn Admin**
- Hiển thị Top Fisher GIF + Fishing GIF
- Chỉ hiển thị khi không có Achievement và không phải Admin

### **4. 💰 Top 1 FishCoin (FOURTH PRIORITY)**
- **Ưu tiên thấp hơn Top Fisher**
- Hiển thị Top FishCoin GIF + Fishing GIF
- Chỉ hiển thị khi không có Achievement, Admin, và Top Fisher

### **5. 💸 Top 1 Lose (FIFTH PRIORITY)**
- **Ưu tiên thấp hơn Top FishCoin**
- Hiển thị Top Lose GIF + Fishing GIF
- Chỉ hiển thị khi không có Achievement, Admin, Top Fisher, và Top FishCoin

### **6. 👤 Normal User (LOWEST PRIORITY)**
- **Không có role đặc biệt**
- Chỉ hiển thị Fishing GIF

## 🔧 Implementation Logic

### **Achievement Detection**
```typescript
// Kiểm tra Achievement của user (PRIORITY CAO NHẤT)
const userAchievement = await AchievementService.getHighestPriorityAchievement(userId);
const hasAchievement = userAchievement !== null;
```

### **Achievement Embed Creation**
```typescript
// Tạo embed cho Achievement (PRIORITY CAO NHẤT)
let achievementEmbed: EmbedBuilder | undefined = undefined;
if (hasAchievement && userAchievement) {
    const achievementEmoji = AchievementService.getAchievementTypeEmoji(userAchievement.type);
    const achievementTypeName = AchievementService.getAchievementTypeName(userAchievement.type);
    
    achievementEmbed = new EmbedBuilder()
        .setThumbnail(userAchievement.link) // Sử dụng link ảnh từ achievement
        .setColor("#ff6b35") // Màu cam cho achievement
        .setTitle(`${achievementEmoji} ${userAchievement.name}`) // Tên achievement
        .setDescription(`🏅 **${achievementTypeName}**`); // Type achievement
}
```

### **Priority Logic**
```typescript
// Gửi embed(s) dựa trên vai trò - Priority: Achievement > Admin > Top Fisher > Top FishCoin > Top Lose
let embeds: EmbedBuilder[] = [fishingEmbed];
if (hasAchievement && achievementEmbed) {
    embeds = [achievementEmbed, fishingEmbed]; // Achievement có priority cao nhất
} else if (isAdmin && adminEmbed) {
    embeds = [adminEmbed, fishingEmbed];
} else if (isTopFisher && topFisherEmbed) {
    embeds = [topFisherEmbed, fishingEmbed];
} else if (isTopFishCoin && topFishCoinEmbed) {
    embeds = [topFishCoinEmbed, fishingEmbed];
} else if (isTopLose && topLoseEmbed) {
    embeds = [topLoseEmbed, fishingEmbed];
}
```

## 🎮 User Scenarios

### **Scenario 1: User có Achievement**
```
User: Has Achievement + Admin + Top Fisher + Top FishCoin + Top Lose
Result: Achievement Embed + Fishing Embed (tất cả khác bị bỏ qua)
Priority: Achievement wins
```

### **Scenario 2: User không có Achievement, là Admin**
```
User: Admin + Top Fisher + Top FishCoin + Top Lose
Result: Admin GIF + Fishing GIF (tất cả khác bị bỏ qua)
Priority: Admin wins
```

### **Scenario 3: User không có Achievement, không phải Admin, là Top Fisher**
```
User: Top Fisher + Top FishCoin + Top Lose
Result: Top Fisher GIF + Fishing GIF (tất cả khác bị bỏ qua)
Priority: Top Fisher wins
```

### **Scenario 4: User không có Achievement, không phải Admin, không phải Top Fisher, là Top FishCoin**
```
User: Top FishCoin + Top Lose
Result: Top FishCoin GIF + Fishing GIF (Top Lose bị bỏ qua)
Priority: Top FishCoin wins
```

### **Scenario 5: User không có Achievement, không phải Admin, không phải Top Fisher, không phải Top FishCoin, là Top Lose**
```
User: Top Lose only
Result: Top Lose GIF + Fishing GIF
Priority: Top Lose wins
```

### **Scenario 6: User không có Achievement, không phải Admin, không phải Top Fisher, không phải Top FishCoin, không phải Top Lose**
```
User: Normal user
Result: Fishing GIF only
Priority: Normal user
```

## 🎬 Animation Steps

### **4 Bước Animation (3 giây tổng cộng)**
| **Bước** | **Thời gian** | **Text** | **Achievement Embed** | **Fishing Embed** |
|----------|---------------|----------|----------------------|-------------------|
| 1 | 0-750ms | 🎣 Đang thả mồi... | ✅ Achievement (Static) | ✅ Original Fishing GIF |
| 2 | 750-1500ms | 🌊 Đang chờ cá cắn câu... | ✅ Achievement (Static) | ✅ Original Fishing GIF |
| 3 | 1500-2250ms | 🐟 Có gì đó đang cắn câu! | ✅ Achievement (Static) | ✅ Original Fishing GIF |
| 4 | 2250-3000ms | 🎣 Đang kéo cá lên... | ✅ Achievement (Static) | ✅ Original Fishing GIF |

## 🏅 Achievement Types

### **Type 0: Top câu cá**
- **Emoji**: 🏆
- **Priority**: Highest among achievements
- **Description**: Awarded to top fishing users

### **Type 1: Top FishCoin**
- **Emoji**: 💰
- **Priority**: Second among achievements
- **Description**: Awarded to users with most FishCoin

### **Type 2: Top FishBattle**
- **Emoji**: ⚔️
- **Priority**: Third among achievements
- **Description**: Awarded to top fish battle winners

### **Type 3: Top Custom**
- **Emoji**: 🎖️
- **Priority**: Fourth among achievements
- **Description**: Custom achievements

## 🎨 Visual Design

### **Achievement Embed**
- **Thumbnail**: Achievement link image
- **Color**: `#ff6b35` (Orange)
- **Title**: `${achievementEmoji} ${achievementName}`
- **Description**: `🏅 **${achievementTypeName}**`

### **Fishing Embed**
- **Image**: Original fishing GIF (preserved)
- **Color**: `#0099ff` (Blue)
- **Title**: "🎣 Đang Câu Cá..."
- **Description**: Animation steps

## 🧪 Test Results

### **Real Database Test**
```
✅ User 389957152153796608 has 3 achievements:
   1. 🏆 Master Fisher (Type 0 - Top câu cá)
   2. 💰 FishCoin King (Type 1 - Top FishCoin)  
   3. 🎖️ 𝔇ệ 𝔑𝔥ấ𝔱 𝔎𝔦ế𝔪 𝔖ĩ (Type 3 - Top Custom)

✅ Highest Priority: 🏆 Master Fisher (Type 0)
✅ Priority System: Type 0 > Type 1 > Type 3
✅ Achievement overrides: Admin, Top Fisher, Top FishCoin, Top Lose
```

### **User Experience Test**
```
🎣 User with Achievement:
📋 [Embed 1 - Achievement (Thumbnail)]
   🏆 Master Fisher
   🏅 Top câu cá
   [Achievement GIF - Small]

📋 [Embed 2 - Fishing Animation]
   🎣 Đang Câu Cá...
   [Original fishing GIF - Main]
```

## 📁 Files Modified

### **Core Files**
- ✅ `src/utils/achievement.ts` - New Achievement service
- ✅ `src/commands/text/ecommerce/fishing.ts` - Integrated achievement priority

### **Test Files**
- ✅ `scripts/test-achievement-priority-system.ts` - Priority system test
- ✅ `scripts/add-test-achievements.ts` - Test data creation

### **Database**
- ✅ `prisma/schema.prisma` - Achievement model (already existed)

## 🚀 How to Test

### **Test Commands**
```bash
# Test priority system
npx tsx scripts/test-achievement-priority-system.ts

# Add test achievements
npx tsx scripts/add-test-achievements.ts

# Real bot command
n.fishing
```

### **Expected Results**
1. **User with Achievement**: Should see Achievement embed + Fishing embed
2. **User without Achievement**: Should see normal priority system
3. **Achievement Priority**: Should override all other roles
4. **Animation**: Should work smoothly with dual embeds

## 🎉 Benefits

### **For Achievement Users**
- 🎨 **Unique visual experience** với achievement riêng
- 🏅 **Special recognition** với tên và ảnh custom
- ⚡ **Highest priority** over all other roles
- 🎣 **Preserved fishing experience** với GIF gốc

### **For System**
- 🎯 **Clear priority hierarchy** với Achievement ở top
- 🔧 **Flexible achievement system** với multiple types
- 📈 **Scalable design** cho future achievements
- 🛡️ **No conflicts** between achievement và roles

### **For Database**
- 💾 **Efficient queries** với proper indexing
- 🔄 **Real-time updates** khi có achievement mới
- 📊 **Multiple achievement support** cho mỗi user
- 🎯 **Priority-based selection** với type ordering

## 🎯 Conclusion

Hệ thống **Achievement Priority** đã được tích hợp thành công với:

- 🏅 **Achievement có priority cao nhất** over tất cả roles
- 🎨 **Custom name và link ảnh** từ database
- 🔧 **Flexible type system** với 4 loại achievement
- ⚡ **Smooth integration** với existing priority system
- 🧪 **Comprehensive testing** với real data

**🎮 Hệ thống đã sẵn sàng với Achievement priority system!**

---

### **📊 Test Commands:**
```bash
# Test scripts
npx tsx scripts/test-achievement-priority-system.ts
npx tsx scripts/add-test-achievements.ts

# Real bot commands
n.fishing
n.achievement-import list
```

### **🎯 Real User Example:**
- **User ID**: 389957152153796608
- **Achievements**: 3 (Master Fisher, FishCoin King, Custom)
- **Expected**: Master Fisher (Type 0) has highest priority
- **Display**: Achievement embed + Fishing embed 