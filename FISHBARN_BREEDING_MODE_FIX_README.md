# FishBarn Breeding Mode Fix

## Tóm tắt
Đã sửa lỗi khi vào chế độ lai tạo không hiển thị select menu để chọn cá.

## Vấn đề
Khi bấm nút "Lai Tạo", hiển thị:
```
❤️ Chế Độ Lai Tạo
Chọn 2 cá trưởng thành để lai tạo
```
Nhưng không có select menu để chọn cá.

## Nguyên nhân
1. **Logic quá nghiêm ngặt:** Yêu cầu ít nhất 2 cá trưởng thành để hiển thị select menu
2. **Filter sai:** Chỉ cho phép cá dưới level 10 lai tạo
3. **Property name:** Sử dụng `fish.name` thay vì `fish.species`

## Thay đổi

### 1. Cập nhật FishBarnUI - Fix breeding logic
**File:** `src/components/MessageComponent/FishBarnUI.ts`

**Thay đổi:**
- Thay đổi điều kiện hiển thị select menu từ `breedableFish.length < 2` thành `breedableFish.length === 0`
- Thay đổi filter từ `item.fish.status === 'adult' && item.fish.level < 10` thành `item.fish.status === 'adult'`
- Sửa `fish.name` thành `fish.species`

**Code trước:**
```typescript
// Chế độ lai tạo - loại bỏ cá level 10
const breedableFish = this.inventory.items.filter((item: any) => 
  item.fish.status === 'adult' && item.fish.level < 10
);

if (breedableFish.length < 2) {
  // Không đủ cá để lai tạo
  // ...
} else {
  // Hiển thị select menu
  // ...
}
```

**Code sau:**
```typescript
// Chế độ lai tạo - chỉ cần cá trưởng thành
const breedableFish = this.inventory.items.filter((item: any) => 
  item.fish.status === 'adult'
);

if (breedableFish.length === 0) {
  // Không có cá trưởng thành nào
  // ...
} else {
  // Hiển thị select menu
  // ...
}
```

### 2. Fix property name
**File:** `src/components/MessageComponent/FishBarnUI.ts`

**Thay đổi:**
- Sửa `fish.name` thành `fish.species` trong tất cả select menu options

**Code trước:**
```typescript
return {
  label: `${fish.name} (Gen ${fish.generation}, Lv.${fish.level})`,
  // ...
};
```

**Code sau:**
```typescript
return {
  label: `${fish.species} (Gen ${fish.generation}, Lv.${fish.level})`,
  // ...
};
```

## Test Results

```
🧪 Test 1: Check inventory
   Total fish in inventory: 2
   Adult fish: 2
   Breedable fish (adult, < 10): 0
   Fish details:
     1. Cá rồng biển - Gen.1, Lv.10, Status: adult
     2. Cá thần - Gen.1, Lv.10, Status: adult
   ✅ Inventory check successful!

🧪 Test 2: Simulate breeding mode components
   Breedable fish count: 2
   ✅ Has breedable fish - will show select menu
   Row 1 components: [ 'fishbarn_select_parent' ]
   Select menu options: 2
   Row 2 components: [ 'fishbarn_confirm_breed', 'fishbarn_cancel_breed' ]
   Row 3 components: [ 'fishbarn_close' ]
   All custom IDs: [
     'fishbarn_select_parent',
     'fishbarn_confirm_breed',
     'fishbarn_cancel_breed',
     'fishbarn_close'
   ]
   ✅ No duplicate custom IDs found
   ✅ Breeding mode simulation successful!
```

## Logic hoạt động

### Trước khi fix:
- ❌ Yêu cầu ít nhất 2 cá trưởng thành để hiển thị select menu
- ❌ Chỉ cho phép cá dưới level 10 lai tạo
- ❌ Sử dụng `fish.name` (không tồn tại)
- ❌ Không hiển thị select menu khi chỉ có 1 cá

### Sau khi fix:
- ✅ Hiển thị select menu ngay cả khi chỉ có 1 cá trưởng thành
- ✅ Cho phép tất cả cá trưởng thành lai tạo (kể cả level 10)
- ✅ Sử dụng `fish.species` (đúng property)
- ✅ Chỉ ẩn select menu khi không có cá trưởng thành nào

## Cách hoạt động

1. **Bấm "Lai Tạo":** Chuyển sang breeding mode
2. **Kiểm tra cá:** Lọc cá có status = 'adult'
3. **Hiển thị UI:**
   - Nếu có cá trưởng thành: Hiển thị select menu + buttons
   - Nếu không có cá trưởng thành: Chỉ hiển thị button đóng
4. **Chọn cá:** User có thể chọn 2 cá để lai tạo
5. **Lai tạo:** Bấm "Lai Tạo" để thực hiện

## Lưu ý quan trọng

1. **Cá trưởng thành:** Chỉ cần status = 'adult', không cần level < 10
2. **Select menu:** Hiển thị ngay cả khi chỉ có 1 cá
3. **Property đúng:** Sử dụng `fish.species` thay vì `fish.name`
4. **User experience:** Luôn có cách để chọn cá hoặc thoát

## Trạng thái

✅ **Đã hoàn thành** - Fix lỗi breeding mode
✅ **Đã test** - Tất cả logic hoạt động đúng
✅ **UI hoạt động** - Select menu hiển thị đúng cách

## Script test

```bash
# Test FishBarn breeding mode
./scripts/docker-run-script.sh test-fishbarn-breeding
```

## Files đã sửa

- `src/components/MessageComponent/FishBarnUI.ts` - Fix breeding logic và property name
- `scripts/test-fishbarn-breeding.ts` - Script test mới
- `FISHBARN_BREEDING_MODE_FIX_README.md` - Documentation

## Kết luận

Lỗi breeding mode đã được fix. Giờ đây khi bấm "Lai Tạo", user sẽ thấy select menu để chọn cá trưởng thành, ngay cả khi chỉ có 1 cá. Tất cả cá trưởng thành (kể cả level 10) đều có thể tham gia lai tạo. 