# 🌍 Hệ Thống Câu Cá Theo Mùa

## 📋 Tổng Quan

Hệ thống câu cá theo mùa đã được thêm vào để tạo sự đa dạng và thú vị cho người chơi. **Mỗi mùa sẽ thay đổi sau mỗi 30 phút** với những thay đổi khác nhau về cooldown, giá trị cá và tỷ lệ may mắn.

## 🎯 Tính Năng Chính

### ✅ Thay Đổi Theo Mùa (30 Phút)
- **Cooldown câu cá** thay đổi theo mùa (20-40 giây)
- **Giá trị cá** tăng/giảm theo mùa (-20% đến +15%)
- **Tỷ lệ may mắn** tăng trong mùa xuân (+20%)
- **Thời gian mùa:** 30 phút cho mỗi mùa

### ✅ Mùa Hè ☀️ (30 phút)
- **Cooldown:** 20 giây (nhanh hơn 33%)
- **Giá trị cá:** -20% (thấp hơn)
- **Tỷ lệ may mắn:** Bình thường
- **Mô tả:** Thời gian câu cá nhanh hơn nhưng giá trị cá thấp hơn

### ✅ Mùa Thu 🍂 (30 phút)
- **Cooldown:** 30 giây (bình thường)
- **Giá trị cá:** +10% (cao hơn)
- **Tỷ lệ may mắn:** Bình thường
- **Mô tả:** Thời gian câu cá bình thường và giá trị cá cao hơn

### ✅ Mùa Đông ❄️ (30 phút)
- **Cooldown:** 40 giây (chậm hơn 33%)
- **Giá trị cá:** +15% (cao nhất)
- **Tỷ lệ may mắn:** Bình thường
- **Mô tả:** Thời gian câu cá chậm hơn nhưng giá trị cá cao hơn

### ✅ Mùa Xuân 🌸 (30 phút)
- **Cooldown:** 35 giây (chậm hơn một chút)
- **Giá trị cá:** +10% (cao hơn)
- **Tỷ lệ may mắn:** +20% (tăng 20% của tỷ lệ cơ bản)
- **Mô tả:** Thời gian câu cá chậm hơn một chút, giá trị cá cao hơn và tỷ lệ may mắn tăng
- **Ví dụ may mắn:** Cá hiếm 8% → 9.6% (+1.6%), Cá huyền thoại 0.8% → 0.96% (+0.16%)

## 🛠️ Cách Hoạt Động

### **1. Xác Định Mùa (30 Phút)**
```typescript
// Dựa trên thời gian hiện tại, thay đổi sau mỗi 30 phút
const now = Date.now();
const seasonDuration = 30 * 60 * 1000; // 30 phút
const seasonIndex = Math.floor((now / seasonDuration) % 4);
const seasons = ['spring', 'summer', 'autumn', 'winter'];
return seasons[seasonIndex];
```

### **2. Tính Cooldown Theo Mùa**
```typescript
const seasonalCooldown = SeasonalFishingService.getSeasonalCooldown();
// Trả về cooldown theo mùa (20-40 giây)
```

### **3. Tính Giá Trị Cá Theo Mùa**
```typescript
const seasonalValue = SeasonalFishingService.getSeasonalFishValue(baseValue);
// Áp dụng hệ số giá trị theo mùa
```

### **4. Tính Tỷ Lệ May Mắn Theo Mùa**
```typescript
const luckMultiplier = SeasonalFishingService.getSeasonalLuckMultiplier();
// Áp dụng hệ số may mắn theo mùa (đặc biệt mùa xuân)
```

### **5. Thời Gian Mùa**
```typescript
const remainingTime = SeasonalFishingService.getRemainingSeasonTime();
const elapsedTime = SeasonalFishingService.getElapsedSeasonTime();
// Thời gian còn lại và đã trôi qua của mùa hiện tại
```

### **6. Cách Tính May Mắn Trong Mùa Xuân**
```typescript
// Ví dụ: Cá hiếm có tỷ lệ cơ bản 8%
const baseChance = 8; // 8%
const luckBonus = 20; // +20% trong mùa xuân
const bonusChance = (baseChance * luckBonus / 100); // 8% × 20% = 1.6%
const finalChance = baseChance + bonusChance; // 8% + 1.6% = 9.6%

// Kết quả: Tỷ lệ tăng từ 8% lên 9.6% (+1.6%)
```

**Công thức:** `Tỷ lệ cuối = Tỷ lệ cơ bản + (Tỷ lệ cơ bản × 20%)`

## 🎮 Lệnh Sử Dụng

### **Xem Thông Tin Mùa Hiện Tại**
```bash
n.fishing season
# Hoặc
n.fishing mùa
```

### **Xem Hướng Dẫn (Bao Gồm Thông Tin Mùa)**
```bash
n.fishing help
```

## 📊 Hiển Thị Trong Kết Quả Câu Cá

Khi người chơi câu cá, thông tin mùa sẽ được hiển thị trong kết quả:

```
🌍 🌸 **Mùa Xuân** - Cooldown: 35s, Giá cá: +10%, May mắn: +20% (Còn 19:58)
```

## ⏰ Chu Kỳ Thời Gian

