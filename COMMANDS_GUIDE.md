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

### 📊 Thống kê & Bảng xếp hạng

| Lệnh | Alias | Mô tả |
|---|---|---|
| `n.gamestats [game]` | `gstats`, `gameleaderboard`, `topgames` | Top thắng theo game: `all` (mặc định), `blackjack`/`bj`, `slots`, `roulette`, `coinflip` |
| `n.toplose [game]` | `loserboard`, `losers`, `biggestlosers` | Top **thua lỗ** nhiều nhất theo game, cùng cú pháp như `gamestats` |

---

## 🐠 FishCoin & Hệ thống cá mở rộng

Đồng tiền riêng cho hệ thống cá: **FishCoin** (tách biệt với AniCoin).

| Lệnh | Alias | Cooldown | Mô tả |
|---|---|---|---|
| `n.fishbalance` | `fishbal`, `fishcoin`, `fishcoins`, `fc` | — | Xem số dư FishCoin + lịch sử giao dịch |
| `n.fishtransfer <user> <số lượng>` | `fishgive`*, `fishsend`, `ft` | — | Chuyển FishCoin cho người khác |
| `n.fishtop` | `fishleaderboard`, `fishlb`, `ftop` | — | Bảng xếp hạng FishCoin |
| `n.fishbarn` | `fb`*, `rươngcá` | 5s | Rương cá — quản lý/lưu trữ cá đã câu được |
| `n.fishmarket [trang]` | `market`, `fm` | 3s | Chợ cá: `list [trang]` xem, `sell <fish_id> <giá> [giờ]` treo bán |
| `n.fishbattle` | `battle`, `fb`* | 5s | Đấu cá PvP (dùng cá + skill + weapon) |
| `n.skillshop` | `ss`, `skillstore` | 3s | Cửa hàng kỹ năng cho cá |
| `n.weaponshop` | `weapon`, `weapons`, `fishweapon`, `fishweapons` | — | Cửa hàng vũ khí cho cá đấu (ATK/DEF/độ chính xác) |
| `n.pity` | `pitysystem`, `pityinfo` | 1s | Xem thông tin hệ thống pity (tỉ lệ đảm bảo khi câu cá/gacha) |
| `n.bank` | `ngân hàng`, `exchange` | 1s | Đổi qua lại AniCoin ⇄ FishCoin |

> ⚠️ *`fishgive` và `fb` bị dùng làm alias ở nhiều lệnh khác nhau (`fishtransfer`/admin `fishgive`, `fishbarn`/`fishbattle`). Do cơ chế dispatch ưu tiên khớp **tên lệnh thật** trước, gõ đúng tên lệnh chính (`n.fishbarn`, `n.fishbattle`, `n.fishtransfer`) sẽ luôn chạy đúng lệnh đó; chỉ alias trùng mới có thể bị "che" bởi lệnh có tên thật trùng alias.

### 🗑️ Xoá dữ liệu cá nhân
`n.delete <subcommand>` — alias: `del`, `remove`, `clear`

| Subcommand | Mô tả |
|---|---|
| `toplose` | Xem thống kê thua lỗ của bản thân trước khi xoá |
| `toplose confirm` | Xác nhận xoá dữ liệu thua lỗ |
| `help` | Hướng dẫn |

---

## 🎲 Game khác

| Lệnh | Alias | Mô tả |
|---|---|---|
| `n.baucua` | `bc` | Bầu Cua Tôm Cá — đặt cược theo con vật |
| `n.horseracing` | `hr`, `duangua` | Đua ngựa — đặt cược ngựa thắng |

---

## 🏅 Danh Hiệu (Achievement)

`n.achievements` — alias: `achievement`, `danhhieu`, `badge` — cooldown 3s

Xem danh sách danh hiệu bạn đang sở hữu, chọn danh hiệu **active** (hiển thị khi câu cá) bằng nút bấm nếu có nhiều hơn 1 danh hiệu.

**4 loại danh hiệu (type):**

| Type | Emoji | Ý nghĩa |
|---|---|---|
| `0` | 🏆 | Top câu cá nhiều nhất server |
| `1` | 💰 | Top FishCoin nhiều nhất |
| `2` | ⚔️ | Top FishBattle (thắng nhiều trận đấu cá nhất) |
| `3` | 🎖️ | Custom — admin gắn thủ công |

Mỗi danh hiệu có ảnh riêng (`link`), trạng thái Active/Chưa Active; danh hiệu **type thấp nhất** trong các danh hiệu đang active sẽ có priority cao nhất và hiển thị khi câu cá.

