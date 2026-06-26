import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { GameStatsService } from "@/utils/gameStats";

export default Bot.createCommand({
    structure: {
        name: "delete",
        aliases: ["del", "remove", "clear"],
    },
    options: {
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        const guildId = message.guildId!;
        const userId = message.author.id;

        try {
            // Xử lý subcommand
            const subcommand = args[0]?.toLowerCase();

            if (!subcommand) {
                await showHelp(message);
                return;
            }

            if (subcommand === "toplose" || subcommand === "gamestats") {
                const confirmArg = args[1]?.toLowerCase();
                if (confirmArg === "confirm") {
                    await deleteTopLoseDataConfirm(message, guildId, userId);
                } else {
                    await deleteTopLoseData(message, guildId, userId);
                }
            } else if (subcommand === "help") {
                await showHelp(message);
            } else {
                await showHelp(message);
            }
        } catch (error) {
            console.error("Error in delete command:", error);
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Có lỗi xảy ra khi thực hiện lệnh xóa!")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});

async function deleteTopLoseData(message: any, guildId: string, userId: string) {
    try {
        // 1. Thống kê trước khi xóa
        const embed = new EmbedBuilder()
            .setTitle("🗑️ Xóa Dữ Liệu n.toplose")
            .setColor("#ff6b6b")
            .setTimestamp();

        // Đếm tổng số GameStats records
        const totalRecords = await GameStatsService.getServerGameStats(guildId);
        const totalGameStats = totalRecords.length;

        if (totalGameStats === 0) {
            embed.setDescription("✅ Không có dữ liệu n.toplose nào để xóa!");
            return message.reply({ embeds: [embed] });
        }

        // Thống kê theo gameType
        const gameStatsByType = await GameStatsService.getServerLoseStats(guildId);
        
        let statsText = "📊 **Thống kê trước khi xóa:**\n\n";
        statsText += `📈 **Tổng số GameStats records:** ${totalGameStats}\n\n`;
        
        if (gameStatsByType.length > 0) {
            statsText += "🎮 **Thống kê theo loại game:**\n";
            gameStatsByType.forEach(stat => {
                const totalLost = stat.totalLost || 0n;
                const totalBet = stat.totalBet || 0n;
                const totalGames = stat.totalGames || 0;
                const totalWins = stat.totalWins || 0;
                
                statsText += `• **${getGameDisplayName(stat.gameType)}**: ${stat.totalGames} trận, ${totalLost.toLocaleString()} AniCoin thua\n`;
            });
        }

        // 2. Cảnh báo và xác nhận
        statsText += "\n⚠️ **Cảnh báo:**\n";
        statsText += "• Hành động này **KHÔNG THỂ HOÀN TÁC**!\n";
        statsText += "• Tất cả dữ liệu n.toplose sẽ bị mất vĩnh viễn!\n";
        statsText += "• Các lệnh sau sẽ không hoạt động:\n";
        statsText += "  - `n.toplose`\n";
        statsText += "  - `n.toplose all`\n";
        statsText += "  - `n.toplose blackjack`\n";
        statsText += "  - `n.toplose slots`\n";
        statsText += "  - `n.toplose roulette`\n";
        statsText += "  - `n.toplose coinflip`\n";
        statsText += "  - `n.toplose stats`\n";
        statsText += "• Top Lose GIF trong `n.fishing` sẽ không hiển thị!\n\n";
        statsText += "🤔 **Bạn có chắc chắn muốn xóa?**\n";
        statsText += "Gõ `n.delete toplose confirm` để xác nhận xóa.";

        embed.setDescription(statsText);

        // Thêm footer
        embed.setFooter({
            text: "Sử dụng n.delete toplose confirm để xác nhận xóa",
            iconURL: message.client.user.displayAvatarURL()
        });

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Error in deleteTopLoseData:", error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Có lỗi xảy ra khi thống kê dữ liệu n.toplose!")
            .setColor("#ff0000")
            .setTimestamp();

        message.reply({ embeds: [errorEmbed] });
    }
}

async function deleteTopLoseDataConfirm(message: any, guildId: string, userId: string) {
    try {
        const embed = new EmbedBuilder()
            .setTitle("🗑️ Xác Nhận Xóa Dữ Liệu n.toplose")
            .setColor("#ff6b6b")
            .setTimestamp();

        // Thống kê trước khi xóa
        const totalRecords = await GameStatsService.getServerGameStats(guildId);
        const totalGameStats = totalRecords.length;

        if (totalGameStats === 0) {
            embed.setDescription("✅ Không có dữ liệu n.toplose nào để xóa!");
            return message.reply({ embeds: [embed] });
        }

        // Bắt đầu xóa
        let deleteText = "🔄 **Đang xóa dữ liệu n.toplose...**\n\n";

        // Xóa tất cả GameStats records
        const deletedCount = await GameStatsService.deleteAllGameStats(guildId);
        
        deleteText += `✅ **Đã xóa thành công:**\n`;
        deleteText += `• ${deletedCount} GameStats records\n`;
        deleteText += `• Tất cả dữ liệu n.toplose đã bị xóa\n\n`;

        // Thống kê sau khi xóa
        const remainingRecords = await GameStatsService.getServerGameStats(guildId);
        const remainingCount = remainingRecords.length;

        deleteText += `📊 **Thống kê sau khi xóa:**\n`;
        deleteText += `• GameStats records còn lại: ${remainingCount}\n\n`;

        if (remainingCount === 0) {
            deleteText += "🎉 **Xóa hoàn tất!**\n";
            deleteText += "• Tất cả dữ liệu n.toplose đã được xóa sạch\n";
            deleteText += "• Các lệnh n.toplose sẽ không hoạt động cho đến khi có data mới\n";
            deleteText += "• Top Lose GIF trong n.fishing sẽ không hiển thị\n\n";
            deleteText += "💡 **Lưu ý:** Dữ liệu sẽ được tạo lại khi người dùng chơi game";
        } else {
            deleteText += "⚠️ **Cảnh báo:** Vẫn còn dữ liệu chưa được xóa!";
        }

        embed.setDescription(deleteText);

        // Thêm footer
        embed.setFooter({
            text: "Xóa dữ liệu n.toplose hoàn tất",
            iconURL: message.client.user.displayAvatarURL()
        });

        message.reply({ embeds: [embed] });

    } catch (error) {
        console.error("Error in deleteTopLoseDataConfirm:", error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi")
            .setDescription("Có lỗi xảy ra khi xóa dữ liệu n.toplose!")
            .setColor("#ff0000")
            .setTimestamp();

        message.reply({ embeds: [errorEmbed] });
    }
}

async function showHelp(message: any) {
    const embed = new EmbedBuilder()
        .setTitle("🗑️ Hướng Dẫn Lệnh Delete")
        .setColor("#ff6b6b")
        .setDescription("Lệnh để xóa dữ liệu trong hệ thống")
        .addFields(
            { name: "🗑️ Xóa dữ liệu n.toplose", value: "`n.delete toplose` - Xem thống kê và xác nhận xóa\n`n.delete toplose confirm` - Xác nhận xóa dữ liệu", inline: false },
            { name: "📊 Xem thống kê", value: "`n.delete toplose` - Xem thống kê trước khi xóa", inline: false },
            { name: "❓ Trợ giúp", value: "`n.delete help` - Hiển thị hướng dẫn này", inline: false }
        )
        .setFooter({
            text: "Lưu ý: Hành động xóa không thể hoàn tác!",
            iconURL: message.client.user.displayAvatarURL()
        })
        .setTimestamp();

    message.reply({ embeds: [embed] });
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