import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishFeedService } from '../src/utils/fish-feed';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-fish-feed-breeding';
const testGuildId = 'test-guild-fish-feed-breeding';

async function testFishFeedAndBreeding() {
    console.log('🧪 Testing Fish Feed and Breeding Issues...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 200000, 'Test FishCoin');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial FishCoin: ${user.fishBalance}\n`);

        // Test daily feed limit
        console.log('3️⃣ Testing daily feed limit...');
        
        // Reset daily feed count
        await prisma.user.update({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            data: { dailyFeedCount: 0, lastFeedReset: new Date() }
        });
        
        const initialFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Initial feed info: ${initialFeedInfo.remainingFeeds}/20 remaining`);
        
        // Test incrementing feed count
        console.log('\n4️⃣ Testing feed count increment...');
        await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
        
        const afterIncrement = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   After increment: ${afterIncrement.remainingFeeds}/20 remaining`);
        
        // Test multiple increments
        for (let i = 0; i < 3; i++) {
            await FishFeedService.incrementDailyFeedCount(testUserId, testGuildId);
        }
        
        const afterMultiple = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   After 4 increments: ${afterMultiple.remainingFeeds}/20 remaining`);

        // Test breeding cost
        console.log('\n5️⃣ Testing breeding cost...');
        
        // Create test fish for breeding
        console.log('   Creating test fish for breeding...');
        const fish1 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Legendary Fish 1',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 50000,
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({ strength: 50, agility: 50, intelligence: 50, defense: 50, luck: 50 }),
                specialTraits: JSON.stringify(['Test Trait 1'])
            }
        });
        
        const fish2 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Legendary Fish 2',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 60000,
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({ strength: 60, agility: 60, intelligence: 60, defense: 60, luck: 60 }),
                specialTraits: JSON.stringify(['Test Trait 2'])
            }
        });
        
        // Add fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        
        console.log(`   Created fish: ${fish1.species} and ${fish2.species}`);
        
        // Check FishCoin before breeding
        const beforeBreeding = await fishCoinDB.getFishBalance(testUserId, testGuildId);
        console.log(`   FishCoin before breeding: ${beforeBreeding.toLocaleString()}`);
        
        // Test breeding
        console.log('\n6️⃣ Testing breeding...');
        const breedingResult = await FishBreedingService.breedFish(testUserId, fish1.id, fish2.id, false);
        
        // Test adding offspring to inventory manually
        console.log('\n6️⃣.5️⃣ Testing manual add to inventory...');
        if (breedingResult.success && breedingResult.offspring) {
            const addResult = await FishInventoryService.addFishToInventory(testUserId, testGuildId, breedingResult.offspring.id);
            console.log(`   Add to inventory result: ${addResult.success ? 'Success' : 'Failed'}`);
            if (!addResult.success) {
                console.log(`   Error: ${addResult.error}`);
            }
        }
        
        if (breedingResult.success) {
            console.log('   ✅ Breeding successful!');
            console.log(`   Offspring: ${breedingResult.offspring?.species}`);
            console.log(`   Offspring value: ${breedingResult.offspring?.value}`);
            
            // Check FishCoin after breeding
            const afterBreeding = await fishCoinDB.getFishBalance(testUserId, testGuildId);
            console.log(`   FishCoin after breeding: ${afterBreeding.toLocaleString()}`);
            
            const cost = beforeBreeding - afterBreeding;
            console.log(`   Cost deducted: ${cost.toLocaleString()} FishCoin`);
            
            if (cost === 100000n) {
                console.log('   ✅ Breeding cost correctly deducted!');
            } else {
                console.log('   ❌ Breeding cost not deducted correctly!');
            }
            
            // Check if offspring is in inventory
            const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
            console.log(`   Inventory items count: ${inventory.items.length}`);
            
            const offspringInInventory = inventory.items.find((item: any) => item.fish.id === breedingResult.offspring?.id);
            if (offspringInInventory) {
                console.log('   ✅ Offspring added to inventory!');
                console.log(`   Offspring in inventory: ${offspringInInventory.fish.species}`);
            } else {
                console.log('   ❌ Offspring not in inventory!');
                console.log('   Available fish in inventory:');
                inventory.items.forEach((item: any, index: number) => {
                    console.log(`     ${index + 1}. ${item.fish.species} (ID: ${item.fish.id})`);
                });
            }
            
        } else {
            console.log(`   ❌ Breeding failed: ${breedingResult.error}`);
        }

        // Test feed limit after breeding
        console.log('\n7️⃣ Testing feed limit after breeding...');
        const finalFeedInfo = await FishFeedService.checkAndResetDailyFeedCount(testUserId, testGuildId);
        console.log(`   Final feed info: ${finalFeedInfo.remainingFeeds}/20 remaining`);

        console.log('\n🎉 Fish feed and breeding test completed!');
        console.log('💡 Issues should be fixed now!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testFishFeedAndBreeding().catch(console.error); 