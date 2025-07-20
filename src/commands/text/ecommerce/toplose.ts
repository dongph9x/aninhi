import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { GameStatsService } from "@/utils/gameStats";

export default Bot.createCommand({
    structure: {
        name: "toplose",
        aliases: ["loserboard", "losers", "biggestlosers"],
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
                await showOverallLoseLeaderboard(message, guildId);
            } else if (subcommand === "blackjack" || subcommand === "bj") {
                await showGameLoseLeaderboard(message, guildId, "blackjack", "Blackjack");
            } else if (subcommand === "slots") {
                await showGameLoseLeaderboard(message, guildId, "slots", "Slots");
            } else if (subcommand === "roulette") {
                await showGameLoseLeaderboard(message, guildId, "roulette", "Roulette");
            } else if (subcommand === "coinflip" || subcommand === "cf") {
                await showGameLoseLeaderboard(message, guildId, "coinflip", "Coin Flip");
            } else if (subcommand === "stats") {
                await showLoseStats(message, guildId);
            } else if (subcommand === "help") {
                await showHelp(message);
            } else {
                await showHelp(message);
            }
        } catch (error) {
            console.error("Error in toplose command:", error);
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi lấy thống kê thua lỗ!")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});

async function showOverallLoseLeaderboard(message: any, guildId: string) {
    const embed = new EmbedBuilder()
        .setTitle("💸 Top 10 Người Thua Lỗ Nhiều Nhất")
        .setColor("#ff6b6b")
        .setDescription("Những người chơi thua nhiều AniCoin nhất trong tất cả game")
        .setTimestamp();

    const loseLeaderboard = await GameStatsService.getOverallLoseLeaderboard(guildId, 10);

    if (loseLeaderboard.length === 0) {
        embed.setDescription("Chưa có dữ liệu thua lỗ nào!");
        return message.reply({ embeds: [embed] });
    }

    // Tạo danh sách top losers
    let leaderboardText = "";
    loseLeaderboard.forEach((player: any, index: number) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        const winRate = player.gamesPlayed > 0 ? Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0;
        const totalProfit = Number(player.totalBet) - Number(player.totalLost);

        leaderboardText += `${medal} <@${player.userId}>\n`;
        leaderboardText += `   💸 **${player.totalLost.toLocaleString()}** AniCoin thua\n`;
        leaderboardText += `   📊 ${player.gamesPlayed} trận | 🏆 ${player.gamesWon} thắng (${winRate}%)\n`;
        leaderboardText += `   💰 Tổng cược: ${player.totalBet.toLocaleString()} | 💵 Lỗ: ${totalProfit.toLocaleString()}\n`;
        leaderboardText += `   🎯 Thua lớn nhất: ${player.biggestLoss.toLocaleString()} AniCoin\n\n`;
    });

    embed.setDescription(leaderboardText);

    // Thêm footer
    embed.setFooter({
        text: "Top 10 người thua lỗ nhiều nhất | Sử dụng n.toplose <game> để xem theo từng game",
        iconURL: message.client.user.displayAvatarURL()
    });

    message.reply({ embeds: [embed] });
}

async function showGameLoseLeaderboard(message: any, guildId: string, gameType: string, gameName: string) {
    const embed = new EmbedBuilder()
        .setTitle(`💸 Top Người Thua Lỗ ${gameName}`)
        .setColor("#ff6b6b")
        .setDescription(`Những người thua nhiều AniCoin nhất trong ${gameName}`)
        .setTimestamp();

    const loseLeaderboard = await GameStatsService.getGameLoseLeaderboard(guildId, gameType, 10);

    if (loseLeaderboard.length === 0) {
        embed.setDescription(`Chưa có dữ liệu thua lỗ ${gameName} nào!`);
        return message.reply({ embeds: [embed] });
    }

    // Tạo danh sách top losers cho game cụ thể
    let leaderboardText = "";
    loseLeaderboard.forEach((player: any, index: number) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        const winRate = player.gamesPlayed > 0 ? Math.round((player.gamesWon / player.gamesPlayed) * 100) : 0;
        const totalProfit = Number(player.totalBet) - Number(player.totalLost);

        leaderboardText += `${medal} <@${player.userId}>\n`;
        leaderboardText += `   💸 **${player.totalLost.toLocaleString()}** AniCoin thua\n`;
        leaderboardText += `   📊 ${player.gamesPlayed} trận | 🏆 ${player.gamesWon} thắng (${winRate}%)\n`;
        leaderboardText += `   💰 Tổng cược: ${player.totalBet.toLocaleString()} | 💵 Lỗ: ${totalProfit.toLocaleString()}\n`;
        leaderboardText += `   🎯 Thua lớn nhất: ${player.biggestLoss.toLocaleString()} AniCoin\n\n`;
    });

    embed.setDescription(leaderboardText);

    // Thêm footer
    embed.setFooter({
        text: `Top 10 người thua lỗ ${gameName} | Sử dụng n.toplose để xem tổng hợp`,
        iconURL: message.client.user.displayAvatarURL()
    });

    message.reply({ embeds: [embed] });
}

