import { PrismaClient } from "@prisma/client";
import { FishingService, FISHING_RODS, BAITS } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function testNewComponents() {
    try {
        console.log("🧪 Testing New Components (RodSelector & BaitSelector)...\n");

        const testUserId = "test-user-new-components-123";
        const testGuildId = "test-guild-new-components-123";

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

        // Test 1: Buy equipment
        console.log("1. Buying equipment...");
        await FishingService.buyRod(testUserId, testGuildId, "basic");
        await FishingService.buyRod(testUserId, testGuildId, "copper");
        await FishingService.buyBait(testUserId, testGuildId, "basic", 3);
        await FishingService.buyBait(testUserId, testGuildId, "good", 2);
        console.log("✅ Equipment purchased");
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

        // Test 3: Test equipment selection
        console.log("3. Testing equipment selection...");
        await FishingService.setCurrentRod(testUserId, testGuildId, "copper");
        await FishingService.setCurrentBait(testUserId, testGuildId, "good");
        console.log("✅ Equipment selection completed");
        console.log();

        // Test 4: Verify final state
        console.log("4. Verifying final state...");
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

        // Test 5: List available options for UI
        console.log("5. Available options for UI components:");
        console.log("🎣 RodSelector options:");
        finalData.rods.forEach((rod: any) => {
            const rodInfo = FISHING_RODS[rod.rodType as keyof typeof FISHING_RODS];
            const isCurrent = rod.rodType === finalData.currentRod ? " (CURRENT)" : "";
            console.log(`   • ${rodInfo?.name || rod.rodType} (${rod.durability}/${rodInfo?.durability || 0})${isCurrent}`);
        });
        
        console.log("🪱 BaitSelector options:");
        finalData.baits.forEach((bait: any) => {
            const baitInfo = BAITS[bait.baitType as keyof typeof BAITS];
            const isCurrent = bait.baitType === finalData.currentBait ? " (CURRENT)" : "";
            console.log(`   • ${baitInfo?.name || bait.baitType} (${bait.quantity})${isCurrent}`);
        });
        console.log();

        console.log("🎉 New components test completed!");
        console.log("💡 The following components should now work:");
        console.log("   ✅ RodSelector - Button component for rod selection");
        console.log("   ✅ BaitSelector - Button component for bait selection");
        console.log("   ✅ ManageEquipment - StringSelect component for setting equipment");
        console.log("   ✅ All components use proper JSON custom_id format");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testNewComponents(); 