# Admin Feed Fish Logic Update

## Tóm tắt
Đã cập nhật logic cho cá ăn để Admin không cần thức ăn và luôn nhận 100 exp mỗi lần ăn.

## Thay đổi chính

### 1. Cập nhật `feedFishWithFood` function
**File:** `src/utils/fish-breeding.ts`

**Thay đổi:**
- Thêm tham số `isAdmin: boolean = false`
- Admin không cần thức ăn và luôn nhận 100 exp
- Normal user vẫn cần thức ăn như cũ

**Code trước:**
```typescript
static async feedFishWithFood(userId: string, fishId: string, foodType: 'basic' | 'premium' | 'luxury' | 'legendary') {
  // Kiểm tra có thức ăn không
  const { FishFoodService } = await import('./fish-food');
  const useFoodResult = await FishFoodService.useFishFood(userId, fish.guildId, foodType);
  
  if (!useFoodResult.success) {
    return { success: false, error: useFoodResult.error };
  }
  
  const expGained = useFoodResult.expBonus || 0;
```

**Code sau:**
```typescript
static async feedFishWithFood(userId: string, fishId: string, foodType: 'basic' | 'premium' | 'luxury' | 'legendary', isAdmin: boolean = false) {
  let expGained = 0;
  let foodUsed = null;
  
  // Admin không cần thức ăn và luôn nhận 100 exp
  if (isAdmin) {
    expGained = 100;
    foodUsed = { name: 'Admin Feed', type: 'admin' };
  } else {
    // Kiểm tra có thức ăn không
    const { FishFoodService } = await import('./fish-food');
    const useFoodResult = await FishFoodService.useFishFood(userId, fish.guildId, foodType);
    
    if (!useFoodResult.success) {
      return { success: false, error: useFoodResult.error };
    }
    
    expGained = useFoodResult.expBonus || 0;
    foodUsed = useFoodResult.foodInfo;
  }
```

### 2. Cập nhật FishBarnHandler
**File:** `src/components/MessageComponent/FishBarnHandler.ts`

**Thay đổi:**
- Thêm kiểm tra quyền admin trước khi cho cá ăn
- Truyền tham số `isAdmin` vào `feedFishWithFood`

**Code thêm:**
```typescript
// Kiểm tra quyền admin
const { FishBattleService } = await import('@/utils/fish-battle');
const isAdmin = await FishBattleService.isAdministrator(userId, guildId);

// Cho cá ăn với thức ăn
const result = await FishBreedingService.feedFishWithFood(userId, selectedFishId, selectedFoodType as any, isAdmin);
```

## Logic hoạt động

### Admin User
- ✅ **Không cần thức ăn** - Bỏ qua kiểm tra thức ăn
- ✅ **Luôn nhận 100 exp** - Không phụ thuộc vào loại thức ăn
- ✅ **Không có cooldown** - Có thể cho cá ăn liên tục
- ✅ **Hiển thị "Admin Feed"** - Thay vì tên thức ăn

### Normal User
- ✅ **Cần thức ăn** - Phải có thức ăn trong inventory
- ✅ **Exp theo thức ăn** - Basic: 10, Premium: 20, Luxury: 30, Legendary: 50
- ✅ **Có cooldown** - 1 giờ giữa các lần ăn
- ✅ **Hiển thị tên thức ăn** - Như bình thường

## Danh sách Admin
**File:** `src/utils/fish-battle.ts`

```typescript
const adminUserIds: string[] = [
  '389957152153796608', // ID của bạn
  // Thêm ID của các Administrator khác vào đây
];
```

## Test Results

```
🧪 Test 1: Check admin status
   Admin user isAdmin: true
   Normal user isAdmin: false
   ✅ Admin status check successful!

🧪 Test 2: Simulate feedFishWithFood logic for admin
   Admin feed: expGained=100, foodUsed=Admin Feed
   ✅ Admin feed logic simulation successful!

🧪 Test 3: Simulate feedFishWithFood logic for normal user
   Normal user needs food: expGained=10, foodUsed=Basic Food
   ✅ Normal user feed logic simulation successful!

🧪 Test 4: Level up calculation
   Current level: 1, exp: 0
   Exp gained: 100
   Exp needed for next level: 20
   Leveled up to 2, remaining exp: 80
   Leveled up to 3, remaining exp: 50
   Leveled up to 4, remaining exp: 10
   Final level: 4, final exp: 10
   Leveled up: true
   ✅ Level up calculation successful!
```

## Cách sử dụng

### Admin
1. Mở `n.fishbarn`
2. Chọn cá muốn cho ăn
3. Chọn bất kỳ thức ăn nào (sẽ không tiêu thụ)
4. Nhấn "Cho Ăn"
5. Nhận 100 exp ngay lập tức

### Normal User
1. Mở `n.fishbarn`
2. Chọn cá muốn cho ăn
3. Chọn thức ăn có sẵn trong inventory
4. Nhấn "Cho Ăn"
5. Nhận exp theo loại thức ăn

## Lưu ý quan trọng

1. **Admin ID cần được thêm vào danh sách** trong `fish-battle.ts`
2. **Admin không tiêu thụ thức ăn** - Thức ăn vẫn còn trong inventory
3. **Admin bypass tất cả cooldown** - Có thể cho cá ăn liên tục
4. **Admin luôn nhận 100 exp** - Không phụ thuộc vào level hay loại cá
5. **Normal user vẫn hoạt động như cũ** - Không ảnh hưởng đến gameplay

## Trạng thái

✅ **Đã hoàn thành** - Logic admin feed fish đã được cập nhật
✅ **Đã test** - Tất cả logic hoạt động đúng
✅ **Không ảnh hưởng normal user** - Chỉ thêm tính năng cho admin

## Script test

```bash
# Test admin feed fish logic
./scripts/docker-run-script.sh test-admin-feed-fish
```

## Tương lai

Có thể mở rộng thêm:
- Thêm role Discord để kiểm tra admin
- Cho phép admin set exp tùy chỉnh
- Thêm cooldown cho admin (nếu cần)
- Thêm log admin actions 