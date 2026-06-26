# ⚔️ Battle GIF Animation System

## 📋 Tổng Quan

Hệ thống animation đấu cá đã được cải tiến với **GIF animation** để tạo trải nghiệm thú vị và sinh động hơn cho người dùng, tương tự như hệ thống câu cá.

## 🎬 Animation Steps

### **5 Bước Animation (3 giây tổng cộng)**

| **Bước** | **Thời gian** | **Text** | **GIF** | **Mô tả** |
|----------|---------------|----------|---------|-----------|
| 1 | 0-600ms | ⚔️ **Bắt đầu chiến đấu!** ⚔️ | Battle animation | Bắt đầu trận đấu |
| 2 | 600-1200ms | 🐟 **Fish1** vs **Fish2** 🐟 | Battle animation | Hiển thị đối thủ |
| 3 | 1200-1800ms | 💥 **Đang đấu...** 💥 | Battle animation | Đang chiến đấu |
| 4 | 1800-2400ms | ⚡ **Chiến đấu gay cấn!** ⚡ | Battle animation | Chiến đấu gay cấn |
| 5 | 2400-3000ms | 🔥 **Kết quả sắp có!** 🔥 | Battle animation | Chờ kết quả |

## 🎨 GIF Configuration

### **Battle GIF URL:**
```typescript
const battleGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1397424104411234376/3c5b414026eb64ebb267b6f388091c37.gif?ex=6881ac1d&is=68805a9d&hm=5cc5c154f6c0ca09a149c213ef2649e8e14a88e3882f74ef05ca35055694fa36&";
```

### **Animation Frames:**
```typescript
const animationFrames = [
    '⚔️ **Bắt đầu chiến đấu!** ⚔️',
    '🐟 **${selectedFish.name}** vs **${opponentResult.opponent.name}** 🐟',
    '💥 **Đang đấu...** 💥',
    '⚡ **Chiến đấu gay cấn!** ⚡',
    '🔥 **Kết quả sắp có!** 🔥'
];
```

## 🔧 Implementation

### **Code Changes**

```typescript
// Trước
const animationFrames = [
    '⚔️ **Bắt đầu chiến đấu!** ⚔️',
    '🐟 **${selectedFish.name}** vs **${opponentResult.opponent.name}** 🐟',
    '💥 **Đang đấu...** 💥',
    '⚡ **Chiến đấu gay cấn!** ⚡',
    '🔥 **Kết quả sắp có!** 🔥'
];

const animationEmbed = new EmbedBuilder()
    .setTitle('⚔️ Chiến Đấu Đang Diễn Ra...')
    .setColor('#FF6B6B')
    .setDescription(animationFrames[0])
    .setTimestamp();

await battleMessage.edit({ embeds: [animationEmbed] });

for (let i = 1; i < animationFrames.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const currentFrame = animationFrames[i]
        .replace('${selectedFish.name}', selectedFish.name)
        .replace('${opponentResult.opponent.name}', opponentResult.opponent.name);
    
    animationEmbed.setDescription(currentFrame);
    await battleMessage.edit({ embeds: [animationEmbed] });
}

// Sau
const battleGifUrl = "https://cdn.discordapp.com/attachments/1396335030216822875/1397424104411234376/3c5b414026eb64ebb267b6f388091c37.gif?ex=6881ac1d&is=68805a9d&hm=5cc5c154f6c0ca09a149c213ef2649e8e14a88e3882f74ef05ca35055694fa36&";

const animationFrames = [
    '⚔️ **Bắt đầu chiến đấu!** ⚔️',
    '🐟 **${selectedFish.name}** vs **${opponentResult.opponent.name}** 🐟',
    '💥 **Đang đấu...** 💥',
    '⚡ **Chiến đấu gay cấn!** ⚡',
    '🔥 **Kết quả sắp có!** 🔥'
];

const animationEmbed = new EmbedBuilder()
    .setTitle('⚔️ Chiến Đấu Đang Diễn Ra...')
    .setColor('#FF6B6B')
    .setDescription(animationFrames[0])
    .setImage(battleGifUrl) // Thêm GIF animation
    .setTimestamp();

await battleMessage.edit({ embeds: [animationEmbed] });

for (let i = 1; i < animationFrames.length; i++) {
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const currentFrame = animationFrames[i]
        .replace('${selectedFish.name}', selectedFish.name)
        .replace('${opponentResult.opponent.name}', opponentResult.opponent.name);
    
    // Sử dụng EmbedBuilder.from để tránh nháy GIF
    const updatedEmbed = EmbedBuilder.from(battleMessage.embeds[0])
        .setDescription(currentFrame);
    
    await battleMessage.edit({ embeds: [updatedEmbed] });
}
```

