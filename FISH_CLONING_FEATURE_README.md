# 🔄 Fish Cloning Feature - Nhân Bản Cá Cho Admin

## 📋 Tổng Quan

Chức năng nhân bản cá cho phép **Admin** tạo ra bản sao hoàn hảo của cá hiện có. Đây là một tính năng mạnh mẽ giúp admin quản lý và phát triển hệ thống cá trong server.

## ✨ Tính Năng Chính

### 1. **Quyền Truy Cập**
- **👑 Chỉ Admin**: Chỉ người dùng có quyền admin mới có thể sử dụng
- **🔒 Bảo Mật**: Kiểm tra quyền tự động qua `FishBattleService.isAdministrator()`
- **🚫 User Thường**: Không thể truy cập chức năng này

### 2. **Quy Trình Nhân Bản**
- **Mở FishBarn**: Sử dụng lệnh `fishbarn` để mở rương cá
- **Chọn Cá**: Chọn con cá muốn nhân bản từ danh sách
- **Click Nhân Bản**: Button "🔄 Nhân Bản Cá" sẽ xuất hiện cho admin
- **Tạo Bản Sao**: Hệ thống tự động tạo cá nhân bản

### 3. **Tính Chất Cá Nhân Bản**
- **Giống Hệt**: Tất cả thuộc tính được sao chép chính xác
- **Tăng Thế Hệ**: Generation +1 so với cá gốc
- **Metadata**: Lưu trữ thông tin nhân bản
- **Inventory**: Tự động thêm vào rương cá

## 🔧 Cách Sử Dụng

### **Bước 1: Mở FishBarn**
```
n.fishbarn
```

### **Bước 2: Chọn Cá**
- Sử dụng dropdown menu để chọn cá muốn nhân bản
- Chỉ cá dưới level 10 mới có thể được chọn

### **Bước 3: Nhân Bản**
- Button "🔄 Nhân Bản Cá" sẽ xuất hiện (chỉ cho admin)
- Click button để thực hiện nhân bản
- Hệ thống sẽ tạo cá nhân bản và thông báo kết quả

## 📊 Kết Quả Nhân Bản

### **Thông Báo Thành Công:**
```
🔄 Nhân Bản Cá Thành Công!

🐟 Cá gốc: [Tên cá]
🔄 Cá nhân bản: [Tên cá]
🏷️ ID cá nhân bản: [ID]
📊 Thế hệ: Gen.[X]
⭐ Độ hiếm: [Rarity]
💰 Giá trị: [Số tiền]
```

### **Tính Chất Được Sao Chép:**
- ✅ **Species**: Loài cá
- ✅ **Level**: Cấp độ
- ✅ **Experience**: Kinh nghiệm
- ✅ **Rarity**: Độ hiếm
- ✅ **Value**: Giá trị
- ✅ **Status**: Trạng thái
- ✅ **Stats**: Chỉ số (strength, agility, intelligence, defense, luck, accuracy)
- ✅ **Special Traits**: Đặc tính đặc biệt

### **Thay Đổi Sau Nhân Bản:**
- 🔄 **Generation**: Giữ nguyên như cá gốc (không tăng)
- 🏷️ **Is Cloned**: Đánh dấu là cá nhân bản
- 📍 **Cloned From**: ID của cá gốc
- ⏰ **Cloned At**: Thời gian nhân bản

## 🎯 Trường Hợp Sử Dụng

### 1. **Quản Lý Server**
- Tạo nhiều cá hiếm để phân phối cho thành viên
- Nhân bản cá mạnh để tạo đội ngũ đấu cá
- Phát triển hệ thống cá trong server

### 2. **Event & Tournament**
- Tạo cá đặc biệt cho sự kiện
- Nhân bản cá giải thưởng
- Cung cấp cá cho tournament

### 3. **Testing & Development**
- Test các tính năng mới với cá nhân bản
- Phát triển hệ thống breeding
- Kiểm tra balance game

## 🔒 Bảo Mật & Giới Hạn

### **Kiểm Tra Quyền:**
```typescript
// Kiểm tra quyền admin
const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
if (!isAdmin) {
  return interaction.reply({ 
    content: '❌ Chỉ admin mới có thể sử dụng chức năng nhân bản cá!', 
    ephemeral: true 
  });
}
```

