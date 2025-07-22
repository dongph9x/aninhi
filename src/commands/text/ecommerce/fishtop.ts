import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { fishCoinDB } from "@/utils/fish-coin";

export default Bot.createCommand({
    structure: {
        name: "fishtop",
        aliases: ["fishleaderboard", "fishlb", "ftop"],
    },
    run: async ({ message, t }) => {
        const guildId = message.guildId!;

        try {
            // Lấy top 10 người chơi có nhiều FishCoin nhất
            const topUsers = await fishCoinDB.getTopFishCoinUsers(guildId, 10);

            if (topUsers.length === 0) {
                const emptyEmbed = new EmbedBuilder()
                    .setTitle("🐟 FishCoin Leaderboard")
                    .setDescription("Chưa có người chơi nào có FishCoin!")
                    .setColor("#00CED1")
                    .setTimestamp();

                return message.reply({ embeds: [emptyEmbed] });
            }

            const embed = new EmbedBuilder()
                .setTitle("🏆 FishCoin Leaderboard")
                .setDescription("Top 10 người chơi có nhiều FishCoin nhất")
                .setColor("#00CED1")
                .setThumbnail(message.guild?.iconURL() || message.author.displayAvatarURL())
                .setFooter({
                    text: `${message.guild?.name || 'Server'} | FishCoin Rankings`,
                    iconURL: message.guild?.iconURL() || message.author.displayAvatarURL(),
                })
                .setTimestamp();

            // Tạo danh sách top users
            const leaderboardList = await Promise.all(
                topUsers.map(async (user, index) => {
                    const rank = index + 1;
                    const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
                    
                    // Lấy username từ Discord (nếu có thể)
                    let username = `User ${user.userId}`;
                    try {
                        const discordUser = await message.client.users.fetch(user.userId);
                        username = discordUser.username;
                    } catch (error) {
                        // Nếu không fetch được user, sử dụng ID
                        username = `User ${user.userId.slice(-4)}`;
                    }

                    return `${medal} **${username}** - ${user.fishBalance.toLocaleString()} 🐟`;
                })
            );

            // Chia thành các field nếu quá dài
            const chunkSize = 5;
            for (let i = 0; i < leaderboardList.length; i += chunkSize) {
                const chunk = leaderboardList.slice(i, i + chunkSize);
                const fieldName = i === 0 ? "🏆 Top FishCoin Players" : `📊 Rank ${i + 1}-${Math.min(i + chunkSize, leaderboardList.length)}`;
                
                embed.addFields({
                    name: fieldName,
                    value: chunk.join('\n'),
                    inline: false
                });
            }

            // Thêm thống kê tổng quan
            const totalFishCoin = topUsers.reduce((sum, user) => sum + user.fishBalance, 0n);
            const averageFishCoin = totalFishCoin / BigInt(topUsers.length);

            embed.addFields({
                name: "📊 Thống Kê",
                value: `🐟 **Tổng FishCoin:** ${totalFishCoin.toLocaleString()}\n` +
                       `📈 **Trung bình:** ${averageFishCoin.toLocaleString()} FishCoin\n` +
                       `👥 **Người chơi:** ${topUsers.length} người`,
                inline: false
            });

            // Thêm thông tin về người dùng hiện tại
            const currentUserRank = topUsers.findIndex(user => user.userId === message.author.id);
            if (currentUserRank !== -1) {
                const userRank = currentUserRank + 1;
                const userBalance = topUsers[currentUserRank].fishBalance;
                
                embed.addFields({
                    name: "🎯 Vị Trí Của Bạn",
                    value: `🏆 **Rank:** #${userRank}\n` +
                           `🐟 **FishCoin:** ${userBalance.toLocaleString()}`,
                    inline: false
                });
            } else {
                // Nếu user không có trong top 10, lấy balance của họ
                const userBalance = await fishCoinDB.getFishBalance(message.author.id, guildId);
                if (userBalance > 0n) {
                    embed.addFields({
                        name: "🎯 Vị Trí Của Bạn",
                        value: `📊 **Rank:** Ngoài top 10\n` +
                               `🐟 **FishCoin:** ${userBalance.toLocaleString()}`,
                        inline: false
                    });
                } else {
                    embed.addFields({
                        name: "🎯 Vị Trí Của Bạn",
                        value: `📊 **Rank:** Chưa có FishCoin\n` +
                               `🐟 **FishCoin:** 0`,
                        inline: false
                    });
                }
            }

            // Thêm thông tin về cách kiếm FishCoin
            embed.addFields({
                name: "💡 Cách Kiếm FishCoin",
                value: "🐟 **Các cách kiếm FishCoin:**\n" +
                       "• Mua bán cá trong Fish Market\n" +
                       "• Thắng giải đấu cá\n" +
                       "• Nhận thưởng từ admin\n" +
                       "• Chuyển từ người khác\n" +
                       "• Hoàn thành nhiệm vụ cá",
                inline: false
            });

            return message.reply({ embeds: [embed] });

        } catch (error) {
            console.error("Error in fishtop command:", error);
            
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi lấy FishCoin leaderboard!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }
    },
}); 