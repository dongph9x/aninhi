# 💾 Backup & Restore Database

Database thật của bot chỉ có **đúng 1 nơi duy nhất**: `data/database.db` (SQLite, theo `DATABASE_URL` trong `.env`). Không còn database "kép" ở `prisma/data/` — bản đó từng gây nhầm lẫn (backup/restore sai file) và đã bị bỏ.

> ⚠️ Luôn backup trước khi restore. Restore là hành động **ghi đè toàn bộ** dữ liệu hiện tại (balance, inventory, fishing data...), không thể hoàn tác nếu không có backup.

---

## Cách 1 — Dùng lệnh Discord (khuyến nghị, không cần SSH)

| Lệnh | Mô tả |
|---|---|
| `n.backupdb` | Tạo backup database hiện tại, lưu vào `data/backup/`. Gửi kèm file qua Discord nếu < 8MB |
| `n.listbackups` | Xem danh sách các file backup đã tạo (`data/backup/` + `temp/`) |
| `n.dbstatus` | Xem thông tin database: kích thước, số lượng records (users, transactions, fishing data...) |
| `n.syncdb` | Kiểm tra trạng thái database + danh sách backup. Có thêm `n.syncdb backup` / `n.syncdb list` |
| `n.restoredb` (alias `n.importdb`) | Restore database từ file `.db` đính kèm trong message |

**Quy trình restore qua Discord:**
1. Upload file backup `.db` lên Discord (đính kèm vào message)
2. Gõ `n.restoredb` trong cùng message đó
3. Bot tự backup database hiện tại trước (an toàn), rồi ghi đè bằng file bạn upload
4. **Restart container** để bot đọc dữ liệu mới (Prisma giữ connection/cache cũ):
   ```bash
   docker compose -f docker-compose.yml down
   docker compose -f docker-compose.yml up -d --build
   ```
5. Gõ `n.balance` để xác nhận dữ liệu đã đúng

Tất cả lệnh trên yêu cầu quyền **Administrator**.

---

## Cách 2 — Backup/restore trực tiếp trên VPS (SSH)

Vì `data/` được bind-mount từ host vào container (`./data:/app/data` trong `docker-compose.yml`), bạn **không cần `docker cp`** — chỉ cần copy file trực tiếp trên host.

### Backup
```bash
./scripts/backup-database.sh
# → lưu vào data/backup/database-<timestamp>.db, tự giữ 10 bản mới nhất
```
hoặc thủ công:
```bash
cp data/database.db data/backup/database-$(date +%Y%m%d-%H%M%S).db
```

### Restore
```bash
# Xem danh sách backup có sẵn
ls -la data/backup/

# Restore (script tự dừng bot, backup file hiện tại, ghi đè, rồi hỏi có khởi động lại không)
./scripts/restore-database.sh database-20260626-140000.db
```

### Backup khi database không phải bind-mount (trường hợp hiếm)
Nếu vì lý do nào đó `data/` không phải bind-mount (chạy bằng named volume), dùng `docker cp` để lấy file ra ngoài:
```bash
./scripts/backup-docker-db.sh
# → copy ra ./backup-from-docker/database-<timestamp>.db
```

---

## Kiểm tra tính toàn vẹn trước khi restore (đặc biệt quan trọng trên VPS)

Luôn kiểm tra file backup trước khi restore, để không vô tình phục hồi một file đã hỏng:

```bash
docker compose -f docker-compose.yml exec aninhi-bot sh -c \
  "apk add --no-cache sqlite && sqlite3 /app/data/database.db 'PRAGMA integrity_check;'"
```

Kết quả phải là `ok`. Nếu khác `ok` (liệt kê lỗi page/index...), **không restore file đó** — tìm bản backup gần nhất còn nguyên vẹn.

> `sqlite3` không có sẵn trong image (Alpine tối giản). Lệnh trên cài tạm trong container đang chạy, không cần rebuild, mất khi container restart.

---

## Lịch backup tự động (khuyến nghị cho VPS)

Thêm cron job trên VPS để backup định kỳ, độc lập với bot (không cần bot đang chạy):

```bash
crontab -e
```
Thêm dòng (backup mỗi ngày lúc 3h sáng):
```
0 3 * * * cd /root/aninhi && ./scripts/backup-database.sh >> /root/aninhi/logs/backup.log 2>&1
```

Script `backup-database.sh` tự động giữ lại 10 bản gần nhất và xoá bản cũ hơn, không cần dọn tay.

---

## Lưu ý quan trọng

- **Không sửa `data/database.db` trong lúc bot đang chạy** (đọc/viết cùng lúc dễ gây corrupt file SQLite) — luôn `docker compose down` trước khi restore thủ công qua SSH.
- **Sau khi restore, luôn restart container** — Prisma giữ connection/cache, không tự nhận file database bị thay ngầm dưới chân.
- File backup chứa toàn bộ dữ liệu thật của user (balance, FishCoin, inventory...) — coi như dữ liệu nhạy cảm, không chia sẻ công khai.
- Backup chỉ nằm trên cùng VPS — nếu VPS gặp sự cố nghiêm trọng (mất ổ cứng...), backup trong `data/backup/` cũng mất theo. Định kỳ tải backup ra ngoài VPS (rsync về máy khác, upload cloud storage...) nếu cần chống rủi ro mất toàn bộ server.
