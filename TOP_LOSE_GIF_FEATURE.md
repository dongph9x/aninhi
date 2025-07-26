# 💸 Top 1 Lose GIF Feature

## 📋 Tổng Quan

Tính năng hiển thị GIF đặc biệt cho **người có số lần thua nhiều nhất (top 1 lose)** trong các trò chơi. Tương tự như Top 1 Fisher, tính năng này hiển thị GIF đặc biệt ở thumbnail và giữ nguyên GIF câu cá cũ ở vị trí chính.

## 🎬 Tính Năng Mới

### ✅ **GIF Đặc Biệt Cho Top 1 Lose**
- **Top 1 Lose**: Hiển thị **2 GIF cùng lúc**
  - **Top Lose GIF**: Ở vị trí thumbnail (nhỏ gọn)
  - **Fishing GIF**: Ở vị trí chính (giữ nguyên GIF câu cá cũ)
- **Normal users**: Hiển thị **1 GIF** (Fishing GIF thông thường)
- **Admin users**: Vẫn giữ **Admin GIF** (ưu tiên Admin)
- **Top 1 Fisher**: Vẫn giữ **Top Fisher GIF** (ưu tiên Top Fisher)
- **Animation timing**: Giữ nguyên 3 giây (4 bước, mỗi bước 750ms)

### 🎯 **URLs GIF**
```typescript
// GIF thông thường cho tất cả users (LUÔN GIỮ NGUYÊN)
const fishingGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1397399341475430411/fish-shark.gif?ex=6881950d&is=6880438d&hm=60523d4d9a24ab5f45a42e6fd1c8dddf28680e015cadf0e5fce617e12599f552&";

// GIF đặc biệt cho Admin (hiển thị thumbnail)
const adminGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1398569226188619787/113_146.gif?ex=6885d697&is=68848517&hm=51f234796bc3ada147d02b4b679afe6995bc1602f98f09571de115c5854cffb0&";

// GIF đặc biệt cho Top 1 Fisher (hiển thị thumbnail)
const topFisherGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398568859987869696/113_137.gif?ex=6885d640&is=688484c0&hm=caa5221123afc40711c4fcfc972f92181fc6ed9fbbc2052d689e7962b6a0e55d&=&width=480&height=184";

// GIF đặc biệt cho Top 1 Lose (hiển thị thumbnail)
const topLoseGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398569302663368714/113_156.gif?ex=6885d6a9&is=68848529&hm=e67d702c44f4916882ea5cb64940485e0b66aed91f74b7f7f5f6e53934fcd47d&=&width=408&height=192";
```

## 🔧 Implementation

### **Logic Tạo Dual Embed**
```typescript
// Kiểm tra quyền Admin, Top 1 Fisher và Top 1 Lose
const member = await message.guild?.members.fetch(userId);
const isAdmin = member?.permissions.has('Administrator') || false;

// Kiểm tra xem user có phải là top 1 fisher không
const topFisher = await FishingService.getTopFisher(guildId);
const isTopFisher = topFisher && topFisher.userId === userId;

// Kiểm tra xem user có phải là top 1 lose không
const { GameStatsService } = await import('@/utils/gameStats');
const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
const isTopLose = topLoseUser && topLoseUser.userId === userId;

// Bắt đầu animation câu cá với GIF ngay từ đầu
const fishingEmbed = new EmbedBuilder()
    .setTitle("🎣 Đang Câu Cá...")
    .setDescription(description)
    .setColor("#0099ff")
    .setThumbnail(message.author.displayAvatarURL())
    .setImage(fishingGifUrl) // LUÔN GIỮ NGUYÊN GIF CÂU CÁ CŨ
    .setTimestamp();

// Tạo embed cho Top 1 Lose GIF (hiển thị thumbnail)
let topLoseEmbed = null;
if (isTopLose && !isAdmin && !isTopFisher) {
    topLoseEmbed = new EmbedBuilder()
        .setThumbnail(topLoseGifUrl) // GIF đặc biệt cho Top 1 Lose (thumbnail)
        .setColor("#ff4757") // Màu đỏ cho Top 1 Lose
        .setTitle("💸 Top 1 Thua Lỗ"); // Tiêu đề nhỏ cho Top 1 Lose
}

// Gửi embed(s) dựa trên vai trò
let embeds = [fishingEmbed];
if (isAdmin) {
    embeds = [adminEmbed, fishingEmbed];
} else if (isTopFisher) {
    embeds = [topFisherEmbed, fishingEmbed];
} else if (isTopLose) {
    embeds = [topLoseEmbed, fishingEmbed];
}
const fishingMsg = await message.reply({ embeds });
```

