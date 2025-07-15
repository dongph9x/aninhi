import { ComponentType, EmbedBuilder, MessageFlags } from "discord.js";

import { Bot } from "@/classes";
import { config, emojis } from "@/config";
import categories from "@/config/categories";
import commands from "@/config/text-commands";
import type { BaseSlashCommandBuilder, TextCommandStructrue } from "@/typings";

export default Bot.createMessageComponent<ComponentType.StringSelect, boolean>({
    type: ComponentType.StringSelect,
    run: async ({ client, interaction, locale, data, t }) => {
        const option = interaction.values[0];

        // "data" is true if the user use the slash command "help"
        // "data" is false if the user use the text command "help"
        const categoryCmds = data
            ? client.slash.categories.get(option)
            : client.text.categories.get(option);

        if (!categoryCmds) {
            return interaction.reply({
                content: `${emojis.error} | ${t(data ? "commands.help.commands.notSupportSlash" : "commands.help.commands.notSupportText")}`,
                flags: MessageFlags.Ephemeral,
            });
        }

        await interaction.deferUpdate();

        const categoryData = categories[option];
        const displayCategoryCmds: string[] = [];

        if (data) {
            for (const cmd of categoryCmds as BaseSlashCommandBuilder[]) {
                displayCategoryCmds.push(
                    `\`${cmd.name}\` - ${
                        locale === "vi" && cmd.description_localizations?.vi
                            ? cmd.description_localizations.vi
                            : cmd.description
                    }`,
                );
            }
        } else {
            for (const cmd of categoryCmds as TextCommandStructrue[]) {
                displayCategoryCmds.push(
                    `\`${cmd.name}\` - ${commands[cmd.name].description[locale]}`,
                );
            }
        }

        const embed = new EmbedBuilder()
            .setAuthor({
                name: t("commands.help.commands.category", categoryData.name[locale]),
                iconURL: client.user.displayAvatarURL(),
            })
            .setDescription(
                `${emojis.small_diamond} ${t("commands.help.prefix", config.prefix)}` +
                    `\n${emojis.small_diamond} ${categoryData.description[locale]}`,
            )
            .addFields(
                {
                    name: `${emojis.folder} ${t("commands.help.commands.categories")}`,
                    value: `>>> ${displayCategoryCmds.join("\n")}`,
                },
                {
                    name: `${emojis.tools} ${t("commands.help.support.title")}:`,
                    value: t("commands.help.support.description", process.env.SUPPORT_GUILD_INVITE),
                },
            )
            .setColor(config.embedColor)
            .setTimestamp()
            .setFooter({
                text: t("commands.help.footer", process.env.SUPPORT_NAME),
                iconURL: client.user.displayAvatarURL(),
            });

        interaction.message.edit({ embeds: [embed] });
    },
});
