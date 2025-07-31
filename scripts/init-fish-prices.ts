import { PrismaClient } from "@prisma/client";
import { FishPriceService } from "../src/utils/fishing";
import { FISH_LIST } from "../src/config/fish-data";

const prisma = new PrismaClient();

async function initializeFishPrices() {
    try {
        console.log("🐟 Initializing Fish Prices in Database...\n");

        // Check if fish prices already exist
        const existingPrices = await prisma.fishPrice.count();
        if (existingPrices > 0) {
            console.log(`⚠️  Found ${existingPrices} existing fish prices. Skipping initialization.`);
            console.log("💡 Use 'npx tsx scripts/test-fish-price.ts' to test the system instead.");
            return;
        }

        // Initialize fish prices
        console.log("1. Creating initial fish prices...");
        await FishPriceService.initializeFishPrices();
        console.log("✅ Fish prices created successfully\n");

        // Verify the prices were created
        console.log("2. Verifying created prices...");
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

        console.log("\n🎉 Fish price system initialized successfully!");
        console.log("💡 Prices will automatically update every 10 minutes with ±10% fluctuation.");
        console.log("💡 Use 'n.fishing price' to view current prices in Discord.");

    } catch (error) {
        console.error("❌ Failed to initialize fish prices:", error);
    } finally {
        await prisma.$disconnect();
    }
}

initializeFishPrices(); 