## 🎮 User Experience

### **Normal User (Không có quyền đặc biệt)**
```
[Embed 1]
🎣 Đang Câu Cá...
Username đang câu cá...

🎣 Cần câu: Cần câu đồng
🪱 Mồi: Mồi ngon

⏳ 🎣 Đang thả mồi...
[Original fishing GIF - MAIN IMAGE]
[User avatar - THUMBNAIL]
```

### **Top 1 Lose (Không phải Admin/Top Fisher)**
```
[Embed 1 - Top Lose GIF (Small)]
💸 Top 1 Thua Lỗ
[Top Lose GIF - THUMBNAIL]

[Embed 2 - Fishing Animation]
🎣 Đang Câu Cá...
Username đang câu cá...

🎣 Cần câu: Cần câu đồng
🪱 Mồi: Mồi ngon

⏳ 🎣 Đang thả mồi...

💸 Top 1 Lose đang câu cá với GIF đặc biệt!
[Original fishing GIF - MAIN IMAGE]
[User avatar - THUMBNAIL]
```

### **Top 1 Fisher (Không phải Admin)**
```
[Embed 1 - Top Fisher GIF (Small)]
🏆 Top 1 Câu Cá
[Top Fisher GIF - THUMBNAIL]

[Embed 2 - Fishing Animation]
🎣 Đang Câu Cá...
Username đang câu cá...

🎣 Cần câu: Cần câu đồng
🪱 Mồi: Mồi ngon

⏳ 🎣 Đang thả mồi...

🏆 Top 1 Fisher đang câu cá với GIF đặc biệt!
[Original fishing GIF - MAIN IMAGE]
[User avatar - THUMBNAIL]
```

### **Admin User (Có quyền Administrator)**
```
[Embed 1 - Admin GIF (Small)]
👑 Admin Fishing
[Admin GIF - THUMBNAIL]

[Embed 2 - Fishing Animation]
🎣 Đang Câu Cá...
Username đang câu cá...

🎣 Cần câu: Cần câu đồng
🪱 Mồi: Mồi ngon

⏳ 🎣 Đang thả mồi...

👑 Admin đang câu cá với GIF đặc biệt!
[Original fishing GIF - MAIN IMAGE]
[User avatar - THUMBNAIL]
```

## 🎬 Animation Steps

### **4 Bước Animation (3 giây tổng cộng)**
| **Bước** | **Thời gian** | **Text** | **Main GIF** | **Thumbnail GIF** |
|----------|---------------|----------|--------------|-------------------|
| 1 | 0-750ms | 🎣 Đang thả mồi... | ✅ Original Fishing GIF | ✅ Top Lose GIF |
| 2 | 750-1500ms | 🌊 Đang chờ cá cắn câu... | ✅ Original Fishing GIF | ✅ Top Lose GIF |
| 3 | 1500-2250ms | 🐟 Có gì đó đang cắn câu! | ✅ Original Fishing GIF | ✅ Top Lose GIF |
| 4 | 2250-3000ms | 🎣 Đang kéo cá lên... | ✅ Original Fishing GIF | ✅ Top Lose GIF |

## ✅ Features

### **1. Preserved Original GIF**
- ✅ **Original fishing GIF** luôn được giữ nguyên ở vị trí chính
- ✅ **No interference** với animation câu cá cũ
- ✅ **Same experience** cho tất cả users về GIF chính

