import { Message, EmbedBuilder } from 'discord.js';
import { Bot } from '@/classes';
import { BankService } from '../../../utils/bank-service';
import { fishCoinDB } from '../../../utils/fish-coin';
import prisma from '../../../utils/prisma';

export default Bot.createCommand({
    structure: {
        name: "bank",
        aliases: ["ngân hàng", "exchange"],
    },
    options: {
        cooldown: 1000,
        permissions: ["SendMessages", "EmbedLinks"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        if (args.length === 0) {
            return await showBankInfo(message);
        }

        const subCommand = args[0].toLowerCase();

        switch (subCommand) {
            case "ani":
            case "anicoin":
            case "anitofish":
                return await exchangeAniToFish(message, args.slice(1));
            case "fish":
            case "fishcoin":
            case "fishtoani":
                return await exchangeFishToAni(message, args.slice(1));
            case "rates":
            case "tỷ lệ":
            case "tile":
                return await showExchangeRates(message);
            case "history":
            case "lịch sử":
            case "lichsu":
                return await showBankHistory(message);
            case "calculate":
            case "tính":
            case "tinh":
                return await calculateExchange(message, args.slice(1));
            case "help":
            case "hướng dẫn":
            case "huongdan":
                return await showHelp(message);
            default:
                return await showBankInfo(message);
        }
    },
});

async function showBankInfo(message: Message) {
    const { BankUI } = await import('../../../components/MessageComponent/BankUI');
    
    const embed = BankUI.createBankInfoEmbed(message.author.id, message.guildId!);
    const buttons = BankUI.createBankButtons();

    await message.reply({ embeds: [embed], components: buttons });
}

async function exchangeAniToFish(message: Message, args: string[]) {
    if (args.length < 1) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.bank ani <số tiền>`");
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        return message.reply("❌ Số tiền không hợp lệ!");
    }

    try {
        const result = await BankService.exchangeAniToFish(message.author.id, message.guildId!, amount);

        if (!result.success) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Chuyển Đổi Thất Bại")
                .setDescription(result.error || "Đã xảy ra lỗi không xác định")
                .setColor("#ff0000")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }

        // Lấy balance mới
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId! } }
        });
        const fishBalance = await fishCoinDB.getFishBalance(message.author.id, message.guildId!);

        const successEmbed = new EmbedBuilder()
            .setTitle("✅ Chuyển Đổi Thành Công!")
            .setDescription(
                `**${message.author.displayName || message.author.username || 'Unknown User'}** đã chuyển đổi thành công!\n\n` +
                `💰 **Đã chuyển:** ${result.amount.toLocaleString()} AniCoin\n` +
                `🐟 **Nhận được:** ${result.received.toLocaleString()} FishCoin\n` +
                `📊 **Tỷ lệ:** 1₳ = ${result.exchangeRate}🐟\n\n` +
                `💳 **Số dư mới:**\n` +
                `• AniCoin: ${Number(user?.balance || 0).toLocaleString()}₳\n` +
                `• FishCoin: ${fishBalance.toString()}🐟`
            )
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [successEmbed] });

    } catch (error) {
        console.error('Error in exchangeAniToFish:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi Hệ Thống")
            .setDescription("Đã xảy ra lỗi khi chuyển đổi tiền tệ. Vui lòng thử lại sau!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function exchangeFishToAni(message: Message, args: string[]) {
    if (args.length < 1) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.bank fish <số tiền>`");
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount <= 0) {
        return message.reply("❌ Số tiền không hợp lệ!");
    }

    try {
        const result = await BankService.exchangeFishToAni(message.author.id, message.guildId!, amount);

        if (!result.success) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Chuyển Đổi Thất Bại")
                .setDescription(result.error || "Đã xảy ra lỗi không xác định")
                .setColor("#ff0000")
                .setTimestamp();

            return await message.reply({ embeds: [errorEmbed] });
        }

        // Lấy balance mới
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId: message.author.id, guildId: message.guildId! } }
        });
        const fishBalance = await fishCoinDB.getFishBalance(message.author.id, message.guildId!);

        const successEmbed = new EmbedBuilder()
            .setTitle("✅ Chuyển Đổi Thành Công!")
            .setDescription(
                `**${message.author.displayName || message.author.username || 'Unknown User'}** đã chuyển đổi thành công!\n\n` +
                `🐟 **Đã chuyển:** ${result.amount.toLocaleString()} FishCoin\n` +
                `💰 **Nhận được:** ${result.received.toLocaleString()} AniCoin\n` +
                `📊 **Tỷ lệ:** 1🐟 = ${result.exchangeRate}₳\n\n` +
                `💳 **Số dư mới:**\n` +
                `• AniCoin: ${Number(user?.balance || 0).toLocaleString()}₳\n` +
                `• FishCoin: ${fishBalance.toString()}🐟`
            )
            .setColor("#00ff00")
            .setTimestamp();

        await message.reply({ embeds: [successEmbed] });

    } catch (error) {
        console.error('Error in exchangeFishToAni:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi Hệ Thống")
            .setDescription("Đã xảy ra lỗi khi chuyển đổi tiền tệ. Vui lòng thử lại sau!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function showExchangeRates(message: Message) {
    const rates = BankService.getExchangeRates();

    const embed = new EmbedBuilder()
        .setTitle("📊 Tỷ Lệ Chuyển Đổi Tiền Tệ")
        .setDescription(
            "**🏦 Ngân Hàng Chuyển Đổi Tiền Tệ**\n\n" +
            "**💰 AniCoin → FishCoin:**\n" +
            `• Tối thiểu: ${rates.aniToFish.minAmount.toLocaleString()} AniCoin\n` +
            `• Nhận được: ${rates.aniToFish.fishReceived} FishCoin\n` +
            `• Tỷ lệ: 1₳ = ${rates.aniToFish.rate}🐟\n\n` +
            "**🐟 FishCoin → AniCoin:**\n" +
            `• Tối thiểu: ${rates.fishToAni.minAmount.toLocaleString()} FishCoin\n` +
            `• Nhận được: ${rates.fishToAni.aniReceived} AniCoin\n` +
            `• Tỷ lệ: 1🐟 = ${rates.fishToAni.rate}₳\n\n` +
            "**💡 Ví Dụ:**\n" +
            `• 2,000₳ → 1,000🐟\n` +
            `• 2,000🐟 → 3,000₳`
        )
        .setColor("#0099ff")
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function showBankHistory(message: Message) {
    try {
        const history = await BankService.getBankHistory(message.author.id, message.guildId!, 10);

        if (history.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle("📋 Lịch Sử Giao Dịch Ngân Hàng")
                .setDescription("Bạn chưa có giao dịch nào trong ngân hàng.")
                .setColor("#ffa500")
                .setTimestamp();

            return await message.reply({ embeds: [embed] });
        }

        const historyText = history.map((tx, index) => {
            const amount = Number(tx.amount);
            const isPositive = tx.type === 'add';
            const sign = isPositive ? '+' : '-';
            const currency = tx.currency === 'AniCoin' ? '₳' : '🐟';
            
            return `${index + 1}. ${sign}${Math.abs(amount).toLocaleString()}${currency} - ${tx.description}`;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle("📋 Lịch Sử Giao Dịch Ngân Hàng")
            .setDescription(
                `**${message.author.displayName || message.author.username || 'Unknown User'}** - 10 giao dịch gần nhất:\n\n${historyText}`
            )
            .setColor("#0099ff")
            .setTimestamp();

        await message.reply({ embeds: [embed] });

    } catch (error) {
        console.error('Error showing bank history:', error);
        const errorEmbed = new EmbedBuilder()
            .setTitle("❌ Lỗi Hệ Thống")
            .setDescription("Không thể tải lịch sử giao dịch. Vui lòng thử lại sau!")
            .setColor("#ff0000")
            .setTimestamp();

        await message.reply({ embeds: [errorEmbed] });
    }
}

async function calculateExchange(message: Message, args: string[]) {
    if (args.length < 2) {
        return message.reply("❌ Thiếu tham số! Dùng: `n.bank calculate <ani/fish> <số tiền>`");
    }

    const currency = args[0].toLowerCase();
    const amount = parseInt(args[1]);

    if (isNaN(amount) || amount <= 0) {
        return message.reply("❌ Số tiền không hợp lệ!");
    }

    if (currency !== 'ani' && currency !== 'fish') {
        return message.reply("❌ Loại tiền tệ không hợp lệ! Dùng 'ani' hoặc 'fish'");
    }

    const fromCurrency = currency === 'ani' ? 'AniCoin' : 'FishCoin';
    const calculation = BankService.calculateExchange(fromCurrency, amount);

    const embed = new EmbedBuilder()
        .setTitle("🧮 Tính Toán Chuyển Đổi")
        .setDescription(
            `**${message.author.displayName || message.author.username || 'Unknown User'}** - Tính toán chuyển đổi:\n\n` +
            `💰 **Số tiền chuyển:** ${amount.toLocaleString()} ${fromCurrency === 'AniCoin' ? '₳' : '🐟'}\n` +
            `📊 **Tỷ lệ:** 1${fromCurrency === 'AniCoin' ? '₳' : '🐟'} = ${calculation.rate}${fromCurrency === 'AniCoin' ? '🐟' : '₳'}\n` +
            `🎯 **Sẽ nhận được:** ${calculation.received.toLocaleString()} ${fromCurrency === 'AniCoin' ? '🐟' : '₳'}\n\n` +
            `${calculation.isValid ? '✅ **Hợp lệ để chuyển đổi**' : '❌ **Không đủ số tiền tối thiểu**'}`
        )
        .setColor(calculation.isValid ? "#00ff00" : "#ff0000")
        .setTimestamp();

    await message.reply({ embeds: [embed] });
}

async function showHelp(message: Message) {
    const embed = new EmbedBuilder()
        .setTitle("📖 Hướng Dẫn Sử Dụng Ngân Hàng")
        .setDescription(
            "**🏦 Ngân Hàng Chuyển Đổi Tiền Tệ**\n\n" +
            "**💡 Các Lệnh:**\n" +
            "• `n.bank` - Xem thông tin ngân hàng\n" +
            "• `n.bank ani <số tiền>` - Chuyển AniCoin sang FishCoin\n" +
            "• `n.bank fish <số tiền>` - Chuyển FishCoin sang AniCoin\n" +
            "• `n.bank rates` - Xem tỷ lệ chuyển đổi\n" +
            "• `n.bank history` - Xem lịch sử giao dịch\n" +
            "• `n.bank calculate <ani/fish> <số tiền>` - Tính toán trước khi chuyển\n" +
            "• `n.bank help` - Xem hướng dẫn này\n\n" +
            "**📊 Tỷ Lệ Chuyển Đổi:**\n" +
            "• AniCoin → FishCoin: 1₳ = 0.5🐟 (Tối thiểu 1,000₳)\n" +
            "• FishCoin → AniCoin: 1🐟 = 1.5₳ (Tối thiểu 1,000🐟)\n\n" +
            "**⚠️ Lưu Ý:**\n" +
            "• Giao dịch không thể hoàn tác\n" +
            "• Kiểm tra kỹ số tiền trước khi chuyển\n" +
            "• Sử dụng `n.bank calculate` để tính toán trước"
        )
        .setColor("#0099ff")
        .setTimestamp();

    await message.reply({ embeds: [embed] });
} 