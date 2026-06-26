# 🛡️ Hệ Thống Spam Protection

## 📋 Tổng Quan

Hệ thống spam protection được thiết kế để ngăn chặn việc spam các lệnh quan trọng như câu cá, battle, feed. Hệ thống theo dõi và giới hạn số lần sử dụng lệnh của user trong một khoảng thời gian nhất định.

**🆕 Tính năng mới:** Tool Spam Detection - Phát hiện spam tự động dựa trên pattern thời gian!

## 🎯 Tính Năng Chính

### ✅ Chống Spam Thông Minh
- **Cooldown:** Thời gian chờ giữa các lần sử dụng lệnh
- **Rate Limiting:** Giới hạn số lần sử dụng trong timeWindow
- **Warning System:** Cảnh cáo trước khi ban
- **Auto Ban:** Tự động tạm khóa user spam quá nhiều

### 🤖 Tool Spam Detection (Mới)
- **Pattern Detection:** Phát hiện pattern thời gian giống nhau
- **Time Tolerance:** Độ sai số cho phép (±2 giây)
- **Auto Ban Tool Spam:** Ban 1 phút cho tool spam
- **Advanced Analytics:** Phân tích chi tiết pattern spam

### ✅ Lệnh Được Bảo Vệ
- **Fishing:** 30s cooldown, 5 lần/5 phút
- **Battle:** 60s cooldown, 3 lần/10 phút  
- **Feed:** 15s cooldown, 10 lần/5 phút

### ✅ Hệ Thống Cảnh Cáo
- **Level 1:** Cảnh cáo nhẹ
- **Level 2:** Cảnh cáo nghiêm trọng
- **Level 3:** Tạm khóa 30 phút
- **Tool Spam Level:** Cảnh cáo tool spam → Ban 1 phút
- **Extended Spam Level:** Cảnh cáo extended spam → Ban 5 phút

## 🏗️ Kiến Trúc Hệ Thống

### 📁 Cấu Trúc Files
```
src/
├── config/
│   └── spam-protection.ts      # Cấu hình spam protection + tool spam
├── utils/
│   └── spam-protection.ts      # Spam protection service + tool spam detection
├── commands/text/moderation/
│   ├── spamstats.ts            # Xem thống kê spam
│   ├── resetspam.ts            # Reset spam records
│   ├── unbanuser.ts            # Mở khóa user
│   └── toolspam.ts             # Xem thống kê tool spam (Mới)
└── commands/text/ecommerce/
    └── fishing.ts              # Tích hợp spam protection
```

### 🔧 Cấu Hình Spam Protection
```typescript
interface SpamProtectionConfig {
  enabled: boolean;              // Bật/tắt hệ thống
  cooldown: number;              // Thời gian chờ (giây)
  maxAttempts: number;           // Số lần tối đa
  timeWindow: number;            // Khoảng thời gian (giây)
  warningThreshold: number;      // Ngưỡng cảnh cáo
  banThreshold: number;          // Ngưỡng ban
  toolSpamDetection: {           // Tool spam detection (Mới)
    enabled: boolean;
    minAttempts: number;         // Số lần tối thiểu để phát hiện
    timeTolerance: number;       // Độ sai số cho phép (giây)
    patternThreshold: number;    // Số lần pattern giống nhau
    banDuration: number;         // Thời gian ban (phút)
  };
}
```

## 🎮 Cách Sử Dụng

### Lệnh Quản Lý
```bash
# Xem thống kê spam
n.spamstats @user
n.spamstats @user fishing

# Xem thống kê tool spam (Mới)
n.toolspam @user
n.toolspam @user fishing

# Reset spam records
n.resetspam @user
n.resetspam @user fishing

# Mở khóa user
n.unbanuser @user
n.unbanuser @user fishing
```

### Aliases
```bash
# Spam stats
spamstats, spam, thống kê spam, spamstatistics

# Tool spam stats (Mới)
toolspam, toolspamstats, spamdetection, phát hiện spam

# Reset spam
resetspam, resetspamrecord, xóa spam, cleanspam

# Unban user
unbanuser, unban, mở khóa, unlockuser
```