### Quản trị danh hiệu (Admin)
`n.achievement-import <subcommand>` — alias: `import-achievement`, `add-achievement` — chỉ Admin

| Subcommand | Cách dùng | Mô tả |
|---|---|---|
| *(không có)* / `form` | `n.achievement-import` | Hiện form nhập nhanh |
| `add` | `n.achievement-import add <name> <link> <target_user_id> <type>` | Gắn danh hiệu cho user |
| `list` | `n.achievement-import list` | Xem danh sách danh hiệu đã gắn |
| `delete` | `n.achievement-import delete <achievement_id>` | Xoá 1 danh hiệu |
| `clear` | `n.achievement-import clear` | Xoá toàn bộ danh hiệu |
| `help` | `n.achievement-import help` | Hướng dẫn |

Ví dụ: `n.achievement-import add "Top Fisher" "https://example.com/badge.png" "123456789" 0`

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

### ⚠️ Hệ thống Cảnh cáo (Warning)

| Lệnh | Alias | Quyền | Mô tả |
|---|---|---|---|
| `n.warn <user> [lý do]` | `warning`, `cảnh cáo`, `caution` | Administrator | Cảnh cáo user, tự động ban nếu vượt ngưỡng level |
| `n.warnings [@user]` | `warninglist`, `warnlist`, `cảnh cáo list` | Administrator | Xem danh sách cảnh cáo đang active |
| `n.warnstats` | `warningstats`, `thống kê cảnh cáo`, `warnstatistics` | Administrator | Thống kê tổng quan cảnh cáo theo level/gần đây |
| `n.clearwarnings <user>` | `clearwarn`, `xóa cảnh cáo`, `removewarnings` | Administrator | Xoá toàn bộ cảnh cáo của user |
| `n.unbanuser <user>` | `unban`*, `mở khóa`, `unlockuser` | Administrator | Mở khoá user (lưu ý: gõ đúng `n.unbanuser`, vì `n.unban` đã là tên lệnh khác — xem mục Ban) |

### 🚫 Chống Spam

| Lệnh | Alias | Quyền | Mô tả |
|---|---|---|---|
| `n.spamstats` | `spam`, `thống kê spam`, `spamstatistics` | Moderate Members | Thống kê hệ thống chống spam |
| `n.toolspam` | `toolspamstats`, `spamdetection`, `phát hiện spam` | Moderate Members | Chi tiết số lần phát hiện spam theo user/lệnh |
| `n.resetspam <user>` | `resetspamrecord`, `xóa spam`, `cleanspam` | Administrator | Reset lịch sử spam của user |

---

## ⚙️ Quản Trị (Admin)

| Lệnh | Alias | Quyền | Mô tả |
|---|---|---|---|
| `n.deploy` | `reload` | Dev only | Reload slash command + context menu lên server |
| `n.undeploy` | — | Dev only | Xoá toàn bộ slash command |
| `n.eval <code>` | `exec` | Dev only | Chạy code JS trực tiếp (debug) |
| `n.maintenance <on\|off>` | `maint` | Administrator | Bật/tắt chế độ bảo trì bot |
| `n.adminfishing <on\|off\|status>` | `fishingbypass`, `adminfish` | Administrator | Bật/tắt đặc quyền Admin khi câu cá (bypass cooldown/cần/mồi, không hiện badge "Admin Fishing"). Tắt để Admin câu cá y như user thường |
| `n.backupdb` | — | Administrator | Backup database (.db) hiện tại |
| `n.restoredb` | `importdb` | Administrator | Khôi phục database từ file .db đính kèm (⚠️ ghi đè) |
| `n.listbackups` | `backups`, `lsbackup` | Administrator | Xem danh sách file backup |
| `n.dbstatus` | `dbinfo`, `database` | Administrator | Xem thông tin/kích thước file database |
| `n.syncdb` | `sync`, `checkdb` | Administrator | Kiểm tra đồng bộ database |
| `n.refreshdb` | `reloaddb`, `resetdb` | Administrator | Reconnect Prisma + test query |
| `n.fishgive @user <số lượng>` | `fishadd`, `fishset`* | Admin (kiểm tra riêng) | Admin cộng FishCoin cho user (số âm = trừ) |
| `n.fishremove @user <số lượng>` | `fishsubtract`, `fishminus` | Admin (kiểm tra riêng) | Admin trừ FishCoin của user |
| `n.simulateuser <action> [params]` | `simuser`, `testuser`* | Admin (kiểm tra riêng) | **Dev/test only** — giả lập hành vi user: feed, breed, dailyfeed, addfishcoin, checkbalance... |
| `n.testuser <action> [params]` | `testregular`, `testnormal` | Admin (kiểm tra riêng) | **Dev/test only** — kiểm tra daily feed/breeding cost/FishCoin (trùng tên alias với `simulateuser`, ưu tiên tên lệnh thật) |

