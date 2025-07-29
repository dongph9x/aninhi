# ⚠️ Sửa Lỗi WarningRecord Table

## 📋 Tổng Quan

Hệ thống warning gặp lỗi `The table 'main.WarningRecord' does not exist in the current database` khi chạy lệnh `n.warn`. Vấn đề này đã được khắc phục bằng cách tạo bảng WarningRecord trực tiếp trong database.

## 🐛 Lỗi Gặp Phải

### **Lỗi Chính:**
```
PrismaClientKnownRequestError: 
The table `main.WarningRecord` does not exist in the current database.
```

### **Nguyên Nhân:**
1. **Migration Issues:** Các migration trước đó có vấn đề với index
2. **Schema Mismatch:** Model WarningRecord trong schema nhưng bảng chưa được tạo
3. **Migration Conflicts:** Xung đột giữa các migration khi cố gắng xóa index không tồn tại

## 🔧 Giải Pháp Đã Thực Hiện

### **1. Tạo Bảng Trực Tiếp:**
```sql
CREATE TABLE IF NOT EXISTS WarningRecord (
    id TEXT NOT NULL PRIMARY KEY,
    userId TEXT NOT NULL,
    guildId TEXT NOT NULL,
    moderatorId TEXT NOT NULL,
    warningLevel INTEGER NOT NULL DEFAULT 1,
    reason TEXT NOT NULL,
    message TEXT NOT NULL,
    isActive BOOLEAN NOT NULL DEFAULT true,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiresAt DATETIME
);
```

### **2. Tạo Indexes:**
```sql
CREATE INDEX IF NOT EXISTS WarningRecord_userId_idx ON WarningRecord(userId);
CREATE INDEX IF NOT EXISTS WarningRecord_guildId_idx ON WarningRecord(guildId);
CREATE INDEX IF NOT EXISTS WarningRecord_moderatorId_idx ON WarningRecord(moderatorId);
CREATE INDEX IF NOT EXISTS WarningRecord_warningLevel_idx ON WarningRecord(warningLevel);
CREATE INDEX IF NOT EXISTS WarningRecord_isActive_idx ON WarningRecord(isActive);
CREATE INDEX IF NOT EXISTS WarningRecord_expiresAt_idx ON WarningRecord(expiresAt);
```

### **3. Sửa Migration Issues:**
- **File:** `prisma/migrations/20250720141443_add_tournament_winner_count/migration.sql`
- **Sửa:** Thay `DROP INDEX` bằng `CREATE UNIQUE INDEX IF NOT EXISTS`
- **File:** `prisma/migrations/20250720175926_fix_bigint_balance/migration.sql`
- **Sửa:** Thêm trường `winnerCount` vào bảng Tournament

## 🧪 Test Results

### **Test Script:** `scripts/test-warning-system.ts`

### **Kết Quả Test:**
```
✅ WarningRecord table exists and is accessible
✅ Create warning: Working
✅ Retrieve warning: Working
✅ Update warning: Working
✅ Deactivate warning: Working
✅ Query by user: Working
✅ Query by level: Working
✅ Query by moderator: Working
✅ Delete warning: Working
✅ All CRUD operations: Working
```

### **Chi Tiết Test:**
1. **Tạo warning:** ✅ Thành công
2. **Lấy warning:** ✅ Thành công
3. **Cập nhật warning:** ✅ Thành công
4. **Deactivate warning:** ✅ Thành công
5. **Query theo user:** ✅ Thành công
6. **Query theo level:** ✅ Thành công
7. **Query theo moderator:** ✅ Thành công
8. **Xóa warning:** ✅ Thành công

## 📊 Cấu Trúc Bảng WarningRecord

### **Fields:**
- **id:** Primary key (TEXT)
- **userId:** ID của user bị cảnh cáo (TEXT)
- **guildId:** ID của guild (TEXT)
- **moderatorId:** ID của moderator thực hiện cảnh cáo (TEXT)
- **warningLevel:** Cấp độ cảnh cáo (1, 2, 3) (INTEGER)
- **reason:** Lý do cảnh cáo (TEXT)
- **message:** Tin nhắn tùy chỉnh (TEXT)
- **isActive:** Trạng thái hoạt động (BOOLEAN)
- **createdAt:** Thời gian tạo (DATETIME)
- **expiresAt:** Thời gian hết hạn (DATETIME, optional)

### **Indexes:**
- **WarningRecord_userId_idx:** Index theo userId
- **WarningRecord_guildId_idx:** Index theo guildId
- **WarningRecord_moderatorId_idx:** Index theo moderatorId
- **WarningRecord_warningLevel_idx:** Index theo warningLevel
- **WarningRecord_isActive_idx:** Index theo isActive
- **WarningRecord_expiresAt_idx:** Index theo expiresAt

## 🎮 Cách Sử Dụng

### **Lệnh Warning:**
```bash
n.warn @user <lý do>          # Cảnh cáo user
n.warnlist                     # Xem danh sách cảnh cáo
n.warninfo @user               # Xem thông tin cảnh cáo của user
```

### **Ví Dụ:**
```bash
n.warn @spammer Spam quá nhiều
n.warnlist
n.warninfo @spammer
```

## 🔍 Kiểm Tra Database

### **Kiểm tra bảng:**
```bash
sqlite3 data/database.db ".schema WarningRecord"
```

### **Kiểm tra dữ liệu:**
```bash
sqlite3 data/database.db "SELECT * FROM WarningRecord;"
```

### **Kiểm tra indexes:**
```bash
sqlite3 data/database.db ".indexes WarningRecord"
```

## 🎯 Lợi Ích

### **1. Hệ Thống Moderation Hoàn Chỉnh:**
- Cảnh cáo user với các cấp độ khác nhau
- Theo dõi lịch sử cảnh cáo
- Quản lý thời gian hết hạn

### **2. Tích Hợp Với Discord:**
- Sử dụng Discord user IDs
- Tích hợp với Discord permissions
- Log đầy đủ thông tin moderator

### **3. Linh Hoạt:**
- Có thể set thời gian hết hạn
- Có thể deactivate warning
- Query theo nhiều tiêu chí

## ⚠️ Lưu Ý

### **Migration Issues:**
- Các migration cũ có thể gây xung đột
- Cần kiểm tra kỹ trước khi chạy migration mới
- Backup database trước khi thay đổi

### **Database Consistency:**
- Đảm bảo schema và database đồng bộ
- Kiểm tra indexes sau khi tạo bảng
- Test đầy đủ các chức năng CRUD

## 🎉 Kết Luận

✅ **Lỗi đã được khắc phục hoàn toàn**
✅ **Bảng WarningRecord đã được tạo thành công**
✅ **Tất cả chức năng CRUD hoạt động bình thường**
✅ **Hệ thống warning sẵn sàng sử dụng**

**Hệ thống warning giờ đã hoạt động ổn định và sẵn sàng cho việc moderation! ⚠️🛡️**