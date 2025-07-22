import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishFoodService } from '../src/utils/fish-food';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-daily-feed-ui';
const testGuildId = 'test-guild-daily-feed-ui';

async function testDailyFeedUI() {
    console.log('🧪 Testing Daily Feed Count in UI...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 500000, 'Test FishCoin for feeding');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial FishCoin: ${user.fishBalance.toLocaleString()}\n`);

        // Test admin check
        console.log('3️⃣ Testing admin check...');
        const isAdmin = await FishBattleService.isAdministrator(testUserId, testGuildId);
        console.log(`   Is admin: ${isAdmin}`);

        // Create test fish
        console.log('\n4️⃣ Creating test fish...');
        const fish = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'UI Feed Test Fish',
                level: 1,
                experience: 0,
                rarity: 'legendary',
                value: 10000,
                generation: 1,
                status: 'growing',
                stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 }),
                specialTraits: JSON.stringify(['UI Feed Test'])
            }
        });
        
        // Add fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish.id);
        console.log(`   Created fish: ${fish.species} (Level ${fish.level}, Exp: ${fish.experience})`);

        // Buy fish food
        console.log('\n5️⃣ Buying fish food...');
        const buyResult = await FishFoodService.buyFishFood(testUserId, testGuildId, 'basic', 10);
        console.log(`   Buy result: ${buyResult.success ? 'Success' : 'Failed'}`);
        if (buyResult.success) {
            console.log(`   Bought: ${buyResult.quantity}x ${buyResult.foodInfo?.name || 'Unknown'}`);
        }

        // Test multiple feeds and check daily feed count
        console.log('\n6️⃣ Testing multiple feeds...');
        for (let i = 1; i <= 5; i++) {
            console.log(`\n   --- Feed #${i} ---`);
            
            // Check daily feed info BEFORE feeding
            const feedInfoBefore = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
            console.log(`   Before feed: Can feed: ${feedInfoBefore.canFeed}, Remaining: ${feedInfoBefore.remainingFeeds}`);
            
            if (!feedInfoBefore.canFeed) {
                console.log(`   ❌ Cannot feed: ${feedInfoBefore.error}`);
                break;
            }
            
            // Feed fish
            const feedResult = await FishBreedingService.feedFishWithFood(testUserId, fish.id, 'basic', isAdmin);
            console.log(`   Feed result: ${feedResult.success ? 'Success' : 'Failed'}`);
            
            if (!feedResult.success) {
                console.log(`   Error: ${feedResult.error}`);
                break;
            }
            
            console.log(`   Exp gained: +${feedResult.experienceGained}`);
            console.log(`   New level: ${feedResult.fish?.level}`);
            
            // Increment daily feed count (simulating UI behavior)
            if (!isAdmin) {
                await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
                console.log(`   ✅ Daily feed count incremented`);
            }
            
            // Check daily feed info AFTER feeding
            const feedInfoAfter = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
            console.log(`   After feed: Can feed: ${feedInfoAfter.canFeed}, Remaining: ${feedInfoAfter.remainingFeeds}`);
            
            // Verify the count decreased
            const expectedRemaining = feedInfoBefore.remainingFeeds - 1;
            if (feedInfoAfter.remainingFeeds === expectedRemaining) {
                console.log(`   ✅ Count decreased correctly: ${feedInfoBefore.remainingFeeds} → ${feedInfoAfter.remainingFeeds}`);
            } else {
                console.log(`   ❌ Count not decreased correctly: Expected ${expectedRemaining}, Got ${feedInfoAfter.remainingFeeds}`);
            }
        }

        // Check final user data in database
        console.log('\n7️⃣ Checking final user data in database...');
        const finalUser = await prisma.user.findUnique({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });
        console.log(`   Daily feed count in DB: ${finalUser?.dailyFeedCount || 0}`);
        console.log(`   Last feed reset: ${finalUser?.lastFeedReset}`);

        // Check final daily feed info
        console.log('\n8️⃣ Checking final daily feed info...');
        const finalFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Final: Can feed: ${finalFeedInfo.canFeed}, Remaining: ${finalFeedInfo.remainingFeeds}`);

        // Test UI simulation
        console.log('\n9️⃣ Testing UI simulation...');
        const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        
        // Simulate what createUIWithFishFood does
        const dailyFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   UI would show: ${dailyFeedInfo.remainingFeeds}/20 lần cho cá ăn`);
        
        if (dailyFeedInfo.canFeed) {
            console.log(`   ✅ UI would show: "Còn ${dailyFeedInfo.remainingFeeds}/20 lần cho cá ăn"`);
        } else {
            console.log(`   ❌ UI would show: "Đã đạt giới hạn! (0/20)"`);
        }

        console.log('\n🎉 Daily feed UI test completed!');
        console.log('💡 If the count is not updating in UI, check:');
        console.log('   1. Daily feed count is being incremented correctly');
        console.log('   2. createUIWithFishFood is fetching fresh daily feed info');
        console.log('   3. UI is being updated after each feed');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testDailyFeedUI().catch(console.error); 