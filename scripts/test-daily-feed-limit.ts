import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-daily-feed-limit';
const testGuildId = 'test-guild-daily-feed-limit';

async function testDailyFeedLimit() {
    console.log('🧪 Testing Daily Feed Limit...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Reset daily feed count to 0
        await prisma.user.update({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            data: { dailyFeedCount: 0, lastFeedReset: new Date() }
        });
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial dailyFeedCount: ${user.dailyFeedCount}\n`);

        // Test admin check
        console.log('2️⃣ Testing admin check...');
        const isAdmin = await FishBattleService.isAdministrator(testUserId, testGuildId);
        console.log(`   Is admin: ${isAdmin}`);

        // Test initial feed check
        console.log('\n3️⃣ Testing initial feed check...');
        const initialFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Can feed: ${initialFeedInfo.canFeed}`);
        console.log(`   Remaining feeds: ${initialFeedInfo.remainingFeeds}`);
        if (initialFeedInfo.error) {
            console.log(`   Error: ${initialFeedInfo.error}`);
        }

        // Test incrementing feed count
        console.log('\n4️⃣ Testing feed count increment...');
        await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
        
        const afterIncrement = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   After increment - Can feed: ${afterIncrement.canFeed}`);
        console.log(`   After increment - Remaining feeds: ${afterIncrement.remainingFeeds}`);

        // Test multiple increments to reach limit
        console.log('\n5️⃣ Testing multiple increments to reach limit...');
        for (let i = 0; i < 25; i++) {
            await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
        }
        
        const afterMultiple = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   After 25 increments - Can feed: ${afterMultiple.canFeed}`);
        console.log(`   After 25 increments - Remaining feeds: ${afterMultiple.remainingFeeds}`);
        if (afterMultiple.error) {
            console.log(`   Error: ${afterMultiple.error}`);
        }

        // Test with actual fish feeding
        console.log('\n6️⃣ Testing with actual fish feeding...');
        
        // Create a test fish
        const testFish = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Fish for Feeding',
                level: 1,
                experience: 0,
                rarity: 'common',
                value: 1000,
                generation: 1,
                status: 'growing',
                stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 }),
                specialTraits: JSON.stringify([])
            }
        });
        
        // Add fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, testFish.id);
        
        // Add FishCoin for buying food
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 1000000, 'Test FishCoin for food');
        
        // Add fish food for testing
        const { FishFoodService } = await import('../src/utils/fish-food');
        const buyResult = await FishFoodService.buyFishFood(testUserId, testGuildId, 'basic', 10);
        console.log(`   Buy food result: ${buyResult.success ? 'Success' : 'Failed'}`);
        if (!buyResult.success) {
            console.log(`   Buy food error: ${buyResult.error}`);
        }
        
        // Reset feed count to 0 for testing
        await prisma.user.update({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            data: { dailyFeedCount: 0, lastFeedReset: new Date() }
        });
        
        console.log('   Testing feed with basic food...');
        
        // Test feeding 5 times
        for (let i = 1; i <= 5; i++) {
            console.log(`   Feed attempt ${i}:`);
            
            // Check feed limit before feeding
            const feedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
            console.log(`     Can feed: ${feedCheck.canFeed}, Remaining: ${feedCheck.remainingFeeds}`);
            
            if (feedCheck.canFeed) {
                // Try to feed
                const feedResult = await FishBreedingService.feedFishWithFood(testUserId, testFish.id, 'basic', false);
                console.log(`     Feed result: ${feedResult.success ? 'Success' : 'Failed'}`);
                
                if (feedResult.success) {
                    // Increment count
                    await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
                    console.log(`     Feed count incremented`);
                }
            } else {
                console.log(`     Cannot feed: ${feedCheck.error}`);
                break;
            }
        }

        // Check final feed count
        console.log('\n7️⃣ Checking final feed count...');
        const finalFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Final - Can feed: ${finalFeedInfo.canFeed}`);
        console.log(`   Final - Remaining feeds: ${finalFeedInfo.remainingFeeds}`);
        
        // Check database directly
        const finalUser = await prisma.user.findUnique({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });
        console.log(`   Database dailyFeedCount: ${finalUser?.dailyFeedCount}`);

        console.log('\n🎉 Daily feed limit test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDailyFeedLimit().catch(console.error); 