import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { BankService } from '../../utils/bank-service';
import { fishCoinDB } from '../../utils/fish-coin';
import prisma from '../../utils/prisma';

export class BankUI {
  /**
   * Tạo embed thông tin ngân hàng chính
   */
  static createBankInfoEmbed(userId: string, guildId: string) {
    return new EmbedBuilder()
      .setTitle("🏦 Ngân Hàng Chuyển Đổi Tiền Tệ")
      .setDescription(
        "Chào mừng đến với Ngân Hàng! Bạn có thể chuyển đổi giữa AniCoin và FishCoin.\n\n" +
        "**📊 Tỷ Lệ Chuyển Đổi:**\n" +
        "• AniCoin → FishCoin: 1₳ = 0.5🐟 (Tối thiểu 1,000₳)\n" +
        "• FishCoin → AniCoin: 1🐟 = 1.5₳ (Tối thiểu 1,000🐟)\n\n" +
        "**💡 Sử Dụng:**\n" +
        "• Nhấn **Chuyển AniCoin** để đổi AniCoin sang FishCoin\n" +
        "• Nhấn **Chuyển FishCoin** để đổi FishCoin sang AniCoin\n" +
        "• Nhấn **Xem Tỷ Lệ** để xem chi tiết tỷ lệ chuyển đổi\n" +
        "• Nhấn **Lịch Sử** để xem giao dịch gần đây"
      )
      .setColor("#00ff00")
      .setTimestamp();
  }

  /**
   * Tạo các button cho bank UI
   */
  static createBankButtons() {
    const row1 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bank_exchange_ani')
          .setLabel('💰 Chuyển AniCoin')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('💱'),
        new ButtonBuilder()
          .setCustomId('bank_exchange_fish')
          .setLabel('🐟 Chuyển FishCoin')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('💱')
      );

