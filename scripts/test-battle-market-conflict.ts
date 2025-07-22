import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishMarketService } from '../src/utils/fish-market';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-battle-market';
const testGuildId = 'test-guild-battle-market';

async function testBattleMarketConflict() {
    console.log('🧪 Testing Battle Inventory vs Fish Market Conflict...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 500000, 'Test FishCoin for battle market');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial FishCoin: ${user.fishBalance.toLocaleString()}\n`);

        // Create test fish
        console.log('3️⃣ Creating test fish...');
        
        // Fish 1: Generation 2, Adult (for battle)
        const fish1 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Battle Fish 1',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 15000,
                generation: 2,
                status: 'adult',
                stats: JSON.stringify({ strength: 15, agility: 15, intelligence: 15, defense: 15, luck: 15 }),
                specialTraits: JSON.stringify(['Battle Test 1'])
            }
        });
        
        // Fish 2: Generation 2, Adult (for market)
        const fish2 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Market Fish 1',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 20000,
                generation: 2,
                status: 'adult',
                stats: JSON.stringify({ strength: 20, agility: 20, intelligence: 20, defense: 20, luck: 20 }),
                specialTraits: JSON.stringify(['Market Test 1'])
            }
        });
        
        // Fish 3: Generation 2, Adult (for testing conflict)
        const fish3 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Conflict Fish 1',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 25000,
                generation: 2,
                status: 'adult',
                stats: JSON.stringify({ strength: 25, agility: 25, intelligence: 25, defense: 25, luck: 25 }),
                specialTraits: JSON.stringify(['Conflict Test 1'])
            }
        });
        
        // Add all fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish3.id);
        
        console.log(`   Created fish:`);
        console.log(`   1. ${fish1.species} (Gen ${fish1.generation}, ${fish1.status}, Level ${fish1.level})`);
        console.log(`   2. ${fish2.species} (Gen ${fish2.generation}, ${fish2.status}, Level ${fish2.level})`);
        console.log(`   3. ${fish3.species} (Gen ${fish3.generation}, ${fish3.status}, Level ${fish3.level})`);

        // Test 1: Add fish to battle inventory
        console.log('\n4️⃣ Testing add fish to battle inventory...');
        const addBattleResult = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, fish1.id);
        console.log(`   Add to battle result: ${addBattleResult.success ? 'Success' : 'Failed'}`);
        if (!addBattleResult.success) {
            console.log(`   Error: ${addBattleResult.error}`);
        } else {
            console.log(`   Added: ${addBattleResult.inventoryItem?.fish.name || 'Unknown'}`);
        }

        // Test 2: List fish on market
        console.log('\n5️⃣ Testing list fish on market...');
        const listMarketResult = await FishMarketService.listFish(testUserId, testGuildId, fish2.id, 30000);
        console.log(`   List on market result: ${listMarketResult.success ? 'Success' : 'Failed'}`);
        if (!listMarketResult.success) {
            console.log(`   Error: ${listMarketResult.error}`);
        } else {
            console.log(`   Listed: ${listMarketResult.listing?.fish.name || 'Unknown'} for ${listMarketResult.listing?.price.toLocaleString() || 0} FishCoin`);
        }

        // Test 3: Try to add market fish to battle (should fail)
        console.log('\n6️⃣ Testing add market fish to battle (should fail)...');
        const addMarketToBattleResult = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, fish2.id);
        console.log(`   Add market fish to battle result: ${addMarketToBattleResult.success ? 'Success' : 'Failed'}`);
        if (!addMarketToBattleResult.success) {
            console.log(`   Expected error: ${addMarketToBattleResult.error}`);
        }

        // Test 4: Try to list battle fish on market (should fail)
        console.log('\n7️⃣ Testing list battle fish on market (should fail)...');
        const listBattleOnMarketResult = await FishMarketService.listFish(testUserId, testGuildId, fish1.id, 35000);
        console.log(`   List battle fish on market result: ${listBattleOnMarketResult.success ? 'Success' : 'Failed'}`);
        if (!listBattleOnMarketResult.success) {
            console.log(`   Expected error: ${listBattleOnMarketResult.error}`);
        }

        // Test 5: Get eligible battle fish (should exclude market fish)
        console.log('\n8️⃣ Testing get eligible battle fish...');
        const eligibleBattleFish = await BattleFishInventoryService.getEligibleBattleFish(testUserId, testGuildId);
        console.log(`   Eligible battle fish count: ${eligibleBattleFish.length}`);
        eligibleBattleFish.forEach((fish, index) => {
            console.log(`   ${index + 1}. ${fish.name} (Gen ${fish.generation}, Level ${fish.level})`);
        });

        // Test 6: Test conflict scenario - list fish then try to add to battle
        console.log('\n9️⃣ Testing conflict scenario...');
        const listConflictResult = await FishMarketService.listFish(testUserId, testGuildId, fish3.id, 40000);
        console.log(`   List conflict fish result: ${listConflictResult.success ? 'Success' : 'Failed'}`);
        
        if (listConflictResult.success) {
            const addConflictToBattleResult = await BattleFishInventoryService.addFishToBattleInventory(testUserId, testGuildId, fish3.id);
            console.log(`   Add conflict fish to battle result: ${addConflictToBattleResult.success ? 'Success' : 'Failed'}`);
            if (!addConflictToBattleResult.success) {
                console.log(`   Expected error: ${addConflictToBattleResult.error}`);
            }
        }

        // Test 7: Check battle inventory
        console.log('\n🔟 Testing check battle inventory...');
        const battleInventory = await BattleFishInventoryService.getBattleFishInventory(testUserId, testGuildId);
        console.log(`   Battle inventory count: ${battleInventory.items.length}`);
        battleInventory.items.forEach((item, index) => {
            console.log(`   ${index + 1}. ${item.fish.name} (Gen ${item.fish.generation}, Level ${item.fish.level})`);
        });

        // Test 8: Check market listings
        console.log('\n1️⃣1️⃣ Testing check market listings...');
        const marketListings = await FishMarketService.getUserListings(testUserId, testGuildId);
        console.log(`   Market listings count: ${marketListings.length}`);
        marketListings.forEach((listing, index) => {
            console.log(`   ${index + 1}. ${listing.fish.name} - ${listing.price.toLocaleString()} FishCoin`);
        });

        console.log('\n🎉 Battle vs Market conflict test completed!');
        console.log('💡 Expected behavior:');
        console.log('   ✅ Fish in battle inventory cannot be listed on market');
        console.log('   ✅ Fish listed on market cannot be added to battle inventory');
        console.log('   ✅ Eligible battle fish excludes market fish');
        console.log('   ✅ Clear error messages for conflicts');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testBattleMarketConflict().catch(console.error); 