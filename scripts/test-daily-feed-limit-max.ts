import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishFoodService } from '../src/utils/fish-food';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-daily-feed-limit-max';
const testGuildId = 'test-guild-daily-feed-limit-max';

async function testDailyFeedLimitMax() {
    console.log('🧪 Testing Daily Feed Limit Maximum (20 times)...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for buying food
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 1000000, 'Test FishCoin for food');
        
        // Buy lots of food
        await FishFoodService.buyFishFood(testUserId, testGuildId, 'basic', 50);
        console.log('   Added 50 basic fish food');
        
        // Create multiple test fish
        console.log('\n2️⃣ Creating test fish...');
        const testFishes = [];
        for (let i = 1; i <= 5; i++) {
            const fish = await prisma.fish.create({
                data: {
                    userId: testUserId,
                    guildId: testGuildId,
                    species: `Test Fish ${i}`,
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
            await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish.id);
            testFishes.push(fish);
            console.log(`   Created fish ${i}: ${fish.species}`);
        }
        
        // Reset feed count to 0
        await prisma.user.update({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            data: { dailyFeedCount: 0, lastFeedReset: new Date() }
        });
        
        console.log('\n3️⃣ Testing feed limit to maximum...');
        
        let feedCount = 0;
        let fishIndex = 0;
        
        // Try to feed 25 times (should stop at 20)
        for (let attempt = 1; attempt <= 25; attempt++) {
            console.log(`\n   Feed attempt ${attempt}:`);
            
            // Check feed limit before feeding
            const feedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
            console.log(`     Can feed: ${feedCheck.canFeed}, Remaining: ${feedCheck.remainingFeeds}`);
            
            if (!feedCheck.canFeed) {
                console.log(`     ❌ Cannot feed: ${feedCheck.error}`);
                break;
            }
            
            // Try to feed
            const currentFish = testFishes[fishIndex % testFishes.length];
            const feedResult = await FishBreedingService.feedFishWithFood(testUserId, currentFish.id, 'basic', false);
            console.log(`     Feed result: ${feedResult.success ? 'Success' : 'Failed'}`);
            
            if (feedResult.success) {
                // Increment count
                await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
                feedCount++;
                console.log(`     ✅ Feed count incremented to ${feedCount}`);
                fishIndex++;
            } else {
                console.log(`     ❌ Feed failed: ${feedResult.error}`);
                break;
            }
        }
        
        // Check final state
        console.log('\n4️⃣ Checking final state...');
        const finalFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Final - Can feed: ${finalFeedInfo.canFeed}`);
        console.log(`   Final - Remaining feeds: ${finalFeedInfo.remainingFeeds}`);
        
        // Check database directly
        const finalUser = await prisma.user.findUnique({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });
        console.log(`   Database dailyFeedCount: ${finalUser?.dailyFeedCount}`);
        
        // Test one more feed attempt (should fail)
        console.log('\n5️⃣ Testing one more feed attempt (should fail)...');
        const extraFeedCheck = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Extra feed check - Can feed: ${extraFeedCheck.canFeed}`);
        if (!extraFeedCheck.canFeed) {
            console.log(`   ✅ Correctly blocked: ${extraFeedCheck.error}`);
        } else {
            console.log(`   ❌ Should have been blocked!`);
        }
        
        // Summary
        console.log('\n📊 Summary:');
        console.log(`   Total feeds attempted: 25`);
        console.log(`   Total feeds successful: ${feedCount}`);
        console.log(`   Expected limit: 20`);
        console.log(`   Limit reached: ${feedCount >= 20 ? '✅ Yes' : '❌ No'}`);
        
        if (feedCount === 20) {
            console.log('\n🎉 Daily feed limit is working correctly!');
            console.log('💡 Users can only feed fish 20 times per day.');
        } else {
            console.log('\n❌ Daily feed limit is not working correctly!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDailyFeedLimitMax().catch(console.error); 