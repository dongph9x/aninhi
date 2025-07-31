# 🐟 Hệ thống Quản lý Dữ liệu Cá

## 📋 Tổng quan

Hệ thống quản lý dữ liệu cá đã được tách riêng thành file `src/config/fish-data.ts` để dễ dàng mở rộng và quản lý. File này chứa tất cả thông tin về cá, cần câu, mồi và các hàm tiện ích.

## 📁 Cấu trúc File

### `src/config/fish-data.ts`
- **Interfaces**: Định nghĩa kiểu dữ liệu cho Fish, FishingRod, Bait
- **Constants**: FISH_LIST, FISHING_RODS, BAITS
- **Service Class**: FishDataService với các hàm tiện ích

## 🐠 Dữ liệu Cá (FISH_LIST)

### Thông tin cơ bản
- **name**: Tên cá
- **emoji**: Biểu tượng
- **rarity**: Độ hiếm (common/rare/epic/legendary)
- **minValue/maxValue**: Giá trị min/max
- **chance**: Tỷ lệ xuất hiện (%)

### Thông tin mở rộng
- **description**: Mô tả chi tiết
- **habitat**: Môi trường sống (freshwater/saltwater)
- **season**: Mùa xuất hiện
- **weather**: Thời tiết xuất hiện
- **timeOfDay**: Thời gian trong ngày
- **specialAbilities**: Khả năng đặc biệt
- **battleStats**: Thống kê chiến đấu

### Phân loại theo Rarity
- **Common (4 loại)**: 60-70% tỷ lệ xuất hiện
- **Rare (4 loại)**: 20-25% tỷ lệ xuất hiện  
- **Epic (4 loại)**: 8-12% tỷ lệ xuất hiện
- **Legendary (5 loại)**: 1-3% tỷ lệ xuất hiện

## 🎣 Cần câu (FISHING_RODS)

### Thông tin cơ bản
- **name**: Tên cần câu
- **emoji**: Biểu tượng
- **price**: Giá mua
- **rarityBonus**: % tăng tỷ lệ hiếm
- **durability**: Độ bền
- **description**: Mô tả

### Thông tin mở rộng
- **level**: Cấp độ
- **upgradeCost**: Chi phí nâng cấp
- **specialEffects**: Hiệu ứng đặc biệt

### Danh sách cần câu
1. **Basic** (100): Cơ bản, không bonus
2. **Copper** (1,000): +1% hiếm
3. **Silver** (5,000): +2% hiếm
4. **Gold** (15,000): +3.5% hiếm
5. **Diamond** (50,000): +5% hiếm + legendary_boost

## 🪱 Mồi câu (BAITS)

### Thông tin cơ bản
- **name**: Tên mồi
- **emoji**: Biểu tượng
- **price**: Giá mua
- **rarityBonus**: % tăng tỷ lệ hiếm
- **description**: Mô tả

### Thông tin mở rộng
- **effectiveness**: Hiệu quả
- **duration**: Thời gian tác dụng
- **specialEffects**: Hiệu ứng đặc biệt

### Danh sách mồi
1. **Basic** (10): Cơ bản, không bonus
2. **Good** (50): +1.5% hiếm
3. **Premium** (200): +3% hiếm
4. **Divine** (1,000): +5% hiếm + legendary_attraction

## 🔧 FishDataService

### Các hàm tìm kiếm
- `getFishByRarity(rarity)`: Lấy cá theo độ hiếm
- `getFishByHabitat(habitat)`: Lấy cá theo môi trường
- `getFishBySeason(season)`: Lấy cá theo mùa
- `getFishByWeather(weather)`: Lấy cá theo thời tiết
- `getFishByTimeOfDay(timeOfDay)`: Lấy cá theo thời gian
- `getFishByName(name)`: Tìm cá theo tên

### Các hàm tiện ích
- `getRodByType(type)`: Lấy cần câu theo loại
- `getBaitByType(type)`: Lấy mồi theo loại
- `getRarityValue(rarity)`: Lấy giá trị rarity
- `getFishWithSpecialAbilities()`: Lấy cá có khả năng đặc biệt
- `getFishWithBattleStats()`: Lấy cá có thống kê chiến đấu

## 🧪 Testing

### Script test: `scripts/test-fish-data.ts`
Chạy để kiểm tra toàn bộ hệ thống:
```bash
npx tsx scripts/test-fish-data.ts
```

### Kết quả test
- ✅ Tổng quan dữ liệu
- ✅ Phân loại theo rarity
- ✅ Test các hàm tiện ích
- ✅ Hiển thị thông tin cần câu/mồi
- ✅ Test tìm kiếm

## 🔄 Migration từ file cũ

### Thay đổi trong `src/utils/fishing.ts`
1. **Import dữ liệu mới**:
```typescript
import { FISH_LIST, FISHING_RODS, BAITS, FishDataService, type Fish, type FishingRod, type Bait } from '../config/fish-data';
```

2. **Xóa định nghĩa cũ**:
- Xóa interface Fish, FishingRod, Bait
- Xóa constants FISH_LIST, FISHING_RODS, BAITS

3. **Cập nhật hàm getRarityValue**:
```typescript
private static getRarityValue(rarity: string): number {
    return FishDataService.getRarityValue(rarity);
}
```

## 🚀 Lợi ích của hệ thống mới

### 1. **Dễ mở rộng**
- Thêm cá mới dễ dàng
- Thêm thuộc tính mới cho cá
- Thêm cần câu/mồi mới

### 2. **Quản lý tập trung**
- Tất cả dữ liệu cá ở một nơi
- Dễ dàng backup/restore
- Dễ dàng version control

### 3. **Tính năng mở rộng**
- Hệ thống habitat (nước ngọt/mặn)
- Hệ thống mùa/thời tiết
- Hệ thống khả năng đặc biệt
- Hệ thống thống kê chiến đấu

### 4. **API tiện ích**
- Các hàm tìm kiếm linh hoạt
- Hỗ trợ lọc theo nhiều tiêu chí
- Dễ dàng tích hợp vào game

## 📈 Kế hoạch mở rộng

### Ngắn hạn
- [ ] Thêm cá theo mùa
- [ ] Thêm cá theo sự kiện
- [ ] Thêm hệ thống evolution

### Dài hạn
- [ ] Hệ thống breeding compatibility
- [ ] Hệ thống special abilities
- [ ] Hệ thống battle mechanics
- [ ] Hệ thống trading

## 🔧 Cách thêm cá mới

1. **Thêm vào FISH_LIST**:
```typescript
{
    name: "Tên cá mới",
    emoji: "🐟",
    rarity: "common",
    minValue: 10,
    maxValue: 50,
    chance: 25,
    description: "Mô tả cá",
    habitat: "freshwater",
    season: ["spring", "summer"],
    weather: ["sunny", "cloudy"],
    timeOfDay: ["day", "night"]
}
```

2. **Chạy test để kiểm tra**:
```bash
npx tsx scripts/test-fish-data.ts
```

## 📝 Ghi chú

- Tất cả dữ liệu được định nghĩa tĩnh trong code
- Không lưu trong database để tối ưu performance
- Dễ dàng backup bằng cách copy file
- Có thể mở rộng thành JSON file trong tương lai 