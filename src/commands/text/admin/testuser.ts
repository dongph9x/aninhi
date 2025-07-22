import { EmbedBuilder } from "discord.js";
import { Bot } from "@/classes";
import { fishCoinDB } from "@/utils/fish-coin";
import { FishBreedingService } from "@/utils/fish-breeding";
import { FishFeedService } from "@/utils/fish-feed";

export default Bot.createCommand({
    structure: {
        name: "testuser",
        aliases: ["testregular", "testnormal"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        // Kiểm tra quyền admin
        const { FishBattleService } = await import('@/utils/fish-battle');
        const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
        
        if (!isAdmin) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Không Có Quyền")
                .setDescription("Bạn không có quyền sử dụng lệnh này!")
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [errorEmbed] });
        }

        if (args.length < 1) {
            const helpEmbed = new EmbedBuilder()
                .setTitle("🧪 Test User Commands")
                .setDescription(
                    "**Cú pháp:** `n.testuser <action> [params]`\n\n" +
                    "**Các action:**\n" +
                    "• `dailyfeed` - Kiểm tra daily feed limit\n" +
                    "• `addfishcoin <amount>` - Thêm FishCoin cho testing\n" +
                    "• `checkbalance` - Kiểm tra FishCoin balance\n" +
                    "• `resetdaily` - Reset daily feed count\n" +
                    "• `breedingcost` - Kiểm tra breeding cost\n\n" +
                    "**Ví dụ:**\n" +
                    "• `n.testuser dailyfeed`\n" +
                    "• `n.testuser addfishcoin 1000000`\n" +
                    "• `n.testuser checkbalance`"
                )
                .setColor("#00CED1")
                .setTimestamp();

            return message.reply({ embeds: [helpEmbed] });
        }

        const action = args[0].toLowerCase();

        try {
            switch (action) {
                case 'dailyfeed': {
                    const feedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
                    const embed = new EmbedBuilder()
                        .setTitle("🍽️ Daily Feed Info")
                        .setColor("#00FF00")
                        .addFields(
                            { name: "Can Feed", value: feedInfo.canFeed ? "✅ Yes" : "❌ No", inline: true },
                            { name: "Remaining Feeds", value: feedInfo.remainingFeeds.toString(), inline: true },
                            { name: "Daily Limit", value: FishFeedService.getDailyFeedLimit().toString(), inline: true }
                        )
                        .setTimestamp();

                    if (!feedInfo.canFeed && feedInfo.error) {
                        embed.addFields({ name: "Error", value: feedInfo.error, inline: false });
                    }

                    return message.reply({ embeds: [embed] });
                }

                case 'addfishcoin': {
                    const amount = parseInt(args[1]);
                    if (isNaN(amount)) {
                        return message.reply("❌ Số lượng phải là số!");
                    }

                    const beforeBalance = await fishCoinDB.getFishBalance(userId, guildId);
                    await fishCoinDB.addFishCoin(userId, guildId, amount, 'Test user FishCoin');
                    const afterBalance = await fishCoinDB.getFishBalance(userId, guildId);

                    const embed = new EmbedBuilder()
                        .setTitle("💰 FishCoin Added")
                        .setColor("#00FF00")
                        .addFields(
                            { name: "Amount Added", value: amount.toLocaleString(), inline: true },
                            { name: "Before", value: beforeBalance.toLocaleString(), inline: true },
                            { name: "After", value: afterBalance.toLocaleString(), inline: true }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                case 'checkbalance': {
                    const balance = await fishCoinDB.getFishBalance(userId, guildId);
                    const embed = new EmbedBuilder()
                        .setTitle("💰 FishCoin Balance")
                        .setDescription(`**${balance.toLocaleString()}** FishCoin`)
                        .setColor("#00CED1")
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                case 'resetdaily': {
                    // Reset daily feed count
                    await FishFeedService.incrementDailyFeedCount(userId, guildId);
                    const feedInfo = await FishFeedService.checkAndResetDailyFeedCount(userId, guildId);
                    
                    const embed = new EmbedBuilder()
                        .setTitle("🔄 Daily Feed Reset")
                        .setDescription("Daily feed count đã được reset!")
                        .addFields(
                            { name: "Remaining Feeds", value: feedInfo.remainingFeeds.toString(), inline: true }
                        )
                        .setColor("#FFA500")
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                case 'breedingcost': {
                    const cost = FishBreedingService.getBreedingCost();
                    const balance = await fishCoinDB.getFishBalance(userId, guildId);
                    const canAfford = balance >= cost;

                    const embed = new EmbedBuilder()
                        .setTitle("💕 Breeding Cost Info")
                        .setColor(canAfford ? "#00FF00" : "#FF0000")
                        .addFields(
                            { name: "Breeding Cost", value: cost.toLocaleString() + " FishCoin", inline: true },
                            { name: "Your Balance", value: balance.toLocaleString() + " FishCoin", inline: true },
                            { name: "Can Afford", value: canAfford ? "✅ Yes" : "❌ No", inline: true }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                default: {
                    return message.reply("❌ Action không hợp lệ! Dùng `n.testuser` để xem hướng dẫn.");
                }
            }
        } catch (error) {
            console.error('Error in testuser command:', error);
            return message.reply("❌ Đã xảy ra lỗi: " + (error as Error).message);
        }
    },
}); 