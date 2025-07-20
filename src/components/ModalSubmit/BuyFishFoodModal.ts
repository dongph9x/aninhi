import { FishFoodService } from '../../utils/fish-food';

export default {
    customId: 'buy_fish_food_modal',
    run: async ({ interaction }) => {
        try {
            const quantityInput = interaction.fields.getTextInputValue('food_quantity_input');
            
            // Validate quantity
            const quantity = parseInt(quantityInput);
            if (isNaN(quantity) || quantity <= 0 || quantity > 100) {
                await interaction.reply({ 
                    content: '❌ Số lượng phải từ 1-100!', 
                    ephemeral: true 
                });
                return;
            }

            // Lấy thông tin thức ăn từ customId
            const customIdParts = interaction.customId.split(':');
            const foodType = customIdParts[1];
            
            if (!foodType) {
                await interaction.reply({ 
                    content: '❌ Không tìm thấy thông tin thức ăn!', 
                    ephemeral: true 
                });
                return;
            }

            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Mua thức ăn
            const result = await FishFoodService.buyFishFood(userId, guildId, foodType, quantity);
            
            if (result.success) {
                const embed = new (await import('discord.js')).EmbedBuilder()
                    .setTitle("✅ Mua Thức Ăn Thành Công!")
                    .setColor("#00ff00")
                    .setDescription(`Đã mua **${quantity}x ${result.foodInfo.name}**`)
                    .addFields(
                        { name: "💰 Giá", value: `${result.totalCost.toLocaleString()} coins`, inline: true },
                        { name: "🍽️ Exp Bonus", value: `+${result.foodInfo.expBonus} exp/lần`, inline: true },
                        { name: "📦 Số lượng", value: `${quantity}`, inline: true }
                    )
                    .setTimestamp();

                await interaction.reply({ 
                    embeds: [embed], 
                    ephemeral: true 
                });
            } else {
                await interaction.reply({ 
                    content: `❌ ${result.error}`, 
                    ephemeral: true 
                });
            }
            
        } catch (error) {
            console.error('Error handling buy fish food modal:', error);
            await interaction.reply({ 
                content: '❌ Có lỗi xảy ra khi mua thức ăn!', 
                ephemeral: true 
            });
        }
    }
}; 