### **Thứ Tự Mùa**
1. **Mùa Xuân** 🌸 (30 phút)
2. **Mùa Hè** ☀️ (30 phút)
3. **Mùa Thu** 🍂 (30 phút)
4. **Mùa Đông** ❄️ (30 phút)
5. **Quay lại Mùa Xuân** 🌸

### **Thời Gian Chuyển Mùa**
- **Mỗi 30 phút** mùa sẽ tự động thay đổi
- **Không cần restart bot** - thay đổi tự động
- **Thời gian còn lại** được hiển thị trong kết quả câu cá

## 🔧 Files Đã Cập Nhật

### **1. SeasonalFishingService (`src/utils/seasonal-fishing.ts`)**
- **Cập nhật logic mùa** để thay đổi sau mỗi 30 phút
- **Thêm tính năng thời gian** - thời gian còn lại và đã trôi qua
- **Thêm mùa tiếp theo** - hiển thị mùa sắp tới
- **Cải thiện UI** - hiển thị thời gian trong kết quả

### **2. Spam Protection (`src/config/spam-protection.ts`)**
- **Cập nhật cooldown** để sử dụng cooldown theo mùa
- **Dynamic cooldown** thay vì cooldown cố định

### **3. Fishing Service (`src/utils/fishing.ts`)**
- **Cập nhật cooldown** để sử dụng theo mùa
- **Áp dụng giá trị cá** theo mùa
- **Áp dụng tỷ lệ may mắn** theo mùa

### **4. Fishing Command (`src/commands/text/ecommerce/fishing.ts`)**
- **Thêm lệnh season** để xem thông tin mùa
- **Cập nhật help message** với thông tin mùa
- **Hiển thị thông tin mùa** trong kết quả câu cá

## 🧪 Test Scripts

### **Test Seasonal Fishing System**
```bash
npx tsx scripts/test-seasonal-fishing.ts
```

### **Kết Quả Test**
```
🌍 Testing Seasonal Fishing System (30-minute cycles)...

1. Current Season Test:
   Current season: spring
   Season name: Mùa Xuân
   Season emoji: 🌸

2. Seasonal Cooldown Test:
   Base cooldown: 30 seconds
   Seasonal cooldown: 35 seconds

3. Seasonal Fish Value Test:
   Base value: 1000 → Seasonal value: 1100 (+10%)

4. Season Time Test:
   Elapsed time: 10:03
   Remaining time: 19:58
   Total season duration: 30 minutes

5. Next Season Test:
   Current season: spring
   Next season: summer

6. Time Cycle Test:
   Current time: 5:10:02 PM
   Time in current cycle: 10:02
   Season changes every: 30 minutes
```

## 📈 Tác Động Đến Người Chơi

### ✅ **Lợi Ích**
1. **Đa dạng gameplay:** Mỗi mùa có chiến lược khác nhau
2. **Tăng tính cạnh tranh:** Người chơi thích nghi theo mùa
3. **Thú vị hơn:** Thay đổi liên tục mỗi 30 phút
4. **Thời gian ngắn:** Không cần đợi cả tháng để thấy thay đổi

### 🎯 **Chiến Lược Theo Mùa**
- **Mùa Hè:** Câu nhanh, bán nhiều (giá thấp)
- **Mùa Thu:** Cân bằng giữa tốc độ và giá trị
- **Mùa Đông:** Câu chậm, giá cao nhất
- **Mùa Xuân:** Tỷ lệ may mắn cao, câu cá hiếm

## 🔄 Tích Hợp Với Hệ Thống Hiện Tại

### **Spam Protection**
- Cooldown tự động thay đổi theo mùa
- Không cần cấu hình thêm

### **Fishing System**
- Giá trị cá tự động áp dụng theo mùa
- Tỷ lệ may mắn tự động áp dụng theo mùa

### **UI/UX**
- Thông tin mùa hiển thị trong kết quả câu cá
- Thời gian còn lại của mùa hiện tại
- Mùa tiếp theo sẽ là gì
- Lệnh riêng để xem thông tin mùa
- Help message cập nhật với thông tin mùa

## 📝 Changelog

### Version 2.0.0
- ✅ **Thay đổi lớn:** Mùa thay đổi sau mỗi 30 phút thay vì theo tháng
- ✅ Thêm tính năng thời gian mùa (còn lại/đã trôi qua)
- ✅ Thêm thông tin mùa tiếp theo
- ✅ Cải thiện UI với thời gian countdown
- ✅ Test scripts cập nhật cho hệ thống mới

### Version 1.0.0
- ✅ Thêm hệ thống câu cá theo mùa
- ✅ 4 mùa với thay đổi cooldown, giá trị và may mắn
- ✅ Tích hợp với spam protection
- ✅ Tích hợp với fishing system
- ✅ Thêm lệnh xem thông tin mùa
- ✅ Hiển thị thông tin mùa trong kết quả câu cá
- ✅ Test scripts để kiểm tra hệ thống

---

**Lưu ý:** Hệ thống tự động xác định mùa dựa trên thời gian hiện tại và thay đổi sau mỗi 30 phút. Mỗi mùa kéo dài 30 phút và tuần hoàn theo thứ tự: Xuân → Hè → Thu → Đông → Xuân...