## ⚙️ Cấu Hình Chi Tiết

### Fishing Command
```typescript
fishing: {
  name: 'fishing',
  aliases: ['fish', 'câu', 'cá'],
  cooldown: 30,        // 30 giây giữa các lần
  maxAttempts: 5,      // Tối đa 5 lần
  timeWindow: 300,     // Trong 5 phút
}
```

### Battle Command
```typescript
battle: {
  name: 'battle',
  aliases: ['đánh', 'chiến'],
  cooldown: 60,        // 60 giây giữa các lần
  maxAttempts: 3,      // Tối đa 3 lần
  timeWindow: 600,     // Trong 10 phút
}
```

### Feed Command
```typescript
feed: {
  name: 'feed',
  aliases: ['cho ăn', 'ăn'],
  cooldown: 15,        // 15 giây giữa các lần
  maxAttempts: 10,     // Tối đa 10 lần
  timeWindow: 300,     // Trong 5 phút
}
```

### Tool Spam Detection Config
```typescript
toolSpamDetection: {
  enabled: true,
  minAttempts: 3,      // Cần ít nhất 3 lần để phát hiện
  timeTolerance: 2,    // Độ sai số ±2 giây
  patternThreshold: 2, // 2 lần pattern giống nhau = tool spam
  banDuration: 1,      // Ban 1 phút cho tool spam
}
```

### Extended Spam Monitoring Config
```typescript
extendedSpamMonitoring: {
  enabled: true,
  timeWindow: 300,      // 5 phút = 300 giây
  maxAttempts: 20,      // Tối đa 20 lần trong 5 phút
  warningThreshold: 15, // Cảnh cáo sau 15 lần vi phạm
  banThreshold: 20,     // Ban sau 20 lần vi phạm
  banDuration: 1,       // Ban 1 phút cho extended spam
  frequencyDetection: {
    enabled: true,
    minAttempts: 3,     // Cần ít nhất 3 lần để phát hiện
    timeTolerance: 2,   // Độ sai số ±2 giây
    patternThreshold: 2, // 2 lần pattern giống nhau = frequency spam
  },
}
```

## 🤖 Tool Spam Detection

### 🎯 Cách Hoạt Động

#### 1. **Thu Thập Dữ Liệu**
```typescript
// Theo dõi thời gian giữa các lần thử
const timeSinceLastAttempt = (now - record.timestamp) / 1000;
record.timeIntervals.push(timeSinceLastAttempt);
```

#### 2. **Phát Hiện Pattern**
```typescript
// Tìm pattern phổ biến nhất
const patterns = findTimePatterns(intervals, timeTolerance);
// Ví dụ: 20s, 20s, 21s, 20s → Pattern: 20s (3 lần)
```

#### 3. **Đánh Giá Tool Spam**
```typescript
// Nếu pattern xuất hiện >= patternThreshold lần
if (pattern.count >= patternThreshold) {
  return { detected: true, pattern: pattern.interval };
}
```

### 📊 Ví Dụ Tool Spam

#### ✅ **Spam Tự Nhiên:**
```
12:00:00 - Lần 1
12:00:35 - Lần 2 (35s)
12:01:12 - Lần 3 (37s)
12:01:48 - Lần 4 (36s)
12:02:25 - Lần 5 (37s)
```
**Kết quả:** Không phát hiện tool spam (thời gian không đều)

#### ❌ **Tool Spam:**
```
12:00:00 - Lần 1
12:00:20 - Lần 2 (20s)
12:00:40 - Lần 3 (20s)
12:01:00 - Lần 4 (20s)
12:01:20 - Lần 5 (20s)
```
**Kết quả:** Phát hiện tool spam (pattern 20s xuất hiện 4 lần) → Ban 1 phút

## 📊 Extended Spam Monitoring

