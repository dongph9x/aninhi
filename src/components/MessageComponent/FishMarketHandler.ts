import { FishMarketService } from '../../utils/fish-market';
import { FishInventoryService } from '../../utils/fish-inventory';
import { FishMarketUI } from './FishMarketUI';

interface MarketMessageData {
  userId: string;
  guildId: string;
  listings: any[];
  userListings: any[];
  userInventory: any;
  currentPage: number;
  totalPages: number;
  mode: 'browse' | 'sell' | 'my' | 'search';
  searchQuery: string;
  filterOptions: any;
  listedFishIds: string[];
  selectedFishId?: string;
}

export class FishMarketHandler {
  private static messageData = new Map<string, MarketMessageData>();

  static setMessageData(messageId: string, data: MarketMessageData) {
    this.messageData.set(messageId, data);
  }

  static getMessageData(messageId: string): MarketMessageData | undefined {
    return this.messageData.get(messageId);
  }

  static removeMessageData(messageId: string) {
    this.messageData.delete(messageId);
  }

  static async handleInteraction(interaction: any): Promise<boolean> {
    const customId = interaction.customId;
    
    if (!customId.startsWith('market_')) {
      return false;
    }

    const messageData = this.getMessageData(interaction.message.id);
    if (!messageData) {
      return false;
    }

    try {
      if (customId === 'market_close') {
        await this.handleClose(interaction);
        return true;
      }

      if (customId.startsWith('market_prev_') || customId.startsWith('market_next_')) {
        await this.handleNavigation(interaction, messageData);
        return true;
      }

      if (customId === 'market_browse') {
        await this.handleBrowse(interaction, messageData);
        return true;
      }

      if (customId === 'market_sell') {
        await this.handleSell(interaction, messageData);
        return true;
      }

      if (customId === 'market_my') {
        await this.handleMyListings(interaction, messageData);
        return true;
      }

      if (customId === 'market_search') {
        await this.handleSearch(interaction, messageData);
        return true;
      }

      if (customId === 'market_filter') {
        await this.handleFilter(interaction, messageData);
        return true;
      }

      if (customId === 'market_select_fish_to_sell') {
        await this.handleSelectFishToSell(interaction, messageData);
        return true;
      }

      if (customId === 'market_select_fish_to_cancel') {
        await this.handleSelectFishToCancel(interaction, messageData);
        return true;
      }

      if (customId === 'market_confirm_sell') {
        await this.handleConfirmSell(interaction, messageData);
        return true;
      }

      if (customId === 'market_confirm_cancel') {
        await this.handleConfirmCancel(interaction, messageData);
        return true;
      }

      if (customId === 'market_buy_fish') {
        await this.handleBuyFish(interaction, messageData);
        return true;
      }

    } catch (error) {
      console.error('Error handling market interaction:', error);
      await interaction.reply({ content: '❌ Có lỗi xảy ra!', ephemeral: true });
    }

    return true;
  }

  static async handleModalSubmit(interaction: any): Promise<boolean> {
    const customId = interaction.customId;
    
    if (customId === 'market_sell_modal') {
      return await this.handleSellModalSubmit(interaction);
    }
    
    return false;
  }

  private static async handleSellModalSubmit(interaction: any) {
    try {
      const priceInput = interaction.fields.getTextInputValue('market_price_input');
      const durationInput = interaction.fields.getTextInputValue('market_duration_input');
      
      // Validate price
      const price = parseInt(priceInput);
      if (isNaN(price) || price <= 0) {
        await interaction.reply({ content: '❌ Giá phải là số dương!', ephemeral: true });
        return true;
      }
      
      // Validate duration
      const duration = parseInt(durationInput) || 24;
      if (isNaN(duration) || duration <= 0 || duration > 168) { // Max 7 days
        await interaction.reply({ content: '❌ Thời gian phải từ 1-168 giờ!', ephemeral: true });
        return true;
      }
      
      // Get message data
      const messageData = this.getMessageData(interaction.message.id);
      if (!messageData || !messageData.selectedFishId) {
        await interaction.reply({ content: '❌ Không tìm thấy thông tin cá!', ephemeral: true });
        return true;
      }
      
      // Sell the fish
      const result = await FishMarketService.listFish(
        messageData.userId, 
        messageData.guildId, 
        messageData.selectedFishId, 
        price, 
        duration
      );
      
      if (result.success) {
        // Cập nhật dữ liệu
        const userListings = await FishMarketService.getUserListings(messageData.userId, messageData.guildId);
        const userInventory = await FishInventoryService.getFishInventory(messageData.userId, messageData.guildId);
        const listedFishIds = await FishMarketService.getListedFishIds(messageData.guildId);
        
        const updatedData: MarketMessageData = {
          ...messageData,
          userListings,
          userInventory,
          listedFishIds,
          selectedFishId: undefined // Reset selected fish
        };

        this.setMessageData(interaction.message.id, updatedData);

        const ui = new FishMarketUI(
          updatedData.listings,
          updatedData.userListings,
          updatedData.userInventory,
          updatedData.userId,
          updatedData.guildId,
          updatedData.currentPage,
          updatedData.totalPages,
          updatedData.mode,
          updatedData.searchQuery,
          updatedData.filterOptions,
          updatedData.listedFishIds
        );

        await interaction.update({
          embeds: [ui.createEmbed()],
          components: ui.createComponents()
        });
        
        await interaction.followUp({ 
          content: `✅ Đã treo bán **${result.listing.fish.name}** với giá **${price.toLocaleString()}** coins trong **${duration}h**!`, 
          ephemeral: true 
        });
      } else {
        await interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
      }
      
    } catch (error) {
      console.error('Error handling sell modal:', error);
      await interaction.reply({ content: '❌ Có lỗi xảy ra khi bán cá!', ephemeral: true });
    }
    
    return true;
  }

