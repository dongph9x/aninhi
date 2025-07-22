import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishingService } from '../src/utils/fishing';

const testUserId = 'test-user-fishing-complete-fishcoin';
const testGuildId = 'test-guild-fishing-complete-fishcoin';

async function testCompleteFishingWithFishCoin() {
    console.log('🧪 Testing Complete Fishing with FishCoin...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Get initial balance
        const initialUser = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial AniCoin: ${initialUser.balance}`);
        console.log(`   Initial FishCoin: ${initialUser.fishBalance}\n`);

        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 5000, 'Test FishCoin');
        
        const userAfterAdd = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   AniCoin after add: ${userAfterAdd.balance}`);
        console.log(`   FishCoin after add: ${userAfterAdd.fishBalance}\n`);

        // Buy a fishing rod
        console.log('3️⃣ Buying a fishing rod...');
        try {
            const rodResult = await FishingService.buyRod(testUserId, testGuildId, 'basic');
            console.log('   ✅ Bought fishing rod successfully!');
            console.log(`   Rod: ${rodResult.name}`);
            console.log(`   Price: ${rodResult.price} FishCoin`);
            
            const userAfterRod = await ecommerceDB.getUser(testUserId, testGuildId);
            console.log(`   FishCoin after buying rod: ${userAfterRod.fishBalance}\n`);
        } catch (error) {
            console.log('   ❌ Failed to buy rod:', (error as Error).message);
            return;
        }

        // Buy some bait
        console.log('4️⃣ Buying fishing bait...');
        try {
            const baitResult = await FishingService.buyBait(testUserId, testGuildId, 'basic', 5);
            console.log('   ✅ Bought fishing bait successfully!');
            console.log(`   Bait: ${baitResult.bait.name} x${baitResult.quantity}`);
            console.log(`   Total cost: ${baitResult.totalCost} FishCoin`);
            
            const userAfterBait = await ecommerceDB.getUser(testUserId, testGuildId);
            console.log(`   FishCoin after buying bait: ${userAfterBait.fishBalance}\n`);
        } catch (error) {
            console.log('   ❌ Failed to buy bait:', (error as Error).message);
            return;
        }

        // Set current rod and bait
        console.log('5️⃣ Setting current rod and bait...');
        try {
            await FishingService.setCurrentRod(testUserId, testGuildId, 'basic');
            await FishingService.setCurrentBait(testUserId, testGuildId, 'basic');
            console.log('   ✅ Set current rod and bait successfully!\n');
        } catch (error) {
            console.log('   ❌ Failed to set rod/bait:', (error as Error).message);
            return;
        }

        // Test fishing
        console.log('6️⃣ Testing fishing...');
        try {
            const fishingResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   ✅ Fishing successful!');
            console.log(`   Fish caught: ${fishingResult.fish.name}`);
            console.log(`   Fish value: ${fishingResult.value} FishCoin`);
            
            const userAfterFishing = await ecommerceDB.getUser(testUserId, testGuildId);
            console.log(`   FishCoin after fishing: ${userAfterFishing.fishBalance}`);
            
            // Get balance after buying bait
            const userAfterBait = await ecommerceDB.getUser(testUserId, testGuildId);
            
            // Calculate expected balance (should be reduced by fishing cost)
            const expectedBalance = Number(userAfterBait.fishBalance) - 10 + fishingResult.value;
            console.log(`   Expected FishCoin: ${expectedBalance}`);
            console.log(`   Actual FishCoin: ${userAfterFishing.fishBalance}`);
            console.log(`   Balance correct: ${Number(userAfterFishing.fishBalance) === expectedBalance}\n`);
            
        } catch (error) {
            console.log('   ❌ Fishing failed:', (error as Error).message);
        }

        // Test fishing with insufficient FishCoin
        console.log('7️⃣ Testing fishing with insufficient FishCoin...');
        // Reset to 0 FishCoin
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        try {
            const fishingResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   ❌ Fishing should have failed!');
        } catch (error) {
            console.log('   ✅ Fishing correctly failed with insufficient FishCoin');
            console.log(`   Error message: ${(error as Error).message}`);
        }

        console.log('\n🎉 Complete test finished successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testCompleteFishingWithFishCoin().catch(console.error); 