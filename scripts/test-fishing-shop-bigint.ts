import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';
import { FishFoodService } from '../src/utils/fish-food';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testFishingShopBigInt() {
    console.log('🧪 Testing Fishing Shop with BigInt...\n');

    const testGuildId = 'test-guild-fishing-shop-bigint';
    const testUserId = 'user-fishing-shop-test';

    try {
        // Clean up test data
        await prisma.fishFood.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.caughtFish.deleteMany({
            where: { fishingData: { guildId: testGuildId } }
        });
        await prisma.fishingRod.deleteMany({
            where: { fishingData: { guildId: testGuildId } }
        });
        await prisma.fishingBait.deleteMany({
            where: { fishingData: { guildId: testGuildId } }
        });
        await prisma.fishingData.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.transaction.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });

        // Create test user with large balance
        await prisma.user.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 2000000n, // 2 million AniCoin
                dailyStreak: 0
            }
        });

        console.log('✅ Created test user with large balance');

        // Test 1: Get fishing data
        console.log('\n🎣 Test 1: Getting fishing data');
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Fishing data created: ${fishingData.totalFish} fish caught, ${fishingData.totalEarnings} earnings`);

        // Test 2: Buy fishing rod
        console.log('\n🎣 Test 2: Buying fishing rod');
        const rodResult = await FishingService.buyRod(testUserId, testGuildId, 'basic');
        console.log(`✅ Bought rod: ${rodResult.name} (${rodResult.price} AniCoin)`);

        // Test 3: Buy bait
        console.log('\n🎣 Test 3: Buying bait');
        const baitResult = await FishingService.buyBait(testUserId, testGuildId, 'basic', 10);
        console.log(`✅ Bought bait: ${baitResult.bait.name} x${baitResult.quantity} (${baitResult.totalCost} AniCoin)`);

        // Test 4: Buy fish food
        console.log('\n🍞 Test 4: Buying fish food');
        const foodResult = await FishFoodService.buyFishFood(testUserId, testGuildId, 'basic', 5);
        console.log(`✅ Food result: ${foodResult.success ? 'Success' : 'Failed'}`);
        if (foodResult.success) {
            console.log(`   Bought: ${foodResult.foodInfo.name} x${foodResult.quantity} (${foodResult.totalCost} AniCoin)`);
        } else {
            console.log(`   Error: ${foodResult.error}`);
        }

        // Test 5: Fish to get some fish to sell
        console.log('\n🎣 Test 5: Fishing to get fish');
        const fishResult = await FishingService.fish(testUserId, testGuildId, false);
        console.log(`✅ Caught fish: ${fishResult.fish.name} (${fishResult.fish.rarity})`);
        console.log(`   Value: ${fishResult.value} AniCoin`);

        // Test 6: Sell fish
        console.log('\n💰 Test 6: Selling fish');
        try {
            const sellResult = await FishingService.sellFish(testUserId, testGuildId, fishResult.fish.name, 1);
            console.log(`✅ Sold fish: ${sellResult.fishName} x${sellResult.quantity}`);
            console.log(`   Price: ${sellResult.currentPrice} AniCoin`);
            console.log(`   Total: ${sellResult.totalValue} AniCoin`);
        } catch (error) {
            console.log(`❌ Error selling fish: ${error}`);
        }

        // Test 7: Buy premium items
        console.log('\n🛒 Test 7: Buying premium items');
        
        // Buy premium rod
        try {
            const premiumRodResult = await FishingService.buyRod(testUserId, testGuildId, 'copper');
            console.log(`✅ Bought premium rod: ${premiumRodResult.name} (${premiumRodResult.price} AniCoin)`);
        } catch (error) {
            console.log(`❌ Error buying premium rod: ${error}`);
        }

        // Buy premium bait
        try {
            const premiumBaitResult = await FishingService.buyBait(testUserId, testGuildId, 'premium', 3);
            console.log(`✅ Bought premium bait: ${premiumBaitResult.bait.name} x${premiumBaitResult.quantity} (${premiumBaitResult.totalCost} AniCoin)`);
        } catch (error) {
            console.log(`❌ Error buying premium bait: ${error}`);
        }

        // Buy luxury fish food
        try {
            const luxuryFoodResult = await FishFoodService.buyFishFood(testUserId, testGuildId, 'luxury', 2);
            console.log(`✅ Food result: ${luxuryFoodResult.success ? 'Success' : 'Failed'}`);
            if (luxuryFoodResult.success) {
                console.log(`   Bought: ${luxuryFoodResult.foodInfo.name} x${luxuryFoodResult.quantity} (${luxuryFoodResult.totalCost} AniCoin)`);
            } else {
                console.log(`   Error: ${luxuryFoodResult.error}`);
            }
        } catch (error) {
            console.log(`❌ Error buying luxury food: ${error}`);
        }

        // Test 8: Check final balance
        console.log('\n💰 Test 8: Check final balance');
        const finalBalance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Final balance: ${finalBalance.toLocaleString()} AniCoin`);

        // Test 9: Check inventory
        console.log('\n📦 Test 9: Check inventory');
        const userFishFood = await FishFoodService.getUserFishFood(testUserId, testGuildId);
        console.log(`✅ Fish food items: ${userFishFood.length}`);
        userFishFood.forEach(item => {
            console.log(`   ${item.foodInfo.name}: ${item.quantity}`);
        });

        const updatedFishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Fishing rods: ${updatedFishingData.rods.length}`);
        console.log(`✅ Fishing baits: ${updatedFishingData.baits.length}`);

        console.log('\n🎉 All Fishing Shop BigInt tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        // Clean up test data
        await prisma.fishFood.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.caughtFish.deleteMany({
            where: { fishingData: { guildId: testGuildId } }
        });
        await prisma.fishingRod.deleteMany({
            where: { fishingData: { guildId: testGuildId } }
        });
        await prisma.fishingBait.deleteMany({
            where: { fishingData: { guildId: testGuildId } }
        });
        await prisma.fishingData.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.transaction.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.$disconnect();
    }
}

testFishingShopBigInt().catch(console.error); 