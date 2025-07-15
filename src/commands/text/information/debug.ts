import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";

export default Bot.createCommand({
    structure: {
        name: "debug",
        aliases: ["debugcommands"],
    },
    run: async ({ message, t, args }) => {
        const client = message.client;
        const allCommands = Array.from(client.text.commands.keys());
        const categories = Array.from(client.text.categories.keys());
        
        const embed = new EmbedBuilder()
            .setTitle("🔧 Debug Commands")
            .setDescription(`Bot đã load **${allCommands.length}** lệnh từ **${categories.length}** categories.`)
            .addFields(
                {
                    name: "📁 Categories",
                    value: categories.join(", ") || "Không có categories",
                    inline: false,
                },
                {
                    name: "📝 All Commands",
                    value: allCommands.slice(0, 20).join(", ") + (allCommands.length > 20 ? `\n... và ${allCommands.length - 20} lệnh khác` : ""),
                    inline: false,
                }
            )
            .setColor("#ffa5f8")
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
}); 