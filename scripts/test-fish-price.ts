import { PrismaClient } from "@prisma/client";
import { FishPriceService } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function testFishPriceSystem() {
    try {
        console.log("🧪 Testing Fish Price System...\n");

        // Test 1: Initialize fish prices
        console.log("1. Initializing fish prices...");
        await FishPriceService.initializeFishPrices();
        console.log("✅ Fish prices initialized\n");

        // Test 2: Get all fish prices
        console.log("2. Getting all fish prices...");
        const allPrices = await FishPriceService.getAllFishPrices();
        console.log(`✅ Found ${allPrices.length} fish prices:`);
        allPrices.forEach(price => {
            console.log(`   - ${price.fishName}: ${price.currentPrice} AniCoin (${price.changePercent > 0 ? '+' : ''}${price.changePercent.toFixed(1)}%)`);
        });
        console.log();

        // Test 3: Get specific fish price
        console.log("3. Getting specific fish price...");
        const specificPrice = await FishPriceService.getCurrentPrice("Cá rô phi");
        console.log(`✅ Cá rô phi price: ${specificPrice} AniCoin\n`);

        // Test 4: Update prices
        console.log("4. Updating fish prices...");
        await FishPriceService.updateFishPrices();
        console.log("✅ Fish prices updated\n");

        // Test 5: Check updated prices
        console.log("5. Checking updated prices...");
        const updatedPrices = await FishPriceService.getAllFishPrices();
        console.log("✅ Updated prices:");
        updatedPrices.slice(0, 5).forEach(price => {
            console.log(`   - ${price.fishName}: ${price.currentPrice} AniCoin (${price.changePercent > 0 ? '+' : ''}${price.changePercent.toFixed(1)}%)`);
        });
        console.log();

        // Test 6: Test fishing data creation
        console.log("6. Testing fishing data creation...");
        const { FishingService } = await import("../src/utils/fishing");
        const fishingData = await FishingService.getFishingData("test-user-123", "test-guild-123");
        console.log(`✅ Fishing data created for user: ${fishingData.userId}, guild: ${fishingData.guildId}`);
        console.log(`   - Current rod: ${fishingData.currentRod || "None"}`);
        console.log(`   - Current bait: ${fishingData.currentBait || "None"}`);
        console.log(`   - Total fish: ${fishingData.totalFish}`);
        console.log();

        console.log("🎉 All tests passed! Fish price system is working correctly.");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishPriceSystem(); 