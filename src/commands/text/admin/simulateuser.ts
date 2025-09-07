import { EmbedBuilder } from "discord.js";
import { Bot } from "@/classes";
import { fishCoinDB } from "@/utils/fish-coin";
import { FishBreedingService } from "@/utils/fish-breeding";
import { FishFeedService } from "@/utils/fish-feed";
import { FishFoodService } from "@/utils/fish-food";
import { FishInventoryService } from "@/utils/fish-inventory";
import prisma from "@/utils/prisma";

export default Bot.createCommand({
    structure: {
        name: "simulateuser",
        aliases: ["simuser", "testuser"],
    },
    run: async ({ message, t }) => {
        const userId = message.author.id;
        const guildId = message.guildId!;
        const args = message.content.split(" ").slice(1);

        // Kiểm tra quyền admin
        const { FishBattleService } = await import('@/utils/fish-battle');
        const isAdmin = await FishBattleService.isAdministrator(userId, guildId, message.client);
        
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
                .setTitle("🧪 Simulate User Commands")
                .setDescription(
                    "**Cú pháp:** `n.simulateuser <action> [params]`\n\n" +
                    "**Các action:**\n" +
                    "• `feed <fishId> <foodType>` - Simulate cho cá ăn như user thường\n" +
                    "• `breed <fish1Id> <fish2Id>` - Simulate lai tạo như user thường\n" +
                    "• `dailyfeed` - Kiểm tra daily feed limit\n" +
                    "• `addfishcoin <amount>` - Thêm FishCoin cho testing\n" +
                    "• `checkbalance` - Kiểm tra FishCoin balance\n" +
                    "• `resetdaily` - Reset daily feed count\n" +
                    "• `breedingcost` - Kiểm tra breeding cost\n" +
                    "• `createfish` - Tạo cá test\n\n" +
                    "**Ví dụ:**\n" +
                    "• `n.simulateuser dailyfeed`\n" +
                    "• `n.simulateuser addfishcoin 1000000`\n" +
                    "• `n.simulateuser feed fish123 basic`"
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
                        .setTitle("🍽️ Daily Feed Info (Simulated User)")
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
                    await fishCoinDB.addFishCoin(userId, guildId, amount, 'Simulate user FishCoin');
                    const afterBalance = await fishCoinDB.getFishBalance(userId, guildId);

                    const embed = new EmbedBuilder()
                        .setTitle("💰 FishCoin Added (Simulated User)")
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
                        .setTitle("💰 FishCoin Balance (Simulated User)")
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
                        .setTitle("🔄 Daily Feed Reset (Simulated User)")
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
                        .setTitle("💕 Breeding Cost Info (Simulated User)")
                        .setColor(canAfford ? "#00FF00" : "#FF0000")
                        .addFields(
                            { name: "Breeding Cost", value: cost.toLocaleString() + " FishCoin", inline: true },
                            { name: "Your Balance", value: balance.toLocaleString() + " FishCoin", inline: true },
                            { name: "Can Afford", value: canAfford ? "✅ Yes" : "❌ No", inline: true }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                case 'createfish': {
                    // Create test fish
                    const fish = await prisma.fish.create({
                        data: {
                            userId,
                            guildId,
                            species: 'Simulated Test Fish',
                            level: 1,
                            experience: 0,
                            rarity: 'legendary',
                            value: 10000,
                            generation: 1,
                            status: 'growing',
                            stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 }),
                            specialTraits: JSON.stringify(['Simulated Test']),
                            // Cloning fields (default values for new fish)
                            isCloned: false,
                            clonedFrom: null,
                            clonedAt: null,
                        }
                    });
                    
                    // Add to inventory
                    await FishInventoryService.addFishToInventory(userId, guildId, fish.id);

                    const embed = new EmbedBuilder()
                        .setTitle("🐟 Fish Created (Simulated User)")
                        .setColor("#00FF00")
                        .addFields(
                            { name: "Fish ID", value: fish.id, inline: true },
                            { name: "Species", value: fish.species, inline: true },
                            { name: "Level", value: fish.level.toString(), inline: true }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                case 'feed': {
                    if (args.length < 3) {
                        return message.reply("❌ Cú pháp: `n.simulateuser feed <fishId> <foodType>`");
                    }

                    const fishId = args[1];
                    const foodType = args[2] as any;

                    // Simulate feeding as regular user (isAdmin = false)
                    const feedResult = await FishBreedingService.feedFishWithFood(userId, fishId, foodType, false);
                    
                    if (!feedResult.success) {
                        return message.reply(`❌ Feed failed: ${feedResult.error}`);
                    }

                    // Increment daily feed count (as regular user)
                    await FishFeedService.incrementDailyFeedCount(userId, guildId);

                    const embed = new EmbedBuilder()
                        .setTitle("🍽️ Fish Fed (Simulated User)")
                        .setColor("#00FF00")
                        .addFields(
                            { name: "Fish", value: feedResult.fish?.name || 'Unknown', inline: true },
                            { name: "Food", value: feedResult.foodUsed?.name || 'Unknown', inline: true },
                            { name: "Exp Gained", value: `+${feedResult.experienceGained}`, inline: true },
                            { name: "New Level", value: feedResult.fish?.level.toString() || '0', inline: true },
                            { name: "Leveled Up", value: feedResult.leveledUp ? "✅ Yes" : "❌ No", inline: true }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                case 'breed': {
                    if (args.length < 3) {
                        return message.reply("❌ Cú pháp: `n.simulateuser breed <fish1Id> <fish2Id>`");
                    }

                    const fish1Id = args[1];
                    const fish2Id = args[2];

                    // Simulate breeding as regular user (isAdmin = false)
                    const breedResult = await FishBreedingService.breedFish(userId, fish1Id, fish2Id, false);
                    
                    if (!breedResult.success) {
                        return message.reply(`❌ Breeding failed: ${breedResult.error}`);
                    }

                    const embed = new EmbedBuilder()
                        .setTitle("💕 Fish Bred (Simulated User)")
                        .setColor("#FF69B4")
                        .addFields(
                            { name: "Parent 1", value: breedResult.parent1?.name || 'Unknown', inline: true },
                            { name: "Parent 2", value: breedResult.parent2?.name || 'Unknown', inline: true },
                            { name: "Offspring", value: breedResult.offspring?.name || 'Unknown', inline: true },
                            { name: "Offspring Value", value: (breedResult.offspring?.value || 0).toLocaleString(), inline: true },
                            { name: "Cost Deducted", value: "100,000 FishCoin", inline: true }
                        )
                        .setTimestamp();

                    return message.reply({ embeds: [embed] });
                }

                default: {
                    return message.reply("❌ Action không hợp lệ! Dùng `n.simulateuser` để xem hướng dẫn.");
                }
            }
        } catch (error) {
            console.error('Error in simulateuser command:', error);
            return message.reply("❌ Đã xảy ra lỗi: " + (error as Error).message);
        }
    },
}); 