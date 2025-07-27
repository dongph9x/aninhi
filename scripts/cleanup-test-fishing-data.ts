import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupTestFishingData() {
    console.log('🧹 Cleaning up test fishing data\n');

    try {
        // Xóa test users và fishing data
        const testUserIds = [
            'test_user_1',
            'test_user_2', 
            'test_user_3',
            'test_user_4',
            'test_user_5',
            'test_user_6'
        ];

        const testGuildId = 'test_guild';

        for (const userId of testUserIds) {
            // Xóa fishing data trước
            await prisma.fishingData.deleteMany({
                where: {
                    userId,
                    guildId: testGuildId
                }
            });

            // Xóa user
            await prisma.user.deleteMany({
                where: {
                    userId,
                    guildId: testGuildId
                }
            });

            console.log(`✅ Cleaned up test user: ${userId}`);
        }

        console.log('\n🎯 Test data cleanup completed successfully!');

    } catch (error) {
        console.error('❌ Error cleaning up test fishing data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

cleanupTestFishingData().catch(console.error); 