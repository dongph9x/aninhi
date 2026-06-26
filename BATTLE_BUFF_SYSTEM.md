# Hệ Thống Buff/Debuff Ngẫu Nhiên

## Tổng Quan

Hệ thống buff/debuff ngẫu nhiên đã được thêm vào trận đấu cá để tạo thêm yếu tố bất ngờ và thú vị. Mỗi trận đấu, cả hai cá sẽ nhận được buff hoặc debuff ngẫu nhiên trước khi bắt đầu chiến đấu.

## 🎲 Cách Hoạt Động

### Phase 1.5: Buff/Debuff Ngẫu Nhiên
Hệ thống buff/debuff được kích hoạt ngay sau khi kiểm tra điều kiện đặc biệt và trước khi tính toán sức mạnh thực tế.

### Các Loại Buff/Debuff
```typescript
const buffTypes = [
  { name: 'Sức mạnh', stat: 'strength', emoji: '💪' },
  { name: 'Thể lực', stat: 'agility', emoji: '🏃' },
  { name: 'Trí tuệ', stat: 'intelligence', emoji: '🧠' },
  { name: 'Phòng thủ', stat: 'defense', emoji: '🛡️' },
  { name: 'May mắn', stat: 'luck', emoji: '🍀' }
];
```

### Thông Số Buff/Debuff
- **Số lượng**: 5-20 điểm (ngẫu nhiên)
- **Tỷ lệ**: 60% buff, 40% debuff
- **Áp dụng**: Cho mỗi cá riêng biệt
- **Loại**: Ngẫu nhiên cho mỗi trận đấu

## 📊 Ví Dụ Thực Tế

### Trận Đấu 1: User Thắng
```
📊 Stats ban đầu:
💪 User Fish: 1000 power
💪 Opponent Fish: 950 power

🎲 PHASE 1.5: Buff/Debuff ngẫu nhiên
📈 **User Fish** tăng Sức mạnh 12 điểm!
   Multiplier: x1.12
📉 **Opponent Fish** giảm Trí tuệ 8 điểm!
   Multiplier: x0.92

💪 Sức mạnh sau buff/debuff: 1120 vs 874
🏆 Kết quả: User Fish thắng!
```

### Trận Đấu 2: Opponent Thắng
```
📊 Stats ban đầu:
💪 User Fish: 1000 power
💪 Opponent Fish: 950 power

🎲 PHASE 1.5: Buff/Debuff ngẫu nhiên
📉 **User Fish** giảm May mắn 18 điểm!
   Multiplier: x0.82
📈 **Opponent Fish** tăng May mắn 19 điểm!
   Multiplier: x1.19

💪 Sức mạnh sau buff/debuff: 820 vs 1130
🏆 Kết quả: Opponent Fish thắng!
```

## 🎯 Công Thức Tính Toán

### Tạo Buff/Debuff
```typescript
// Chọn loại buff/debuff ngẫu nhiên
const buffType = buffTypes[Math.floor(Math.random() * buffTypes.length)];

// Tạo số lượng ngẫu nhiên (5-20 điểm)
const buffAmount = Math.floor(Math.random() * 15) + 5;

// Xác định buff hay debuff (60% buff, 40% debuff)
const isPositive = Math.random() > 0.4;

// Tính multiplier
const multiplier = isPositive ? 1 + (buffAmount / 100) : 1 - (buffAmount / 100);
```

### Áp Dụng Vào Sức Mạnh
```typescript
// Sức mạnh sau buff/debuff
const buffPower = basePower * multiplier;

// Sử dụng trong tính toán cuối cùng
const finalPower = buffPower * (1 + genBonus + luckBonus);
```

## 🎮 Hiển Thị Trong Game

### Battle Log
```
🎲 **PHASE 1.5: Buff/Debuff ngẫu nhiên**
📈 **User Fish** tăng Sức mạnh 12 điểm!
📉 **Opponent Fish** giảm Trí tuệ 8 điểm!
💪 Sức mạnh sau buff/debuff: 1120 vs 874
```

### Emoji và Màu Sắc
- **📈 Buff**: Tăng thuộc tính (màu xanh)
- **📉 Debuff**: Giảm thuộc tính (màu đỏ)

## 🏆 Tác Động Đến Trận Đấu

