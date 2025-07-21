import {
    type ChatInputCommandInteraction,
    type ContextMenuCommandInteraction,
    type Guild,
    type GuildMember,
    type Message,
    type MessageComponentInteraction,
    type ModalSubmitInteraction,
    type OmitPartialGroupDMChannel,
    time,
} from "discord.js";

import type { ExtendedClient } from "@/classes";
import { config, emojis, defaultChannelRestrictions, isChannelAllowed } from "@/config";
import type { CommandOptions } from "@/typings";
import type { TranslationFn } from "@/utils/locales";

export type SlashCommandInteraction =
    | ChatInputCommandInteraction
    | MessageComponentInteraction
    | ModalSubmitInteraction
    | ContextMenuCommandInteraction;

export class Filter {
    client: ExtendedClient;
    cooldown = new Map<string, number>();
    constructor(client: ExtendedClient) {
        this.client = client;
    }

    public checkUserPermission(userId: string, option: CommandOptions, context?: Guild | null) {
        const userCheck = [];

        if (option.onlyDev) {
            userCheck.push(...config.developers);
        }

        if (option.ownershipServerOnly && context) {
            userCheck.push(context.ownerId);
        }

        if (userCheck.length === 0) return true;

        return userCheck.includes(userId);
    }

    public checkChannelRestrictions(
        channelId: string,
        categoryId: string | null,
        commandName: string,
        isAdmin: boolean = false
    ) {
        // Sử dụng channel restrictions từ client hoặc default
        const restrictions = this.client.channelRestrictions || defaultChannelRestrictions;
        
        return isChannelAllowed(channelId, categoryId, restrictions, commandName, isAdmin);
    }

    public text(
        message: OmitPartialGroupDMChannel<Message>,
        commandName: string,
        t: TranslationFn,
        options?: CommandOptions,
    ) {
        if (!options) return true;

        if (!this.checkUserPermission(message.author.id, options, message.guild)) {
            message.reply(`${emojis.error} | ${t("errors.missingPermission")}`);
            return false;
        }

        if (message.inGuild()) {
            // Kiểm tra channel restrictions
            const isAdmin = message.member?.permissions.has("Administrator") || false;
            const categoryId = message.channel.isThread() 
                ? (message.channel.parent?.parentId || null)
                : (message.channel.parentId || null);
            
            const channelCheck = this.checkChannelRestrictions(
                message.channelId,
                categoryId,
                commandName,
                isAdmin
            );
            
            if (!channelCheck.allowed) {
                message.reply(`${emojis.error} | ${channelCheck.reason || t("errors.missingPermission")}`);
                return false;
            }

            if ("inGuild" in options && !options.inGuild) {
                message.reply(`${emojis.error} | ${t("errors.directMessageOnly")}`);
                return false;
            }

            if (options.nsfw && !message.channel.isThread() && !message.channel.nsfw) {
                message.reply(`${emojis.error} | ${t("errors.nsfw")}`);
                return false;
            }

            if (options.permissions) {
                if (!message.member?.permissions.has(options.permissions)) {
                    message.reply(`${emojis.error} | ${t("errors.missingPermission")}`);
                    return false;
                }

                if (!message.guild.members.me?.permissions.has(options.permissions)) {
                    message.reply(`${emojis.error} | ${t("errors.missingPermission")}`);
                    return false;
                }
            }

            if (options.globalCooldown) {
                const expiredAt = this.checkCooldown(
                    message.author.id,
                    `text:${commandName}`,
                    options.globalCooldown,
                );

                if (expiredAt > 0) {
                    const expireDate = new Date(expiredAt);

                    message
                        .reply(`${emojis.error} | ${t("errors.cooldown", time(expireDate, "R"))}`)
                        .then(msg => setTimeout(() => msg.delete(), 5000));

                    return false;
                }
            }

            if (options.cooldown) {
                const expiredAt = this.checkCooldown(
                    message.author.id,
                    `text:${commandName}`,
                    options.cooldown,
                    message.guildId ?? message.channelId,
                );

                if (expiredAt > 0) {
                    const expiredDate = new Date(expiredAt);

                    message
                        .reply(`${emojis.error} | ${t("errors.cooldown", time(expiredDate, "R"))}`)
                        .then(msg => setTimeout(() => msg.delete(), 5000));

                    return false;
                }
            }
        } else if (options.inGuild) {
            message.reply(`${emojis.error} | ${t("errors.guildCommandOnly")}`);
            return false;
        }

        return true;
    }