### 🎯 Cách Hoạt Động

#### 1. **Thu Thập Dữ Liệu**
```typescript
// Theo dõi tất cả lần thử trong 5 phút
record.extendedAttemptsHistory.push(now);

// Tính thời gian giữa các lần thử trong extended window
if (record.extendedAttemptsHistory.length > 1) {
  const timeSinceLastExtendedAttempt = (now - lastAttempt) / 1000;
  record.extendedTimeIntervals.push(timeSinceLastExtendedAttempt);
}
```

#### 2. **Phân Tích TimeWindow**
```typescript
// Lọc các lần thử trong 5 phút gần nhất
const extendedWindowStart = now - (timeWindow * 1000);
const recentAttempts = record.extendedAttemptsHistory.filter(timestamp => timestamp >= extendedWindowStart);
```

#### 3. **Đánh Giá Extended Spam**
```typescript
// Nếu số lần thử > maxAttempts hoặc >= warningThreshold
if (record.extendedAttempts > maxAttempts || record.extendedAttempts >= warningThreshold) {
  return { detected: true };
}
```

#### 4. **Phát Hiện Frequency Spam**
```typescript
// Tìm pattern phổ biến nhất trong 5 phút
const patterns = this.findTimePatterns(record.extendedTimeIntervals, timeTolerance);

// Kiểm tra xem có pattern nào xuất hiện đủ số lần không
for (const pattern of patterns) {
  if (pattern.count >= patternThreshold) {
    return { detected: true, pattern: pattern.interval };
  }
}
```

### 📊 Ví Dụ Extended Spam + Frequency Detection

#### ✅ **Spam Bình Thường:**
```
12:00:00 - Lần 1
12:00:30 - Lần 2 (30s)
12:01:00 - Lần 3 (30s)
...
12:04:30 - Lần 19 (30s)
12:05:00 - Lần 20 (30s)
```
**Kết quả:** Không phát hiện extended spam (20 lần trong 5 phút = đúng giới hạn)

#### ❌ **Extended Spam (Vượt Quá Số Lần):**
```
12:00:00 - Lần 1
12:00:15 - Lần 2
12:00:30 - Lần 3
...
12:04:45 - Lần 21 ← Vượt quá 20 lần
```
**Kết quả:** Phát hiện extended spam (21 lần > 20 lần trong 5 phút) → Ban 5 phút

#### ❌ **Frequency Spam (Pattern Tự Động):**
```
12:00:00 - Lần 1
12:00:20 - Lần 2 (20s)
12:00:40 - Lần 3 (20s)
12:01:00 - Lần 4 (20s)
12:01:20 - Lần 5 (20s)
...
12:04:40 - Lần 15 (20s)
```
**Kết quả:** Phát hiện frequency spam (pattern 20s xuất hiện nhiều lần ±2s) → Ban 5 phút

### 🔍 **Thuật Toán Kết Hợp**

#### 1. **Theo Dõi Timeline + Frequency**
```typescript
// Lưu timestamp của mỗi lần thử
record.extendedAttemptsHistory.push(now);

// Tính thời gian giữa các lần thử
if (record.extendedAttemptsHistory.length > 1) {
  const timeSinceLastExtendedAttempt = (now - lastAttempt) / 1000;
  record.extendedTimeIntervals.push(timeSinceLastExtendedAttempt);
}
```

#### 2. **Lọc TimeWindow**
```typescript
// Chỉ tính các lần thử trong 5 phút gần nhất
const recentAttempts = record.extendedAttemptsHistory.filter(timestamp => timestamp >= fiveMinutesAgo);
```

#### 3. **So Sánh Threshold + Pattern**
```typescript
// Kiểm tra số lần thử
if (record.extendedAttempts >= warningThreshold) {
  // Cảnh cáo extended spam
}

// Kiểm tra frequency pattern
const patterns = this.findTimePatterns(record.extendedTimeIntervals, timeTolerance);
for (const pattern of patterns) {
  if (pattern.count >= patternThreshold) {
    // Cảnh cáo frequency spam
  }
}
```

