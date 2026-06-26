# 🐟 Tính Năng Chọn Cá Trong FishBarn

## 📋 Tổng quan
Đã thêm tính năng chọn cá cụ thể trong rương nuôi cá (`n.fishbarn`) để có thể thao tác với cá được chọn thay vì chỉ cá đầu tiên.

## 🎯 Vấn đề trước đây
- **Cho ăn**: Luôn cho cá đầu tiên có status 'growing' ăn
- **Bán cá**: Luôn bán cá có giá trị cao nhất
- **Không thể chọn**: Không có cách để chọn cá cụ thể để thao tác

## ✅ Giải pháp mới

### **1. Hệ thống chọn cá**
- **Select Menu**: Cho phép chọn cá cụ thể từ danh sách
- **Lưu trữ lựa chọn**: Sử dụng Map để lưu cá được chọn cho mỗi user
- **Thông báo xác nhận**: Hiển thị thông tin cá được chọn

### **2. Logic thao tác thông minh**
- **Có chọn cá**: Thao tác với cá được chọn
- **Chưa chọn cá**: Fallback về logic cũ (cá đầu tiên/cá giá trị cao nhất)
- **Xử lý lỗi**: Tự động xóa lựa chọn nếu cá không còn trong inventory

## 🔧 Cách hoạt động

### **Chọn cá:**
1. Mở `n.fishbarn`
2. Sử dụng select menu "Chọn cá để thao tác..."
3. Chọn cá muốn thao tác
4. Nhận thông báo xác nhận "Cá này đã được chọn!"

### **Cho cá ăn:**
- **Có chọn cá**: Cho cá được chọn ăn
- **Chưa chọn cá**: Cho cá đầu tiên có status 'growing' ăn
- **Kiểm tra trạng thái**: Chỉ cho cá 'growing' ăn, không cho cá 'adult'

### **Bán cá:**
- **Có chọn cá**: Bán cá được chọn
- **Chưa chọn cá**: Bán cá có giá trị cao nhất
- **Tự động xóa**: Xóa lựa chọn sau khi bán

## 📱 Giao diện người dùng

### **Select Menu:**
```
Chọn cá để thao tác...
├── 🐠 Test Fish 1 (Lv.1) - Đang lớn - 1,000 coins
├── 🐠 Test Fish 2 (Lv.2) - Đang lớn - 2,000 coins
└── 🐟 Test Fish 3 (Lv.10) - Trưởng thành - 5,000 coins
```

### **Thông báo chọn cá:**
```
🐟 Test Fish 2 - Đã chọn
✅ Cá này đã được chọn! Bây giờ bạn có thể sử dụng nút "Cho Ăn" để cho cá này ăn.

📊 Cấp độ: 2/10
📈 Kinh nghiệm: 7/30
💰 Giá trị: 2,000
🏷️ Thế hệ: 1
📋 Trạng thái: Đang lớn
❤️ Có thể lai tạo: Không
```

## 🧪 Test Results

### **Test 1: Tạo 2 cá test**
- ✅ Fish 1: Level 1, Exp 0
- ✅ Fish 2: Level 2, Exp 5

### **Test 2: Cho cá ăn**
- ✅ Fish 1: +4 exp → Level 1, Exp 4/20
- ✅ Fish 2: +2 exp → Level 2, Exp 7/30

### **Test 3: Bán cá**
- ✅ Bán Fish 1 thành công
- ✅ Nhận 1,000 coins
- ✅ Inventory còn 1 cá

## 📝 Files đã sửa

### **1. FishBarnHandler.ts**
- **Thêm Map**: `selectedFishMap` để lưu cá được chọn
- **Sửa handleSelectFish**: Lưu cá được chọn và hiển thị thông báo
- **Sửa handleFeed**: Sử dụng cá được chọn thay vì cá đầu tiên
- **Sửa handleSell**: Sử dụng cá được chọn thay vì cá giá trị cao nhất
- **Xử lý lỗi**: Tự động xóa lựa chọn khi cá không còn tồn tại

### **2. FishBarnUI.ts**
- **Select Menu**: Hiển thị tất cả cá với thông tin chi tiết
- **UI cải thiện**: Thêm thông tin trạng thái và giá trị

### **3. Test Script**
- **test-fish-selection.ts**: Kiểm tra toàn bộ tính năng chọn cá

## 🎮 Cách sử dụng

### **Bước 1: Mở rương nuôi cá**
```bash
n.fishbarn
```

### **Bước 2: Chọn cá muốn thao tác**
- Sử dụng select menu để chọn cá
- Nhận thông báo xác nhận

### **Bước 3: Thao tác với cá được chọn**
- **Cho Ăn**: Cho cá được chọn ăn
- **Bán Cá**: Bán cá được chọn
- **Lai Tạo**: Vẫn sử dụng logic cũ (2 cá trưởng thành đầu tiên)

## ⚠️ Lưu ý quan trọng

1. **Lựa chọn chỉ lưu trong session**: Khi restart bot, lựa chọn sẽ bị mất
2. **Tự động xóa**: Lựa chọn sẽ bị xóa khi cá được bán hoặc không còn trong inventory
3. **Fallback logic**: Nếu chưa chọn cá, hệ thống sẽ sử dụng logic cũ
4. **Kiểm tra trạng thái**: Chỉ cho cá 'growing' ăn, không cho cá 'adult'

## 🎉 Kết quả

Bây giờ người dùng có thể:
- ✅ **Chọn cá cụ thể** để thao tác
- ✅ **Cho cá được chọn ăn** thay vì cá đầu tiên
- ✅ **Bán cá được chọn** thay vì cá giá trị cao nhất
- ✅ **Thấy thông báo rõ ràng** về cá được chọn
- ✅ **Fallback an toàn** khi chưa chọn cá

Tính năng này giúp người dùng có quyền kiểm soát tốt hơn trong việc quản lý cá huyền thoại! 🐟✨ 