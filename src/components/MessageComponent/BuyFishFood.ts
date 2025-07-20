import { 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ComponentType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    TextInputBuilder
} from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishFoodService, FISH_FOOD_TYPES } from "@/utils/fish-food";

export default Bot.createMessageComponent<ComponentType.StringSelect, {}>({
    type: ComponentType.StringSelect,
    run: async ({ interaction }) => {
        try {
            const foodType = interaction.values[0];
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Kiểm tra loại thức ăn có tồn tại không
            if (!FISH_FOOD_TYPES[foodType as keyof typeof FISH_FOOD_TYPES]) {
                await interaction.reply({ 
                    content: "❌ Loại thức ăn không tồn tại!", 
                    ephemeral: true 
                });
                return;
            }

            const foodInfo = FISH_FOOD_TYPES[foodType as keyof typeof FISH_FOOD_TYPES];

            // Hiển thị modal nhập số lượng
            const modal = new (await import('discord.js')).ModalBuilder()
                .setCustomId(`buy_fish_food_modal:${foodType}`)
                .setTitle(`Mua ${foodInfo.name}`);

            const quantityInput = new (await import('discord.js')).TextInputBuilder()
                .setCustomId('food_quantity_input')
                .setLabel('Số lượng')
                .setStyle((await import('discord.js')).TextInputStyle.Short)
                .setPlaceholder(`Nhập số lượng (mặc định: 1)`)
                .setValue('1')
                .setRequired(true)
                .setMinLength(1)
                .setMaxLength(3);

            const actionRow = new (await import('discord.js')).ActionRowBuilder<TextInputBuilder>().addComponents(quantityInput);
            modal.addComponents(actionRow);

            // Lưu thông tin thức ăn vào interaction để sử dụng sau
            (interaction as any).foodType = foodType;

            await interaction.showModal(modal);

        } catch (error: any) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(error.message || "Đã xảy ra lỗi!")
                .setColor("#ff0000")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    },
}); 