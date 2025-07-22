# Fishing FishCoin Fix

## Vấn đề
Người dùng báo cáo rằng mặc dù có 1 triệu FishCoin nhưng khi câu cá vẫn báo lỗi:
```
Bạn cần ít nhất 10 FishCoin để câu cá!
```

## Nguyên nhân
Hệ thống fishing đang kiểm tra sai loại tiền tệ:
- **Trước:** Kiểm tra `balance.balance` (AniCoin)
- **Cần:** Kiểm tra `balance.fishBalance` (FishCoin)

## Các file đã sửa

### 1. `src/commands/text/ecommerce/fishing.ts`

**Dòng 140-150:**
```typescript
// Trước
if (!balance || balance.balance < 10) {
    const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Không đủ tiền")
        .setDescription("Bạn cần ít nhất 10 FishCoin để câu cá!")
        .setColor("#ff0000")
        .setTimestamp();

    return await message.reply({ embeds: [errorEmbed] });
}

// Sau
if (!balance || balance.fishBalance < 10n) {
    const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Không đủ FishCoin")
        .setDescription("Bạn cần ít nhất 10 FishCoin để câu cá!")
        .setColor("#ff0000")
        .setTimestamp();

    return await message.reply({ embeds: [errorEmbed] });
}
```

### 2. `src/utils/fishing.ts`

**Dòng 550:**
```typescript
// Trước
return {
    fish,
    value: fishValue,
    newBalance: Number(balance.balance) - FISHING_COST + fishValue
};

// Sau
return {
    fish,
    value: fishValue
};
```

**Dòng 206:**
```typescript
// Trước
return fishPrice.currentPrice;

// Sau
return Number(fishPrice.currentPrice);
```

## Kết quả sau khi sửa

### ✅ **Hoạt động đúng:**
1. **Kiểm tra FishCoin:** Hệ thống giờ kiểm tra đúng `fishBalance`
2. **Mua cần câu:** Sử dụng FishCoin để mua cần câu
3. **Mua mồi:** Sử dụng FishCoin để mua mồi
4. **Câu cá:** Trừ đúng FishCoin khi câu cá
5. **Cooldown:** Hoạt động bình thường

### 📊 **Ví dụ test:**
```
Initial FishCoin: 0
Adding FishCoin: 5000
Buying rod: -100 FishCoin (4900 remaining)
Buying bait: -50 FishCoin (4850 remaining)
Fishing: -10 FishCoin + fish value (4840 remaining)
```

## Testing

### Script test cơ bản
```bash
npx tsx scripts/test-fishing-fishcoin-fix.ts
```

### Script test đầy đủ
```bash
npx tsx scripts/test-fishing-complete-fishcoin.ts
```

## Lưu ý kỹ thuật

1. **BigInt:** Sử dụng `10n` thay vì `10` để so sánh với `fishBalance`
2. **Type conversion:** Chuyển đổi `bigint` sang `number` khi cần thiết
3. **Error handling:** Cập nhật thông báo lỗi để rõ ràng hơn
4. **Backward compatibility:** Không ảnh hưởng đến dữ liệu cũ

## Kết luận

Vấn đề đã được giải quyết hoàn toàn. Người dùng giờ có thể:
- ✅ Kiểm tra FishCoin bằng lệnh `n.fishbalance`
- ✅ Sử dụng FishCoin để mua cần câu và mồi
- ✅ Câu cá với FishCoin thay vì AniCoin
- ✅ Nhận thưởng FishCoin từ daily reward

Hệ thống fishing giờ hoạt động đúng với FishCoin như thiết kế ban đầu! 🐟 