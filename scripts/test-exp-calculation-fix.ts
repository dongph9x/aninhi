import { PrismaClient } from "@prisma/client";
import { FishBreedingService } from "../src/utils/fish-breeding";

const prisma = new PrismaClient();

async function testExpCalculationFix() {
    try {
        console.log("🧪 Testing Fixed Exp Calculation...\n");

        const testUserId = 'test_user_exp_fix';
        const testGuildId = 'test_guild_exp_fix';

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

        // 2. Tạo cá huyền thoại test
        console.log("\n2. Creating test legendary fish...");
        
        const testFish = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Exp Fish',
                level: 1,
                experience: 0,
                rarity: 'legendary',
                value: 1000,
                generation: 1,
                specialTraits: JSON.stringify(['Test']),
                status: 'growing',
            },
        });

        console.log("✅ Created test fish:");
        console.log("   - Name:", testFish.species);
        console.log("   - Level:", testFish.level);
        console.log("   - Experience:", testFish.experience);

        // 3. Test logic tính exp cần thiết
        console.log("\n3. Testing exp calculation logic...");
        
        function getExpForLevel(level: number) {
            return level * 10; // Level 1 cần 10, Level 2 cần 20, Level 3 cần 30, v.v.
        }
        
        for (let level = 1; level <= 5; level++) {
            const expNeeded = getExpForLevel(level + 1);
            console.log(`   Level ${level} → Level ${level + 1}: cần ${expNeeded} exp`);
        }

        // 4. Test getFishById
        console.log("\n4. Testing getFishById...");
        const fishInfo = await FishBreedingService.getFishById(testUserId, testFish.id);
        
        if (fishInfo) {
            console.log("✅ Fish info:");
            console.log("   - Level:", fishInfo.level);
            console.log("   - Experience:", fishInfo.experience);
            console.log("   - Experience to next:", fishInfo.experienceToNext);
            console.log("   - Progress:", `${fishInfo.experience}/${fishInfo.experienceToNext}`);
        }

        // 5. Test feed fish để tăng exp
        console.log("\n5. Testing feed fish...");
        
        let currentFish = testFish;
        for (let i = 0; i < 3; i++) {
            console.log(`\n   Feeding fish (attempt ${i + 1})...`);
            
            const feedResult = await FishBreedingService.feedFish(testUserId, currentFish.id, true); // Admin bypass cooldown
            
            if (feedResult.success) {
                console.log(`   ✅ Feed successful!`);
                console.log(`   - Level: ${currentFish.level} → ${feedResult.fish.level}`);
                console.log(`   - Experience: ${currentFish.experience} → ${feedResult.fish.experience}`);
                console.log(`   - Experience to next: ${feedResult.fish.experienceToNext}`);
                console.log(`   - Exp gained: +${feedResult.experienceGained}`);
                
                if (feedResult.leveledUp) {
                    console.log(`   🎉 Leveled up!`);
                }
                
                currentFish = feedResult.fish;
            } else {
                console.log(`   ❌ Feed failed:`, feedResult.error);
                break;
            }
        }

        // 6. Test getUserFishCollection
        console.log("\n6. Testing getUserFishCollection...");
        const fishCollection = await FishBreedingService.getUserFishCollection(testUserId);
        
        if (fishCollection.length > 0) {
            const fish = fishCollection[0];
            console.log("✅ Fish collection:");
            console.log("   - Level:", fish.level);
            console.log("   - Experience:", fish.experience);
            console.log("   - Experience to next:", fish.experienceToNext);
            console.log("   - Progress:", `${fish.experience}/${fish.experienceToNext}`);
        }

        console.log("\n🎉 Exp calculation fix test completed!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testExpCalculationFix(); 