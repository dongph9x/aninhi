import { ActionRowBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config, emojis } from "@/config";
import categories from "@/config/categories";
import { componentData } from "@/utils/helpers";

export default Bot.createSlashCommand({
    metadata: builder => {
        builder
            .setName("help")
            .setDescription(
                "Get a list of all categories or information about a specific slash command.",
            )
            .setDescriptionLocalization(
                "vi",
                "Truy cập danh sách tất cả các danh mục hoặc thông tin về một lệnh slash cụ thể.",
            );
    },
    run: async ({ client, interaction, locale, t }) => {
        const entries = Object.entries(categories);

        const helpEmbed = new EmbedBuilder()
            .setAuthor({
                name: t("commands.help.category", client.user.displayName),
                iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(`${emojis.small_diamond} ${t("commands.help.prefix", config.prefix)}`)
            .addFields(
                {
                    name: `${emojis.folder} ${t("commands.help.field")}:`,
                    value: `>>> ${entries.map(([, value]) => `${value.icon} **${value.name[locale]}** - ${value.description[locale]}`).join("\n")}`,
                },
                {
                    name: `${emojis.tools} ${t("commands.help.support.title")}:`,
                    value: t("commands.help.support.description", process.env.SUPPORT_GUILD_INVITE),
                },
            )
            .setFooter({
                text: t("commands.help.footer", process.env.SUPPORT_NAME),
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor(config.embedColor)
            .setTimestamp();

        const selector = new StringSelectMenuBuilder()
            .setPlaceholder(t("commands.help.selector.category"))
            .setCustomId(componentData("HelpCategory", true))
            .setOptions(
                entries.map(([key, value]) => ({
                    description: value.description[locale],
                    label: value.name[locale],
                    emoji: value.icon,
                    value: key,
                })),
            );

        const row = new ActionRowBuilder<StringSelectMenuBuilder>();
        row.addComponents(selector);

        interaction.reply({ embeds: [helpEmbed], components: [row] });
    },
});
