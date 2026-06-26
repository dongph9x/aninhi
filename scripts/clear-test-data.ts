import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearTestData() {
    console.log('🧹 Clearing test data...\n');

    const testGuildIds = [
        'test-guild-fishing-bigint',
        'test-guild-give-bigint', 
        'test-guild-fishing-shop-bigint',
        'test-guild-sell-fish-bigint',
        'test-guild-tournament-winner-count',
        'test-guild-bigint-fixes',
        'test-guild-winner-count'
    ];

    try {
        for (const guildId of testGuildIds) {
            console.log(`🗑️ Clearing data for guild: ${guildId}`);
            
            // Xóa theo thứ tự để tránh lỗi foreign key constraint
            await prisma.fishFood.deleteMany({
                where: { guildId }
            });
            
            await prisma.caughtFish.deleteMany({
                where: { fishingData: { guildId } }
            });
            
            await prisma.fishingRod.deleteMany({
                where: { fishingData: { guildId } }
            });
            
            await prisma.fishingBait.deleteMany({
                where: { fishingData: { guildId } }
            });
            
            await prisma.fishingData.deleteMany({
                where: { guildId }
            });
            
            await prisma.transaction.deleteMany({
                where: { guildId }
            });
            
            await prisma.user.deleteMany({
                where: { guildId }
            });
            
            console.log(`✅ Cleared data for guild: ${guildId}`);
        }

        console.log('\n🎉 All test data cleared successfully!');

    } catch (error) {
        console.error('❌ Error clearing test data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearTestData().catch(console.error); 