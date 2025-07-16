import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export interface ItemData {
    itemId: string;
    itemName: string;
    itemType: string;
    itemRarity: string;
    quantity?: number;
    durability?: number;
    maxDurability?: number;
    enchantments?: string;
    customData?: string;
}

export interface ItemTemplateData {
    itemId: string;
    itemName: string;
    itemType: string;
    itemRarity: string;
    description: string;
    baseValue: number;
    maxStack: number;
    maxDurability?: number;
    baseStats?: string;
    effects?: string;
    requirements?: string;
    isTradeable: boolean;
    isDroppable: boolean;
    isConsumable: boolean;
    category: string;
    subcategory?: string;
}

export class InventoryService {
    /**
     * Lấy hoặc tạo inventory cho user
     */
    static async getInventory(userId: string, guildId: string) {
        try {
            // Đảm bảo User tồn tại trước
            await prisma.user.upsert({
                where: {
                    userId_guildId: {
                        userId,
                        guildId
                    }
                },
                update: {},
                create: {
                    userId,
                    guildId,
                    balance: 0,
                    dailyStreak: 0
                }
            });

            const inventory = await prisma.inventory.upsert({
                where: {
                    userId_guildId: {
                        userId,
                        guildId
                    }
                },
                update: {},
                create: {
                    userId,
                    guildId,
                    capacity: 20
                },
                include: {
                    items: {
                        orderBy: {
                            createdAt: 'desc'
                        }
                    }
                }
            });

            return inventory;
        } catch (error) {
            console.error("Error getting inventory:", error);
            throw error;
        }
    }

    /**
     * Thêm item vào inventory
     */
    static async addItem(
        userId: string,
        guildId: string,
        itemData: ItemData,
        quantity: number = 1
    ) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            
            // Kiểm tra sức chứa
            const currentItems = inventory.items.length;
            if (currentItems >= inventory.capacity) {
                throw new Error("Túi đồ đã đầy");
            }

            // Kiểm tra xem item đã tồn tại chưa
            const existingItem = inventory.items.find((item: any) => 
                item.itemId === itemData.itemId && 
                item.durability === itemData.durability &&
                item.enchantments === itemData.enchantments
            );

