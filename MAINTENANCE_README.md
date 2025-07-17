# 🔧 Lệnh Maintenance

Lệnh `n.maintenance` cho phép admin bật/tắt chế độ bảo trì để chặn tất cả các lệnh khác khi cần bảo trì bot.

## 📋 Cách sử dụng

### Bật chế độ bảo trì
```
n.maintenance on
```

### Tắt chế độ bảo trì
```
n.maintenance off
```

### Alias
```
n.maint on
n.maint off
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
# Bật chế độ bảo trì
n.maintenance on

# Thực hiện các tác vụ bảo trì...
# - Backup database
# - Update code
# - Restart services

# Tắt chế độ bảo trì khi hoàn tất
n.maintenance off
```

## ⚠️ Lưu ý quan trọng

1. **Chỉ admin mới có thể tắt chế độ bảo trì**
2. **Lệnh maintenance luôn hoạt động** ngay cả khi ở chế độ bảo trì
3. **Tất cả interactions sẽ bị chặn** khi ở chế độ bảo trì
4. **Người dùng sẽ thấy thông báo** khi cố gắng sử dụng lệnh bị chặn

## 🔧 Technical Details

- **File**: `src/commands/text/admin/maintenance.ts`
- **Client Property**: `client.maintenanceMode` (boolean)
- **Event Handlers**: 
  - `src/events/messageCreate.ts` - Text commands
  - `src/events/interactionCreate.ts` - Slash commands, components, modals
- **Default State**: `false` (không ở chế độ bảo trì) 