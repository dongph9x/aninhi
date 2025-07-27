# 🏅 Achievements Command - COMPLETED

## 📋 Tổng Quan

Lệnh `n.achievements` cho phép user xem tất cả danh hiệu (achievements) mà họ sở hữu, dựa trên `user_id` mapping với trường `target` trong bảng `Achievement`.

## 🎯 Tính Năng

### **✅ Hiển Thị Danh Hiệu**
- Hiển thị tất cả achievements của user
- Thông tin chi tiết: tên, loại, ngày nhận, link ảnh
- Sắp xếp theo thứ tự thời gian (mới nhất trước)

### **✅ Danh Hiệu Ưu Tiên Cao Nhất**
- Highlight achievement có priority cao nhất
- Thông báo achievement nào sẽ hiển thị khi câu cá
- Giải thích hệ thống priority

### **✅ Xử Lý User Không Có Danh Hiệu**
- Hiển thị thông báo thân thiện
- Hướng dẫn cách nhận danh hiệu
- Khuyến khích user cố gắng

### **✅ Multiple Command Aliases**
- `n.achievements` - Lệnh chính
- `n.achievement` - Alias ngắn gọn
- `n.danhhieu` - Tiếng Việt
- `n.badge` - Tiếng Anh

## 🎮 Cách Sử Dụng

### **Lệnh Cơ Bản**
```bash
n.achievements
n.achievement
n.danhhieu
n.badge
```

### **Ví Dụ Output**

#### **User Có Danh Hiệu:**
```
🏅 Danh Hiệu Của Username
Username đã sở hữu 2 danh hiệu!

🎯 Danh hiệu hiện tại:

1. 💰 FishCoin King
🏅 Loại: Top FishCoin
📅 Nhận ngày: lúc 13:57 27 tháng 7, 2025
🔗 Ảnh: [Xem ảnh]

2. 🏆 Master Fisher
🏅 Loại: Top câu cá
📅 Nhận ngày: lúc 13:57 27 tháng 7, 2025
🔗 Ảnh: [Xem ảnh]

🎯 Danh Hiệu Ưu Tiên Cao Nhất
🏆 Master Fisher
🏅 Loại: Top câu cá
💡 Sẽ hiển thị khi câu cá

Tổng cộng: 2 danh hiệu • Danh hiệu ưu tiên sẽ hiển thị khi câu cá
```

#### **User Không Có Danh Hiệu:**
```
🏅 Danh Hiệu Của Bạn
Username chưa có danh hiệu nào!

🎯 Cách nhận danh hiệu:
🏆 Top câu cá: Câu cá nhiều nhất server
💰 Top FishCoin: Có nhiều FishCoin nhất
⚔️ Top FishBattle: Thắng nhiều trận đấu cá nhất
🎖️ Top Custom: Danh hiệu đặc biệt từ Admin

💡 Hãy cố gắng để nhận được danh hiệu đầu tiên!
```

## 🔧 Implementation

### **Database Query**
```typescript
// Lấy tất cả achievements của user
const userAchievements = await AchievementService.getUserAchievements(userId);
```

### **Achievement Display Logic**
```typescript
// Thêm từng achievement vào embed
userAchievements.forEach((achievement, index) => {
    const typeEmoji = AchievementService.getAchievementTypeEmoji(achievement.type);
    const typeName = AchievementService.getAchievementTypeName(achievement.type);
    const createdAt = achievement.createdAt.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    achievementEmbed.addFields({
        name: `${index + 1}. ${typeEmoji} ${achievement.name}`,
        value: `🏅 **Loại:** ${typeName}\n📅 **Nhận ngày:** ${createdAt}\n🔗 **Ảnh:** [Xem ảnh](${achievement.link})`,
        inline: false
    });
});
```

### **Highest Priority Achievement**
```typescript
// Thêm thông tin về achievement có priority cao nhất
const highestPriority = await AchievementService.getHighestPriorityAchievement(userId);
if (highestPriority) {
    const typeEmoji = AchievementService.getAchievementTypeEmoji(highestPriority.type);
    const typeName = AchievementService.getAchievementTypeName(highestPriority.type);
    
    achievementEmbed.addFields({
        name: "🎯 Danh Hiệu Ưu Tiên Cao Nhất",
        value: `${typeEmoji} **${highestPriority.name}**\n🏅 **Loại:** ${typeName}\n💡 **Sẽ hiển thị khi câu cá**`,
        inline: false
    });
}
```

