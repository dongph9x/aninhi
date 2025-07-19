import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import prisma from '../../utils/prisma';

export class FishBarnUI {
  private inventory: any;
  private userId: string;
  private guildId: string;
  private selectedFishId?: string;
  private breedingMode: boolean = false;
  private selectedParent1Id?: string;
  private selectedParent2Id?: string;

  constructor(inventory: any, userId: string, guildId: string, selectedFishId?: string, breedingMode: boolean = false, selectedParent1Id?: string, selectedParent2Id?: string) {
    this.inventory = inventory;
    this.userId = userId;
    this.guildId = guildId;
    this.selectedFishId = selectedFishId;
    this.breedingMode = breedingMode;
    this.selectedParent1Id = selectedParent1Id;
    this.selectedParent2Id = selectedParent2Id;
  }

  async createEmbed(): Promise<EmbedBuilder> {
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
    } else if (this.breedingMode) {
      // Hiển thị chế độ lai tạo
      embed.setTitle('❤️ Chế Độ Lai Tạo')
        .setColor('#FF69B4')
        .setDescription('Chọn 2 cá trưởng thành để lai tạo');

      // Hiển thị cá bố mẹ đã chọn
      if (this.selectedParent1Id) {
        const parent1 = this.inventory.items.find((item: any) => item.fish.id === this.selectedParent1Id);
        if (parent1) {
          const stats = parent1.fish.stats || {};
          const totalPower = this.calculateTotalPower(parent1.fish);
          const isInBattleInventory = await this.isFishInBattleInventory(parent1.fish.id);
          embed.addFields({
            name: '🐟 Cá Bố (Đã chọn)',
            value: this.createFishDisplayText(parent1.fish, stats, totalPower, undefined, undefined, undefined, isInBattleInventory),
            inline: true,
          });
        }
      }

      if (this.selectedParent2Id) {
        const parent2 = this.inventory.items.find((item: any) => item.fish.id === this.selectedParent2Id);
        if (parent2) {
          const stats = parent2.fish.stats || {};
          const totalPower = this.calculateTotalPower(parent2.fish);
          const isInBattleInventory = await this.isFishInBattleInventory(parent2.fish.id);
          embed.addFields({
            name: '🐟 Cá Mẹ (Đã chọn)',
            value: this.createFishDisplayText(parent2.fish, stats, totalPower, undefined, undefined, undefined, isInBattleInventory),
            inline: true,
          });
        }
      }

      // Hiển thị danh sách cá có thể chọn (nhóm theo thế hệ)
      const breedableFish = this.inventory.items.filter((item: any) => item.fish.status === 'adult');
      if (breedableFish.length > 0) {
        // Nhóm cá theo thế hệ
        const fishByGeneration: { [generation: number]: any[] } = {};
        breedableFish.forEach((item: any) => {
          const generation = item.fish.generation;
          if (!fishByGeneration[generation]) {
            fishByGeneration[generation] = [];
          }
          fishByGeneration[generation].push(item);
        });

        // Hiển thị từng thế hệ
        Object.keys(fishByGeneration).sort((a, b) => parseInt(a) - parseInt(b)).forEach(generation => {
          const genFish = fishByGeneration[parseInt(generation)];
          const displayFish = genFish.slice(0, 3); // Tối đa 3 cá mỗi thế hệ
          
          embed.addFields({
            name: `🏷️ Thế Hệ ${generation} (${genFish.length} cá)`,
            value: displayFish.map((item: any) => {
              const fish = item.fish;
              const stats = fish.stats || {};
              const totalPower = this.calculateTotalPower(fish);
              const isSelected = fish.id === this.selectedParent1Id || fish.id === this.selectedParent2Id;
              const statusEmoji = isSelected ? '✅' : '🐟';
              
              return `${statusEmoji} **${fish.name}** (Lv.${fish.level}) - Power: ${totalPower}`;
            }).join('\n') + (genFish.length > 3 ? `\n... và ${genFish.length - 3} cá khác` : ''),
            inline: false,
          });
        });
      }
    } else if (this.selectedFishId) {
      // Chỉ show cá được chọn
      console.log(`🔍 Looking for fish with ID: ${this.selectedFishId}`);
      console.log(`📦 Inventory items:`, this.inventory.items.map((item: any) => ({ id: item.fish.id, name: item.fish.name })));
      
      const selected = this.inventory.items.find((item: any) => item.fish.id === this.selectedFishId);
      console.log(`🎯 Found selected fish:`, selected ? selected.fish.name : 'NOT FOUND');
      
      if (selected) {
        const fish = selected.fish;
        const stats = fish.stats || {};
        const totalPower = this.calculateTotalPower(fish);
        const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
        const levelBar = this.createLevelBar(fish.level, fish.experience, fish.experienceToNext);
        const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
        const finalValue = Math.floor(fish.value * (1 + levelBonus));
        

        
        const isInBattleInventory = await this.isFishInBattleInventory(fish.id);
        embed.addFields({
          name: `${statusEmoji} ${fish.name} (Lv.${fish.level}) - Đã chọn`,
          value: this.createFishDisplayText(fish, stats, totalPower, levelBar, finalValue, levelBonus, isInBattleInventory),
          inline: false,
        });
      } else {
        console.log(`❌ Selected fish not found, falling back to show all fish`);
        // Fallback: show all fish if selected fish not found
        const displayItems = this.inventory.items.slice(0, 5);
        for (const item of displayItems) {
          const fish = item.fish;
          const stats = fish.stats || {};
          const totalPower = this.calculateTotalPower(fish);
          const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
          const levelBar = this.createLevelBar(fish.level, fish.experience, fish.experienceToNext);
          const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
          const finalValue = Math.floor(fish.value * (1 + levelBonus));
          
          const isInBattleInventory = await this.isFishInBattleInventory(fish.id);
          embed.addFields({
            name: `${statusEmoji} ${fish.name} (Lv.${fish.level})`,
            value: this.createFishDisplayText(fish, stats, totalPower, levelBar, finalValue, levelBonus, isInBattleInventory),
            inline: true,
          });
        }
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
    } else if (this.breedingMode) {
      // Chế độ lai tạo
      const breedableFish = this.inventory.items.filter((item: any) => item.fish.status === 'adult');
      
      if (breedableFish.length < 2) {
        // Không đủ cá để lai tạo
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
        // Row 1: Chọn cá bố mẹ
        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('fishbarn_select_parent')
              .setPlaceholder('Chọn cá cùng thế hệ để lai tạo...')
              .addOptions(
                breedableFish.map((item: any) => {
                  const fish = item.fish;
                  const stats = fish.stats || {};
                  const totalPower = this.calculateTotalPower(fish);
                  const isSelected = fish.id === this.selectedParent1Id || fish.id === this.selectedParent2Id;
                  
                  return {
                    label: `${fish.name} (Gen ${fish.generation}, Lv.${fish.level})`,
                    description: `Power: ${totalPower} - ${isSelected ? 'Đã chọn' : 'Chưa chọn'}`,
                    value: fish.id,
                    emoji: isSelected ? '✅' : '🐟',
                  };
                })
              )
          );

        // Row 2: Nút lai tạo và hủy
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('fishbarn_confirm_breed')
              .setLabel('Lai Tạo')
              .setStyle(ButtonStyle.Success)
              .setEmoji('❤️')
              .setDisabled(!this.selectedParent1Id || !this.selectedParent2Id),
            new ButtonBuilder()
              .setCustomId('fishbarn_cancel_breed')
              .setLabel('Hủy')
              .setStyle(ButtonStyle.Danger)
              .setEmoji('❌')
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

        components.push(selectRow, actionRow, closeRow);
      }
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
                const fish = item.fish;
                const stats = fish.stats || {};
                const totalPower = this.calculateTotalPower(fish);
                // Tính giá theo level (tăng 2% mỗi level)
                const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
                const finalValue = Math.floor(fish.value * (1 + levelBonus));
                
                return {
                  label: `${fish.name} (Gen.${fish.generation}, Lv.${fish.level})`,
                  description: `Power: ${totalPower} - ${fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'} - ${finalValue.toLocaleString()} coins`,
                  value: fish.id,
                  emoji: fish.status === 'adult' ? '🐟' : '🐠',
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

  private calculateTotalPower(fish: any): number {
    const stats = fish.stats || {};
    const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
    return totalPower;
  }

  private async isFishInBattleInventory(fishId: string): Promise<boolean> {
    const isInBattleInventory = await prisma.battleFishInventoryItem.findFirst({
      where: { fishId },
    });
    return !!isInBattleInventory;
  }

  private createFishDisplayText(fish: any, stats: any, totalPower: number, levelBar?: string, finalValue?: number, levelBonus?: number, isInBattleInventory: boolean = false): string {
    let text = `**Trạng thái:** ${fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'}\n`;
    
    if (isInBattleInventory) {
      text += `**⚔️ Vị trí:** Trong túi đấu (không thể bán)\n`;
    }
    
    if (finalValue !== undefined) {
      text += `**Giá trị:** ${finalValue.toLocaleString()} coins${levelBonus && levelBonus > 0 ? ` (+${Math.round(levelBonus * 100)}%)` : ''}\n`;
    } else {
      text += `**Giá trị:** ${fish.value.toLocaleString()} coins\n`;
    }
    
    if (levelBar) {
      text += `**Kinh nghiệm:** ${levelBar}\n`;
    }
    
    text += `**Thế hệ:** ${fish.generation}\n`;
    text += `**Tổng sức mạnh:** ${totalPower}\n`;
    text += `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`;
    
    return text;
  }
} 