import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishFoodService } from '../src/utils/fish-food';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-fish-feed-complete';
const testGuildId = 'test-guild-fish-feed-complete';

async function testFishFeedComplete() {
    console.log('🧪 Testing Complete Fish Feeding Process...\n');

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
                species: 'Feed Test Fish',
                level: 1,
                experience: 0,
                rarity: 'legendary',
                value: 10000,
                generation: 1,
                status: 'growing',
                stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 }),
                specialTraits: JSON.stringify(['Feed Test'])
            }
        });
        
        // Add fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish.id);
        console.log(`   Created fish: ${fish.species} (Level ${fish.level}, Exp: ${fish.experience})`);

        // Check initial daily feed info
        console.log('\n5️⃣ Checking initial daily feed info...');
        const initialFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Can feed: ${initialFeedInfo.canFeed}`);
        console.log(`   Remaining feeds: ${initialFeedInfo.remainingFeeds}`);
        console.log(`   Daily limit: ${FishFeedService.getDailyFeedLimit()}`);

        // Buy fish food
        console.log('\n6️⃣ Buying fish food...');
        const beforeBuy = await fishCoinDB.getFishBalance(testUserId, testGuildId);
        console.log(`   FishCoin before buying: ${beforeBuy.toLocaleString()}`);
        
        const buyResult = await FishFoodService.buyFishFood(testUserId, testGuildId, 'basic', 5);
        console.log(`   Buy result: ${buyResult.success ? 'Success' : 'Failed'}`);
        if (!buyResult.success) {
            console.log(`   Error: ${buyResult.error}`);
        } else {
            console.log(`   Bought: ${buyResult.quantity}x ${buyResult.foodInfo?.name || 'Unknown'}`);
            console.log(`   Cost: ${(buyResult.totalCost || 0).toLocaleString()} FishCoin`);
        }
        
        const afterBuy = await fishCoinDB.getFishBalance(testUserId, testGuildId);
        console.log(`   FishCoin after buying: ${afterBuy.toLocaleString()}`);
        console.log(`   Cost deducted: ${(beforeBuy - afterBuy).toLocaleString()} FishCoin`);

        // Check fish food inventory
        console.log('\n7️⃣ Checking fish food inventory...');
        const fishFoodInventory = await FishFoodService.getUserFishFood(testUserId, testGuildId);
        console.log(`   Fish food items: ${fishFoodInventory.length}`);
        fishFoodInventory.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.foodInfo.name}: ${item.quantity}x`);
        });

        // Feed fish multiple times
        console.log('\n8️⃣ Feeding fish multiple times...');
        for (let i = 1; i <= 3; i++) {
            console.log(`\n   --- Feed #${i} ---`);
            
            // Check daily feed limit before feeding
            const feedCheckBefore = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
            console.log(`   Can feed: ${feedCheckBefore.canFeed}, Remaining: ${feedCheckBefore.remainingFeeds}`);
            
            if (!feedCheckBefore.canFeed) {
                console.log(`   ❌ Cannot feed: ${feedCheckBefore.error}`);
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
            console.log(`   New exp: ${feedResult.fish?.experience}`);
            console.log(`   Leveled up: ${feedResult.leveledUp ? 'Yes' : 'No'}`);
            console.log(`   Became adult: ${feedResult.becameAdult ? 'Yes' : 'No'}`);
            
            // Increment daily feed count
            if (!isAdmin) {
                await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
                console.log(`   ✅ Daily feed count incremented`);
            }
            
            // Check daily feed limit after feeding
            const feedCheckAfter = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
            console.log(`   Remaining feeds after: ${feedCheckAfter.remainingFeeds}`);
        }

        // Check final fish food inventory
        console.log('\n9️⃣ Checking final fish food inventory...');
        const finalFishFoodInventory = await FishFoodService.getUserFishFood(testUserId, testGuildId);
        console.log(`   Fish food items: ${finalFishFoodInventory.length}`);
        finalFishFoodInventory.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.foodInfo.name}: ${item.quantity}x`);
        });

        // Check final daily feed info
        console.log('\n🔟 Checking final daily feed info...');
        const finalFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Can feed: ${finalFeedInfo.canFeed}`);
        console.log(`   Remaining feeds: ${finalFeedInfo.remainingFeeds}`);

        // Check FishCoin transactions
        console.log('\n1️⃣1️⃣ Checking FishCoin transactions...');
        const fishTransactions = await prisma.fishTransaction.findMany({
            where: { userId: testUserId, guildId: testGuildId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        
        console.log(`   Recent FishCoin transactions: ${fishTransactions.length}`);
        fishTransactions.forEach((tx, index) => {
            console.log(`   ${index + 1}. ${tx.type}: ${tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()} FishCoin`);
            console.log(`      Description: ${tx.description}`);
        });

        // Check user's daily feed count in database
        console.log('\n1️⃣2️⃣ Checking user daily feed count in database...');
        const finalUser = await prisma.user.findUnique({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } }
        });
        console.log(`   Daily feed count: ${finalUser?.dailyFeedCount || 0}`);
        console.log(`   Last feed reset: ${finalUser?.lastFeedReset}`);

        console.log('\n🎉 Complete fish feeding test finished!');
        console.log('💡 FishCoin is deducted when BUYING food, not when USING food.');
        console.log('💡 Daily feed count should increment after each successful feed.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testFishFeedComplete().catch(console.error); 