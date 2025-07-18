import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';

export class FishBarnUI {
  private inventory: any;
  private userId: string;
  private guildId: string;
  private selectedFishId?: string;

  constructor(inventory: any, userId: string, guildId: string, selectedFishId?: string) {
    this.inventory = inventory;
    this.userId = userId;
    this.guildId = guildId;
    this.selectedFishId = selectedFishId;
  }

  createEmbed(): EmbedBuilder {
    const embed = new EmbedBuilder()
      .setTitle('🐟 Rương Nuôi Cá Huyền Thoại')
      .setColor('#FFD700')
      .setDescription(`**${this.inventory.items.length}/${this.inventory.capacity}** cá trong rương`)
      .setTimestamp();

    if (this.inventory.items.length === 0) {
      embed.addFields({
        name: '📭 Rương trống',
        value: 'Bạn chưa có cá huyền thoại nào trong rương!\nHãy câu cá huyền thoại trước.',
        inline: false,
      });
    } else if (this.selectedFishId) {
      // Chỉ show cá được chọn
      console.log(`🔍 Looking for fish with ID: ${this.selectedFishId}`);
      console.log(`📦 Inventory items:`, this.inventory.items.map((item: any) => ({ id: item.fish.id, name: item.fish.name })));
      
      const selected = this.inventory.items.find((item: any) => item.fish.id === this.selectedFishId);
      console.log(`🎯 Found selected fish:`, selected ? selected.fish.name : 'NOT FOUND');
      
      if (selected) {
        const fish = selected.fish;
        const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
        const levelBar = this.createLevelBar(fish.level, fish.experience, fish.experienceToNext);
        const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
        const finalValue = Math.floor(fish.value * (1 + levelBonus));
        embed.addFields({
          name: `${statusEmoji} ${fish.name} (Lv.${fish.level}) - Đã chọn`,
          value: `**Trạng thái:** ${fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'}\n**Giá trị:** ${finalValue.toLocaleString()} coins${levelBonus > 0 ? ` (+${Math.round(levelBonus * 100)}%)` : ''}\n**Kinh nghiệm:** ${levelBar}\n**Thế hệ:** ${fish.generation}`,
          inline: false,
        });
      } else {
        console.log(`❌ Selected fish not found, falling back to show all fish`);
        // Fallback: show all fish if selected fish not found
        const displayItems = this.inventory.items.slice(0, 5);
        displayItems.forEach((item: any, index: number) => {
          const fish = item.fish;
          const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
          const levelBar = this.createLevelBar(fish.level, fish.experience, fish.experienceToNext);
          const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
          const finalValue = Math.floor(fish.value * (1 + levelBonus));
          embed.addFields({
            name: `${statusEmoji} ${fish.name} (Lv.${fish.level})`,
            value: `**Trạng thái:** ${fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'}\n**Giá trị:** ${finalValue.toLocaleString()} coins${levelBonus > 0 ? ` (+${Math.round(levelBonus * 100)}%)` : ''}\n**Kinh nghiệm:** ${levelBar}\n**Thế hệ:** ${fish.generation}`,
            inline: true,
          });
        });
      }
      if (this.inventory.items.length > 5) {
        embed.addFields({
          name: '📄 Còn lại',
          value: `${this.inventory.items.length - 5} cá khác...`,
          inline: false,
        });
      }
    }
    return embed;
  }

  createComponents(): any[] {
    const components: any[] = [];

    if (this.inventory.items.length === 0) {
      // Chỉ có button đóng nếu không có cá
      const closeRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fishbarn_close')
            .setLabel('Đóng')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );
      components.push(closeRow);
    } else {
      // Row 1: Feed và Sell
      const actionRow1 = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fishbarn_feed')
            .setLabel('Cho Ăn')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🍽️'),
          new ButtonBuilder()
            .setCustomId('fishbarn_sell')
            .setLabel('Bán Cá')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('💰'),
          new ButtonBuilder()
            .setCustomId('fishbarn_breed')
            .setLabel('Lai Tạo')
            .setStyle(ButtonStyle.Success)
            .setEmoji('❤️')
        );

      // Row 2: Select menu để chọn cá
      const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
        .addComponents(
          new StringSelectMenuBuilder()
            .setCustomId('fishbarn_select_fish')
            .setPlaceholder(this.selectedFishId ? 'Đổi cá khác...' : 'Chọn cá để thao tác...')
            .addOptions(
              this.inventory.items.map((item: any, index: number) => {
                // Tính giá theo level (tăng 2% mỗi level)
                const levelBonus = item.fish.level > 1 ? (item.fish.level - 1) * 0.02 : 0;
                const finalValue = Math.floor(item.fish.value * (1 + levelBonus));
                
                return {
                  label: `${item.fish.name} (Lv.${item.fish.level})`,
                  description: `${item.fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'} - ${finalValue.toLocaleString()} coins${levelBonus > 0 ? ` (+${Math.round(levelBonus * 100)}%)` : ''}`,
                  value: item.fish.id,
                  emoji: item.fish.status === 'adult' ? '🐟' : '🐠',
                };
              })
            )
        );

      // Row 3: Đóng
      const closeRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fishbarn_close')
            .setLabel('Đóng')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );

      components.push(actionRow1, selectRow, closeRow);
    }

    return components;
  }

  private createLevelBar(level: number, exp: number, expNeeded: number): string {
    const maxLevel = 10;
    if (level >= maxLevel) {
      return '🟢 MAX';
    }

    // Tránh lỗi khi expNeeded = 0 hoặc âm
    if (expNeeded <= 0) {
      return '🟢 MAX';
    }

    const progress = Math.floor((exp / expNeeded) * 10);
    // Đảm bảo progress không âm và không vượt quá 10
    const safeProgress = Math.max(0, Math.min(10, progress));
    const bar = '🟦'.repeat(safeProgress) + '⬜'.repeat(10 - safeProgress);
    return `${bar} ${exp}/${expNeeded}`;
  }
} 