import { PrismaClient } from "@prisma/client";
import { FishingService, FISHING_RODS, BAITS } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function testEquipmentManagement() {
    try {
        console.log("⚙️ Testing Equipment Management...\n");

        const testUserId = "test-user-equipment-123";
        const testGuildId = "test-guild-equipment-123";

        // Setup test user with money
        console.log("0. Setting up test user...");
        await prisma.user.upsert({
            where: {
                userId_guildId: {
                    userId: testUserId,
                    guildId: testGuildId
                }
            },
            update: {
                balance: 100000
            },
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 100000,
                dailyStreak: 0
            }
        });
        console.log("✅ Test user setup complete");
        console.log();

        // Test 1: Buy multiple rods and baits
        console.log("1. Buying equipment...");
        const rodsToBuy = ["basic", "copper", "silver"];
        const baitsToBuy = ["basic", "good", "premium"];
        
        for (const rodType of rodsToBuy) {
            await FishingService.buyRod(testUserId, testGuildId, rodType);
            console.log(`✅ Bought ${rodType} rod`);
        }
        
        for (const baitType of baitsToBuy) {
            await FishingService.buyBait(testUserId, testGuildId, baitType, 3);
            console.log(`✅ Bought 3x ${baitType} bait`);
        }
        console.log();

        // Test 2: Check initial state
        console.log("2. Checking initial state...");
        const initialData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Initial equipment:`);
        console.log(`   - Current rod: ${initialData.currentRod}`);
        console.log(`   - Current bait: ${initialData.currentBait}`);
        console.log(`   - Rods owned: ${initialData.rods.length}`);
        console.log(`   - Baits owned: ${initialData.baits.length}`);
        console.log();

        // Test 3: Test rod selection
        console.log("3. Testing rod selection...");
        await FishingService.setCurrentRod(testUserId, testGuildId, "silver");
        const afterRodChange = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ After rod change: ${afterRodChange.currentRod}`);
        console.log();

        // Test 4: Test bait selection
        console.log("4. Testing bait selection...");
        await FishingService.setCurrentBait(testUserId, testGuildId, "premium");
        const afterBaitChange = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ After bait change: ${afterBaitChange.currentBait}`);
        console.log();

        // Test 5: Verify final state
        console.log("5. Verifying final state...");
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

        // Test 6: List all available equipment
        console.log("6. Listing all available equipment...");
        console.log("🎣 Available rods:");
        finalData.rods.forEach((rod: any) => {
            const rodInfo = FISHING_RODS[rod.rodType as keyof typeof FISHING_RODS];
            const isCurrent = rod.rodType === finalData.currentRod ? " (CURRENT)" : "";
            console.log(`   • ${rodInfo?.name || rod.rodType} (${rod.durability}/${rodInfo?.durability || 0})${isCurrent}`);
        });
        
        console.log("🪱 Available baits:");
        finalData.baits.forEach((bait: any) => {
            const baitInfo = BAITS[bait.baitType as keyof typeof BAITS];
            const isCurrent = bait.baitType === finalData.currentBait ? " (CURRENT)" : "";
            console.log(`   • ${baitInfo?.name || bait.baitType} (${bait.quantity})${isCurrent}`);
        });
        console.log();

        console.log("🎉 Equipment management test completed!");
        console.log("💡 The equipment management UI should now show:");
        console.log("   ✅ '🎣 Đổi Cần Câu' button");
        console.log("   ✅ '🪱 Đổi Mồi' button");
        console.log("   ✅ Dropdown menus for selection");
        console.log("   ✅ Automatic current equipment setting");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testEquipmentManagement(); 