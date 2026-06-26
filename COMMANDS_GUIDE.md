# Hướng Dẫn Lệnh — AniNhi Bot

Prefix mặc định: **`n.`** (đổi tại [src/config/index.ts](src/config/index.ts))

Ngoài lệnh text (prefix), bot còn có 3 slash command thông tin: `/ping`, `/uptime`, `/help`.

---

## 📌 Thông Tin (Information)

| Lệnh | Alias | Mô tả |
|---|---|---|
| `n.ping` | — | Xem độ trễ (latency) của bot |
| `n.uptime` | — | Xem thời gian bot đã hoạt động |
| `n.help [lệnh]` | `h`, `commands`, `cmd` | Xem danh sách lệnh hoặc chi tiết 1 lệnh |
| `n.debug` | `debugcommands` | Xem số lệnh/category đã load (debug) |
| `n.test` | `pingtest` | Kiểm tra bot có hoạt động không |

Slash: `/ping`, `/uptime`, `/help`.

---

## 💰 Kinh Tế (Ecommerce)

| Lệnh | Alias | Cooldown | Mô tả |
|---|---|---|---|
| `n.balance` | `bal`, `money`, `coins`, `cash` | — | Xem số dư AniCoin, chuỗi daily, lịch sử giao dịch gần nhất |
| `n.daily` | `claim`, `reward` | 24h (theo logic claim) | Nhận thưởng hàng ngày, tăng dailyStreak |
| `n.give <user> <số tiền>` | `pay`, `send`, `transfer` | — | Chuyển AniCoin cho người khác |
| `n.leaderboard` | `lb`, `top`, `rich` | — | Bảng xếp hạng top 10 người giàu nhất server |
| `n.inventory [@user]` | `inv`, `bag`, `items` | — | Xem túi đồ (của mình hoặc người khác) |

### 🎮 Mini-game (cờ bạc)

| Lệnh | Alias | Cooldown | Cách dùng |
|---|---|---|---|
| `n.coinflip [bet]` | `cf`, `coin`, `flip` | 15s | Tung xu, cược `<số tiền>` hoặc `all`. Max cược: 300,000 |
| `n.slots [số tiền\|all]` | `slot`, `sl`, `s` | 15s | Máy slot, cược số tiền hoặc `all` |
| `n.blackjack` | — | — | Chơi blackjack (tương tác nút Hit 👊 / Stand 🛑). Max cược: 300,000 |
| `n.roulette` | — | — | Roulette kiểu sòng bạc: cược số (0-36, x35), đỏ/đen/chẵn/lẻ (x1). Cược: 10 – 300,000 |

### 🐟 Câu cá (Fishing)
`n.fishing [subcommand]` — alias: `fish`, `f` — cooldown 3s, cần ≥10 AniCoin/lần câu

| Subcommand | Alias VN | Mô tả |
|---|---|---|
| *(không có)* / `fish` | `câu` | Câu cá (có animation) |
| `shop` | `cửa hàng` | Xem shop cần câu/mồi |
| `buy <item>` | `mua` | Mua cần câu hoặc mồi |
| `sell <fish>` | `bán` | Bán cá đã câu được |
| `price [fish]` | `giá` | Xem giá cá |
| `setrod <rod>` | `setcần` | Đặt cần câu hiện tại |
| `setbait <bait>` | `setmồi` | Đặt mồi hiện tại |
| `inventory` | `inv`, `túi đồ`, `túi` | Xem túi cá/đồ câu cá |
| `stats` | `thống kê` | Xem thống kê câu cá (tổng cá, tiền kiếm được, cá hiếm nhất...) |
| `help` | — | Hướng dẫn lệnh fishing |

Độ hiếm cá: ⚪ Thường / 🔵 Hiếm / 🟣 Quý hiếm / 🟡 Huyền thoại.

### 🏆 Giải đấu (Tournament)
`n.tournament <subcommand>` — alias: `tour`, `t`

| Subcommand | Mô tả |
|---|---|
| `create` | Tạo giải đấu mới |
| `join` | Tham gia giải đấu |
| `list` | Xem danh sách giải đấu |
| `info` | Xem thông tin chi tiết giải đấu |
| `end` | Kết thúc giải đấu |
| `force` | Buộc kết thúc giải đấu |
| `cleanup` / `dọn dẹp` | Dọn dẹp giải đấu hết hạn |
| `restart` / `khởi động lại` | Khởi động lại hệ thống kiểm tra giải đấu |
| `help` | Hướng dẫn lệnh tournament |

Bot tự động kiểm tra giải đấu hết hạn mỗi 30 giây.

---

## 🛡️ Kiểm Duyệt (Moderation)

