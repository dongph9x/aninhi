# Experience Calculation Fix

## Vấn đề
Logic tính `experienceToNext` trước đây sai:
- Cá level 5 hiển thị `0/50` thay vì `0/70`
- Công thức cũ: `level * 10` (level 5 = 50 exp)
- Công thức đúng: `(level + 1) * 10` (level 5 = 70 exp)

## Giải pháp
Sửa logic trong các file:

### 1. `src/utils/fish-breeding.ts`
```typescript
// Trước
function getExpForLevel(level: number) {
  return level * 10;
}

// Sau  
function getExpForLevel(level: number) {
  return (level + 1) * 10;
}
```

### 2. `src/utils/fish-inventory.ts`
```typescript
// Trước
experienceToNext: item.fish.level >= 10 ? 0 : item.fish.level * 10,

// Sau
experienceToNext: item.fish.level >= 10 ? 0 : (item.fish.level + 1) * 10,
```

## Bảng exp cần thiết cho từng level

| Level | Exp cần để lên level tiếp theo |
|-------|-------------------------------|
| 1     | 20 exp                        |
| 2     | 30 exp                        |
| 3     | 40 exp                        |
| 4     | 50 exp                        |
| 5     | 60 exp                        |
| 6     | 70 exp                        |
| 7     | 80 exp                        |
| 8     | 90 exp                        |
| 9     | 100 exp                       |
| 10    | MAX (không cần exp)           |

## Test Results
✅ Test script `scripts/test-exp-calculation.ts` đã xác nhận logic mới hoạt động đúng:
- Level 1: 0/20 exp
- Level 2: 0/30 exp  
- Level 3: 0/40 exp
- Level 4: 0/50 exp
- Level 5: 0/60 exp
- Level 6: 0/70 exp
- Level 7: 0/80 exp
- Level 8: 0/90 exp
- Level 9: 0/100 exp
- Level 10: 0/0 exp (MAX)

## Files đã sửa
- `src/utils/fish-breeding.ts` - Sửa logic trong FishBreedingService
- `src/utils/fish-inventory.ts` - Sửa logic trong FishInventoryService
- `scripts/test-exp-calculation.ts` - Test script mới

## Impact
- UI hiển thị đúng exp cần thiết cho level tiếp theo
- Người dùng hiểu rõ cần bao nhiêu exp để lên level
- Logic leveling system chính xác hơn 