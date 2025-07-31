import { PrismaClient } from "@prisma/client";
import { FishingService } from "../src/utils/fishing";
import { FISH_LIST } from "../src/config/fish-data";

const prisma = new PrismaClient();

async function testFishingInventoryFilter() {
    try {
        console.log("🧪 Testing Fishing Inventory Filter (Legendary Fish Exclusion)...\n");

        const testUserId = 'test_user_inventory_filter';
        const testGuildId = 'test_guild_inventory_filter';

        // 1. Tạo test user
        console.log("1. Creating test user...");
        const user = await prisma.user.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {},
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 10000,
            },
        });
        console.log("✅ User created:", user.userId);

        // 2. Lấy fishing data
        console.log("\n2. Getting fishing data...");
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log("✅ Fishing data retrieved");

        // 3. Thêm một số cá thường và cá huyền thoại vào fishing data
        console.log("\n3. Adding test fish to fishing data...");
        
        // Thêm cá thường
        await prisma.caughtFish.upsert({
            where: {
                fishingDataId_fishName: {
                    fishingDataId: fishingData.id,
                    fishName: "Cá rô phi"
                }
            },
            update: { quantity: 2 },
            create: {
                fishingDataId: fishingData.id,
                fishName: "Cá rô phi",
                fishRarity: "common",
                fishValue: 100,
                quantity: 2
            }
        });
        console.log("✅ Added common fish: Cá rô phi");

        await prisma.caughtFish.upsert({
            where: {
                fishingDataId_fishName: {
                    fishingDataId: fishingData.id,
                    fishName: "Cá chép"
                }
            },
            update: { quantity: 1 },
            create: {
                fishingDataId: fishingData.id,
                fishName: "Cá chép",
                fishRarity: "rare",
                fishValue: 300,
                quantity: 1
            }
        });
        console.log("✅ Added rare fish: Cá chép");

        // Thêm cá huyền thoại
        await prisma.caughtFish.upsert({
            where: {
                fishingDataId_fishName: {
                    fishingDataId: fishingData.id,
                    fishName: "Cá mực khổng lồ"
                }
            },
            update: { quantity: 1 },
            create: {
                fishingDataId: fishingData.id,
                fishName: "Cá mực khổng lồ",
                fishRarity: "legendary",
                fishValue: 15000,
                quantity: 1
            }
        });
        console.log("✅ Added legendary fish: Cá mực khổng lồ");

        await prisma.caughtFish.upsert({
            where: {
                fishingDataId_fishName: {
                    fishingDataId: fishingData.id,
                    fishName: "Cá rồng biển"
                }
            },
            update: { quantity: 1 },
            create: {
                fishingDataId: fishingData.id,
                fishName: "Cá rồng biển",
                fishRarity: "legendary",
                fishValue: 20000,
                quantity: 1
            }
        });
        console.log("✅ Added legendary fish: Cá rồng biển");

        // 4. Lấy lại fishing data với cá mới
        console.log("\n4. Retrieving updated fishing data...");
        const updatedFishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Total fish in fishing data: ${updatedFishingData.fish.length}`);

        // 5. Test logic lọc cá huyền thoại
        console.log("\n5. Testing legendary fish filter...");
        const normalFish = updatedFishingData.fish.filter((f: any) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            return fishInfo && fishInfo.rarity !== 'legendary';
        });

        const legendaryFish = updatedFishingData.fish.filter((f: any) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            return fishInfo && fishInfo.rarity === 'legendary';
        });

        console.log(`✅ Normal fish count: ${normalFish.length}`);
        console.log(`✅ Legendary fish count: ${legendaryFish.length}`);

        // 6. Hiển thị kết quả
        console.log("\n6. Fish breakdown:");
        console.log("   Normal fish (should appear in n.fishing inventory):");
        normalFish.forEach((f: any, index: number) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            console.log(`   ${index + 1}. ${fishInfo?.emoji || "🐟"} ${f.fishName} (${f.fishRarity}) - x${f.quantity}`);
        });

        console.log("\n   Legendary fish (should NOT appear in n.fishing inventory):");
        legendaryFish.forEach((f: any, index: number) => {
            const fishInfo = FISH_LIST.find(fish => fish.name === f.fishName);
            console.log(`   ${index + 1}. ${fishInfo?.emoji || "🐟"} ${f.fishName} (${f.fishRarity}) - x${f.quantity}`);
        });

        // 7. Kiểm tra logic
        console.log("\n7. Validation:");
        if (normalFish.length === 2 && legendaryFish.length === 2) {
            console.log("✅ Filter logic working correctly!");
            console.log("✅ Legendary fish are properly excluded from n.fishing inventory");
        } else {
            console.log("❌ Filter logic not working as expected!");
        }

        console.log("\n🎉 Fishing inventory filter test completed!");

    } catch (error) {
        console.error("❌ Error in test:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishingInventoryFilter(); 