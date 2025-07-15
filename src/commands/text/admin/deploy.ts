import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config, emojis } from "@/config";
import { logger } from "@/utils/logger";

export default Bot.createCommand({
    structure: {
        name: "deploy",
        aliases: ["reload"],
    },
    options: { onlyDev: true, inGuild: true },
    hidden: true,
    run: async ({ client, message }) => {
        const embed = new EmbedBuilder()
            .setDescription(`${emojis.info} | Đang reload **${client.slash.commands.size}** lệnh.`)
            .setColor(config.embedColor);

        const awaitMessage = await message.reply({ embeds: [embed] });

        const commands = client.slash.commands.map(cmd => cmd.builder.toJSON());
        const contextMenus = client.menu.map(menu => menu.builder.toJSON());

        try {
            await message.guild.commands.set([...commands, ...contextMenus]);
            await message.guild.commands.fetch();

            embed.setDescription(
                `${emojis.small_diamond} | Đã reload thành công **${client.slash.commands.size}** lệnh.\n` +
                    `${emojis.small_diamond} **${client.menu.size}** context menu đã sẵn sàng.`,
            );

            awaitMessage.edit({ embeds: [embed] });
        } catch (error) {
            awaitMessage.edit(`${emojis.error} | Có lỗi xảy ra khi đang reload lệnh.`);
            logger.error(error);
        }
    },
});
