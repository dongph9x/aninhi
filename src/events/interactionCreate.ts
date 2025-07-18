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

            // Kiểm tra chế độ bảo trì cho slash commands
            if (client.maintenanceMode) {
                return interaction.reply(`${emojis.info} **Bot đang trong chế độ bảo trì**\nVui lòng chờ cho đến khi bảo trì hoàn tất.`);
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

            // Kiểm tra chế độ bảo trì cho message components
            if (client.maintenanceMode) {
                return interaction.reply(`${emojis.info} **Bot đang trong chế độ bảo trì**\nVui lòng chờ cho đến khi bảo trì hoàn tất.`);
            }

            // Kiểm tra xem có phải tournament button không
            if (interaction.customId.startsWith("tournament_")) {
                console.log("Tournament button clicked:", interaction.customId);
                
                const component = client.components.message.get("TournamentJoin");
                console.log("TournamentJoin component found:", !!component);
                
                if (component && interaction.componentType === component.type) {
                    try {
                        // Không dùng filter.slash cho button interaction
                        component.run({ client, interaction, t, locale, data: null });
                    } catch (error) {
                        // Kiểm tra xem interaction đã được reply chưa
                        if (!interaction.replied && !interaction.deferred) {
                            interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                        }
                        logger.error({ id: interaction.customId, error });
                    }
                } else {
                    console.log("Component not found or wrong type");
                }
                return;
            }

            // Kiểm tra xem có phải fishbarn interaction không
            if (interaction.customId.startsWith("fishbarn_")) {
                console.log("FishBarn interaction:", interaction.customId);
                
                try {
                    const { FishBarnHandler } = await import("../components/MessageComponent/FishBarnHandler");
                    if (interaction.isButton() || interaction.isStringSelectMenu()) {
                        await FishBarnHandler.handleInteraction(interaction);
                    }
                } catch (error) {
                    console.error("Error handling FishBarn interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác rương nuôi cá!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải battle fish interaction không
            if (interaction.customId.startsWith("battle_fish_")) {
                console.log("BattleFish interaction:", interaction.customId);
                
                try {
                    const { BattleFishHandler } = await import("../components/MessageComponent/BattleFishHandler");
                    if (interaction.isButton() || interaction.isStringSelectMenu()) {
                        await BattleFishHandler.handleInteraction(interaction);
                    }
                } catch (error) {
                    console.error("Error handling BattleFish interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác đấu cá!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải fish market interaction không
            if (interaction.customId.startsWith("market_")) {
                console.log("FishMarket interaction:", interaction.customId);
                
                try {
                    const { FishMarketHandler } = await import("../components/MessageComponent/FishMarketHandler");
                    if (interaction.isButton() || interaction.isStringSelectMenu()) {
                        await FishMarketHandler.handleInteraction(interaction);
                    }
                } catch (error) {
                    console.error("Error handling FishMarket interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác fish market!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải vote kick button không
            try {
                const voteKickData = JSON.parse(interaction.customId);
                if (voteKickData.type === "votekick") {
                    console.log("Vote kick button clicked:", interaction.customId);
                    
                    // Import và gọi handler từ vote kick command
                    const { handleVoteKickButton } = await import("../commands/text/moderation/votekick");
                    
                    try {
                        const handled = await handleVoteKickButton(interaction);
                        if (!handled) {
                            // Nếu không handle được, trả về lỗi
                            if (!interaction.replied && !interaction.deferred) {
                                interaction.reply(`${emojis.error} | Vote kick không hợp lệ hoặc đã kết thúc.`);
                            }
                        }
                    } catch (error) {
                        // Kiểm tra xem interaction đã được reply chưa
                        if (!interaction.replied && !interaction.deferred) {
                            interaction.reply(`${emojis.error} | ${t("errors.unknown")}`);
                        }
                        logger.error({ id: interaction.customId, error });
                    }
                    return;
                }
            } catch (error) {
                // Không phải JSON, tiếp tục xử lý bình thường
            }

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

            // Kiểm tra chế độ bảo trì cho modal submits
            if (client.maintenanceMode) {
                return interaction.reply(`${emojis.info} **Bot đang trong chế độ bảo trì**\nVui lòng chờ cho đến khi bảo trì hoàn tất.`);
            }

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

            // Kiểm tra chế độ bảo trì cho context menu commands
            if (client.maintenanceMode) {
                return interaction.reply(`${emojis.info} **Bot đang trong chế độ bảo trì**\nVui lòng chờ cho đến khi bảo trì hoàn tất.`);
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
