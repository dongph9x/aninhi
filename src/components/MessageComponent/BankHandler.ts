import { ButtonInteraction, StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';
import { BankUI } from './BankUI';
import { BankService } from '../../utils/bank-service';
import { fishCoinDB } from '../../utils/fish-coin';
import prisma from '../../utils/prisma';

export class BankHandler {
  /**
   * Xử lý button interaction
   */
  static async handleButtonInteraction(interaction: ButtonInteraction) {
    const customId = interaction.customId;

    try {
      await interaction.deferUpdate();

      switch (customId) {
        case 'bank_exchange_ani':
          await this.handleExchangeAni(interaction);
          break;
        case 'bank_exchange_fish':
          await this.handleExchangeFish(interaction);
          break;
        case 'bank_rates':
          await this.handleRates(interaction);
          break;
        case 'bank_history':
          await this.handleHistory(interaction);
          break;
        case 'bank_balance':
          await this.handleBalance(interaction);
          break;
        case 'bank_back':
          await this.handleBack(interaction);
          break;
        default:
          if (customId.startsWith('bank_confirm_')) {
            await this.handleConfirm(interaction);
          } else {
            await interaction.followUp({ content: '❌ Lệnh không hợp lệ!', ephemeral: true });
          }
      }
    } catch (error) {
      console.error('Error handling bank button interaction:', error);
      await interaction.followUp({ 
        content: '❌ Đã xảy ra lỗi! Vui lòng thử lại sau.', 
        ephemeral: true 
      });
    }
  }

  /**
   * Xử lý select menu interaction
   */
  static async handleSelectMenuInteraction(interaction: StringSelectMenuInteraction) {
    const customId = interaction.customId;

    try {
      await interaction.deferUpdate();

      if (customId.startsWith('bank_amount_')) {
        await this.handleAmountSelect(interaction);
      } else {
        await interaction.followUp({ content: '❌ Lệnh không hợp lệ!', ephemeral: true });
      }
    } catch (error) {
      console.error('Error handling bank select menu interaction:', error);
      await interaction.followUp({ 
        content: '❌ Đã xảy ra lỗi! Vui lòng thử lại sau.', 
        ephemeral: true 
      });
    }
  }

  /**
   * Xử lý chuyển AniCoin
   */
  private static async handleExchangeAni(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
      .setTitle("💰 Chuyển AniCoin Sang FishCoin")
      .setDescription("Chọn số tiền AniCoin bạn muốn chuyển đổi:")
      .setColor("#0099ff")
      .setTimestamp();

    const selectMenu = BankUI.createAmountSelectMenu('AniCoin');
    const backButton = BankUI.createBackButton();

    await interaction.editReply({
      embeds: [embed],
      components: [selectMenu, ...backButton]
    });
  }

  /**
   * Xử lý chuyển FishCoin
   */
  private static async handleExchangeFish(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
      .setTitle("🐟 Chuyển FishCoin Sang AniCoin")
      .setDescription("Chọn số tiền FishCoin bạn muốn chuyển đổi:")
      .setColor("#0099ff")
      .setTimestamp();

    const selectMenu = BankUI.createAmountSelectMenu('FishCoin');
    const backButton = BankUI.createBackButton();

    await interaction.editReply({
      embeds: [embed],
      components: [selectMenu, ...backButton]
    });
  }

  /**
   * Xử lý xem tỷ lệ
   */
  private static async handleRates(interaction: ButtonInteraction) {
    const embed = BankUI.createRatesEmbed();
    const backButton = BankUI.createBackButton();

    await interaction.editReply({
      embeds: [embed],
      components: backButton
    });
  }

  /**
   * Xử lý xem lịch sử
   */
  private static async handleHistory(interaction: ButtonInteraction) {
    const embed = await BankUI.createHistoryEmbed(interaction.user.id, interaction.guildId!);
    const backButton = BankUI.createBackButton();

    await interaction.editReply({
      embeds: [embed],
      components: backButton
    });
  }

  /**
   * Xử lý xem số dư
   */
  private static async handleBalance(interaction: ButtonInteraction) {
    const embed = await BankUI.createBalanceEmbed(interaction.user.id, interaction.guildId!);
    const backButton = BankUI.createBackButton();

    await interaction.editReply({
      embeds: [embed],
      components: backButton
    });
  }

  /**
   * Xử lý quay lại
   */
  private static async handleBack(interaction: ButtonInteraction) {
    const embed = BankUI.createBankInfoEmbed(interaction.user.id, interaction.guildId!);
    const buttons = BankUI.createBankButtons();

    await interaction.editReply({
      embeds: [embed],
      components: buttons
    });
  }

  /**
   * Xử lý chọn số tiền
   */
  private static async handleAmountSelect(interaction: StringSelectMenuInteraction) {
    const customId = interaction.customId;
    const selectedValue = interaction.values[0];
    const amount = parseInt(selectedValue);

    if (isNaN(amount)) {
      await interaction.followUp({ content: '❌ Số tiền không hợp lệ!', ephemeral: true });
      return;
    }

    let currency: 'AniCoin' | 'FishCoin';
    if (customId === 'bank_amount_anicoin') {
      currency = 'AniCoin';
    } else if (customId === 'bank_amount_fishcoin') {
      currency = 'FishCoin';
    } else {
      await interaction.followUp({ content: '❌ Loại tiền tệ không hợp lệ!', ephemeral: true });
      return;
    }

    const embed = BankUI.createConfirmEmbed(currency, amount);
    const buttons = BankUI.createConfirmButtons(currency, amount);

    await interaction.editReply({
      embeds: [embed],
      components: buttons
    });
  }

  /**
   * Xử lý xác nhận chuyển đổi
   */
  private static async handleConfirm(interaction: ButtonInteraction) {
    const customId = interaction.customId;
    const parts = customId.split('_');
    
    if (parts.length < 4) {
      await interaction.followUp({ content: '❌ Thông tin không hợp lệ!', ephemeral: true });
      return;
    }

    const currency = parts[2] === 'anicoin' ? 'AniCoin' : 'FishCoin';
    const amount = parseInt(parts[3]);

    if (isNaN(amount)) {
      await interaction.followUp({ content: '❌ Số tiền không hợp lệ!', ephemeral: true });
      return;
    }

    try {
      let result;
      if (currency === 'AniCoin') {
        result = await BankService.exchangeAniToFish(interaction.user.id, interaction.guildId!, amount);
      } else {
        result = await BankService.exchangeFishToAni(interaction.user.id, interaction.guildId!, amount);
      }

      if (!result.success) {
        const errorEmbed = new EmbedBuilder()
          .setTitle("❌ Chuyển Đổi Thất Bại")
          .setDescription(result.error)
          .setColor("#ff0000")
          .setTimestamp();

        const backButton = BankUI.createBackButton();

        await interaction.editReply({
          embeds: [errorEmbed],
          components: backButton
        });
        return;
      }

      // Lấy balance mới
      const user = await prisma.user.findUnique({
        where: { userId_guildId: { userId: interaction.user.id, guildId: interaction.guildId! } }
      });
      const fishBalance = await fishCoinDB.getFishBalance(interaction.user.id, interaction.guildId!);

      const resultEmbed = BankUI.createResultEmbed(result, interaction.user.username);
      resultEmbed.addFields({
        name: '💳 Số Dư Mới',
        value: `• AniCoin: ${Number(user?.balance || 0).toLocaleString()}₳\n• FishCoin: ${fishBalance.toString()}🐟`,
        inline: false
      });

      const backButton = BankUI.createBackButton();

      await interaction.editReply({
        embeds: [resultEmbed],
        components: backButton
      });

    } catch (error) {
      console.error('Error in bank exchange:', error);
      const errorEmbed = new EmbedBuilder()
        .setTitle("❌ Lỗi Hệ Thống")
        .setDescription("Đã xảy ra lỗi khi chuyển đổi tiền tệ. Vui lòng thử lại sau!")
        .setColor("#ff0000")
        .setTimestamp();

      const backButton = BankUI.createBackButton();

      await interaction.editReply({
        embeds: [errorEmbed],
        components: backButton
      });
    }
  }
} 