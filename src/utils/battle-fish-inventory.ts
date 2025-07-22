import prisma from './prisma';

export class BattleFishInventoryService {
  /**
   * Lấy hoặc tạo battle fish inventory cho user
   */
  static async getOrCreateBattleFishInventory(userId: string, guildId: string) {
    // Đảm bảo User tồn tại trước khi tạo BattleFishInventory
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

    // Sau đó tạo hoặc lấy BattleFishInventory
    const inventory = await prisma.battleFishInventory.upsert({
      where: { userId_guildId: { userId, guildId } },
      update: {},
      create: {
        userId,
        guildId,
        capacity: 5, // Túi đấu cá có capacity nhỏ hơn
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
   * Thêm cá vào battle fish inventory (chỉ cá thế hệ 2+ và trưởng thành)
   */
  static async addFishToBattleInventory(userId: string, guildId: string, fishId: string) {
    const inventory = await this.getOrCreateBattleFishInventory(userId, guildId);
    
    // Kiểm tra capacity
    if (inventory.items.length >= inventory.capacity) {
      return { success: false, error: 'Túi đấu cá đã đầy!' };
    }

    // Kiểm tra cá đã tồn tại trong battle inventory chưa
    const existingItem = await prisma.battleFishInventoryItem.findFirst({
      where: { fishId },
    });

    if (existingItem) {
      return { success: false, error: 'Cá đã có trong túi đấu!' };
    }

    // Kiểm tra cá có tồn tại và thuộc về user không
    const fish = await prisma.fish.findFirst({
      where: { 
        id: fishId,
        userId,
        guildId
      }
    });

    if (!fish) {
      return { success: false, error: 'Cá không tồn tại hoặc không thuộc về bạn!' };
    }

    // Kiểm tra điều kiện: phải là cá thế hệ 2+ và trưởng thành
    if (fish.generation < 2) {
      return { success: false, error: 'Chỉ cá thế hệ 2 trở lên mới có thể đấu!' };
    }

    if (fish.status !== 'adult') {
      return { success: false, error: 'Chỉ cá trưởng thành mới có thể đấu!' };
    }

    // Kiểm tra cá có đang được bán trên market không
    const isListedOnMarket = await prisma.fishMarket.findFirst({
      where: { fishId }
    });

    if (isListedOnMarket) {
      return { success: false, error: 'Không thể thêm cá đang được bán trên market vào túi đấu! Hãy hủy bán trước.' };
    }

    // Thêm vào battle inventory
    const inventoryItem = await prisma.battleFishInventoryItem.create({
      data: {
        battleFishInventoryId: inventory.id,
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
          stats: JSON.parse(inventoryItem.fish.stats || '{}'),
          canBreed: inventoryItem.fish.status === 'adult',
        },
      },
    };
  }

  /**
   * Lấy danh sách cá trong battle fish inventory
   */
  static async getBattleFishInventory(userId: string, guildId: string) {
    const inventory = await this.getOrCreateBattleFishInventory(userId, guildId);
    
    return {
      ...inventory,
      items: inventory.items.map((item: any) => ({
        ...item,
        fish: {
          ...item.fish,
          name: item.fish.species,
          experienceToNext: item.fish.level >= 10 ? 0 : (item.fish.level + 1) * 10,
          traits: JSON.parse(item.fish.specialTraits || '[]'),
          stats: JSON.parse(item.fish.stats || '{}'),
          canBreed: item.fish.status === 'adult',
        },
      })),
    };
  }

  /**
   * Lấy cá từ battle fish inventory theo ID
   */
  static async getFishFromBattleInventory(userId: string, guildId: string, fishId: string) {
    const inventory = await prisma.battleFishInventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!inventory) {
      return null;
    }

    const inventoryItem = await prisma.battleFishInventoryItem.findFirst({
      where: {
        battleFishInventoryId: inventory.id,
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
        stats: JSON.parse(inventoryItem.fish.stats || '{}'),
        canBreed: inventoryItem.fish.status === 'adult',
      },
    };
  }

  /**
   * Kiểm tra xem cá có trong battle fish inventory không
   */
  static async isFishInBattleInventory(userId: string, guildId: string, fishId: string) {
    const inventory = await prisma.battleFishInventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!inventory) {
      return false;
    }

    const inventoryItem = await prisma.battleFishInventoryItem.findFirst({
      where: {
        battleFishInventoryId: inventory.id,
        fishId,
      },
    });

    return !!inventoryItem;
  }

  /**
   * Xóa cá khỏi battle fish inventory
   */
  static async removeFishFromBattleInventory(userId: string, guildId: string, fishId: string) {
    const inventory = await prisma.battleFishInventory.findUnique({
      where: { userId_guildId: { userId, guildId } },
    });

    if (!inventory) {
      return { success: false, error: 'Battle fish inventory not found!' };
    }

    const inventoryItem = await prisma.battleFishInventoryItem.findFirst({
      where: {
        battleFishInventoryId: inventory.id,
        fishId,
      },
    });

    if (!inventoryItem) {
      return { success: false, error: 'Cá không có trong túi đấu!' };
    }

    await prisma.battleFishInventoryItem.delete({
      where: { id: inventoryItem.id },
    });

    return { success: true };
  }

  /**
   * Lấy danh sách cá có thể thêm vào túi đấu (thế hệ 2+ và trưởng thành)
   */
  static async getEligibleBattleFish(userId: string, guildId: string) {
    const fish = await prisma.fish.findMany({
      where: {
        userId,
        guildId,
        generation: { gte: 2 }, // Thế hệ 2 trở lên
        status: 'adult', // Trưởng thành
      },
      orderBy: [
        { generation: 'desc' },
        { level: 'desc' },
        { value: 'desc' },
      ],
    });

    // Kiểm tra xem cá nào đã có trong battle inventory
    const battleInventory = await this.getBattleFishInventory(userId, guildId);
    const battleFishIds = battleInventory.items.map((item: any) => item.fish.id);

    // Kiểm tra xem cá nào đang được bán trên market
    const marketListings = await prisma.fishMarket.findMany({
      where: { fishId: { in: fish.map(f => f.id) } }
    });
    const marketFishIds = marketListings.map(listing => listing.fishId);

    // Lọc ra cá không trong battle inventory và không trên market
    return fish
      .filter(fish => !battleFishIds.includes(fish.id) && !marketFishIds.includes(fish.id))
      .map(fish => ({
        ...fish,
        name: fish.species,
        experienceToNext: fish.level >= 10 ? 0 : (fish.level + 1) * 10,
        traits: JSON.parse(fish.specialTraits || '[]'),
        stats: JSON.parse(fish.stats || '{}'),
        canBreed: fish.status === 'adult',
      }));
  }
} 