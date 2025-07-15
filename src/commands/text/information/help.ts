import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config } from "@/config";

export default Bot.createCommand({
    structure: {
        name: "help",
        aliases: ["h", "commands", "cmd"],
    },
    run: async ({ message, t, args }) => {
        const { prefix } = config;

        // Nếu có argument cụ thể
        if (args.length > 0) {
            const commandName = args[0]!.toLowerCase();
            const commandHelp = getSpecificCommandHelp(commandName, prefix);

            if (commandHelp) {
                const embed = new EmbedBuilder()
                    .setTitle(`📖 Hướng Dẫn: ${commandName}`)
                    .setDescription(commandHelp)
                    .setColor(config.embedColor)
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            } else {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Lệnh Không Tồn Tại")
                    .setDescription(
                        `Không tìm thấy lệnh \`${commandName}\`. Sử dụng \`${prefix}help\` để xem tất cả lệnh.`,
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }
        }

        // Hiển thị tất cả lệnh
        const embed = new EmbedBuilder()
            .setTitle("📋 Danh Sách Lệnh")
            .setDescription(
                `Prefix: \`${prefix}\`\nSử dụng \`${prefix}help <tên lệnh>\` để xem chi tiết lệnh cụ thể.`,
            )
            .addFields(
                {
                    name: "💰 **Kinh Tế & Tiền Tệ**",
                    value:
                        `\`${prefix}daily\` - Nhận thưởng hàng ngày\n` +
                        `\`${prefix}balance\` - Xem số dư AniCoin\n` +
                        `\`${prefix}give\` - Chuyển tiền cho người khác\n` +
                        `\`${prefix}leaderboard\` - Bảng xếp hạng giàu nhất`,
                    inline: false,
                },
                {
                    name: "🎰 **Trò Chơi & Cá Cược**",
                    value:
                        `\`${prefix}slots\` - Máy đánh bạc\n` +
                        `\`${prefix}coinflip\` - Tung đồng xu\n` +
                        `\`${prefix}blackjack\` - Trò chơi Blackjack`,
                    inline: false,
                },
                {
                    name: "ℹ️ **Thông Tin & Tiện Ích**",
                    value:
                        `\`${prefix}ping\` - Kiểm tra độ trễ\n` +
                        `\`${prefix}uptime\` - Thời gian hoạt động\n` +
                        `\`${prefix}help\` - Hiển thị danh sách lệnh`,
                    inline: false,
                },
            )
            .setColor(config.embedColor)
            .setThumbnail(message.client.user.displayAvatarURL())
            .setFooter({
                text: `${message.guild?.name} • Bot Kinh Tế Discord`,
                iconURL: message.guild?.iconURL() || undefined,
            })
            .setTimestamp();

        message.reply({ embeds: [embed] });
    },
});

function getSpecificCommandHelp(commandName: string, prefix: string): string | null {
    const commandHelps: Record<string, string> = {
        daily:
            "**Mô tả:** Nhận thưởng hàng ngày để kiếm AniCoin\n\n" +
            `**Cách dùng:** \`${prefix}daily\`\n\n` +
            "**Chi tiết:**\n" +
            "• Thưởng cơ bản: 100 AniCoin\n" +
            "• Thưởng chuỗi: Tăng theo số ngày liên tiếp\n" +
            "• Cooldown: 24 giờ\n" +
            "• Aliases: `claim`, `reward`",

        balance:
            "**Mô tả:** Xem số dư AniCoin và thông tin tài khoản\n\n" +
            `**Cách dùng:** \`${prefix}balance\`\n\n` +
            "**Thông tin hiển thị:**\n" +
            "• Số dư AniCoin hiện tại\n" +
            "• Chuỗi hàng ngày\n" +
            "• Ngày tạo tài khoản\n" +
            "• Aliases: `bal`, `money`, `coins`, `cash`",

        give:
            "**Mô tả:** Chuyển AniCoin cho người dùng khác\n\n" +
            `**Cách dùng:** \`${prefix}give <người dùng> <số tiền>\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}give @user 1000\`\n` +
            `• \`${prefix}give 123456789 500\`\n` +
            "• Aliases: `pay`, `send`, `transfer`",

        leaderboard:
            "**Mô tả:** Xem bảng xếp hạng 10 người giàu nhất\n\n" +
            `**Cách dùng:** \`${prefix}leaderboard\`\n\n` +
            "**Hiển thị:**\n" +
            "• Top 10 người dùng có nhiều AniCoin nhất\n" +
            "• Huy chương cho top 3\n" +
            "• Aliases: `lb`, `top`, `rich`",

        slots:
            "**Mô tả:** Chơi máy đánh bạc để thắng AniCoin\n\n" +
            `**Cách dùng:** \`${prefix}slots [số tiền]\` hoặc \`${prefix}slots all\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}slots 50\` - Cược 50 AniCoin\n` +
            `• \`${prefix}slots all\` - Cược tất cả\n` +
            "• Cooldown: 15 giây\n" +
            "• Aliases: `slot`, `sl`",

        coinflip:
            "**Mô tả:** Tung đồng xu và dự đoán kết quả\n\n" +
            `**Cách dùng:** \`${prefix}coinflip [head|tail] [số tiền]\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}coinflip head 100\`\n` +
            `• \`${prefix}coinflip tail all\`\n` +
            "• Cooldown: 15 giây\n" +
            "• Aliases: `cf`, `coin`, `flip`",

        blackjack:
            "**Mô tả:** Chơi Blackjack với dealer\n\n" +
            `**Cách dùng:** \`${prefix}blackjack [số tiền]\` hoặc \`${prefix}blackjack all\`\n\n` +
            "**Quy tắc:**\n" +
            "• Mục tiêu: Đạt 21 điểm hoặc gần nhất mà không vượt quá\n" +
            "• Sử dụng reactions để chơi: Hit, Stand, Double Down\n" +
            "• Aliases: `bj`, `21`",

        ping:
            "**Mô tả:** Kiểm tra độ trễ của bot\n\n" +
            `**Cách dùng:** \`${prefix}ping\`\n\n` +
            "**Hiển thị:**\n" +
            "• Độ trễ tin nhắn\n" +
            "• Độ trễ WebSocket",

        uptime:
            "**Mô tả:** Xem thời gian bot đã hoạt động\n\n" +
            `**Cách dùng:** \`${prefix}uptime\`\n\n` +
            "**Hiển thị:**\n" +
            "• Thời gian hoạt động theo định dạng ngày:giờ:phút:giây",

        help:
            "**Mô tả:** Hiển thị danh sách lệnh hoặc hướng dẫn chi tiết\n\n" +
            `**Cách dùng:** \`${prefix}help [tên lệnh]\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}help\` - Hiển thị tất cả lệnh\n` +
            `• \`${prefix}help daily\` - Chi tiết lệnh daily\n` +
            "• Aliases: `h`, `commands`, `cmd`",
    };

    // Kiểm tra aliases
    const aliases: Record<string, string> = {
        bal: "balance",
        money: "balance",
        coins: "balance",
        cash: "balance",
        claim: "daily",
        reward: "daily",
        pay: "give",
        send: "give",
        transfer: "give",
        lb: "leaderboard",
        top: "leaderboard",
        rich: "leaderboard",
        slot: "slots",
        sl: "slots",
        cf: "coinflip",
        coin: "coinflip",
        flip: "coinflip",
        bj: "blackjack",
        "21": "blackjack",
        h: "help",
        commands: "help",
        cmd: "help",
    };

    const actualCommand = aliases[commandName] || commandName;
    return commandHelps[actualCommand] || null;
}
