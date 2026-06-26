import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishingService } from '../src/utils/fishing';

const testUserId = 'test-user-fishing-fishcoin-fix';
const testGuildId = 'test-guild-fishing-fishcoin-fix';

async function testFishingWithFishCoin() {
    console.log('🧪 Testing Fishing with FishCoin Fix...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Get initial balance
        const initialUser = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial AniCoin: ${initialUser.balance}`);
        console.log(`   Initial FishCoin: ${initialUser.fishBalance}\n`);

        // Add some FishCoin to test
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 1000, 'Test FishCoin');
        
        const userAfterAdd = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   AniCoin after add: ${userAfterAdd.balance}`);
        console.log(`   FishCoin after add: ${userAfterAdd.fishBalance}\n`);

        // Test canFish function
        console.log('3️⃣ Testing canFish function...');
        const canFishResult = await FishingService.canFish(testUserId, testGuildId, false);
        console.log(`   Can fish: ${canFishResult.canFish}`);
        console.log(`   Message: ${canFishResult.message}`);
        console.log(`   Remaining time: ${canFishResult.remainingTime}\n`);

        // Test fishing with enough FishCoin
        console.log('4️⃣ Testing fishing with enough FishCoin...');
        try {
            const fishingResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   ✅ Fishing successful!');
            console.log(`   Fish caught: ${fishingResult.fish.name}`);
            console.log(`   Fish value: ${fishingResult.value}`);
            
            // Check balance after fishing
            const userAfterFishing = await ecommerceDB.getUser(testUserId, testGuildId);
            console.log(`   FishCoin after fishing: ${userAfterFishing.fishBalance}`);
            
        } catch (error) {
            console.log('   ❌ Fishing failed:', (error as Error).message);
        }

        // Test fishing with insufficient FishCoin
        console.log('\n5️⃣ Testing fishing with insufficient FishCoin...');
        // Reset to 0 FishCoin
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        try {
            const fishingResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   ❌ Fishing should have failed!');
        } catch (error) {
            console.log('   ✅ Fishing correctly failed with insufficient FishCoin');
            console.log(`   Error message: ${(error as Error).message}`);
        }

        // Test hasEnoughFishCoin function
        console.log('\n6️⃣ Testing hasEnoughFishCoin function...');
        const hasEnough = await fishCoinDB.hasEnoughFishCoin(testUserId, testGuildId, 10);
        console.log(`   Has enough FishCoin for 10: ${hasEnough}`);
        
        const hasEnoughFor1000 = await fishCoinDB.hasEnoughFishCoin(testUserId, testGuildId, 1000);
        console.log(`   Has enough FishCoin for 1000: ${hasEnoughFor1000}`);

        console.log('\n🎉 Test completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testFishingWithFishCoin().catch(console.error); 