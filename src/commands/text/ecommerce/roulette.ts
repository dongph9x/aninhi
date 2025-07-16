import { EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";
import { EcommerceService } from "@/utils/ecommerce-db";
import { GameStatsService } from "@/utils/gameStats";

const maxBet = 300000;
const minBet = 10;

// Các loại cược và tỷ lệ thắng
const betTypes = {
    // Cược số cụ thể (0-36)
    number: {
        payout: 35,
        description: "Cược vào số cụ thể (0-36)",
    },
    // Cược màu đỏ
    red: {
        payout: 1,
        description: "Cược vào màu đỏ",
        numbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
    },
    // Cược màu đen
    black: {
        payout: 1,
        description: "Cược vào màu đen",
        numbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
    },
    // Cược chẵn
    even: {
        payout: 1,
        description: "Cược vào số chẵn (2, 4, 6, ..., 36)",
        numbers: [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36],
    },
    // Cược lẻ
    odd: {
        payout: 1,
        description: "Cược vào số lẻ (1, 3, 5, ..., 35)",
        numbers: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35],
    },
    // Cược 1-18
    low: {
        payout: 1,
        description: "Cược vào số thấp (1-18)",
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    },
    // Cược 19-36
    high: {
        payout: 1,
        description: "Cược vào số cao (19-36)",
        numbers: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    },
    // Cược cột 1 (1, 4, 7, ..., 34)
    column1: {
        payout: 2,
        description: "Cược vào cột 1 (1, 4, 7, ..., 34)",
        numbers: [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
    },
    // Cược cột 2 (2, 5, 8, ..., 35)
    column2: {
        payout: 2,
        description: "Cược vào cột 2 (2, 5, 8, ..., 35)",
        numbers: [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    },
    // Cược cột 3 (3, 6, 9, ..., 36)
    column3: {
        payout: 2,
        description: "Cược vào cột 3 (3, 6, 9, ..., 36)",
        numbers: [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    },
    // Cược hàng 1 (1-12)
    dozen1: {
        payout: 2,
        description: "Cược vào hàng 1 (1-12)",
        numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    },
    // Cược hàng 2 (13-24)
    dozen2: {
        payout: 2,
        description: "Cược vào hàng 2 (13-24)",
        numbers: [13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
    },
    // Cược hàng 3 (25-36)
    dozen3: {
        payout: 2,
        description: "Cược vào hàng 3 (25-36)",
        numbers: [25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    },
};

// Lưu trạng thái game tạm thời
const activeGames: Record<string, boolean> = {};

function getGameKey(userId: string, guildId: string) {
    return `${guildId}_${userId}`;
}

function spinWheel(): number {
    // 0-36
    return Math.floor(Math.random() * 37);
}

function getNumberColor(number: number): string {
    if (number === 0) return "green";
    if (betTypes.red.numbers.includes(number)) return "red";
    return "black";
}

function checkWin(betType: string, betValue: number | null, result: number): boolean {
    switch (betType) {
        case "number":
            return betValue === result;
        case "red":
        case "black":
        case "even":
        case "odd":
        case "low":
        case "high":
        case "column1":
        case "column2":
        case "column3":
        case "dozen1":
        case "dozen2":
        case "dozen3":
            const betTypeInfo = betTypes[betType as keyof typeof betTypes];
            return "numbers" in betTypeInfo && betTypeInfo.numbers.includes(result);
        default:
            return false;
    }
}

function getBetTypeFromInput(input: string): { type: string; value: number | null } | null {
    const lowerInput = input.toLowerCase();

    // Cược số cụ thể
    const numberMatch = lowerInput.match(/^(\d+)$/);
    if (numberMatch) {
        const num = parseInt(numberMatch[1]);
        if (num >= 0 && num <= 36) {
            return { type: "number", value: num };
        }
    }

    // Các loại cược khác
    const betTypeMap: Record<string, string> = {
        "red": "red",
        "đỏ": "red",
        "black": "black",
        "đen": "black",
        "even": "even",
        "chẵn": "even",
        "odd": "odd",
        "lẻ": "odd",
        "low": "low",
        "thấp": "low",
        "high": "high",
        "cao": "high",
        "column1": "column1",
        "cột1": "column1",
        "column2": "column2",
        "cột2": "column2",
        "column3": "column3",
        "cột3": "column3",
        "dozen1": "dozen1",
        "hàng1": "dozen1",
        "dozen2": "dozen2",
        "hàng2": "dozen2",
        "dozen3": "dozen3",
        "hàng3": "dozen3",
    };

    if (betTypeMap[lowerInput]) {
        return { type: betTypeMap[lowerInput], value: null };
    }

    return null;
}

function createRouletteEmbed(
    message: Message,
    betType: string,
    betValue: number | null,
    betAmount: number,
    result: number,
    won: boolean,
    winnings: number,
): EmbedBuilder {
    const color = getNumberColor(result);
    const colorEmoji = color === "red" ? "🔴" : color === "black" ? "⚫" : "🟢";

    const betTypeInfo = betTypes[betType as keyof typeof betTypes];
    const betDescription = betType === "number"
        ? `Số ${betValue}`
        : betTypeInfo.description;

    const embed = new EmbedBuilder()
        .setTitle("🎰 Roulette")
        .setDescription(
            `**${message.author.username}**\n\n` +
            `🎯 **Cược:** ${betDescription}\n` +
            `💰 **Số tiền:** ${betAmount.toLocaleString()} AniCoin\n` +
            `🎲 **Kết quả:** ${colorEmoji} **${result}**\n\n` +
            (won
                ? `🎉 **THẮNG!** +${(winnings - betAmount).toLocaleString()} AniCoin\n`
                : `❌ **THUA!** -${betAmount.toLocaleString()} AniCoin`
            ),
        )
        .setColor(won ? "#00ff00" : "#ff0000")
        .setThumbnail(message.author.displayAvatarURL())
        .setFooter({
            text: `Tỷ lệ thắng: ${betTypeInfo.payout}:1`,
            iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp();

    return embed;
}

function createHelpEmbed(message: Message): EmbedBuilder {
    const embed = new EmbedBuilder()
        .setTitle("🎰 Roulette - Hướng dẫn")
        .setDescription(
            "**Cách chơi:** `n.roulette <loại cược> <số tiền>`\n\n" +
            "**Ví dụ:**\n" +
            "• `n.roulette red 100` - Cược đỏ 100 AniCoin\n" +
            "• `n.roulette 7 50` - Cược số 7 với 50 AniCoin\n" +
            "• `n.roulette even 200` - Cược chẵn 200 AniCoin\n\n" +
            "**Các loại cược:**\n" +
            "• **Số:** 0-36 (tỷ lệ 35:1)\n" +
            "• **Màu:** red/đỏ, black/đen (tỷ lệ 1:1)\n" +
            "• **Chẵn/Lẻ:** even/chẵn, odd/lẻ (tỷ lệ 1:1)\n" +
            "• **Thấp/Cao:** low/thấp (1-18), high/cao (19-36) (tỷ lệ 1:1)\n" +
            "• **Cột:** column1/cột1, column2/cột2, column3/cột3 (tỷ lệ 2:1)\n" +
            "• **Hàng:** dozen1/hàng1 (1-12), dozen2/hàng2 (13-24), dozen3/hàng3 (25-36) (tỷ lệ 2:1)\n\n" +
            `**Giới hạn:** ${minBet}-${maxBet} AniCoin`,
        )
        .setColor(config.embedColor)
        .setThumbnail(message.author.displayAvatarURL())
        .setTimestamp();

    return embed;
}

export default Bot.createCommand({
    structure: {
        name: "roulette",
        aliases: ["rl", "ruleta"],
    },
    options: {
        cooldown: 5000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        // Kiểm tra cooldown
        const gameKey = getGameKey(userId, guildId);
        if (activeGames[gameKey]) {
            return message.reply("⏳ Bạn đang chơi roulette, vui lòng đợi!");
        }

        if (args.length === 0) {
            const helpEmbed = createHelpEmbed(message);
            return message.reply({ embeds: [helpEmbed] });
        }

        if (args.length < 2) {
            return message.reply("❌ Thiếu tham số! Dùng `n.roulette help` để xem hướng dẫn.");
        }

        const betTypeInput = args[0];
        const betAmountInput = args[1];

        // Xử lý loại cược
        const betInfo = getBetTypeFromInput(betTypeInput);
        if (!betInfo) {
            return message.reply("❌ Loại cược không hợp lệ! Dùng `n.roulette help` để xem hướng dẫn.");
        }

        // Xử lý số tiền cược
        let betAmount: number;
        if (betAmountInput.toLowerCase() === "all") {
            betAmount = await EcommerceService.getBalance(userId, guildId);
        } else {
            betAmount = parseInt(betAmountInput);
            if (isNaN(betAmount)) {
                return message.reply("❌ Số tiền cược không hợp lệ!");
            }
        }

        // Kiểm tra giới hạn cược
        if (betAmount < minBet) {
            return message.reply(`❌ Số tiền cược tối thiểu là ${minBet} AniCoin!`);
        }
        if (betAmount > maxBet) {
            betAmount = maxBet;
        }

        // Kiểm tra số dư
        const balance = await EcommerceService.getBalance(userId, guildId);
        if (balance < betAmount) {
            return message.reply(`❌ Không đủ tiền! Số dư: ${balance} AniCoin`);
        }

        // Đánh dấu đang chơi
        activeGames[gameKey] = true;

        try {
            // Trừ tiền cược
            await EcommerceService.subtractMoney(userId, guildId, betAmount, `Roulette bet - ${betInfo.type}`);

            // Quay roulette
            const result = spinWheel();
            const won = checkWin(betInfo.type, betInfo.value, result);

            // Tính toán tiền thắng
            const betTypeInfo = betTypes[betInfo.type as keyof typeof betTypes];
            const winnings = won ? betAmount * (betTypeInfo.payout + 1) : 0;

            // Cộng tiền thắng
            if (won) {
                await EcommerceService.addMoney(userId, guildId, winnings, `Roulette win - ${betInfo.type}`);
            }

            // Ghi lại thống kê game
            await GameStatsService.recordGameResult(userId, guildId, "roulette", {
                won: won,
                bet: betAmount,
                winnings: winnings
            });

            // Tạo embed kết quả
            const embed = createRouletteEmbed(message, betInfo.type, betInfo.value, betAmount, result, won, winnings);
            embed.setFooter({
                text: `Số dư mới: ${await EcommerceService.getBalance(userId, guildId)} AniCoin`,
                iconURL: message.author.displayAvatarURL(),
            });

            await message.reply({ embeds: [embed] });
        } catch (error) {
            console.error("Error in roulette command:", error);
            await message.reply("❌ Đã xảy ra lỗi khi xử lý roulette!");
        } finally {
            // Xóa trạng thái chơi
            delete activeGames[gameKey];
        }
    },
});