### **Giới Hạn:**
- **Chỉ Admin**: User thường không thể truy cập
- **Cá Level 10**: Không thể nhân bản cá đã max level
- **Inventory Capacity**: Tuân theo giới hạn sức chứa rương

## 🗄️ Database Schema

### **Fields Mới Trong Model Fish:**
```prisma
model Fish {
  // ... existing fields ...
  
  // Cloning fields
  isCloned              Boolean                   @default(false)
  clonedFrom            String?                   // ID của cá gốc
  clonedAt              DateTime?                 // Thời gian nhân bản
  
  // ... existing fields ...
  
  @@index([isCloned])
  @@index([clonedFrom])
}
```

### **Migration:**
- Thêm 3 fields mới vào Fish model
- Tạo index cho performance
- Backward compatible với dữ liệu cũ

## 🧪 Testing

### **Script Test:**
```bash
npx tsx scripts/test-fish-cloning.ts
```

### **Kết Quả Mong Đợi:**
```
🎉 SUCCESS: Fish cloning functionality is working correctly!
✅ Admin can clone fish
✅ Cloned fish has correct properties
✅ Cloning metadata is properly set
✅ Inventory is updated correctly
```

## 🔄 Files Đã Cập Nhật

### 1. **UI Components**
- `src/components/MessageComponent/FishBarnUI.ts`
  - Thêm button "🔄 Nhân Bản Cá" cho admin
  - Helper function `createCloneRow()`
  - Hiển thị có điều kiện dựa trên quyền

### 2. **Event Handlers**
- `src/components/MessageComponent/FishBarnHandler.ts`
  - Thêm case `fishbarn_clone`
  - Method `handleClone()` xử lý logic nhân bản
  - Method `createClonedFish()` tạo cá nhân bản

### 3. **Database Schema**
- `prisma/schema.prisma`
  - Thêm fields `isCloned`, `clonedFrom`, `clonedAt`
  - Tạo index cho performance

### 4. **Testing & Documentation**
- `scripts/test-fish-cloning.ts` - Script test toàn diện
- `FISH_CLONING_FEATURE_README.md` - Documentation chi tiết

## 🎮 Workflow Hoàn Chỉnh

### **1. Admin Mở FishBarn:**
```
n.fishbarn → Hiển thị UI với button nhân bản
```

### **2. Chọn Cá:**
```
Dropdown menu → Chọn cá muốn nhân bản
```

### **3. Thực Hiện Nhân Bản:**
```
Click "🔄 Nhân Bản Cá" → Tạo cá nhân bản → Thông báo thành công
```

### **4. Kết Quả:**
```
Cá nhân bản được thêm vào inventory
Generation +1, metadata được lưu trữ
UI được cập nhật với thông tin mới
```

## 🔮 Tương Lai

### **Tính Năng Có Thể Thêm:**
- **Cloning History**: Lịch sử nhân bản
- **Cloning Limits**: Giới hạn số lần nhân bản mỗi ngày
- **Cloning Costs**: Chi phí nhân bản (FishCoin)
- **Bulk Cloning**: Nhân bản nhiều cá cùng lúc
- **Cloning Templates**: Mẫu cá nhân bản định sẵn

### **Tích Hợp:**
- **Achievement System**: Thành tích nhân bản
- **Leaderboard**: Bảng xếp hạng admin nhân bản
- **Analytics**: Thống kê nhân bản trong server

## ✅ Lợi Ích

1. **Quản Lý Hiệu Quả**: Admin có thể tạo nhiều cá chất lượng
2. **Phát Triển Server**: Tăng số lượng cá hiếm và mạnh
3. **Event Support**: Hỗ trợ tổ chức sự kiện và tournament
4. **Testing**: Dễ dàng test các tính năng mới
5. **Balance Control**: Kiểm soát cân bằng game tốt hơn

## 🚀 Triển Khai

### **Để Sử Dụng:**
1. **Cập nhật database**: Chạy Prisma migration
2. **Restart bot**: Để load code mới
3. **Kiểm tra quyền**: Đảm bảo admin có quyền truy cập
4. **Test chức năng**: Sử dụng script test

### **Để Tùy Chỉnh:**
- Thay đổi giới hạn nhân bản
- Thêm chi phí nhân bản
- Tùy chỉnh UI và thông báo
- Thêm validation rules

---

**🎯 Chức năng nhân bản cá đã sẵn sàng sử dụng cho admin!**
