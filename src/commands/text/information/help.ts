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
                        `\`${prefix}blackjack\` - Trò chơi Blackjack\n` +
                        `\`${prefix}roulette\` - Trò chơi Roulette\n` +
                        `\`${prefix}fishing\` - Câu cá kiếm tiền`,
                    inline: false,
                },
                {
                    name: "🛡️ **Quản Lý & Moderation**",
                    value:
                        `\`${prefix}ban\` - Ban người dùng\n` +
                        `\`${prefix}unban\` - Unban người dùng\n` +
                        `\`${prefix}kick\` - Kick người dùng\n` +
                        `\`${prefix}mute\` - Mute người dùng\n` +
                        `\`${prefix}unmute\` - Unmute người dùng\n` +
                        `\`${prefix}banlist\` - Xem danh sách ban`,
                    inline: false,
                },
                {
                    name: "🏆 **Tournament & Sự Kiện**",
                    value:
                        `\`${prefix}tournament create\` - Tạo tournament\n` +
                        `\`${prefix}tournament join\` - Tham gia tournament\n` +
                        `\`${prefix}tournament list\` - Danh sách tournament\n` +
                        `\`${prefix}tournament info\` - Thông tin tournament\n` +
                        `\`${prefix}tournament end\` - Kết thúc tournament`,
                    inline: false,
                },
                {
                    name: "ℹ️ **Thông Tin & Tiện Ích**",
                    value:
                        `\`${prefix}ping\` - Kiểm tra độ trễ\n` +
                        `\`${prefix}uptime\` - Thời gian hoạt động\n` +
                        `\`${prefix}help\` - Hiển thị danh sách lệnh\n` +
                        `\`${prefix}test\` - Kiểm tra bot hoạt động`,
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

        roulette:
            "**Mô tả:** Chơi Roulette với nhiều loại cược\n\n" +
            `**Cách dùng:** \`${prefix}roulette <loại cược> <số tiền>\`\n\n` +
            "**Loại cược:**\n" +
            "• `red/black` - Đỏ/Đen (2x)\n" +
            "• `even/odd` - Chẵn/Lẻ (2x)\n" +
            "• `high/low` - Cao/Thấp (2x)\n" +
            "• `dozen` - Chục (3x)\n" +
            "• `column` - Cột (3x)\n" +
            "• `number` - Số cụ thể (36x)\n" +
            "**Ví dụ:**\n" +
            `• \`${prefix}roulette red 100\`\n` +
            `• \`${prefix}roulette number 7 50\`\n` +
            "• Aliases: `rl`, `roul`",

        tournament:
            "**Mô tả:** Hệ thống tournament và sự kiện\n\n" +
            `**Cách dùng:** \`${prefix}tournament <hành động> [tham số]\`\n\n` +
            "**Hành động:**\n" +
            `• \`${prefix}tournament create_<tên>_<mô tả>_<phí>_<giải thưởng>_<số người>_<thời gian>\` - Tạo tournament\n` +
            `• \`${prefix}tournament join <id>\` - Tham gia tournament\n` +
            `• \`${prefix}tournament list\` - Xem danh sách\n` +
            `• \`${prefix}tournament info <id>\` - Thông tin chi tiết\n` +
            `• \`${prefix}tournament end <id>\` - Kết thúc tournament\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}tournament create_Giải đấu test_Test tự động kết thúc_100_1000_2_1\`\n` +
            "• Aliases: `tour`, `t`",

        fishing:
            "**Mô tả:** Hệ thống câu cá kiếm AniCoin\n\n" +
            `**Cách dùng:** \`${prefix}fishing <hành động>\`\n\n` +
            "**Hành động:**\n" +
            `• \`${prefix}fishing\` - Câu cá\n` +
            `• \`${prefix}fishing shop\` - Xem cửa hàng cần câu/mồi\n` +
            `• \`${prefix}fishing stats\` - Xem thống kê câu cá\n` +
            `• \`${prefix}fishing buy rod <loại>\` - Mua cần câu\n` +
            `• \`${prefix}fishing buy bait <loại>\` - Mua mồi\n` +
            `• \`${prefix}fishing help\` - Hướng dẫn chi tiết\n` +
            "**Loại cần câu:** `copper`, `silver`, `gold`, `diamond`\n" +
            "**Loại mồi:** `good`, `premium`, `divine`\n" +
            "**Cooldown:** 30 giây\n" +
            "**Chi phí:** 10 AniCoin/lần\n" +
            "• Aliases: `fish`, `cau`",

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

        test:
            "**Mô tả:** Kiểm tra xem bot có hoạt động không\n\n" +
            `**Cách dùng:** \`${prefix}test\`\n\n` +
            "**Chức năng:**\n" +
            "• Trả về thông báo xác nhận bot đang hoạt động\n" +
            "• Dùng để debug khi lệnh không hoạt động\n" +
            "• Aliases: `pingtest`",

        ban:
            "**Mô tả:** Ban người dùng khỏi server (vĩnh viễn hoặc tạm thời)\n\n" +
            `**Cách dùng:** \`${prefix}ban <người dùng> [thời gian] [lý do]\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}ban @user spam\` - Ban vĩnh viễn\n` +
            `• \`${prefix}ban @user 10m spam\` - Ban 10 phút\n` +
            `• \`${prefix}ban @user 2h vi phạm nội quy\` - Ban 2 giờ\n` +
            "**Đơn vị thời gian:** s (giây), m (phút), h (giờ), d (ngày), w (tuần), y (năm)\n" +
            "**Quyền cần thiết:** Ban Members\n" +
            "• Aliases: `banuser`, `banmember`",

        unban:
            "**Mô tả:** Unban người dùng khỏi server\n\n" +
            `**Cách dùng:** \`${prefix}unban <người dùng>\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}unban 123456789\` - Unban bằng ID\n` +
            `• \`${prefix}unban username#1234\` - Unban bằng username\n` +
            "**Quyền cần thiết:** Ban Members\n" +
            "• Aliases: `unbanuser`, `unbanmember`",

        kick:
            "**Mô tả:** Kick người dùng khỏi server\n\n" +
            `**Cách dùng:** \`${prefix}kick <người dùng> [lý do]\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}kick @user spam\`\n` +
            `• \`${prefix}kick @user vi phạm nội quy\`\n` +
            "**Quyền cần thiết:** Kick Members\n" +
            "• Aliases: `kickuser`, `kickmember`",

        mute:
            "**Mô tả:** Mute người dùng (timeout) trong server\n\n" +
            `**Cách dùng:** \`${prefix}mute <người dùng> [thời gian] [lý do]\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}mute @user spam\` - Mute 5 phút (mặc định)\n` +
            `• \`${prefix}mute @user 10m spam\` - Mute 10 phút\n` +
            `• \`${prefix}mute @user 2h vi phạm nội quy\` - Mute 2 giờ\n` +
            "**Đơn vị thời gian:** s (giây), m (phút), h (giờ), d (ngày), w (tuần), y (năm)\n" +
            "**Quyền cần thiết:** Moderate Members\n" +
            "• Aliases: `muteuser`, `mutemember`, `timeout`",

        unmute:
            "**Mô tả:** Unmute người dùng (gỡ timeout)\n\n" +
            `**Cách dùng:** \`${prefix}unmute <người dùng>\`\n\n` +
            "**Ví dụ:**\n" +
            `• \`${prefix}unmute @user\`\n` +
            `• \`${prefix}unmute 123456789\`\n` +
            "**Quyền cần thiết:** Moderate Members\n" +
            "• Aliases: `unmuteuser`, `unmutemember`, `untimeout`",

        banlist:
            "**Mô tả:** Xem danh sách các người dùng đang bị ban trong server\n\n" +
            `**Cách dùng:** \`${prefix}banlist\`\n\n` +
            "**Hiển thị:**\n" +
            "• Danh sách ban vĩnh viễn và tạm thời\n" +
            "• Lý do ban, người ban, thời gian ban\n" +
            "• Thời gian còn lại (với ban tạm thời)\n" +
            "**Quyền cần thiết:** Ban Members\n" +
            "• Aliases: `bans`, `listbans`",
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
        banuser: "ban",
        banmember: "ban",
        unbanuser: "unban",
        unbanmember: "unban",
        kickuser: "kick",
        kickmember: "kick",
        muteuser: "mute",
        mutemember: "mute",
        timeout: "mute",
        unmuteuser: "unmute",
        unmutemember: "unmute",
        untimeout: "unmute",
        bans: "banlist",
        listbans: "banlist",
        rl: "roulette",
        roul: "roulette",
        tour: "tournament",
        t: "tournament",
        pingtest: "test",
    };

    const actualCommand = aliases[commandName] || commandName;
    return commandHelps[actualCommand] || null;
}
