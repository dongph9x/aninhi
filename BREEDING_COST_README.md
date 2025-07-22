# Breeding Cost System

## Tổng quan

Hệ thống chi phí lai tạo cá được thêm vào để cân bằng gameplay và tạo thêm thách thức cho việc lai tạo. Mỗi lần lai tạo sẽ tốn **100,000 FishCoin**.

## Tính năng chính

### 1. Chi phí lai tạo
- **Chi phí**: 100,000 FishCoin cho mỗi lần lai tạo
- **Áp dụng**: Tất cả các lần lai tạo cá huyền thoại
- **Kiểm tra**: Tự động kiểm tra số dư FishCoin trước khi lai tạo

### 2. Ngoại lệ cho Admin
- Administrator không phải trả chi phí lai tạo
- Có thể lai tạo miễn phí không giới hạn
- Vẫn áp dụng các logic khác (kiểm tra cá trưởng thành, cùng thế hệ, etc.)

### 3. Thông báo rõ ràng
- Hiển thị chi phí lai tạo trong UI
- Thông báo khi không đủ FishCoin
- Ghi lại chi phí trong lịch sử lai tạo

## Files được cập nhật

### 1. `src/utils/fish-breeding.ts`
- Thêm `BREEDING_COST` constant (100,000)
- Cập nhật `breedFish()` function để kiểm tra và trừ FishCoin
- Thêm `getBreedingCost()` function
- Ghi lại chi phí trong breeding history

### 2. `src/components/MessageComponent/FishBarnHandler.ts`
- Cập nhật `handleConfirmBreed()` để truyền thông tin admin
- Hiển thị chi phí lai tạo trong embed thông báo
- Phân biệt hiển thị cho admin và user thường

### 3. `src/components/MessageComponent/FishBarnUI.ts`
- Hiển thị chi phí lai tạo trong chế độ breeding
- Thông tin chi phí trong description của embed

### 4. `scripts/test-breeding-cost.ts` (Mới)
- Test script toàn diện cho breeding cost system
- Kiểm tra tất cả các trường hợp: không đủ FishCoin, đủ FishCoin, admin privilege

## Cách hoạt động

### 1. Kiểm tra chi phí trước khi lai tạo
```typescript
// Kiểm tra chi phí lai tạo (trừ khi là admin)
if (!isAdmin) {
  const hasEnoughFishCoin = await fishCoinDB.hasEnoughFishCoin(userId, guildId, this.BREEDING_COST);
  if (!hasEnoughFishCoin) {
    return { 
      success: false, 
      error: `Không đủ FishCoin để lai tạo! Cần ${this.BREEDING_COST.toLocaleString()} FishCoin` 
    };
  }
}
```

### 2. Trừ FishCoin sau khi lai tạo thành công
```typescript
// Trừ FishCoin (trừ khi là admin)
if (!isAdmin) {
  await fishCoinDB.subtractFishCoin(
    userId, 
    guildId, 
    this.BREEDING_COST, 
    `Breeding cost: ${fish1.species} + ${fish2.species} = ${offspringSpecies}`
  );
}
```

### 3. Ghi lại trong lịch sử
```typescript
await prisma.breedingHistory.create({
  data: {
    // ... other fields ...
    notes: `Lai tạo thành công: ${fish1.species} + ${fish2.species} = ${offspringSpecies} (Chi phí: ${this.BREEDING_COST.toLocaleString()} FishCoin)`
  }
});
```

## Test Results

