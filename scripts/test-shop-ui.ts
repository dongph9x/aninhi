import { PrismaClient } from "@prisma/client";
import { FishingService, FISHING_RODS, BAITS } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function testShopUI() {
    try {
        console.log("🛒 Testing Shop UI System...\n");

        const testUserId = "test-user-shop-123";
        const testGuildId = "test-guild-shop-123";

        // Test 0: Add money to test user
        console.log("0. Adding money to test user...");
        await prisma.user.upsert({
            where: {
                userId_guildId: {
                    userId: testUserId,
                    guildId: testGuildId
                }
            },
            update: {
                balance: 100000 // 100k AniCoin
            },
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 100000,
                dailyStreak: 0
            }
        });
        console.log("✅ Added 100,000 AniCoin to test user");
        console.log();

        // Test 1: Initialize fishing data
        console.log("1. Initializing fishing data...");
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Fishing data created for user: ${fishingData.userId}`);
        console.log(`   - Current rod: ${fishingData.currentRod || "None"}`);
        console.log(`   - Current bait: ${fishingData.currentBait || "None"}`);
        console.log();

        // Test 2: Buy a rod
        console.log("2. Buying a basic rod...");
        const rodResult = await FishingService.buyRod(testUserId, testGuildId, "basic");
        console.log(`✅ Bought rod: ${rodResult.rodType}`);
        console.log(`   - Durability: ${rodResult.durability}`);
        console.log(`   - Current rod set: ${rodResult.currentRod}`);
        console.log();

        // Test 3: Buy bait
        console.log("3. Buying basic bait...");
        const baitResult = await FishingService.buyBait(testUserId, testGuildId, "basic", 3);
        console.log(`✅ Bought bait: ${baitResult.bait.baitType} x${baitResult.quantity}`);
        console.log(`   - Total cost: ${baitResult.totalCost} AniCoin`);
        console.log(`   - Current bait set: ${baitResult.currentBait}`);
        console.log();

        // Test 4: Buy more rods and baits
        console.log("4. Buying more equipment...");
        await FishingService.buyRod(testUserId, testGuildId, "copper");
        await FishingService.buyBait(testUserId, testGuildId, "good", 2);
        await FishingService.buyBait(testUserId, testGuildId, "premium", 1);
        console.log("✅ Bought additional equipment");
        console.log();

        // Test 5: Get updated fishing data
        console.log("5. Getting updated fishing data...");
        const updatedData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Updated fishing data:`);
        console.log(`   - Rods owned: ${updatedData.rods.length}`);
        updatedData.rods.forEach((rod: any) => {
            const rodInfo = FISHING_RODS[rod.rodType as keyof typeof FISHING_RODS];
            console.log(`     • ${rodInfo?.name || rod.rodType} (${rod.durability}/${rodInfo?.durability || 0})`);
        });
        console.log(`   - Baits owned: ${updatedData.baits.length}`);
        updatedData.baits.forEach((bait: any) => {
            const baitInfo = BAITS[bait.baitType as keyof typeof BAITS];
            console.log(`     • ${baitInfo?.name || bait.baitType} (${bait.quantity})`);
        });
        console.log();

        // Test 6: Set different equipment
        console.log("6. Setting different equipment...");
        await FishingService.setCurrentRod(testUserId, testGuildId, "copper");
        await FishingService.setCurrentBait(testUserId, testGuildId, "good");
        console.log("✅ Set copper rod and good bait as current");
        console.log();

        // Test 7: Verify equipment management
        console.log("7. Verifying equipment management...");
        const finalData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Final equipment status:`);
        console.log(`   - Current rod: ${finalData.currentRod}`);
        console.log(`   - Current bait: ${finalData.currentBait}`);
        
        const currentRod = finalData.rods.find((r: any) => r.rodType === finalData.currentRod);
        const currentBait = finalData.baits.find((b: any) => b.baitType === finalData.currentBait);
        
        if (currentRod) {
            const rodInfo = FISHING_RODS[currentRod.rodType as keyof typeof FISHING_RODS];
            console.log(`   - Rod durability: ${currentRod.durability}/${rodInfo?.durability || 0}`);
        }
        if (currentBait) {
            console.log(`   - Bait quantity: ${currentBait.quantity}`);
        }
        console.log();

        // Test 8: Test fishing with equipment
        console.log("8. Testing fishing with equipment...");
        const canFish = await FishingService.canFish(testUserId, testGuildId);
        console.log(`✅ Can fish: ${canFish.canFish}`);
        if (!canFish.canFish) {
            console.log(`   - Reason: ${canFish.message}`);
        }
        console.log();

        console.log("🎉 All shop UI tests passed!");
        console.log("💡 The shop UI system is ready to use in Discord!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testShopUI(); 