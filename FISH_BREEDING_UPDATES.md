# 🐟 Cập Nhật Hệ Thống Lai Tạo Cá

## 📋 Tổng Quan

Hệ thống lai tạo cá đã được cập nhật với các tính năng mới:

1. **Cá bố mẹ biến mất sau khi lai tạo**
2. **Chỉ cá thế hệ 2+ mới có stats**
3. **Tăng stats ngẫu nhiên 1-3 điểm khi lên cấp**

## 🔄 Thay Đổi Chính

### 1. Cá Bố Mẹ Biến Mất
- Khi lai tạo thành công, cá bố mẹ sẽ bị xóa khỏi hệ thống
- Chỉ cá con được tạo ra và tồn tại
- Điều này tạo ra sự khan hiếm và giá trị cho cá

### 2. Stats Chỉ Có Ở Cá Thế Hệ 2+
- **Cá thế hệ 1**: Không có stats (tất cả = 0)
- **Cá thế hệ 2+**: Có stats di truyền từ bố mẹ
- Chỉ cá thế hệ 2+ mới có thể tham gia đấu cá

### 3. Tăng Stats Khi Lên Cấp
- Mỗi khi lên cấp, tất cả stats tăng ngẫu nhiên 1-3 điểm
- Áp dụng cho cá thế hệ 2+ trở lên
- Giá trị tối đa của mỗi stat là 100

## 🎮 Cách Sử Dụng

### Lai Tạo Cá
```bash
n.breed <fish1_id> <fish2_id>
```

**Yêu cầu:**
- Cả hai cá phải là huyền thoại (legendary)
- Cả hai cá phải trưởng thành (adult)
- Không thể lai tạo cá với chính nó

**Kết quả:**
- Cá bố mẹ bị xóa
- Tạo ra cá con với:
  - Tên kết hợp từ bố mẹ
  - Thế hệ = max(thế hệ bố mẹ) + 1
  - Stats di truyền từ bố mẹ
  - Traits di truyền từ bố mẹ

### Cho Cá Ăn
```bash
n.feed <fish_id>
```

**Tính năng:**
- Cá thế hệ 1: Chỉ tăng level, không tăng stats
- Cá thế hệ 2+: Tăng level + tăng stats ngẫu nhiên 1-3 điểm
- Cooldown 1 giờ (có thể bypass bằng admin)

### Đấu Cá
```bash
n.fishbattle ui
```

**Yêu cầu:**
- Chỉ cá thế hệ 2+ mới có thể đấu
- Cá phải trưởng thành (adult)
- Cá phải có trong túi đấu

## 📊 Ví Dụ

### Cá Thế Hệ 1 (Không Có Stats)
```json
{
  "species": "Golden Dragon Fish",
  "generation": 1,
  "stats": {
    "strength": 0,
    "agility": 0,
    "intelligence": 0,
    "defense": 0,
    "luck": 0
  }
}
```

### Cá Thế Hệ 2 (Có Stats)
```json
{
  "species": "Little Crystal Golden",
  "generation": 2,
  "stats": {
    "strength": 17,
    "agility": 10,
    "intelligence": 25,
    "defense": 11,
    "luck": 26
  }
}
```

### Sau Khi Lên Cấp
```json
{
  "species": "Little Crystal Golden",
  "generation": 2,
  "level": 4,
  "stats": {
    "strength": 19,  // +2
    "agility": 12,   // +2
    "intelligence": 27, // +2
    "defense": 13,   // +2
    "luck": 28       // +2
  }
}
```

## 🔧 Lệnh Admin

### Cho Cá Ăn (Bypass Cooldown)
```bash
n.feed <fish_id> --admin
```

### Tạo Cá Test
```bash
n.give <user_id> fish legendary <species> <generation>
```

## 🎯 Chiến Lược

### 1. Thu Thập Cá Huyền Thoại
- Câu cá huyền thoại để có cá thế hệ 1
- Lai tạo để tạo ra cá thế hệ 2+ có stats

### 2. Nuôi Dưỡng Cá
- Cho cá thế hệ 2+ ăn thường xuyên
- Mỗi lần lên cấp sẽ tăng stats
- Cá level cao sẽ mạnh hơn trong đấu

### 3. Lai Tạo Thông Minh
- Chọn cá bố mẹ có stats tốt
- Cá con sẽ thừa hưởng stats từ bố mẹ
- Tạo ra dòng cá mạnh qua nhiều thế hệ

### 4. Đấu Cá
- Chỉ sử dụng cá thế hệ 2+ trưởng thành
- Cá có stats cao sẽ có lợi thế
- Level cao cũng tăng sức mạnh

## ⚠️ Lưu Ý Quan Trọng

1. **Cá bố mẹ sẽ biến mất** sau khi lai tạo - hãy suy nghĩ kỹ trước khi lai tạo
2. **Chỉ cá thế hệ 2+ mới có thể đấu** - cá thế hệ 1 chỉ dùng để lai tạo
3. **Stats tăng ngẫu nhiên** - không thể kiểm soát chính xác
4. **Cooldown cho ăn** - 1 giờ giữa các lần cho ăn (trừ admin)

## 🧪 Test Script

Chạy script test để kiểm tra hệ thống:
```bash
npx tsx scripts/test-fish-breeding-updates.ts
```

Script sẽ test:
- Tạo cá thế hệ 1 (không stats)
- Lai tạo tạo cá thế hệ 2 (có stats)
- Cho ăn và lên cấp
- Validation đấu cá
- Lai tạo thế hệ 3

## 📈 Tương Lai

Hệ thống này tạo ra:
- **Sự khan hiếm**: Cá bố mẹ biến mất
- **Giá trị thế hệ**: Cá thế hệ cao hơn mạnh hơn
- **Chiến lược**: Cần suy nghĩ về việc lai tạo
- **Cân bằng**: Không thể spam tạo cá mạnh 