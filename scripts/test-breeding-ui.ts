import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-breeding-ui';
const testGuildId = 'test-guild-breeding-ui';

async function testBreedingUI() {
    console.log('🧪 Testing Breeding through UI (FishBarnHandler)...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 200000, 'Test FishCoin for breeding');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial FishCoin: ${user.fishBalance.toLocaleString()}\n`);

        // Test admin check
        console.log('3️⃣ Testing admin check...');
        const isAdmin = await FishBattleService.isAdministrator(testUserId, testGuildId);
        console.log(`   Is admin: ${isAdmin}`);

        // Create test fish for breeding
        console.log('\n4️⃣ Creating test fish for breeding...');
        const fish1 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'UI Test Legendary Fish 1',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 50000,
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({ strength: 50, agility: 50, intelligence: 50, defense: 50, luck: 50 }),
                specialTraits: JSON.stringify(['UI Test Trait 1'])
            }
        });
        
        const fish2 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'UI Test Legendary Fish 2',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 60000,
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({ strength: 60, agility: 60, intelligence: 60, defense: 60, luck: 60 }),
                specialTraits: JSON.stringify(['UI Test Trait 2'])
            }
        });
        
        // Add fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        
        console.log(`   Created fish: ${fish1.species} and ${fish2.species}`);
        console.log(`   Fish1 ID: ${fish1.id}`);
        console.log(`   Fish2 ID: ${fish2.id}`);

        // Check FishCoin before breeding
        console.log('\n5️⃣ Checking FishCoin before breeding...');
        const beforeBreeding = await fishCoinDB.getFishBalance(testUserId, testGuildId);
        console.log(`   FishCoin before breeding: ${beforeBreeding.toLocaleString()}`);

        // Test breeding through FishBreedingService (simulating UI call)
        console.log('\n6️⃣ Testing breeding through FishBreedingService...');
        console.log('   Calling FishBreedingService.breedFish (simulating UI)...');
        
        const breedingResult = await FishBreedingService.breedFish(testUserId, fish1.id, fish2.id, isAdmin);
        
        console.log(`   Breeding result: ${breedingResult.success ? 'Success' : 'Failed'}`);
        if (!breedingResult.success) {
            console.log(`   Error: ${breedingResult.error}`);
        } else {
            console.log(`   Offspring: ${breedingResult.offspring?.species}`);
            console.log(`   Offspring value: ${breedingResult.offspring?.value}`);
        }

        // Check FishCoin after breeding
        console.log('\n7️⃣ Checking FishCoin after breeding...');
        const afterBreeding = await fishCoinDB.getFishBalance(testUserId, testGuildId);
        console.log(`   FishCoin after breeding: ${afterBreeding.toLocaleString()}`);
        
        const cost = beforeBreeding - afterBreeding;
        console.log(`   Cost deducted: ${cost.toLocaleString()} FishCoin`);
        
        if (cost === 100000n) {
            console.log('   ✅ Breeding cost correctly deducted!');
        } else {
            console.log('   ❌ Breeding cost not deducted correctly!');
            console.log(`   Expected: 100,000, Actual: ${cost.toLocaleString()}`);
        }

        // Check if offspring is in inventory
        console.log('\n8️⃣ Checking offspring in inventory...');
        const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        console.log(`   Inventory items count: ${inventory.items.length}`);
        
        if (breedingResult.success && breedingResult.offspring) {
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
        }

        // Check breeding history
        console.log('\n9️⃣ Checking breeding history...');
        const breedingHistory = await prisma.breedingHistory.findMany({
            where: { userId: testUserId, guildId: testGuildId },
            orderBy: { bredAt: 'desc' },
            take: 1
        });
        
        if (breedingHistory.length > 0) {
            const latestBreeding = breedingHistory[0];
            console.log(`   Latest breeding: ${latestBreeding.success ? 'Success' : 'Failed'}`);
            console.log(`   Notes: ${latestBreeding.notes}`);
            console.log(`   Bred at: ${latestBreeding.bredAt}`);
        } else {
            console.log('   No breeding history found');
        }

        // Test duplicate add attempt (should fail gracefully)
        console.log('\n🔟 Testing duplicate add attempt...');
        if (breedingResult.success && breedingResult.offspring) {
            const duplicateAddResult = await FishInventoryService.addFishToInventory(testUserId, testGuildId, breedingResult.offspring.id);
            console.log(`   Duplicate add result: ${duplicateAddResult.success ? 'Success' : 'Failed'}`);
            if (!duplicateAddResult.success) {
                console.log(`   Expected error: ${duplicateAddResult.error}`);
            }
        }

        console.log('\n🎉 Breeding UI test completed!');
        console.log('💡 The "Cá đã có trong inventory!" error should be resolved now.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testBreedingUI().catch(console.error); 