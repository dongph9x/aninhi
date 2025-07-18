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
    
    const updatedData: MarketMessageData = {
      ...messageData,
      userInventory,
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
      updatedData.mode
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

    // Hiển thị thông tin cá và yêu cầu nhập giá
    const fish = messageData.userInventory.items.find((item: any) => item.fish.id === fishId)?.fish;
    
    if (fish) {
      const stats = fish.stats || {};
      const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
      
      const embed = new (await import('discord.js')).EmbedBuilder()
        .setTitle("💰 Bán Cá")
        .setColor("#4ECDC4")
        .setDescription(`Bạn đã chọn **${fish.name}** để bán`)
        .addFields(
          { name: "📊 Thông tin cá", value: `Level: ${fish.level} | Gen: ${fish.generation} | Power: ${totalPower}`, inline: true },
          { name: "📈 Stats", value: `💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0}`, inline: false },
          { name: "💡 Hướng dẫn", value: "Sử dụng lệnh: `n.fishmarket sell " + fishId + " <giá> [thời_gian_giờ]`\nVí dụ: `n.fishmarket sell " + fishId + " 50000 48`", inline: false }
        )
        .setTimestamp();

      await interaction.update({
        embeds: [embed],
        components: []
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