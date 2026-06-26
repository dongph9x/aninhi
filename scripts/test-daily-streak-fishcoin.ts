import { ecommerceDB } from '../src/utils/ecommerce-db';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-streak-fishcoin';
const testGuildId = 'test-guild-streak-fishcoin';

async function testDailyStreakWithFishCoin() {
    console.log('🧪 Testing Daily Streak with FishCoin...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Simulate multiple daily claims by manually updating streak
        console.log('2️⃣ Simulating streak progression...');
        
        for (let day = 1; day <= 5; day++) {
            console.log(`\n   📅 Day ${day}:`);
            
            // Manually update streak (simulating previous days)
            await prisma.user.update({
                where: {
                    userId_guildId: {
                        userId: testUserId,
                        guildId: testGuildId
                    }
                },
                data: {
                    dailyStreak: day - 1
                }
            });

            // Create a fake daily claim from yesterday
            if (day > 1) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                
                await prisma.dailyClaim.create({
                    data: {
                        userId: testUserId,
                        guildId: testGuildId,
                        claimedAt: yesterday
                    }
                });
            }

            // Get current user state
            const user = await ecommerceDB.getUser(testUserId, testGuildId);
            console.log(`   Current streak: ${user.dailyStreak}`);
            console.log(`   Current AniCoin: ${user.balance}`);
            console.log(`   Current FishCoin: ${user.fishBalance}`);

            // Calculate expected rewards
            const baseAmount = 2000;
            const streakBonus = Math.min(user.dailyStreak * 100, 1000);
            const expectedAni = baseAmount + streakBonus;
            const expectedFish = expectedAni;
            
            console.log(`   Expected AniCoin: ${expectedAni} (base: ${baseAmount} + streak: ${streakBonus})`);
            console.log(`   Expected FishCoin: ${expectedFish}`);
        }

        console.log('\n🎉 Streak simulation completed!');
        console.log('💡 Now you can test the actual daily command to see the rewards in action.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDailyStreakWithFishCoin().catch(console.error); 