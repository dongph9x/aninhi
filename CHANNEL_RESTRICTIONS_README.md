# 🔒 Channel Restrictions System

Hệ thống hạn chế channel cho phép admin kiểm soát các channel nào được phép sử dụng bot.

## ⚠️ Mặc định

**Bot khởi động với Whitelist Mode được BẬT mặc định và không có channel nào được phép.** Điều này có nghĩa là:
- Tất cả lệnh thông thường sẽ bị chặn
- Chỉ các lệnh cơ bản và admin mới hoạt động
- Admin cần thêm channels vào whitelist để bot hoạt động bình thường

## 📋 Tính năng

### ✅ Whitelist Mode (Mặc định BẬT)
- Chỉ cho phép sử dụng bot trong các channel/category được chỉ định
- Tất cả channel khác sẽ bị chặn
- **Mặc định BẬT khi khởi động bot**
- Admin phải thêm channels vào whitelist để bot hoạt động

### ❌ Blacklist Mode  
- Cấm sử dụng bot trong các channel/category được chỉ định
- Tất cả channel khác vẫn hoạt động bình thường
- Hữu ích khi muốn chặn bot trong một số channel cụ thể

### 🏷️ Category Support
- Có thể áp dụng cho từng channel riêng lẻ
- Có thể áp dụng cho toàn bộ category (tất cả channels trong category)
- Linh hoạt trong việc quản lý

### 🛡️ Exempt Commands
- Một số lệnh được miễn kiểm tra channel restrictions
- Admin commands luôn hoạt động bình thường
- Lệnh cơ bản như `help`, `ping`, `uptime` luôn hoạt động

## 🎯 Cách sử dụng

### Lệnh chính
```
n.channelrestrictions <action> <type> [target]
```

### Aliases
```
n.chrestrict
n.chrest  
n.restrictch
```

## 📝 Actions

### `show` - Hiển thị cấu hình
```
n.chrestrict show
```
Hiển thị tất cả cấu hình channel restrictions hiện tại.

### `add` - Thêm vào whitelist/blacklist
```
n.chrestrict add channel <channel_id>
n.chrestrict add category <category_id>
```

### `remove` - Xóa khỏi whitelist/blacklist
```
n.chrestrict remove channel <channel_id>
n.chrestrict remove category <category_id>
```

### `clear` - Xóa tất cả cấu hình
```
n.chrestrict clear
```
Reset về cấu hình mặc định.

### `mode` - Bật/tắt chế độ
```
n.chrestrict mode whitelist on
n.chrestrict mode whitelist off
n.chrestrict mode blacklist on
n.chrestrict mode blacklist off
```

### `backup` - Tạo backup
```
n.chrestrict backup
```

### `restore` - Khôi phục từ backup
```
n.chrestrict restore
```

### `export` - Xuất cấu hình
```
n.chrestrict export
```

### `import` - Nhập cấu hình
```
n.chrestrict import <file_path>
```

## 🎯 Ví dụ sử dụng

### Thiết lập ban đầu (Bot mới khởi động)
```bash
# Xem trạng thái hiện tại (sẽ thấy whitelist mode bật nhưng không có channel nào)
n.chrestrict show

# Thêm channel được phép (bắt buộc để bot hoạt động)
n.chrestrict add channel 123456789

# Thêm category được phép (tùy chọn)
n.chrestrict add category 987654321

# Xem cấu hình sau khi thêm
n.chrestrict show
```

### Thiết lập Whitelist Mode (nếu đã tắt)
```bash
# Bật whitelist mode
n.chrestrict mode whitelist on

# Thêm channel được phép
n.chrestrict add channel 123456789

# Thêm category được phép
n.chrestrict add category 987654321

# Xem cấu hình
n.chrestrict show
```

### Thiết lập Blacklist Mode
```bash
# Bật blacklist mode
n.chrestrict mode blacklist on

# Thêm channel bị cấm
n.chrestrict add channel 111222333

# Thêm category bị cấm
n.chrestrict add category 444555666

# Xem cấu hình
n.chrestrict show
```

### Quản lý linh hoạt
```bash
# Xóa channel khỏi danh sách
n.chrestrict remove channel 123456789

# Tắt whitelist mode
n.chrestrict mode whitelist off

# Bật blacklist mode
n.chrestrict mode blacklist on

# Xóa tất cả cấu hình
n.chrestrict clear
```

## 🔧 Lệnh được miễn

### Lệnh cơ bản (luôn hoạt động)
- `help` - Hướng dẫn
- `ping` - Kiểm tra ping
- `uptime` - Thời gian hoạt động
- `maintenance` - Chế độ bảo trì

### Lệnh Admin (luôn hoạt động cho Admin)
- `maintenance` - Chế độ bảo trì
- `deploy` - Deploy commands
- `undeploy` - Undeploy commands
- `eval` - Thực thi code
- `backupdb` - Backup database
- `restoredb` - Restore database
- `syncdb` - Sync database
- `dbstatus` - Trạng thái database
- `refreshdb` - Refresh database
- `listbackups` - Danh sách backup

## ⚠️ Lưu ý quan trọng

1. **Quyền Administrator**: Chỉ admin mới có thể sử dụng lệnh này
2. **Channel ID**: Cần cung cấp ID channel/category hợp lệ
3. **Whitelist Mode Mặc định**: Bot khởi động với whitelist mode BẬT và không có channel nào được phép
4. **Thiết lập ban đầu**: Admin PHẢI thêm channels vào whitelist để bot hoạt động bình thường
5. **Mode Priority**: Whitelist và Blacklist có thể hoạt động đồng thời
6. **Category Check**: Khi bật category check, tất cả channels trong category sẽ bị ảnh hưởng
7. **Exempt Commands**: Một số lệnh luôn hoạt động bình thường
8. **Admin Override**: Admin luôn có thể sử dụng các lệnh admin

## 🎯 Use Cases

### Server Gaming
- Giới hạn bot chỉ hoạt động trong channels gaming
- Chặn bot trong channels general, off-topic

### Server Business
- Chỉ cho phép bot trong channels support, help
- Chặn bot trong channels private, staff

### Server Community
- Giới hạn bot trong channels bot-commands
- Chặn bot trong channels voice, announcements

## 🔧 Technical Details

### Cấu trúc dữ liệu
```typescript
interface ChannelRestrictions {
  allowedChannels: string[];        // Channels được phép
  blockedChannels: string[];        // Channels bị cấm
  allowedCategories: string[];      // Categories được phép
  blockedCategories: string[];      // Categories bị cấm
  useWhitelistMode: boolean;        // Bật whitelist mode
  useBlacklistMode: boolean;        // Bật blacklist mode
  checkCategories: boolean;         // Kiểm tra categories
  exemptCommands: string[];         // Lệnh được miễn
  exemptAdminCommands: string[];    // Lệnh admin được miễn
}
```

### Kiểm tra permissions
- Kiểm tra trong `Filter.text()` cho text commands
- Kiểm tra trong `Filter.slash()` cho slash commands
- Kiểm tra cả channel ID và category ID
- Admin luôn được miễn kiểm tra

### Lưu trữ
- Cấu hình được lưu trong file JSON (`data/channel-restrictions.json`)
- Tự động load khi bot khởi động
- Hỗ trợ backup/restore/export/import
- Validation và merge với cấu hình mặc định
- Backup files được lưu trong thư mục `backups/`
- Export files được lưu trong thư mục `exports/` 