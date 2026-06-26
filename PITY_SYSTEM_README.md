# 🎣 Pity System - Hệ thống bảo hộ cá huyền thoại

## 📋 Tổng quan

Pity System là một tính năng đảm bảo người chơi có cơ hội nhận cá huyền thoại sau một số lần câu nhất định, ngay cả khi họ không may mắn.

## 🎯 Cách thức hoạt động

### 📊 Cấu hình mặc định
- **Ngưỡng pity:** 500 lần câu không ra cá huyền thoại
- **Hệ số tăng tỷ lệ:** 2.0x khi gần ngưỡng
- **Reset pity:** Có (khi câu được cá huyền thoại)

### 🔄 Cơ chế hoạt động

1. **Theo dõi pity count:**
   - Mỗi lần câu không ra cá huyền thoại → tăng pity count +1
   - Mỗi lần câu được cá huyền thoại → reset pity count về 0

2. **Tăng tỷ lệ theo pity:**
   - **0-50% ngưỡng:** Không tăng tỷ lệ
   - **50-80% ngưỡng:** Tăng tỷ lệ vừa phải
   - **80-100% ngưỡng:** Tăng tỷ lệ mạnh

3. **Đảm bảo cá huyền thoại:**
   - Khi đạt 500 lần câu không ra cá huyền thoại → đảm bảo ra 1 con

## 📈 Công thức tính toán

### Pity Multiplier
```typescript
if (pityProgress >= 0.8) {
    // Tăng mạnh khi gần ngưỡng (80% trở lên)
    return 2.0 * (1 + pityProgress);
} else if (pityProgress >= 0.5) {
    // Tăng vừa phải khi đạt 50%
    return 1.0 + (pityProgress * 0.5);
}
return 1.0;
```

### Ví dụ:
- **Pity count = 0:** Multiplier = 1.0x
- **Pity count = 250 (50%):** Multiplier = 1.25x
- **Pity count = 400 (80%):** Multiplier = 3.6x
- **Pity count = 500 (100%):** Multiplier = 4.0x

## 🎮 Lệnh sử dụng

### Xem thông tin pity
```
n.pity
```

**Kết quả:**
- Số lần câu không ra cá huyền thoại
- Còn lại bao nhiêu lần đến đảm bảo
- Tỷ lệ pity hiện tại
- Thời gian câu được cá huyền thoại cuối cùng

## 🐋 Cá huyền thoại có sẵn

Hệ thống bao gồm **8 loại cá huyền thoại:**

1. **Cá voi xanh** (🐳) - 10,000-20,000 FishCoin
2. **Cá mực khổng lồ** (🦑) - 8,000-20,000 FishCoin
3. **Cá rồng biển** (🐉) - 15,000-50,000 FishCoin
4. **Cá thần biển** (🧜) - 20,000-60,000 FishCoin
5. **Vua biển** (🔱) - 25,000-80,000 FishCoin
6. **Cá rồng nước ngọt** (🐉) - 12,000-40,000 FishCoin
7. **Cá thần nước ngọt** (🧜‍♂️) - 18,000-55,000 FishCoin
8. **Vua nước ngọt** (👑) - 22,000-70,000 FishCoin

## 🔧 Cấu trúc Database

### Bảng `FishingData`
```sql
-- Các trường mới cho pity system
legendaryPityCount Int      @default(0)  -- Số lần câu không ra cá huyền thoại
lastLegendaryCaught DateTime?           -- Thời gian câu được cá huyền thoại cuối cùng
```

## 🎯 Tính năng nổi bật

### ✅ Đã hoàn thành
- [x] Theo dõi số lần câu không ra cá huyền thoại
- [x] Tăng tỷ lệ theo pity count
- [x] Đảm bảo cá huyền thoại khi đạt ngưỡng
- [x] Reset pity count khi câu được cá huyền thoại
- [x] Lệnh xem thông tin pity (`n.pity`)
- [x] Thông báo khi pity system kích hoạt
- [x] Tích hợp với hệ thống câu cá hiện tại

### 🎨 Giao diện
- **Embed thông tin pity:** Hiển thị đầy đủ thông tin pity
- **Thông báo kích hoạt:** Embed đặc biệt khi pity system kích hoạt
- **Tích hợp kết quả câu cá:** Hiển thị thông báo pity trong kết quả câu cá

## 📊 Thống kê

### Pity Progress
- **0-50%:** Tỷ lệ cơ bản
- **50-80%:** Tăng tỷ lệ vừa phải
- **80-100%:** Tăng tỷ lệ mạnh
- **100%:** Đảm bảo ra cá huyền thoại

### Multiplier Examples
| Pity Count | Progress | Multiplier | Effect |
|------------|----------|------------|---------|
| 0 | 0% | 1.0x | Bình thường |
| 250 | 50% | 1.25x | Tăng nhẹ |
| 400 | 80% | 3.6x | Tăng mạnh |
| 500 | 100% | 4.0x | Đảm bảo |

## 🔄 Workflow

1. **Người chơi câu cá**
2. **Hệ thống kiểm tra pity count**
3. **Áp dụng pity multiplier cho tỷ lệ cá huyền thoại**
4. **Nếu đạt ngưỡng 500 → đảm bảo ra cá huyền thoại**
5. **Cập nhật pity count (tăng hoặc reset)**
6. **Hiển thị thông báo nếu pity kích hoạt**

## 🎯 Lợi ích

- **Công bằng:** Đảm bảo mọi người chơi đều có cơ hội nhận cá huyền thoại
- **Thú vị:** Tăng cảm giác mong đợi khi gần ngưỡng
- **Cân bằng:** Không làm giảm giá trị của cá huyền thoại
- **Minh bạch:** Người chơi có thể theo dõi tiến độ pity

## 🚀 Tương lai

- [ ] Cấu hình pity cho từng loại rarity khác nhau
- [ ] Pity system cho các item đặc biệt khác
- [ ] Thống kê pity system chi tiết
- [ ] Achievement cho pity system 