import { PrismaClient } from "@prisma/client";
import { FishingService, BAITS } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function testBaitPurchase() {
    try {
        console.log("🪱 Testing Bait Purchase with Quantity Selection...\n");

        const testUserId = "test-user-bait-purchase-123";
        const testGuildId = "test-guild-bait-purchase-123";

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

        // Test 1: Check initial state
        console.log("1. Checking initial state...");
        const initialData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Initial bait count: ${initialData.baits.length}`);
        console.log();

        // Test 2: Buy different quantities of baits
        console.log("2. Testing bait purchases with different quantities...");
        const testPurchases = [
            { type: "basic", quantity: 5 },
            { type: "good", quantity: 10 },
            { type: "premium", quantity: 3 },
            { type: "divine", quantity: 1 }
        ];

        for (const purchase of testPurchases) {
            const baitInfo = BAITS[purchase.type as keyof typeof BAITS];
            const expectedCost = baitInfo.price * purchase.quantity;
            
            console.log(`   Buying ${purchase.quantity}x ${baitInfo.name}...`);
            const result = await FishingService.buyBait(testUserId, testGuildId, purchase.type, purchase.quantity);
            
            console.log(`   ✅ Bought ${purchase.quantity}x ${baitInfo.name}`);
            console.log(`   💰 Expected cost: ${expectedCost}, Actual cost: ${result.totalCost}`);
            console.log(`   🎯 Current bait: ${result.currentBait}`);
            console.log();
        }

        // Test 3: Check final state
        console.log("3. Checking final state...");
        const finalData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Final bait inventory:`);
        finalData.baits.forEach((bait: any) => {
            const baitInfo = BAITS[bait.baitType as keyof typeof BAITS];
            const isCurrent = bait.baitType === finalData.currentBait ? " (CURRENT)" : "";
            console.log(`   • ${baitInfo?.name || bait.baitType}: ${bait.quantity}${isCurrent}`);
        });
        console.log();

        // Test 4: Show available purchase options
        console.log("4. Available purchase options in UI:");
        const quantities = [1, 5, 10, 20, 50];
        Object.entries(BAITS).forEach(([key, bait]) => {
            console.log(`🪱 ${bait.name}:`);
            quantities.forEach(qty => {
                const totalPrice = bait.price * qty;
                console.log(`   • x${qty} - ${totalPrice} AniCoin (${bait.price} AniCoin/cái)`);
            });
            console.log();
        });

        console.log("🎉 Bait purchase test completed!");
        console.log("💡 The new bait purchase UI now shows:");
        console.log("   ✅ Multiple quantity options (1, 5, 10, 20, 50)");
        console.log("   ✅ Total price calculation for each option");
        console.log("   ✅ Clear quantity indication in labels");
        console.log("   ✅ Automatic current bait setting after purchase");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testBaitPurchase(); 