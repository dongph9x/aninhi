import { PrismaClient } from "@prisma/client";
import { FishBreedingService } from "../src/utils/fish-breeding";
import { FishInventoryService } from "../src/utils/fish-inventory";

const prisma = new PrismaClient();

async function testLevelPriceIncrease() {
    try {
        console.log("🧪 Testing Level Price Increase (2% per level)...\n");

        const testUserId = 'test_user_level_price';
        const testGuildId = 'test_guild_level_price';

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

        // 2. Tạo cá huyền thoại test với giá gốc 1000 và level 5
        console.log("\n2. Creating test legendary fish...");
        
        const testFish = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Legendary Fish',
                level: 5, // Bắt đầu từ level 5
                experience: 0,
                rarity: 'legendary',
                value: 1000, // Giá gốc 1000
                generation: 1,
                specialTraits: JSON.stringify(['Test']),
                status: 'growing',
            },
        });

        console.log("✅ Created test fish:");
        console.log("   - Name:", testFish.species);
        console.log("   - Level:", testFish.level);
        console.log("   - Base Value:", testFish.value);
        console.log("   - Current Value with Level Bonus:", Math.floor(1000 * (1 + (5-1) * 0.02)));

        // 3. Thêm vào fish inventory
        console.log("\n3. Adding fish to inventory...");
        const addResult = await FishInventoryService.addFishToInventory(testUserId, testGuildId, testFish.id);
        console.log("✅ Fish added:", addResult.success);

        // 4. Test tính giá theo level
        console.log("\n4. Testing price calculation by level...");
        
        for (let level = 1; level <= 10; level++) {
            const levelBonus = level > 1 ? (level - 1) * 0.02 : 0;
            const finalValue = Math.floor(1000 * (1 + levelBonus));
            const percentage = levelBonus * 100;
            
            console.log(`   Level ${level}: ${finalValue.toLocaleString()} coins${percentage > 0 ? ` (+${Math.round(percentage)}%)` : ''}`);
        }

        // 5. Test feed fish để tăng level
        console.log("\n5. Testing feed fish to increase level...");
        
        let currentFish = testFish;
        for (let i = 0; i < 10; i++) { // Tăng số lần feed
            console.log(`\n   Feeding fish (attempt ${i + 1})...`);
            
            const feedResult = await FishBreedingService.feedFish(testUserId, currentFish.id, true); // Admin bypass cooldown
            
            if (feedResult.success) {
                console.log(`   ✅ Feed successful!`);
                console.log(`   - Level: ${currentFish.level} → ${feedResult.fish.level}`);
                console.log(`   - Value: ${currentFish.value} → ${feedResult.fish.value}`);
                console.log(`   - Exp gained: +${feedResult.experienceGained}`);
                
                if (feedResult.leveledUp) {
                    console.log(`   🎉 Leveled up!`);
                }
                
                currentFish = feedResult.fish;
                
                // Dừng nếu đã đạt max level
                if (currentFish.level >= 10) {
                    console.log(`   🏆 Reached max level!`);
                    break;
                }
            } else {
                console.log(`   ❌ Feed failed:`, feedResult.error);
                break;
            }
        }

        // 6. Test bán cá với giá theo level
        console.log("\n6. Testing sell fish with level-based price...");
        
        const sellResult = await FishInventoryService.sellFishFromInventory(testUserId, testGuildId, currentFish.id);
        
        if (sellResult.success) {
            console.log("✅ Sell successful!");
            console.log("   - Fish level:", currentFish.level);
            console.log("   - Base value:", currentFish.value);
            console.log("   - Final value:", sellResult.coinsEarned);
            console.log("   - New balance:", sellResult.newBalance);
            
            // Tính toán lý thuyết
            const expectedLevelBonus = currentFish.level > 1 ? (currentFish.level - 1) * 0.02 : 0;
            const expectedValue = Math.floor(currentFish.value * (1 + expectedLevelBonus));
            
            console.log("   - Expected value:", expectedValue);
            console.log("   - Match:", sellResult.coinsEarned === expectedValue ? "✅" : "❌");
        } else {
            console.log("❌ Sell failed:", sellResult.error);
        }

        console.log("\n🎉 Level price increase test completed!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testLevelPriceIncrease(); 