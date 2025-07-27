import { ButtonInteraction, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder } from 'discord.js';
import { FishBattleService } from '../../utils/fish-battle';

export class AchievementImportHandler {
  static async handleInteraction(interaction: ButtonInteraction) {
    const customId = interaction.customId;
    
    if (!interaction.guildId || !interaction.user) {
      return interaction.reply({ content: '❌ Lỗi: Không tìm thấy thông tin server hoặc user!', ephemeral: true });
    }

    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
      // Kiểm tra quyền admin
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId, interaction.client);
      if (!isAdmin) {
        return interaction.reply({ content: '❌ Bạn không có quyền sử dụng tính năng này!', ephemeral: true });
      }

      switch (customId) {
        case 'achievement_add':
          await this.handleAddAchievement(interaction);
          break;
          
        case 'achievement_list':
          await this.handleListAchievements(interaction);
          break;
          
        case 'achievement_manage':
          await this.handleManageAchievements(interaction);
          break;
          
        case 'achievement_help':
          await this.handleHelp(interaction);
          break;
          
        case 'achievement_close':
          await this.handleClose(interaction);
          break;
          
        default:
          await interaction.reply({ content: '❌ Lỗi: Không nhận diện được action!', ephemeral: true });
      }
    } catch (error) {
      console.error('Error in AchievementImportHandler:', error);
      await interaction.reply({ content: '❌ Có lỗi xảy ra!', ephemeral: true });
    }
  }

  private static async handleAddAchievement(interaction: ButtonInteraction) {
    const modal = new ModalBuilder()
      .setCustomId('achievement_add_modal')
      .setTitle('🏆 Thêm Achievement');

    const nameInput = new TextInputBuilder()
      .setCustomId('achievement_name')
      .setLabel('Tên Achievement')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('Ví dụ: Top Fisher, FishCoin Master...')
      .setRequired(true)
      .setMaxLength(100);

    const linkInput = new TextInputBuilder()
      .setCustomId('achievement_link')
      .setLabel('Link Ảnh Achievement')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('https://example.com/badge.png')
      .setRequired(true)
      .setMaxLength(500);

    const targetInput = new TextInputBuilder()
      .setCustomId('achievement_target')
      .setLabel('User ID (Target)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('123456789012345678')
      .setRequired(true)
      .setMaxLength(20);

    const typeInput = new TextInputBuilder()
      .setCustomId('achievement_type')
      .setLabel('Loại (0-3)')
      .setStyle(TextInputStyle.Short)
      .setPlaceholder('0: Top câu cá, 1: Top FishCoin, 2: Top FishBattle, 3: Top Custom')
      .setRequired(true)
      .setMaxLength(1);

    const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(nameInput);
    const secondActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(linkInput);
    const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(targetInput);
    const fourthActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(typeInput);

    modal.addComponents(firstActionRow, secondActionRow, thirdActionRow, fourthActionRow);

    await interaction.showModal(modal);
  }

  private static async handleListAchievements(interaction: ButtonInteraction) {
    try {
      const prisma = (await import('../../utils/prisma')).default;

      const achievements = await prisma.achievement.findMany({
        orderBy: { createdAt: 'desc' },
      });

      if (achievements.length === 0) {
        const embed = new EmbedBuilder()
          .setTitle('📊 Danh Sách Achievement')
          .setColor('#FF6B6B')
          .setDescription('❌ Chưa có achievement nào!')
          .setTimestamp();

        return await interaction.reply({ embeds: [embed], ephemeral: true });
      }

      const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];

      const embed = new EmbedBuilder()
        .setTitle('📊 Danh Sách Achievement')
        .setColor('#4ECDC4')
        .setDescription(`**${achievements.length}** achievement được tìm thấy`)
        .setTimestamp();

      // Hiển thị tối đa 10 achievement đầu tiên
      const displayAchievements = achievements.slice(0, 10);
      
      for (const achievement of displayAchievements) {
        const typeName = typeNames[achievement.type] || 'Unknown';
        embed.addFields({
          name: `🏆 ${achievement.name}`,
          value: `**ID:** ${achievement.id}\n**Target:** <@${achievement.target}>\n**Loại:** ${typeName}\n**Link:** ${achievement.link}\n**Tạo:** ${achievement.createdAt.toLocaleString()}`,
          inline: false,
        });
      }

      if (achievements.length > 10) {
        embed.addFields({
          name: '📄 Còn lại',
          value: `${achievements.length - 10} achievement khác...`,
          inline: false,
        });
      }

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error listing achievements:', error);
      await interaction.reply({ content: '❌ Có lỗi xảy ra khi lấy danh sách achievement!', ephemeral: true });
    }
  }

  private static async handleManageAchievements(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('⚙️ Quản Lý Achievement')
      .setColor('#FFA500')
      .setDescription('Chọn hành động quản lý:')
      .addFields(
        { name: '🗑️ Xóa Achievement', value: 'Sử dụng lệnh: `n.achievement-import delete <achievement_id>`', inline: true },
        { name: '🧹 Xóa Tất Cả', value: 'Sử dụng lệnh: `n.achievement-import clear`', inline: true },
        { name: '📊 Xem Danh Sách', value: 'Sử dụng lệnh: `n.achievement-import list`', inline: true }
      )
      .addFields(
        { name: '💡 Lưu Ý', value: '• Xóa tất cả sẽ không thể hoàn tác\n• Nên backup trước khi xóa', inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private static async handleHelp(interaction: ButtonInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('🏆 Hướng Dẫn Import Achievement')
      .setColor('#FFD700')
      .setDescription('Hệ thống quản lý danh hiệu (Achievement)')
      .addFields(
        { name: '📝 Cách Sử Dụng', value: '`n.achievement-import <subcommand> [args]`', inline: false },
        { name: '📋 Subcommands', value: '`help`, `add`, `list`, `delete`, `clear`, `form`', inline: false },
        { name: '➕ Thêm Achievement', value: '`n.achievement-import add <name> <link> <target_user_id> <type>`', inline: false },
        { name: '📊 Danh Sách', value: '`n.achievement-import list`', inline: false },
        { name: '🗑️ Xóa', value: '`n.achievement-import delete <achievement_id>`', inline: false },
        { name: '🧹 Xóa Tất Cả', value: '`n.achievement-import clear`', inline: false }
      )
      .addFields(
        { name: '🎯 Loại Achievement (type)', value: '0: Top câu cá\n1: Top FishCoin\n2: Top FishBattle\n3: Top Custom', inline: false },
        { name: '💡 Ví Dụ', value: '`n.achievement-import add "Top Fisher" "https://example.com/badge.png" "123456789" 0`', inline: false }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  }

  private static async handleClose(interaction: ButtonInteraction) {
    await interaction.update({
      content: '✅ Đã đóng form import achievement!',
      embeds: [],
      components: [],
    });
  }

  // Xử lý modal submit
  static async handleModalSubmit(interaction: any) {
    if (interaction.customId === 'achievement_add_modal') {
      await this.handleAddAchievementModal(interaction);
    }
  }

  private static async handleAddAchievementModal(interaction: any) {
    try {
      const name = interaction.fields.getTextInputValue('achievement_name');
      const link = interaction.fields.getTextInputValue('achievement_link');
      const target = interaction.fields.getTextInputValue('achievement_target');
      const typeStr = interaction.fields.getTextInputValue('achievement_type');
      const type = parseInt(typeStr);

      if (isNaN(type) || type < 0) {
        return await interaction.reply({ 
          content: '❌ Type phải là số từ 0-3 (0: Top câu cá, 1: Top FishCoin, 2: Top FishBattle, 3: Top Custom)', 
          ephemeral: true 
        });
      }

      const prisma = (await import('../../utils/prisma')).default;

      const achievement = await prisma.achievement.create({
        data: {
          name,
          link,
          target,
          type,
        },
      });

      const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
      const typeName = typeNames[type] || 'Unknown';

      const embed = new EmbedBuilder()
        .setTitle('✅ Thêm Achievement Thành Công!')
        .setColor('#51CF66')
        .addFields(
          { name: '🏆 Tên', value: achievement.name, inline: true },
          { name: '🔗 Link', value: achievement.link, inline: true },
          { name: '👤 Target', value: `<@${achievement.target}>`, inline: true },
          { name: '📊 Loại', value: `${typeName} (${achievement.type})`, inline: true },
          { name: '🆔 ID', value: achievement.id, inline: true },
          { name: '📅 Tạo lúc', value: achievement.createdAt.toLocaleString(), inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: true });

    } catch (error) {
      console.error('Error adding achievement via modal:', error);
      await interaction.reply({ 
        content: '❌ Có lỗi xảy ra khi thêm achievement!', 
        ephemeral: true 
      });
    }
  }
} 