```
🧪 Testing Breeding Cost System...

1️⃣ Creating test user...
✅ Test user created

2️⃣ Checking breeding cost...
Breeding cost: 100,000 FishCoin
✅ Breeding cost check completed

3️⃣ Creating test fish for breeding...
✅ Test fish created: Test Fish 1 and Test Fish 2

4️⃣ Testing breeding with insufficient FishCoin...
Breeding result (insufficient FishCoin): {
  success: false,
  error: 'Không đủ FishCoin để lai tạo! Cần 100,000 FishCoin'
}
✅ Insufficient FishCoin test completed

5️⃣ Adding sufficient FishCoin...
Current FishCoin balance: 100000
✅ FishCoin added

6️⃣ Testing breeding with sufficient FishCoin...
Breeding result (sufficient FishCoin): {
  success: true,
  parent1: { ... },
  parent2: { ... },
  offspring: { ... }
}
✅ Sufficient FishCoin test completed

7️⃣ Checking balance after breeding...
FishCoin balance after breeding: 0
Expected balance: 0
✅ Balance check completed

8️⃣ Testing breeding with admin privilege...
Admin breeding result: { success: true, ... }
Balance before admin breeding: 0
Balance after admin breeding: 0
Balance unchanged (admin privilege): true
✅ Admin privilege test completed

🎉 All tests completed successfully!
```

## Sử dụng

### Command cơ bản
```bash
n.fishbarn          # Mở rương nuôi cá
# Chọn chế độ lai tạo và chọn 2 cá để lai tạo
```

### UI hiển thị thông tin
```
❤️ Chế Độ Lai Tạo
Chọn 2 cá trưởng thành để lai tạo
💸 Chi phí lai tạo: 100,000 FishCoin
```

### Thông báo khi không đủ FishCoin
```
❌ Không đủ FishCoin để lai tạo! Cần 100,000 FishCoin
```

### Thông báo thành công
```
❤️ Lai Tạo Thành Công!
🐟 Cá bố: Test Fish 1
🐟 Cá mẹ: Test Fish 2
🐠 Cá con: Young Test Test
💸 Chi Phí Lai Tạo: 100,000 FishCoin
```

### Thông báo cho Admin
```
❤️ Lai Tạo Thành Công!
🐟 Cá bố: Test Fish 1
🐟 Cá mẹ: Test Fish 2
🐠 Cá con: Young Test Test
👑 Admin Privilege: Miễn phí lai tạo
```

## Tích hợp với hệ thống hiện tại

### 1. FishBreedingService
- Kiểm tra chi phí trước khi lai tạo
- Trừ FishCoin sau khi lai tạo thành công
- Ghi lại chi phí trong breeding history
- Admin không bị giới hạn chi phí

### 2. FishBarnHandler
- Truyền thông tin admin vào breeding function
- Hiển thị chi phí trong thông báo thành công
- Phân biệt hiển thị cho admin và user thường

### 3. FishBarnUI
- Hiển thị chi phí lai tạo trong chế độ breeding
- Thông tin chi phí trong description

### 4. FishCoin System
- Tích hợp với hệ thống FishCoin hiện tại
- Sử dụng `fishCoinDB.subtractFishCoin()` để trừ tiền
- Ghi lại transaction trong lịch sử FishCoin

## Lợi ích

1. **Cân bằng gameplay**: Tạo thách thức cho việc lai tạo
2. **Tăng giá trị FishCoin**: FishCoin trở nên có giá trị hơn
3. **Tăng tính chiến lược**: User phải cân nhắc khi nào lai tạo
4. **Giảm spam lai tạo**: Hạn chế lai tạo liên tục
5. **Công bằng**: Tất cả user đều có cùng chi phí
6. **Linh hoạt**: Admin vẫn có thể lai tạo miễn phí

## So sánh với các hệ thống khác

| Tính năng | Daily Battle Limit | Daily Feed Limit | Breeding Cost |
|-----------|-------------------|------------------|---------------|
| Giới hạn | 20 lần/ngày | 20 lần/ngày | 100,000 FishCoin/lần |
| Reset | 00:00 ngày mai | 00:00 ngày mai | Không reset |
| Admin | Không bị giới hạn | Không bị giới hạn | Miễn phí |
| Loại | Time-based | Time-based | Resource-based |

## Tương lai

- Có thể thêm VIP system với chi phí thấp hơn
- Thêm breeding pass system
- Thêm special events với chi phí khác nhau
- Thêm breeding discount cho user level cao
- Thêm breeding cost scaling theo thế hệ cá 