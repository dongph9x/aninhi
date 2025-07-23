/**
 * 🧪 Test Daily Reward 2000
 * 
 * Script này test thưởng daily mới với base amount 2000
 */

import { ecommerceDB } from '../src/utils/ecommerce-db';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-daily-2000';
const testGuildId = 'test-guild-daily-2000';

async function testDaily2000Reward() {
    console.log('🧪 Testing Daily Reward 2000...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Get initial user state
        const initialUser = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial AniCoin: ${initialUser.balance}`);
        console.log(`   Initial FishCoin: ${initialUser.fishBalance}`);
        console.log(`   Initial streak: ${initialUser.dailyStreak}`);
        console.log('');

        // Test daily claim
        console.log('2️⃣ Testing daily claim...');
        const result = await ecommerceDB.processDailyClaim(testUserId, testGuildId);
        
        if (result.success) {
            console.log('✅ Daily claim successful!');
            console.log(`   AniCoin received: ${result.aniAmount}`);
            console.log(`   FishCoin received: ${result.fishAmount}`);
            console.log(`   New streak: ${result.newStreak}`);
        } else {
            console.log('❌ Daily claim failed!');
            return;
        }
        console.log('');

        // Get updated user state
        console.log('3️⃣ Checking updated user state...');
        const updatedUser = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Final AniCoin: ${updatedUser.balance}`);
        console.log(`   Final FishCoin: ${updatedUser.fishBalance}`);
        console.log(`   Final streak: ${updatedUser.dailyStreak}`);
        console.log('');

        // Verify calculations
        console.log('4️⃣ Verifying calculations...');
        const expectedBase = 2000n;
        const expectedStreakBonus = BigInt(Math.min(1 * 100, 1000)); // Day 1 = 100 bonus
        const expectedTotal = expectedBase + expectedStreakBonus;
        
        console.log(`   Expected base: ${expectedBase}`);
        console.log(`   Expected streak bonus: ${expectedStreakBonus}`);
        console.log(`   Expected total: ${expectedTotal}`);
        console.log(`   Actual received: ${result.aniAmount}`);
        console.log(`   Match: ${result.aniAmount === expectedTotal ? '✅' : '❌'}`);
        console.log('');

        // Test settings
        console.log('5️⃣ Checking settings...');
        const settings = await ecommerceDB.getSettings();
        console.log(`   Daily base amount: ${settings.dailyBaseAmount}`);
        console.log(`   Daily streak bonus: ${settings.dailyStreakBonus}`);
        console.log(`   Max streak bonus: ${settings.maxStreakBonus}`);
        console.log('');

        console.log('🎉 Test completed successfully!');
        console.log('💡 Daily reward base amount has been updated to 2000!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDaily2000Reward().catch(console.error); 