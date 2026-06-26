# Fish Skills Management Scripts

## Tổng quan

Bộ script này giúp quản lý dữ liệu skills của cá một cách dễ dàng và hiệu quả.

## Files

### 1. `data/fish-skills-data.json`
File chứa dữ liệu skills chính, bao gồm:
- 20 skills đa dạng với 6 elements khác nhau
- Metadata về version và thống kê
- Format JSON dễ đọc và chỉnh sửa

### 2. `scripts/import-fish-skills-from-data.ts`
Import skills từ file JSON vào database:
```bash
npx tsx scripts/import-fish-skills-from-data.ts
```

### 3. `scripts/export-skills-to-data.ts`
Export skills từ database ra file JSON:
```bash
npx tsx scripts/export-skills-to-data.ts
```

### 4. `scripts/sync-skills-data.ts`
Đồng bộ skills giữa file data và database:
```bash
npx tsx scripts/sync-skills-data.ts
```

## Cách sử dụng

### 1. Chỉnh sửa skills
- Mở file `data/fish-skills-data.json`
- Chỉnh sửa thông tin skills theo ý muốn
- Chạy script sync để cập nhật database

### 2. Thêm skills mới
- Thêm skill mới vào array `skills` trong file JSON
- Đảm bảo có đầy đủ các trường bắt buộc
- Chạy script sync để thêm vào database

### 3. Xóa skills
- Xóa skill khỏi file JSON
- Chạy script sync để đồng bộ

## Cấu trúc Skill

```json
{
  "id": "unique_id",
  "name": "Tên skill",
  "element": "fire|water|earth|air|light|dark",
  "emoji": "🎮",
  "description": "Mô tả skill",
  "baseCost": 10000,
  "baseDamage": 15,
  "damageMultiplier": 1.5,
  "damagePerLevel": 0.2,
  "maxLevel": 5,
  "baseSuccessRate": 0.6,
  "successRatePerLevel": 0.08,
  "cooldown": 3,
  "requirements": {
    "level": 10,
    "strength": 50,
    "rarity": "epic"
  },
  "effects": {
    "burn": 0.1,
    "stun": 0.05
  }
}
```

## Elements và Skills

### Fire (Lửa) - 3 skills
- Lửa Thiêu Đốt
- Sóng Lửa
- Hơi Nước Nổ

### Water (Nước) - 3 skills
- Hồi Phục Nước
- Băng Đóng
- Hơi Nước Nổ

### Earth (Đất) - 3 skills
- Khiên Đất
- Đá Nghiền
- Tăng Trưởng Thiên Nhiên

### Air (Không khí) - 3 skills
- Gió Cắt
- Sét Đánh
- Xoáy Lốc

### Light (Ánh sáng) - 3 skills
- Tia Sáng
- Ánh Sáng Hồi Phục
- Rào Chắn Pha Lê

### Dark (Bóng tối) - 5 skills
- Hắc Ám Tuyệt Đối
- Phi Tiêu Độc
- Bóng Ma Nhân Bản
- Vụ Nổ Hư Không
- Phán Quyết Thần Thánh

## Rarity Requirements

- **Common**: Không yêu cầu rarity
- **Rare**: Yêu cầu cá rare
- **Epic**: Yêu cầu cá epic
- **Legendary**: Yêu cầu cá legendary

## Effects

- **burn**: Gây burn damage theo thời gian
- **freeze**: Đóng băng đối thủ
- **stun**: Làm choáng đối thủ
- **heal**: Hồi phục HP
- **shield**: Tạo khiên bảo vệ

## Lưu ý

1. Luôn backup database trước khi chạy scripts
2. Kiểm tra file JSON có syntax đúng không
3. Test skills trong game trước khi deploy
4. Cập nhật metadata khi thay đổi skills
