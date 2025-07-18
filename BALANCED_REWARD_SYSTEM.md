# Hệ Thống Tính Phần Thưởng Cân Bằng

## Tổng Quan

Hệ thống tính phần thưởng mới khuyến khích những trận đấu cân bằng và thú vị. Thay vì chỉ dựa vào tổng sức mạnh, hệ thống mới tính toán dựa trên độ chênh lệch sức mạnh giữa hai cá.

## 🎯 Nguyên Tắc Cơ Bản

### Công Thức Tính Toán
```typescript
// Tính độ chênh lệch
const powerDifference = Math.abs(winnerPower - loserPower);
const totalPower = winnerPower + loserPower;
const powerRatio = powerDifference / totalPower; // 0 = cân bằng, 1 = chênh lệch lớn

// Base reward (tăng 10 lần)
const baseReward = Math.floor(totalPower / 1); // Thay vì chia 10, giờ chia 1

// Multiplier dựa trên độ cân bằng
const balanceMultiplier = Math.max(0.5, 2.0 - powerRatio * 1.5); // 0.5 - 2.0

// Phần thưởng cơ bản
let winnerReward = Math.floor(baseReward * balanceMultiplier);
let loserReward = Math.floor(baseReward * 0.3);
```

## 🏆 Hệ Thống Bonus/Penalty

### 🌟 Bonus Hoàn Hảo (+50%)
- **Điều kiện**: Chênh lệch sức mạnh < 10%
- **Ví dụ**: 1000 vs 950 (chênh lệch 3%)
- **Kết quả**: Nhận thêm 50% phần thưởng

### ✨ Bonus Cân Bằng (+30%)
- **Điều kiện**: Chênh lệch sức mạnh 10-25%
- **Ví dụ**: 1000 vs 800 (chênh lệch 11%)
- **Kết quả**: Nhận thêm 30% phần thưởng

### 📊 Trận Đấu Bình Thường
- **Điều kiện**: Chênh lệch sức mạnh 25-50%
- **Ví dụ**: 1000 vs 600 (chênh lệch 25%)
- **Kết quả**: Phần thưởng cơ bản, không bonus/penalty

### ⚠️ Penalty Không Cân Bằng (-30%)
- **Điều kiện**: Chênh lệch sức mạnh > 50%
- **Ví dụ**: 1000 vs 200 (chênh lệch 67%)
- **Kết quả**: Bị giảm 30% phần thưởng

## 📈 Ví Dụ Thực Tế

### Test 1: Trận Đấu Rất Cân Bằng
```
💪 Sức mạnh: 1000 vs 950
📊 Chênh lệch: 50 (3%)
⚖️ Độ cân bằng: 97%
🎯 Multiplier: x1.96
💰 Base reward: 1,950
🏆 Winner reward: 5,737 coins (+50% bonus)
💀 Loser reward: 585 coins
```

### Test 2: Trận Đấu Cân Bằng
```
💪 Sức mạnh: 1000 vs 800
📊 Chênh lệch: 200 (11%)
⚖️ Độ cân bằng: 89%
🎯 Multiplier: x1.83
💰 Base reward: 180
🏆 Winner reward: 429 coins (+30% bonus)
💀 Loser reward: 54 coins
```

### Test 3: Trận Đấu Bình Thường
```
💪 Sức mạnh: 1000 vs 600
📊 Chênh lệch: 400 (25%)
⚖️ Độ cân bằng: 75%
🎯 Multiplier: x1.63
💰 Base reward: 160
🏆 Winner reward: 260 coins
💀 Loser reward: 48 coins
```

### Test 4: Trận Đấu Không Cân Bằng
```
💪 Sức mạnh: 1000 vs 400
📊 Chênh lệch: 600 (43%)
⚖️ Độ cân bằng: 57%
🎯 Multiplier: x1.36
💰 Base reward: 140
🏆 Winner reward: 190 coins
💀 Loser reward: 42 coins
```

