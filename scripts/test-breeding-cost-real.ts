import { ecommerceDB } from '../src/utils/ecommerce-db';
import { fishCoinDB } from '../src/utils/fish-coin';
import { FishBreedingService } from '../src/utils/fish-breeding';
import { FishInventoryService } from '../src/utils/fish-inventory';
import { FishBattleService } from '../src/utils/fish-battle';
import prisma from '../src/utils/prisma';

const testUserId = 'test-user-breeding-cost-real';
const testGuildId = 'test-guild-breeding-cost-real';

async function testBreedingCostReal() {
    console.log('🧪 Testing Breeding Cost with Real User (Non-Admin)...\n');

    try {
        // Reset user data
        console.log('1️⃣ Resetting user data...');
        await ecommerceDB.resetBalance(testUserId, testGuildId);
        
        // Add FishCoin for testing
        console.log('2️⃣ Adding FishCoin for testing...');
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 200000, 'Test FishCoin for breeding');
        
        const user = await ecommerceDB.getUser(testUserId, testGuildId);
        console.log(`   Initial FishCoin: ${user.fishBalance.toLocaleString()}\n`);

        // Test admin check - should be false for regular user
        console.log('3️⃣ Testing admin check...');
        const isAdmin = await FishBattleService.isAdministrator(testUserId, testGuildId);
        console.log(`   Is admin: ${isAdmin}`);
        console.log(`   Expected: false (regular user should not be admin)`);

        if (isAdmin) {
            console.log('   ⚠️  WARNING: User is admin! This will skip FishCoin deduction.');
            console.log('   💡 To test FishCoin deduction, make sure user is NOT admin.\n');
        }

        // Create test fish for breeding
        console.log('4️⃣ Creating test fish for breeding...');
        const fish1 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Cost Test Legendary Fish 1',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 50000,
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({ strength: 50, agility: 50, intelligence: 50, defense: 50, luck: 50 }),
                specialTraits: JSON.stringify(['Cost Test Trait 1'])
            }
        });
        
        const fish2 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Cost Test Legendary Fish 2',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 60000,
                generation: 1,
                status: 'adult',
                stats: JSON.stringify({ strength: 60, agility: 60, intelligence: 60, defense: 60, luck: 60 }),
                specialTraits: JSON.stringify(['Cost Test Trait 2'])
            }
        });
        
        // Add fish to inventory
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        
        console.log(`   Created fish: ${fish1.species} and ${fish2.species}`);

        // Check FishCoin before breeding
        console.log('\n5️⃣ Checking FishCoin before breeding...');
        const beforeBreeding = await fishCoinDB.getFishBalance(testUserId, testGuildId);
        console.log(`   FishCoin before breeding: ${beforeBreeding.toLocaleString()}`);

        // Test breeding
        console.log('\n6️⃣ Testing breeding...');
        console.log(`   Calling FishBreedingService.breedFish with isAdmin=${isAdmin}...`);
        
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
        
        if (isAdmin) {
            console.log('   ℹ️  User is admin - no cost should be deducted');
            if (cost === 0n) {
                console.log('   ✅ Correct: No cost deducted for admin');
            } else {
                console.log('   ❌ Error: Cost was deducted for admin!');
            }
        } else {
            console.log('   ℹ️  User is regular - cost should be deducted');
            if (cost === 100000n) {
                console.log('   ✅ Correct: 100,000 FishCoin deducted for regular user');
            } else {
                console.log('   ❌ Error: Cost not deducted correctly!');
                console.log(`   Expected: 100,000, Actual: ${cost.toLocaleString()}`);
            }
        }

        // Check breeding history
        console.log('\n8️⃣ Checking breeding history...');
        const breedingHistory = await prisma.breedingHistory.findMany({
            where: { userId: testUserId, guildId: testGuildId },
            orderBy: { bredAt: 'desc' },
            take: 1
        });
        
        if (breedingHistory.length > 0) {
            const latestBreeding = breedingHistory[0];
            console.log(`   Latest breeding: ${latestBreeding.success ? 'Success' : 'Failed'}`);
            console.log(`   Notes: ${latestBreeding.notes}`);
        } else {
            console.log('   No breeding history found');
        }

        // Check FishCoin transactions
        console.log('\n9️⃣ Checking FishCoin transactions...');
        const fishTransactions = await prisma.fishTransaction.findMany({
            where: { userId: testUserId, guildId: testGuildId },
            orderBy: { createdAt: 'desc' },
            take: 5
        });
        
        console.log(`   Recent FishCoin transactions: ${fishTransactions.length}`);
        fishTransactions.forEach((tx, index) => {
            console.log(`   ${index + 1}. ${tx.type}: ${tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()} FishCoin`);
            console.log(`      Description: ${tx.description}`);
            console.log(`      Created: ${tx.createdAt}`);
        });

        console.log('\n🎉 Breeding cost test completed!');
        
        if (isAdmin) {
            console.log('💡 To test FishCoin deduction, make sure the user is NOT an admin.');
            console.log('💡 You can modify the admin check in FishBattleService.isAdministrator()');
        } else {
            console.log('💡 FishCoin deduction is working correctly for regular users!');
        }

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testBreedingCostReal().catch(console.error); 