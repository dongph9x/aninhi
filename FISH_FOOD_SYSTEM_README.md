# 🍽️ Hệ Thống Thức Ăn Cá

## 📋 Tổng Quan

Hệ thống thức ăn cá cho phép người chơi mua và sử dụng các loại thức ăn khác nhau để tăng level cho cá của họ. Thay vì chỉ có thể cho cá ăn với cooldown 1 giờ và exp ngẫu nhiên, giờ đây người chơi có thể:

- **Mua thức ăn** từ Fish Shop
- **Chọn loại thức ăn** khi cho cá ăn
- **Nhận exp cố định** dựa trên loại thức ăn
- **Không có cooldown** khi sử dụng thức ăn

## 🏪 Các Loại Thức Ăn

| Loại | Tên | Emoji | Giá | Exp Bonus | Mô tả |
|------|-----|-------|-----|-----------|-------|
| `basic` | Thức Ăn Cơ Bản | 🍞 | 10,000 coins | +1 exp | Thức ăn cơ bản cho cá |
| `premium` | Thức Ăn Cao Cấp | 🥩 | 30,000 coins | +3 exp | Thức ăn cao cấp, tăng exp nhiều hơn |
| `luxury` | Thức Ăn Xa Xỉ | 🦐 | 50,000 coins | +5 exp | Thức ăn xa xỉ, tăng exp rất nhiều |
| `legendary` | Thức Ăn Huyền Thoại | 🌟 | 100,000 coins | +10 exp | Thức ăn huyền thoại, tăng exp cực nhiều |

## 🛒 Cách Mua Thức Ăn

### 1. Mở Fish Shop
```
/fishshop
```

### 2. Chọn "Mua Thức Ăn"
- Nhấn nút **🍽️ Mua Thức Ăn** trong Fish Shop

### 3. Chọn Loại Thức Ăn
- Chọn loại thức ăn từ dropdown menu
- Mỗi loại có giá và exp bonus khác nhau

### 4. Nhập Số Lượng
- Nhập số lượng thức ăn muốn mua (1-100)
- Hệ thống sẽ tự động trừ tiền và thêm thức ăn vào inventory

## 🍽️ Cách Cho Cá Ăn

### 1. Mở Fish Barn
```
/fishbarn
```

### 2. Chọn Cá
- Chọn cá muốn cho ăn từ dropdown menu
- Chỉ cá chưa đạt level 10 mới có thể cho ăn

### 3. Chọn Thức Ăn
- Sau khi chọn cá, dropdown menu thức ăn sẽ xuất hiện
- Chọn loại thức ăn muốn sử dụng

### 4. Cho Ăn
- Nhấn nút **🍽️ Cho Ăn**
- Hệ thống sẽ sử dụng 1 thức ăn và tăng exp cho cá

## 📊 Hiệu Quả Thức Ăn

### Exp Gained
- **Thức Ăn Cơ Bản**: +1 exp
- **Thức Ăn Cao Cấp**: +3 exp  
- **Thức Ăn Xa Xỉ**: +5 exp
- **Thức Ăn Huyền Thoại**: +10 exp

### Level Up
- Cá sẽ lên level khi đủ exp
- Mỗi level cần: `(level + 1) * 10` exp
- Ví dụ: Level 1 → 2 cần 20 exp, Level 2 → 3 cần 30 exp

### Giá Trị Tăng
- Mỗi level tăng 2% giá trị cá
- Ví dụ: Cá level 1 giá 10,000 → level 2 giá 10,200

## 🔧 Cấu Trúc Kỹ Thuật

### Database Schema
```sql
model FishFood {
  id            String   @id @default(cuid())
  userId        String
  guildId       String
  foodType      String
  quantity      Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  user          User     @relation(fields: [userId, guildId], references: [userId, guildId])

  @@unique([userId, guildId, foodType])
  @@index([userId, guildId])
  @@index([foodType])
}
```

### Services
- **FishFoodService**: Quản lý mua, sử dụng, lưu trữ thức ăn
- **FishBreedingService.feedFishWithFood()**: Cho cá ăn với thức ăn

### Components
- **FishingShop**: Thêm option mua thức ăn
- **BuyFishFood**: Xử lý chọn thức ăn để mua
- **BuyFishFoodModal**: Modal nhập số lượng
- **FishBarnUI**: Hiển thị chọn thức ăn khi cho cá ăn
- **FishBarnHandler**: Xử lý logic chọn thức ăn và cho ăn

## 🎯 Lợi Ích

### Cho Người Chơi
- **Kiểm soát exp**: Biết chính xác exp sẽ nhận
- **Không cooldown**: Cho cá ăn bất cứ lúc nào
- **Linh hoạt**: Chọn loại thức ăn phù hợp với budget
- **Hiệu quả**: Tăng level nhanh hơn

### Cho Hệ Thống
- **Kinh tế**: Tạo thêm sink cho coins
- **Cân bằng**: Không quá mạnh, không quá yếu
- **Mở rộng**: Dễ dàng thêm loại thức ăn mới

## 🚀 Tính Năng Tương Lai

### Có Thể Thêm
- **Thức ăn đặc biệt**: Tăng stats thay vì chỉ exp
- **Thức ăn theo loại cá**: Bonus cho từng loại cá
- **Thức ăn thời gian**: Hiệu quả trong thời gian nhất định
- **Thức ăn hiếm**: Chỉ có thể mua bằng currency đặc biệt

### Cải Tiến UI
- **Hiển thị exp cần**: Cho biết cần bao nhiêu exp để lên level
- **Dự đoán level**: Tính toán level sẽ đạt sau khi ăn
- **So sánh thức ăn**: Hiển thị hiệu quả của từng loại

## 📝 Ghi Chú

- Thức ăn được lưu trữ theo user và guild
- Mỗi lần cho ăn sử dụng 1 thức ăn
- Cá level 10 không thể cho ăn thêm
- Không có giới hạn số lượng thức ăn có thể mua
- Thức ăn không bị mất khi restart bot 