# 🐟 Hệ Thống Giá Cá Biến Động

## 📋 Tổng quan

Hệ thống giá cá biến động cho phép giá cá thay đổi theo thời gian thực, tạo ra một thị trường động và thú vị cho người chơi. Giá cá sẽ biến động ±10% mỗi 10 phút.

## ⚙️ Cách hoạt động

### **Biến động giá:**
- **Tần suất**: Mỗi 10 phút
- **Phạm vi**: ±10% so với giá gốc
- **Công thức**: `newPrice = basePrice * (1 + random(-0.1, 0.1))`

### **Giá gốc:**
Giá gốc được tính bằng trung bình của `minValue` và `maxValue` của mỗi loại cá:
```
basePrice = (minValue + maxValue) / 2
```

## 🎮 Lệnh sử dụng

### **Xem giá cá:**
```bash
n.fishing price                    # Xem tất cả giá cá hiện tại
n.fishing price "Cá rô phi"       # Xem giá của một loại cá cụ thể
```

### **Bán cá với giá hiện tại:**
```bash
n.fishing sell "Cá rô phi" 5      # Bán 5 con cá rô phi với giá hiện tại
```

### **Xem túi đồ:**
```bash
n.fishing inv                     # Xem túi đồ với thông tin cần câu/mồi
```

## 📊 Hiển thị thông tin

### **Biểu tượng thay đổi giá:**
- **📈**: Giá tăng (màu xanh)
- **📉**: Giá giảm (màu đỏ)  
- **➡️**: Giá không đổi (màu vàng)

### **Thông tin hiển thị:**
- **Giá hiện tại**: Giá bán hiện tại của cá
- **Giá gốc**: Giá cơ bản của cá
- **Thay đổi**: Số tiền và phần trăm thay đổi
- **Cập nhật lúc**: Thời gian cập nhật cuối cùng

## 🛠️ Quản lý hệ thống

### **Scripts có sẵn:**

#### **1. Khởi tạo giá cá:**
```bash
npx tsx scripts/init-fish-prices.ts
```
- Tạo giá ban đầu cho tất cả cá
- Chỉ chạy nếu chưa có dữ liệu giá

#### **2. Test hệ thống:**
```bash
npx tsx scripts/test-fish-price.ts
```
- Kiểm tra toàn bộ hệ thống giá cá
- Test khởi tạo, cập nhật, và lấy giá

#### **3. Reset giá cá:**
```bash
npx tsx scripts/reset-fish-prices.ts
```
- Xóa tất cả giá hiện tại
- Tạo lại giá ban đầu
- Dùng để test hoặc reset hệ thống

### **Khởi động tự động:**
Hệ thống sẽ tự động khởi động khi bot khởi động:
- Khởi tạo giá cá nếu chưa có
- Bắt đầu scheduler cập nhật giá mỗi 10 phút

## 📈 Lợi ích

### **Cho người chơi:**
1. **Chiến lược**: Có thể chờ giá cao để bán cá
2. **Thú vị**: Thị trường luôn thay đổi
3. **Thực tế**: Mô phỏng thị trường thực tế
4. **Cơ hội**: Tìm thời điểm tốt để giao dịch

### **Cho hệ thống:**
1. **Kinh tế động**: Tạo động lực tương tác
2. **Cân bằng**: Giá không quá cố định
3. **Tương tác**: Tăng sự quan tâm đến hệ thống
4. **Chiều sâu**: Thêm lớp chiến lược cho game

## 🔧 Cấu hình

### **Thay đổi tần suất cập nhật:**
Trong `src/utils/fishing.ts`:
```typescript
const PRICE_UPDATE_INTERVAL = 10 * 60 * 1000; // 10 phút
```

### **Thay đổi phạm vi biến động:**
Trong `src/utils/fishing.ts`, hàm `updateFishPrices()`:
```typescript
const fluctuation = (Math.random() - 0.5) * 0.2; // ±10%
```

## 🐛 Xử lý lỗi

### **Lỗi thường gặp:**

#### **1. Foreign key constraint violated:**
- **Nguyên nhân**: User chưa tồn tại khi tạo FishingData
- **Giải pháp**: Đã sửa bằng cách tạo User trước trong transaction

#### **2. FishPrice model không tồn tại:**
- **Nguyên nhân**: Chưa generate Prisma client
- **Giải pháp**: Chạy `npx prisma generate`

#### **3. Giá cá không cập nhật:**
- **Nguyên nhân**: Scheduler không hoạt động
- **Giải pháp**: Kiểm tra log và restart bot

## 📝 Lưu ý

1. **Giá tối thiểu**: Giá không bao giờ dưới 1 AniCoin
2. **Lịch sử giá**: Lưu 24 điểm dữ liệu gần nhất (4 giờ)
3. **Khởi động**: Hệ thống tự động khởi tạo khi bot start
4. **Backup**: Dữ liệu được lưu trong database SQLite

## 🎯 Ví dụ sử dụng

```bash
# Xem tất cả giá
n.fishing price

# Xem giá cá rô phi
n.fishing price "Cá rô phi"

# Bán cá khi giá cao
n.fishing sell "Cá rô phi" 10

# Mua cần câu và mồi
n.fishing buy basic 1
n.fishing buy basic 5

# Câu cá
n.fishing

# Xem túi đồ
n.fishing inv
```

Hệ thống giá cá biến động đã sẵn sàng sử dụng! 🎣💰 