            if (existingItem) {
                // Cập nhật số lượng nếu item đã tồn tại
                const updatedItem = await prisma.inventoryItem.update({
                    where: { id: existingItem.id },
                    data: {
                        quantity: { increment: quantity }
                    }
                });
                return updatedItem;
            } else {
                // Tạo item mới
                const newItem = await prisma.inventoryItem.create({
                    data: {
                        inventoryId: inventory.id,
                        itemId: itemData.itemId,
                        itemName: itemData.itemName,
                        itemType: itemData.itemType,
                        itemRarity: itemData.itemRarity,
                        quantity: quantity,
                        durability: itemData.durability,
                        maxDurability: itemData.maxDurability,
                        enchantments: itemData.enchantments,
                        customData: itemData.customData
                    }
                });
                return newItem;
            }
        } catch (error) {
            console.error("Error adding item:", error);
            throw error;
        }
    }

    /**
     * Xóa item khỏi inventory
     */
    static async removeItem(
        userId: string,
        guildId: string,
        itemId: string,
        quantity: number = 1
    ) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            const item = inventory.items.find((item: any) => item.itemId === itemId);

            if (!item) {
                throw new Error("Item không tồn tại trong túi đồ");
            }

            if (item.quantity < quantity) {
                throw new Error("Không đủ số lượng item");
            }

            if (item.quantity === quantity) {
                // Xóa item nếu số lượng bằng 0
                await prisma.inventoryItem.delete({
                    where: { id: item.id }
                });
                return null;
            } else {
                // Giảm số lượng
                const updatedItem = await prisma.inventoryItem.update({
                    where: { id: item.id },
                    data: {
                        quantity: { decrement: quantity }
                    }
                });
                return updatedItem;
            }
        } catch (error) {
            console.error("Error removing item:", error);
            throw error;
        }
    }

    /**
     * Lấy danh sách items trong inventory
     */
    static async getItems(userId: string, guildId: string) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            return inventory.items;
        } catch (error) {
            console.error("Error getting items:", error);
            return [];
        }
    }

    /**
     * Tìm item trong inventory
     */
    static async findItem(userId: string, guildId: string, itemId: string) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            return inventory.items.find((item: any) => item.itemId === itemId);
        } catch (error) {
            console.error("Error finding item:", error);
            return null;
        }
    }

    /**
     * Trang bị item
     */
    static async equipItem(
        userId: string,
        guildId: string,
        itemId: string,
        slot: string
    ) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            const item = inventory.items.find((item: any) => item.itemId === itemId);

            if (!item) {
                throw new Error("Item không tồn tại trong túi đồ");
            }

            if (item.itemType !== "weapon" && item.itemType !== "armor") {
                throw new Error("Chỉ có thể trang bị weapon hoặc armor");
            }

            // Gỡ bỏ item đang trang bị ở slot này
            await prisma.inventoryItem.updateMany({
                where: {
                    inventoryId: inventory.id,
                    equippedSlot: slot,
                    isEquipped: true
                },
                data: {
                    isEquipped: false,
                    equippedSlot: null
                }
            });

            // Trang bị item mới
            const equippedItem = await prisma.inventoryItem.update({
                where: { id: item.id },
                data: {
                    isEquipped: true,
                    equippedSlot: slot
                }
            });

            return equippedItem;
        } catch (error) {
            console.error("Error equipping item:", error);
            throw error;
        }
    }

    /**
     * Gỡ bỏ item
     */
    static async unequipItem(userId: string, guildId: string, itemId: string) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            const item = inventory.items.find((item: any) => item.itemId === itemId);

            if (!item) {
                throw new Error("Item không tồn tại trong túi đồ");
            }

            if (!item.isEquipped) {
                throw new Error("Item chưa được trang bị");
            }

            const unequippedItem = await prisma.inventoryItem.update({
                where: { id: item.id },
                data: {
                    isEquipped: false,
                    equippedSlot: null
                }
            });

            return unequippedItem;
        } catch (error) {
            console.error("Error unequipping item:", error);
            throw error;
        }
    }

    /**
     * Lấy items đang được trang bị
     */
    static async getEquippedItems(userId: string, guildId: string) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            return inventory.items.filter((item: any) => item.isEquipped);
        } catch (error) {
            console.error("Error getting equipped items:", error);
            return [];
        }
    }

    /**
     * Tăng sức chứa inventory
     */
    static async upgradeCapacity(userId: string, guildId: string, additionalSlots: number) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            
            const updatedInventory = await prisma.inventory.update({
                where: { id: inventory.id },
                data: {
                    capacity: { increment: additionalSlots }
                }
            });

            return updatedInventory;
        } catch (error) {
            console.error("Error upgrading capacity:", error);
            throw error;
        }
    }

    /**
     * Sử dụng consumable item
     */
    static async useConsumable(userId: string, guildId: string, itemId: string) {
        try {
            const item = await this.findItem(userId, guildId, itemId);
            
            if (!item) {
                throw new Error("Item không tồn tại trong túi đồ");
            }

            if (item.itemType !== "consumable") {
                throw new Error("Item này không thể sử dụng");
            }

            // Xóa 1 item
            await this.removeItem(userId, guildId, itemId, 1);

            return item;
        } catch (error) {
            console.error("Error using consumable:", error);
            throw error;
        }
    }

    /**
     * Sửa chữa item (tăng độ bền)
     */
    static async repairItem(userId: string, guildId: string, itemId: string) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            const item = inventory.items.find((item: any) => item.itemId === itemId);

            if (!item) {
                throw new Error("Item không tồn tại trong túi đồ");
            }

            if (!item.maxDurability) {
                throw new Error("Item này không thể sửa chữa");
            }

            if (item.durability === item.maxDurability) {
                throw new Error("Item đã ở trạng thái hoàn hảo");
            }

            const repairedItem = await prisma.inventoryItem.update({
                where: { id: item.id },
                data: {
                    durability: item.maxDurability
                }
            });

            return repairedItem;
        } catch (error) {
            console.error("Error repairing item:", error);
            throw error;
        }
    }

    /**
     * Tạo item template mới
     */
    static async createItemTemplate(templateData: ItemTemplateData) {
        try {
            const template = await prisma.itemTemplate.create({
                data: templateData
            });

            return template;
        } catch (error) {
            console.error("Error creating item template:", error);
            throw error;
        }
    }

    /**
     * Lấy item template
     */
    static async getItemTemplate(itemId: string) {
        try {
            const template = await prisma.itemTemplate.findUnique({
                where: { itemId }
            });

            return template;
        } catch (error) {
            console.error("Error getting item template:", error);
            return null;
        }
    }

    /**
     * Lấy tất cả item templates
     */
    static async getAllItemTemplates() {
        try {
            const templates = await prisma.itemTemplate.findMany({
                orderBy: {
                    category: 'asc'
                }
            });

            return templates;
        } catch (error) {
            console.error("Error getting all item templates:", error);
            return [];
        }
    }

    /**
     * Tìm kiếm items trong inventory
     */
    static async searchItems(
        userId: string,
        guildId: string,
        searchTerm: string
    ) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            const items = inventory.items.filter((item: any) =>
                item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.itemType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.itemRarity.toLowerCase().includes(searchTerm.toLowerCase())
            );

            return items;
        } catch (error) {
            console.error("Error searching items:", error);
            return [];
        }
    }

    /**
     * Lấy thống kê inventory
     */
    static async getInventoryStats(userId: string, guildId: string) {
        try {
            const inventory = await this.getInventory(userId, guildId);
            const items = inventory.items;

            const stats = {
                totalItems: items.length,
                totalQuantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
                equippedItems: items.filter((item: any) => item.isEquipped).length,
                byType: {} as Record<string, number>,
                byRarity: {} as Record<string, number>
            };

            // Thống kê theo loại
            items.forEach((item: any) => {
                stats.byType[item.itemType] = (stats.byType[item.itemType] || 0) + item.quantity;
                stats.byRarity[item.itemRarity] = (stats.byRarity[item.itemRarity] || 0) + item.quantity;
            });

            return {
                ...stats,
                capacity: inventory.capacity,
                usedSlots: items.length,
                availableSlots: inventory.capacity - items.length
            };
        } catch (error) {
            console.error("Error getting inventory stats:", error);
            return null;
        }
    }
} 