### 1. Thay Đổi Kết Quả
- Buff/debuff có thể thay đổi hoàn toàn kết quả trận đấu
- Cá yếu hơn có thể thắng nhờ buff mạnh
- Cá mạnh hơn có thể thua do debuff nặng

### 2. Tăng Tính Bất Ngờ
- Mỗi trận đấu đều khác nhau
- Không thể dự đoán chính xác kết quả
- Tạo cảm giác hồi hộp và thú vị

### 3. Cân Bằng Game
- Giảm bớt sự phụ thuộc vào stats cố định
- Tạo cơ hội cho cá yếu hơn
- Khuyến khích tham gia battle thường xuyên

## 📈 Thống Kê Buff/Debuff

### Tỷ Lệ Phân Bổ
- **Buff**: 60% (tăng thuộc tính)
- **Debuff**: 40% (giảm thuộc tính)

### Phạm Vi Ảnh Hưởng
- **Tối thiểu**: 5 điểm (5%)
- **Tối đa**: 20 điểm (20%)
- **Trung bình**: 12.5 điểm (12.5%)

### Các Thuộc Tính
- **Sức mạnh** (💪): 20% chance
- **Thể lực** (🏃): 20% chance
- **Trí tuệ** (🧠): 20% chance
- **Phòng thủ** (🛡️): 20% chance
- **May mắn** (🍀): 20% chance

## 🎯 Chiến Lược

### Cho Người Chơi
1. **Chấp nhận rủi ro**: Buff/debuff là ngẫu nhiên
2. **Không phụ thuộc vào stats**: Có thể thắng dù yếu hơn
3. **Tham gia thường xuyên**: Càng nhiều cơ hội buff tốt
4. **Theo dõi battle log**: Hiểu rõ tác động của buff/debuff

### Cho Admin
1. **Theo dõi thống kê**: Đảm bảo tỷ lệ công bằng
2. **Điều chỉnh tỷ lệ**: Nếu cần thiết
3. **Khuyến khích**: Tạo sự thú vị cho cộng đồng

## 🔧 Cấu Hình

Có thể điều chỉnh các thông số trong `src/utils/fish-battle.ts`:

```typescript
// Tỷ lệ buff/debuff
const BUFF_CHANCE = 0.6;  // 60% buff
const DEBUFF_CHANCE = 0.4; // 40% debuff

// Phạm vi buff/debuff
const MIN_BUFF_AMOUNT = 5;   // 5 điểm
const MAX_BUFF_AMOUNT = 20;  // 20 điểm

// Các loại buff/debuff
const BUFF_TYPES = [
  { name: 'Sức mạnh', stat: 'strength', emoji: '💪' },
  { name: 'Thể lực', stat: 'agility', emoji: '🏃' },
  { name: 'Trí tuệ', stat: 'intelligence', emoji: '🧠' },
  { name: 'Phòng thủ', stat: 'defense', emoji: '🛡️' },
  { name: 'May mắn', stat: 'luck', emoji: '🍀' }
];
```

## 🎉 Lợi Ích

1. **Thú Vị Hơn**: Mỗi trận đấu đều khác nhau
2. **Công Bằng Hơn**: Cơ hội cho mọi cá
3. **Bất Ngờ**: Không thể dự đoán kết quả
4. **Tương Tác**: Khuyến khích tham gia thường xuyên
5. **Chiến Lược**: Cần thích ứng với tình huống

## 🔄 Tích Hợp Với Hệ Thống Khác

### Tương Thích
- **Cooldown 30s**: Vẫn hoạt động bình thường
- **Phần thưởng cân bằng**: Tính toán sau buff/debuff
- **Critical hit**: Áp dụng sau buff/debuff
- **Upset victory**: Có thể xảy ra do buff/debuff

### Thứ Tự Áp Dụng
1. **Phase 1**: Kiểm tra điều kiện đặc biệt
2. **Phase 1.5**: Buff/Debuff ngẫu nhiên ⭐ **MỚI**
3. **Phase 2**: Tính toán sức mạnh thực tế
4. **Phase 3**: Kiểm tra critical hit
5. **Phase 4**: Khả năng đặc biệt
6. **Phase 5**: Kết quả cuối cùng
7. **Phase 6**: Xác định người thắng
8. **Phase 7**: Tính toán phần thưởng

Hệ thống buff/debuff đã sẵn sàng và sẽ tạo thêm nhiều niềm vui cho người chơi! 