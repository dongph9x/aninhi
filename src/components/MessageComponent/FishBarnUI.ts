import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } from 'discord.js';
import prisma from '../../utils/prisma';
import { FishFeedService } from '../../utils/fish-feed';

export class FishBarnUI {
  private inventory: any;
  private userId: string;
  private guildId: string;
  private selectedFishId?: string;
  private selectedFoodType?: string;
  private breedingMode: boolean = false;
  private selectedParent1Id?: string;
  private selectedParent2Id?: string;
  private userFishFood: any[] = [];
  private dailyFeedInfo?: { canFeed: boolean; remainingFeeds: number; error?: string };
  constructor(inventory: any, userId: string, guildId: string, selectedFishId?: string, selectedFoodType?: string, breedingMode: boolean = false, selectedParent1Id?: string, selectedParent2Id?: string, dailyFeedInfo?: { canFeed: boolean; remainingFeeds: number; error?: string }) {
    this.inventory = inventory;
    this.userId = userId;
    this.guildId = guildId;
    this.selectedFishId = selectedFishId;
    this.selectedFoodType = selectedFoodType;
    this.breedingMode = breedingMode;
    this.selectedParent1Id = selectedParent1Id;
    this.selectedParent2Id = selectedParent2Id;
    this.dailyFeedInfo = dailyFeedInfo;
  }

  async loadUserFishFood() {
    const { FishFoodService } = await import('../../utils/fish-food');
    this.userFishFood = await FishFoodService.getUserFishFood(this.userId, this.guildId);
  }

