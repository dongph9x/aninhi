import prisma from './prisma';

export class FishInventoryService {
  /**
   * Lấy hoặc tạo fish inventory cho user
   */
  static async getOrCreateFishInventory(userId: string, guildId: string) {
    // Đảm bảo User tồn tại trước khi tạo FishInventory
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

    // Sau đó tạo hoặc lấy FishInventory
    const inventory = await prisma.fishInventory.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: {},
      create: {
        userId,
        guildId,
        capacity: 10,
      },
      include: {
        items: {
          include: {
            fish: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return inventory;
  }

  /**
   * Thêm cá vào fish inventory
   */
  static async addFishToInventory(userId: string, guildId: string, fishId: string) {
    const inventory = await this.getOrCreateFishInventory(userId, guildId);
    
    // Kiểm tra capacity
    if (inventory.items.length >= inventory.capacity) {
      return { success: false, error: 'Fish inventory đã đầy!' };
    }

    // Kiểm tra cá đã tồn tại trong inventory chưa
    const existingItem = await prisma.fishInventoryItem.findFirst({
      where: { fishId },
    });

    if (existingItem) {
      return { success: false, error: 'Cá đã có trong inventory!' };
    }

    // Thêm vào inventory
    const inventoryItem = await prisma.fishInventoryItem.create({
      data: {
        fishInventoryId: inventory.id,
        fishId,
      },
      include: {
        fish: true,
      },
    });

    return {
      success: true,
      inventoryItem: {
        ...inventoryItem,
        fish: {
          ...inventoryItem.fish,
          name: inventoryItem.fish.species,
          experienceToNext: inventoryItem.fish.level >= 10 ? 0 : (inventoryItem.fish.level + 1) * 10,
          traits: JSON.parse(inventoryItem.fish.specialTraits || '[]'),
          canBreed: inventoryItem.fish.status === 'adult',
        },
      },
    };
  }

  /**
   * Lấy danh sách cá trong fish inventory
   */
  static async getFishInventory(userId: string, guildId: string) {
    const inventory = await this.getOrCreateFishInventory(userId, guildId);
    
    return {
      ...inventory,
      items: inventory.items.map((item: any) => ({
        ...item,
        fish: {
          ...item.fish,
          name: item.fish.species,
          experienceToNext: item.fish.level >= 10 ? 0 : (item.fish.level + 1) * 10,
          traits: JSON.parse(item.fish.specialTraits || '[]'),
          canBreed: item.fish.status === 'adult',
        },
      })),
    };
  }

  /**
   * Bán cá từ fish inventory
   */
  static async sellFishFromInventory(userId: string, guildId: string, fishId: string) {
    // Tìm inventory trước
    const inventory = await prisma.fishInventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!inventory) {
      return { success: false, error: 'Fish inventory not found!' };
    }

    // Tìm inventory item
    const inventoryItem = await prisma.fishInventoryItem.findFirst({
      where: {
        fishInventoryId: inventory.id,
        fishId,
      },
      include: {
        fish: true,
      },
    });

    if (!inventoryItem) {
      return { success: false, error: 'Cá không có trong inventory!' };
    }

    const fish = inventoryItem.fish;

    // Kiểm tra xem cá có trong battle inventory không
    const isInBattleInventory = await prisma.battleFishInventoryItem.findFirst({
      where: { fishId },
    });

    if (isInBattleInventory) {
      return { success: false, error: 'Không thể bán cá đang trong túi đấu! Hãy xóa cá khỏi túi đấu trước.' };
    }

    // Tính giá theo level (tăng 2% mỗi level)
    const levelBonus = fish.level > 1 ? (fish.level - 1) * 0.02 : 0;
    const finalValue = Math.floor(fish.value * (1 + levelBonus));

    // Xóa khỏi inventory
    await prisma.fishInventoryItem.delete({
      where: { id: inventoryItem.id },
    });

    // Xóa cá
    await prisma.fish.delete({
      where: { id: fishId },
    });

    // Cập nhật balance
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!user) {
      return { success: false, error: 'User not found!' };
    }

    const newBalance = user.balance + finalValue;
    await prisma.user.update({
      where: { userId_guildId: { userId, guildId } },
      data: { balance: newBalance },
    });

    return {
      success: true,
      fish: {
        ...fish,
        name: fish.species,
                  experienceToNext: fish.level >= 10 ? 0 : (fish.level + 1) * 10,
        traits: JSON.parse(fish.specialTraits || '[]'),
        canBreed: fish.status === 'adult',
      },
      coinsEarned: finalValue,
      newBalance,
    };
  }

  /**
   * Lấy cá từ fish inventory theo ID
   */
  static async getFishFromInventory(userId: string, guildId: string, fishId: string) {
    // Lấy fish inventory trước
    const inventory = await prisma.fishInventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!inventory) {
      return null;
    }

    const inventoryItem = await prisma.fishInventoryItem.findFirst({
      where: {
        fishInventoryId: inventory.id,
        fishId,
      },
      include: {
        fish: true,
      },
    });

    if (!inventoryItem) {
      return null;
    }

    return {
      ...inventoryItem,
      fish: {
        ...inventoryItem.fish,
        name: inventoryItem.fish.species,
        experienceToNext: inventoryItem.fish.level >= 10 ? 0 : (inventoryItem.fish.level + 1) * 10,
        traits: JSON.parse(inventoryItem.fish.specialTraits || '[]'),
        canBreed: inventoryItem.fish.status === 'adult',
      },
    };
  }

  /**
   * Kiểm tra xem cá có trong fish inventory không
   */
  static async isFishInInventory(userId: string, guildId: string, fishId: string) {
    // Lấy fish inventory trước
    const inventory = await prisma.fishInventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!inventory) {
      return false;
    }

    const inventoryItem = await prisma.fishInventoryItem.findFirst({
      where: {
        fishInventoryId: inventory.id,
        fishId,
      },
    });

    return !!inventoryItem;
  }
} 