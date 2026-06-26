import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function showDataStats() {
    console.log('📊 Database Statistics\n');

    try {
        // Đếm số lượng records trong từng bảng
        const stats = await Promise.all([
            prisma.user.count(),
            prisma.transaction.count(),
            prisma.dailyClaim.count(),
            prisma.gameStats.count(),
            prisma.fishingData.count(),
            prisma.caughtFish.count(),
            prisma.fishingRod.count(),
            prisma.fishingBait.count(),
            prisma.fishFood.count(),
            prisma.fishPrice.count(),
            prisma.tournament.count(),
            prisma.tournamentParticipant.count(),
            prisma.tournamentMessage.count(),
            prisma.battleHistory.count(),
            prisma.battleFishInventory.count(),
            prisma.breedingHistory.count(),
            prisma.inventory.count(),
            prisma.inventoryItem.count(),
            prisma.fishInventory.count(),
            prisma.fishInventoryItem.count(),
            prisma.battleFishInventoryItem.count(),
            prisma.moderationLog.count(),
            prisma.banRecord.count()
        ]);

        console.log('👥 Users:', stats[0].toLocaleString());
        console.log('💰 Transactions:', stats[1].toLocaleString());
        console.log('📅 Daily Claims:', stats[2].toLocaleString());
        console.log('📈 Game Stats:', stats[3].toLocaleString());
        console.log('🎣 Fishing Data:', stats[4].toLocaleString());
        console.log('🐟 Caught Fish:', stats[5].toLocaleString());
        console.log('🎣 Fishing Rods:', stats[6].toLocaleString());
        console.log('🪱 Fishing Baits:', stats[7].toLocaleString());
        console.log('🍞 Fish Food:', stats[8].toLocaleString());
        console.log('💲 Fish Prices:', stats[9].toLocaleString());
        console.log('🏆 Tournaments:', stats[10].toLocaleString());
        console.log('👤 Tournament Participants:', stats[11].toLocaleString());
        console.log('💬 Tournament Messages:', stats[12].toLocaleString());
        console.log('⚔️ Battle History:', stats[13].toLocaleString());
        console.log('🐠 Battle Fish Inventory:', stats[14].toLocaleString());
        console.log('🧬 Breeding History:', stats[15].toLocaleString());
        console.log('📦 Inventory:', stats[16].toLocaleString());
        console.log('🎒 Inventory Items:', stats[17].toLocaleString());
        console.log('🐟 Fish Inventory:', stats[18].toLocaleString());
        console.log('🐠 Fish Inventory Items:', stats[19].toLocaleString());
        console.log('⚔️ Battle Fish Inventory Items:', stats[20].toLocaleString());
        console.log('🛡️ Moderation Logs:', stats[21].toLocaleString());
        console.log('🚫 Ban Records:', stats[22].toLocaleString());

        // Tính tổng
        const total = stats.reduce((sum, count) => sum + count, 0);
        console.log('\n📊 Total Records:', total.toLocaleString());

        // Hiển thị thông tin về guilds
        console.log('\n🏠 Guild Information:');
        const guilds = await prisma.user.groupBy({
            by: ['guildId'],
            _count: {
                userId: true
            }
        });

        console.log(`Number of guilds: ${guilds.length}`);
        guilds.slice(0, 10).forEach(guild => {
            console.log(`  Guild ${guild.guildId}: ${guild._count.userId} users`);
        });

        if (guilds.length > 10) {
            console.log(`  ... and ${guilds.length - 10} more guilds`);
        }

        // Hiển thị thông tin về users
        console.log('\n👤 User Information:');
        const userStats = await prisma.user.aggregate({
            _count: {
                userId: true
            },
            _sum: {
                balance: true
            },
            _avg: {
                dailyStreak: true
            }
        });

        console.log(`Total users: ${userStats._count.userId.toLocaleString()}`);
        console.log(`Total balance: ${userStats._sum.balance?.toLocaleString() || '0'} AniCoin`);
        console.log(`Average daily streak: ${userStats._avg.dailyStreak?.toFixed(2) || '0'}`);

        // Hiển thị thông tin về fishing
        console.log('\n🎣 Fishing Information:');
        const fishingStats = await prisma.fishingData.aggregate({
            _sum: {
                totalFish: true,
                totalEarnings: true,
                fishingTime: true
            }
        });

        console.log(`Total fish caught: ${fishingStats._sum.totalFish?.toLocaleString() || '0'}`);
        console.log(`Total fishing earnings: ${fishingStats._sum.totalEarnings?.toLocaleString() || '0'} AniCoin`);
        console.log(`Total fishing time: ${fishingStats._sum.fishingTime?.toLocaleString() || '0'} minutes`);

        console.log('\n✅ Statistics displayed successfully!');

    } catch (error) {
        console.error('❌ Error getting statistics:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

showDataStats().catch(console.error); 