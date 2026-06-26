import { FishMarketService } from '../../utils/fish-market';
import { FishInventoryService } from '../../utils/fish-inventory';
import { FishMarketUI } from '../MessageComponent/FishMarketUI';
import { FishMarketHandler } from '../MessageComponent/FishMarketHandler';

export default {
    customId: 'market_sell_modal',
    run: async ({ interaction }) => {
        try {
            const priceInput = interaction.fields.getTextInputValue('market_price_input');
            const durationInput = interaction.fields.getTextInputValue('market_duration_input');
            
            // Validate price
            const price = parseInt(priceInput);
            if (isNaN(price) || price <= 0) {
                await interaction.reply({ content: '❌ Giá phải là số dương!', ephemeral: true });
                return;
            }
            
            // Validate duration
            const duration = parseInt(durationInput) || 24;
            if (isNaN(duration) || duration <= 0 || duration > 168) { // Max 7 days
                await interaction.reply({ content: '❌ Thời gian phải từ 1-168 giờ!', ephemeral: true });
                return;
            }
            
            // Get message data
            const messageData = FishMarketHandler.getMessageData(interaction.message.id);
            if (!messageData || !messageData.selectedFishId) {
                await interaction.reply({ content: '❌ Không tìm thấy thông tin cá!', ephemeral: true });
                return;
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
                
                const updatedData = {
                    ...messageData,
                    userListings,
                    userInventory,
                    listedFishIds,
                    selectedFishId: undefined // Reset selected fish
                };

                FishMarketHandler.setMessageData(interaction.message.id, updatedData);

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
                    content: `✅ Đã treo bán **${result.listing.fish.name}** với giá **${price.toLocaleString()}** FishCoin trong **${duration}h**!`, 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ content: `❌ ${result.error}`, ephemeral: true });
            }
            
        } catch (error) {
            console.error('Error handling sell modal:', error);
            await interaction.reply({ content: '❌ Có lỗi xảy ra khi bán cá!', ephemeral: true });
        }
    }
}; 