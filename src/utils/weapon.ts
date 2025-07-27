import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface Weapon {
    id: string;
    name: string;
    type: string;
    price: bigint;
    power: number;
    defense: number;
    accuracy: number;
    rarity: string;
    description: string;
}

export interface UserWeapon {
    id: string;
    userId: string;
    guildId: string;
    weaponId: string;
    quantity: number;
    isEquipped: boolean;
    equippedOnFishId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export class WeaponService {
    /**
     * Thêm vũ khí vào inventory của user
     */
    static async addWeaponToInventory(
        userId: string,
        guildId: string,
        weaponId: string,
        quantity: number = 1
    ): Promise<void> {
        try {
            // Kiểm tra xem user đã có vũ khí này chưa
            const existingWeapon = await prisma.userWeapon.findFirst({
                where: {
                    userId,
                    guildId,
                    weaponId
                }
            });

            if (existingWeapon) {
                // Cập nhật số lượng nếu đã có
                await prisma.userWeapon.update({
                    where: { id: existingWeapon.id },
                    data: {
                        quantity: { increment: quantity },
                        updatedAt: new Date()
                    }
                });
            } else {
                // Tạo mới nếu chưa có
                await prisma.userWeapon.create({
                    data: {
                        userId,
                        guildId,
                        weaponId,
                        quantity,
                        isEquipped: false
                    }
                });
            }
        } catch (error) {
            console.error("Error adding weapon to inventory:", error);
            throw error;
        }
    }

    /**
     * Lấy inventory vũ khí của user
     */
    static async getUserWeaponInventory(
        userId: string,
        guildId: string
    ): Promise<UserWeapon[]> {
        try {
            const inventory = await prisma.userWeapon.findMany({
                where: {
                    userId,
                    guildId
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            return inventory;
        } catch (error) {
            console.error("Error getting user weapon inventory:", error);
            return [];
        }
    }

    /**
     * Trang bị vũ khí cho cá
     */
    static async equipWeapon(
        userId: string,
        guildId: string,
        weaponId: string,
        fishId?: string
    ): Promise<boolean> {
        try {
            // Kiểm tra user có vũ khí này không
            const userWeapon = await prisma.userWeapon.findFirst({
                where: {
                    userId,
                    guildId,
                    weaponId
                }
            });

            if (!userWeapon || userWeapon.quantity <= 0) {
                return false; // Không có vũ khí
            }

            // Gỡ trang bị vũ khí cũ cùng loại
            await prisma.userWeapon.updateMany({
                where: {
                    userId,
                    guildId,
                    isEquipped: true
                },
                data: {
                    isEquipped: false,
                    equippedOnFishId: null,
                    updatedAt: new Date()
                }
            });

            // Trang bị vũ khí mới
            await prisma.userWeapon.update({
                where: { id: userWeapon.id },
                data: {
                    isEquipped: true,
                    equippedOnFishId: fishId,
                    updatedAt: new Date()
                }
            });

            return true;
        } catch (error) {
            console.error("Error equipping weapon:", error);
            return false;
        }
    }

    /**
     * Gỡ trang bị vũ khí
     */
    static async unequipWeapon(
        userId: string,
        guildId: string
    ): Promise<boolean> {
        try {
            const result = await prisma.userWeapon.updateMany({
                where: {
                    userId,
                    guildId,
                    isEquipped: true
                },
                data: {
                    isEquipped: false,
                    equippedOnFishId: null,
                    updatedAt: new Date()
                }
            });

            return result.count > 0;
        } catch (error) {
            console.error("Error unequipping weapon:", error);
            return false;
        }
    }

    /**
     * Lấy vũ khí đang được trang bị
     */
    static async getEquippedWeapon(
        userId: string,
        guildId: string
    ): Promise<UserWeapon | null> {
        try {
            const equippedWeapon = await prisma.userWeapon.findFirst({
                where: {
                    userId,
                    guildId,
                    isEquipped: true
                }
            });

            return equippedWeapon;
        } catch (error) {
            console.error("Error getting equipped weapon:", error);
            return null;
        }
    }

    /**
     * Bán vũ khí
     */
    static async sellWeapon(
        userId: string,
        guildId: string,
        weaponId: string,
        quantity: number = 1
    ): Promise<{ success: boolean; sellPrice?: number }> {
        try {
            const userWeapon = await prisma.userWeapon.findFirst({
                where: {
                    userId,
                    guildId,
                    weaponId
                }
            });

            if (!userWeapon || userWeapon.quantity < quantity) {
                return { success: false };
            }

            // Tính giá bán (50% giá mua)
            const weapons = getAvailableWeapons();
            const weapon = weapons.find(w => w.id === weaponId);
            
            if (!weapon) {
                return { success: false };
            }

            const sellPrice = Number(weapon.price) * 0.5 * quantity;

            // Cập nhật số lượng
            if (userWeapon.quantity === quantity) {
                // Xóa nếu bán hết
                await prisma.userWeapon.delete({
                    where: { id: userWeapon.id }
                });
            } else {
                // Giảm số lượng
                await prisma.userWeapon.update({
                    where: { id: userWeapon.id },
                    data: {
                        quantity: { decrement: quantity },
                        updatedAt: new Date()
                    }
                });
            }

            return { success: true, sellPrice };
        } catch (error) {
            console.error("Error selling weapon:", error);
            return { success: false };
        }
    }

    /**
     * Lấy thông tin vũ khí từ ID
     */
    static getWeaponById(weaponId: string): Weapon | null {
        const weapons = getAvailableWeapons();
        return weapons.find(w => w.id === weaponId) || null;
    }

    /**
     * Lấy tất cả vũ khí có sẵn
     */
    static getAllWeapons(): Weapon[] {
        return getAvailableWeapons();
    }

    /**
     * Tính tổng sức mạnh từ vũ khí đang trang bị
     */
    static async getTotalWeaponStats(
        userId: string,
        guildId: string
    ): Promise<{ power: number; defense: number; accuracy: number }> {
        try {
            const equippedWeapon = await this.getEquippedWeapon(userId, guildId);
            
            if (!equippedWeapon) {
                return { power: 0, defense: 0, accuracy: 0 };
            }

            const weapon = this.getWeaponById(equippedWeapon.weaponId);
            
            if (!weapon) {
                return { power: 0, defense: 0, accuracy: 0 };
            }

            return {
                power: weapon.power,
                defense: weapon.defense,
                accuracy: weapon.accuracy
            };
        } catch (error) {
            console.error("Error getting total weapon stats:", error);
            return { power: 0, defense: 0, accuracy: 0 };
        }
    }
}

function getAvailableWeapons(): Weapon[] {
    return [
        {
            id: "sword",
            name: "Iron Sword",
            type: "sword",
            price: 100000n,
            power: 15,
            defense: 5,
            accuracy: 85,
            rarity: "Common",
            description: "Thanh kiếm sắt cơ bản, tăng sức mạnh tấn công"
        },
        {
            id: "shield",
            name: "Wooden Shield",
            type: "shield",
            price: 80000n,
            power: 5,
            defense: 20,
            accuracy: 90,
            rarity: "Common",
            description: "Khiên gỗ, tăng khả năng phòng thủ"
        },
        {
            id: "spear",
            name: "Steel Spear",
            type: "spear",
            price: 150000n,
            power: 20,
            defense: 8,
            accuracy: 80,
            rarity: "Uncommon",
            description: "Giáo thép, sức mạnh tấn công cao"
        },
        {
            id: "bow",
            name: "Hunting Bow",
            type: "bow",
            price: 120000n,
            power: 18,
            defense: 3,
            accuracy: 95,
            rarity: "Uncommon",
            description: "Cung săn, độ chính xác cao"
        },
        {
            id: "axe",
            name: "Battle Axe",
            type: "axe",
            price: 200000n,
            power: 25,
            defense: 10,
            accuracy: 75,
            rarity: "Rare",
            description: "Rìu chiến, sức mạnh tấn công rất cao"
        },
        {
            id: "magic_staff",
            name: "Magic Staff",
            type: "staff",
            price: 250000n,
            power: 22,
            defense: 12,
            accuracy: 88,
            rarity: "Rare",
            description: "Gậy phép thuật, cân bằng giữa tấn công và phòng thủ"
        },
        {
            id: "legendary_sword",
            name: "Legendary Sword",
            type: "sword",
            price: 1000000n,
            power: 50,
            defense: 25,
            accuracy: 95,
            rarity: "Legendary",
            description: "Thanh kiếm huyền thoại, sức mạnh vượt trội"
        }
    ];
} 