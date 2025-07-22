import { ecommerceDB } from '../src/utils/ecommerce-db';

const testUserId = 'test-user-daily-fishcoin';
const testGuildId = 'test-guild-daily-fishcoin';

async function testDailyWithFishCoin() {
    console.log('🧪 Testing Daily Reward with FishCoin...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Get initial balance
        const initialUser = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial AniCoin: ${initialUser.balance}`);
        console.log(`   Initial FishCoin: ${initialUser.fishBalance}`);
        console.log(`   Initial Streak: ${initialUser.dailyStreak}\n`);

        // Test first daily claim
        console.log('2️⃣ Testing first daily claim...');
        const result1 = await ecommerceDB.processDailyClaim(testUserId, testGuildId);
        
        if (result1.success) {
            console.log('   ✅ First claim successful!');
            console.log(`   AniCoin received: ${result1.aniAmount}`);
            console.log(`   FishCoin received: ${result1.fishAmount}`);
            console.log(`   New streak: ${result1.newStreak}`);
        } else {
            console.log('   ❌ First claim failed!');
        }

        // Get balance after first claim
        const userAfterFirst = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Balance after first claim:`);
        console.log(`   - AniCoin: ${userAfterFirst.balance}`);
        console.log(`   - FishCoin: ${userAfterFirst.fishBalance}`);
        console.log(`   - Streak: ${userAfterFirst.dailyStreak}\n`);

        // Test second claim (should fail due to cooldown)
        console.log('3️⃣ Testing second claim (should fail due to cooldown)...');
        const result2 = await ecommerceDB.processDailyClaim(testUserId, testGuildId);
        
        if (result2.success) {
            console.log('   ❌ Second claim should have failed!');
        } else {
            console.log('   ✅ Second claim correctly failed due to cooldown');
        }

        // Check canClaimDaily
        console.log('4️⃣ Checking canClaimDaily...');
        const canClaim = await ecommerceDB.canClaimDaily(testUserId, testGuildId);
        console.log(`   Can claim: ${canClaim}`);

        // Get cooldown info
        const cooldown = await ecommerceDB.getDailyCooldown(testUserId, testGuildId);
        console.log(`   Cooldown info:`, cooldown);

        // Get last claim time
        const lastClaim = await ecommerceDB.getLastDailyClaim(testUserId, testGuildId);
        console.log(`   Last claim time: ${lastClaim}`);

        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDailyWithFishCoin().catch(console.error); 