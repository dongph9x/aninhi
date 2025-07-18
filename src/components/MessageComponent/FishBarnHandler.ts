import { ButtonInteraction, StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';
import { FishBreedingService } from '../../utils/fish-breeding';
import { FishInventoryService } from '../../utils/fish-inventory';
import { FishBarnUI } from './FishBarnUI';

export class FishBarnHandler {
  // Lưu trữ cá được chọn cho mỗi user
  private static selectedFishMap = new Map<string, string>();
  // Lưu trữ chế độ lai tạo cho mỗi user
  private static breedingModeMap = new Map<string, {
    breedingMode: boolean;
    selectedParent1Id?: string;
    selectedParent2Id?: string;
  }>();

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
    this.breedingModeMap.delete(userId);
    
    await interaction.update({
      content: '🐟 Rương nuôi cá đã được đóng!',
      embeds: [],
      components: [],
    });
  }

  private static async handleFeed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = this.selectedFishMap.get(userId);
    
    if (!selectedFishId) {
      return interaction.reply({ 
        content: '❌ Vui lòng chọn một con cá trước khi cho ăn!', 
        ephemeral: true 
      });
    }

    // Kiểm tra quyền admin
    const member = await interaction.guild?.members.fetch(userId);
    const isAdmin = member?.permissions.has('Administrator') || false;

    const result = await FishBreedingService.feedFish(userId, selectedFishId, isAdmin);
    
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
    const ui = new FishBarnUI(
      updatedInventory, 
      userId, 
      guildId, 
      selectedFishId,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    const newEmbed = ui.createEmbed();
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
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    const newEmbed = ui.createEmbed();
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

    // Cập nhật UI
    const ui = new FishBarnUI(inventory, userId, guildId, undefined, true);
    const newEmbed = ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });
  }

  private static async handleSelectFish(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = interaction.values[0];
    this.selectedFishMap.set(userId, selectedFishId);

    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Cập nhật UI
    const breedingData = this.breedingModeMap.get(userId);
    const ui = new FishBarnUI(
      inventory, 
      userId, 
      guildId, 
      selectedFishId,
      breedingData?.breedingMode || false,
      breedingData?.selectedParent1Id,
      breedingData?.selectedParent2Id
    );
    const newEmbed = ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
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

    // Cập nhật UI
    const ui = new FishBarnUI(
      inventory, 
      userId, 
      guildId, 
      undefined,
      true,
      breedingData.selectedParent1Id,
      breedingData.selectedParent2Id
    );
    const newEmbed = ui.createEmbed();
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

    // Cập nhật UI
    const ui = new FishBarnUI(updatedInventory, userId, guildId);
    const newEmbed = ui.createEmbed();
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
    
    // Cập nhật UI
    const ui = new FishBarnUI(inventory, userId, guildId, this.selectedFishMap.get(userId));
    const newEmbed = ui.createEmbed();
    const newComponents = ui.createComponents();

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });
  }
} 