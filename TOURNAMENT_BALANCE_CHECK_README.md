# 🏆 Tournament Balance Check Feature

## 🔍 Vấn Đề Đã Phát Hiện

**Vấn đề:** Người dùng có thể tạo tournament mà không cần có đủ tiền để trả giải thưởng.

**Yêu cầu:** 
- Người tạo tournament phải có đủ tiền để trả giải thưởng
- Tiền giải thưởng sẽ được trừ ngay khi tạo tournament
- Nếu không có đủ người tham gia, tiền sẽ được trả lại cho người tạo

## ✅ Giải Pháp Đã Áp Dụng

### 1. **Kiểm Tra Số Dư Khi Tạo Tournament**
- **Trước:** Không kiểm tra số dư khi tạo tournament
- **Sau:** Kiểm tra số dư phải >= giải thưởng trước khi tạo

### 2. **Trừ Tiền Giải Thưởng**
- **Trước:** Không trừ tiền khi tạo tournament
- **Sau:** Trừ tiền giải thưởng ngay khi tạo tournament thành công

### 3. **Hoàn Tiền Khi Không Đủ Người Tham Gia**
- **Trước:** Tiền bị mất khi không có ai tham gia
- **Sau:** Trả lại tiền cho người tạo khi không đủ người tham gia

## 🔧 Thay Đổi Chi Tiết

### 1. **src/utils/tournament.ts - createTournament()**
```typescript
// TRƯỚC
static async createTournament(data: TournamentData) {
    const tournament = await prisma.tournament.create({
        data: { ...data, status: "registration", currentParticipants: 0 }
    });
    return tournament;
}

// SAU
static async createTournament(data: TournamentData) {
    // Kiểm tra số dư của người tạo tournament
    const balance = await EcommerceService.getBalance(data.createdBy, data.guildId);
    if (balance < data.prizePool) {
        throw new Error(`Không đủ tiền để tạo tournament! Cần ${data.prizePool.toLocaleString()} AniCoin để trả giải thưởng, số dư: ${balance.toLocaleString()} AniCoin`);
    }

    const tournament = await prisma.tournament.create({
        data: { ...data, status: "registration", currentParticipants: 0 }
    });

    // Trừ tiền giải thưởng từ người tạo tournament
    await EcommerceService.subtractMoney(data.createdBy, data.guildId, data.prizePool, `Tournament prize pool - ${data.name}`);

    return tournament;
}
```

### 2. **src/utils/tournament.ts - startTournament()**
```typescript
// TRƯỚC
if (tournament.currentParticipants < 2) {
    throw new Error("Cần ít nhất 2 người tham gia để bắt đầu");
}

// SAU
if (tournament.currentParticipants < 2) {
    // Không đủ người tham gia, trả lại tiền cho người tạo
    await EcommerceService.addMoney(
        tournament.createdBy,
        tournament.guildId,
        Number(tournament.prizePool),
        `Tournament refund - ${tournament.name} (insufficient participants)`
    );

    // Cập nhật tournament thành completed
    await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "completed" }
    });

    throw new Error("INSUFFICIENT_PARTICIPANTS");
}
```

### 3. **src/utils/tournament.ts - endTournament()**
```typescript
// TRƯỚC
if (participants.length === 0) {
    // Không có ai tham gia, hủy tournament
    await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "completed" }
    });
    return null;
}

// SAU
if (participants.length === 0) {
    // Không có ai tham gia, trả lại tiền cho người tạo và hủy tournament
    await EcommerceService.addMoney(
        tournament.createdBy,
        tournament.guildId,
        Number(tournament.prizePool),
        `Tournament refund - ${tournament.name} (no participants)`
    );

    await prisma.tournament.update({
        where: { id: tournamentId },
        data: { status: "completed" }
    });
    return null;
}
```

### 4. **src/utils/tournament.ts - forceEndTournament()**
```typescript
// TRƯỚC
let winner = null;
if (tournament.participants.length > 0) {
    winner = tournament.participants[Math.floor(Math.random() * tournament.participants.length)];
}

// SAU
let winner = null;
if (tournament.participants.length > 0) {
    winner = tournament.participants[Math.floor(Math.random() * tournament.participants.length)];
    
    // Phát thưởng cho người chiến thắng
    await EcommerceService.addMoney(
        winner.userId,
        tournament.guildId,
        Number(tournament.prizePool),
        `Tournament force end win - ${tournament.name}`
    );
} else {
    // Không có ai tham gia, trả lại tiền cho người tạo
    await EcommerceService.addMoney(
        tournament.createdBy,
        tournament.guildId,
        Number(tournament.prizePool),
        `Tournament force end refund - ${tournament.name} (no participants)`
    );
}
```

## 🎮 Cách Hoạt Động

### **Khi Tạo Tournament:**
1. Kiểm tra số dư người tạo >= giải thưởng
2. Nếu đủ tiền: Trừ tiền giải thưởng và tạo tournament
3. Nếu không đủ tiền: Báo lỗi và không tạo tournament

### **Khi Tournament Kết Thúc:**
1. **Có người tham gia:** Phát thưởng cho người chiến thắng
2. **Không có người tham gia:** Trả lại tiền cho người tạo
3. **Không đủ người tham gia (ít hơn 2):** Trả lại tiền cho người tạo

### **Khi Force End Tournament:**
1. **Có người tham gia:** Phát thưởng cho người chiến thắng ngẫu nhiên
2. **Không có người tham gia:** Trả lại tiền cho người tạo

## 🧪 Test Cases

### **Test 1: Tạo Tournament Không Đủ Tiền**
```bash
# User có 100 AniCoin, tạo tournament giải thưởng 1000 AniCoin
# Kết quả: Lỗi "Không đủ tiền để tạo tournament"
```

### **Test 2: Tạo Tournament Đủ Tiền**
```bash
# User có 2000 AniCoin, tạo tournament giải thưởng 1000 AniCoin
# Kết quả: Tournament được tạo, balance còn 1000 AniCoin
```

### **Test 3: Tournament Không Đủ Người Tham Gia**
```bash
# Tournament có 1 người tham gia, cần ít nhất 2 người
# Kết quả: Trả lại tiền cho người tạo, tournament kết thúc
```

### **Test 4: Tournament Không Có Ai Tham Gia**
```bash
# Tournament không có ai tham gia
# Kết quả: Trả lại tiền cho người tạo, tournament kết thúc
```

## 🚀 Lợi Ích

1. **Ngăn chặn spam tournament:** Người dùng không thể tạo tournament mà không có tiền
2. **Bảo vệ người tạo:** Tiền được trả lại khi không có ai tham gia
3. **Công bằng:** Người tạo phải có trách nhiệm tài chính
4. **Minh bạch:** Tất cả giao dịch tiền đều được ghi lại

## 🔮 Tương Lai

- Có thể thêm phí tạo tournament (không chỉ trừ giải thưởng)
- Thêm hệ thống đặt cọc tournament
- Thêm tính năng hủy tournament với phí hủy
