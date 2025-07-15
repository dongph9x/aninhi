import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";

export default Bot.createCommand({
    structure: {
        name: "test",
        aliases: ["pingtest"],
    },
    run: async ({ message, t, args }) => {
        const embed = new EmbedBuilder()
            .setTitle("✅ Bot Hoạt Động")
            .setDescription("Bot đang hoạt động bình thường!")
            .setColor("#51cf66")
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
}); 