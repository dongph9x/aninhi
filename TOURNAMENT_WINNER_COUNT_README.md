# 🏆 Tournament Winner Count Feature

Thêm tính năng cho phép tùy chọn số lượng người nhận thưởng trong tournament.

## 🎯 Tính năng mới

### **Tùy chọn số lượng người nhận thưởng**
- Tournament có thể có nhiều người chiến thắng thay vì chỉ 1 người
- Giải thưởng sẽ được chia đều cho tất cả người chiến thắng
- Phần dư sẽ được cộng vào người chiến thắng đầu tiên

## 🔧 Cách sử dụng

### **Format lệnh mới:**
```bash
n.tournament create_<tên>_<mô tả>_<phí đăng ký>_<giải thưởng>_<số người tham gia>_<thời gian (phút)>_<số người nhận thưởng>
```

### **Ví dụ:**
```bash
# Tournament với 1 người nhận thưởng (mặc định)
n.tournament create_Giải đấu mùa hè_Giải đấu thường niên_1000_50000_8_30_1

# Tournament với 3 người nhận thưởng
n.tournament create_Giải đấu mùa hè_Giải đấu thường niên_1000_50000_8_30_3

# Tournament với 5 người nhận thưởng
n.tournament create_Giải đấu mùa hè_Giải đấu thường niên_1000_50000_8_30_5
```

### **Tham số mới:**
- **Số người nhận thưởng**: Số lượng người sẽ được chọn làm người chiến thắng
- **Mặc định**: 1 (nếu không chỉ định)
- **Giới hạn**: Phải >= 1 và <= số người tham gia

## 🔧 Các thay đổi kỹ thuật

### 1. **TournamentService Updates**

#### **startTournament()**
```typescript
// Trước
static async startTournament(tournamentId: string)

// Sau  
static async startTournament(tournamentId: string, winnerCount: number = 1)
```

#### **endTournament()**
```typescript
// Trước
static async endTournament(tournamentId: string, userId: string)

// Sau
static async endTournament(tournamentId: string, userId: string, winnerCount: number = 1)
```

### 2. **Logic chọn người chiến thắng**

```typescript
// Chọn số lượng winners
const actualWinnerCount = Math.min(winnerCount, participants.length);

// Shuffle participants và chọn winners
const shuffledParticipants = [...participants].sort(() => Math.random() - 0.5);
const winners = shuffledParticipants.slice(0, actualWinnerCount);

// Tính toán giải thưởng cho mỗi người
const prizePerWinner = Math.floor(Number(tournament.prizePool) / actualWinnerCount);
const remainingPrize = Number(tournament.prizePool) - (prizePerWinner * actualWinnerCount);

// Phát thưởng cho tất cả winners
for (let i = 0; i < winners.length; i++) {
    let prize = prizePerWinner;
    // Người đầu tiên nhận thêm phần dư
    if (i === 0) {
        prize += remainingPrize;
    }
    
    await EcommerceService.addMoney(
        winners[i].userId, 
        tournament.guildId, 
        prize, 
        `Tournament win - ${tournament.name} (${i + 1}/${actualWinnerCount})`
    );
}
```

### 3. **Global Storage cho WinnerCount**

```typescript
// Global storage cho winnerCount của tournaments
const tournamentWinnerCounts = new Map<string, number>();

// Lưu winnerCount khi tạo tournament
tournamentWinnerCounts.set(tournament.id, winnerCount);

// Sử dụng khi kết thúc tournament
const winnerCount = tournamentWinnerCounts.get(tournamentId) || 1;
```

### 4. **Cập nhật Embed Messages**

#### **Tournament Creation**
```typescript
// Thêm thông tin về số người nhận thưởng
if (winnerCount > 1) {
    const prizePerWinner = Math.floor(prizePool / winnerCount);
    embed.addFields({
        name: "🏆 Thông tin giải thưởng",
        value: `Số người nhận thưởng: **${winnerCount}**\nGiải thưởng mỗi người: **${prizePerWinner.toLocaleString()}** AniCoin`,
        inline: false
    });
}
```

