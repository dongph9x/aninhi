import { ButtonInteraction, StringSelectMenuInteraction, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { FishBreedingService } from '../../utils/fish-breeding';
import { FishInventoryService } from '../../utils/fish-inventory';
import { FishBarnUI } from './FishBarnUI';

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
    
    const ui = new FishBarnUI(
      inventory, 
      userId, 
      guildId, 
      finalSelectedFishId,
      selectedFoodType,
      breedingMode,
      selectedParent1Id,
      selectedParent2Id
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
          
        case 'fishbarn_back_to_barn':
          await this.handleBackToBarn(interaction, userId, guildId);
          break;
          
        default:
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

    // Cho cá ăn với thức ăn
    const result = await FishBreedingService.feedFishWithFood(userId, selectedFishId, selectedFoodType as any);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
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

    // Cập nhật UI
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

    const result = await FishInventoryService.sellFishFromInventory(userId, guildId, selectedFishId);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Xóa cá khỏi selected
    this.selectedFishMap.delete(userId);

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo embed thông báo
    const embed = new EmbedBuilder()
      .setTitle('💰 Bán Cá Thành Công!')
      .setColor('#FFD700')
      .addFields(
        { name: '🐟 Cá đã bán', value: result.fish?.name || 'Unknown', inline: true },
        { name: '💰 Số tiền nhận', value: (result.coinsEarned || 0).toLocaleString(), inline: true },
        { name: '💳 Số dư mới', value: (result.newBalance || 0).toLocaleString(), inline: true }
      );

    // Cập nhật UI
    const breedingData = this.breedingModeMap.get(userId);
    const ui = new FishBarnUI(
      updatedInventory, 
      userId, 
      guildId, 
      undefined,
      undefined,
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

    const result = await FishBreedingService.breedFish(userId, breedingData.selectedParent1Id, breedingData.selectedParent2Id);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Thêm cá con vào inventory
    if (result.offspring) {
      await FishInventoryService.addFishToInventory(userId, guildId, result.offspring.id);
    }

    // Tắt chế độ lai tạo
    this.breedingModeMap.delete(userId);

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo embed thông báo
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
          .setCustomId(JSON.stringify({ n: "BuyFishFood", d: {} }))
          .setPlaceholder("Chọn loại thức ăn...")
          .addOptions(
            Object.entries(FISH_FOOD_TYPES).map(([key, food]) => 
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
} 