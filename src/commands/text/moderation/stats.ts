import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "modstats",
        aliases: ["moderationstats", "modstatistics"],
    },
    options: {
        permissions: ["ModerateMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;

        try {
            // Lấy thống kê moderation
            const stats = await ModerationService.getModerationStats(guildId);
            const topModerators = await ModerationService.getTopModerators(guildId, 5);
            const topTargets = await ModerationService.getTopTargets(guildId, 5);

            // Tạo embed cho thống kê
            const embed = new EmbedBuilder()
                .setTitle("📊 Thống Kê Moderation")
                .setDescription("Thống kê moderation của server")
                .setColor("#51cf66")
                .setTimestamp();

            // Thống kê theo loại hành động
            if (stats.length > 0) {
                const actionStats = stats.map((stat: any) => {
                    const actionNameMap: Record<string, string> = {
                        kick: "👢 Kick",
                        ban: "🔨 Ban",
                        unban: "🔓 Unban",
                        mute: "🔇 Mute",
                        unmute: "🔊 Unmute",
                        add_money: "💰 Thêm tiền",
                        subtract_money: "💸 Trừ tiền"
                    };

                    const actionName = actionNameMap[stat.action] || stat.action;

                    return `${actionName}: **${stat._count.action}** lần`;
                }).join("\n");

                embed.addFields({
                    name: "📈 Thống Kê Theo Hành Động",
                    value: actionStats,
                    inline: false
                });
            }

            // Top moderators
            if (topModerators.length > 0) {
                const moderatorList = topModerators.map((mod: any, index: number) => {
                    return `${index + 1}. <@${mod.moderatorId}> - **${mod._count.moderatorId}** lần`;
                }).join("\n");

                embed.addFields({
                    name: "🏆 Top Moderators",
                    value: moderatorList,
                    inline: true
                });
            }

            // Top targets
            if (topTargets.length > 0) {
                const targetList = topTargets.map((target: any, index: number) => {
                    return `${index + 1}. <@${target.targetUserId}> - **${target._count.targetUserId}** lần`;
                }).join("\n");

                embed.addFields({
                    name: "🎯 Top Users Bị Moderation",
                    value: targetList,
                    inline: true
                });
            }

            // Tổng số hành động
            const totalActions = stats.reduce((total: number, stat: any) => total + stat._count.action, 0);
            embed.addFields({
                name: "📊 Tổng Quan",
                value: `**Tổng số hành động:** ${totalActions}\n**Số moderator:** ${topModerators.length}\n**Số user bị moderation:** ${topTargets.length}`,
                inline: false
            });

            embed.setFooter({
                text: `Thống kê của server`,
                iconURL: message.author.displayAvatarURL(),
            });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in modstats command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Khi Lấy Thống Kê")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi lấy thống kê. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 