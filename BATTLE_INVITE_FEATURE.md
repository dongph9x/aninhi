# Tính Năng Mời Đấu Cá (Battle Invite Feature)

## Tổng Quan
Tính năng mới cho phép người chơi mời người chơi khác đấu cá thay vì chỉ có thể tìm đối thủ ngẫu nhiên.

## Cách Sử Dụng

### Lệnh Mời Đấu Cá
```
n.fishbattle invite @người_chơi
```

### Ví Dụ
```
n.fishbattle invite @John
n.fishbattle invite @Alice#1234
```

## Tính Năng

### 1. Kiểm Tra Điều Kiện
- **Người mời**: Phải có ít nhất 1 cá trong túi đấu
- **Người được mời**: Phải có ít nhất 1 cá trong túi đấu
- **Daily Limit**: Cả hai người phải chưa đạt giới hạn đấu cá trong ngày (20 lần/ngày)
- **Không thể mời chính mình**

### 2. Giao Diện Lời Mời
- Hiển thị thông tin cá của người mời
- Hiển thị stats và sức mạnh của cá
- Thời gian hết hạn: 5 phút
- 2 nút: ✅ Chấp Nhận và ❌ Từ Chối

### 3. Xử Lý Phản Hồi
- **Chấp Nhận**: Bắt đầu trận đấu với animation đầy đủ
- **Từ Chối**: Hiển thị thông báo từ chối
- **Hết Hạn**: Tự động hủy lời mời sau 5 phút

### 4. Trận Đấu
- Sử dụng cá đầu tiên trong túi đấu của mỗi người
- Animation battle đầy đủ với visual system
- Kết quả chi tiết với HP và stats
- Phần thưởng FishCoin theo hệ thống hiện tại

## Bảo Mật & Giới Hạn

### 1. Chống Spam
- Không thể gửi nhiều lời mời cùng lúc cho cùng một người
- Lời mời tự động hết hạn sau 5 phút
- Kiểm tra daily battle limit trước khi bắt đầu đấu

### 2. Validation
- Kiểm tra người được mời có tồn tại không
- Kiểm tra cả hai người có cá để đấu không
- Kiểm tra daily limit cho cả hai người

### 3. Error Handling
- Thông báo lỗi rõ ràng cho từng trường hợp
- Fallback animation nếu visual system gặp lỗi
- Tự động dọn dẹp lời mời hết hạn

## Cập Nhật Help Command

Help command đã được cập nhật để bao gồm:
- Hướng dẫn sử dụng lệnh invite
- Thông tin về thời gian hết hạn
- Điều kiện cần thiết để mời đấu

## Cấu Trúc Code

### Interface BattleInvite
```typescript
interface BattleInvite {
    inviterId: string;
    inviterName: string;
    targetId: string;
    targetName: string;
    guildId: string;
    fishId: string;
    fishName: string;
    timestamp: number;
    messageId: string;
}
```

### Map Lưu Trữ
```typescript
const battleInvites = new Map<string, BattleInvite>();
```

### Function Chính
- `invitePlayerToBattle()`: Xử lý toàn bộ logic mời đấu
- Tích hợp với `FishBattleService` và `BattleVisualSystem` hiện có

## Tương Thích

- Hoàn toàn tương thích với hệ thống battle hiện tại
- Sử dụng cùng animation và visual system
- Không ảnh hưởng đến các tính năng battle khác
- Tích hợp với daily limit và cooldown system

## Lưu Ý Kỹ Thuật

1. **Memory Management**: Lời mời tự động được xóa khỏi memory sau khi xử lý
2. **Timeout Handling**: Sử dụng Discord.js MessageComponentCollector với timeout 5 phút
3. **Error Recovery**: Có fallback cho animation và error handling đầy đủ
4. **Performance**: Không ảnh hưởng đến performance của hệ thống hiện tại
