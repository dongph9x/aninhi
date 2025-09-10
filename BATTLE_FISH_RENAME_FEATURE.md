# ✏️ Tính Năng Đổi Tên Cá Trong Túi Đấu

## 📋 Tổng Quan

Đã thêm tính năng **đổi tên cá** trong túi đấu cá, cho phép người chơi tùy chỉnh tên cá của mình để dễ dàng nhận biết và quản lý.

## 🎯 Tính Năng Chính

### **Button Đổi Tên**
- **Vị trí**: Trong giao diện túi đấu cá (`n.fishbattle ui`)
- **Icon**: ✏️ Đổi Tên
- **Điều kiện**: Chỉ hiển thị khi đã chọn cá trong túi đấu
- **Trạng thái**: Disabled khi chưa chọn cá hoặc chọn cá không trong túi đấu

### **Modal Nhập Tên**
- **Tiêu đề**: "✏️ Đổi Tên Cá"
- **Input**: Text field để nhập tên mới
- **Placeholder**: Hiển thị tên hiện tại của cá
- **Validation**: 
  - Độ dài: 1-50 ký tự
  - Chỉ cho phép chữ cái, số và khoảng trắng
  - Hỗ trợ tiếng Việt có dấu

## 🛠️ Các File Đã Cập Nhật

### **1. BattleFishUI Component** (`src/components/MessageComponent/BattleFishUI.ts`)
- **Thêm button**: `✏️ Đổi Tên` vào row 2
- **Thêm method**: `canRenameSelectedFish()` để kiểm tra điều kiện
- **Cập nhật hướng dẫn**: Thêm bước 5 về đổi tên cá

### **2. BattleFishHandler Component** (`src/components/MessageComponent/BattleFishHandler.ts`)
- **Thêm import**: `ModalSubmitInteraction` từ discord.js
- **Thêm case**: `battle_fish_rename` trong `handleButton()`
- **Thêm method**: `handleRenameFish()` để xử lý button click
- **Thêm method**: `handleModalSubmit()` để xử lý modal submit
- **Cập nhật types**: Hỗ trợ `ModalSubmitInteraction` trong các method

### **3. BattleFishInventoryService** (`src/utils/battle-fish-inventory.ts`)
- **Thêm method**: `renameFish()` để đổi tên cá trong database
- **Validation**: Kiểm tra quyền sở hữu, độ dài tên, ký tự hợp lệ
- **Database update**: Cập nhật trường `species` trong bảng `Fish`

### **4. FishBattle Command** (`src/commands/text/ecommerce/fishbattle.ts`)
- **Cập nhật help**: Thêm hướng dẫn sử dụng tính năng đổi tên

## 🎮 Cách Sử Dụng

### **Bước 1: Mở giao diện túi đấu**
```bash
n.fishbattle ui
```

### **Bước 2: Chọn cá trong túi đấu**
- Sử dụng dropdown để chọn cá muốn đổi tên
- Chỉ cá trong túi đấu mới có thể đổi tên

### **Bước 3: Nhấn button "✏️ Đổi Tên"**
- Button sẽ được kích hoạt khi đã chọn cá
- Mở modal để nhập tên mới

### **Bước 4: Nhập tên mới**
- Modal hiển thị tên hiện tại
- Nhập tên mới (1-50 ký tự)
- Chỉ sử dụng chữ cái, số và khoảng trắng

### **Bước 5: Xác nhận**
- Nhấn "Submit" để đổi tên
- Hệ thống sẽ cập nhật và làm mới giao diện

## 🔒 Bảo Mật & Validation

### **Kiểm Tra Quyền Sở Hữu**
- Chỉ chủ sở hữu cá mới có thể đổi tên
- Kiểm tra `userId` và `guildId` trong database

### **Kiểm Tra Trạng Thái**
- Cá phải có trong túi đấu mới được đổi tên
- Không thể đổi tên cá đang được bán trên market

### **Validation Tên**
- **Độ dài**: 1-50 ký tự
- **Ký tự hợp lệ**: Chữ cái, số, khoảng trắng, tiếng Việt có dấu
- **Pattern**: `/^[a-zA-Z0-9\s\u00C0-\u1EF9\u1EA0-\u1EFF\u0102\u0103\u00C2\u00E2\u00CA\u00EA\u00D4\u00F4\u01A0\u01A1\u01AF\u01B0\u0110\u0111]+$/`

## 📊 Database Schema

### **Bảng Fish**
- **Trường**: `species` (String)
- **Mục đích**: Lưu trữ tên cá
- **Cập nhật**: Khi đổi tên thành công

## 🎨 UI/UX Features

### **Button State Management**
- **Enabled**: Khi đã chọn cá trong túi đấu
- **Disabled**: Khi chưa chọn cá hoặc chọn cá không trong túi đấu

### **Modal Design**
- **Tiêu đề**: Rõ ràng với emoji
- **Input**: Pre-filled với tên hiện tại
- **Placeholder**: Hướng dẫn người dùng
- **Validation**: Real-time feedback

### **Feedback Messages**
- **Thành công**: "✅ Đã đổi tên cá thành **[Tên Mới]**!"
- **Lỗi**: "❌ Không thể đổi tên cá: [Lý do]"

## 🚀 Tính Năng Mở Rộng

### **Có Thể Thêm Trong Tương Lai**
- **Đổi tên hàng loạt**: Chọn nhiều cá cùng lúc
- **Lịch sử đổi tên**: Theo dõi các lần đổi tên
- **Template tên**: Gợi ý tên theo chủ đề
- **Giới hạn đổi tên**: Số lần đổi tên mỗi ngày

## 🔧 Technical Details

### **Error Handling**
- Try-catch cho tất cả database operations
- Validation input trước khi xử lý
- Fallback messages cho các lỗi không mong muốn

### **Performance**
- Chỉ cập nhật trường cần thiết (`species`)
- Sử dụng transaction để đảm bảo consistency
- Cache invalidation sau khi cập nhật

### **Compatibility**
- Tương thích với hệ thống battle fish hiện có
- Không ảnh hưởng đến các tính năng khác
- Backward compatible với cá đã có tên
