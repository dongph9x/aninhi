import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { EcommerceService } from "@/utils/ecommerce-db";
import { GameStatsService } from "@/utils/gameStats";

const maxBet = 300000;
const spin = "🪙";
const heads = "🪙";
const tails = "🪙";

export default Bot.createCommand({
    structure: {
        name: "coinflip",
        aliases: ["cf", "coin", "flip"],
    },
    options: {
        cooldown: 15000,
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        try {
            // Kiểm tra cú pháp
            let bet: number | "all" = 1;
            let arg1 = args[0];

            // Xử lý tham số bet
            if (arg1 && !isNaN(parseInt(arg1))) {
                bet = parseInt(arg1);
                arg1 = args[1];
            } else if (arg1 && arg1.toLowerCase() === "all") {
                bet = "all";
                arg1 = args[1];
            } else if (args[1] && !isNaN(parseInt(args[1]))) {
                bet = parseInt(args[1]);
            } else if (args[1] && args[1].toLowerCase() === "all") {
                bet = "all";
            } else if (args.length !== 1 && args.length !== 2) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi Cú Pháp")
                    .setDescription(
                        "Cú pháp: `coinflip [head|tail] [số tiền]`\nVí dụ: `coinflip head 100` hoặc `coinflip all`",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Xử lý lựa chọn head/tail
            let choice = "h";
            if (arg1 !== undefined) {
                arg1 = arg1.toLowerCase();
                if (arg1 === "heads" || arg1 === "h" || arg1 === "head") {
                    choice = "h";
                } else if (arg1 === "tails" || arg1 === "t" || arg1 === "tail") {
                    choice = "t";
                }
            }

            // Kiểm tra bet hợp lệ
            if (bet !== "all" && bet === 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Bạn không thể đặt cược 0 AniCoin!")
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            if (bet !== "all" && bet < 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Số tiền cược không thể âm!")
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Lấy số dư hiện tại
            const currentBalance = await EcommerceService.getBalance(userId, guildId);

            // Xử lý bet "all"
            if (bet === "all") {
                bet = currentBalance;
            }

            // Chuyển bet thành number để xử lý
            const betAmount = bet as number;

            // Kiểm tra số dư
            if (currentBalance === 0 || currentBalance < betAmount) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("🚫 Không Đủ Tiền")
                    .setDescription(
                        `**${message.author.username}**, bạn không có đủ AniCoin!\nSố dư hiện tại: **${currentBalance}** AniCoin`,
                    )
                    .setColor("#ff6b6b")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Giới hạn bet tối đa
            if (maxBet && betAmount > maxBet) {
                bet = maxBet;
            }

            if (betAmount <= 0) {
                const errorEmbed = new EmbedBuilder()
                    .setTitle("❌ Lỗi")
                    .setDescription("Bạn không có AniCoin để cược!")
                    .setColor("#ff0000")
                    .setTimestamp();
                return message.reply({ embeds: [errorEmbed] });
            }

            // Random kết quả
            const rand = Math.floor(Math.random() * 2); // 0 = tails, 1 = heads
            let win = false;

            // Kiểm tra thắng thua
            if (rand === 0 && choice === "t")
            { win = true; } // tails
            else if (rand === 1 && choice === "h") { win = true; } // heads

            // Cập nhật số dư
            if (win) {
                await EcommerceService.addMoney(userId, guildId, bet, `Coinflip win - bet: ${bet}`);
            } else {
                await EcommerceService.subtractMoney(userId, guildId, bet, `Coinflip lose - bet: ${bet}`);
            }

            // Ghi lại thống kê game
            await GameStatsService.recordGameResult(userId, guildId, "coinflip", {
                won: win,
                bet: betAmount,
                winnings: win ? betAmount * 2 : 0
            });

            // Tạo embed thông báo
            const choiceText = choice === "h" ? "**heads**" : "**tails**";
            const resultText = rand === 1 ? "heads" : "tails";
            const resultEmoji = rand === 1 ? heads : tails;

            const embed = new EmbedBuilder()
                .setTitle("🪙 Coinflip")
                .setDescription(
                    `**${message.author.username}** đã cược **${bet}** AniCoin và chọn ${choiceText}\n\n` +
                        `Đồng xu quay... ${spin}`,
                )
                .setColor("#ffd93d")
                .setThumbnail(message.author.displayAvatarURL())
                .setTimestamp();

            const messageSent = await message.reply({ embeds: [embed] });

            // Sau 2 giây, cập nhật kết quả
            setTimeout(async () => {
                const resultEmbed = new EmbedBuilder()
                    .setTitle("🪙 Kết Quả Coinflip")
                    .setDescription(
                        `**${message.author.username}** đã cược **${bet}** AniCoin và chọn ${choiceText}\n\n` +
                            `Đồng xu quay... ${resultEmoji} và kết quả là **${resultText}**\n\n` +
                            (win
                                ? `🎉 **Bạn đã thắng ${bet * 2} AniCoin!** 🎉`
                                : `😢 **Bạn đã mất ${bet} AniCoin...** 😢`),
                    )
                    .setColor(win ? "#51cf66" : "#ff6b6b")
                    .setThumbnail(message.author.displayAvatarURL())
                    .setFooter({
                        text: `Số dư mới: ${await EcommerceService.getBalance(userId, guildId)} AniCoin`,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setTimestamp();

                messageSent.edit({ embeds: [resultEmbed] });
            }, 2000);
        } catch (error) {
            console.error("Error in coinflip command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Lỗi")
                .setDescription("Đã xảy ra lỗi khi xử lý coinflip. Vui lòng thử lại sau.")
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});
