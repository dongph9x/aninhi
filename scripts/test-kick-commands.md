# Hướng Dẫn Sử Dụng Lệnh Kick Channel

## 🚫 Lệnh Quick Kick (1 phút)

**Cách dùng:** `p!quickkick <người dùng> [lý do]`

**Aliases:** `qkick`, `kick1m`, `1mkick`

**Ví dụ:**
- `p!quickkick @user spam`
- `p!quickkick @user vi phạm nội quy`
- `p!quickkick 123456789 quấy rối`

**Tính năng:**
- Kick người dùng khỏi channel trong 1 phút
- Tự động hết hạn sau 1 phút
- Ghi log moderation

---

## ⏰ Lệnh Channel Kick (tùy chỉnh thời gian)

**Cách dùng:** `p!channelkick <người dùng> [thời gian] [lý do]`

**Aliases:** `ckick`, `kickfromchannel`, `timeout`

**Thời gian:**
- `1m` = 1 phút
- `5m` = 5 phút
- `1h` = 1 giờ
- `1d` = 1 ngày

**Ví dụ:**
- `p!channelkick @user 1m spam`
- `p!channelkick @user 5m vi phạm nội quy`
- `p!channelkick 123456789 1h quấy rối`

**Tính năng:**
- Kick người dùng khỏi channel với thời gian tùy chỉnh
- Tối đa 28 ngày
- Tự động hết hạn
- Ghi log moderation

---

## 🔧 Lệnh Kick Server (cũ)

**Cách dùng:** `p!kick <người dùng> [lý do]`

**Aliases:** `kickuser`, `kickmember`

**Ví dụ:**
- `p!kick @user spam liên tục`
- `p!kick @user vi phạm nội quy nghiêm trọng`

**Tính năng:**
- Kick người dùng khỏi server hoàn toàn
- Cần mời lại để tham gia
- Ghi log moderation

---

## 📋 Yêu Cầu Quyền

### Quick Kick & Channel Kick:
- `ManageChannels`
- `ManageRoles`

### Kick Server:
- `KickMembers`

---

## 🎯 Sự Khác Biệt

| Lệnh | Thời Gian | Phạm Vi | Tự Động Hết Hạn |
|------|-----------|---------|-----------------|
| `quickkick` | 1 phút | Channel | ✅ |
| `channelkick` | Tùy chỉnh | Channel | ✅ |
| `kick` | Vĩnh viễn | Server | ❌ |

---

## 📝 Lưu Ý

1. **Channel Kick** sử dụng Discord's timeout feature
2. Người dùng bị kick sẽ không thể:
   - Gửi tin nhắn
   - Phản hồi tin nhắn
   - Thêm phản ứng
   - Tham gia voice channels
3. Sau khi hết hạn, người dùng có thể hoạt động bình thường
4. Tất cả hành động đều được ghi log trong moderation system 