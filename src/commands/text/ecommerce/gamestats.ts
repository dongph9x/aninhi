import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { GameStatsService } from "@/utils/gameStats";
import { FishingService } from "@/utils/fishing";

export default Bot.createCommand({
    structure: {
        name: "gamestats",
        aliases: ["gstats", "gameleaderboard", "topgames"],
    },
    options: {
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;

        try {
            // Xử lý subcommand
            const subcommand = args[0]?.toLowerCase();

            if (!subcommand || subcommand === "all") {
                await showAllGameStats(message, guildId);
            } else if (subcommand === "blackjack" || subcommand === "bj") {
                await showGameLeaderboard(message, guildId, "blackjack", "Blackjack");
            } else if (subcommand === "slots") {
                await showGameLeaderboard(message, guildId, "slots", "Slots");
            } else if (subcommand === "roulette") {
                await showGameLeaderboard(message, guildId, "roulette", "Roulette");
            } else if (subcommand === "coinflip" || subcommand === "cf") {
                await showGameLeaderboard(message, guildId, "coinflip", "Coin Flip");
            } else if (subcommand === "fishing") {
                await showFishingLeaderboard(message, guildId);
            } else if (subcommand === "help") {
                await showHelp(message);
            } else {
                await showHelp(message);
            }
        } catch (error) {
            console.error("Error in gamestats command:", error);
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi lấy thống kê game!")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});

async function showAllGameStats(message: any, guildId: string) {
    const embed = new EmbedBuilder()
        .setTitle("🎮 Thống Kê Game Toàn Server")
        .setColor("#4ECDC4")
        .setDescription("Thống kê tổng quan về các trò chơi trong server")
        .setTimestamp();

    // Lấy thống kê server
    const serverStats = await GameStatsService.getServerGameStats(guildId);
    
    if (serverStats.length === 0) {
        embed.setDescription("Chưa có dữ liệu thống kê game nào!");
        return message.reply({ embeds: [embed] });
    }

    // Thêm thống kê từng game
    for (const stat of serverStats) {
        const winRate = stat.totalGames > 0 ? Math.round((stat.totalWins / stat.totalGames) * 100) : 0;
        const avgBet = stat.totalGames > 0 ? Math.round(stat.totalBet / stat.totalGames) : 0;
        const profit = stat.totalWon - stat.totalLost;

        embed.addFields({
            name: `🎮 ${getGameEmoji(stat.gameType)} ${getGameDisplayName(stat.gameType)}`,
            value: `📊 **${stat.totalGames.toLocaleString()}** trận | 🏆 **${stat.totalWins.toLocaleString()}** thắng (${winRate}%)\n` +
                   `💰 Tổng cược: **${stat.totalBet.toLocaleString()}** | Trung bình: **${avgBet.toLocaleString()}**\n` +
                   `💵 Lợi nhuận: **${profit.toLocaleString()}** | 👥 **${stat.uniquePlayers}** người chơi`,
            inline: false
        });
    }

    // Thêm footer với hướng dẫn
    embed.setFooter({
        text: "Sử dụng n.gamestats <game> để xem top người chơi cụ thể",
        iconURL: message.client.user.displayAvatarURL()
    });

    message.reply({ embeds: [embed] });
}

async function showGameLeaderboard(message: any, guildId: string, gameType: string, gameName: string) {
    const embed = new EmbedBuilder()
        .setTitle(`🏆 Top Người Chơi ${gameName}`)
        .setColor("#FFD700")
        .setDescription(`Bảng xếp hạng người chơi ${gameName} xuất sắc nhất`)
        .setTimestamp();

    const leaderboard = await GameStatsService.getGameLeaderboard(guildId, gameType, 10);

    if (leaderboard.length === 0) {
        embed.setDescription(`Chưa có dữ liệu thống kê ${gameName} nào!`);
        return message.reply({ embeds: [embed] });
    }

    // Tạo danh sách top players
    let leaderboardText = "";
    leaderboard.forEach((player: any, index: number) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        const winRate = player.gamesPlayed > 0 ? Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0;
        const profit = player.totalWon - player.totalLost;

        leaderboardText += `${medal} <@${player.userId}>\n`;
        leaderboardText += `   📊 ${player.gamesPlayed} trận | 🏆 ${player.gamesWon} thắng (${winRate}%)\n`;
        leaderboardText += `   💰 Cược: ${player.totalBet.toLocaleString()} | 💵 Lợi nhuận: ${profit.toLocaleString()}\n`;
        leaderboardText += `   🎯 Thắng lớn nhất: ${player.biggestWin.toLocaleString()}\n\n`;
    });

    embed.setDescription(leaderboardText);

    // Thêm footer
    embed.setFooter({
        text: `Top 10 người chơi ${gameName} | Sử dụng n.gamestats để xem tất cả`,
        iconURL: message.client.user.displayAvatarURL()
    });

    message.reply({ embeds: [embed] });
}

async function showFishingLeaderboard(message: any, guildId: string) {
    const embed = new EmbedBuilder()
        .setTitle("🎣 Top Người Câu Cá (Theo Số Lần Câu)")
        .setColor("#4ECDC4")
        .setDescription("Bảng xếp hạng người câu cá nhiều nhất")
        .setTimestamp();

    try {
        // Lấy top fishing data
        const fishingLeaderboard = await FishingService.getFishingLeaderboard(guildId, 10);

        if (fishingLeaderboard.length === 0) {
            embed.setDescription("Chưa có dữ liệu câu cá nào!");
            return message.reply({ embeds: [embed] });
        }

        // Tạo danh sách top fishers
        let leaderboardText = "";
        fishingLeaderboard.forEach((fisher: any, index: number) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            const avgValue = fisher.totalFish > 0 ? Math.round(fisher.totalEarnings / fisher.totalFish) : 0;

            leaderboardText += `${medal} <@${fisher.userId}>\n`;
            leaderboardText += `   🎣 **${fisher.totalFish.toLocaleString()}** lần câu | 💰 ${fisher.totalEarnings.toLocaleString()} coins\n`;
            leaderboardText += `   📊 Trung bình: ${avgValue.toLocaleString()} coins/lần câu\n`;
            if (fisher.biggestFish) {
                leaderboardText += `   🏆 Cá lớn nhất: ${fisher.biggestFish} (${fisher.biggestValue.toLocaleString()} coins)\n`;
            }
            if (fisher.rarestFish) {
                leaderboardText += `   ⭐ Cá hiếm nhất: ${fisher.rarestFish} (${fisher.rarestRarity})\n`;
            }
            leaderboardText += "\n";
        });

        embed.setDescription(leaderboardText);

        // Thêm footer
        embed.setFooter({
            text: "Top 10 người câu cá nhiều nhất | Sắp xếp theo số lần câu",
            iconURL: message.client.user.displayAvatarURL()
        });

        message.reply({ embeds: [embed] });
    } catch (error) {
        console.error("Error getting fishing leaderboard:", error);
        embed.setDescription("Có lỗi xảy ra khi lấy thống kê câu cá!");
        message.reply({ embeds: [embed] });
    }
}

async function showHelp(message: any) {
    const embed = new EmbedBuilder()
        .setTitle("🎮 Hướng Dẫn Thống Kê Game")
        .setColor("#4ECDC4")
        .setDescription("Lệnh để xem thống kê và bảng xếp hạng các trò chơi")
        .addFields(
            { name: "📊 Thống kê tổng quan", value: "`n.gamestats` hoặc `n.gamestats all`", inline: true },
            { name: "🎰 Top Blackjack", value: "`n.gamestats blackjack` hoặc `n.gamestats bj`", inline: true },
            { name: "🎰 Top Slots", value: "`n.gamestats slots`", inline: true },
            { name: "🎲 Top Roulette", value: "`n.gamestats roulette`", inline: true },
            { name: "🪙 Top Coin Flip", value: "`n.gamestats coinflip` hoặc `n.gamestats cf`", inline: true },
            { name: "🎣 Top Câu Cá", value: "`n.gamestats fishing`", inline: true }
        )
        .setFooter({
            text: "Thống kê được cập nhật theo thời gian thực",
            iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

    message.reply({ embeds: [embed] });
}

function getGameEmoji(gameType: string): string {
    const emojis: { [key: string]: string } = {
        blackjack: "🃏",
        slots: "🎰",
        roulette: "🎲",
        coinflip: "🪙",
        fishing: "🎣"
    };
    return emojis[gameType] || "🎮";
}

function getGameDisplayName(gameType: string): string {
    const names: { [key: string]: string } = {
        blackjack: "Blackjack",
        slots: "Slots",
        roulette: "Roulette",
        coinflip: "Coin Flip",
        fishing: "Fishing"
    };
    return names[gameType] || gameType;
} 