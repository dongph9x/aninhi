# 🧪 Test Chức Năng Đổi Tên Cá

## 📋 Các Bước Test

### **1. Chuẩn Bị**
- Đảm bảo có ít nhất 1 cá thế hệ 2+ và level 10 trong inventory
- Đảm bảo có cá trong túi đấu (`n.fishbattle ui`)

### **2. Test Cơ Bản**
1. **Mở giao diện túi đấu**
   ```bash
   n.fishbattle ui
   ```

2. **Chọn cá trong túi đấu**
   - Sử dụng dropdown để chọn cá
   - Đảm bảo button "✏️ Đổi Tên" được kích hoạt

3. **Nhấn button "✏️ Đổi Tên"**
   - Modal sẽ mở ra
   - Input field hiển thị tên hiện tại

4. **Nhập tên mới**
   - Thử các tên hợp lệ: "Cá Chiến Binh", "Dragon Fish", "Fish123"
   - Nhấn Submit

5. **Kiểm tra kết quả**
   - Thông báo thành công
   - Tên cá được cập nhật trong database

### **3. Test Validation**

#### **Test Tên Hợp Lệ**
- ✅ "Cá Chiến Binh"
- ✅ "Dragon Fish"
- ✅ "Fish123"
- ✅ "Cá Huyền Thoại"

#### **Test Tên Không Hợp Lệ**
- ❌ "" (rỗng)
- ❌ "A" * 51 (quá dài)
- ❌ "Fish@#$" (ký tự đặc biệt)
- ❌ "Fish<script>" (HTML tags)

### **4. Test Edge Cases**

#### **Test Quyền Sở Hữu**
- ❌ Không thể đổi tên cá của người khác
- ❌ Không thể đổi tên cá không tồn tại

#### **Test Trạng Thái Cá**
- ❌ Không thể đổi tên cá không trong túi đấu
- ❌ Không thể đổi tên cá đang được bán trên market

### **5. Test UI/UX**

#### **Button State**
- ✅ Button enabled khi chọn cá trong túi đấu
- ❌ Button disabled khi chưa chọn cá
- ❌ Button disabled khi chọn cá không trong túi đấu

#### **Modal Behavior**
- ✅ Modal mở với tên hiện tại pre-filled
- ✅ Placeholder hiển thị tên hiện tại
- ✅ Validation real-time

## 🔍 Debug Information

### **Console Logs**
Khi test, kiểm tra các log sau:
```
🔍 [DEBUG] handleInteraction called:
  - customId: rename_fish_modal_[fishId]
  - userId: [user_id]
  - guildId: [guild_id]
  - Cache size: [number]
  - ✅ Found messageData for modal using key: [key]
```

### **Error Handling**
- Kiểm tra error messages khi validation fail
- Kiểm tra fallback messages khi có lỗi không mong muốn

## 📊 Expected Results

### **Thành Công**
- Modal mở và đóng đúng cách
- Tên cá được cập nhật trong database
- Thông báo thành công hiển thị
- Không có lỗi trong console

### **Thất Bại**
- Validation messages hiển thị đúng
- Error handling hoạt động
- Không crash bot

## 🚨 Known Issues

### **Modal Submit**
- Modal submit không thể refresh UI trực tiếp
- Cần mở lại `n.fishbattle ui` để xem thay đổi
- Đây là limitation của Discord.js modal system

### **Cache Management**
- MessageData được tìm bằng userId/guildId cho modal
- Có thể có race condition nếu nhiều user cùng lúc

## 🔧 Troubleshooting

### **Modal Không Mở**
- Kiểm tra button state
- Kiểm tra console logs
- Đảm bảo đã chọn cá trong túi đấu

### **Lỗi "Không tìm thấy dữ liệu"**
- Kiểm tra cache size
- Kiểm tra userId/guildId match
- Thử mở lại `n.fishbattle ui`

### **Lỗi Database**
- Kiểm tra connection
- Kiểm tra fish ownership
- Kiểm tra fish status

## ✅ Success Criteria

Tính năng được coi là thành công khi:
1. ✅ Modal mở và đóng đúng cách
2. ✅ Validation hoạt động chính xác
3. ✅ Database được cập nhật thành công
4. ✅ Error handling hoạt động
5. ✅ UI/UX mượt mà
6. ✅ Không có lỗi crash
