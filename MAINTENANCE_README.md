# 🔧 Lệnh Maintenance

Lệnh `n.maintenance` cho phép admin bật/tắt chế độ bảo trì để chặn tất cả các lệnh khác khi cần bảo trì bot.

## ⚠️ Mặc định

**Bot sẽ khởi động với chế độ bảo trì được BẬT mặc định.** Admin cần tắt chế độ bảo trì để bot hoạt động bình thường.

## 📋 Cách sử dụng

### Bật chế độ bảo trì
```
n.maintenance on [lý do]
```

### Tắt chế độ bảo trì
```
n.maintenance off [lý do]
```

### Xem trạng thái
```
n.maintenance status
```

### Tạo backup
```
n.maintenance backup
```

### Khôi phục từ backup
```
n.maintenance restore
```

### Reset về mặc định
```
n.maintenance reset
```

### Alias
```
n.maint on
n.maint off
n.maint status
n.maint backup
n.maint restore
n.maint reset
```

## 🔒 Quyền hạn

- **Yêu cầu**: Quyền Administrator
- **Chỉ admin mới có thể sử dụng lệnh này**

## ⚡ Tính năng

### Khi bật chế độ bảo trì:
- ✅ Lệnh `n.maintenance` vẫn hoạt động bình thường
- ❌ Tất cả lệnh text khác bị chặn
- ❌ Tất cả slash commands bị chặn
- ❌ Tất cả message components (buttons) bị chặn
- ❌ Tất cả modal submits bị chặn
- ❌ Tất cả context menu commands bị chặn

### Thông báo khi bị chặn:
```
🔧 **Bot đang trong chế độ bảo trì**
Vui lòng chờ cho đến khi bảo trì hoàn tất.
```

## 🎯 Mục đích sử dụng

1. **Bảo trì database**: Khi cần backup, restore, hoặc migrate database
2. **Cập nhật bot**: Khi cần deploy phiên bản mới
3. **Sửa lỗi khẩn cấp**: Khi có lỗi nghiêm trọng cần fix ngay
4. **Bảo trì hệ thống**: Khi server cần restart hoặc maintenance

## 📝 Ví dụ sử dụng

```bash
# Xem trạng thái hiện tại
n.maintenance status

# Tắt chế độ bảo trì (bot mặc định bật khi khởi động)
n.maintenance off Bot đã sẵn sàng hoạt động

# Bật chế độ bảo trì khi cần
n.maintenance on Cập nhật hệ thống

# Tạo backup trước khi thay đổi
n.maintenance backup

# Thực hiện các tác vụ bảo trì...
# - Backup database
# - Update code
# - Restart services

# Tắt chế độ bảo trì khi hoàn tất
n.maintenance off Bảo trì hoàn tất

# Khôi phục từ backup nếu cần
n.maintenance restore

# Reset về mặc định (bật chế độ bảo trì)
n.maintenance reset
```

## ⚠️ Lưu ý quan trọng

1. **Chỉ admin mới có thể tắt chế độ bảo trì**
2. **Lệnh maintenance luôn hoạt động** ngay cả khi ở chế độ bảo trì
3. **Tất cả interactions sẽ bị chặn** khi ở chế độ bảo trì
4. **Người dùng sẽ thấy thông báo** khi cố gắng sử dụng lệnh bị chặn

## 💾 Storage System

### Persistent Storage
- Cấu hình được lưu trong file JSON (`data/maintenance-mode.json`)
- Tự động load khi bot khởi động
- Hỗ trợ backup/restore
- Validation và merge với cấu hình mặc định

### Cấu trúc dữ liệu
```json
{
  "enabled": true,
  "lastUpdated": 1753059719627,
  "updatedBy": "admin",
  "reason": "Maintenance mode enabled by admin"
}
```

### Default Configuration
- `enabled`: `true` (mặc định bật chế độ bảo trì)
- `lastUpdated`: Timestamp hiện tại
- `updatedBy`: `"system"`
- `reason`: `"Default maintenance mode on startup"`

## 🔧 Technical Details

- **File**: `src/commands/text/admin/maintenance.ts`
- **Storage**: `src/utils/maintenance-storage.ts`
- **Client Property**: `client.maintenanceMode` (boolean)
- **Event Handlers**: 
  - `src/events/messageCreate.ts` - Text commands
  - `src/events/interactionCreate.ts` - Slash commands, components, modals
- **Default State**: `true` (bật chế độ bảo trì mặc định) 