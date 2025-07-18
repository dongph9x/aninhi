import { PrismaClient } from "@prisma/client";
import { FishPriceService, FISH_LIST } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function testLegendaryFishExclusion() {
    try {
        console.log("🧪 Testing Legendary Fish Exclusion from Price System...\n");

        // Test 1: Kiểm tra getAllFishPrices không có cá huyền thoại
        console.log("1. Testing getAllFishPrices...");
        const allPrices = await FishPriceService.getAllFishPrices();
        const legendaryPrices = allPrices.filter(p => {
            const fish = FISH_LIST.find(f => f.name === p.fishName);
            return fish?.rarity === 'legendary';
        });
        
        console.log(`✅ Total fish prices: ${allPrices.length}`);
        console.log(`✅ Legendary fish prices: ${legendaryPrices.length} (should be 0)`);
        
        if (legendaryPrices.length === 0) {
            console.log("✅ Legendary fish successfully excluded from price system!");
        } else {
            console.log("❌ Legendary fish still found in price system!");
        }
        console.log();

        // Test 2: Kiểm tra getCurrentPrice cho cá huyền thoại
        console.log("2. Testing getCurrentPrice for legendary fish...");
        const legendaryFish = FISH_LIST.filter(f => f.rarity === 'legendary');
        
        for (const fish of legendaryFish) {
            const price = await FishPriceService.getCurrentPrice(fish.name);
            console.log(`   ${fish.name}: ${price} (should be 0)`);
            
            if (price === 0) {
                console.log(`   ✅ ${fish.name} correctly returns 0`);
            } else {
                console.log(`   ❌ ${fish.name} incorrectly returns ${price}`);
            }
        }
        console.log();

        // Test 3: Kiểm tra getFishPriceInfo cho cá huyền thoại
        console.log("3. Testing getFishPriceInfo for legendary fish...");
        for (const fish of legendaryFish) {
            const priceInfo = await FishPriceService.getFishPriceInfo(fish.name);
            console.log(`   ${fish.name}: ${priceInfo ? 'Found' : 'Not found'} (should be Not found)`);
            
            if (!priceInfo) {
                console.log(`   ✅ ${fish.name} correctly returns null`);
            } else {
                console.log(`   ❌ ${fish.name} incorrectly returns price info`);
            }
        }
        console.log();

        // Test 4: Kiểm tra getCurrentPrice cho cá thường
        console.log("4. Testing getCurrentPrice for regular fish...");
        const regularFish = FISH_LIST.filter(f => f.rarity !== 'legendary').slice(0, 3);
        
        for (const fish of regularFish) {
            const price = await FishPriceService.getCurrentPrice(fish.name);
            console.log(`   ${fish.name}: ${price} (should be > 0)`);
            
            if (price > 0) {
                console.log(`   ✅ ${fish.name} correctly returns price ${price}`);
            } else {
                console.log(`   ❌ ${fish.name} incorrectly returns ${price}`);
            }
        }
        console.log();

        // Test 5: Kiểm tra database trực tiếp
        console.log("5. Checking database directly...");
        const dbPrices = await prisma.fishPrice.findMany();
        const dbLegendaryPrices = dbPrices.filter(p => {
            const fish = FISH_LIST.find(f => f.name === p.fishName);
            return fish?.rarity === 'legendary';
        });
        
        console.log(`✅ Database fish prices: ${dbPrices.length}`);
        console.log(`✅ Database legendary fish prices: ${dbLegendaryPrices.length} (should be 0)`);
        
        if (dbLegendaryPrices.length === 0) {
            console.log("✅ Database correctly contains no legendary fish prices!");
        } else {
            console.log("❌ Database still contains legendary fish prices!");
        }

        console.log("\n🎉 Legendary fish exclusion test completed!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testLegendaryFishExclusion(); 