  async createEmbed(): Promise<EmbedBuilder> {
    const embed = new EmbedBuilder()
      .setTitle('🐟 Rương Nuôi Cá Huyền Thoại')
      .setColor('#FFD700')
      .setDescription(`**${this.inventory.items.length}/${this.inventory.capacity}** cá trong rương`)
      .setTimestamp();

    // Thông tin daily feed limit
    if (this.dailyFeedInfo) {
      if (this.dailyFeedInfo.canFeed) {
        embed.addFields({
          name: '🍽️ Giới Hạn Cho Cá Ăn Hôm Nay',
          value: `✅ Còn **${this.dailyFeedInfo.remainingFeeds}/20** lần cho cá ăn`,
          inline: true
        });
      } else {
        embed.addFields({
          name: '🍽️ Giới Hạn Cho Cá Ăn Hôm Nay',
          value: `❌ **Đã đạt giới hạn!** (0/20)\n${this.dailyFeedInfo.error || 'Vui lòng thử lại vào ngày mai'}`,
          inline: true
        });
      }
    }

    if (this.inventory.items.length === 0) {
      embed.addFields({
        name: '📭 Rương trống',
        value: 'Bạn chưa có cá huyền thoại nào trong rương!\nHãy câu cá huyền thoại trước.',
        inline: false,
      });
    } else if (this.breedingMode) {
      // Hiển thị chế độ lai tạo
      const { FishBreedingService } = await import('../../utils/fish-breeding');
      const breedingCost = FishBreedingService.getBreedingCost();
      
      embed.setTitle('❤️ Chế Độ Lai Tạo')
        .setColor('#FF69B4')
        .setDescription(`Chọn 2 cá trưởng thành để lai tạo\n💸 Chi phí lai tạo: ${breedingCost.toLocaleString()} FishCoin`);

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

      // Hiển thị danh sách cá có thể chọn (nhóm theo thế hệ) - loại bỏ cá level 10
      const breedableFish = this.inventory.items.filter((item: any) => item.fish.status === 'adult' && item.fish.level < 10);
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
            name: `🏷️ Thế Hệ ${generation} (${genFish.length} cá có thể lai tạo)`,
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
        const finalValue = Math.floor(Number(fish.value) * (1 + levelBonus));
        
        const isInBattleInventory = await this.isFishInBattleInventory(fish.id);
        embed.addFields({
          name: `${statusEmoji} ${fish.name} (Lv.${fish.level}) - Đã chọn`,
          value: this.createFishDisplayText(fish, stats, totalPower, levelBar, finalValue, levelBonus, isInBattleInventory),
          inline: false,
        });

        // Hiển thị thông tin thức ăn nếu đã chọn
        if (this.selectedFoodType) {
          const { FISH_FOOD_TYPES } = await import('../../utils/fish-food');
          const foodInfo = FISH_FOOD_TYPES[this.selectedFoodType as keyof typeof FISH_FOOD_TYPES];
          if (foodInfo) {
            embed.addFields({
              name: `🍽️ Thức Ăn Đã Chọn: ${foodInfo.emoji} ${foodInfo.name}`,
              value: `**Exp Bonus:** +${foodInfo.expBonus} exp\n**Mô tả:** ${foodInfo.description}`,
              inline: false,
            });
          }
        }
      } else {
        console.log(`❌ Selected fish not found, falling back to show all fish`);
        // Fallback: show all fish if selected fish not found (excluding level 10 fish)
        const displayItems = this.inventory.items
          .filter((item: any) => item.fish.level < 10) // Lọc bỏ cá level 10
          .slice(0, 5);
        for (const item of displayItems) {
          const fish = item.fish;
          const stats = fish.stats || {};
          const totalPower = this.calculateTotalPower(fish);
          const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
          const levelBar = this.createLevelBar(fish.level, fish.experience, fish.experienceToNext);
          const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
          const finalValue = Math.floor(Number(fish.value) * (1 + levelBonus));
          
          const isInBattleInventory = await this.isFishInBattleInventory(fish.id);
          embed.addFields({
            name: `${statusEmoji} ${fish.name} (Lv.${fish.level})`,
            value: this.createFishDisplayText(fish, stats, totalPower, levelBar, finalValue, levelBonus, isInBattleInventory),
            inline: true,
          });
        }
      }
      const nonMaxLevelFish = this.inventory.items.filter((item: any) => item.fish.level < 10);
      if (nonMaxLevelFish.length > 5) {
        embed.addFields({
          name: '📄 Còn lại',
          value: `${nonMaxLevelFish.length - 5} cá khác...`,
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
      // Chế độ lai tạo - chỉ cần cá trưởng thành
      const breedableFish = this.inventory.items.filter((item: any) => item.fish.status === 'adult');
      
      if (breedableFish.length === 0) {
        // Không có cá trưởng thành nào
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
                breedableFish
                  .slice(0, 25) // Giới hạn tối đa 25 options
                  .map((item: any) => {
                    const fish = item.fish;
                    const stats = fish.stats || {};
                    const totalPower = this.calculateTotalPower(fish);
                    const isSelected = fish.id === this.selectedParent1Id || fish.id === this.selectedParent2Id;
                    
                    return {
                      label: `${fish.species} (Gen ${fish.generation}, Lv.${fish.level})`,
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
            .setEmoji('🍽️')
            .setDisabled(!this.selectedFishId),
          new ButtonBuilder()
            .setCustomId('fishbarn_sell')
            .setLabel('Bán Cá')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('💰')
            .setDisabled(!this.selectedFishId),
          new ButtonBuilder()
            .setCustomId('fishbarn_breed')
            .setLabel('Lai Tạo')
            .setStyle(ButtonStyle.Success)
            .setEmoji('❤️')
        );

      // Row 2: Select menu để chọn cá
      const availableFish = this.inventory.items
        .filter((item: any) => item.fish.level < 10) // Lọc bỏ cá level 10
        .slice(0, 25); // Giới hạn tối đa 25 options
      
      if (availableFish.length > 0) {
        const selectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
          .addComponents(
            new StringSelectMenuBuilder()
              .setCustomId('fishbarn_select_fish')
              .setPlaceholder(this.selectedFishId ? 'Đổi cá khác...' : 'Chọn cá để thao tác...')
              .addOptions(
                availableFish.map((item: any, index: number) => {
                  const fish = item.fish;
                  const stats = fish.stats || {};
                  const totalPower = this.calculateTotalPower(fish);
                  // Tính giá theo level (tăng 2% mỗi level)
                  const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
                  const finalValue = Math.floor(Number(fish.value) * (1 + levelBonus));
                  
                  return {
                    label: `${fish.species} (Gen.${fish.generation}, Lv.${fish.level})`,
                    description: `Power: ${totalPower} - ${fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'} - ${finalValue.toLocaleString()} FishCoin`,
                    value: fish.id,
                    emoji: fish.status === 'adult' ? '🐟' : '🐠',
                  };
                })
              )
          );
        components.push(actionRow1, selectRow);
      } else {
        // Nếu không có cá nào dưới level 10, chỉ hiển thị buttons
        components.push(actionRow1);
      }

      // Row 3: Select menu để chọn thức ăn (chỉ hiển thị khi có cá được chọn)
      if (this.selectedFishId) {
        // Lọc chỉ những loại thức ăn mà user có
        const availableFoodOptions = this.userFishFood
          .filter(food => food.quantity > 0)
          .slice(0, 25) // Giới hạn tối đa 25 options
          .map(food => ({
            label: `${food.foodInfo.emoji} ${food.foodInfo.name} (+${food.foodInfo.expBonus} exp)`,
            description: `Còn lại: ${food.quantity} | Giá: ${food.foodInfo.price.toLocaleString()} FishCoin`,
            value: food.foodType,
            emoji: food.foodInfo.emoji,
          }));

        if (availableFoodOptions.length > 0) {
          const foodSelectRow = new ActionRowBuilder<StringSelectMenuBuilder>()
            .addComponents(
              new StringSelectMenuBuilder()
                .setCustomId('fishbarn_select_food')
                .setPlaceholder(this.selectedFoodType ? 'Đổi thức ăn...' : 'Chọn thức ăn...')
                .addOptions(availableFoodOptions)
            );
          components.push(foodSelectRow);
        } else {
          // Nếu không có thức ăn nào, hiển thị thông báo
          const noFoodRow = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('fishbarn_no_food')
                .setLabel('Không có thức ăn - Mua ngay!')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🛒')
            );
          components.push(noFoodRow);
        }
      }

      // Row 4: Đóng
      const closeRow = new ActionRowBuilder<ButtonBuilder>()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('fishbarn_close')
            .setLabel('Đóng')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('❌')
        );

      components.push(closeRow);
    }

    return components;
  }

  private createLevelBar(level: number, exp: number | BigInt, expNeeded: number | BigInt): string {
    const maxLevel = 10;
    if (level >= maxLevel) {
      return '🟢 MAX';
    }

    // Convert BigInt to number if needed
    const expNum = typeof exp === 'bigint' ? Number(exp) : Number(exp);
    const expNeededNum = typeof expNeeded === 'bigint' ? Number(expNeeded) : Number(expNeeded);

    // Tránh lỗi khi expNeeded = 0 hoặc âm
    if (expNeededNum <= 0) {
      return '🟢 MAX';
    }

    const progress = Math.floor((expNum / expNeededNum) * 10);
    // Đảm bảo progress không âm và không vượt quá 10
    const safeProgress = Math.max(0, Math.min(10, progress));
    const bar = '🟦'.repeat(safeProgress) + '⬜'.repeat(10 - safeProgress);
    return `${bar} ${expNum}/${expNeededNum}`;
  }

  private calculateTotalPower(fish: any): number {
    const stats = fish.stats || {};
    const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0) + (stats.accuracy || 0);
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
              text += `**Giá trị:** ${finalValue.toLocaleString()} FishCoin${levelBonus && levelBonus > 0 ? ` (+${Math.round(levelBonus * 100)}%)` : ''}\n`;
    } else {
              text += `**Giá trị:** ${Number(fish.value).toLocaleString()} FishCoin\n`;
    }
    
    if (levelBar) {
      text += `**Kinh nghiệm:** ${levelBar}\n`;
    }
    
    text += `**Thế hệ:** ${fish.generation}\n`;
    text += `**Tổng sức mạnh:** ${totalPower}\n`;
    text += `**Stats:** 💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0} 🎯${stats.accuracy || 0} 🎯${stats.accuracy || 0}`;
    
    return text;
  }
} 