    public slash(interaction: SlashCommandInteraction, t: TranslationFn, options?: CommandOptions) {
        if (!options) return true;

        if (!this.checkUserPermission(interaction.user.id, options, interaction.guild)) {
            interaction.reply(`${emojis.error} | ${t("errors.missingPermission")}`);
            return false;
        }

        if (interaction.inGuild()) {
            // Kiểm tra channel restrictions cho slash commands
            const member = interaction.member as GuildMember;
            const isAdmin = member?.permissions.has("Administrator") || false;
            const categoryId = interaction.channel!.isThread() 
                ? (interaction.channel!.parent?.parentId || null)
                : (interaction.channel!.parentId || null);
            
            // Lấy command name từ interaction
            let commandName: string;
            if (interaction.isChatInputCommand()) {
                commandName = interaction.commandName;
            } else if (interaction.isContextMenuCommand()) {
                commandName = interaction.commandName;
            } else {
                const customId = interaction.customId;
                commandName = customId ? customId.split('_')[0] : 'unknown'; // Lấy phần đầu của customId
            }
            
            const channelCheck = this.checkChannelRestrictions(
                interaction.channelId,
                categoryId,
                commandName,
                isAdmin
            );
            
            if (!channelCheck.allowed) {
                interaction.reply(`${emojis.error} | ${channelCheck.reason || t("errors.missingPermission")}`);
                return false;
            }

            if ("inGuild" in options && !options.inGuild) {
                interaction.reply(`${emojis.error} | ${t("errors.directMessageOnly")}`);
                return false;
            }

            if (
                options.nsfw &&
                !interaction.channel!.isThread() &&
                !interaction.channel!.isDMBased() &&
                !interaction.channel!.nsfw
            ) {
                interaction.reply(`${emojis.error} | ${t("errors.nsfw")}`);
                return false;
            }

            if (options.permissions) {
                if (!member.permissions.has(options.permissions)) {
                    interaction.reply(`${emojis.error} | ${t("errors.missingPermission")}`);
                    return false;
                }

                if (!interaction.guild!.members.me?.permissions.has(options.permissions)) {
                    interaction.reply(`${emojis.error} | ${t("errors.missingPermission")}`);
                    return false;
                }
            }
        } else if (options.inGuild) {
            interaction.reply(`${emojis.error} | ${t("errors.guildCommandOnly")}`);
            return false;
        }

        if (options.globalCooldown) {
            let uniqueId: string;

            if (interaction.isChatInputCommand()) {
                uniqueId = interaction.commandName;
            } else if (interaction.isContextMenuCommand()) {
                uniqueId = interaction.commandName;
            } else {
                uniqueId = interaction.customId;
            }

            const expiredAt = this.checkCooldown(
                interaction.user.id,
                `interaction:${uniqueId}`,
                options.globalCooldown,
            );

            if (expiredAt > 0) {
                const expiredDate = new Date(expiredAt);

                interaction
                    .reply(`${emojis.error} | ${t("errors.cooldown", time(expiredDate, "R"))}`)
                    .then(msg => setTimeout(() => msg.delete(), 5000));

                return false;
            }
        }

        if (options.cooldown && !interaction.isModalSubmit()) {
            let uniqueId: string;

            if (interaction.isChatInputCommand()) {
                uniqueId = interaction.commandName;
            } else if (interaction.isContextMenuCommand()) {
                uniqueId = interaction.commandName;
            } else {
                uniqueId = interaction.customId;
            }

            const expiredAt = this.checkCooldown(
                interaction.user.id,
                `interaction:${uniqueId}`,
                options.cooldown,
                interaction.guildId ?? interaction.channelId,
            );

            if (expiredAt > 0) {
                const expiredDate = new Date(expiredAt);

                interaction
                    .reply(`${emojis.error} | ${t("errors.cooldown", time(expiredDate, "R"))}`)
                    .then(msg => setTimeout(() => msg.delete(), 5000));

                return false;
            }
        }

        return true;
    }

    private checkCooldown(id: string, commandName: string, cooldown: number, guildId?: string) {
        const uniqueId = guildId ? `${id}:${guildId}:${commandName}` : `${id}:${commandName}`;
        const cooldownTimestamp = this.cooldown.get(uniqueId);
        if (cooldownTimestamp) return cooldownTimestamp;

        setTimeout(() => this.cooldown.delete(uniqueId), cooldown);
        this.cooldown.set(uniqueId, Date.now() + cooldown);

        return 0;
    }
}
