import { Message, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import { Bot } from '@/classes';
import { FishBattleService } from '@/utils/fish-battle';

export default Bot.createCommand({
  structure: {
    name: 'achievement-import',
    aliases: ['import-achievement', 'add-achievement'],
  },
  options: {
    cooldown: 1000,
    permissions: ['SendMessages', 'EmbedLinks'],
  },
  run: async ({ message, t }) => {
    try {
      const userId = message.author.id;
      const guildId = message.guildId!;
      const args = message.content.split(' ').slice(1);

      // Kiểm tra quyền admin
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId, message.client);
      if (!isAdmin) {
        return message.reply('❌ Bạn không có quyền sử dụng lệnh này!');
      }

      if (args.length === 0) {
        return await showAchievementImportForm(message);
      }

      const subCommand = args[0].toLowerCase();

      switch (subCommand) {
        case 'help':
          return await showHelp(message);
        case 'add':
          return await addAchievement(message, args.slice(1));
        case 'list':
          return await listAchievements(message);
        case 'delete':
          return await deleteAchievement(message, args.slice(1));
        case 'clear':
          return await clearAchievements(message);
        case 'form':
          return await showAchievementImportForm(message);
        default:
          return await showAchievementImportForm(message);
      }
    } catch (error) {
      console.error('Error in achievement-import command:', error);
      message.reply('❌ Có lỗi xảy ra khi xử lý lệnh!');
    }
  },
});

async function showHelp(message: Message) {
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
      { name: '🧹 Xóa Tất Cả', value: '`n.achievement-import clear`', inline: false },
      { name: '📋 Form Import', value: '`n.achievement-import form`', inline: false }
    )
    .addFields(
      { name: '🎯 Loại Achievement (type)', value: '0: Top câu cá\n1: Top FishCoin\n2: Top FishBattle\n3: Top Custom', inline: false },
      { name: '💡 Ví Dụ', value: '`n.achievement-import add "Top Fisher" "https://example.com/badge.png" "123456789" 0`', inline: false }
    )
    .setTimestamp();

  return message.reply({ embeds: [embed] });
}

async function showAchievementImportForm(message: Message) {
  const embed = new EmbedBuilder()
    .setTitle('🏆 Form Import Achievement')
    .setColor('#4ECDC4')
    .setDescription('Chọn cách import achievement:')
    .addFields(
      { name: '📝 Thêm Thủ Công', value: 'Sử dụng nút "Thêm Achievement" để thêm từng achievement một', inline: true },
      { name: '📊 Xem Danh Sách', value: 'Xem tất cả achievement hiện có', inline: true },
      { name: '🗑️ Quản Lý', value: 'Xóa achievement hoặc xóa tất cả', inline: true }
    )
    .setTimestamp();

  const row1 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('achievement_add')
        .setLabel('➕ Thêm Achievement')
        .setStyle(ButtonStyle.Primary)
        .setEmoji('🏆'),
      new ButtonBuilder()
        .setCustomId('achievement_list')
        .setLabel('📊 Danh Sách')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('📋'),
      new ButtonBuilder()
        .setCustomId('achievement_manage')
        .setLabel('⚙️ Quản Lý')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔧')
    );

  const row2 = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('achievement_help')
        .setLabel('❓ Hướng Dẫn')
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('💡'),
      new ButtonBuilder()
        .setCustomId('achievement_close')
        .setLabel('❌ Đóng')
        .setStyle(ButtonStyle.Danger)
        .setEmoji('🚪')
    );

  return message.reply({
    embeds: [embed],
    components: [row1, row2],
  });
}

async function addAchievement(message: Message, args: string[]) {
  if (args.length < 4) {
    return message.reply('❌ Cách dùng: `n.achievement-import add <name> <link> <target_user_id> <type>`');
  }

  try {
    const name = args[0];
    const link = args[1];
    const target = args[2];
    const type = parseInt(args[3]);

    if (isNaN(type) || type < 0 || type > 3) {
      return message.reply('❌ Type phải là số từ 0-3 (0: Top câu cá, 1: Top FishCoin, 2: Top FishBattle, 3: Top Custom)');
    }

    const prisma = (await import('../../../utils/prisma')).default;

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

    return message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error adding achievement:', error);
    return message.reply('❌ Có lỗi xảy ra khi thêm achievement!');
  }
}

async function listAchievements(message: Message) {
  try {
    const prisma = (await import('../../../utils/prisma')).default;

    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (achievements.length === 0) {
      const embed = new EmbedBuilder()
        .setTitle('📊 Danh Sách Achievement')
        .setColor('#FF6B6B')
        .setDescription('❌ Chưa có achievement nào!')
        .setTimestamp();

      return message.reply({ embeds: [embed] });
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

    return message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error listing achievements:', error);
    return message.reply('❌ Có lỗi xảy ra khi lấy danh sách achievement!');
  }
}

async function deleteAchievement(message: Message, args: string[]) {
  if (args.length === 0) {
    return message.reply('❌ Cách dùng: `n.achievement-import delete <achievement_id>`');
  }

  try {
    const achievementId = args[0];
    const prisma = (await import('../../../utils/prisma')).default;

    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    });

    if (!achievement) {
      return message.reply('❌ Không tìm thấy achievement với ID này!');
    }

    await prisma.achievement.delete({
      where: { id: achievementId },
    });

    const embed = new EmbedBuilder()
      .setTitle('✅ Xóa Achievement Thành Công!')
      .setColor('#51CF66')
      .addFields(
        { name: '🏆 Tên', value: achievement.name, inline: true },
        { name: '🆔 ID', value: achievement.id, inline: true },
        { name: '👤 Target', value: `<@${achievement.target}>`, inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error deleting achievement:', error);
    return message.reply('❌ Có lỗi xảy ra khi xóa achievement!');
  }
}

async function clearAchievements(message: Message) {
  try {
    const prisma = (await import('../../../utils/prisma')).default;

    const count = await prisma.achievement.count();
    
    if (count === 0) {
      return message.reply('❌ Không có achievement nào để xóa!');
    }

    await prisma.achievement.deleteMany({});

    const embed = new EmbedBuilder()
      .setTitle('✅ Xóa Tất Cả Achievement Thành Công!')
      .setColor('#51CF66')
      .addFields(
        { name: '🗑️ Đã xóa', value: `${count} achievement`, inline: true }
      )
      .setTimestamp();

    return message.reply({ embeds: [embed] });

  } catch (error) {
    console.error('Error clearing achievements:', error);
    return message.reply('❌ Có lỗi xảy ra khi xóa tất cả achievement!');
  }
} 