### Test 5: Trận Đấu Cực Kỳ Không Cân Bằng
```
💪 Sức mạnh: 1000 vs 200
📊 Chênh lệch: 800 (67%)
⚖️ Độ cân bằng: 33%
🎯 Multiplier: x1.00
💰 Base reward: 120
🏆 Winner reward: 84 coins (-30% penalty)
💀 Loser reward: 36 coins
```

## 🎉 So Sánh Phần Thưởng

| Loại Trận Đấu | Chênh Lệch | Phần Thưởng | Tỷ Lệ |
|---------------|------------|-------------|-------|
| 🌟 Rất cân bằng | < 10% | 5,737 coins | Cao nhất |
| ✨ Cân bằng | 10-25% | 4,290 coins | Cao |
| 📊 Bình thường | 25-50% | 2,600 coins | Trung bình |
| ⚠️ Không cân bằng | > 50% | 1,900 coins | Thấp |
| 💀 Cực kỳ không cân bằng | > 67% | 840 coins | Thấp nhất |

## 🎯 Chiến Lược Tối Ưu

### ✅ Nên Làm
- **Tìm đối thủ có sức mạnh tương đương** (chênh lệch < 25%)
- **Nuôi cá có stats cân bằng** để dễ tìm đối thủ phù hợp
- **Tham gia những trận đấu căng thẳng** để có phần thưởng cao

### ❌ Không Nên Làm
- **Đấu với cá quá yếu** (sẽ bị penalty)
- **Đấu với cá quá mạnh** (có thể thua và nhận ít phần thưởng)
- **Chỉ tập trung vào một stat** (khó tìm đối thủ cân bằng)

## 🔄 Tích Hợp Với Hệ Thống Cũ

### Giữ Nguyên
- **Upset Bonus (+50%)**: Khi cá yếu thắng cá mạnh
- **Critical Hit Bonus (+20%)**: Khi có đòn đánh quan trọng
- **Cooldown 30 giây**: Giữa các lần battle

### Cải Tiến
- **Phần thưởng cơ bản**: Dựa trên độ cân bằng thay vì chỉ tổng sức mạnh
- **Hiển thị chi tiết**: Thông tin về độ cân bằng và multiplier
- **Khuyến khích fair play**: Tránh bully cá yếu

## 📊 Lợi Ích

1. **Công Bằng Hơn**: Khuyến khích đấu với đối thủ tương đương
2. **Thú Vị Hơn**: Trận đấu cân bằng thường gay cấn hơn
3. **Chiến Lược**: Cần suy nghĩ về việc chọn đối thủ
4. **Cộng Đồng**: Tạo môi trường game lành mạnh
5. **Kinh Tế**: Phân bổ phần thưởng hợp lý hơn

## 🎮 Hướng Dẫn Sử Dụng

### Cho Người Chơi
1. **Kiểm tra sức mạnh** của cá trước khi battle
2. **Tìm đối thủ phù hợp** (chênh lệch < 25% là lý tưởng)
3. **Tránh đấu với cá quá yếu** (sẽ bị penalty)
4. **Tận dụng bonus** từ trận đấu cân bằng

### Cho Admin
1. **Theo dõi thống kê** battle để đảm bảo hệ thống hoạt động tốt
2. **Điều chỉnh tỷ lệ** nếu cần thiết
3. **Khuyến khích** người chơi sử dụng hệ thống đúng cách

## 🔧 Cấu Hình

Có thể điều chỉnh các thông số trong `src/utils/fish-battle.ts`:

```typescript
// Tỷ lệ chênh lệch cho bonus/penalty
const PERFECT_BALANCE_THRESHOLD = 0.1;  // 10%
const BALANCE_BONUS_THRESHOLD = 0.25;   // 25%
const IMBALANCE_PENALTY_THRESHOLD = 0.5; // 50%

// Multiplier range
const MIN_MULTIPLIER = 0.5;
const MAX_MULTIPLIER = 2.0;

// Bonus/Penalty percentages
const PERFECT_BALANCE_BONUS = 1.5;  // +50%
const BALANCE_BONUS = 1.3;          // +30%
const IMBALANCE_PENALTY = 0.7;      // -30%
``` 