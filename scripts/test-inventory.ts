import { PrismaClient } from "@prisma/client";
import { InventoryService } from "../src/utils/inventory";

const prisma = new PrismaClient();

async function testInventory() {
    console.log("🎒 Testing Inventory System...\n");

    const testGuildId = "test-guild-123";
    const testUserId = "test-user-456";

    try {
        // Test 1: Tạo inventory
        console.log("1. Testing inventory creation...");
        const inventory = await InventoryService.getInventory(testUserId, testGuildId);
        console.log(`✅ Inventory created: ${inventory.capacity} slots`);

        // Test 2: Thêm items
        console.log("\n2. Testing adding items...");
        
        // Thêm weapon
        const swordData = {
            itemId: "sword_001",
            itemName: "Iron Sword",
            itemType: "weapon",
            itemRarity: "common",
            durability: 100,
            maxDurability: 100
        };
        
        const addedSword = await InventoryService.addItem(testUserId, testGuildId, swordData, 1);
        console.log(`✅ Added weapon: ${addedSword.itemName}`);

        // Thêm consumable
        const potionData = {
            itemId: "health_potion",
            itemName: "Health Potion",
            itemType: "consumable",
            itemRarity: "common"
        };
        
        const addedPotion = await InventoryService.addItem(testUserId, testGuildId, potionData, 5);
        console.log(`✅ Added consumable: ${addedPotion.itemName} x${addedPotion.quantity}`);

        // Thêm material
        const oreData = {
            itemId: "iron_ore",
            itemName: "Iron Ore",
            itemType: "material",
            itemRarity: "common"
        };
        
        const addedOre = await InventoryService.addItem(testUserId, testGuildId, oreData, 10);
        console.log(`✅ Added material: ${addedOre.itemName} x${addedOre.quantity}`);

        // Test 3: Lấy danh sách items
        console.log("\n3. Testing get items...");
        const items = await InventoryService.getItems(testUserId, testGuildId);
        console.log(`✅ Found ${items.length} items in inventory:`);
        items.forEach((item: any) => {
            console.log(`   - ${item.itemName} (${item.itemType}) x${item.quantity}`);
        });

        // Test 4: Trang bị item
        console.log("\n4. Testing equip item...");
        const equippedSword = await InventoryService.equipItem(testUserId, testGuildId, "sword_001", "weapon");
        console.log(`✅ Equipped: ${equippedSword.itemName} in ${equippedSword.equippedSlot} slot`);

        // Test 5: Lấy equipped items
        console.log("\n5. Testing get equipped items...");
        const equippedItems = await InventoryService.getEquippedItems(testUserId, testGuildId);
        console.log(`✅ Equipped items: ${equippedItems.length}`);
        equippedItems.forEach((item: any) => {
            console.log(`   - ${item.itemName} in ${item.equippedSlot} slot`);
        });

        // Test 6: Thống kê inventory
        console.log("\n6. Testing inventory stats...");
        const stats = await InventoryService.getInventoryStats(testUserId, testGuildId);
        if (stats) {
            console.log(`✅ Inventory stats:`);
            console.log(`   - Total items: ${stats.totalItems}`);
            console.log(`   - Total quantity: ${stats.totalQuantity}`);
            console.log(`   - Equipped items: ${stats.equippedItems}`);
            console.log(`   - Capacity: ${stats.capacity}/${stats.usedSlots}`);
            console.log(`   - By type:`, stats.byType);
            console.log(`   - By rarity:`, stats.byRarity);
        }

        // Test 7: Tìm kiếm items
        console.log("\n7. Testing search items...");
        const searchResults = await InventoryService.searchItems(testUserId, testGuildId, "sword");
        console.log(`✅ Search results for "sword": ${searchResults.length} items`);

        // Test 8: Gỡ bỏ item
        console.log("\n8. Testing unequip item...");
        const unequippedSword = await InventoryService.unequipItem(testUserId, testGuildId, "sword_001");
        console.log(`✅ Unequipped: ${unequippedSword.itemName}`);

        // Test 9: Sử dụng consumable
        console.log("\n9. Testing use consumable...");
        const usedPotion = await InventoryService.useConsumable(testUserId, testGuildId, "health_potion");
        console.log(`✅ Used: ${usedPotion.itemName}`);

        // Test 10: Xóa item
        console.log("\n10. Testing remove item...");
        const removedItem = await InventoryService.removeItem(testUserId, testGuildId, "iron_ore", 5);
        console.log(`✅ Removed 5 iron ore`);

        console.log("\n🧹 Cleaning up test data...");
        
        // Clean up
        await prisma.inventoryItem.deleteMany({
            where: { inventory: { userId: testUserId, guildId: testGuildId } }
        });

        await prisma.inventory.deleteMany({
            where: { userId: testUserId, guildId: testGuildId }
        });

        console.log("✅ Test data cleaned up");

        console.log("\n🎉 Inventory system test completed successfully!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testInventory(); 