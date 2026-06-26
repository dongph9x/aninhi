import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createTestFishingData() {
    console.log('🎣 Creating Test Fishing Data\n');

    try {
        // Tạo test user và fishing data với các mức độ khác nhau
        const testUsers = [
            { userId: 'test_user_1', guildId: 'test_guild', totalFish: 5, totalEarnings: 5000 },
            { userId: 'test_user_2', guildId: 'test_guild', totalFish: 25, totalEarnings: 25000 },
            { userId: 'test_user_3', guildId: 'test_guild', totalFish: 75, totalEarnings: 75000 },
            { userId: 'test_user_4', guildId: 'test_guild', totalFish: 150, totalEarnings: 150000 },
            { userId: 'test_user_5', guildId: 'test_guild', totalFish: 750, totalEarnings: 750000 },
            { userId: 'test_user_6', guildId: 'test_guild', totalFish: 1200, totalEarnings: 1200000 }
        ];

        for (const testUser of testUsers) {
            // Tạo hoặc cập nhật user
            await prisma.user.upsert({
                where: {
                    userId_guildId: {
                        userId: testUser.userId,
                        guildId: testUser.guildId
                    }
                },
                update: {},
                create: {
                    userId: testUser.userId,
                    guildId: testUser.guildId,
                    balance: 0,
                    fishBalance: 0,
                    dailyStreak: 0
                }
            });

            // Tạo hoặc cập nhật fishing data
            await prisma.fishingData.upsert({
                where: {
                    userId_guildId: {
                        userId: testUser.userId,
                        guildId: testUser.guildId
                    }
                },
                update: {
                    totalFish: testUser.totalFish,
                    totalEarnings: testUser.totalEarnings,
                    biggestFish: 'Cá Hồi',
                    biggestValue: 1500,
                    rarestFish: 'Cá Mập',
                    rarestRarity: 'legendary',
                    fishingTime: testUser.totalFish,
                    currentRod: 'copper',
                    currentBait: 'good',
                    lastFished: new Date()
                },
                create: {
                    userId: testUser.userId,
                    guildId: testUser.guildId,
                    totalFish: testUser.totalFish,
                    totalEarnings: testUser.totalEarnings,
                    biggestFish: 'Cá Hồi',
                    biggestValue: 1500,
                    rarestFish: 'Cá Mập',
                    rarestRarity: 'legendary',
                    fishingTime: testUser.totalFish,
                    currentRod: 'copper',
                    currentBait: 'good',
                    lastFished: new Date()
                }
            });

            console.log(`✅ Created test user: ${testUser.userId} with ${testUser.totalFish} fishing count`);
        }

        console.log('\n🎯 Test data created successfully!');
        console.log('Now you can test the fishing success embed with different levels:');
        console.log('- test_user_1: 5 times (No effect)');
        console.log('- test_user_2: 25 times (No effect)');
        console.log('- test_user_3: 75 times (FISHING STAR)');
        console.log('- test_user_4: 150 times (FISHING PRO)');
        console.log('- test_user_5: 750 times (FISHING EXPERT)');
        console.log('- test_user_6: 1200 times (FISHING MASTER)');

    } catch (error) {
        console.error('❌ Error creating test fishing data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

createTestFishingData().catch(console.error); 