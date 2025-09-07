import { ButtonInteraction, StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { FishBreedingService } from '../../utils/fish-breeding';
import { FishInventoryService } from '../../utils/fish-inventory';
import { FishBarnUI } from './FishBarnUI';
import { FishFeedService } from '../../utils/fish-feed';

export class FishBarnHandler {
  // Lưu trữ cá được chọn cho mỗi user
  private static selectedFishMap = new Map<string, string>();
  // Lưu trữ thức ăn được chọn cho mỗi user
  private static selectedFoodMap = new Map<string, string>();
  // Lưu trữ chế độ lai tạo cho mỗi user
  private static breedingModeMap = new Map<string, {
    breedingMode: boolean;
    selectedParent1Id?: string;
    selectedParent2Id?: string;
  }>();

  // Helper method để tạo UI với user fish food
  private static async createUIWithFishFood(
    inventory: any, 
    userId: string, 
    guildId: string, 
    selectedFishId?: string, 
    selectedFoodType?: string, 
    breedingMode: boolean = false, 
    selectedParent1Id?: string, 
    selectedParent2Id?: string
  ) {
    // Tự động chọn cá đầu tiên có thể cho ăn nếu không có cá nào được chọn và không ở chế độ lai tạo
    let finalSelectedFishId = selectedFishId;
    if (!selectedFishId && !breedingMode) {
      const feedableFish = inventory.items.filter((item: any) => item.fish.level < 10);
      if (feedableFish.length > 0) {
        finalSelectedFishId = feedableFish[0].fish.id;
        if (finalSelectedFishId) {
          this.selectedFishMap.set(userId, finalSelectedFishId);
        }
      }
    }

    // Lấy thông tin daily feed limit
    const dailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
    
    const ui = new FishBarnUI(
      inventory, 
      userId, 
      guildId, 
      finalSelectedFishId,
      selectedFoodType,
      breedingMode,
      selectedParent1Id,
      selectedParent2Id,
      dailyFeedInfo
    );
    
    // Load user fish food
    await ui.loadUserFishFood();
    
    return ui;
  }

  static async handleInteraction(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    const customId = interaction.customId;
    
    if (!interaction.guildId || !interaction.user) {
      return interaction.reply({ content: '❌ Lỗi: Không tìm thấy thông tin server hoặc user!', ephemeral: true });
    }

    const userId = interaction.user.id;
    const guildId = interaction.guildId;

    try {
      switch (customId) {
        case 'fishbarn_close':
          await this.handleClose(interaction);
          break;
          
        case 'fishbarn_feed':
          await this.handleFeed(interaction, userId, guildId);
          break;
          
        case 'fishbarn_sell':
          await this.handleSell(interaction, userId, guildId);
          break;
          
        case 'fishbarn_breed':
          await this.handleBreed(interaction, userId, guildId);
          break;
          
        case 'fishbarn_clone':
          await this.handleClone(interaction, userId, guildId);
          break;
          
        case 'fishbarn_levelup':
          await this.handleLevelUp(interaction, userId, guildId);
          break;
          
        case 'fishbarn_select_fish':
          if (interaction.isStringSelectMenu()) {
            await this.handleSelectFish(interaction, userId, guildId);
          }
          break;
          
        case 'fishbarn_select_food':
          if (interaction.isStringSelectMenu()) {
            await this.handleSelectFood(interaction, userId, guildId);
          }
          break;
          
        case 'fishbarn_select_parent':
          if (interaction.isStringSelectMenu()) {
            await this.handleSelectParent(interaction, userId, guildId);
          }
          break;
          
        case 'fishbarn_confirm_breed':
          await this.handleConfirmBreed(interaction, userId, guildId);
          break;
          
        case 'fishbarn_cancel_breed':
          await this.handleCancelBreed(interaction, userId, guildId);
          break;
          
        case 'fishbarn_no_food':
          await this.handleNoFood(interaction, userId, guildId);
          break;
          
        case 'fishbarn_cancel_sell':
          await this.handleCancelSell(interaction, userId, guildId);
          break;
          
        case 'fishbarn_buy_fish_food':
          if (interaction.isStringSelectMenu()) {
            await this.handleBuyFishFood(interaction, userId, guildId);
          }
          break;
          
        case 'fishbarn_back_to_barn':
          await this.handleBackToBarn(interaction, userId, guildId);
          break;
          
        default:
          // Kiểm tra xem có phải confirm sell không
          if (customId.startsWith('fishbarn_confirm_sell_')) {
            const fishId = customId.replace('fishbarn_confirm_sell_', '');
            await this.handleConfirmSell(interaction, userId, guildId, fishId);
            return true;
          }
          await interaction.reply({ content: '❌ Lỗi: Không nhận diện được action!', ephemeral: true });
      }
    } catch (error) {
      console.error('Error in FishBarnHandler:', error);
      await interaction.reply({ content: '❌ Có lỗi xảy ra!', ephemeral: true });
    }
  }

  private static async handleClose(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    // Xóa dữ liệu lưu trữ
    const userId = interaction.user.id;
    this.selectedFishMap.delete(userId);
    this.selectedFoodMap.delete(userId);
    this.breedingModeMap.delete(userId);
    
    await interaction.update({
      content: '🐟 Rương nuôi cá đã được đóng!',
      embeds: [],
      components: [],
    });
  }

  private static async handleFeed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = this.selectedFishMap.get(userId);
    const selectedFoodType = this.selectedFoodMap.get(userId);
    
    if (!selectedFishId) {
      return interaction.reply({ 
        content: '❌ Vui lòng chọn một con cá trước khi cho ăn!', 
        ephemeral: true 
      });
    }

    if (!selectedFoodType) {
      return interaction.reply({ 
        content: '❌ Vui lòng chọn thức ăn trước khi cho cá ăn!', 
        ephemeral: true 
      });
    }

    // Kiểm tra daily feed limit
    const dailyFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
    if (!dailyFeedCheck.canFeed) {
      return interaction.reply({ 
        content: `❌ ${dailyFeedCheck.error}`, 
        ephemeral: true 
      });
    }
    
    // Cho cá ăn với thức ăn
    const result = await FishBreedingService.feedFishWithFood(userId, selectedFishId, selectedFoodType as any);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Tăng daily feed count
    await FishFeedService.incrementDailyFeedCount(userId, guildId);

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Lấy thông tin daily feed mới sau khi tăng count
    const updatedDailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
    
    // Tạo embed thông báo
    const embed = new EmbedBuilder()
      .setTitle('🍽️ Cho Cá Ăn Thành Công!')
      .setColor('#00FF00')
      .addFields(
        { name: '🐟 Cá', value: result.fish?.name || 'Unknown', inline: true },
        { name: '🍽️ Thức Ăn', value: result.foodUsed?.name || 'Unknown', inline: true },
        { name: '📈 Kinh nghiệm', value: `+${result.experienceGained}`, inline: true },
        { name: '🎯 Level', value: `${result.fish?.level || 0}`, inline: true },
        { name: '💰 Giá trị mới', value: (result.newValue || 0).toLocaleString(), inline: true }
      );

    if (result.leveledUp) {
      embed.addFields({ name: '🎉 Lên Level!', value: 'Cá đã lên level mới!', inline: false });
    }

    if (result.becameAdult) {
      embed.addFields({ name: '🐟 Trưởng Thành!', value: 'Cá đã trưởng thành và có thể lai tạo!', inline: false });
    }

    // Cập nhật UI (hàm createUIWithFishFood sẽ tự động lấy thông tin daily feed mới)
    const breedingData = this.breedingModeMap.get(userId);
    const ui = await this.createUIWithFishFood(
      updatedInventory, 
      userId, 
      guildId, 
      selectedFishId,
      selectedFoodType,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    const newEmbed = await ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });

    // Gửi thông báo thành công
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  private static async handleSell(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = this.selectedFishMap.get(userId);
    
    if (!selectedFishId) {
      return interaction.reply({ 
        content: '❌ Vui lòng chọn một con cá trước khi bán!', 
        ephemeral: true 
      });
    }

    // Lấy thông tin cá để hiển thị trong popup xác nhận
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    const selectedFish = inventory.items.find((item: any) => item.fish.id === selectedFishId)?.fish;
    
    if (!selectedFish) {
      return interaction.reply({ 
        content: '❌ Không tìm thấy thông tin cá!', 
        ephemeral: true 
      });
    }

    // Tính giá bán
    const levelBonus = selectedFish.level > 1 ? (selectedFish.level - 1) * 0.02 : 0;
    const finalValue = Math.floor(Number(selectedFish.value) * (1 + levelBonus));

    // Tạo embed xác nhận bán
    const confirmEmbed = new EmbedBuilder()
      .setTitle('⚠️ Xác Nhận Bán Cá')
      .setColor('#FFA500')
      .setDescription('Bạn có chắc chắn muốn bán con cá này không?')
      .addFields(
        { name: '🐟 Tên cá', value: selectedFish.species, inline: true },
        { name: '📊 Level', value: selectedFish.level.toString(), inline: true },
        { name: '🏷️ Thế hệ', value: `Gen.${selectedFish.generation}`, inline: true },
        { name: '💰 Giá bán', value: `${finalValue.toLocaleString()} FishCoin`, inline: true },
        { name: '⭐ Độ hiếm', value: selectedFish.rarity, inline: true },
        { name: '📈 Trạng thái', value: selectedFish.status, inline: true }
      )
      .setFooter({ text: 'Hành động này không thể hoàn tác!' })
      .setTimestamp();

    // Tạo buttons xác nhận
    const { ButtonBuilder, ButtonStyle, ActionRowBuilder } = await import('discord.js');
    
    const confirmRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId(`fishbarn_confirm_sell_${selectedFishId}`)
          .setLabel('✅ Xác Nhận Bán')
          .setStyle(ButtonStyle.Danger)
          .setEmoji('💰'),
        new ButtonBuilder()
          .setCustomId('fishbarn_cancel_sell')
          .setLabel('❌ Hủy Bỏ')
          .setStyle(ButtonStyle.Secondary)
          .setEmoji('🚫')
      );

    await interaction.reply({
      embeds: [confirmEmbed],
      components: [confirmRow],
      ephemeral: true
    });
  }

  private static async handleBreed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tìm cá trưởng thành
    const adultFish = inventory.items.filter((item: any) => item.fish.status === 'adult');
    
    if (adultFish.length < 2) {
      return interaction.reply({ 
        content: '❌ Cần ít nhất 2 cá trưởng thành để lai tạo!', 
        ephemeral: true 
      });
    }

    // Bật chế độ lai tạo
    this.breedingModeMap.set(userId, {
      breedingMode: true,
      selectedParent1Id: undefined,
      selectedParent2Id: undefined
    });

    // Cập nhật UI với helper function
    const ui = await this.createUIWithFishFood(
      inventory, 
      userId, 
      guildId, 
      undefined,
      undefined,
      true,
      undefined,
      undefined
    );
    const newEmbed = await ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });
  }

  private static async handleSelectFish(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = interaction.values[0];
    this.selectedFishMap.set(userId, selectedFishId);
    
    // Giữ lại thức ăn đã chọn trước đó
    const selectedFoodType = this.selectedFoodMap.get(userId);
    
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    const breedingData = this.breedingModeMap.get(userId);
    
    // Sử dụng helper function để load user fish food
    const ui = await this.createUIWithFishFood(
      inventory, 
      userId, 
      guildId, 
      selectedFishId,
      selectedFoodType,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    
    const embed = await ui.createEmbed();
    const components = ui.createComponents();

    await interaction.update({
      embeds: [embed],
      components: components,
    });
  }

  private static async handleSelectFood(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFoodType = interaction.values[0];
    this.selectedFoodMap.set(userId, selectedFoodType);
    
    const selectedFishId = this.selectedFishMap.get(userId);
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    const breedingData = this.breedingModeMap.get(userId);
    
    // Sử dụng helper function để load user fish food
    const ui = await this.createUIWithFishFood(
      inventory, 
      userId, 
      guildId, 
      selectedFishId,
      selectedFoodType,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    
    const embed = await ui.createEmbed();
    const components = ui.createComponents();

    await interaction.update({
      embeds: [embed],
      components: components,
    });
  }

  private static async handleSelectParent(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = interaction.values[0];
    const breedingData = this.breedingModeMap.get(userId) || { breedingMode: true };

    // Lấy thông tin cá được chọn
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    const selectedFish = inventory.items.find((item: any) => item.fish.id === selectedFishId);
    
    if (!selectedFish) {
      return interaction.reply({ content: '❌ Không tìm thấy cá!', ephemeral: true });
    }

    // Chọn cá bố mẹ với validation cùng thế hệ
    if (!breedingData.selectedParent1Id) {
      breedingData.selectedParent1Id = selectedFishId;
    } else if (!breedingData.selectedParent2Id && selectedFishId !== breedingData.selectedParent1Id) {
      // Kiểm tra cùng thế hệ
      const parent1 = inventory.items.find((item: any) => item.fish.id === breedingData.selectedParent1Id);
      if (parent1 && parent1.fish.generation !== selectedFish.fish.generation) {
        return interaction.reply({ 
          content: `❌ Chỉ cá cùng thế hệ mới được lai tạo! Cá bố là thế hệ ${parent1.fish.generation}, cá mẹ là thế hệ ${selectedFish.fish.generation}`, 
          ephemeral: true 
        });
      }
      breedingData.selectedParent2Id = selectedFishId;
    } else if (selectedFishId === breedingData.selectedParent1Id) {
      // Bỏ chọn cá bố
      breedingData.selectedParent1Id = undefined;
    } else if (selectedFishId === breedingData.selectedParent2Id) {
      // Bỏ chọn cá mẹ
      breedingData.selectedParent2Id = undefined;
    } else {
      // Thay thế cá bố - kiểm tra cùng thế hệ với cá mẹ
      if (breedingData.selectedParent2Id) {
        const parent2 = inventory.items.find((item: any) => item.fish.id === breedingData.selectedParent2Id);
        if (parent2 && parent2.fish.generation !== selectedFish.fish.generation) {
          return interaction.reply({ 
            content: `❌ Chỉ cá cùng thế hệ mới được lai tạo! Cá mẹ là thế hệ ${parent2.fish.generation}, cá bố mới là thế hệ ${selectedFish.fish.generation}`, 
            ephemeral: true 
          });
        }
      }
      breedingData.selectedParent1Id = selectedFishId;
    }

    this.breedingModeMap.set(userId, breedingData);

    // Cập nhật UI với helper function
    const ui = await this.createUIWithFishFood(
      inventory, 
      userId, 
      guildId, 
      undefined,
      undefined,
      true,
      breedingData.selectedParent1Id,
      breedingData.selectedParent2Id
    );
    const newEmbed = await ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });
  }

  private static async handleConfirmBreed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    const breedingData = this.breedingModeMap.get(userId);
    
    if (!breedingData?.selectedParent1Id || !breedingData?.selectedParent2Id) {
      return interaction.reply({ 
        content: '❌ Vui lòng chọn đủ 2 cá để lai tạo!', 
        ephemeral: true 
      });
    }

    // Kiểm tra quyền admin
    const { FishBattleService } = await import('@/utils/fish-battle');
    const isAdmin = await FishBattleService.isAdministrator(userId, guildId, interaction.client);

    const result = await FishBreedingService.breedFish(userId, breedingData.selectedParent1Id, breedingData.selectedParent2Id, isAdmin);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Cá con đã được thêm vào inventory tự động trong FishBreedingService.breedFish()
    // Không cần thêm lại ở đây

    // Tắt chế độ lai tạo
    this.breedingModeMap.delete(userId);

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo embed thông báo
    const breedingCost = FishBreedingService.getBreedingCost();
    const embed = new EmbedBuilder()
      .setTitle('❤️ Lai Tạo Thành Công!')
      .setColor('#FF69B4')
      .addFields(
        { name: '🐟 Cá bố', value: result.parent1?.name || 'Unknown', inline: true },
        { name: '🐟 Cá mẹ', value: result.parent2?.name || 'Unknown', inline: true },
        { name: '🐠 Cá con', value: result.offspring?.name || 'Unknown', inline: true },
        { name: '💰 Giá trị', value: (result.offspring?.value || 0).toLocaleString(), inline: true },
        { name: '🏷️ Thế hệ', value: (result.offspring?.generation || 0).toString(), inline: true },
        { name: '💪 Tổng sức mạnh', value: result.offspring ? FishBreedingService.calculateTotalPower(result.offspring).toString() : '0', inline: true }
      );

    // Hiển thị chi phí lai tạo
    if (!isAdmin) {
      embed.addFields({
        name: '💸 Chi Phí Lai Tạo',
        value: `${breedingCost.toLocaleString()} FishCoin`,
        inline: true
      });
    } else {
      embed.addFields({
        name: '👑 Admin Privilege',
        value: 'Miễn phí lai tạo',
        inline: true
      });
    }

    if (result.offspring?.stats) {
      embed.addFields({
        name: '📊 Stats Di Truyền',
        value: `💪${result.offspring.stats.strength || 0} 🏃${result.offspring.stats.agility || 0} 🧠${result.offspring.stats.intelligence || 0} 🛡️${result.offspring.stats.defense || 0} 🍀${result.offspring.stats.luck || 0}`,
        inline: false
      });
    }

    // Cập nhật UI với thức ăn đã chọn
    const selectedFishId = this.selectedFishMap.get(userId);
    const selectedFoodType = this.selectedFoodMap.get(userId);
    
    const ui = await this.createUIWithFishFood(
      updatedInventory, 
      userId, 
      guildId, 
      selectedFishId,
      selectedFoodType,
      false,
      undefined,
      undefined
    );
    const newEmbed = await ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });

    // Gửi thông báo thành công
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  private static async handleCancelBreed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    // Tắt chế độ lai tạo
    this.breedingModeMap.delete(userId);

    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    const selectedFishId = this.selectedFishMap.get(userId);
    const selectedFoodType = this.selectedFoodMap.get(userId);
    
    // Cập nhật UI với thức ăn đã chọn
    const ui = await this.createUIWithFishFood(
      inventory, 
      userId, 
      guildId, 
      selectedFishId,
      selectedFoodType,
      false,
      undefined,
      undefined
    );
    const newEmbed = await ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });
  }

  private static async handleNoFood(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    // Mở cửa hàng thức ăn
    const { FISH_FOOD_TYPES } = await import('@/utils/fish-food');
    
    const embed = new EmbedBuilder()
      .setTitle("🍽️ Cửa Hàng Thức Ăn")
      .setDescription("Chọn loại thức ăn bạn muốn mua:")
      .setColor("#00ff99")
      .setTimestamp();

    // Hiển thị thông tin từng loại thức ăn
    Object.entries(FISH_FOOD_TYPES).forEach(([key, food]) => {
      embed.addFields({
        name: `${food.emoji} ${food.name}`,
        value: `Giá: ${food.price.toLocaleString()}₳ | Exp: +${food.expBonus} | ${food.description}`,
        inline: false
      });
    });

    const row = new ActionRowBuilder<StringSelectMenuBuilder>()
      .addComponents(
        new StringSelectMenuBuilder()
          .setCustomId('fishbarn_buy_fish_food')
          .setPlaceholder("Chọn loại thức ăn...")
          .addOptions(
            Object.entries(FISH_FOOD_TYPES)
              .slice(0, 25) // Giới hạn tối đa 25 options
              .map(([key, food]) => 
                new StringSelectMenuOptionBuilder()
                  .setLabel(`${food.name} - ${food.price.toLocaleString()}₳`)
                  .setDescription(`Exp: +${food.expBonus} | ${food.description}`)
                  .setValue(key)
                  .setEmoji(food.emoji)
              )
          )
      );

    const backRow = new ActionRowBuilder<ButtonBuilder>()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('fishbarn_back_to_barn')
          .setLabel("⬅️ Quay Lại Rương Cá")
          .setStyle(ButtonStyle.Secondary)
      );

    await interaction.update({ 
      embeds: [embed], 
      components: [row, backRow]
    });
  }

  private static async handleBuyFishFood(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
    const foodType = interaction.values[0];
    
    // Mua thức ăn
    const { FishFoodService } = await import('@/utils/fish-food');
    const result = await FishFoodService.buyFishFood(userId, guildId, foodType as any, 1);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }
    
    // Quay lại FishBarn
    await this.handleBackToBarn(interaction, userId, guildId);
    
    // Gửi thông báo thành công
    const embed = new EmbedBuilder()
      .setTitle('🛒 Mua Thức Ăn Thành Công!')
      .setColor('#00FF00')
      .addFields(
        { name: '🍽️ Thức Ăn', value: result.foodInfo?.name || 'Unknown', inline: true },
        { name: '💰 Giá', value: (result.totalCost || 0).toLocaleString(), inline: true },
        { name: '📦 Số lượng', value: (result.quantity || 0).toString(), inline: true }
      );
    
    await interaction.followUp({ embeds: [embed], ephemeral: true });
  }

  private static async handleConfirmSell(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string, fishId: string) {
    // Thực hiện bán cá
    const result = await FishInventoryService.sellFishFromInventory(userId, guildId, fishId);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Xóa cá khỏi selected
    this.selectedFishMap.delete(userId);

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo embed thông báo thành công
    const successEmbed = new EmbedBuilder()
      .setTitle('💰 Bán Cá Thành Công!')
      .setColor('#00FF00')
      .addFields(
        { name: '🐟 Cá đã bán', value: result.fish?.species || 'Unknown', inline: true },
        { name: '🐟 Số tiền nhận', value: (result.coinsEarned || 0).toLocaleString(), inline: true },
        { name: '💳 Số dư mới', value: (result.newBalance || 0).toLocaleString(), inline: true }
      )
      .setTimestamp();

    // Cập nhật UI
    const breedingData = this.breedingModeMap.get(userId);
    
    // Lấy thông tin daily feed limit
    const dailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
    
    // Kiểm tra quyền admin
    const { FishBattleService } = await import('@/utils/fish-battle');
    const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
    
    const ui = new FishBarnUI(
      updatedInventory, 
      userId, 
      guildId, 
      undefined,
      undefined,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id,
      dailyFeedInfo,
      isAdmin
    );
    const newEmbed = await ui.createEmbed();
    const newComponents = ui.createComponents();

    // Cập nhật UI chính
    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });

    // Gửi thông báo thành công
    await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
  }

  private static async handleCancelSell(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    // Chỉ đóng popup xác nhận
    await interaction.update({
      content: '❌ Đã hủy bỏ việc bán cá!',
      embeds: [],
      components: [],
    });
  }

  private static async handleBackToBarn(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    // Lấy thông tin hiện tại
    const selectedFishId = this.selectedFishMap.get(userId);
    const selectedFoodType = this.selectedFoodMap.get(userId);
    const breedingData = this.breedingModeMap.get(userId);
    
    // Lấy inventory
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo UI với thông tin hiện tại
    const ui = await this.createUIWithFishFood(
      inventory, 
      userId, 
      guildId, 
      selectedFishId,
      selectedFoodType,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    
    const embed = await ui.createEmbed();
    const components = ui.createComponents();

    await interaction.update({
      embeds: [embed],
      components: components,
    });
  }

  private static async handleClone(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    try {
      // Kiểm tra quyền admin
      const { FishBattleService } = await import('@/utils/fish-battle');
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
      
      if (!isAdmin) {
        return interaction.reply({ 
          content: '❌ Chỉ admin mới có thể sử dụng chức năng nhân bản cá!', 
          ephemeral: true 
        });
      }

      // Lấy cá được chọn
      const selectedFishId = this.selectedFishMap.get(userId);
      if (!selectedFishId) {
        return interaction.reply({ 
          content: '❌ Vui lòng chọn một con cá để nhân bản!', 
          ephemeral: true 
        });
      }

      // Lấy thông tin cá gốc
      const inventory = await FishInventoryService.getFishInventory(userId, guildId);
      const selectedFish = inventory.items.find((item: any) => item.fish.id === selectedFishId);
      
      if (!selectedFish) {
        return interaction.reply({ 
          content: '❌ Không tìm thấy cá được chọn!', 
          ephemeral: true 
        });
      }

      const originalFish = selectedFish.fish;

      if (!originalFish) {
        return interaction.reply({ 
          content: '❌ Không thể lấy thông tin cá gốc!', 
          ephemeral: true 
        });
      }

      // Tạo cá nhân bản
      const clonedFish = await this.createClonedFish(originalFish, userId, guildId);
      
      if (!clonedFish.success) {
        return interaction.reply({ 
          content: `❌ Lỗi khi nhân bản cá: ${clonedFish.error}`, 
          ephemeral: true 
        });
      }

      // Thêm cá nhân bản vào inventory
      const addResult = await FishInventoryService.addFishToInventory(userId, guildId, clonedFish.fish.id);
      
      if (!addResult.success) {
        return interaction.reply({ 
          content: `❌ Lỗi khi thêm cá nhân bản vào inventory: ${addResult.error}`, 
          ephemeral: true 
        });
      }

      // Tạo embed thông báo thành công
      const successEmbed = new EmbedBuilder()
        .setTitle('🔄 Nhân Bản Cá Thành Công!')
        .setColor('#00FF00')
        .addFields(
          { name: '🐟 Cá gốc', value: originalFish.species, inline: true },
          { name: '🔄 Cá nhân bản', value: clonedFish.fish.species, inline: true },
          { name: '🏷️ ID cá nhân bản', value: clonedFish.fish.id, inline: true },
          { name: '📊 Thế hệ', value: `Gen.${clonedFish.fish.generation}`, inline: true },
          { name: '⭐ Độ hiếm', value: originalFish.rarity, inline: true },
          { name: '💰 Giá trị', value: Number(clonedFish.fish.value).toLocaleString(), inline: true }
        )
        .setTimestamp();

      // Cập nhật UI
      const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
      const dailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
      
      const ui = await this.createUIWithFishFood(
        updatedInventory, 
        userId, 
        guildId, 
        selectedFishId,
        undefined,
        false,
        undefined,
        undefined
      );
      
      const newEmbed = await ui.createEmbed();
      const newComponents = ui.createComponents();

      // Cập nhật UI chính
      await interaction.update({
        embeds: [newEmbed],
        components: newComponents,
      });

      // Gửi thông báo thành công
      await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('Error in handleClone:', error);
      await interaction.reply({ 
        content: '❌ Có lỗi xảy ra khi nhân bản cá!', 
        ephemeral: true 
      });
    }
  }

  private static async handleLevelUp(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    try {
      // Kiểm tra quyền admin
      const { FishBattleService } = await import('@/utils/fish-battle');
      const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
      
      if (!isAdmin) {
        return interaction.reply({ 
          content: '❌ Chỉ admin mới có thể sử dụng chức năng nâng cấp cá!', 
          ephemeral: true 
        });
      }

      // Lấy cá được chọn
      const selectedFishId = this.selectedFishMap.get(userId);
      if (!selectedFishId) {
        return interaction.reply({ 
          content: '❌ Vui lòng chọn một con cá để nâng cấp!', 
          ephemeral: true 
        });
      }

      // Lấy thông tin cá được chọn
      const inventory = await FishInventoryService.getFishInventory(userId, guildId);
      const selectedFish = inventory.items.find((item: any) => item.fish.id === selectedFishId);
      
      if (!selectedFish) {
        return interaction.reply({ 
          content: '❌ Không tìm thấy cá được chọn!', 
          ephemeral: true 
        });
      }

      const fish = selectedFish.fish;

      // Kiểm tra xem cá đã đạt level 10 chưa
      if (fish.level >= 10) {
        return interaction.reply({ 
          content: '❌ Cá này đã đạt level tối đa (10)!', 
          ephemeral: true 
        });
      }

      // Nâng cấp cá lên level 10
      const levelUpResult = await this.levelUpFishToMax(fish.id);
      
      if (!levelUpResult.success) {
        return interaction.reply({ 
          content: `❌ Lỗi khi nâng cấp cá: ${levelUpResult.error}`, 
          ephemeral: true 
        });
      }

      // Tạo embed thông báo thành công
      const successEmbed = new EmbedBuilder()
        .setTitle('🚀 Nâng Cấp Cá Thành Công!')
        .setColor('#00FF00')
        .addFields(
          { name: '🐟 Cá được nâng cấp', value: fish.species, inline: true },
          { name: '📊 Level cũ', value: `${fish.level}`, inline: true },
          { name: '📈 Level mới', value: '10', inline: true },
          { name: '⭐ Độ hiếm', value: fish.rarity, inline: true },
          { name: '💰 Giá trị cũ', value: Number(fish.value).toLocaleString(), inline: true },
          { name: '💰 Giá trị mới', value: Number(levelUpResult.newValue).toLocaleString(), inline: true }
        )
        .setTimestamp();

      // Cập nhật UI
      const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
      const dailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
      
      const ui = await this.createUIWithFishFood(
        updatedInventory, 
        userId, 
        guildId, 
        selectedFishId,
        undefined,
        false,
        undefined,
        undefined
      );
      
      const newEmbed = await ui.createEmbed();
      const newComponents = ui.createComponents();

      // Cập nhật UI chính
      await interaction.update({
        embeds: [newEmbed],
        components: newComponents,
      });

      // Gửi thông báo thành công
      await interaction.followUp({ embeds: [successEmbed], ephemeral: true });

    } catch (error) {
      console.error('Error in handleLevelUp:', error);
      await interaction.reply({ 
        content: '❌ Có lỗi xảy ra khi nâng cấp cá!', 
        ephemeral: true 
      });
    }
  }

  private static async createClonedFish(originalFish: any, userId: string, guildId: string): Promise<{ success: boolean; fish?: any; error?: string }> {
    try {
      const prisma = (await import('@/utils/prisma')).default;
      
      // Tạo cá nhân bản với thông tin giống hệt cá gốc
      const clonedFish = await prisma.fish.create({
        data: {
          userId,
          guildId,
          species: originalFish.species,
          level: originalFish.level,
          experience: originalFish.experience,
          rarity: originalFish.rarity,
          value: originalFish.value,
          generation: originalFish.generation, // Giữ nguyên thế hệ như cá gốc
          status: originalFish.status,
          stats: typeof originalFish.stats === 'string' ? originalFish.stats : JSON.stringify(originalFish.stats || {}),
          specialTraits: typeof originalFish.specialTraits === 'string' ? originalFish.specialTraits : JSON.stringify(originalFish.specialTraits || []),
          // Thêm thông tin nhân bản
          isCloned: true,
          clonedFrom: originalFish.id,
          clonedAt: new Date()
        }
      });

      return { success: true, fish: clonedFish };
    } catch (error) {
      console.error('Error creating cloned fish:', error);
      return { success: false, error: 'Lỗi database khi tạo cá nhân bản' };
    }
  }

  private static async levelUpFishToMax(fishId: string): Promise<{ success: boolean; newValue?: number; error?: string }> {
    try {
      const prisma = (await import('@/utils/prisma')).default;
      const { FishBreedingService } = await import('../../utils/fish-breeding');
      
      // Lấy thông tin cá hiện tại
      const currentFish = await prisma.fish.findUnique({
        where: { id: fishId }
      });

      if (!currentFish) {
        return { success: false, error: 'Không tìm thấy cá' };
      }

      // Kiểm tra xem cá đã đạt level 10 chưa
      if (currentFish.level >= 10) {
        return { success: false, error: 'Cá đã đạt level tối đa' };
      }

      // Tính toán giá trị mới dựa trên level 10
      // Mỗi level tăng 2% giá trị
      const levelBonus = (10 - currentFish.level) * 0.02;
      const newValue = Math.floor(Number(currentFish.value) * (1 + levelBonus));

      // Tăng stats cho cá gen 2+ từ level hiện tại lên level 10
      let newStats = currentFish.stats;
      if (currentFish.generation >= 2) {
        let currentStats = JSON.parse(currentFish.stats || '{}');
        
        // Tăng stats cho mỗi level từ level hiện tại lên level 10
        for (let level = currentFish.level; level < 10; level++) {
          currentStats = FishBreedingService.increaseStatsOnLevelUp(currentStats);
        }
        
        newStats = JSON.stringify(currentStats);
        console.log(`🚀 Level up stats for fish ${currentFish.species} (Gen ${currentFish.generation}):`, currentStats);
      }

      // Cập nhật cá lên level 10
      const updatedFish = await prisma.fish.update({
        where: { id: fishId },
        data: {
          level: 10,
          experience: 0, // Reset experience về 0 khi đạt max level
          value: BigInt(newValue),
          status: 'adult', // Tự động chuyển sang trạng thái trưởng thành
          stats: newStats, // Cập nhật stats mới
          updatedAt: new Date()
        }
      });

      return { success: true, newValue };
    } catch (error) {
      console.error('Error leveling up fish:', error);
      return { success: false, error: 'Lỗi database khi nâng cấp cá' };
    }
  }
} 