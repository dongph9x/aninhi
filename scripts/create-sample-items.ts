import { PrismaClient } from "@prisma/client";
import { InventoryService } from "../src/utils/inventory";

const prisma = new PrismaClient();

async function createSampleItems() {
    console.log("🎮 Tạo sample items...\n");

    const sampleItems = [
        // Weapons
        {
            itemId: "sword_001",
            itemName: "Iron Sword",
            itemType: "weapon",
            itemRarity: "common",
            description: "A basic iron sword for beginners",
            baseValue: 100,
            maxStack: 1,
            maxDurability: 100,
            baseStats: JSON.stringify({ attack: 15, speed: 1.0 }),
            effects: undefined,
            requirements: undefined,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "weapon",
            subcategory: "sword"
        },
        {
            itemId: "sword_002",
            itemName: "Steel Sword",
            itemType: "weapon",
            itemRarity: "rare",
            description: "A well-crafted steel sword",
            baseValue: 500,
            maxStack: 1,
            maxDurability: 200,
            baseStats: JSON.stringify({ attack: 25, speed: 1.1 }),
            effects: undefined,
            requirements: undefined,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "weapon",
            subcategory: "sword"
        },
        {
            itemId: "bow_001",
            itemName: "Wooden Bow",
            itemType: "weapon",
            itemRarity: "common",
            description: "A simple wooden bow",
            baseValue: 80,
            maxStack: 1,
            maxDurability: 80,
            baseStats: JSON.stringify({ attack: 12, range: 3 }),
            effects: undefined,
            requirements: undefined,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "weapon",
            subcategory: "bow"
        },

        // Armor
        {
            itemId: "helmet_001",
            itemName: "Leather Helmet",
            itemType: "armor",
            itemRarity: "common",
            description: "Basic leather helmet",
            baseValue: 50,
            maxStack: 1,
            maxDurability: 60,
            baseStats: JSON.stringify({ defense: 5 }),
            effects: undefined,
            requirements: undefined,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "armor",
            subcategory: "helmet"
        },
        {
            itemId: "chest_001",
            itemName: "Iron Chestplate",
            itemType: "armor",
            itemRarity: "rare",
            description: "Sturdy iron chestplate",
            baseValue: 300,
            maxStack: 1,
            maxDurability: 150,
            baseStats: JSON.stringify({ defense: 20 }),
            effects: undefined,
            requirements: undefined,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "armor",
            subcategory: "chest"
        },

        // Consumables
        {
            itemId: "health_potion",
            itemName: "Health Potion",
            itemType: "consumable",
            itemRarity: "common",
            description: "Restores 50 HP",
            baseValue: 25,
            maxStack: 10,
            maxDurability: undefined,
            baseStats: undefined,
            effects: JSON.stringify({ heal: 50 }),
            requirements: undefined,
            isTradeable: true,
            isDroppable: true,
            isConsumable: true,
            category: "consumable",
            subcategory: "potion"
        },
        {
            itemId: "mana_potion",
            itemName: "Mana Potion",
            itemType: "consumable",
            itemRarity: "common",
            description: "Restores 30 MP",
            baseValue: 20,
            maxStack: 10,
            maxDurability: null,
            baseStats: null,
            effects: JSON.stringify({ mana: 30 }),
            requirements: null,
            isTradeable: true,
            isDroppable: true,
            isConsumable: true,
            category: "consumable",
            subcategory: "potion"
        },
        {
            itemId: "strength_potion",
            itemName: "Strength Potion",
            itemType: "consumable",
            itemRarity: "rare",
            description: "Increases attack by 10 for 5 minutes",
            baseValue: 100,
            maxStack: 5,
            maxDurability: null,
            baseStats: null,
            effects: JSON.stringify({ attack: 10, duration: 300 }),
            requirements: null,
            isTradeable: true,
            isDroppable: true,
            isConsumable: true,
            category: "consumable",
            subcategory: "potion"
        },

        // Materials
        {
            itemId: "iron_ore",
            itemName: "Iron Ore",
            itemType: "material",
            itemRarity: "common",
            description: "Raw iron ore for crafting",
            baseValue: 10,
            maxStack: 100,
            maxDurability: null,
            baseStats: null,
            effects: null,
            requirements: null,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "material",
            subcategory: "ore"
        },
        {
            itemId: "gold_ore",
            itemName: "Gold Ore",
            itemType: "material",
            itemRarity: "rare",
            description: "Precious gold ore",
            baseValue: 50,
            maxStack: 100,
            maxDurability: null,
            baseStats: null,
            effects: null,
            requirements: null,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "material",
            subcategory: "ore"
        },
        {
            itemId: "leather",
            itemName: "Leather",
            itemType: "material",
            itemRarity: "common",
            description: "Tanned leather for crafting",
            baseValue: 15,
            maxStack: 100,
            maxDurability: null,
            baseStats: null,
            effects: null,
            requirements: null,
            isTradeable: true,
            isDroppable: true,
            isConsumable: false,
            category: "material",
            subcategory: "hide"
        },

        // Special Items
        {
            itemId: "lucky_charm",
            itemName: "Lucky Charm",
            itemType: "special",
            itemRarity: "epic",
            description: "Increases luck in games and fishing",
            baseValue: 1000,
            maxStack: 1,
            maxDurability: null,
            baseStats: null,
            effects: JSON.stringify({ luck: 15 }),
            requirements: null,
            isTradeable: false,
            isDroppable: false,
            isConsumable: false,
            category: "special",
            subcategory: "charm"
        },
        {
            itemId: "treasure_map",
            itemName: "Treasure Map",
            itemType: "special",
            itemRarity: "legendary",
            description: "Leads to hidden treasure",
            baseValue: 5000,
            maxStack: 1,
            maxDurability: null,
            baseStats: null,
            effects: JSON.stringify({ treasure: true }),
            requirements: null,
            isTradeable: true,
            isDroppable: true,
            isConsumable: true,
            category: "special",
            subcategory: "map"
        }
    ];

    try {
        for (const itemData of sampleItems) {
            try {
                await InventoryService.createItemTemplate(itemData);
                console.log(`✅ Created: ${itemData.itemName} (${itemData.itemRarity})`);
            } catch (error) {
                if (error instanceof Error && error.message.includes("Unique constraint")) {
                    console.log(`ℹ️ Skipped: ${itemData.itemName} (already exists)`);
                } else {
                    console.error(`❌ Failed to create ${itemData.itemName}:`, error);
                }
            }
        }

        console.log("\n🎉 Sample items creation completed!");
        
        // Hiển thị thống kê
        const totalItems = await prisma.itemTemplate.count();
        console.log(`📊 Total items in database: ${totalItems}`);

    } catch (error) {
        console.error("❌ Error creating sample items:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createSampleItems(); 