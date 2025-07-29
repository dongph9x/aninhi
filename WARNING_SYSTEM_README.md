# 🚨 Hệ Thống Cảnh Cáo (Warning System)

## 📋 Tổng Quan

Hệ thống cảnh cáo cho phép administrator quản lý user vi phạm một cách có hệ thống với 3 cấp độ cảnh cáo khác nhau. Khi user đạt 3 cảnh cáo, họ sẽ bị ban tự động khỏi server.

## 🎯 Tính Năng Chính

### ✅ Hệ Thống 3 Cấp Cảnh Cáo
- **Level 1:** Cảnh cáo nhẹ - Cảnh báo user
- **Level 2:** Cảnh cáo nghiêm trọng - Cảnh báo mạnh  
- **Level 3:** Tự động ban - Ban khỏi server

### ✅ Messages Tùy Chỉnh
Mỗi level có message khác nhau:
```typescript
Level 1: "⚠️ Cảnh cáo lần 1 - Đây là cảnh cáo đầu tiên. Hãy tuân thủ nội quy server!"
Level 2: "🚨 Cảnh cáo lần 2 - Đây là cảnh cáo thứ hai. Vi phạm thêm sẽ bị ban!"
Level 3: "🔨 Cảnh cáo lần 3 - Đây là cảnh cáo cuối cùng. Bạn sẽ bị ban khỏi server!"
```

### ✅ Tự Động Ban
- Khi user đạt 3 cảnh cáo → Tự động ban
- Ghi log moderation
- Thông báo cho administrator

## 🏗️ Kiến Trúc Hệ Thống

### 📁 Cấu Trúc Files
```
src/
├── commands/text/moderation/
│   ├── warn.ts              # Lệnh cảnh cáo chính
│   ├── warnings.ts          # Xem cảnh cáo của user
│   ├── clearwarnings.ts     # Xóa cảnh cáo
│   └── warnstats.ts         # Thống kê cảnh cáo
├── utils/
│   └── warning.ts           # Warning service
└── prisma/
    └── schema.prisma        # WarningRecord model
```

### 🗄️ Database Schema
```prisma
model WarningRecord {
  id          String   @id @default(cuid())
  userId      String
  guildId     String
  moderatorId String
  warningLevel Int     @default(1) // 1, 2, 3
  reason      String
  message     String   // Message tùy chỉnh
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  expiresAt   DateTime? // Thời gian hết hạn

  @@index([userId])
  @@index([guildId])
  @@index([moderatorId])
  @@index([warningLevel])
  @@index([isActive])
  @@index([expiresAt])
}
```

## 🎮 Cách Sử Dụng

### Lệnh Chính
```bash
# Cảnh cáo user
n.warn @user spam
n.warn @user vi phạm nội quy
n.warn 123456789 quấy rối

# Xem cảnh cáo của user
n.warnings @user
n.warnings 123456789
n.warnings  # Xem cảnh cáo của chính mình

# Xóa tất cả cảnh cáo (Admin only)
n.clearwarnings @user

# Thống kê cảnh cáo server
n.warnstats
```

### Aliases
```bash
# Warn
warn, warning, cảnh cáo, caution

# Warnings
warnings, warninglist, warnlist, cảnh cáo list

# Clear warnings
clearwarnings, clearwarn, xóa cảnh cáo, removewarnings

# Warning stats
warnstats, warningstats, thống kê cảnh cáo, warnstatistics
```

## 📊 Hệ Thống Cảnh Cáo