#### **Tournament End Notification**
```typescript
if (result.winners.length === 1) {
    description += `👑 **Người chiến thắng:** <@${result.winners[0].userId}>\n💰 **Giải thưởng:** ${tournament.prizePool} AniCoin`;
} else {
    description += `🏆 **Người chiến thắng (${result.winners.length}):**\n`;
    result.winners.forEach((winner: any, index: number) => {
        const prize = index === 0 ? result.prizePerWinner + (Number(tournament.prizePool) - (result.prizePerWinner * result.winners.length)) : result.prizePerWinner;
        description += `${index + 1}. <@${winner.userId}> - ${prize.toLocaleString()} AniCoin\n`;
    });
}
```

## 📋 Files đã cập nhật

### **`src/utils/tournament.ts`**
1. **TournamentData interface**: Thêm `winnerCount?: number`
2. **startTournament()**: Thêm parameter `winnerCount` và logic chọn nhiều winners
3. **endTournament()**: Thêm parameter `winnerCount` và logic chọn nhiều winners
4. **Logic chia giải thưởng**: Tính toán prize per winner và remaining prize

### **`src/commands/text/ecommerce/tournament.ts`**
1. **createHelpEmbed()**: Cập nhật hướng dẫn với tham số mới
2. **createTournament()**: Thêm parsing cho winnerCount parameter
3. **Global storage**: Thêm `tournamentWinnerCounts` Map để lưu trữ
4. **startTournament()**: Sử dụng winnerCount từ storage
5. **endTournament()**: Sử dụng winnerCount từ storage
6. **Embed updates**: Hiển thị thông tin giải thưởng cho multiple winners

## ✅ Kết quả

### **Test Cases đã pass:**

1. **Tournament với 1 winner (default)**
   - ✅ Tạo tournament thành công
   - ✅ Chọn 1 người chiến thắng
   - ✅ Phát thưởng đúng

2. **Tournament với 3 winners**
   - ✅ Tạo tournament thành công
   - ✅ Chọn 3 người chiến thắng
   - ✅ Chia giải thưởng đều (500 AniCoin mỗi người)
   - ✅ Phát thưởng đúng

3. **Tournament với nhiều winners hơn participants**
   - ✅ Tự động điều chỉnh số winners = số participants
   - ✅ Chia giải thưởng đều
   - ✅ Phát thưởng đúng

4. **Kiểm tra balance**
   - ✅ Winners nhận đúng số tiền
   - ✅ Balance được cập nhật chính xác

## 🎮 Cách sử dụng thực tế

### **Ví dụ 1: Tournament nhỏ (1 winner)**
```bash
n.tournament create_Tournament nhỏ_Test tournament nhỏ_100_1000_4_10_1
```
- Phí đăng ký: 100 AniCoin
- Giải thưởng: 1000 AniCoin
- Số người tham gia: 4
- Thời gian: 10 phút
- Số người nhận thưởng: 1

### **Ví dụ 2: Tournament trung bình (3 winners)**
```bash
n.tournament create_Tournament trung_Test tournament trung_500_5000_8_30_3
```
- Phí đăng ký: 500 AniCoin
- Giải thưởng: 5000 AniCoin
- Số người tham gia: 8
- Thời gian: 30 phút
- Số người nhận thưởng: 3
- Giải thưởng mỗi người: 1666 AniCoin (1666 + 1666 + 1668)

### **Ví dụ 3: Tournament lớn (5 winners)**
```bash
n.tournament create_Tournament lớn_Test tournament lớn_1000_10000_10_60_5
```
- Phí đăng ký: 1000 AniCoin
- Giải thưởng: 10000 AniCoin
- Số người tham gia: 10
- Thời gian: 60 phút
- Số người nhận thưởng: 5
- Giải thưởng mỗi người: 2000 AniCoin

## 🚀 Lưu ý

1. **Tương thích ngược**: Các tournament cũ vẫn hoạt động bình thường (mặc định 1 winner)
2. **Validation**: Số người nhận thưởng phải >= 1 và <= số người tham gia
3. **Random selection**: Người chiến thắng được chọn ngẫu nhiên
4. **Prize distribution**: Giải thưởng chia đều, phần dư cho người đầu tiên
5. **Notification**: Thông báo hiển thị đầy đủ danh sách winners và giải thưởng

## 🔮 Tương lai

- Có thể thêm các loại tournament khác (team tournament, elimination tournament)
- Thêm hệ thống ranking cho tournament
- Thêm tournament history và statistics
- Thêm tournament categories (daily, weekly, monthly) 