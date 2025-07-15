import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { getBans } from "@/utils/banStore";

export default Bot.createCommand({
    structure: {
        name: "banlist",
        aliases: ["bans", "banlist", "listbans"],
    },
    options: {
        permissions: ["BanMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        try {
            const guildId = message.guildId!;
            const allBans = getBans();
            const guildBans = allBans.filter(ban => ban.guildId === guildId);

            if (guildBans.length === 0) {
                const embed = new EmbedBuilder()
                    .setTitle("📋 Danh Sách Ban")
                    .setDescription("Hiện tại không có người dùng nào bị ban trong server này.")
                    .setColor("#51cf66")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Phân loại ban vĩnh viễn và tạm thời
            const permanentBans = guildBans.filter(ban => ban.type === "permanent");
            const temporaryBans = guildBans.filter(ban => ban.type === "temporary");

            const embed = new EmbedBuilder()
                .setTitle("📋 Danh Sách Ban")
                .setDescription(`Tổng cộng **${guildBans.length}** người dùng bị ban trong server này.`)
                .setColor("#ff6b6b")
                .setTimestamp();

            // Hiển thị ban vĩnh viễn
            if (permanentBans.length > 0) {
                const permanentList = permanentBans
                    .map(ban => {
                        const banDate = new Date(ban.banAt);
                        return `• <@${ban.userId}> - **${ban.reason}** (Ban bởi <@${ban.moderatorId}> - <t:${Math.floor(ban.banAt / 1000)}:R>)`;
                    })
                    .join("\n");

                embed.addFields({
                    name: `🔒 Ban Vĩnh Viễn (${permanentBans.length})`,
                    value: permanentList,
                    inline: false,
                });
            }

            // Hiển thị ban tạm thời
            if (temporaryBans.length > 0) {
                const temporaryList = temporaryBans
                    .map(ban => {
                        const banDate = new Date(ban.banAt);
                        const expiresDate = ban.expiresAt ? new Date(ban.expiresAt) : null;
                        const timeLeft = expiresDate ? Math.max(0, expiresDate.getTime() - Date.now()) : 0;
                        
                        let status = "";
                        if (timeLeft > 0) {
                            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                            status = `⏰ Còn ${hours}h ${minutes}m`;
                        } else {
                            status = "🕐 Đã hết hạn (sẽ tự động unban)";
                        }

                        return `• <@${ban.userId}> - **${ban.reason}** (Ban bởi <@${ban.moderatorId}> - ${status})`;
                    })
                    .join("\n");

                embed.addFields({
                    name: `⏰ Ban Tạm Thời (${temporaryBans.length})`,
                    value: temporaryList,
                    inline: false,
                });
            }

            embed.setFooter({
                text: `Server: ${message.guild?.name}`,
                iconURL: message.guild?.iconURL() || undefined,
            });

            message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in banlist command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi Khi Tải Danh Sách Ban")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi tải danh sách ban. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 