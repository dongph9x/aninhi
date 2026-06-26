import { PrismaClient } from "@prisma/client";
import { FishInventoryService } from "../src/utils/fish-inventory";
import { FishBarnUI } from "../src/components/MessageComponent/FishBarnUI";

const prisma = new PrismaClient();

async function testFishSelectionUI() {
    try {
        console.log("🧪 Testing Fish Selection UI...\n");

        const testUserId = 'test_user_selection_ui';
        const testGuildId = 'test_guild_selection_ui';

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

        // 2. Tạo 3 cá huyền thoại test
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
                level: 5,
                experience: 25,
                rarity: 'legendary',
                value: 2000,
                generation: 1,
                specialTraits: JSON.stringify(['Test2']),
                status: 'growing',
            },
        });

        const fish3 = await prisma.fish.create({
            data: {
                userId: testUserId,
                guildId: testGuildId,
                species: 'Test Fish 3',
                level: 10,
                experience: 0,
                rarity: 'legendary',
                value: 5000,
                generation: 1,
                specialTraits: JSON.stringify(['Test3']),
                status: 'adult',
            },
        });

        console.log("✅ Created 3 test fish:");
        console.log("   - Fish 1:", fish1.species, "ID:", fish1.id);
        console.log("   - Fish 2:", fish2.species, "ID:", fish2.id);
        console.log("   - Fish 3:", fish3.species, "ID:", fish3.id);

        // 3. Thêm vào fish inventory
        console.log("\n3. Adding fish to inventory...");
        const addResult1 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish1.id);
        const addResult2 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish2.id);
        const addResult3 = await FishInventoryService.addFishToInventory(testUserId, testGuildId, fish3.id);
        
        console.log("✅ Fish 1 added:", addResult1.success);
        console.log("✅ Fish 2 added:", addResult2.success);
        console.log("✅ Fish 3 added:", addResult3.success);

        // 4. Test UI khi chưa chọn cá
        console.log("\n4. Testing UI without selection...");
        const inventory = await FishInventoryService.getFishInventory(testUserId, testGuildId);
        const uiWithoutSelection = new FishBarnUI(inventory, testUserId, testGuildId);
        const embedWithoutSelection = uiWithoutSelection.createEmbed();
        
        console.log("✅ UI without selection:");
        console.log("   - Title:", embedWithoutSelection.data.title);
        console.log("   - Description:", embedWithoutSelection.data.description);
        console.log("   - Fields count:", embedWithoutSelection.data.fields?.length || 0);
        console.log("   - SelectedFishId:", uiWithoutSelection['selectedFishId']);

        // 5. Test UI khi chọn cá 1
        console.log("\n5. Testing UI with Fish 1 selected...");
        const uiWithFish1 = new FishBarnUI(inventory, testUserId, testGuildId, fish1.id);
        const embedWithFish1 = uiWithFish1.createEmbed();
        
        console.log("✅ UI with Fish 1 selected:");
        console.log("   - Title:", embedWithFish1.data.title);
        console.log("   - Description:", embedWithFish1.data.description);
        console.log("   - Fields count:", embedWithFish1.data.fields?.length || 0);
        console.log("   - SelectedFishId:", uiWithFish1['selectedFishId']);
        
        if (embedWithFish1.data.fields) {
            embedWithFish1.data.fields.forEach((field: any, index: number) => {
                console.log(`   - Field ${index + 1}: ${field.name}`);
                console.log(`     Value: ${field.value.substring(0, 100)}...`);
            });
        }

        // 6. Test UI khi chọn cá 2
        console.log("\n6. Testing UI with Fish 2 selected...");
        const uiWithFish2 = new FishBarnUI(inventory, testUserId, testGuildId, fish2.id);
        const embedWithFish2 = uiWithFish2.createEmbed();
        
        console.log("✅ UI with Fish 2 selected:");
        console.log("   - Title:", embedWithFish2.data.title);
        console.log("   - Description:", embedWithFish2.data.description);
        console.log("   - Fields count:", embedWithFish2.data.fields?.length || 0);
        console.log("   - SelectedFishId:", uiWithFish2['selectedFishId']);
        
        if (embedWithFish2.data.fields) {
            embedWithFish2.data.fields.forEach((field: any, index: number) => {
                console.log(`   - Field ${index + 1}: ${field.name}`);
                console.log(`     Value: ${field.value.substring(0, 100)}...`);
            });
        }

        // 7. Test components
        console.log("\n7. Testing components...");
        const components = uiWithFish1.createComponents();
        console.log("✅ Components count:", components.length);
        
        components.forEach((component: any, index: number) => {
            console.log(`   - Component ${index + 1}:`, component.type);
            if (component.components) {
                component.components.forEach((subComp: any, subIndex: number) => {
                    console.log(`     - Sub ${subIndex + 1}: ${subComp.custom_id || subComp.label}`);
                    if (subComp.placeholder) {
                        console.log(`       Placeholder: ${subComp.placeholder}`);
                    }
                });
            }
        });

        console.log("\n🎉 Fish selection UI test completed!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testFishSelectionUI(); 