## 🛡️ Spam Protection Service

### SpamProtectionService Class
```typescript
class SpamProtectionService {
  // Singleton pattern
  static getInstance(): SpamProtectionService

  // Kiểm tra spam (bao gồm tool spam)
  checkSpam(userId: string, guildId: string, command: string): {
    allowed: boolean;
    reason?: string;
    cooldown?: number;
    embed?: EmbedBuilder;
    toolSpamDetected?: boolean;
    pattern?: string;
  }

  // Phát hiện tool spam
  private detectToolSpam(record: SpamRecord): {
    detected: boolean;
    pattern?: number;
  }

  // Tìm patterns thời gian
  private findTimePatterns(intervals: number[], tolerance: number): Array<{
    interval: number;
    count: number;
  }>

  // Reset spam record
  resetSpamRecord(userId: string, guildId: string, command: string): boolean

  // Unban user (bao gồm tool spam ban)
  unbanUser(userId: string, guildId: string, command: string): boolean

  // Lấy thống kê spam
  getSpamStats(userId: string, guildId: string, command: string): SpamRecord | null

  // Cleanup records cũ
  cleanupOldRecords(): number
}
```

### SpamRecord Interface (Cập Nhật)
```typescript
interface SpamRecord {
  userId: string;
  guildId: string;
  command: string;
  timestamp: number;
  attempts: number;
  warnings: number;
  isBanned: boolean;
  banExpiresAt?: number;
  // Tool spam detection (Mới)
  timeIntervals: number[];           // Thời gian giữa các lần thử
  toolSpamWarnings: number;          // Số lần cảnh cáo tool spam
  isToolSpamBanned: boolean;         // Bị ban do tool spam
  toolSpamBanExpiresAt?: number;     // Thời gian hết hạn ban tool spam
  // Extended spam monitoring (Mới)
  extendedAttempts: number;           // Số lần thử trong extended timeWindow
  extendedWarnings: number;          // Số lần cảnh cáo extended spam
  isExtendedSpamBanned: boolean;     // Bị ban do extended spam
  extendedSpamBanExpiresAt?: number; // Thời gian hết hạn ban extended spam
  extendedAttemptsHistory: number[];  // Lịch sử các lần thử trong extended window
  extendedTimeIntervals: number[];   // Thời gian giữa các lần thử trong extended window
  // Frequency detection trong extended spam
  frequencySpamWarnings: number;      // Số lần cảnh cáo frequency spam
  isFrequencySpamBanned: boolean;    // Bị ban do frequency spam
  frequencySpamBanExpiresAt?: number; // Thời gian hết hạn ban frequency spam
}
```

## 🎯 Logic Hoạt Động

### 1. Kiểm Tra Extended Spam Ban
```typescript
// Kiểm tra extended spam ban trước
if (record.isExtendedSpamBanned && record.extendedSpamBanExpiresAt && now < record.extendedSpamBanExpiresAt) {
  return { allowed: false, reason: "extended_spam_banned" };
}
```

### 2. Kiểm Tra Frequency Spam Ban
```typescript
// Kiểm tra frequency spam ban
if (record.isFrequencySpamBanned && record.frequencySpamBanExpiresAt && now < record.frequencySpamBanExpiresAt) {
  return { allowed: false, reason: "frequency_spam_banned" };
}
```

### 3. Thu Thập Dữ Liệu Extended Spam + Frequency
```typescript
// Cập nhật extended attempts history
record.extendedAttemptsHistory.push(now);

// Tính thời gian giữa các lần thử trong extended window
if (record.extendedAttemptsHistory.length > 1) {
  const timeSinceLastExtendedAttempt = (now - lastAttempt) / 1000;
  record.extendedTimeIntervals.push(timeSinceLastExtendedAttempt);
}

// Kiểm tra extended spam monitoring
const extendedSpamResult = this.checkExtendedSpam(record, now);
if (extendedSpamResult.detected) {
  // Cảnh cáo/Ban extended spam
}

// Kiểm tra frequency spam trong extended window
const frequencySpamResult = this.detectFrequencySpam(record);
if (frequencySpamResult.detected) {
  // Cảnh cáo/Ban frequency spam
}
```