| Lệnh | Alias | Quyền yêu cầu | Cách dùng |
|---|---|---|---|
| `n.kick <user> [lý do]` | `kickuser`, `kickmember` | Kick Members | Kick user khỏi server |
| `n.ban <user> [thời gian] [lý do]` | `banuser`, `banmember` | — (kiểm tra riêng) | Ban user, hỗ trợ ban tạm thời (`1h`, `1d`...) |
| `n.unban <user>` | `unbanuser`, `unbanmember` | Ban Members | Gỡ ban |
| `n.banlist` | `bans`, `listbans` | Ban Members | Xem danh sách user bị ban (vĩnh viễn/tạm thời) |
| `n.mute <user> [thời gian] [lý do]` | `muteuser`, `mutemember`, `timeout` | — | Timeout (mute) user |
| `n.unmute <user>` | `unmuteuser`, `unmutemember`, `untimeout` | Moderate Members | Gỡ mute |
| `n.channelkick <user> [thời gian] [lý do]` | `ckick`, `kickfromchannel`, `timeout` | Manage Channels, Manage Roles | Kick user khỏi channel hiện tại (tạm thời) |
| `n.quickkick <user> [lý do]` | `qkick`, `kick1m`, `1mkick` | Manage Channels, Manage Roles | Kick nhanh khỏi channel trong 1 phút |
| `n.votekick <user> [vote time] [kick time] [lý do]` | `vote`, `vkick`, `democracy` | Manage Channels, Manage Roles | Vote kick dân chủ (phản ứng 👍/👎) |
| `n.add <user> <số tiền>` | `addmoney`, `giveadmin` | Administrator | Admin cộng AniCoin cho user |
| `n.subtract <user> <số tiền>` | `sub`, `takemoney`, `remove` | Moderate Members | Trừ AniCoin của user |
| `n.giveitem <user> <item_id> <số lượng> [durability]` | `additem`, `item` | Moderate Members | Tặng item cho user |
| `n.logs [@user] [limit]` | `modlogs`, `moderationlogs`, `history` | Moderate Members | Xem lịch sử moderation (limit 1-25, mặc định 10) |
| `n.modstats` | `moderationstats`, `modstatistics` | Moderate Members | Thống kê moderation (top mod, top bị xử lý...) |

Đơn vị thời gian: `s` giây, `m` phút, `h` giờ, `d` ngày, `w` tuần, `y` năm (ví dụ `1h`, `30m`).

---

## ⚙️ Quản Trị (Admin)

| Lệnh | Alias | Quyền | Mô tả |
|---|---|---|---|
| `n.deploy` | `reload` | Dev only | Reload slash command + context menu lên server |
| `n.undeploy` | — | Dev only | Xoá toàn bộ slash command |
| `n.eval <code>` | `exec` | Dev only | Chạy code JS trực tiếp (debug) |
| `n.maintenance <on\|off>` | `maint` | Administrator | Bật/tắt chế độ bảo trì bot |
| `n.backupdb` | — | Administrator | Backup database (.db) hiện tại |
| `n.restoredb` | `importdb` | Administrator | Khôi phục database từ file .db đính kèm (⚠️ ghi đè) |
| `n.listbackups` | `backups`, `lsbackup` | Administrator | Xem danh sách file backup |
| `n.dbstatus` | `dbinfo`, `database` | Administrator | Xem thông tin/kích thước file database |
| `n.syncdb` | `sync`, `checkdb` | Administrator | Kiểm tra đồng bộ database |
| `n.refreshdb` | `reloaddb`, `resetdb` | Administrator | Reconnect Prisma + test query |

---

## ⚙️ Thiết lập Environment

Bot đọc biến môi trường từ thư mục **`env/`** (không phải `.env` ở root), theo thứ tự:
`env/.env` → `env/.env.local` → `env/.env.{NODE_ENV}` → `env/.env.{NODE_ENV}.local` ([src/index.ts](src/index.ts)).

Copy [env/.env.example](env/.env.example) thành `env/.env` và điền:

| Biến | Bắt buộc | Mô tả |
|---|---|---|
| `BOT_TOKEN` | ✅ | Token bot Discord |
| `NODE_ENV` | ✅ | `development` hoặc `production` |
| `DEBUG` | — | Namespace debug, mặc định `bot:*` |
| `SUPPORT_GUILD_INVITE` | — | Link invite server hỗ trợ (hiện trong `n.help`) |
| `SUPPORT_NAME` | — | Tên hiển thị trong footer `n.help` |
| `DASHBOARD_URL` | — | URL dashboard nếu có |

Riêng `DATABASE_URL` (Prisma) vẫn đọc từ `.env` ở **root** (không phải `env/`), ví dụ: `DATABASE_URL="file:./data/database.db"`.

---

## Ghi chú kỹ thuật

- Database: SQLite qua Prisma (`prisma/schema.prisma`) — model chính: `User`, `Transaction`, `DailyClaim`, `GameStats`, `FishingData` (+ rod/bait/caught fish), `TournamentParticipant`.
- Đơn vị tiền: **AniCoin**.
- Một số lệnh admin/dev (`eval`, `deploy`, `undeploy`) bị ẩn (`hidden: true`) khỏi `help` thường.
- Cooldown được khai báo riêng theo lệnh trong `options.cooldown` (vd: `slots`/`coinflip` 15s, `fishing` 3s).
