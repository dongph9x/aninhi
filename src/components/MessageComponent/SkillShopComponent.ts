import { 
    ButtonBuilder, 
    ButtonStyle, 
    EmbedBuilder, 
    ComponentType,
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} from "discord.js";

import { Bot } from "@/classes";
import type { MessageComponentProps } from "@/typings";
import { SkillShopHandler } from "./SkillShopHandler";

export default Bot.createMessageComponent<ComponentType.Button, { action: string }>({
    type: ComponentType.Button,
    run: async ({ interaction, data }) => {
        try {
            await SkillShopHandler.handleInteraction(interaction);
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

// Handler cho StringSelectMenu
export const SkillShopSelectMenu = Bot.createMessageComponent<ComponentType.StringSelect, { action: string }>({
    type: ComponentType.StringSelect,
    run: async ({ interaction, data }) => {
        try {
            await SkillShopHandler.handleInteraction(interaction);
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
