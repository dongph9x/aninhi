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

            // Kiểm tra xem có phải weapon shop interaction không
            if (interaction.customId.startsWith("weapon_shop_") || interaction.customId.startsWith("weapon_")) {
                console.log("WeaponShop interaction:", interaction.customId);
                
                try {
                    const { WeaponShopHandler } = await import("../components/MessageComponent/WeaponShopHandler");
                    if (interaction.isButton()) {
                        await WeaponShopHandler.handleButton(interaction);
                    } else if (interaction.isStringSelectMenu()) {
                        await WeaponShopHandler.handleSelectMenu(interaction);
                    }
                } catch (error) {
                    console.error("Error handling WeaponShop interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác weapon shop!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải bank interaction không
            if (interaction.customId.startsWith("bank_")) {
                console.log("Bank interaction:", interaction.customId);
                
                try {
                    const { BankHandler } = await import("../components/MessageComponent/BankHandler");
                    if (interaction.isButton()) {
                        await BankHandler.handleButtonInteraction(interaction);
                    } else if (interaction.isStringSelectMenu()) {
                        await BankHandler.handleSelectMenuInteraction(interaction);
                    }
                } catch (error) {
                    console.error("Error handling Bank interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác ngân hàng!`);
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

            // Kiểm tra xem có phải achievement import interaction không
            if (interaction.customId.startsWith("achievement_")) {
                console.log("AchievementImport interaction:", interaction.customId);
                
                try {
                    const { AchievementImportHandler } = await import("../components/MessageComponent/AchievementImportHandler");
                    if (interaction.isButton()) {
                        await AchievementImportHandler.handleInteraction(interaction);
                    } else if (interaction.isModalSubmit()) {
                        await AchievementImportHandler.handleModalSubmit(interaction);
                    }
                } catch (error) {
                    console.error("Error handling AchievementImport interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác achievement import!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải achievement selection interaction không
            if (interaction.customId.startsWith("activate_achievement_") || interaction.customId === "deactivate_all_achievements") {
                console.log("Achievement selection interaction:", interaction.customId);
                
                try {
                    const { AchievementHandler } = await import("../components/MessageComponent/AchievementHandler");
                    if (interaction.isButton()) {
                        await AchievementHandler.handleInteraction(interaction);
                    }
                } catch (error) {
                    console.error("Error handling Achievement selection interaction:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý tương tác chọn danh hiệu!`);
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
            // Kiểm tra xem có phải market modal không
            if (interaction.customId === 'market_sell_modal') {
                console.log("Market sell modal submitted");
                
                try {
                    const { FishMarketHandler } = await import("../components/MessageComponent/FishMarketHandler");
                    await FishMarketHandler.handleModalSubmit(interaction);
                } catch (error) {
                    console.error("Error handling Market modal:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý modal fish market!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải buy fish food modal không
            if (interaction.customId.startsWith('buy_fish_food_modal:')) {
                console.log("Buy fish food modal submitted");
                
                try {
                    const component = client.components.modalSubmit.get('BuyFishFoodModal');
                    if (component) {
                        const { t, locale } = await i18n(interaction.guildId);
                        await component.run({ client, interaction, t, locale, data: {} });
                    } else {
                        console.error("BuyFishFoodModal component not found");
                        if (!interaction.replied && !interaction.deferred) {
                            interaction.reply(`${emojis.error} | Component không tồn tại!`);
                        }
                    }
                } catch (error) {
                    console.error("Error handling Buy fish food modal:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý modal mua thức ăn!`);
                    }
                }
                return;
            }

            // Kiểm tra xem có phải achievement modal không
            if (interaction.customId === 'achievement_add_modal') {
                console.log("Achievement add modal submitted");
                
                try {
                    const { AchievementImportHandler } = await import("../components/MessageComponent/AchievementImportHandler");
                    await AchievementImportHandler.handleModalSubmit(interaction);
                } catch (error) {
                    console.error("Error handling Achievement modal:", error);
                    if (!interaction.replied && !interaction.deferred) {
                        interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý modal achievement!`);
                    }
                }
                return;
            }

            try {
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

                if (!client.filter.slash(interaction, t, component.options)) return;
                component.run({ client, interaction, t, locale, data: payload.d });
            } catch (error) {
                console.error("Error handling modal submit:", error);
                if (!interaction.replied && !interaction.deferred) {
                    interaction.reply(`${emojis.error} | Có lỗi xảy ra khi xử lý modal!`);
                }
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
