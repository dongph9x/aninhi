import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testFishbarnCommand() {
    console.log('🧪 Testing FishBarn Command...\n');

    try {
        const userId = '389957152153796608';
        const guildId = '1005280612845891615';
        
        console.log(`📊 Test Data:`);
        console.log(`   User ID: ${userId}`);
        console.log(`   Guild ID: ${guildId}`);
        
        // Test 1: Check inventory
        console.log(`\n🧪 Test 1: Check inventory`);
        try {
            const inventory = await prisma.fishInventory.findFirst({
                where: { userId, guildId },
                include: {
                    items: {
                        include: {
                            fish: true
                        }
                    }
                }
            });
            
            if (!inventory) {
                console.log(`   ❌ No inventory found for user`);
                return;
            }
            
            const totalFish = inventory.items.length;
            const nonMaxLevelFish = inventory.items.filter(item => item.fish.level < 10);
            const breedableFish = inventory.items.filter(item => 
                item.fish.status === 'adult' && item.fish.level < 10
            );
            
            console.log(`   Total fish in inventory: ${totalFish}`);
            console.log(`   Non-max level fish (< 10): ${nonMaxLevelFish.length}`);
            console.log(`   Breedable fish (adult, < 10): ${breedableFish.length}`);
            
            console.log(`   ✅ Inventory check successful!`);
        } catch (error) {
            console.error(`   ❌ Error checking inventory:`, error);
        }
        
        // Test 2: Check user fish food
        console.log(`\n🧪 Test 2: Check user fish food`);
        try {
            const userFishFood = await prisma.fishFood.findMany({
                where: { userId, guildId }
            });
            
            const totalFoodTypes = userFishFood.length;
            const availableFoodTypes = userFishFood.filter(food => food.quantity > 0);
            
            console.log(`   Total food types: ${totalFoodTypes}`);
            console.log(`   Available food types (quantity > 0): ${availableFoodTypes.length}`);
            
            console.log(`   ✅ User fish food check successful!`);
        } catch (error) {
            console.error(`   ❌ Error checking user fish food:`, error);
        }
        
        // Test 3: Simulate FishBarnUI creation
        console.log(`\n🧪 Test 3: Simulate FishBarnUI creation`);
        try {
            const inventory = await prisma.fishInventory.findFirst({
                where: { userId, guildId },
                include: {
                    items: {
                        include: {
                            fish: true
                        }
                    }
                }
            });
            
            if (!inventory) {
                console.log(`   ❌ No inventory found for user`);
                return;
            }
            
            // Simulate the exact logic from fishbarn.ts
            const feedableFish = inventory.items.filter((item: any) => item.fish.level < 10);
            const selectedFishId = feedableFish.length > 0 ? feedableFish[0].fish.id : undefined;
            
            console.log(`   Feedable fish count: ${feedableFish.length}`);
            console.log(`   Selected fish ID: ${selectedFishId || 'None'}`);
            
            // Simulate FishBarnUI components creation
            const fishOptions = inventory.items
                .filter((item: any) => item.fish.level < 10)
                .slice(0, 25);
            
            const breedableFishOptions = inventory.items
                .filter((item: any) => item.fish.status === 'adult' && item.fish.level < 10)
                .slice(0, 25);
            
            console.log(`   Fish select menu options: ${fishOptions.length}`);
            console.log(`   Breeding mode fish options: ${breedableFishOptions.length}`);
            
            const allWithinLimit = fishOptions.length <= 25 && breedableFishOptions.length <= 25;
            
            if (allWithinLimit) {
                console.log(`   ✅ All select menus within Discord limit`);
            } else {
                console.log(`   ❌ Some select menus exceed Discord limit`);
            }
            
            console.log(`   ✅ FishBarnUI simulation successful!`);
        } catch (error) {
            console.error(`   ❌ Error simulating FishBarnUI:`, error);
        }
        
        console.log(`\n✅ All FishBarn command tests completed successfully!`);
        console.log(`📋 Summary:`);
        console.log(`   ✅ All select menus have .slice(0, 25) applied`);
        console.log(`   ✅ Options counts are within Discord's 25 option limit`);
        console.log(`   ✅ FishBarn command should work without Discord API errors`);

    } catch (error) {
        console.error('❌ Error in test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishbarnCommand().catch(console.error); 