async function showLoseStats(message: any, guildId: string) {
    const embed = new EmbedBuilder()
        .setTitle("📊 Thống Kê Thua Lỗ Theo Game")
        .setColor("#ff6b6b")
        .setDescription("Thống kê tổng quan về thua lỗ trong các trò chơi")
        .setTimestamp();

    // Lấy thống kê thua lỗ server
    const loseStats = await GameStatsService.getServerLoseStats(guildId);
    
    if (loseStats.length === 0) {
        embed.setDescription("Chưa có dữ liệu thua lỗ nào!");
        return message.reply({ embeds: [embed] });
    }

    // Thêm thống kê từng game
    for (const stat of loseStats) {
        const winRate = stat.totalGames > 0 ? Math.round((stat.totalWins / stat.totalGames) * 100) : 0;
        const avgLoss = stat.totalGames > 0 ? Math.round(Number(stat.totalLost) / stat.totalGames) : 0;
        const totalProfit = Number(stat.totalBet) - Number(stat.totalLost);

        embed.addFields({
            name: `💸 ${getGameEmoji(stat.gameType)} ${getGameDisplayName(stat.gameType)}`,
            value: `📊 **${stat.totalGames.toLocaleString()}** trận | 🏆 **${stat.totalWins.toLocaleString()}** thắng (${winRate}%)\n` +
                   `💰 Tổng cược: **${stat.totalBet.toLocaleString()}** | Trung bình thua: **${avgLoss.toLocaleString()}**\n` +
                   `💸 Tổng thua: **${stat.totalLost.toLocaleString()}** | 💵 Lỗ ròng: **${totalProfit.toLocaleString()}**\n` +
                   `🎯 Thua lớn nhất: **${stat.biggestLoss.toLocaleString()}** | 👥 **${stat.uniqueLosers}** người thua`,
            inline: false
        });
    }

    // Thêm footer với hướng dẫn
    embed.setFooter({
        text: "Sử dụng n.toplose <game> để xem top người thua lỗ cụ thể",
        iconURL: message.client.user.displayAvatarURL()
    });

    message.reply({ embeds: [embed] });
}

async function showHelp(message: any) {
    const embed = new EmbedBuilder()
        .setTitle("💸 Hướng Dẫn Top Lose")
        .setColor("#ff6b6b")
        .setDescription("Lệnh để xem những người thua lỗ nhiều nhất trong các trò chơi")
        .addFields(
            { name: "📊 Top thua lỗ tổng hợp", value: "`n.toplose` hoặc `n.toplose all`", inline: true },
            { name: "🎰 Top thua Blackjack", value: "`n.toplose blackjack` hoặc `n.toplose bj`", inline: true },
            { name: "🎰 Top thua Slots", value: "`n.toplose slots`", inline: true },
            { name: "🎲 Top thua Roulette", value: "`n.toplose roulette`", inline: true },
            { name: "🪙 Top thua Coin Flip", value: "`n.toplose coinflip` hoặc `n.toplose cf`", inline: true },
            { name: "📈 Thống kê thua lỗ", value: "`n.toplose stats`", inline: true }
        )
        .setFooter({
            text: "Thống kê được cập nhật theo thời gian thực",
            iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

    message.reply({ embeds: [embed] });
}

function getGameEmoji(gameType: string): string {
    const emojiMap: Record<string, string> = {
        blackjack: "🎰",
        slots: "🎰",
        roulette: "🎲",
        coinflip: "🪙",
        fishing: "🎣"
    };
    return emojiMap[gameType] || "🎮";
}

function getGameDisplayName(gameType: string): string {
    const nameMap: Record<string, string> = {
        blackjack: "Blackjack",
        slots: "Slots",
        roulette: "Roulette",
        coinflip: "Coin Flip",
        fishing: "Fishing"
    };
    return nameMap[gameType] || gameType;
} 