### Level 1 - Cảnh Cáo Nhẹ
- **Màu sắc:** Orange (#ffa500)
- **Emoji:** ⚠️
- **Message:** "Đây là cảnh cáo đầu tiên. Hãy tuân thủ nội quy server!"
- **Hành động:** Cảnh báo user

### Level 2 - Cảnh Cáo Nghiêm Trọng  
- **Màu sắc:** Red (#ff6b6b)
- **Emoji:** 🚨
- **Message:** "Đây là cảnh cáo thứ hai. Vi phạm thêm sẽ bị ban!"
- **Hành động:** Cảnh báo mạnh

### Level 3 - Tự Động Ban
- **Màu sắc:** Dark Red (#ff0000)
- **Emoji:** 🔨
- **Message:** "Đây là cảnh cáo cuối cùng. Bạn sẽ bị ban khỏi server!"
- **Hành động:** Tự động ban user

## 🔧 Tính Năng Nâng Cao

### 📋 Xem Cảnh Cáo
```typescript
// Xem thống kê cảnh cáo của user
const stats = await WarningService.getUserWarningStats(userId, guildId);

// Xem danh sách cảnh cáo active
const warnings = await WarningService.getActiveWarnings(userId, guildId);
```

### 🗑️ Xóa Cảnh Cáo
```typescript
// Xóa tất cả cảnh cáo của user (Admin only)
await WarningService.clearUserWarnings(userId, guildId, moderatorId);

// Xóa một cảnh cáo cụ thể
await WarningService.removeWarning(warningId, moderatorId);
```

### 📊 Thống Kê
```typescript
// Thống kê server
const stats = await WarningService.getServerWarningStats(guildId);

// Danh sách cảnh cáo gần đây
const recentWarnings = await WarningService.getServerWarnings(guildId, 10);
```

## 🚨 Tự Động Ban

### Logic Tự Động Ban
```typescript
// Kiểm tra xem có nên ban không
if (warning.warningLevel === 3) {
    // Ban user
    await message.guild!.members.ban(targetUser.id, {
        reason: `Auto ban - 3 warnings: ${reason}`,
        deleteMessageDays: 1
    });

    // Lưu vào database
    await banDB.createBan(targetUser.id, message.guildId!, message.author.id, 
        `Auto ban - 3 warnings: ${reason}`, "permanent");

    // Ghi log
    await ModerationService.logAction({
        guildId: message.guildId!,
        targetUserId: targetUser.id,
        moderatorId: message.author.id,
        action: "ban",
        reason: `Auto ban - 3 warnings: ${reason}`,
        channelId: message.channelId,
        messageId: message.id
    });
}
```

### Thông Báo Ban
```typescript
embed.addFields({
    name: "🔨 Tự Động Ban",
    value: `<@${targetUser.id}> đã bị ban tự động do đạt 3 cảnh cáo!`,
    inline: false
});
```

## 📈 Thống Kê và Báo Cáo

### Thống Kê User
- Tổng số cảnh cáo
- Số cảnh cáo active
- Chi tiết theo level (1, 2, 3)
- Trạng thái (Sạch sẽ / Có cảnh cáo / Bị ban)

### Thống Kê Server
- Tổng số cảnh cáo trong server
- Số cảnh cáo active
- Thống kê theo level
- Cảnh cáo gần đây

### Embed Thống Kê
```typescript
const embed = new EmbedBuilder()
    .setTitle("📊 Thống Kê Cảnh Cáo Server")
    .setDescription(`Thống kê cảnh cáo của **${guild.name}**`)
    .addFields({
        name: "📈 Thống Kê Tổng Quan",
        value: `📊 **Tổng cảnh cáo:** ${stats.totalWarnings}\n` +
               `⚠️ **Cảnh cáo active:** ${stats.activeWarnings}\n` +
               `✅ **Tỷ lệ active:** ${percentage}%`,
        inline: false
    });
```

## 🔐 Permissions

### Lệnh Warn
- **Permission:** `Administrator`
- **Mô tả:** Cảnh cáo user

### Lệnh Warnings
- **Permission:** `Administrator`
- **Mô tả:** Xem cảnh cáo của user

### Lệnh Clear Warnings
- **Permission:** `Administrator`
- **Mô tả:** Xóa tất cả cảnh cáo của user

### Lệnh Warn Stats
- **Permission:** `Administrator`
- **Mô tả:** Xem thống kê cảnh cáo server

**⚠️ Lưu ý:** Tất cả lệnh cảnh cáo đều yêu cầu quyền Administrator để đảm bảo tính bảo mật và kiểm soát chặt chẽ.

## 🎨 UI/UX Features

### Embed Colors
- **Level 1:** Orange (#ffa500)
- **Level 2:** Red (#ff6b6b)  
- **Level 3:** Dark Red (#ff0000)
- **Success:** Green (#51cf66)
- **Error:** Red (#ff0000)

### Emojis
- **Level 1:** ⚠️
- **Level 2:** 🚨
- **Level 3:** 🔨
- **Success:** ✅
- **Error:** ❌
- **Info:** ℹ️

### Timestamps
```typescript
// Relative time
`⏰ <t:${Math.floor(Date.now() / 1000)}:R>`

// Full date
`🕐 <t:${Math.floor(Date.now() / 1000)}:F>`
```

## 🚨 Error Handling

### Validation
```typescript
// Kiểm tra user hợp lệ
if (!targetUser) {
    throw new Error("Người dùng không hợp lệ");
}

// Kiểm tra không tự cảnh cáo
if (targetUser.id === message.author.id) {
    throw new Error("Không thể cảnh cáo chính mình");
}

// Kiểm tra đã có 3 cảnh cáo
if (currentLevel >= 3) {
    throw new Error("User đã có đủ 3 cảnh cáo");
}
```

### Try-Catch
```typescript
try {
    const warning = await WarningService.createWarning(warningData);
    // Success handling
} catch (error) {
    console.error("Error creating warning:", error);
    // Error handling
}
```

## 🔄 Roadmap

### Phase 1: Core Features ✅
- [x] Hệ thống 3 level cảnh cáo
- [x] Tự động ban khi đạt 3 cảnh cáo
- [x] Messages tùy chỉnh cho từng level
- [x] Database schema và service

### Phase 2: Management Features ✅
- [x] Lệnh xem cảnh cáo của user
- [x] Lệnh xóa cảnh cáo (Admin only)
- [x] Thống kê cảnh cáo server
- [x] Logging và moderation integration

### Phase 3: Advanced Features 🚧
- [ ] Cảnh cáo có thời hạn (expiresAt)
- [ ] Cảnh cáo theo category (spam, nsfw, etc.)
- [ ] Auto-removal warnings sau thời gian
- [ ] Warning templates
- [ ] Bulk warning operations

### Phase 4: Analytics 🚧
- [ ] Warning trends analysis
- [ ] Administrator performance tracking
- [ ] Warning effectiveness metrics
- [ ] Automated reports

## 🐛 Troubleshooting

### Lỗi Thường Gặp

#### 1. "User đã có đủ 3 cảnh cáo"
```bash
# Giải pháp: Xóa cảnh cáo cũ
n.clearwarnings @user
```

#### 2. "Không có quyền cảnh cáo"
```bash
# Kiểm tra permissions
- Administrator cho tất cả lệnh cảnh cáo
```

#### 3. "Database error"
```bash
# Reset database
npx prisma migrate reset
npx prisma db push
```

## 📝 Changelog

### v1.0.0 (Current)
- ✅ Hệ thống 3 level cảnh cáo
- ✅ Tự động ban khi đạt 3 cảnh cáo
- ✅ Messages tùy chỉnh cho từng level
- ✅ Database integration
- ✅ Moderation logging
- ✅ Administrator management commands
- ✅ Tất cả lệnh yêu cầu quyền Administrator

### v1.1.0 (Planned)
- 🚧 Warning expiration system
- 🚧 Category-based warnings
- 🚧 Warning templates
- 🚧 Bulk operations

### v1.2.0 (Planned)
- 🚧 Analytics dashboard
- 🚧 Automated reports
- 🚧 Performance tracking
- 🚧 Advanced statistics