### 🔒 Hạn Chế Channel (Channel Restrictions)

`n.channelrestrictions <action> <type> [target]` — alias: `chrestrict`, `chrest`, `restrictch` — chỉ Administrator

| Action | Mô tả |
|---|---|
| *(không có)* / `help` | Hướng dẫn đầy đủ |
| `show` | Xem cấu hình hiện tại (whitelist/blacklist, channel/category nào được/bị cấm) |
| `add <channel\|category> <id>` | **Thêm channel/category** — bot sẽ hỏi thêm vào whitelist (1️⃣) hay blacklist (2️⃣), trả lời bằng số trong 30s |
| `remove <channel\|category> <id>` | Xoá channel/category khỏi cả whitelist và blacklist |
| `clear` | Xoá toàn bộ cấu hình |
| `mode <whitelist\|blacklist> <on\|off>` | Bật/tắt chế độ whitelist hoặc blacklist |
| `backup` | Tạo backup cấu hình |
| `restore` | Khôi phục cấu hình từ backup |
| `export` | Xuất cấu hình |
| `import` | Nhập cấu hình |

**Ví dụ thêm channel mới được phép dùng bot:**
```
n.channelrestrictions add channel 123456789012345678
→ chọn "1" (whitelist) khi bot hỏi
```
hoặc dùng alias ngắn: `n.chrestrict add channel <channel_id>`.

⚠️ Nếu bật **Whitelist Mode** mà danh sách `allowedChannels` rỗng, **toàn bộ lệnh trong server sẽ bị chặn** — dùng `n.chrestrict show` để kiểm tra trước khi bật.

### 🏆 Quản trị Danh hiệu
Xem `n.achievement-import` ở phần **🏅 Danh Hiệu (Achievement)** phía dưới.

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

Riêng `DATABASE_URL` (Prisma) vẫn đọc từ `.env` ở **root** (không phải `env/`): `DATABASE_URL="file:../data/database.db"`. Lưu ý đường dẫn này được Prisma resolve **tương đối với vị trí `prisma/schema.prisma`**, nên phải là `../data/database.db` (lùi ra root) chứ không phải `./data/database.db`, nếu không database thật sẽ bị tạo nhầm trong `prisma/data/`.

---

## Ghi chú kỹ thuật

- Database: SQLite qua Prisma (`prisma/schema.prisma`) — sau khi merge nhánh `feature-fish-barn` (2026-06-26), thêm các hệ thống: Achievement, Bank, FishBattle/FishStats, FishBarn, FishMarket, Skill/Weapon shop, Pity system, Warning, Spam protection — tổng 18 migration.
- 2 đơn vị tiền riêng biệt: **AniCoin** (kinh tế chung) và **FishCoin** (hệ thống cá, đổi qua `n.bank`).
- Một số lệnh admin/dev (`eval`, `deploy`, `undeploy`) bị ẩn (`hidden: true`) khỏi `help` thường.
- Cooldown được khai báo riêng theo lệnh trong `options.cooldown` (vd: `slots`/`coinflip` 15s, `fishing` 3s).
- **Trùng tên/alias đã biết:** dispatcher ưu tiên khớp tên lệnh thật trước khi tra alias (`src/events/messageCreate.ts`), nên các alias trùng tên lệnh khác (`unban`, `fishgive`, `fishremove`, `fb`, `testuser`) sẽ luôn bị "che" bởi lệnh có tên thật đó — không gây lỗi nhưng có thể gây nhầm lẫn khi đọc code.
- `n.simulateuser` / `n.testuser` là lệnh debug/test nội bộ từ nhánh feature, nên hạn chế phổ biến cho người dùng thường.
- Các flag cấu hình runtime (bật/tắt qua lệnh, giữ qua restart) lưu dạng JSON trong `data/`: `maintenance-mode.json` (`n.maintenance`), `admin-fishing-bypass.json` (`n.adminfishing`), `channel-restrictions.json` (`n.channelrestrictions`). Các file này nên được backup cùng `data/database.db`.