### **2. Special Thumbnail GIF**
- ✅ **Top Lose GIF** chỉ xuất hiện ở thumbnail
- ✅ **Red color theme** (#ff4757) cho Top Lose
- ✅ **"💸 Top 1 Thua Lỗ"** title

### **3. Dual Embed System**
- ✅ **Top 1 Lose**: 2 embeds (Top Lose + Fishing)
- ✅ **Normal users**: 1 embed (Fishing only)
- ✅ **Top 1 Fisher**: 2 embeds (Top Fisher + Fishing)
- ✅ **Admin users**: 2 embeds (Admin + Fishing)

### **4. Priority System**
- ✅ **Admin > Top Fisher > Top Lose > Normal User**
- ✅ **No conflicts** between user types
- ✅ **Clean fallback** system

### **5. Animation Management**
- ✅ **4-step animation** (3 seconds total)
- ✅ **No-flicker technique** preserved
- ✅ **Special messages** for Top Lose
- ✅ **All existing features** maintained

## 🧪 Testing

### **Test Commands**
```bash
# Test với user thường
n.fishing

# Test với Top 1 Lose
n.fishing

# Test với Top 1 Fisher
n.fishing

# Test với Admin (cần có quyền Administrator)
n.fishing

# Kiểm tra top lose
n.toplose
n.gamestats lose
```

### **Expected Results**
- **Normal users**: 1 embed with original fishing GIF
- **Top 1 Lose users**: 2 embeds (Top Lose thumbnail + Original fishing GIF main)
- **Top 1 Fisher users**: 2 embeds (Top Fisher thumbnail + Original fishing GIF main)
- **Admin users**: 2 embeds (Admin thumbnail + Original fishing GIF main)
- **Original fishing GIF**: Always preserved in main image position
- **Special GIFs**: Only appear in thumbnail position

### **Test Scripts**
```bash
npx tsx scripts/test-top-lose-gif.ts
```

## 📁 Files Modified

### **Core Files**
- ✅ `src/utils/gameStats.ts` - Added `getTopLoseUser()` function
- ✅ `src/commands/text/ecommerce/fishing.ts` - Added Top 1 Lose GIF logic

### **Test Files**
- ✅ `scripts/test-top-lose-gif.ts` - Test script for Top 1 Lose GIF

### **Documentation**
- ✅ `TOP_LOSE_GIF_FEATURE.md` - This documentation

## 🎯 Technical Details

### **Embed Structure**
```typescript
// Normal User
const embeds = [fishingEmbed]; // 1 embed with original fishing GIF

// Top 1 Lose User  
const embeds = [topLoseEmbed, fishingEmbed]; // 2 embeds

// Top 1 Fisher User
const embeds = [topFisherEmbed, fishingEmbed]; // 2 embeds

// Admin User
const embeds = [adminEmbed, fishingEmbed]; // 2 embeds
```

### **GIF Positioning**
```typescript
// Original fishing GIF (ALWAYS preserved)
fishingEmbed.setImage(fishingGifUrl); // Main image position

// Special GIFs (thumbnail only)
topLoseEmbed.setThumbnail(topLoseGifUrl); // Thumbnail position
topFisherEmbed.setThumbnail(topFisherGifUrl); // Thumbnail position
adminEmbed.setThumbnail(adminGifUrl); // Thumbnail position
```

### **Animation Update Logic**
```typescript
// All users: Original fishing GIF stays in main position
const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1])
    .setDescription(newDescription); // Only change description, keep GIF

// Top Lose: Update both embeds
const updatedEmbeds = [topLoseEmbed, updatedFishingEmbed];

// Top Fisher: Update both embeds
const updatedEmbeds = [topFisherEmbed, updatedFishingEmbed];

// Normal: Update single embed
const updatedEmbeds = [updatedEmbed];
```

## 🚀 Benefits

### **For Top 1 Lose**
- 🎨 **Dual visual experience**
- 💸 **Special recognition with thumbnail GIF**
- 🎣 **Original fishing animation preserved**
- ⚡ **Maintains all existing privileges**

### **For Normal Users**
- 🎣 **Standard fishing experience unchanged**
- ⚡ **No performance impact**
- 🔄 **Same animation quality**
- 📱 **Consistent user experience**

### **For Top 1 Fisher**
- 🏆 **Still get Top Fisher privileges**
- 🎨 **Top Fisher GIF takes priority over Top Lose**
- ⚡ **No changes to existing features**
- 🔄 **Enhanced visual experience**

### **For Admins**
- 👑 **Still get Admin privileges**
- 🎨 **Admin GIF takes highest priority**
- ⚡ **No changes to existing features**
- 🔄 **Enhanced visual experience**

### **For System**
- 🎯 **Easy to maintain**
- 🔧 **Modular design**
- 📈 **Scalable for future features**
- 🛡️ **Permission-based security**

## 🎉 Conclusion

Tính năng **Top 1 Lose GIF** đã được triển khai thành công với:

- 💸 **Special recognition** cho người thua nhiều nhất
- 🎨 **Unique visual experience** với GIF thumbnail
- ✅ **Original fishing GIF preserved** ở vị trí chính
- ⚡ **Zero interference** với animation cũ
- 🔧 **Same structure** như Admin và Top Fisher GIF features
- 🛡️ **Robust priority system** không xung đột

**🎮 Hệ thống đã sẵn sàng cho Top 1 Lose experience!**

---

### **📊 Test Commands:**
```bash
# Test scripts
npx tsx scripts/test-top-lose-gif.ts

# Real bot commands
n.fishing
n.toplose
n.gamestats lose
```

### **🎯 Real Top Lose User:**
- **User ID:** 1397381362763169853
- **Total Lost:** 100 AniCoin
- **Total Bet:** 100 AniCoin
- **Games Played:** 1
- **Games Won:** 0
- **Biggest Loss:** 100 AniCoin 