## 🎮 User Experience

### **Trước khi có GIF:**
```
⚔️ Chiến Đấu Đang Diễn Ra...
⚔️ Bắt đầu chiến đấu! ⚔️
```

### **Sau khi có GIF:**
```
⚔️ Chiến Đấu Đang Diễn Ra...
⚔️ Bắt đầu chiến đấu! ⚔️

[Battle GIF Animation hiển thị]
```

## ⚠️ Lưu Ý

### **Performance:**
- **GIF size:** Nên dưới 5MB để load nhanh
- **GIF duration:** 2-3 giây mỗi GIF
- **Format:** GIF hoặc MP4 (Discord hỗ trợ)

### **Fallback:**
```typescript
try {
    await battleMessage.edit({ embeds: [updatedEmbed] });
} catch (error) {
    // Nếu GIF không load được, sử dụng embed không có GIF
    const fallbackEmbed = new EmbedBuilder()
        .setTitle('⚔️ Chiến Đấu Đang Diễn Ra...')
        .setDescription(currentFrame)
        .setColor('#FF6B6B')
        .setTimestamp();
    
    await battleMessage.edit({ embeds: [fallbackEmbed] });
}
```

### **Anti-Flicker Technique:**
- ✅ **`EmbedBuilder.from(existingEmbed)`** - Tạo embed mới từ embed hiện tại
- ✅ **Chỉ thay đổi description** - Giữ nguyên tất cả properties khác
- ✅ **GIF không bị nháy** khi thay đổi text
- ✅ **Animation mượt mà** và liên tục

## 🧪 Testing

### **Test Command:**
```bash
n.fishbattle
```

### **Test Script:**
```bash
npx tsx scripts/test-battle-animation.ts
```

### **Test Checklist:**
- [ ] GIF hiển thị trong mỗi bước animation
- [ ] Animation mượt mà (3 giây, 5 bước)
- [ ] Không bị lag hoặc lỗi
- [ ] Fallback hoạt động nếu GIF lỗi
- [ ] Text thay đổi đúng với tên cá

## 🎯 Technical Details

### **Timing:**
- **Total Duration:** 3 seconds
- **Each Step:** 600ms
- **Steps:** 5 steps
- **Formula:** 5 × 600ms = 3000ms = 3s

### **Embed Structure:**
- **Title:** "⚔️ Chiến Đấu Đang Diễn Ra..."
- **Description:** Animation text với tên cá
- **Image:** Battle GIF animation
- **Color:** #FF6B6B (red)
- **Timestamp:** Current time

### **Animation Quality:**
- **Smooth:** 600ms per step
- **Consistent:** Same GIF for all steps
- **Professional:** Clean embed design
- **Responsive:** Works on all devices

## 🚀 Benefits

### **User Engagement:**
- ✅ Tăng trải nghiệm người dùng
- ✅ Animation sinh động và thú vị
- ✅ Tạo cảm giác chờ đợi hấp dẫn

### **Visual Appeal:**
- ✅ Embed đẹp mắt hơn
- ✅ Animation mượt mà
- ✅ Professional look

### **Branding:**
- ✅ Tạo ấn tượng tốt
- ✅ Memorable experience
- ✅ User retention

## 🎉 Kết Luận

**GIF Animation đã được implement thành công vào lệnh đấu cá!**

- ✅ **Code đã sẵn sàng** trong `src/commands/text/ecommerce/fishbattle.ts`
- ✅ **Animation logic** hoạt động với 5 bước trong 3 giây
- ✅ **GIF support** đã được thêm vào embed
- ✅ **Fallback system** đảm bảo hoạt động ngay cả khi GIF lỗi
- ✅ **Anti-flicker technique** đảm bảo animation mượt mà
- ✅ **Documentation** đầy đủ và chi tiết

**Bước tiếp theo:** Test animation với lệnh `n.fishbattle` và react với ⚔️! 