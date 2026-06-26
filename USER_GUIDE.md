# 🎮 Hướng Dẫn Sử Dụng Bot — AniNhi

Chào mừng bạn đến với AniNhi! Đây là hướng dẫn nhanh để bạn biết bot làm được gì và chơi sao cho vui. Mọi lệnh đều gõ trong chat, bắt đầu bằng **`n.`** (ví dụ: `n.balance`).

> 💡 Quên lệnh gì cứ gõ `n.help` để bot nhắc lại.

---

## 💰 Tiền Của Bạn: AniCoin

AniCoin là đồng tiền chính dùng để chơi game, mua đồ, đặt cược.

| Muốn làm gì? | Gõ lệnh |
|---|---|
| Xem mình có bao nhiêu tiền | `n.balance` (hoặc `n.bal`) |
| Nhận thưởng mỗi ngày (điểm danh) | `n.daily` |
| Chuyển tiền cho người khác | `n.give @người_nhận 1000` |
| Xem ai giàu nhất server | `n.leaderboard` (hoặc `n.lb`, `n.top`) |
| Xem túi đồ của mình | `n.inventory` (hoặc `n.inv`) |

**Mẹo:** điểm danh `n.daily` mỗi ngày để giữ "chuỗi" (streak) — chuỗi dài thì tiền thưởng tăng dần. Đừng bỏ lỡ ngày nào!

---

## 🎲 Chơi Game Kiếm Tiền (hoặc mất tiền 😅)

| Game | Lệnh | Tiền cược | Cách chơi |
|---|---|---|---|
| 🪙 Tung xu | `n.coinflip <số tiền>` hoặc `n.coinflip all` | AniCoin, tối đa 300,000 | 50/50 ăn x2 hoặc mất hết |
| 🎰 Máy xèng | `n.slots <số tiền>` hoặc `n.slots all` | AniCoin, tối đa 300,000 | Nổ 3 ký hiệu giống nhau là trúng |
| 🃏 Blackjack | `n.blackjack` | AniCoin, tối đa 300,000 | Đấu bài với bot, nút Hit 👊 / Stand 🛑 |
| 🎲 Roulette | `n.roulette` | AniCoin, 10 – 300,000 | Cược số (0-36), màu đỏ/đen, chẵn/lẻ — trúng số cụ thể ăn x35! |
| 🦀 Bầu Cua | `n.baucua` (hoặc `n.bc`) | **FishCoin**, tối đa 1,000,000 | Tham gia phòng, cược theo con vật, chủ phòng lắc 3 xúc xắc |
| 🐎 Đua ngựa | `n.horseracing` (hoặc `n.hr`) | **FishCoin**, tối đa 1,000,000 | Tham gia phòng, cược con ngựa sẽ thắng |

> ⚠️ Bầu Cua và Đua Ngựa cược bằng **FishCoin** (không phải AniCoin) — nhớ đổi tiền qua `n.bank` nếu chưa có FishCoin.

**Xem mình đang thắng/thua game nào nhiều:**
- `n.gamestats` — top thắng nhiều nhất
- `n.toplose` — top... thua nhiều nhất (đừng buồn, ai cũng có lúc đen 😄)

---

## 🐟 Câu Cá — Hoạt Động Chính Của Bot

Gõ `n.fishing` (hoặc `n.fish`, `n.f`) để bắt đầu. Mỗi lần câu tốn 10 FishCoin và có thời gian chờ giữa các lần câu.

### Câu cá cơ bản
```
n.fishing          → câu cá ngay (có animation GIF + bốc cá ngẫu nhiên)
```
Cá có 4 độ hiếm: ⚪ Thường, 🔵 Hiếm, 🟣 Quý hiếm, 🟡 Huyền thoại — hiếm thì giá càng cao!

### Cần câu & Mồi (đồ nghề câu cá)
| Lệnh | Mô tả |
|---|---|
| `n.fishing shop` | Xem cửa hàng cần câu + mồi |
| `n.fishing buy <tên> <số lượng>` | Mua cần câu hoặc mồi |
| `n.fishing setrod <tên cần>` | Đổi cần câu đang dùng |
| `n.fishing setbait <tên mồi>` | Đổi mồi đang dùng |

Cần câu/mồi tốt hơn = tỉ lệ câu được cá hiếm cao hơn. Cần câu cũng có độ bền, hết bền phải mua cái mới.

### Bán cá & xem giá
| Lệnh | Mô tả |
|---|---|
| `n.fishing sell <tên cá>` | Bán cá lấy FishCoin |
| `n.fishing price [tên cá]` | Xem giá cá hiện tại (giá dao động theo thời gian) |
| `n.fishing inventory` | Xem túi cá + đồ nghề câu cá |
| `n.fishing stats` | Xem thống kê: tổng số cá, tiền kiếm được, cá hiếm nhất từng câu |
| `n.fishing season` | Xem mùa câu cá hiện tại (ảnh hưởng tỉ lệ may mắn + cooldown) |