## 🎨 Visual Design

### **Embed Structure**
- **Title**: `🏅 Danh Hiệu Của [Username]`
- **Color**: `#ff6b35` (Orange)
- **Thumbnail**: User avatar
- **Fields**: Từng achievement với thông tin chi tiết
- **Footer**: Thống kê tổng quan

### **Achievement Field Format**
```
Name: [Index]. [Emoji] [Achievement Name]
Value: 🏅 Loại: [Type Name]
       📅 Nhận ngày: [Date]
       🔗 Ảnh: [Link]
```

### **Priority Field Format**
```
Name: 🎯 Danh Hiệu Ưu Tiên Cao Nhất
Value: [Emoji] [Achievement Name]
       🏅 Loại: [Type Name]
       💡 Sẽ hiển thị khi câu cá
```

## 🧪 Test Results

### **User with Multiple Achievements**
```
✅ User 389957152153796608 có 2 achievements:
   1. 💰 FishCoin King (Top FishCoin)
   2. 🏆 Master Fisher (Top câu cá)

✅ Highest Priority: 🏆 Master Fisher (Type 0)
✅ Display: Proper embed with all details
✅ Links: Working achievement image links
```

### **User with Single Achievement**
```
✅ User 1397381362763169853 có 1 achievement:
   1. ⚔️ Battle Master (Top FishBattle)

✅ Display: Single achievement embed
✅ Priority: Battle Master is highest priority
```

### **User with No Achievements**
```
✅ User 999999999999999999 có 0 achievements
✅ Display: Friendly no-achievement message
✅ Guidance: Shows how to earn achievements
```

## 📁 Files Created

### **Core Files**
- ✅ `src/commands/text/ecommerce/achievements.ts` - Main command implementation

### **Test Files**
- ✅ `scripts/test-achievements-command.ts` - Comprehensive test script

### **Documentation**
- ✅ `ACHIEVEMENTS_COMMAND_README.md` - This documentation

## 🚀 How to Test

### **Test Commands**
```bash
# Test command functionality
npx tsx scripts/test-achievements-command.ts

# Real bot commands
n.achievements
n.achievement
n.danhhieu
n.badge
```

### **Expected Results**
1. **User with achievements**: Should see detailed achievement list
2. **User without achievements**: Should see guidance message
3. **Multiple aliases**: All should work the same
4. **Error handling**: Should handle invalid user IDs gracefully

## 🎉 Benefits

### **For Users**
- 🏅 **Easy achievement tracking** - Xem tất cả danh hiệu một chỗ
- 🎯 **Priority understanding** - Biết danh hiệu nào sẽ hiển thị khi câu cá
- 📅 **Achievement history** - Xem ngày nhận danh hiệu
- 🔗 **Visual confirmation** - Link đến ảnh danh hiệu

### **For System**
- 🔍 **User engagement** - Khuyến khích user cố gắng nhận danh hiệu
- 📊 **Achievement transparency** - User hiểu rõ hệ thống danh hiệu
- 🎮 **Gamification** - Tăng tính cạnh tranh và động lực
- 🛡️ **Error handling** - Xử lý lỗi gracefully

### **For Database**
- 💾 **Efficient queries** - Sử dụng existing AchievementService
- 🔄 **Real-time data** - Hiển thị dữ liệu mới nhất
- 📈 **Scalable design** - Dễ dàng thêm achievement types mới

## 🎯 Conclusion

Lệnh **`n.achievements`** đã được triển khai thành công với:

- 🏅 **Complete achievement display** với thông tin chi tiết
- 🎯 **Priority highlighting** cho achievement cao nhất
- 🎮 **User-friendly interface** cho cả có và không có danh hiệu
- 🔧 **Multiple aliases** cho dễ sử dụng
- 🧪 **Comprehensive testing** với real data

**🎮 Lệnh đã sẵn sàng! User có thể dùng `n.achievements` để xem danh hiệu của mình!**

---

### **📊 Test Commands:**
```bash
# Test script
npx tsx scripts/test-achievements-command.ts

# Real bot commands
n.achievements
n.achievement
n.danhhieu
n.badge
```

### **🎯 Real User Examples:**
- **User 389957152153796608**: 2 achievements (FishCoin King, Master Fisher)
- **User 1397381362763169853**: 1 achievement (Battle Master)
- **User 999999999999999999**: 0 achievements (guidance message) 