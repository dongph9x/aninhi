# 🐟 Tóm Tắt Lệnh FishCoin

## 📋 Danh Sách Đầy Đủ Các Lệnh

### 👤 **User Commands** (Lệnh Người Dùng)

#### 1. `!fishbalance` (aliases: `!fishbal`, `!fishcoin`, `!fishcoins`, `!fc`)
```bash
!fishbalance
```
**Chức năng:**
- Xem số dư FishCoin và AniCoin
- Lịch sử giao dịch FishCoin gần đây
- Thông tin về hệ thống FishCoin

**Ví dụ:**
```
🐟 Thông Tin FishCoin
Username

🐟 FishCoin hiện tại: 1,500 FishCoin
💎 AniCoin hiện tại: 50,000 AniCoin
🔥 Chuỗi hàng ngày: 7 ngày

📋 Lịch Sử Giao Dịch FishCoin Gần Đây
🐟 1,000 FishCoin - Daily reward (20/01/2024)
💸 500 FishCoin - Buy fish food (19/01/2024)
```

#### 2. `!fishtransfer` (aliases: `!fishgive`, `!fishsend`, `!ft`)
```bash
!fishtransfer @user <số lượng>
```
**Chức năng:**
- Chuyển FishCoin cho người khác
- Kiểm tra đủ FishCoin trước khi chuyển
- Không thể chuyển cho chính mình

**Ví dụ:**
```
!fishtransfer @friend 500

✅ Chuyển FishCoin Thành Công
Username đã chuyển 500 FishCoin cho friend

Số dư sau chuyển:
🐟 Username: 1,000 FishCoin
🐟 friend: 500 FishCoin
```

#### 3. `!fishtop` (aliases: `!fishleaderboard`, `!fishlb`, `!ftop`)
```bash
!fishtop
```
**Chức năng:**
- Hiển thị top 10 người chơi có nhiều FishCoin nhất
- Hiển thị vị trí của người dùng hiện tại
- Thống kê tổng quan về FishCoin trong server
- Hướng dẫn cách kiếm FishCoin

**Ví dụ:**
```
🏆 FishCoin Leaderboard
Top 10 người chơi có nhiều FishCoin nhất

🏆 Top FishCoin Players
🥇 Username1 - 5,000 🐟
🥈 Username2 - 3,500 🐟
🥉 Username3 - 3,000 🐟

📊 Thống Kê
🐟 Tổng FishCoin: 16,000
📈 Trung bình: 3,200 FishCoin
👥 Người chơi: 5 người

🎯 Vị Trí Của Bạn
🏆 Rank: #2
🐟 FishCoin: 3,500
```

### 🔧 **Admin Commands** (Lệnh Quản Trị)

#### 4. `!fishgive` (aliases: `!fishadd`)
```bash
!fishgive @user <số lượng>
!fishadd @user <số lượng>
```
**Chức năng:**
- Chỉ admin mới có quyền sử dụng
- Thêm FishCoin cho người dùng (bao gồm chính mình)
- Ghi lại lịch sử admin operation
- **Có thể thao tác với chính mình:** `!fishgive @yourself 1000`

**Ví dụ:**
```
!fishgive @user 1000

✅ Admin FishCoin Operation
Admin: AdminName
Người dùng: Username
Thao tác: Thêm 1,000 FishCoin

Số dư thay đổi:
🐟 Trước: 500 FishCoin
🐟 Sau: 1,500 FishCoin
📊 Thay đổi: +1,000 FishCoin
```

**Ví dụ cho chính mình:**
```
!fishgive @yourself 2000

✅ Admin FishCoin Operation
Admin: AdminName
Người dùng: AdminName
Thao tác: Thêm 2,000 FishCoin

Số dư thay đổi:
🐟 Trước: 1,000 FishCoin
🐟 Sau: 3,000 FishCoin
📊 Thay đổi: +2,000 FishCoin
```

