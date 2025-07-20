# 🎰 Roulette Animation System

Hệ thống animation cho lệnh roulette, tạo hiệu ứng quay số thú vị và hấp dẫn.

## 🎯 Tính năng Animation

### 🎲 **Animation Sequence**
1. **Bước 1-6**: Quay số ngẫu nhiên (6 lần)
2. **Bước 7**: Chuẩn bị kết quả
3. **Bước 8**: Hiển thị kết quả cuối cùng

### ⏱️ **Timing**
- **Delay giữa các bước**: 800ms
- **Tổng thời gian animation**: ~6.4 giây
- **Số bước animation**: 8 bước

### 🎨 **Visual Effects**
- **Màu sắc động**: Thay đổi theo số quay
- **Emoji động**: 🔴⚫🟢 theo màu số
- **Text động**: "Đang quay roulette..." → "Chuẩn bị kết quả..." → Kết quả cuối

## 🔧 Technical Implementation

### 📝 **New Functions**

#### 1. `createRouletteAnimationEmbed()`
```typescript
function createRouletteAnimationEmbed(
    message: Message,
    betType: string,
    betValue: number | null,
    betAmount: number,
    spinningNumber: number,
    isSpinning: boolean = true
): EmbedBuilder
```

**Chức năng:**
- Tạo embed cho animation
- Hiển thị số đang quay với màu sắc
- Text động theo trạng thái

#### 2. `getRandomRouletteNumber()`
```typescript
function getRandomRouletteNumber(): number
```

**Chức năng:**
- Tạo số ngẫu nhiên 0-36 cho animation
- Không ảnh hưởng đến kết quả thật

### 🎮 **Animation Flow**

```typescript
// 1. Tạo embed ban đầu
const initialEmbed = createRouletteAnimationEmbed(message, betType, betValue, betAmount, getRandomRouletteNumber(), true);
const messageSent = await message.reply({ embeds: [initialEmbed] });

// 2. Animation loop (6 bước)
for (let i = 0; i < 6; i++) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const spinningNumber = getRandomRouletteNumber();
    const spinningEmbed = createRouletteAnimationEmbed(message, betType, betValue, betAmount, spinningNumber, true);
    await messageSent.edit({ embeds: [spinningEmbed] });
}

// 3. Chuẩn bị kết quả
await new Promise(resolve => setTimeout(resolve, 800));
const preparingEmbed = createRouletteAnimationEmbed(message, betType, betValue, betAmount, getRandomRouletteNumber(), false);
await messageSent.edit({ embeds: [preparingEmbed] });

// 4. Hiển thị kết quả cuối
await new Promise(resolve => setTimeout(resolve, 800));
const finalEmbed = createRouletteEmbed(message, betType, betValue, betAmount, result, won, winnings);
await messageSent.edit({ embeds: [finalEmbed] });
```

## 🎨 Visual Design

### 🎯 **Animation Embed**
```
🎰 Roulette

TestUser

🎯 Cược: Đỏ
💰 Số tiền: 1,000 AniCoin
🎲 Đang quay: 🔴 15

🎰 Đang quay roulette... 🎰
```

### 🎯 **Preparing Embed**
```
🎰 Roulette

TestUser

🎯 Cược: Đỏ
💰 Số tiền: 1,000 AniCoin
🎲 Đang quay: ⚫ 22

⏳ Chuẩn bị kết quả... ⏳
```

### 🎯 **Final Result Embed**
```
🎰 Roulette

TestUser

🎯 Cược: Đỏ
💰 Số tiền: 1,000 AniCoin
🎲 Kết quả: 🔴 19

🎉 THẮNG! +1,000 AniCoin
```

## 🚀 Cách sử dụng

### 📋 **Lệnh cơ bản**
```bash
n.roulette red 1000
n.roulette black 500
n.roulette even 200
n.roulette 7 100
```

### 🎲 **Các loại cược**
- **Màu**: `red`, `black`
- **Chẵn/Lẻ**: `even`, `odd`
- **Thấp/Cao**: `low` (1-18), `high` (19-36)
- **Số**: `0-36`
- **Cột**: `column1`, `column2`, `column3`
- **Hàng**: `dozen1`, `dozen2`, `dozen3`

### 💰 **Bet "all"**
```bash
n.roulette red all
```

## ⚙️ Configuration

### 🔧 **Animation Settings**
```typescript
const animationSteps = 8;     // Số bước animation
const stepDelay = 800;        // Delay giữa các bước (ms)
const spinningSteps = 6;      // Số bước quay ngẫu nhiên
```

### 🎨 **Color Mapping**
```typescript
// Số đỏ: 1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36
// Số đen: 2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35
// Số xanh: 0
```

## 🧪 Testing

### ✅ **Test Results**
```
🎰 Testing Roulette Animation...

✅ Created test user with 10,000 coins

🎲 Testing roulette functions...
✅ Random numbers generated: [8, 36, 15, 18, 12, 11, 35, 15, 33, 4]
✅ Colors for numbers: ['8:black', '36:red', '15:black', '18:red', ...]

📊 Testing game stats recording...
✅ Game stats recorded successfully

💰 Testing balance operations...
✅ Initial balance: 10,000 coins
✅ Bet amount subtracted
✅ Win amount added
✅ Final balance: 10,100 coins

🎉 All roulette animation tests passed!
```

## 🎯 Benefits

### 🎮 **User Experience**
- **Hấp dẫn hơn**: Animation tạo cảm giác thú vị
- **Suspense**: Tăng độ hồi hộp chờ kết quả
- **Realistic**: Giống roulette thật

### 🔧 **Technical**
- **Smooth**: Animation mượt mà, không lag
- **Responsive**: Tự động điều chỉnh theo Discord
- **Error handling**: Xử lý lỗi tốt

### 📊 **Performance**
- **Efficient**: Chỉ edit message, không spam
- **Memory safe**: Cleanup sau khi hoàn thành
- **Rate limit friendly**: Không vượt quá Discord limits

## 🔮 Future Enhancements

### 🎨 **Visual Improvements**
- **Sound effects**: Thêm emoji âm thanh
- **Particle effects**: Hiệu ứng pháo hoa khi thắng
- **3D animation**: Emoji 3D cho roulette

### ⚙️ **Customization**
- **Speed control**: Cho phép điều chỉnh tốc độ
- **Animation style**: Nhiều kiểu animation khác nhau
- **Skip option**: Bỏ qua animation cho người dùng VIP

### 🎯 **Gamification**
- **Streak bonus**: Thưởng cho chuỗi thắng
- **Achievement**: Badge cho số lần chơi
- **Leaderboard**: Top roulette players

## 📝 Notes

1. **Animation không ảnh hưởng kết quả**: Kết quả được tính trước, animation chỉ để hiển thị
2. **Cooldown**: Vẫn có cooldown 5 giây giữa các lần chơi
3. **Error handling**: Nếu có lỗi, sẽ hiển thị kết quả ngay lập tức
4. **Mobile friendly**: Animation hoạt động tốt trên mobile
5. **Accessibility**: Text rõ ràng cho người khiếm thị 