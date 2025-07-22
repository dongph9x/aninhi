import { EmbedBuilder, ComponentType } from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { FishingService, FISHING_RODS } from "@/utils/fishing";

export default Bot.createMessageComponent<ComponentType.StringSelect, {}>({
    type: ComponentType.StringSelect,
    run: async ({ interaction }) => {
        try {
            const rodType = interaction.values[0];
            const userId = interaction.user.id;
            const guildId = interaction.guildId!;

            // Mua cần câu
            const result = await FishingService.buyRod(userId, guildId, rodType);

            const rodInfo = FISHING_RODS[rodType as keyof typeof FISHING_RODS];
            
            const successEmbed = new EmbedBuilder()
                .setTitle("🎣 Mua Cần Câu Thành Công!")
                .setDescription(
                    `**${interaction.user.username}** đã mua:\n\n` +
                    `${rodInfo.emoji} **${rodInfo.name}**\n` +
                    `🐟 **Giá:** ${rodInfo.price} FishCoin\n` +
                    `🛡️ **Độ bền:** ${rodInfo.durability} lần\n` +
                    `✨ **Bonus hiếm:** +${rodInfo.rarityBonus}%\n` +
                    `📝 **Mô tả:** ${rodInfo.description}\n\n` +
                    `✅ **Đã tự động đặt làm cần câu hiện tại!**`
                )
                .setColor("#00ff00")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [successEmbed], 
                ephemeral: true 
            });

        } catch (error: any) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription(error.message || "Đã xảy ra lỗi khi mua cần câu!")
                .setColor("#ff0000")
                .setTimestamp();

            await interaction.reply({ 
                embeds: [errorEmbed], 
                ephemeral: true 
            });
        }
    },
}); 