#### 5. `!fishremove` (aliases: `!fishsubtract`, `!fishminus`)
```bash
!fishremove @user <số lượng>
!fishsubtract @user <số lượng>
!fishminus @user <số lượng>
```
**Chức năng:**
- Chỉ admin mới có quyền sử dụng
- Bớt FishCoin từ tài khoản người dùng (bao gồm chính mình)
- Kiểm tra đủ FishCoin trước khi bớt
- Ghi lại lịch sử admin operation
- **Có thể thao tác với chính mình:** `!fishremove @yourself 500`

**Ví dụ:**
```
!fishremove @user 500

✅ Admin Removed FishCoin
Admin: AdminName
Người dùng: Username
Thao tác: Bớt 500 FishCoin

Số dư thay đổi:
🐟 Trước: 1,500 FishCoin
🐟 Sau: 1,000 FishCoin
📊 Thay đổi: -500 FishCoin
```

**Ví dụ cho chính mình:**
```
!fishremove @yourself 300

✅ Admin Removed FishCoin
Admin: AdminName
Người dùng: AdminName
Thao tác: Bớt 300 FishCoin

Số dư thay đổi:
🐟 Trước: 3,000 FishCoin
🐟 Sau: 2,700 FishCoin
📊 Thay đổi: -300 FishCoin
```

## 🎯 **Tóm Tắt Nhanh**

| Lệnh | Loại | Chức Năng | Ví Dụ |
|------|------|-----------|-------|
| `!fishbalance` | User | Xem balance | `!fishbalance` |
| `!fishtransfer` | User | Chuyển FishCoin | `!fishtransfer @user 500` |
| `!fishtop` | User | Xem leaderboard | `!fishtop` |
| `!fishgive` | Admin | Thêm FishCoin | `!fishgive @user 1000` |
| `!fishremove` | Admin | Bớt FishCoin | `!fishremove @user 500` |

## 🔄 **Quy Trình Sử Dụng**

### **Cho Người Dùng Mới:**
1. `!fishbalance` - Kiểm tra FishCoin hiện tại
2. `!fishtop` - Xem cách kiếm FishCoin
3. `!fishtransfer @friend 100` - Chuyển FishCoin (nếu có)

### **Cho Admin:**
1. `!fishgive @user 1000` - Thêm FishCoin cho user mới
2. `!fishgive @yourself 1000` - Thêm FishCoin cho chính mình
3. `!fishremove @user 500` - Bớt FishCoin nếu cần
4. `!fishremove @yourself 500` - Bớt FishCoin từ chính mình
5. `!fishtop` - Kiểm tra tình hình FishCoin trong server

## ⚠️ **Lưu Ý Quan Trọng**

1. **Quyền Admin:** Chỉ admin mới có thể sử dụng `!fishgive` và `!fishremove`
2. **Kiểm Tra Balance:** Hệ thống tự động kiểm tra đủ FishCoin trước khi thực hiện
3. **Lịch Sử:** Tất cả giao dịch đều được ghi lại trong `FishTransaction`
4. **Tách Biệt:** FishCoin hoàn toàn tách biệt với AniCoin
5. **BigInt:** Hỗ trợ số lượng FishCoin lớn

## 🧪 **Testing**

### **Test Scripts:**
```bash
# Test hệ thống cơ bản
npx tsx scripts/test-fish-coin-system.ts

# Test tất cả commands
npx tsx scripts/test-fish-coin-commands.ts

# Test admin self operations
npx tsx scripts/test-admin-self-fishcoin.ts

# Migration dữ liệu
npx tsx scripts/migrate-to-fishcoin.ts
```

### **Test Results:**
```
✅ All FishCoin command tests completed successfully!

📋 Available commands:
   !fishbalance - Check FishCoin balance
   !fishtransfer @user <amount> - Transfer FishCoin
   !fishgive @user <amount> - Admin add FishCoin
   !fishremove @user <amount> - Admin remove FishCoin
   !fishtop - View FishCoin leaderboard
```

---

**🎉 Hệ thống FishCoin đã hoàn thiện với đầy đủ các lệnh cần thiết!** 🐟✨ 