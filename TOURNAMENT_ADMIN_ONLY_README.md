# 🏆 Tournament Admin-Only Creation Feature

## 🔍 Vấn Đề Đã Phát Hiện

**Vấn đề:** Tất cả người dùng đều có thể tạo tournament, có thể dẫn đến spam và lạm dụng.

**Yêu cầu:** 
- Chỉ ADMIN mới có thể tạo tournament
- User thường chỉ có thể tham gia tournament
- Đảm bảo tính kiểm soát và quản lý tournament

## ✅ Giải Pháp Đã Áp Dụng

### 1. **Thêm Kiểm Tra Quyền Admin**
- **Trước:** Tất cả user đều có thể tạo tournament
- **Sau:** Chỉ ADMIN mới có thể tạo tournament

### 2. **Cập Nhật Help Text**
- **Trước:** Help text không đề cập đến yêu cầu quyền admin
- **Sau:** Help text rõ ràng chỉ ra chỉ ADMIN mới có thể tạo tournament

### 3. **Cập Nhật UI Messages**
- **Trước:** Thông báo tạo tournament bình thường
- **Sau:** Thông báo rõ ràng tournament được tạo bởi ADMIN

## 🔧 Thay Đổi Chi Tiết

### 1. **src/utils/tournament.ts - createTournament()**
```typescript
// TRƯỚC
static async createTournament(data: TournamentData) {
    // Kiểm tra số dư của người tạo tournament
    const balance = await EcommerceService.getBalance(data.createdBy, data.guildId);
    if (balance < data.prizePool) {
        throw new Error(`Không đủ tiền để tạo tournament!...`);
    }
    // ... tạo tournament
}

// SAU
static async createTournament(data: TournamentData) {
    // Kiểm tra quyền admin
    const { FishBattleService } = await import('./fish-battle');
    const isAdmin = await FishBattleService.isAdministrator(data.createdBy, data.guildId);
    
    if (!isAdmin) {
        throw new Error("Chỉ ADMIN mới có thể tạo tournament!");
    }

    // Kiểm tra số dư của người tạo tournament
    const balance = await EcommerceService.getBalance(data.createdBy, data.guildId);
    if (balance < data.prizePool) {
        throw new Error(`Không đủ tiền để tạo tournament!...`);
    }
    // ... tạo tournament
}
```

### 2. **src/commands/text/ecommerce/tournament.ts - createHelpEmbed()**
```typescript
// TRƯỚC
"**Tạo tournament:** `n.tournament create_<tên>_<mô tả>_<phí>_<giải thưởng>_<số người>_<thời gian>`\n" +

// SAU
"**Tạo tournament:** `n.tournament create_<tên>_<mô tả>_<phí>_<giải thưởng>_<số người>_<thời gian>` (chỉ ADMIN)\n" +
```

### 3. **src/commands/text/information/help.ts**
```typescript
// TRƯỚC
`\`${prefix}tournament create\` - Tạo tournament\n` +

// SAU
`\`${prefix}tournament create\` - Tạo tournament (chỉ ADMIN)\n` +
```

### 4. **Tournament Creation Success Message**
```typescript
// TRƯỚC
embed.setDescription(`✅ **Tournament đã được tạo thành công!**\n\n${tournament.description}`);

// SAU
embed.setDescription(`✅ **Tournament đã được tạo thành công bởi ADMIN!**\n\n${tournament.description}`);
```

## 🎮 Cách Hoạt Động

### **Khi User Thường Thử Tạo Tournament:**
1. Hệ thống kiểm tra quyền admin
2. Nếu không phải admin: Báo lỗi "Chỉ ADMIN mới có thể tạo tournament!"
3. Tournament không được tạo

### **Khi Admin Tạo Tournament:**
1. Hệ thống kiểm tra quyền admin ✅
2. Kiểm tra số dư đủ để trả giải thưởng
3. Nếu đủ tiền: Tạo tournament và trừ tiền
4. Nếu không đủ tiền: Báo lỗi không đủ tiền

### **Các Lệnh Tournament Hiện Tại:**

#### **🔒 Chỉ ADMIN:**
- `n.tournament create` - Tạo tournament
- `n.tournament force` - Force kết thúc tournament
- `n.tournament cleanup` - Dọn dẹp tournament
- `n.tournament restart` - Khởi động lại job cleanup

#### **✅ Tất Cả User:**
- `n.tournament join` - Tham gia tournament
- `n.tournament list` - Xem danh sách tournament
- `n.tournament info` - Xem thông tin tournament
- `n.tournament end` - Kết thúc tournament (chỉ người tạo)

## 🧪 Test Cases

### **Test 1: Admin User Tạo Tournament**
```bash
# Admin user (ID: 389957152153796608) tạo tournament
# Kết quả: Tournament được tạo thành công
# Balance admin: 2000 → 1000 (trừ giải thưởng)
```

### **Test 2: Regular User Tạo Tournament**
```bash
# Regular user tạo tournament
# Kết quả: Lỗi "Chỉ ADMIN mới có thể tạo tournament!"
# Balance user: Không thay đổi
```

### **Test 3: Admin User Không Đủ Tiền**
```bash
# Admin user có 100 AniCoin, tạo tournament giải thưởng 1000 AniCoin
# Kết quả: Lỗi "Không đủ tiền để tạo tournament!"
```

## 🚀 Lợi Ích

1. **Kiểm soát tournament:** Chỉ admin có thể tạo tournament
2. **Ngăn chặn spam:** User thường không thể spam tạo tournament
3. **Quản lý chất lượng:** Admin có thể kiểm soát chất lượng tournament
4. **Bảo mật:** Giảm thiểu rủi ro lạm dụng hệ thống
5. **Rõ ràng:** Help text và thông báo rõ ràng về quyền hạn

## 🔮 Tương Lai

- Có thể thêm hệ thống phê duyệt tournament
- Thêm giới hạn số lượng tournament mỗi admin có thể tạo
- Thêm hệ thống báo cáo tournament không phù hợp
- Thêm tính năng tournament template cho admin

## 📋 Danh Sách Admin Hiện Tại

**File:** `src/utils/fish-battle.ts`

```typescript
const adminUserIds: string[] = [
  '389957152153796608', // Admin user - có quyền sử dụng lệnh admin
  // Thêm ID của các Administrator khác vào đây
];
```

## 🛠️ Cách Thêm Admin Mới

### Phương Pháp 1: Thêm vào Danh Sách ID
1. Mở file `src/utils/fish-battle.ts`
2. Tìm mảng `adminUserIds`
3. Thêm User ID mới vào danh sách
4. Restart bot

### Phương Pháp 2: Cấp Quyền Discord
1. Vào Discord Server Settings
2. Chọn Roles
3. Tạo role mới hoặc chỉnh sửa role hiện có
4. Cấp quyền `Administrator` hoặc `Manage Server`
5. Gán role cho user
