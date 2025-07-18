import { ButtonInteraction, StringSelectMenuInteraction, EmbedBuilder } from 'discord.js';
import { FishBreedingService } from '../../utils/fish-breeding';
import { FishInventoryService } from '../../utils/fish-inventory';
import { FishBarnUI } from './FishBarnUI';

export class FishBarnHandler {
  // Lưu trữ cá được chọn cho mỗi user
  private static selectedFishMap = new Map<string, string>();

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
          
        default:
          await interaction.reply({ content: '❌ Lỗi: Không nhận diện được action!', ephemeral: true });
      }
    } catch (error) {
      console.error('Error in FishBarnHandler:', error);
      await interaction.reply({ content: '❌ Có lỗi xảy ra!', ephemeral: true });
    }
  }

  private static async handleClose(interaction: ButtonInteraction | StringSelectMenuInteraction) {
    await interaction.update({
      content: '✅ Đã đóng rương nuôi cá!',
      embeds: [],
      components: [],
    });
  }

  private static async handleFeed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    // Kiểm tra quyền admin
    const member = await interaction.guild?.members.fetch(userId);
    const isAdmin = member?.permissions.has('Administrator') || false;

    console.log(`Admin status for ${userId}: ${isAdmin}`);

    // Lấy inventory hiện tại
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    if (inventory.items.length === 0) {
      return interaction.reply({ content: '❌ Bạn không có cá nào để cho ăn!', ephemeral: true });
    }

    // Kiểm tra xem có cá được chọn không
    const selectedFishId = this.selectedFishMap.get(userId);
    let targetFish;

    if (selectedFishId) {
      // Tìm cá được chọn trong inventory
      targetFish = inventory.items.find((item: any) => item.fish.id === selectedFishId);
      
      if (!targetFish) {
        // Cá được chọn không còn trong inventory (có thể đã bị xóa)
        this.selectedFishMap.delete(userId);
        return interaction.reply({ content: '❌ Cá được chọn không còn trong rương! Vui lòng chọn lại.', ephemeral: true });
      }

      // Kiểm tra xem cá có đang lớn không
      if (targetFish.fish.status === 'adult') {
        return interaction.reply({ content: '❌ Cá này đã trưởng thành! Không thể cho ăn thêm.', ephemeral: true });
      }
    } else {
      // Nếu chưa chọn cá, tìm cá đang lớn đầu tiên
      targetFish = inventory.items.find((item: any) => item.fish.status === 'growing');
      
      if (!targetFish) {
        return interaction.reply({ content: '❌ Tất cả cá đã trưởng thành!', ephemeral: true });
      }
    }

    // Cho cá ăn
    const result = await FishBreedingService.feedFish(userId, targetFish.fish.id, isAdmin);
    
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
        { name: '🐟 Cá', value: result.fish.name, inline: true },
        { name: '📈 Kinh nghiệm', value: `+${result.experienceGained}`, inline: true },
        { name: '💰 Giá trị mới', value: (result.newValue || result.fish.value).toLocaleString(), inline: true }
      );

    if (result.leveledUp) {
      embed.addFields({ name: '🎉 Lên cấp!', value: `Cấp ${result.fish.level}`, inline: true });
    }

    if (result.becameAdult) {
      embed.addFields({ name: '🐟 Trưởng thành!', value: 'Cá đã có thể lai tạo!', inline: true });
    }

    // Cập nhật UI với cá được chọn
    const ui = new FishBarnUI(updatedInventory, userId, guildId, selectedFishId);
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
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    if (inventory.items.length === 0) {
      return interaction.reply({ content: '❌ Bạn không có cá nào để bán!', ephemeral: true });
    }

    // Kiểm tra xem có cá được chọn không
    const selectedFishId = this.selectedFishMap.get(userId);
    let targetFish;

    if (selectedFishId) {
      // Tìm cá được chọn trong inventory
      targetFish = inventory.items.find((item: any) => item.fish.id === selectedFishId);
      
      if (!targetFish) {
        // Cá được chọn không còn trong inventory (có thể đã bị xóa)
        this.selectedFishMap.delete(userId);
        return interaction.reply({ content: '❌ Cá được chọn không còn trong rương! Vui lòng chọn lại.', ephemeral: true });
      }
    } else {
      // Nếu chưa chọn cá, bán cá có giá trị cao nhất
      targetFish = inventory.items.reduce((prev: any, current: any) => 
        prev.fish.value > current.fish.value ? prev : current
      );
    }

    const result = await FishInventoryService.sellFishFromInventory(userId, guildId, targetFish.fish.id);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Xóa cá được chọn khỏi map nếu đã bán
    if (selectedFishId) {
      this.selectedFishMap.delete(userId);
    }

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo embed thông báo
    const embed = new EmbedBuilder()
      .setTitle('💰 Bán Cá Thành Công!')
      .setColor('#FFD700')
      .addFields(
        { name: '🐟 Cá đã bán', value: result.fish.name, inline: true },
        { name: '💰 Số tiền nhận', value: result.coinsEarned.toLocaleString(), inline: true },
        { name: '💳 Số dư mới', value: result.newBalance.toLocaleString(), inline: true }
      );

    // Cập nhật UI (không có cá được chọn vì đã bán)
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

  private static async handleBreed(interaction: ButtonInteraction | StringSelectMenuInteraction, userId: string, guildId: string) {
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tìm 2 cá trưởng thành
    const adultFish = inventory.items.filter((item: any) => item.fish.status === 'adult');
    
    if (adultFish.length < 2) {
      return interaction.reply({ 
        content: '❌ Cần ít nhất 2 cá trưởng thành để lai tạo!', 
        ephemeral: true 
      });
    }

    // Chọn 2 cá đầu tiên
    const fish1 = adultFish[0].fish;
    const fish2 = adultFish[1].fish;

    const result = await FishBreedingService.breedFish(userId, fish1.id, fish2.id);
    
    if (!result.success) {
      return interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }

    // Thêm cá con vào inventory
    await FishInventoryService.addFishToInventory(userId, guildId, result.offspring.id);

    // Cập nhật inventory
    const updatedInventory = await FishInventoryService.getFishInventory(userId, guildId);
    
    // Tạo embed thông báo
    const embed = new EmbedBuilder()
      .setTitle('❤️ Lai Tạo Thành Công!')
      .setColor('#FF69B4')
      .addFields(
        { name: '🐟 Cá bố', value: result.parent1.name, inline: true },
        { name: '🐟 Cá mẹ', value: result.parent2.name, inline: true },
        { name: '🐠 Cá con', value: result.offspring.name, inline: true },
        { name: '💰 Giá trị', value: result.offspring.value.toLocaleString(), inline: true },
        { name: '🏷️ Thế hệ', value: result.offspring.generation.toString(), inline: true }
      );

    // Cập nhật UI (không có cá được chọn vì đã lai tạo)
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

  private static async handleSelectFish(interaction: StringSelectMenuInteraction, userId: string, guildId: string) {
    const selectedFishId = interaction.values[0];
    
    console.log(`🔍 handleSelectFish - selectedFishId: ${selectedFishId}`);
    
    if (!selectedFishId) {
      return interaction.reply({ content: '❌ Không tìm thấy cá được chọn!', ephemeral: true });
    }

    // Lưu cá được chọn
    this.selectedFishMap.set(userId, selectedFishId);
    console.log(`💾 Saved selectedFishId for user ${userId}: ${selectedFishId}`);

    // Lấy thông tin cá
    const fish = await FishBreedingService.getFishById(userId, selectedFishId);
    
    if (!fish) {
      return interaction.reply({ content: '❌ Không tìm thấy cá!', ephemeral: true });
    }

    // Cập nhật UI với cá được chọn
    const inventory = await FishInventoryService.getFishInventory(userId, guildId);
    const ui = new FishBarnUI(inventory, userId, guildId, selectedFishId);
    const newEmbed = ui.createEmbed();
    const newComponents = ui.createComponents();

    console.log(`🎨 Creating UI with selectedFishId: ${selectedFishId}`);
    console.log(`📊 Embed fields count: ${newEmbed.data.fields?.length || 0}`);

    await interaction.update({
      embeds: [newEmbed],
      components: newComponents,
    });

    // Gửi thông báo xác nhận
    const confirmEmbed = new EmbedBuilder()
      .setTitle(`✅ ${fish.name} đã được chọn!`)
      .setColor('#00FF00')
      .setDescription('Bây giờ bạn có thể sử dụng các nút bên trên để thao tác với cá này.')
      .setTimestamp();

    await interaction.followUp({ embeds: [confirmEmbed], ephemeral: true });
  }
} 