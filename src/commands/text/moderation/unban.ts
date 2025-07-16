import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { banDB } from "@/utils/ban-db";
import { ModerationService } from "@/utils/moderation";

export default Bot.createCommand({
    structure: {
        name: "unban",
        aliases: ["unbanuser", "unbanmember"],
    },
    options: {
        permissions: ["BanMembers"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!unban <người dùng>`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!unban 123456789`\n" +
                        "• `p!unban username#1234`\n\n" +
                        "**Lưu ý:** Lệnh này yêu cầu quyền Ban Members.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        try {
            let targetUser: { id: string; username?: string } | null = null;

            // Try to parse as user ID first
            if (args[0]!.match(/^\d+$/)) {
                targetUser = { id: args[0]! };
            } else {
                // Try to find user by username#discriminator or username
                const userInput = args[0]!;
                
                // Get all bans
                const bans = await message.guild!.bans.fetch();
                
                // Try to find by username#discriminator
                const foundBan = bans.find(ban => {
                    const user = ban.user;
                    const fullUsername = `${user.username}#${user.discriminator}`;
                    return fullUsername.toLowerCase() === userInput.toLowerCase() ||
                           user.username.toLowerCase() === userInput.toLowerCase() ||
                           user.id === userInput;
                });

                if (foundBan) {
                    targetUser = { id: foundBan.user.id, username: foundBan.user.username };
                }
            }

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Tìm Thấy")
                    .setDescription(
                        "Không tìm thấy người dùng đã bị ban với thông tin đã cung cấp.\n\n" +
                        "**Cách tìm:**\n" +
                        "• Sử dụng ID người dùng (ví dụ: `123456789`)\n" +
                        "• Sử dụng username đầy đủ (ví dụ: `username#1234`)\n" +
                        "• Sử dụng username (ví dụ: `username`)"
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is actually banned
            try {
                const banInfo = await message.guild!.bans.fetch(targetUser.id);
                
                // Perform the unban
                await message.guild!.members.unban(targetUser.id, `Unban by ${message.author.username}`);
                
                // Xoá khỏi database
                await banDB.unbanUser(targetUser.id, message.guildId!);

                // Ghi lại moderation log
                await ModerationService.logAction({
                    guildId: message.guildId!,
                    targetUserId: targetUser.id,
                    moderatorId: message.author.id,
                    action: "unban",
                    reason: `Manual unban by ${message.author.username}`,
                    channelId: message.channelId,
                    messageId: message.id
                });

                const embed = new EmbedBuilder()
                    .setTitle("🔓 Đã Unban Người Dùng")
                    .setDescription(
                        `**${message.author.username}** đã unban **<@${targetUser.id}>**\n\n` +
                        `👤 **Người dùng:** <@${targetUser.id}>\n` +
                        `📝 **Lý do ban trước đó:** ${banInfo.reason || "Không có lý do"}\n` +
                        `🕐 **Thời gian unban:** <t:${Math.floor(Date.now() / 1000)}:F>`
                    )
                    .setColor("#51cf66")
                    .setThumbnail(banInfo.user.displayAvatarURL())
                    .setFooter({
                        text: `Unban bởi ${message.author.username} | Database Version`,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                message.reply({ embeds: [embed] });

            } catch (error) {
                if (error instanceof Error && error.message.includes("Unknown Ban")) {
                    const embed = new EmbedBuilder()
                        .setTitle("❌ Người Dùng Không Bị Ban")
                        .setDescription(
                            `Người dùng <@${targetUser.id}> không bị ban trong máy chủ này.`
                        )
                        .setColor("#ff0000")
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                } else {
                    throw error;
                }
            }

        } catch (error) {
            console.error("Error in unban command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Unban Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi unban người dùng. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
}); 