  private static async handleClose(interaction: any) {
    this.removeMessageData(interaction.message.id);
    await interaction.update({ content: '🏪 Fish Market đã đóng', embeds: [], components: [] });
  }

  private static async handleNavigation(interaction: any, messageData: MarketMessageData) {
    const customId = interaction.customId;
    let newPage = messageData.currentPage;

    if (customId.startsWith('market_prev_')) {
      newPage = parseInt(customId.split('_')[2]);
    } else if (customId.startsWith('market_next_')) {
      newPage = parseInt(customId.split('_')[2]);
    }

    // Lấy dữ liệu mới cho trang
    const result = await FishMarketService.getMarketListings(messageData.guildId, newPage, 5);
    
    // Cập nhật message data
    const updatedData: MarketMessageData = {
      ...messageData,
      listings: result.listings,
      currentPage: newPage,
      totalPages: result.totalPages,
      mode: 'browse'
    };

    this.setMessageData(interaction.message.id, updatedData);

    // Tạo UI mới
    const ui = new FishMarketUI(
      updatedData.listings,
      updatedData.userListings,
      updatedData.userInventory,
      updatedData.userId,
      updatedData.guildId,
      updatedData.currentPage,
      updatedData.totalPages,
      updatedData.mode
    );

    await interaction.update({
      embeds: [ui.createEmbed()],
      components: ui.createComponents()
    });
  }

  private static async handleBrowse(interaction: any, messageData: MarketMessageData) {
    // Lấy dữ liệu market mới
    const result = await FishMarketService.getMarketListings(messageData.guildId, 1, 5);
    
    const updatedData: MarketMessageData = {
      ...messageData,
      listings: result.listings,
      currentPage: 1,
      totalPages: result.totalPages,
      mode: 'browse'
    };

    this.setMessageData(interaction.message.id, updatedData);

    const ui = new FishMarketUI(
      updatedData.listings,
      updatedData.userListings,
      updatedData.userInventory,
      updatedData.userId,
      updatedData.guildId,
      updatedData.currentPage,
      updatedData.totalPages,
      updatedData.mode
    );

    await interaction.update({
      embeds: [ui.createEmbed()],
      components: ui.createComponents()
    });
  }

  private static async handleSell(interaction: any, messageData: MarketMessageData) {
    // Lấy inventory mới
    const userInventory = await FishInventoryService.getFishInventory(messageData.userId, messageData.guildId);
    
    // Lấy danh sách fish IDs đang được bán
    const listedFishIds = await FishMarketService.getListedFishIds(messageData.guildId);
    
    const updatedData: MarketMessageData = {
      ...messageData,
      userInventory,
      listedFishIds,
      mode: 'sell'
    };

    this.setMessageData(interaction.message.id, updatedData);

    const ui = new FishMarketUI(
      updatedData.listings,
      updatedData.userListings,
      updatedData.userInventory,
      updatedData.userId,
      updatedData.guildId,
      updatedData.currentPage,
      updatedData.totalPages,
      updatedData.mode,
      updatedData.searchQuery,
      updatedData.filterOptions,
      updatedData.listedFishIds
    );

    await interaction.update({
      embeds: [ui.createEmbed()],
      components: ui.createComponents()
    });
  }

  private static async handleMyListings(interaction: any, messageData: MarketMessageData) {
    // Lấy user listings mới
    const userListings = await FishMarketService.getUserListings(messageData.userId, messageData.guildId);
    
    const updatedData: MarketMessageData = {
      ...messageData,
      userListings,
      mode: 'my'
    };

    this.setMessageData(interaction.message.id, updatedData);

    const ui = new FishMarketUI(
      updatedData.listings,
      updatedData.userListings,
      updatedData.userInventory,
      updatedData.userId,
      updatedData.guildId,
      updatedData.currentPage,
      updatedData.totalPages,
      updatedData.mode
    );

    await interaction.update({
      embeds: [ui.createEmbed()],
      components: ui.createComponents()
    });
  }