### 4. Phát Hiện Tool Spam
```typescript
// Kiểm tra tool spam pattern
const toolSpamResult = this.detectToolSpam(record);
if (toolSpamResult.detected) {
  record.toolSpamWarnings++;
  
  if (record.toolSpamWarnings >= patternThreshold) {
    // Ban tool spam
    record.isToolSpamBanned = true;
    record.toolSpamBanExpiresAt = now + (banDuration * 60 * 1000);
  }
}
```

### 5. Kiểm Tra Spam Thường
```typescript
// Kiểm tra cooldown và rate limiting như bình thường
if (timeSinceLastAttempt < commandConfig.cooldown) {
  return { allowed: false, reason: "cooldown" };
}
```

## 🎨 UI/UX Features

### Embed Colors
- **Success:** Green (#51cf66)
- **Error:** Red (#ff0000)
- **Warning:** Orange (#ffa500)
- **Info:** Blue (#51cf66)
- **Tool Spam:** Purple (#9932cc)

### Emojis
- **🛡️** - Spam Protection
- **🤖** - Tool Spam Detection
- **⏰** - Cooldown
- **⚠️** - Warning
- **🔨** - Ban
- **✅** - Success
- **❌** - Error
- **📊** - Statistics
- **🔍** - Pattern Detection

### Messages
```typescript
const spamMessages = {
  cooldown: "⏰ **Cooldown!** Bạn cần chờ {time} giây nữa mới có thể {command}.",
  warning: "⚠️ **Cảnh cáo spam!** Bạn đã {attempts} lần {command} quá nhanh.",
  ban: "🔨 **Bị tạm khóa!** Bạn đã spam {command} quá nhiều lần.",
  unbanned: "✅ **Đã mở khóa!** Bạn có thể sử dụng {command} bình thường.",
  stats: "📊 **Thống kê spam:** {attempts} lần trong {timeWindow} giây",
  // Tool spam messages (Mới)
  toolSpamWarning: "🤖 **Cảnh cáo Tool Spam!** Phát hiện pattern spam tự động.",
  toolSpamBan: "🔨 **Bị tạm khóa Tool Spam!** Phát hiện sử dụng tool spam tự động.",
  toolSpamDetected: "🤖 **Tool Spam Detected!** Pattern: {pattern} giây ± {tolerance} giây",
};
```

## 🔐 Permissions

### Lệnh Spam Stats
- **Permission:** `ModerateMembers`
- **Mô tả:** Xem thống kê spam của user

### Lệnh Tool Spam Stats (Mới)
- **Permission:** `ModerateMembers`
- **Mô tả:** Xem thống kê tool spam chi tiết

### Lệnh Reset Spam
- **Permission:** `Administrator`
- **Mô tả:** Reset spam records của user

### Lệnh Unban User
- **Permission:** `Administrator`
- **Mô tả:** Mở khóa user bị ban spam (bao gồm tool spam)

## 🚨 Error Handling

### Validation
```typescript
// Kiểm tra user hợp lệ
if (!targetUser) {
  throw new Error("Người dùng không hợp lệ");
}

// Kiểm tra command hợp lệ
if (!commandConfig) {
  return { allowed: true }; // Không bảo vệ command này
}

// Kiểm tra tool spam detection enabled
if (!spamProtectionConfig.toolSpamDetection.enabled) {
  return { detected: false };
}
```

### Try-Catch
```typescript
try {
  const spamCheck = spamService.checkSpam(userId, guildId, command);
  // Xử lý kết quả
} catch (error) {
  console.error("Spam protection error:", error);
  // Fallback: cho phép thực hiện lệnh
  return { allowed: true };
}
```

## 🔄 Roadmap

### Phase 1: Core Features ✅
- [x] Hệ thống spam protection cơ bản
- [x] Cooldown và rate limiting
- [x] Warning system
- [x] Auto ban system
- [x] Admin management commands

### Phase 2: Tool Spam Detection ✅
- [x] Pattern detection algorithm
- [x] Time interval tracking
- [x] Tool spam warning system
- [x] Tool spam ban system
- [x] Advanced analytics

### Phase 3: Advanced Features 🚧
- [ ] Database storage cho spam records
- [ ] Persistent ban system
- [ ] Custom cooldown per user
- [ ] Whitelist system
- [ ] Machine learning detection

### Phase 4: Integration Features 🚧
- [ ] Integration với warning system
- [ ] Logging system
- [ ] Webhook notifications
- [ ] Dashboard analytics
- [ ] API endpoints

## 🐛 Troubleshooting

### Lỗi Thường Gặp

#### 1. "User bị khóa tool spam quá lâu"
```bash
# Giải pháp
n.unbanuser @user
n.resetspam @user
```

#### 2. "Tool spam detection không hoạt động"
```bash
# Kiểm tra config
- toolSpamDetection.enabled: true
- minAttempts >= 3
- timeTolerance > 0
- patternThreshold > 0
```

#### 3. "Pattern detection quá nhạy/không nhạy"
```bash
# Điều chỉnh config
timeTolerance: 2,        // Tăng/giảm độ sai số
patternThreshold: 2,     // Tăng/giảm số lần pattern
minAttempts: 3,         // Tăng/giảm số lần tối thiểu
```

#### 4. "Không thể reset tool spam records"
```bash
# Kiểm tra permissions
- Cần quyền Administrator
- User phải tồn tại
- Command phải hợp lệ
```

## 📝 Changelog

### v1.3.0 (Current) - Extended Spam + Frequency Detection
- ✅ Extended spam monitoring system với frequency detection
- ✅ 5-minute timeWindow tracking với pattern analysis
- ✅ 20 attempts limit trong 5 phút
- ✅ Frequency spam detection với ±2s tolerance
- ✅ Extended spam warning system
- ✅ Frequency spam warning system
- ✅ Extended spam ban system (5 phút)
- ✅ Frequency spam ban system (5 phút)
- ✅ Advanced timeline analytics
- ✅ Enhanced toolspam command với frequency stats
- ✅ Comprehensive spam protection với 4 lớp bảo vệ

### v1.2.0 (Previous) - Extended Spam Monitoring
- ✅ Extended spam monitoring system
- ✅ 5-minute timeWindow tracking
- ✅ 20 attempts limit in 5 minutes
- ✅ Extended spam warning system
- ✅ Extended spam ban system (5 phút)
- ✅ Advanced timeline analytics
- ✅ Enhanced toolspam command
- ✅ Comprehensive spam protection

### v1.1.0 (Previous) - Tool Spam Detection
- ✅ Tool spam detection algorithm
- ✅ Pattern recognition system
- ✅ Time interval tracking
- ✅ Tool spam warning system
- ✅ Tool spam ban system (1 phút)
- ✅ Advanced analytics và reporting
- ✅ Tool spam stats command
- ✅ Enhanced UI/UX với tool spam indicators

### v1.0.0 (Previous)
- ✅ Hệ thống spam protection cơ bản
- ✅ Cooldown và rate limiting
- ✅ Warning và auto ban system
- ✅ Admin management commands
- ✅ Integration với fishing command
- ✅ UI/UX với embeds và emojis

### v1.2.0 (Planned)
- 🚧 Database storage
- 🚧 Persistent ban system
- 🚧 Custom cooldown per user
- 🚧 Whitelist system
- 🚧 Machine learning detection

### v1.3.0 (Planned)
- 🚧 Integration với warning system
- 🚧 Advanced analytics
- 🚧 Webhook notifications
- 🚧 Dashboard
- 🚧 API endpoints