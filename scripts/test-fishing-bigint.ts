import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testFishingBigInt() {
    console.log('🧪 Testing Fishing with BigInt...\n');

    const testGuildId = 'test-guild-fishing-bigint';
    const testUserId = 'user-fishing-test';

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

        // Test 2: Check if can fish
        console.log('\n🎣 Test 2: Checking if can fish');
        const canFishResult = await FishingService.canFish(testUserId, testGuildId, false);
        console.log(`✅ Can fish: ${canFishResult.canFish}, Message: ${canFishResult.message || 'None'}`);

        // Test 3: Buy fishing rod first
        console.log('\n🎣 Test 3: Buying fishing rod first');
        const rodResult = await FishingService.buyRod(testUserId, testGuildId, 'basic');
        console.log(`✅ Bought rod: ${rodResult.name} (${rodResult.price} AniCoin)`);

        // Test 4: Buy bait first
        console.log('\n🎣 Test 4: Buying bait first');
        const baitResult = await FishingService.buyBait(testUserId, testGuildId, 'basic', 5);
        console.log(`✅ Bought bait: ${baitResult.bait.name} x${baitResult.quantity} (${baitResult.totalCost} AniCoin)`);

        // Test 5: Fish with large balance
        console.log('\n🎣 Test 5: Fishing with large balance');
        const fishResult = await FishingService.fish(testUserId, testGuildId, false);
        console.log(`✅ Caught fish: ${fishResult.fish.name} (${fishResult.fish.rarity})`);
        console.log(`   Value: ${fishResult.value} AniCoin`);
        console.log(`   New balance: ${fishResult.newBalance.toLocaleString()} AniCoin`);

        // Test 6: Check balance after fishing
        console.log('\n💰 Test 6: Checking balance after fishing');
        const balance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Current balance: ${balance.toLocaleString()} AniCoin`);

        // Test 7: Fish multiple times
        console.log('\n🎣 Test 7: Fishing multiple times');
        for (let i = 0; i < 3; i++) {
            try {
                const result = await FishingService.fish(testUserId, testGuildId, false);
                console.log(`   ${i + 1}. Caught: ${result.fish.name} - ${result.value} AniCoin`);
            } catch (error) {
                console.log(`   ${i + 1}. Error: ${error}`);
                break;
            }
        }

        // Test 8: Final balance check
        console.log('\n💰 Test 8: Final balance check');
        const finalBalance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Final balance: ${finalBalance.toLocaleString()} AniCoin`);

        // Test 9: Get updated fishing data
        console.log('\n📊 Test 9: Get updated fishing data');
        const updatedFishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Updated stats: ${updatedFishingData.totalFish} fish, ${updatedFishingData.totalEarnings} earnings`);

        console.log('\n🎉 All Fishing BigInt tests passed!');

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

testFishingBigInt().catch(console.error); 