    const row2 = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bank_rates')
          .setLabel('📊 Xem Tỷ Lệ')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📈'),
        new ButtonBuilder()
          .setCustomId('bank_history')
          .setLabel('📋 Lịch Sử')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('📜'),
        new ButtonBuilder()
          .setCustomId('bank_balance')
          .setLabel('💳 Số Dư')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('💳')
      );

    return [row1, row2];
  }

  /**
   * Tạo embed tỷ lệ chuyển đổi
   */
  static createRatesEmbed() {
    const rates = BankService.getExchangeRates();

    return new EmbedBuilder()
      .setTitle("📊 Tỷ Lệ Chuyển Đổi Tiền Tệ")
      .setDescription(
        "**🏦 Ngân Hàng Chuyển Đổi Tiền Tệ**\n\n" +
        "**💰 AniCoin → FishCoin:**\n" +
        `• Tối thiểu: ${rates.aniToFish.minAmount.toLocaleString()} AniCoin\n` +
        `• Nhận được: ${rates.aniToFish.fishReceived} FishCoin\n` +
        `• Tỷ lệ: 1₳ = ${rates.aniToFish.rate}🐟\n\n` +
        "**🐟 FishCoin → AniCoin:**\n" +
        `• Tối thiểu: ${rates.fishToAni.minAmount.toLocaleString()} FishCoin\n` +
        `• Nhận được: ${rates.fishToAni.aniReceived} AniCoin\n` +
        `• Tỷ lệ: 1🐟 = ${rates.fishToAni.rate}₳\n\n` +
        "**💡 Ví Dụ:**\n" +
        `• 2,000₳ → 1,000🐟\n` +
        `• 2,000🐟 → 3,000₳`
      )
      .setColor("#0099ff")
      .setTimestamp();
  }

  /**
   * Tạo embed số dư
   */
  static async createBalanceEmbed(userId: string, guildId: string) {
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });
    const fishBalance = await fishCoinDB.getFishBalance(userId, guildId);

    return new EmbedBuilder()
      .setTitle("💳 Số Dư Tài Khoản")
      .setDescription(
        `**💰 AniCoin:** ${Number(user?.balance || 0).toLocaleString()}₳\n` +
        `**🐟 FishCoin:** ${fishBalance.toString()}🐟\n\n` +
        "**💡 Gợi Ý Chuyển Đổi:**\n" +
        `• ${Number(user?.balance || 0) >= 1000 ? '✅' : '❌'} Có thể chuyển AniCoin sang FishCoin\n` +
        `• ${Number(fishBalance) >= 1000 ? '✅' : '❌'} Có thể chuyển FishCoin sang AniCoin`
      )
      .setColor("#00ff00")
      .setTimestamp();
  }

  /**
   * Tạo embed lịch sử giao dịch
   */
  static async createHistoryEmbed(userId: string, guildId: string) {
    const history = await BankService.getBankHistory(userId, guildId, 10);

    if (history.length === 0) {
      return new EmbedBuilder()
        .setTitle("📋 Lịch Sử Giao Dịch Ngân Hàng")
        .setDescription("Bạn chưa có giao dịch nào trong ngân hàng.")
        .setColor("#ffa500")
        .setTimestamp();
    }

    const historyText = history.map((tx, index) => {
      const amount = Number(tx.amount);
      const isPositive = tx.type === 'add';
      const sign = isPositive ? '+' : '-';
      const currency = tx.currency === 'AniCoin' ? '₳' : '🐟';
      
      return `${index + 1}. ${sign}${Math.abs(amount).toLocaleString()}${currency} - ${tx.description}`;
    }).join('\n');

    return new EmbedBuilder()
      .setTitle("📋 Lịch Sử Giao Dịch Ngân Hàng")
      .setDescription(
        `**10 giao dịch gần nhất:**\n\n${historyText}`
      )
      .setColor("#0099ff")
      .setTimestamp();
  }

  /**
   * Tạo select menu cho số tiền chuyển đổi
   */
  static createAmountSelectMenu(currency: 'AniCoin' | 'FishCoin') {
    const rates = BankService.getExchangeRates();
    const minAmount = currency === 'AniCoin' ? rates.aniToFish.minAmount : rates.fishToAni.minAmount;
    
    const amounts = [
      minAmount,
      minAmount * 2,
      minAmount * 5,
      minAmount * 10,
      minAmount * 20,
      minAmount * 50
    ];

    const options = amounts.map(amount => {
      const calculation = BankService.calculateExchange(currency, amount);
      const received = calculation.received;
      const targetCurrency = currency === 'AniCoin' ? '🐟' : '₳';
      
      return {
        label: `${amount.toLocaleString()} ${currency === 'AniCoin' ? '₳' : '🐟'} → ${received.toLocaleString()} ${targetCurrency}`,
        value: amount.toString(),
        description: `Chuyển ${amount.toLocaleString()} ${currency === 'AniCoin' ? 'AniCoin' : 'FishCoin'}`
      };
    });

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId(`bank_amount_${currency.toLowerCase()}`)
      .setPlaceholder(`Chọn số tiền ${currency === 'AniCoin' ? 'AniCoin' : 'FishCoin'} để chuyển đổi`)
      .addOptions(options);

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(selectMenu);

    return row;
  }

  /**
   * Tạo embed xác nhận chuyển đổi
   */
  static createConfirmEmbed(currency: 'AniCoin' | 'FishCoin', amount: number) {
    const calculation = BankService.calculateExchange(currency, amount);
    const targetCurrency = currency === 'AniCoin' ? 'FishCoin' : 'AniCoin';
    const targetSymbol = currency === 'AniCoin' ? '🐟' : '₳';
    const sourceSymbol = currency === 'AniCoin' ? '₳' : '🐟';

    return new EmbedBuilder()
      .setTitle("💱 Xác Nhận Chuyển Đổi")
      .setDescription(
        `**📊 Thông Tin Chuyển Đổi:**\n\n` +
        `💰 **Số tiền chuyển:** ${amount.toLocaleString()} ${sourceSymbol}\n` +
        `🎯 **Sẽ nhận được:** ${calculation.received.toLocaleString()} ${targetSymbol}\n` +
        `📈 **Tỷ lệ:** 1${sourceSymbol} = ${calculation.rate}${targetSymbol}\n\n` +
        `${calculation.isValid ? '✅ **Giao dịch hợp lệ**' : '❌ **Không đủ số tiền tối thiểu**'}`
      )
      .setColor(calculation.isValid ? "#00ff00" : "#ff0000")
      .setTimestamp();
  }

  /**
   * Tạo button xác nhận chuyển đổi
   */
  static createConfirmButtons(currency: 'AniCoin' | 'FishCoin', amount: number) {
    const calculation = BankService.calculateExchange(currency, amount);
    
    if (!calculation.isValid) {
      const row = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('bank_back')
            .setLabel('🔙 Quay Lại')
            .setStyle(ButtonStyle.Secondary)
        );
      return [row];
    }

    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`bank_confirm_${currency.toLowerCase()}_${amount}`)
          .setLabel('✅ Xác Nhận')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('bank_back')
          .setLabel('❌ Hủy')
          .setStyle(ButtonStyle.Danger)
      );

    return [row];
  }

  /**
   * Tạo embed kết quả chuyển đổi
   */
  static createResultEmbed(result: any, username: string) {
    const sourceSymbol = result.fromCurrency === 'AniCoin' ? '₳' : '🐟';
    const targetSymbol = result.toCurrency === 'AniCoin' ? '₳' : '🐟';

    return new EmbedBuilder()
      .setTitle("✅ Chuyển Đổi Thành Công!")
      .setDescription(
        `**${username}** đã chuyển đổi thành công!\n\n` +
        `${sourceSymbol} **Đã chuyển:** ${result.amount.toLocaleString()} ${result.fromCurrency}\n` +
        `${targetSymbol} **Nhận được:** ${result.received.toLocaleString()} ${result.toCurrency}\n` +
        `📊 **Tỷ lệ:** 1${sourceSymbol} = ${result.exchangeRate}${targetSymbol}`
      )
      .setColor("#00ff00")
      .setTimestamp();
  }

  /**
   * Tạo button quay lại
   */
  static createBackButton() {
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('bank_back')
          .setLabel('🔙 Quay Lại')
          .setStyle(ButtonStyle.Secondary)
      );

    return [row];
  }
} 