  private static async handleSearch(interaction: any, messageData: MarketMessageData) {
    // Hiện tại chỉ chuyển về browse mode
    // Có thể mở rộng để có modal nhập từ khóa tìm kiếm
    await this.handleBrowse(interaction, messageData);
  }

  private static async handleFilter(interaction: any, messageData: MarketMessageData) {
    // Hiện tại chỉ chuyển về browse mode
    // Có thể mở rộng để có modal nhập điều kiện lọc
    await this.handleBrowse(interaction, messageData);
  }

  private static async handleSelectFishToSell(interaction: any, messageData: MarketMessageData) {
    const fishId = interaction.values[0];
    
    // Lưu fishId được chọn vào message data
    const updatedData: MarketMessageData = {
      ...messageData,
      selectedFishId: fishId
    };

    this.setMessageData(interaction.message.id, updatedData);

    // Hiển thị modal nhập giá
    const fish = messageData.userInventory.items.find((item: any) => item.fish.id === fishId)?.fish;
    
    // Kiểm tra xem cá có thuộc về user hiện tại không
    if (fish && fish.userId === messageData.userId) {
      const stats = fish.stats || {};
      const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
      
      // Tính giá gợi ý dựa trên level và power
      const suggestedPrice = Math.floor(fish.value * (1 + (fish.level - 1) * 0.1) + totalPower * 100);
      
      const modal = new (await import('discord.js')).ModalBuilder()
        .setCustomId('market_sell_modal')
        .setTitle(`Bán ${fish.name}`);

      const priceInput = new (await import('discord.js')).TextInputBuilder()
        .setCustomId('market_price_input')
        .setLabel('Giá bán (coins)')
        .setStyle((await import('discord.js')).TextInputStyle.Short)
        .setPlaceholder(`Nhập giá bán (gợi ý: ${suggestedPrice.toLocaleString()})`)
        .setValue(suggestedPrice.toString())
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(10);

      const durationInput = new (await import('discord.js')).TextInputBuilder()
        .setCustomId('market_duration_input')
        .setLabel('Thời gian bán (giờ)')
        .setStyle((await import('discord.js')).TextInputStyle.Short)
        .setPlaceholder('Nhập số giờ (mặc định: 24)')
        .setValue('24')
        .setRequired(false)
        .setMinLength(1)
        .setMaxLength(3);

      const firstActionRow = new (await import('discord.js')).ActionRowBuilder<TextInputBuilder>().addComponents(priceInput);
      const secondActionRow = new (await import('discord.js')).ActionRowBuilder<TextInputBuilder>().addComponents(durationInput);

      modal.addComponents(firstActionRow, secondActionRow);

      await interaction.showModal(modal);
    } else {
      await interaction.reply({ 
        content: '❌ Cá không tồn tại hoặc không thuộc về bạn!', 
        ephemeral: true 
      });
    }
  }

  private static async handleSelectFishToCancel(interaction: any, messageData: MarketMessageData) {
    const fishId = interaction.values[0];
    
    // Hủy listing
    const result = await FishMarketService.cancelListing(messageData.userId, messageData.guildId, fishId);
    
    if (result.success) {
      // Cập nhật dữ liệu
      const userListings = await FishMarketService.getUserListings(messageData.userId, messageData.guildId);
      const userInventory = await FishInventoryService.getFishInventory(messageData.userId, messageData.guildId);
      
      const updatedData: MarketMessageData = {
        ...messageData,
        userListings,
        userInventory
      };

      this.setMessageData(interaction.message.id, updatedData);

      const ui = new FishMarketUI(
        updatedData.listings,
        updatedData.userListings,
        updatedData.userInventory,
        updatedData.userId,
        updatedData.guildId,
        updatedData.currentPage,
        updatedData.totalPages,
        updatedData.mode
      );

      await interaction.update({
        embeds: [ui.createEmbed()],
        components: ui.createComponents()
      });
    } else {
      await interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
    }
  }

  private static async handleConfirmSell(interaction: any, messageData: MarketMessageData) {
    // Xử lý xác nhận bán cá
    await interaction.reply({ content: '✅ Tính năng này sẽ được mở rộng!', ephemeral: true });
  }

  private static async handleConfirmCancel(interaction: any, messageData: MarketMessageData) {
    // Xử lý xác nhận hủy listing
    await interaction.reply({ content: '✅ Tính năng này sẽ được mở rộng!', ephemeral: true });
  }

  private static async handleBuyFish(interaction: any, messageData: MarketMessageData) {
    // Xử lý mua cá
    await interaction.reply({ content: '✅ Tính năng này sẽ được mở rộng!', ephemeral: true });
  }
} 