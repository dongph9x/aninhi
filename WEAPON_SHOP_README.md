# ⚔️ Fish Weapon Shop

## 📋 Tổng Quan

Fish Weapon Shop là hệ thống mua bán và trang bị vũ khí cho cá, giúp tăng sức mạnh tấn công, phòng thủ và độ chính xác trong các trận đấu cá.

## 🎯 Tính Năng Chính

### 🛒 Mua Vũ Khí
- Mua vũ khí bằng AniCoin
- Hỗ trợ mua nhiều vũ khí cùng lúc
- Kiểm tra balance trước khi mua

### 🎒 Quản Lý Kho Vũ Khí
- Xem danh sách vũ khí đã mua
- Hiển thị số lượng và trạng thái trang bị
- Thống kê sức mạnh tổng hợp

### ⚔️ Trang Bị Vũ Khí
- Trang bị vũ khí cho cá
- Gỡ trang bị vũ khí
- Chỉ có thể trang bị 1 vũ khí tại một thời điểm

### 📊 Thông Tin Vũ Khí
- Xem chi tiết thông tin vũ khí
- Hiển thị stats và giá cả
- Phân loại theo độ hiếm

## 📝 Cú Pháp Lệnh

### Xem Shop
```
n.weaponshop
n.weaponshop shop
n.weaponshop list
```

### Mua Vũ Khí
```
n.weaponshop buy <weapon_id> [số lượng]
n.weaponshop purchase <weapon_id> [số lượng]
```

### Xem Kho Vũ Khí
```
n.weaponshop inventory
n.weaponshop inv
```

### Trang Bị Vũ Khí
```
n.weaponshop equip <weapon_id>
```

### Gỡ Trang Bị
```
n.weaponshop unequip
```

### Xem Thông Tin Vũ Khí
```
n.weaponshop info <weapon_id>
```

### Trợ Giúp
```
n.weaponshop help
```

## ⚔️ Danh Sách Vũ Khí

### Common (Thường)
| ID | Tên | Giá | ATK | DEF | Accuracy | Mô tả |
|---|---|---|---|---|---|---|
| `sword` | Iron Sword | 10,000 | +15 | +5 | 85% | Thanh kiếm sắt cơ bản |
| `shield` | Wooden Shield | 8,000 | +5 | +20 | 90% | Khiên gỗ, tăng phòng thủ |

### Uncommon (Hiếm)
| ID | Tên | Giá | ATK | DEF | Accuracy | Mô tả |
|---|---|---|---|---|---|---|
| `spear` | Steel Spear | 15,000 | +20 | +8 | 80% | Giáo thép, tấn công cao |
| `bow` | Hunting Bow | 12,000 | +18 | +3 | 95% | Cung săn, độ chính xác cao |

### Rare (Hiếm)
| ID | Tên | Giá | ATK | DEF | Accuracy | Mô tả |
|---|---|---|---|---|---|---|
| `axe` | Battle Axe | 20,000 | +25 | +10 | 75% | Rìu chiến, sức mạnh cao |
| `magic_staff` | Magic Staff | 25,000 | +22 | +12 | 88% | Gậy phép thuật, cân bằng |

### Legendary (Huyền Thoại)
| ID | Tên | Giá | ATK | DEF | Accuracy | Mô tả |
|---|---|---|---|---|---|---|
| `legendary_sword` | Legendary Sword | 100,000 | +50 | +25 | 95% | Kiếm huyền thoại, sức mạnh vượt trội |

## 📊 Output Mẫu

### Shop Display
```
⚔️ Fish Weapon Shop

💰 Balance: 1,000,000 AniCoin

⚔️ Danh sách vũ khí:

1. ⚔️ Iron Sword
   💰 Giá: 10,000 AniCoin
   ⚔️ Sức mạnh: +15 ATK
   🛡️ Phòng thủ: +5 DEF
   🎯 Độ chính xác: +85%
   📝 Thanh kiếm sắt cơ bản, tăng sức mạnh tấn công

2. 🛡️ Wooden Shield
   💰 Giá: 8,000 AniCoin
   ⚔️ Sức mạnh: +5 ATK
   🛡️ Phòng thủ: +20 DEF
   🎯 Độ chính xác: +90%
   📝 Khiên gỗ, tăng khả năng phòng thủ

💡 Cách sử dụng:
• n.weaponshop buy <weapon_id> [số lượng] - Mua vũ khí
• n.weaponshop inventory - Xem kho vũ khí
• n.weaponshop equip <weapon_id> - Trang bị vũ khí
• n.weaponshop info <weapon_id> - Xem thông tin vũ khí
```

### Inventory Display
```
🎒 Kho Vũ Khí

🎒 Kho vũ khí của bạn:

1. ⚔️ Iron Sword ⚔️ ĐANG TRANG BỊ
   📦 Số lượng: 2
   ⚔️ Sức mạnh: +15 ATK
   🛡️ Phòng thủ: +5 DEF
   🎯 Độ chính xác: +85%
   ⭐ Hiếm: Common

2. 🛡️ Wooden Shield
   📦 Số lượng: 1
   ⚔️ Sức mạnh: +5 ATK
   🛡️ Phòng thủ: +20 DEF
   🎯 Độ chính xác: +90%
   ⭐ Hiếm: Common

⚔️ Vũ khí đang trang bị:
⚔️ Iron Sword
   ⚔️ +15 ATK | 🛡️ +5 DEF | 🎯 +85%

💡 Lệnh hữu ích:
• n.weaponshop equip <weapon_id> - Trang bị vũ khí
• n.weaponshop unequip - Gỡ trang bị
• n.weaponshop info <weapon_id> - Xem thông tin vũ khí
```