> 🍀 **Mẹo:** Mỗi mùa trong năm (xuân/hạ/thu/đông) có hệ số may mắn khác nhau — gõ `n.fishing season` để biết mùa hiện tại có lợi không.

---

## 🐠 FishCoin — Đồng Tiền Riêng Của Hệ Thống Cá

FishCoin tách biệt với AniCoin, dùng riêng cho câu cá, đấu cá, chợ cá...

| Muốn làm gì? | Gõ lệnh |
|---|---|
| Xem số dư FishCoin | `n.fishbalance` (hoặc `n.fc`) |
| Chuyển FishCoin cho người khác | `n.fishtransfer @người_nhận <số lượng>` |
| Xem top giàu FishCoin | `n.fishtop` |
| Đổi AniCoin → FishCoin | `n.bank ani <số tiền>` |
| Đổi FishCoin → AniCoin | `n.bank fish <số lượng>` |
| Xem tỉ lệ đổi hiện tại | `n.bank rates` |
| Xem thông tin ngân hàng (số dư cả 2 loại tiền) | `n.bank` |

### Rương Cá, Chợ Cá, Đấu Cá
| Lệnh | Mô tả |
|---|---|
| `n.fishbarn` | Rương cá — nơi lưu trữ/quản lý cá bạn đã câu được |
| `n.fishmarket` | Chợ cá — xem cá người khác rao bán, hoặc `n.fishmarket sell <fish_id> <giá>` để bán cá của mình |
| `n.fishbattle` | Đấu cá PvP với người chơi khác, dùng cá + kỹ năng + vũ khí |
| `n.skillshop` | Cửa hàng kỹ năng cho cá đấu |
| `n.weaponshop` | Cửa hàng vũ khí cho cá đấu (tăng sức mạnh/phòng thủ) |
| `n.pity` | Xem thông tin hệ thống "bảo hộ" — câu cá nhiều lần không ra huyền thoại sẽ được tăng tỉ lệ dần |

---

## 🏅 Danh Hiệu

Gõ `n.achievements` (hoặc `n.danhhieu`, `n.badge`) để xem danh hiệu bạn đang có.

Danh hiệu là phần thưởng cho Top server:
- 🏆 Top câu cá nhiều nhất
- 💰 Top FishCoin nhiều nhất
- ⚔️ Top đấu cá thắng nhiều nhất
- 🎖️ Danh hiệu đặc biệt do Admin trao

Nếu có nhiều hơn 1 danh hiệu, bạn có thể bấm nút chọn danh hiệu nào sẽ **hiển thị khi câu cá** — show off cho cả server thấy!

---

## 🏆 Giải Đấu (Tournament)

Gõ `n.tournament` để xem hướng dẫn đầy đủ, hoặc:

| Lệnh | Mô tả |
|---|---|
| `n.tournament list` | Xem các giải đấu đang mở |
| `n.tournament join <ID>` | Tham gia giải đấu (mất phí đăng ký, có cơ hội ăn giải thưởng) |
| `n.tournament info <ID>` | Xem chi tiết 1 giải đấu |

Giải đấu tự động bắt đầu/kết thúc theo thời gian admin đặt, người thắng được chọn ngẫu nhiên trong số người tham gia.

---

## ℹ️ Lệnh Tiện Ích

| Lệnh | Mô tả |
|---|---|
| `n.ping` | Xem độ trễ của bot |
| `n.uptime` | Bot đã chạy được bao lâu |
| `n.help` | Danh sách lệnh / hướng dẫn 1 lệnh cụ thể |

---

## Câu hỏi thường gặp

**Q: Tại sao `n.daily` báo "đã nhận hôm nay rồi"?**
A: Mỗi 24h chỉ điểm danh được 1 lần. Bot sẽ báo còn bao nhiêu giờ nữa mới nhận lại được.

**Q: AniCoin và FishCoin khác nhau thế nào?**
A: AniCoin dùng cho game cờ bạc, giao dịch chung. FishCoin chỉ dùng trong hệ thống câu cá (mua mồi/cần, đấu cá, chợ cá...). Dùng `n.bank` để đổi qua lại.

**Q: Câu cá mãi không ra huyền thoại, có bị "lừa" không?**
A: Không — có hệ thống **pity** (bảo hộ), câu cá nhiều lần liên tục mà không ra huyền thoại thì tỉ lệ sẽ tự tăng dần, đảm bảo sớm muộn cũng ra. Gõ `n.pity` để xem chi tiết.

**Q: Cần câu/mồi hết hạn thì sao?**
A: Cần câu có độ bền, hết bền sẽ tự gỡ — bot sẽ dùng cần/mồi cơ bản cho lần câu tiếp theo. Nhớ check `n.fishing inventory` để mua mới kịp thời.

**Q: Bị chặn không dùng được lệnh trong channel này?**
A: Admin server có thể giới hạn bot chỉ hoạt động ở 1 số channel nhất định — hỏi admin server nếu gặp tình huống này.
