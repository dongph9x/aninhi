# Daily Reward FishCoin Integration

## Tổng quan
Đã tích hợp FishCoin vào hệ thống daily reward, cho phép người dùng nhận cả AniCoin và FishCoin khi sử dụng lệnh `n.daily`.

## Thay đổi chính

### 1. Cập nhật `processDailyClaim` trong `ecommerce-db.ts`

**Trước:**
```typescript
const totalAmount = baseAmount + streakBonus;
// Chỉ cộng AniCoin
balance: { increment: totalAmount }
```

**Sau:**
```typescript
const totalAniAmount = baseAmount + streakBonus;
const totalFishAmount = totalAniAmount; // FishCoin bằng với AniCoin

// Cộng cả AniCoin và FishCoin
balance: { increment: totalAniAmount },
fishBalance: { increment: totalFishAmount }
```

### 2. Ghi lại transaction cho cả hai loại tiền

**AniCoin Transaction:**
```typescript
await tx.transaction.create({
    data: {
        userId, guildId,
        amount: totalAniAmount,
        type: "daily",
        description: `Daily reward (streak: ${user.dailyStreak + 1})`
    }
});
```

**FishCoin Transaction:**
```typescript
await tx.fishTransaction.create({
    data: {
        userId, guildId,
        amount: totalFishAmount,
        type: "daily",
        description: `Daily reward FishCoin (streak: ${user.dailyStreak + 1})`
    }
});
```

### 3. Cập nhật hiển thị trong `daily.ts`

**Trước:**
```
💰 **Chi Tiết Thưởng:**
• Thưởng cơ bản: **1000** AniCoin
• Thưởng chuỗi: **100** AniCoin
• **Tổng cộng:** **1100** AniCoin
```

**Sau:**
```
💰 **Chi Tiết Thưởng AniCoin:**
• Thưởng cơ bản: **1000** AniCoin
• Thưởng chuỗi: **100** AniCoin
• **Tổng AniCoin:** **1100** AniCoin

🐟 **Chi Tiết Thưởng FishCoin:**
• Thưởng cơ bản: **1000** FishCoin
• Thưởng chuỗi: **100** FishCoin
• **Tổng FishCoin:** **1100** FishCoin
```

## Công thức thưởng

### AniCoin
- **Thưởng cơ bản:** 1,000 AniCoin
- **Thưởng chuỗi:** `dailyStreak × 100` (tối đa 1,000)
- **Tổng:** 1,000 + (streak × 100)

### FishCoin
- **Thưởng cơ bản:** 1,000 FishCoin
- **Thưởng chuỗi:** `dailyStreak × 100` (tối đa 1,000)
- **Tổng:** 1,000 + (streak × 100)

## Ví dụ thực tế

| Ngày | Streak | AniCoin | FishCoin | Tổng |
|------|--------|---------|----------|------|
| 1    | 0      | 1,000   | 1,000    | 2,000 |
| 2    | 1      | 1,100   | 1,100    | 2,200 |
| 3    | 2      | 1,200   | 1,200    | 2,400 |
| 7    | 6      | 1,600   | 1,600    | 3,200 |
| 10   | 9      | 1,900   | 1,900    | 3,800 |
| 15   | 14     | 2,000   | 2,000    | 4,000 |

## Cấu trúc database

### Bảng `User`
- `balance`: Số dư AniCoin
- `fishBalance`: Số dư FishCoin
- `dailyStreak`: Chuỗi ngày claim liên tiếp

### Bảng `Transaction`
- Ghi lại giao dịch AniCoin từ daily reward

### Bảng `FishTransaction`
- Ghi lại giao dịch FishCoin từ daily reward

### Bảng `DailyClaim`
- Ghi lại thời gian claim (không thay đổi)

## Testing

### Script test cơ bản
```bash
npx tsx scripts/test-daily-fishcoin.ts
```

### Script test streak
```bash
npx tsx scripts/test-daily-streak-fishcoin.ts
```

## Lợi ích

1. **Tăng giá trị thưởng:** Người dùng nhận gấp đôi giá trị
2. **Hỗ trợ FishCoin:** Tích hợp hoàn toàn với hệ thống FishCoin
3. **Tính nhất quán:** Cả hai loại tiền đều có cùng công thức
4. **Backward compatibility:** Không ảnh hưởng đến dữ liệu cũ
5. **Audit trail:** Ghi lại đầy đủ transaction cho cả hai loại tiền

## Lưu ý kỹ thuật

- Sử dụng transaction để đảm bảo tính nhất quán
- Cả hai loại tiền đều sử dụng BigInt để xử lý số lớn
- Cooldown 24 giờ vẫn được áp dụng như cũ
- Streak bonus được tính riêng cho mỗi loại tiền
- Error handling đầy đủ cho cả hai loại tiền 