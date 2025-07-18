import { PrismaClient } from "@prisma/client";
import { FISH_LIST } from "../src/utils/fishing";

const prisma = new PrismaClient();

async function removeLegendaryFishPrices() {
    try {
        console.log("🗑️ Removing Legendary Fish Prices from Database...\n");

        // Lấy danh sách cá huyền thoại
        const legendaryFish = FISH_LIST.filter(fish => fish.rarity === 'legendary');
        console.log(`📋 Found ${legendaryFish.length} legendary fish:`);
        legendaryFish.forEach(fish => {
            console.log(`   - ${fish.name}`);
        });
        console.log();

        // Xóa giá cá huyền thoại khỏi database
        let deletedCount = 0;
        for (const fish of legendaryFish) {
            try {
                const deleted = await prisma.fishPrice.deleteMany({
                    where: { fishName: fish.name }
                });
                deletedCount += deleted.count;
                if (deleted.count > 0) {
                    console.log(`✅ Deleted price for: ${fish.name}`);
                }
            } catch (error) {
                // Fish price không tồn tại, bỏ qua
                console.log(`ℹ️  No price found for: ${fish.name}`);
            }
        }

        console.log(`\n🎉 Successfully removed ${deletedCount} legendary fish prices from database!`);
        console.log("💡 Legendary fish will now only be available in fishbarn with fixed prices.");

        // Kiểm tra lại database
        const remainingPrices = await prisma.fishPrice.findMany();
        console.log(`\n📊 Remaining fish prices in database: ${remainingPrices.length}`);
        
        // Nhóm theo rarity
        const commonCount = remainingPrices.filter(p => {
            const fish = FISH_LIST.find(f => f.name === p.fishName);
            return fish?.rarity === 'common';
        }).length;
        
        const rareCount = remainingPrices.filter(p => {
            const fish = FISH_LIST.find(f => f.name === p.fishName);
            return fish?.rarity === 'rare';
        }).length;
        
        const epicCount = remainingPrices.filter(p => {
            const fish = FISH_LIST.find(f => f.name === p.fishName);
            return fish?.rarity === 'epic';
        }).length;

        console.log(`   - Common fish: ${commonCount}`);
        console.log(`   - Rare fish: ${rareCount}`);
        console.log(`   - Epic fish: ${epicCount}`);
        console.log(`   - Legendary fish: 0 (removed)`);

    } catch (error) {
        console.error("❌ Failed to remove legendary fish prices:", error);
    } finally {
        await prisma.$disconnect();
    }
}

removeLegendaryFishPrices(); 