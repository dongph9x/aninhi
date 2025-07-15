import { type ColorResolvable, EmbedBuilder } from "discord.js";
import { inspect } from "util";

import { Bot } from "@/classes";
import { config, emojis } from "@/config";

export default Bot.createCommand({
    structure: {
        name: "eval",
        aliases: ["exec"],
    },
    options: { onlyDev: true },
    includeContent: true,
    hidden: true,
    run: async ({ client, message, args, content }) => {
        if (!message.channel.isSendable()) return;

        if (args.length === 0) {
            return message.reply(`${emojis.error} | Hãy nhập 1 code Javascript để chạy.`);
        }

        const resultEmbed = new EmbedBuilder()
            .setFooter({
                text: `Gỡ lỗi cho ${client.user.username}`,
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor(config.embedColor as ColorResolvable)
            .setTimestamp();

        const speed = Date.now() - message.createdTimestamp;

        try {
            const executed = await eval(content);

            resultEmbed
                .setAuthor({
                    name: "Đã thành công!",
                    iconURL: client.user.displayAvatarURL(),
                })
                .addFields(
                    {
                        name: "・Type",
                        value: `\`\`\`prolog\n${typeof executed}\`\`\``,
                    },
                    {
                        name: "・Speed",
                        value: `\`\`\`ytml\n${speed}ms\`\`\``,
                    },
                    {
                        name: "・Code",
                        value: `\`\`\`js\n${content}\`\`\``,
                    },
                    {
                        name: "・Output",
                        value: `\`\`\`js\n${inspect(executed, { depth: 0 })}\`\`\``,
                    },
                );
        } catch (error: unknown) {
            const fullError = error as Error;

            resultEmbed
                .setAuthor({
                    name: "Đã thất bại.",
                    iconURL: client.user.displayAvatarURL(),
                })
                .addFields(
                    {
                        name: "・Code",
                        value: `\`\`\`js\n${content}\`\`\``,
                    },
                    {
                        name: "・Error",
                        value: `\`\`\`js\n${fullError.name}: ${fullError.message}\`\`\``,
                    },
                );
        }

        message.channel.send({ embeds: [resultEmbed] });
    },
});
