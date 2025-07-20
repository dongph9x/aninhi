import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testSellFishBigInt() {
    console.log('🧪 Testing Sell Fish with BigInt...\n');

    const testGuildId = 'test-guild-sell-fish-bigint';
    const testUserId = 'user-sell-fish-test';

    try {
        // Clean up test data
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
                balance: 1000000n, // 1 million AniCoin
                dailyStreak: 0
            }
        });

        console.log('✅ Created test user with large balance');

        // Test 1: Get fishing data
        console.log('\n🎣 Test 1: Getting fishing data');
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Fishing data created: ${fishingData.totalFish} fish caught, ${fishingData.totalEarnings} earnings`);

        // Test 2: Buy fishing rod and bait
        console.log('\n🎣 Test 2: Buying fishing equipment');
        await FishingService.buyRod(testUserId, testGuildId, 'basic');
        await FishingService.buyBait(testUserId, testGuildId, 'basic', 5);
        console.log('✅ Bought fishing equipment');

        // Test 3: Fish to get fish
        console.log('\n🎣 Test 3: Fishing to get fish');
        const fishResult = await FishingService.fish(testUserId, testGuildId, false);
        console.log(`✅ Caught fish: ${fishResult.fish.name} (${fishResult.fish.rarity})`);
        console.log(`   Value: ${fishResult.value} AniCoin`);

        // Test 4: Check balance before selling
        console.log('\n💰 Test 4: Check balance before selling');
        const balanceBefore = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Balance before selling: ${balanceBefore.toLocaleString()} AniCoin`);

        // Test 5: Sell fish
        console.log('\n💰 Test 5: Selling fish');
        try {
            const sellResult = await FishingService.sellFish(testUserId, testGuildId, fishResult.fish.name, 1);
            console.log(`✅ Sold fish: ${sellResult.fishName} x${sellResult.quantity}`);
            console.log(`   Price: ${sellResult.currentPrice} AniCoin`);
            console.log(`   Total: ${sellResult.totalValue} AniCoin`);
        } catch (error) {
            console.log(`❌ Error selling fish: ${error}`);
            console.log(`   Error details:`, error);
        }

        // Test 6: Check balance after selling
        console.log('\n💰 Test 6: Check balance after selling');
        const balanceAfter = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Balance after selling: ${balanceAfter.toLocaleString()} AniCoin`);

        console.log('\n🎉 Sell Fish BigInt test completed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        // Clean up test data
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

testSellFishBigInt().catch(console.error); 