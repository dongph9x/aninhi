import { Bot, SubCommand } from "@/classes";
import { autocomplete, emojis } from "@/config";
import type { CustomIdData } from "@/typings";
import { i18n } from "@/utils/locales";
import { logger } from "@/utils/logger";

export default Bot.createEvent({
    eventName: "interactionCreate",
    emit: async (client, interaction) => {
        if (interaction.isChatInputCommand()) {
            const { t, locale } = await i18n(interaction.guildId);

            const command = client.slash.commands.get(interaction.commandName);
            if (!command) {
                logger.error(`Command "${interaction.commandName}" doesn't exist.`);
                return interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
            }

            const pull = SubCommand.handleGetPullSlashCommand(command, interaction);
            if (typeof pull.run !== "function") {
                logger.error(`Command "${interaction.commandName}" doesn't have run function.`);
                return interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
            }

            try {
                if (!client.filter.slash(interaction, t, pull.options)) return;
                pull.run({ client, interaction, t, locale });
            } catch (error) {
                interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                logger.error(error);
            }

            return;
        }

        if (interaction.isMessageComponent()) {
            if (interaction.customId.startsWith("Collector:")) return;

            const { t, locale } = await i18n(interaction.guildId);

            try {
                const payload: CustomIdData = JSON.parse(interaction.customId);
                const component = client.components.message.get(payload.n);

                if (!component) {
                    logger.error(`Component "${payload.n}" doesn't exist.`);
                    return interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                }

                if (interaction.componentType !== component.type) {
                    logger.error(
                        `Component "${payload.n}" is "${component.type}", receive ${interaction.componentType}`,
                    );

                    return interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                }

                if (!client.filter.slash(interaction, t, component.options)) return;
                component.run({ client, interaction, t, locale, data: payload.d });
            } catch (error) {
                interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                logger.error({ id: interaction.customId, error });
            }

            return;
        }

        if (interaction.isModalSubmit()) {
            const payload: CustomIdData = JSON.parse(interaction.customId);
            const component = client.components.modalSubmit.get(payload.n);

            const { t, locale } = await i18n(interaction.guildId);

            if (!component) {
                logger.error(`Component "${payload.n}" doesn't exist.`);
                return interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
            }

            try {
                if (!client.filter.slash(interaction, t, component.options)) return;
                component.run({ client, interaction, t, locale, data: payload.d });
            } catch (error) {
                interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                logger.error(error);
            }

            return;
        }

        if (interaction.isAutocomplete()) {
            const command = client.slash.commands.get(interaction.commandName);
            if (!command) {
                logger.error(`Command "${interaction.commandName}" doesn't exist.`);
                return interaction.respond([]);
            }

            const pull = SubCommand.handleGetPullSlashCommand(command, interaction);
            if (!pull.autocomplete) {
                logger.error(`Command "${interaction.commandName}" not support autocomplete.`);
                return interaction.respond([]);
            }

            const focusedOption = interaction.options.getFocused(true);
            const fn = pull.autocomplete[focusedOption.name];

            try {
                if (typeof fn === "string") {
                    const autocompleteFn = autocomplete[fn];
                    autocompleteFn({ client, interaction });
                } else {
                    fn({ client, interaction });
                }
            } catch (error) {
                logger.error(error);
                interaction.respond([]);
            }

            return;
        }

        if (interaction.isContextMenuCommand()) {
            const component = client.menu.get(interaction.commandName);
            const { t, locale } = await i18n(interaction.guildId);

            if (!component) {
                logger.error(`Component "${interaction.commandName}" doesn't exist.`);
                return interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
            }

            try {
                if (!client.filter.slash(interaction, t, component.options)) return;
                component.run({ client, interaction, t, locale });
            } catch (error) {
                interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                logger.error(error);
            }

            return;
        }

        logger.error(`Invalid interaction found: ${interaction}`);
    },
});
