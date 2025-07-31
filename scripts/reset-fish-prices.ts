import { PrismaClient } from "@prisma/client";
import { FishPriceService } from "../src/utils/fishing";
import { FISH_LIST } from "../src/config/fish-data";

const prisma = new PrismaClient();

async function resetFishPrices() {
    try {
        console.log("🔄 Resetting Fish Prices...\n");

        // Delete all existing fish prices
        console.log("1. Deleting existing fish prices...");
        const deletedCount = await prisma.fishPrice.deleteMany();
        console.log(`✅ Deleted ${deletedCount.count} existing fish prices\n`);

        // Initialize fish prices
        console.log("2. Creating new fish prices...");
        await FishPriceService.initializeFishPrices();
        console.log("✅ Fish prices created successfully\n");

        // Verify the prices were created
        console.log("3. Verifying created prices...");
        const allPrices = await FishPriceService.getAllFishPrices();
        console.log(`✅ Successfully created ${allPrices.length} fish prices:\n`);

        // Group by rarity for better display
        const commonFish: any[] = [];
        const rareFish: any[] = [];
        const epicFish: any[] = [];
        const legendaryFish: any[] = [];

        for (const price of allPrices) {
            const fish = FISH_LIST.find(f => f.name === price.fishName);
            if (fish?.rarity === "common") {
                commonFish.push(price);
            } else if (fish?.rarity === "rare") {
                rareFish.push(price);
            } else if (fish?.rarity === "epic") {
                epicFish.push(price);
            } else if (fish?.rarity === "legendary") {
                legendaryFish.push(price);
            }
        }

        console.log("🐟 Common Fish:");
        commonFish.forEach((price: any) => {
            console.log(`   - ${price.fishName}: ${price.currentPrice} AniCoin`);
        });

        console.log("\n🐠 Rare Fish:");
        rareFish.forEach((price: any) => {
            console.log(`   - ${price.fishName}: ${price.currentPrice} AniCoin`);
        });

        console.log("\n🦈 Epic Fish:");
        epicFish.forEach((price: any) => {
            console.log(`   - ${price.fishName}: ${price.currentPrice} AniCoin`);
        });

        console.log("\n✨ Legendary Fish:");
        legendaryFish.forEach((price: any) => {
            console.log(`   - ${price.fishName}: ${price.currentPrice} AniCoin`);
        });

        console.log("\n🎉 Fish price system reset successfully!");
        console.log("💡 Prices will automatically update every 10 minutes with ±10% fluctuation.");
        console.log("💡 Use 'n.fishing price' to view current prices in Discord.");

    } catch (error) {
        console.error("❌ Failed to reset fish prices:", error);
    } finally {
        await prisma.$disconnect();
    }
}

resetFishPrices(); 