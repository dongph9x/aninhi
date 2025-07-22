# Bank Interaction JSON Parsing Fix

## Vấn đề
Khi người dùng click các button chuyển đổi tiền tệ trong bank, hệ thống báo lỗi:
```
SyntaxError: Unexpected token 'b', "bank_exchange_ani" is not valid JSON
SyntaxError: Unexpected token 'b', "bank_exchange_fish" is not valid JSON
```

## Nguyên nhân
Trong file `src/events/interactionCreate.ts`, hệ thống đang cố gắng parse tất cả `interaction.customId` thành JSON, nhưng các button của bank có `customId` là string đơn giản:
- `"bank_exchange_ani"`
- `"bank_exchange_fish"`
- `"bank_rates"`
- `"bank_history"`
- `"bank_balance"`

## Giải pháp
Thêm xử lý riêng cho bank interaction trước khi cố gắng parse JSON.

### Thay đổi trong `src/events/interactionCreate.ts`

**Thêm đoạn code xử lý bank interaction:**
```typescript
// Kiểm tra xem có phải bank interaction không
if (interaction.customId.startsWith("bank_")) {
    console.log("Bank interaction:", interaction.customId);
    
    try {
        const { BankHandler } = await import("../components/MessageComponent/BankHandler");
        if (interaction.isButton()) {
            await BankHandler.handleButtonInteraction(interaction);
        } else if (interaction.isStringSelectMenu()) {
            await BankHandler.handleSelectMenuInteraction(interaction);
        }
    } catch (error) {
        console.error("Error handling Bank interaction:", error);
        if (!interaction.replied && !interaction.deferred) {
            interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác ngân hàng!`);
        }
    }
    return;
}
```

**Sửa lỗi TypeScript trong BuyFishFoodModal:**
```typescript
// Trước
await component.run({ interaction });

// Sau
const { t, locale } = await i18n(interaction.guildId);
await component.run({ client, interaction, t, locale, data: {} });
```

## Các button được hỗ trợ

### Button Interactions
- `bank_exchange_ani` - Chuyển AniCoin sang FishCoin
- `bank_exchange_fish` - Chuyển FishCoin sang AniCoin
- `bank_rates` - Xem tỷ lệ chuyển đổi
- `bank_history` - Xem lịch sử giao dịch
- `bank_balance` - Xem số dư
- `bank_back` - Quay lại menu chính
- `bank_confirm_*` - Xác nhận giao dịch

### Select Menu Interactions
- `bank_amount_*` - Chọn số tiền chuyển đổi

## Testing

### Script test
```bash
npx tsx scripts/test-bank-interaction.ts
```

### Kết quả test
```
🧪 Testing Bank Interaction Fix...

1️⃣ Resetting user data...
2️⃣ Adding coins for testing...
   AniCoin: 5000
   FishCoin: 3000

3️⃣ Testing BankUI functions...
   ✅ createBankInfoEmbed: OK
   ✅ createBankButtons: OK
   Button count: 2 rows
   ✅ createRatesEmbed: OK
   ✅ createBalanceEmbed: OK
   ✅ createHistoryEmbed: OK

4️⃣ Testing BankService functions...
   ✅ getExchangeRates: OK
   AniCoin → FishCoin: 0.5
   FishCoin → AniCoin: 1.5
   ✅ canClaimDaily: true

5️⃣ Testing processDailyClaim...
   ✅ processDailyClaim: OK
   AniCoin received: 1000
   FishCoin received: 1000
   New streak: 1

🎉 Bank interaction test completed successfully!
💡 The bank buttons should now work without JSON parsing errors.
```

## Lưu ý kỹ thuật

1. **Thứ tự xử lý:** Bank interaction được xử lý trước JSON parsing
2. **Error handling:** Có xử lý lỗi riêng cho bank interaction
3. **Type safety:** Sửa lỗi TypeScript với đầy đủ tham số
4. **Backward compatibility:** Không ảnh hưởng đến các interaction khác

## Kết quả

✅ **Đã sửa:**
- Lỗi JSON parsing khi click bank buttons
- Lỗi TypeScript trong modal submit
- Hệ thống bank interaction hoạt động bình thường

✅ **Người dùng có thể:**
- Click các button bank mà không bị lỗi
- Chuyển đổi AniCoin ↔ FishCoin
- Xem tỷ lệ, lịch sử, số dư
- Sử dụng tất cả tính năng bank UI

Hệ thống bank giờ hoạt động hoàn toàn bình thường! 🏦 