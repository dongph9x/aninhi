# Feed Fish BigInt Fix

## Tóm tắt
Đã sửa lỗi `TypeError: Cannot mix BigInt and other types, use explicit conversions` trong lệnh cho cá ăn (feed fish).

## Vấn đề gốc
Lỗi xảy ra khi:
- `fish.value` là BigInt nhưng được sử dụng trực tiếp trong phép tính với number
- Lỗi ở dòng 224 trong `src/utils/fish-breeding.ts` trong function `feedFishWithFood`

## Các lỗi đã sửa

### 1. Trong `fish-breeding.ts` - `feedFishWithFood` method
**Trước:**
```typescript
// Tính giá mới (tăng 2% mỗi level)
const valueIncrease = (newLevel - fish.level) * 0.02;
const newValue = Math.floor(fish.value * (1 + valueIncrease));
```

**Sau:**
```typescript
// Tính giá mới (tăng 2% mỗi level)
const valueIncrease = (newLevel - fish.level) * 0.02;
const newValue = Math.floor(Number(fish.value) * (1 + valueIncrease));
```

### 2. Trong `fish-breeding.ts` - `feedFish` method
**Trước:**
```typescript
// Tính giá mới (tăng 2% mỗi level)
const valueIncrease = (newLevel - fish.level) * 0.02;
const newValue = Math.floor(fish.value * (1 + valueIncrease));
```

**Sau:**
```typescript
// Tính giá mới (tăng 2% mỗi level)
const valueIncrease = (newLevel - fish.level) * 0.02;
const newValue = Math.floor(Number(fish.value) * (1 + valueIncrease));
```

## Các file đã sửa
- `src/utils/fish-breeding.ts`

## Các script test đã tạo
- `scripts/test-feed-fish-bigint.ts` - Test logic BigInt cơ bản
- `scripts/test-feed-fish-real.ts` - Test logic thực tế

## Kết quả test
```
✅ Found user: 389957152153796608
✅ Found fish inventory with 1 items

🐟 Testing with fish: Vua biển
   ID: cmdbuc1rz0010ry1ajcy0em89
   Level: 1
   Experience: 0 (type: number)
   Value: 146661 (type: bigint)

📝 Testing feedFishWithFood logic...
   Current exp: 0
   Exp gained: 10
   New exp: 10
   Current level: 1
   Exp needed for next level: 20
   Value increase: 0
   Old value: 146661
   New value: 146661
   Final level: 1
   Final exp: 10

✅ feedFishWithFood logic test successful!
```

## Cách test
```bash
# Test logic BigInt
./scripts/docker-run-script.sh test-feed-fish-bigint

# Test logic thực tế
./scripts/docker-run-script.sh test-feed-fish-real
```

## Lưu ý quan trọng
1. **Luôn convert BigInt sang Number** trước khi thực hiện phép tính với number
2. **Sử dụng `Number(bigintValue)`** thay vì `bigintValue` trực tiếp
3. **Kiểm tra type** trước khi convert để tránh lỗi
4. **Test kỹ** sau khi sửa để đảm bảo không có lỗi mới

## Trạng thái
✅ **Đã sửa xong** - Lệnh cho cá ăn hoạt động bình thường
✅ **Đã test** - Tất cả logic hoạt động đúng
✅ **Không có lỗi mới** - Chỉ sửa lỗi BigInt, không ảnh hưởng logic khác

## Các lệnh liên quan
- `n.fishbarn` - Mở chuồng cá
- Cho cá ăn qua UI - Sử dụng thức ăn để tăng exp
- Lên level - Tự động khi đủ exp
- Tăng giá trị - Tự động khi lên level 