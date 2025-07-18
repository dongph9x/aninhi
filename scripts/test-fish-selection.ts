import { PrismaClient } from "@prisma/client";
import { FishBreedingService } from "../src/utils/fish-breeding";
import { FishInventoryService } from "../src/utils/fish-inventory";

const prisma = new PrismaClient();

async function testFishSelection() {
    try {
        console.log("🧪 Testing Fish Selection in FishBarn...\n");

        const testUserId = 'test_user_selection';
        const testGuildId = 'test_guild_selection';

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

        // 2. Tạo 2 cá huyền thoại test
        console.log("\n2. Creating test legendary fish...");
        
        const fish1 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Fish 1',
                level: 1,
                experience: 0,
                rarity: 'legendary',
                value: 1000,
                generation: 1,
                specialTraits: JSON.stringify(['Test1']),
                status: 'growing',
            },
        });

        const fish2 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Fish 2',
                level: 2,
                experience: 5,
                rarity: 'legendary',
                value: 2000,
                generation: 1,
                specialTraits: JSON.stringify(['Test2']),
                status: 'growing',
            },
        });

        console.log("✅ Created 2 test fish:");
        console.log("   - Fish 1:", fish1.species, "Level:", fish1.level, "Exp:", fish1.experience);
        console.log("   - Fish 2:", fish2.species, "Level:", fish2.level, "Exp:", fish2.experience);

        // 3. Thêm vào fish inventory
        console.log("\n3. Adding fish to inventory...");
        const addResult1 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        const addResult2 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        
        console.log("✅ Fish 1 added:", addResult1.success);
        console.log("✅ Fish 2 added:", addResult2.success);

        // 4. Kiểm tra inventory
        console.log("\n4. Checking inventory...");
        const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        console.log("✅ Inventory items:", inventory.items.length);
        inventory.items.forEach((item: any, index: number) => {
            console.log(`   ${index + 1}. ${item.fish.name} - Level ${item.fish.level} - Exp ${item.fish.experience}`);
        });

        // 5. Test cho cá ăn (không chọn cá cụ thể - sẽ cho cá đầu tiên)
        console.log("\n5. Testing feed without selection (should feed first fish)...");
        const feedResult1 = await FishBreedingService.feedFish(testUserId, fish1.id, true);
        console.log("✅ Feed result:", feedResult1.success);
        if (feedResult1.success) {
            console.log("   - Fish:", feedResult1.fish.name);
            console.log("   - Level:", feedResult1.fish.level);
            console.log("   - Exp gained:", feedResult1.experienceGained);
        }

        // 6. Test cho cá thứ 2 ăn (chọn cá cụ thể)
        console.log("\n6. Testing feed with specific fish selection...");
        const feedResult2 = await FishBreedingService.feedFish(testUserId, fish2.id, true);
        console.log("✅ Feed result:", feedResult2.success);
        if (feedResult2.success) {
            console.log("   - Fish:", feedResult2.fish.name);
            console.log("   - Level:", feedResult2.fish.level);
            console.log("   - Exp gained:", feedResult2.experienceGained);
        }

        // 7. Kiểm tra inventory sau khi cho ăn
        console.log("\n7. Checking inventory after feeding...");
        const updatedInventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        console.log("✅ Updated inventory:");
        updatedInventory.items.forEach((item: any, index: number) => {
            console.log(`   ${index + 1}. ${item.fish.name} - Level ${item.fish.level} - Exp ${item.fish.experience}/${item.fish.experienceToNext}`);
        });

        // 8. Test bán cá cụ thể
        console.log("\n8. Testing sell specific fish...");
        const sellResult = await FishInventoryService.sellFishFromInventory(testUserId, testGuildId, fish1.id);
        console.log("✅ Sell result:", sellResult.success);
        if (sellResult.success) {
            console.log("   - Sold fish:", sellResult.fish.name);
            console.log("   - Coins earned:", sellResult.coinsEarned);
        }

        // 9. Kiểm tra inventory sau khi bán
        console.log("\n9. Checking inventory after selling...");
        const finalInventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        console.log("✅ Final inventory items:", finalInventory.items.length);
        finalInventory.items.forEach((item: any, index: number) => {
            console.log(`   ${index + 1}. ${item.fish.name} - Level ${item.fish.level}`);
        });

        console.log("\n🎉 Fish selection test completed!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishSelection(); 