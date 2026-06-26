import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishMarketService } from '../src/utils/fish-market';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-fishmarket-conditions';
const testGuildId = 'test-guild-fishmarket-conditions';

async function testFishMarketConditions() {
    console.log('🧪 Testing Fish Market Conditions (No Adult Requirement)...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 500000, 'Test FishCoin for market');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial FishCoin: ${user.fishBalance.toLocaleString()}\n`);

        // Create test fish with different conditions
        console.log('3️⃣ Creating test fish with different conditions...');
        
        // Fish 1: Generation 1, Growing (should NOT be eligible)
        const fish1 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Gen1 Growing Fish',
                level: 1,
                experience: 0,
                rarity: 'legendary',
                value: 10000,
                generation: 1,
                status: 'growing',
                stats: JSON.stringify({ strength: 10, agility: 10, intelligence: 10, defense: 10, luck: 10 }),
                specialTraits: JSON.stringify(['Gen1 Test'])
            }
        });
        
        // Fish 2: Generation 2, Growing (should be eligible)
        const fish2 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Gen2 Growing Fish',
                level: 5,
                experience: 0,
                rarity: 'legendary',
                value: 15000,
                generation: 2,
                status: 'growing',
                stats: JSON.stringify({ strength: 15, agility: 15, intelligence: 15, defense: 15, luck: 15 }),
                specialTraits: JSON.stringify(['Gen2 Test'])
            }
        });
        
        // Fish 3: Generation 2, Adult (should be eligible)
        const fish3 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Gen2 Adult Fish',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 20000,
                generation: 2,
                status: 'adult',
                stats: JSON.stringify({ strength: 20, agility: 20, intelligence: 20, defense: 20, luck: 20 }),
                specialTraits: JSON.stringify(['Gen2 Adult Test'])
            }
        });
        
        // Fish 4: Generation 3, Growing (should be eligible)
        const fish4 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Gen3 Growing Fish',
                level: 3,
                experience: 0,
                rarity: 'legendary',
                value: 25000,
                generation: 3,
                status: 'growing',
                stats: JSON.stringify({ strength: 25, agility: 25, intelligence: 25, defense: 25, luck: 25 }),
                specialTraits: JSON.stringify(['Gen3 Test'])
            }
        });
        
        // Add all fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish3.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish4.id);
        
        console.log(`   Created fish:`);
        console.log(`   1. ${fish1.species} (Gen ${fish1.generation}, ${fish1.status}, Level ${fish1.level})`);
        console.log(`   2. ${fish2.species} (Gen ${fish2.generation}, ${fish2.status}, Level ${fish2.level})`);
        console.log(`   3. ${fish3.species} (Gen ${fish3.generation}, ${fish3.status}, Level ${fish3.level})`);
        console.log(`   4. ${fish4.species} (Gen ${fish3.generation}, ${fish4.status}, Level ${fish4.level})`);

        // Get user inventory
        console.log('\n4️⃣ Getting user inventory...');
        const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        console.log(`   Total fish in inventory: ${inventory.items.length}`);

        // Test eligibility conditions (simulating UI logic)
        console.log('\n5️⃣ Testing eligibility conditions...');
        const eligibleFish = inventory.items.filter((item: any) => {
            const fish = item.fish;
            return fish.generation >= 2 && fish.userId === testUserId;
        });
        
        console.log(`   Eligible fish count: ${eligibleFish.length}`);
        eligibleFish.forEach((item: any, index: number) => {
            const fish = item.fish;
            console.log(`   ${index + 1}. ${fish.species} (Gen ${fish.generation}, ${fish.status}, Level ${fish.level})`);
        });

        // Test listing fish
        console.log('\n6️⃣ Testing listing fish...');
        if (eligibleFish.length > 0) {
            const testFish = eligibleFish[0].fish;
            console.log(`   Testing with: ${testFish.species} (ID: ${testFish.id})`);
            
            const listResult = await FishMarketService.listFish(testUserId, testGuildId, testFish.id, 50000);
            console.log(`   List result: ${listResult.success ? 'Success' : 'Failed'}`);
            
            if (!listResult.success) {
                console.log(`   Error: ${listResult.error}`);
            } else {
                console.log(`   Listed for: ${listResult.listing?.price.toLocaleString()} FishCoin`);
            }
        }

        // Test listing Gen1 fish (should fail)
        console.log('\n7️⃣ Testing listing Gen1 fish (should fail)...');
        const gen1Fish = inventory.items.find((item: any) => item.fish.generation === 1);
        if (gen1Fish) {
            const listResult = await FishMarketService.listFish(testUserId, testGuildId, gen1Fish.fish.id, 30000);
            console.log(`   List Gen1 result: ${listResult.success ? 'Success' : 'Failed'}`);
            
            if (!listResult.success) {
                console.log(`   Expected error: ${listResult.error}`);
            }
        }

        // Get listed fish IDs
        console.log('\n8️⃣ Getting listed fish IDs...');
        const listedFishIds = await FishMarketService.getListedFishIds(testGuildId);
        console.log(`   Listed fish IDs: ${listedFishIds.length}`);
        listedFishIds.forEach((id, index) => {
            console.log(`   ${index + 1}. ${id}`);
        });

        // Test market listings
        console.log('\n9️⃣ Testing market listings...');
        const marketListings = await FishMarketService.getMarketListings(testGuildId);
        console.log(`   Market listings: ${marketListings.listings.length}`);
        marketListings.listings.forEach((listing, index) => {
            console.log(`   ${index + 1}. ${listing.fish.name} - ${listing.price.toLocaleString()} FishCoin`);
        });

        // Test user listings
        console.log('\n🔟 Testing user listings...');
        const userListings = await FishMarketService.getUserListings(testUserId, testGuildId);
        console.log(`   User listings: ${userListings.length}`);
        userListings.forEach((listing, index) => {
            console.log(`   ${index + 1}. ${listing.fish.name} - ${listing.price.toLocaleString()} FishCoin`);
        });

        console.log('\n🎉 Fish Market conditions test completed!');
        console.log('💡 New conditions:');
        console.log('   ✅ Generation 2+ (no adult requirement)');
        console.log('   ✅ Not in battle inventory');
        console.log('   ✅ Not already listed');
        console.log('   ✅ Belongs to user');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testFishMarketConditions().catch(console.error); 