### Buy Success
```
✅ Mua thành công!

🎉 Đã mua thành công 2x Iron Sword
💰 Chi phí: 20,000 AniCoin
💳 Balance còn lại: 980,000 AniCoin

⚔️ Sức mạnh +15 ATK
🛡️ Phòng thủ +5 DEF
🎯 Độ chính xác +85%
```

### Equip Success
```
⚔️ Trang Bị Thành Công!

🎯 Đã trang bị thành công Iron Sword!

⚔️ Sức mạnh +15 ATK
🛡️ Phòng thủ +5 DEF
🎯 Độ chính xác +85%
```

## 🎮 Tích Hợp Với Game

### Fish Battle
- Vũ khí trang bị sẽ tăng sức mạnh cho cá trong trận đấu
- ATK tăng sát thương gây ra
- DEF giảm sát thương nhận vào
- Accuracy tăng tỷ lệ đánh trúng

### Cách Tính Sức Mạnh
```
Tổng ATK = ATK cơ bản của cá + ATK từ vũ khí
Tổng DEF = DEF cơ bản của cá + DEF từ vũ khí
Tổng Accuracy = Accuracy cơ bản của cá + Accuracy từ vũ khí
```

## 💰 Kinh Tế

### Giá Mua
- Common: 8,000 - 10,000 AniCoin
- Uncommon: 12,000 - 15,000 AniCoin
- Rare: 20,000 - 25,000 AniCoin
- Legendary: 100,000 AniCoin

### Giá Bán
- Bán lại với giá 50% giá mua
- Ví dụ: Mua 10,000 → Bán 5,000 AniCoin

## 🛡️ Bảo Mật

### Giới Hạn Mua
- Số lượng mua tối đa: 10 vũ khí/lần
- Kiểm tra balance trước khi mua
- Không thể mua vũ khí không tồn tại

### Trang Bị
- Chỉ có thể trang bị 1 vũ khí tại một thời điểm
- Tự động gỡ trang bị vũ khí cũ khi trang bị mới
- Kiểm tra quyền sở hữu vũ khí trước khi trang bị

## 📁 Files Được Tạo/Sửa Đổi

### Files Mới
- `src/commands/text/ecommerce/weaponshop.ts` - Command chính
- `src/utils/weapon.ts` - WeaponService
- `scripts/test-weapon-shop.ts` - Script test

### Files Được Sửa Đổi
- `prisma/schema.prisma` - Thêm UserWeapon model

## 🧪 Test Results

```
🧪 Test Weapon Shop

1️⃣ Tạo user test:
   ✅ User test đã được tạo

2️⃣ Test lấy danh sách vũ khí:
   📊 Tổng số vũ khí: 7
   1. Iron Sword - 10,000 AniCoin
   2. Wooden Shield - 8,000 AniCoin
   3. Steel Spear - 15,000 AniCoin
   4. Hunting Bow - 12,000 AniCoin
   5. Battle Axe - 20,000 AniCoin
   6. Magic Staff - 25,000 AniCoin
   7. Legendary Sword - 100,000 AniCoin

3️⃣ Test thêm vũ khí vào inventory:
   ✅ Đã thêm vũ khí vào inventory

4️⃣ Test lấy inventory:
   📦 Số lượng vũ khí trong inventory: 3
   • Steel Spear: 1x (Trang bị: Không)
   • Wooden Shield: 1x (Trang bị: Không)
   • Iron Sword: 2x (Trang bị: Không)

5️⃣ Test trang bị vũ khí:
   ⚔️ Trang bị sword: Thành công

6️⃣ Test lấy vũ khí đang trang bị:
   ⚔️ Vũ khí đang trang bị: Iron Sword

7️⃣ Test tính tổng sức mạnh:
   ⚔️ ATK: +15
   🛡️ DEF: +5
   🎯 Accuracy: +85%

8️⃣ Test gỡ trang bị:
   🛡️ Gỡ trang bị: Thành công

9️⃣ Test bán vũ khí:
   💰 Bán shield thành công: 4000 AniCoin

✅ Test Weapon Shop hoàn tất!
```

## 💡 Sử Dụng

### Trường Hợp 1: Mua vũ khí đầu tiên
```
n.weaponshop
n.weaponshop buy sword 1
n.weaponshop equip sword
```

### Trường Hợp 2: Nâng cấp vũ khí
```
n.weaponshop buy spear 1
n.weaponshop unequip
n.weaponshop equip spear
```

### Trường Hợp 3: Xem thông tin vũ khí
```
n.weaponshop info legendary_sword
```

### Trường Hợp 4: Quản lý kho
```
n.weaponshop inventory
```

## ⚠️ Lưu Ý Quan Trọng

1. **Trang bị duy nhất**: Chỉ có thể trang bị 1 vũ khí tại một thời điểm
2. **Giá bán**: Bán lại với giá 50% giá mua
3. **Số lượng mua**: Tối đa 10 vũ khí/lần
4. **Tích hợp battle**: Vũ khí sẽ ảnh hưởng đến sức mạnh trong trận đấu cá

## 🔧 Troubleshooting

### Lỗi thường gặp:
- **"Không đủ tiền"**: Cần có đủ AniCoin để mua vũ khí
- **"Không tìm thấy vũ khí"**: Kiểm tra ID vũ khí chính xác
- **"Bạn không có vũ khí này"**: Cần mua vũ khí trước khi trang bị
- **"Bạn chưa trang bị vũ khí nào"**: Không có vũ khí nào đang được trang bị

### Giải pháp:
- Kiểm tra balance với `n.balance`
- Xem danh sách vũ khí với `n.weaponshop`
- Kiểm tra kho vũ khí với `n.weaponshop inventory`
- Xem thông tin vũ khí với `n.weaponshop info <weapon_id>` 