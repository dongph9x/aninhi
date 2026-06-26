# 💰 Top FishCoin GIF Feature

## 📋 Tổng Quan

Tính năng **Top FishCoin GIF** hiển thị GIF đặc biệt cho người dùng có nhiều FishCoin nhất trong server khi họ sử dụng lệnh `n.fishing`. Tính năng này được tích hợp vào hệ thống priority hiện có.

## 🎯 Mục Đích

- **Tôn vinh người giàu**: Hiển thị GIF đặc biệt cho người có nhiều FishCoin nhất
- **Tăng tính cạnh tranh**: Khuyến khích người chơi tích lũy FishCoin
- **Tích hợp priority**: Hoạt động cùng với Admin, Top Fisher, và Top Lose GIFs

## 🔧 Cách Hoạt Động

### **1. Logic Priority System:**
```
Admin > Top Fisher > Top FishCoin > Top Lose > Normal User
```

### **2. Điều Kiện Hiển Thị:**
- User phải là người có nhiều FishCoin nhất trong server
- Không phải Admin (Admin có priority cao hơn)
- Không phải Top Fisher (Top Fisher có priority cao hơn)
- Có thể đồng thời là Top Lose

### **3. Thông Tin Hiển Thị:**
- **Title:** "💰 Top 1 FishCoin"
- **Color:** `#00d4aa` (màu xanh lá)
- **GIF:** [Top FishCoin GIF](https://media.discordapp.net/attachments/1396335030216822875/1398569226595336324/113_147.gif)
- **Size:** 600x168

## 🛠️ Files Đã Cập Nhật

### **1. GameStatsService (`src/utils/gameStats.ts`)**

#### **Thêm method mới:**
```typescript
/**
 * Lấy top 1 user có nhiều FishCoin nhất
 */
static async getTopFishCoinUser(guildId: string): Promise<string | null> {
    try {
        const topFishCoinUser = await prisma.user.findFirst({
            where: { guildId },
            orderBy: { fishBalance: 'desc' },
            select: { userId: true }
        });

        return topFishCoinUser?.userId || null;
    } catch (error) {
        console.error('Error getting top FishCoin user:', error);
        return null;
    }
}
```

### **2. Fishing Command (`src/commands/text/ecommerce/fishing.ts`)**

#### **Thêm kiểm tra Top FishCoin:**
```typescript
// Kiểm tra xem user có phải là top 1 FishCoin không
const topFishCoinUser = await GameStatsService.getTopFishCoinUser(guildId);
const isTopFishCoin = topFishCoinUser === userId;
```

#### **Thêm GIF URL:**
```typescript
// GIF đặc biệt cho Top 1 FishCoin (theo yêu cầu)
const topFishCoinGifUrl = "https://media.discordapp.net/attachments/1396335030216822875/1398569226595336324/113_147.gif?ex=6885d697&is=68848517&hm=6997312ba231ae7d566ffde7a4176d509ccc9dc85d2ff312934a34508c072e1c&=&width=600&height=168";
```

#### **Tạo embed cho Top FishCoin:**
```typescript
// Tạo embed cho Top 1 FishCoin GIF (hiển thị nhỏ gọn)
let topFishCoinEmbed: EmbedBuilder | undefined = undefined;
if (isTopFishCoin && !isAdmin) {
    topFishCoinEmbed = new EmbedBuilder()
        .setThumbnail(topFishCoinGifUrl)
        .setColor("#00d4aa")
        .setTitle("💰 Top 1 FishCoin");
}
```

#### **Cập nhật priority system:**
```typescript
// Gửi embed(s) dựa trên vai trò - Priority: Admin > Top Fisher > Top FishCoin > Top Lose
let embeds: EmbedBuilder[] = [fishingEmbed];
if (isAdmin && adminEmbed) {
    embeds = [adminEmbed, fishingEmbed];
} else if (isTopFisher && topFisherEmbed) {
    embeds = [topFisherEmbed, fishingEmbed];
} else if (isTopFishCoin && topFishCoinEmbed) {
    embeds = [topFishCoinEmbed, fishingEmbed];
} else if (isTopLose && topLoseEmbed) {
    embeds = [topLoseEmbed, fishingEmbed];
}
```

#### **Cập nhật animation logic:**
```typescript
} else if (isTopFishCoin && topFishCoinEmbed) {
    // Top 1 FishCoin: Cập nhật cả hai embed
    const updatedFishingEmbed = EmbedBuilder.from(fishingMsg.embeds[1])
        .setDescription(
            `**${message.author.username}** đang câu cá...\n\n` +
            `🎣 **Cần câu:** ${rodName}\n` +
            `🪱 **Mồi:** ${baitName}\n\n` +
            `⏳ ${animationSteps[i]}`
        );
    
    const updatedEmbeds = [topFishCoinEmbed, updatedFishingEmbed];
    await fishingMsg.edit({ embeds: updatedEmbeds });
}
```

## 🎮 Cách Sử Dụng

### **1. Kiểm tra Top FishCoin:**
```bash
npx tsx scripts/test-top-fishcoin-gif-feature.ts
```

### **2. Sử dụng lệnh fishing:**
```bash
n.fishing
```

### **3. Kết quả hiển thị:**
- **Nếu là Top FishCoin:** Hiển thị 2 embeds với GIF đặc biệt
- **Nếu không phải:** Hiển thị 1 embed bình thường

## 🧪 Test Results

### **Test Output:**
```
💰 Test Top FishCoin GIF Feature

1️⃣ Getting top FishCoin user...
✅ Top FishCoin user: 1397381362763169853

2️⃣ Getting top FishCoin user details...
💰 FishCoin Balance: 19,901,860
💳 AniCoin Balance: 2,000

3️⃣ Checking other top users for priority comparison...
👑 Is Admin: false
🏆 Is Top Fisher: true
💸 Is Top Lose: false

4️⃣ Simulating priority logic...
Priority Order: Admin > Top Fisher > Top FishCoin > Top Lose
🎯 Selected: Top Fisher GIF (Second Priority)

5️⃣ GIF Information:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 GIF Type: Top Fisher GIF
📝 Title: 🏆 Top 1 Câu Cá
🎨 Color: #ff6b35
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

6️⃣ Simulating embed structure...
📋 Dual Embed Structure:
   Embed 1: Special GIF (Thumbnail)
   Embed 2: Main Fishing GIF (Image)

📋 Embed 1 Details:
   Title: 🏆 Top 1 Câu Cá
   Color: #ff6b35
   Thumbnail: Special GIF

📋 Embed 2 Details:
   Title: 🎣 Đang Câu Cá...
   Color: #0099ff
   Image: Main Fishing GIF
   Description: Animation steps...

7️⃣ Checking other users in guild...
📊 Top 5 FishCoin Users:
   🥇 1397381362763169853: 19,901,860 FishCoin (Current)
   🥈 389957152153796608: 249,865 FishCoin
   🥉 test-auto-equip-rod-user: 28,840 FishCoin
   4. test-auto-switch-bait-user: 25,090 FishCoin
   5. test-auto-equip-bait-user: 8,290 FishCoin
```

## 🎯 Priority System

### **Thứ Tự Ưu Tiên:**
1. **👑 Admin** (Highest Priority)
   - GIF: Admin GIF
   - Color: `#ffd700`
   - Title: "👑 Admin Fishing"

2. **🏆 Top Fisher** (Second Priority)
   - GIF: Top Fisher GIF
   - Color: `#ff6b35`
   - Title: "🏆 Top 1 Câu Cá"

3. **💰 Top FishCoin** (Third Priority)
   - GIF: [Top FishCoin GIF](https://media.discordapp.net/attachments/1396335030216822875/1398569226595336324/113_147.gif)
   - Color: `#00d4aa`
   - Title: "💰 Top 1 FishCoin"

4. **💸 Top Lose** (Fourth Priority)
   - GIF: Top Lose GIF
   - Color: `#ff4757`
   - Title: "💸 Top 1 Thua Lỗ"

5. **🎣 Normal User** (No Special Status)
   - GIF: Main Fishing GIF
   - Color: `#0099ff`
   - Title: "🎣 Đang Câu Cá..."

## 🔄 Workflow

```
1. User runs n.fishing
2. System checks user status:
   - Is Admin?
   - Is Top FishCoin?
   - Is Top Lose?
   - Is Top Fisher?
3. System selects appropriate GIF based on priority
4. System creates embed(s) with selected GIF
5. System displays animation with no-flicker technique
```

## 📊 Database Query

### **Top FishCoin Query:**
```sql
SELECT userId 
FROM User 
WHERE guildId = ? 
ORDER BY fishBalance DESC 
LIMIT 1
```

### **Performance:**
- **Index:** `fishBalance` field được index để tối ưu query
- **Caching:** Kết quả có thể được cache để giảm database load
- **Real-time:** Cập nhật theo thời gian thực khi FishCoin balance thay đổi

## 🎯 Lợi Ích

### **Cho Người Chơi:**
- ✅ **Tôn vinh**: Người giàu được hiển thị GIF đặc biệt
- ✅ **Cạnh tranh**: Khuyến khích tích lũy FishCoin
- ✅ **Độc quyền**: Chỉ top 1 mới có GIF này

### **Cho Hệ Thống:**
- ✅ **Tích hợp**: Hoạt động mượt mà với hệ thống hiện có
- ✅ **Performance**: Query tối ưu, không ảnh hưởng performance
- ✅ **Scalable**: Dễ dàng mở rộng thêm tính năng khác

## 📝 Ghi Chú

- **Real-time Update**: Top FishCoin được cập nhật theo thời gian thực
- **No-flicker Animation**: Sử dụng kỹ thuật không nháy GIF
- **Dual Embed**: Hiển thị 2 embeds cho special users
- **Priority System**: Hệ thống ưu tiên rõ ràng và logic
- **Fallback**: Luôn có fallback cho trường hợp lỗi 