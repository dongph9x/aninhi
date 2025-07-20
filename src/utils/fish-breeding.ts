import prisma from './prisma';

// Định nghĩa các thuộc tính di truyền cho đấu cá
export interface FishStats {
  strength: number;      // Sức mạnh (1-100)
  agility: number;       // Thể lực/Nhanh nhẹn (1-100)
  intelligence: number;  // Trí thông minh (1-100)
  defense: number;       // Phòng thủ (1-100)
  luck: number;          // May mắn (1-100)
}

export interface FishBreedingPair {
  parent1Id: string;
  parent2Id: string;
  userId: string;
}

export class FishBreedingService {
  /**
   * Lấy bộ sưu tập cá huyền thoại của user
   */
  static async getUserFishCollection(userId: string) {
    try {
      console.log('Getting fish collection for user:', userId);
      
      let fish = await prisma.fish.findMany({
        where: { userId, rarity: 'legendary' },
        orderBy: [
          { status: 'asc' }, // growing trước, adult sau
          { level: 'desc' },
          { value: 'desc' },
        ],
      });
      
      // Nếu chưa có cá trong hệ thống nuôi, kiểm tra từ hệ thống câu cá
      if (fish.length === 0) {
        // Tìm cá huyền thoại trong CaughtFish
        const user = await prisma.user.findFirst({ where: { userId } });
        if (user) {
          const fishingData = await prisma.fishingData.findFirst({
            where: { 
              userId: userId,
              guildId: user.guildId 
            },
            include: { fish: true }
          });
          
          if (fishingData) {
            const legendaryCaughtFish = fishingData.fish.filter((f: any) => f.fishRarity === 'legendary');
            
            if (legendaryCaughtFish.length > 0) {
              // Chuyển đổi cá từ CaughtFish sang Fish
              for (const caughtFish of legendaryCaughtFish) {
                const fishData = {
                  userId,
                  guildId: user.guildId,
                  species: caughtFish.fishName,
                  level: 1, // Bắt đầu từ level 1
                  experience: 0,
                  rarity: 'legendary',
                  value: caughtFish.fishValue,
                  generation: 1,
                  specialTraits: JSON.stringify(['Caught']),
                  status: 'growing',
                  // Thêm stats mặc định cho cá mới
                  stats: JSON.stringify(this.generateEmptyStats()), // Cá thế hệ 1 không có stats
                  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước
                  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 giờ trước để có thể cho ăn ngay
                };
                
                await prisma.fish.create({ data: fishData });
              }
              
              // Lấy lại danh sách cá sau khi chuyển đổi
              fish = await prisma.fish.findMany({
                where: { userId, rarity: 'legendary' },
                orderBy: [
                  { status: 'asc' },
                  { level: 'desc' },
                  { value: 'desc' },
                ],
              });
            }
          }
        }
      }
      
      function getExpForLevel(level: number) {
        return (level + 1) * 10; // Level 1 cần 20, Level 2 cần 30, Level 3 cần 40, v.v.
      }
      
      return fish.map(fish => ({
        ...fish,
        name: fish.species,
        experienceToNext: getExpForLevel(fish.level),
        traits: JSON.parse(fish.specialTraits || '[]'),
        stats: JSON.parse(fish.stats || '{}'),
        canBreed: fish.status === 'adult',
      }));
    } catch (error) {
      console.error('Error getting user fish collection:', error);
      return [];
    }
  }

  /**
   * Tạo stats ngẫu nhiên cho cá mới
   */
  static generateRandomStats(): FishStats {
    return {
      strength: Math.floor(Math.random() * 50) + 25,      // 25-75
      agility: Math.floor(Math.random() * 50) + 25,       // 25-75
      intelligence: Math.floor(Math.random() * 50) + 25,  // 25-75
      defense: Math.floor(Math.random() * 50) + 25,       // 25-75
      luck: Math.floor(Math.random() * 50) + 25,          // 25-75
    };
  }

  /**
   * Tạo stats cho cá thế hệ 1 (không có stats)
   */
  static generateEmptyStats(): FishStats {
    return {
      strength: 0,
      agility: 0,
      intelligence: 0,
      defense: 0,
      luck: 0,
    };
  }

  /**
   * Tăng stats ngẫu nhiên khi lên cấp (1-3 điểm cho mỗi stat)
   */
  static increaseStatsOnLevelUp(currentStats: FishStats): FishStats {
    const newStats = { ...currentStats };
    
    Object.keys(newStats).forEach((stat) => {
      const increase = Math.floor(Math.random() * 3) + 1; // 1-3 điểm
      newStats[stat as keyof FishStats] = Math.min(100, newStats[stat as keyof FishStats] + increase);
    });
    
    return newStats;
  }

  /**
   * Tính toán stats di truyền từ bố mẹ
   */
  static calculateInheritedStats(parent1Stats: FishStats, parent2Stats: FishStats): FishStats {
    const inheritedStats: FishStats = {
      strength: 0,
      agility: 0,
      intelligence: 0,
      defense: 0,
      luck: 0,
    };

    // Di truyền 60% từ bố mẹ, 40% ngẫu nhiên
    const inheritanceRate = 0.6;
    const randomRate = 0.4;

    Object.keys(inheritedStats).forEach((stat) => {
      const parent1Value = parent1Stats[stat as keyof FishStats];
      const parent2Value = parent2Stats[stat as keyof FishStats];
      
      // Lấy giá trị trung bình của bố mẹ
      const averageParentValue = (parent1Value + parent2Value) / 2;
      
      // Tính giá trị di truyền
      const inheritedValue = averageParentValue * inheritanceRate;
      
      // Thêm ngẫu nhiên
      const randomValue = (Math.floor(Math.random() * 50) + 25) * randomRate;
      
      // Tổng hợp và đảm bảo trong khoảng 1-100
      const totalValue = Math.floor(inheritedValue + randomValue);
      inheritedStats[stat as keyof FishStats] = Math.max(1, Math.min(100, totalValue));
    });

    return inheritedStats;
  }

  /**
   * Cho cá ăn với thức ăn
   */
  static async feedFishWithFood(userId: string, fishId: string, foodType: 'basic' | 'premium' | 'luxury' | 'legendary') {
    const fish = await prisma.fish.findFirst({ where: { id: fishId, userId } });
    if (!fish) return { success: false, error: 'Không tìm thấy cá!' };
    
    const MAX_LEVEL = 10; // Cấp tối đa là 10
    if (fish.level >= MAX_LEVEL && fish.status === 'adult') {
      return { success: false, error: 'Cá đã trưởng thành và đạt cấp tối đa (10)!' };
    }
    
    // Kiểm tra có thức ăn không
    const { FishFoodService } = await import('./fish-food');
    const useFoodResult = await FishFoodService.useFishFood(userId, fish.guildId, foodType);
    
    if (!useFoodResult.success) {
      return { success: false, error: useFoodResult.error };
    }
    
    const expGained = useFoodResult.expBonus || 0;
    
    // Hàm tính exp cần cho level tiếp theo
    function getExpForLevel(level: number) {
      return (level + 1) * 10; // Level 1 cần 20, Level 2 cần 30, Level 3 cần 40, v.v.
    }
    
    let newExp = fish.experience + expGained;
    let newLevel = fish.level;
    let expForNext = getExpForLevel(newLevel);
    let becameAdult = false;
    
    // Lên level nếu đủ exp
    while (newExp >= expForNext && newLevel < MAX_LEVEL) {
      newExp -= expForNext;
      newLevel++;
      expForNext = getExpForLevel(newLevel);
    }
    
    // Tính giá mới (tăng 2% mỗi level)
    const valueIncrease = (newLevel - fish.level) * 0.02;
    const newValue = Math.floor(fish.value * (1 + valueIncrease));
    
    // Cập nhật stats nếu lên cấp và là cá thế hệ 2+
    let newStats = fish.stats;
    if (newLevel > fish.level && fish.generation >= 2) {
      const currentStats = JSON.parse(fish.stats || '{}');
      const updatedStats = this.increaseStatsOnLevelUp(currentStats);
      newStats = JSON.stringify(updatedStats);
    }
    
    // Cập nhật trạng thái
    let newStatus = fish.status;
    if (newLevel >= 10) {
      newStatus = 'adult';
      becameAdult = true;
    }
    
    const updated = await prisma.fish.update({
      where: { id: fishId },
      data: {
        level: newLevel,
        experience: newExp,
        value: newValue,
        status: newStatus,
        stats: newStats,
        updatedAt: new Date(),
      },
    });
    
    return {
      success: true,
      fish: {
        ...updated,
        name: updated.species,
        experienceToNext: newLevel >= MAX_LEVEL ? 0 : getExpForLevel(newLevel),
        traits: JSON.parse(updated.specialTraits || '[]'),
        stats: JSON.parse(updated.stats || '{}'),
        canBreed: updated.status === 'adult',
      },
      experienceGained: expGained,
      leveledUp: newLevel > fish.level,
      becameAdult,
      newValue,
      foodUsed: useFoodResult.foodInfo,
    };
  }

  /**
   * Cho cá ăn theo yêu cầu mới: 
   * - Normal user: random 1-5 exp, cooldown 1 giờ
   * - Admin: luôn 100 exp, bypass cooldown
   * - Max level 10
   * - Nếu exp = 0 thì bỏ qua cooldown
   */
  static async feedFish(userId: string, fishId: string, isAdmin: boolean = false) {
    const fish = await prisma.fish.findFirst({ where: { id: fishId, userId } });
    if (!fish) return { success: false, error: 'Không tìm thấy cá!' };
    if (fish.rarity !== 'legendary') return { success: false, error: 'Chỉ cá huyền thoại mới được nuôi!' };
    
    const MAX_LEVEL = 10; // Cấp tối đa là 10
    if (fish.level >= MAX_LEVEL && fish.status === 'adult') {
      return { success: false, error: 'Cá đã trưởng thành và đạt cấp tối đa (10)!' };
    }
    
    // Kiểm tra cooldown 1 giờ - chỉ áp dụng khi exp > 0 và không phải admin
    if (!isAdmin && fish.experience > 0) {
      const lastFeedTime = fish.updatedAt;
      const now = new Date();
      const timeDiff = now.getTime() - lastFeedTime.getTime();
      const oneHour = 60 * 60 * 1000; // 1 giờ = 60 * 60 * 1000 ms
      
      if (timeDiff < oneHour) {
        const remainingTime = Math.ceil((oneHour - timeDiff) / (60 * 1000)); // Phút còn lại
        return { success: false, error: `Phải đợi ${remainingTime} phút nữa mới cho cá ăn được!` };
      }
    }
    
    // Admin luôn được 100 exp, người thường random 1-5 exp
    const expGained = isAdmin ? 100 : Math.floor(Math.random() * 5) + 1;
    
    // Hàm tính exp cần cho level tiếp theo
    function getExpForLevel(level: number) {
      return (level + 1) * 10; // Level 1 cần 20, Level 2 cần 30, Level 3 cần 40, v.v.
    }
    
    let newExp = fish.experience + expGained;
    let newLevel = fish.level;
    let expForNext = getExpForLevel(newLevel);
    let becameAdult = false;
    
    // Lên level nếu đủ exp
    while (newExp >= expForNext && newLevel < MAX_LEVEL) {
      newExp -= expForNext;
      newLevel++;
      expForNext = getExpForLevel(newLevel);
    }
    
    // Tính giá mới (tăng 2% mỗi level)
    const valueIncrease = (newLevel - fish.level) * 0.02;
    const newValue = Math.floor(fish.value * (1 + valueIncrease));
    
    // Cập nhật stats nếu lên cấp và là cá thế hệ 2+
    let newStats = fish.stats;
    if (newLevel > fish.level && fish.generation >= 2) {
      const currentStats = JSON.parse(fish.stats || '{}');
      const updatedStats = this.increaseStatsOnLevelUp(currentStats);
      newStats = JSON.stringify(updatedStats);
    }
    
    // Cập nhật trạng thái
    let newStatus = fish.status;
    if (newLevel >= 10) {
      newStatus = 'adult';
      becameAdult = true;
    }
    
    const updated = await prisma.fish.update({
      where: { id: fishId },
      data: {
        level: newLevel,
        experience: newExp,
        value: newValue,
        status: newStatus,
        stats: newStats,
        updatedAt: new Date(),
      },
    });
    
    return {
      success: true,
      fish: {
        ...updated,
        name: updated.species,
        experienceToNext: newLevel >= MAX_LEVEL ? 0 : getExpForLevel(newLevel),
        traits: JSON.parse(updated.specialTraits || '[]'),
        stats: JSON.parse(updated.stats || '{}'),
        canBreed: updated.status === 'adult',
      },
      experienceGained: expGained,
      leveledUp: newLevel > fish.level,
      becameAdult,
      newValue,
    };
  }

  /**
   * Lấy thông tin cá theo ID
   */
  static async getFishById(userId: string, fishId: string) {
    const fish = await prisma.fish.findFirst({
      where: { 
        id: fishId,
        userId: userId 
      }
    });
    
    if (!fish) return null;
    
    function getExpForLevel(level: number) {
      return (level + 1) * 10; // Level 1 cần 20, Level 2 cần 30, Level 3 cần 40, v.v.
    }
    
    return {
      ...fish,
      name: fish.species,
      experienceToNext: fish.level >= 10 ? 0 : getExpForLevel(fish.level),
      traits: JSON.parse(fish.specialTraits || '[]'),
      stats: JSON.parse(fish.stats || '{}'),
      canBreed: fish.status === 'adult',
    };
  }

  /**
   * Lai tạo cá với chọn bố mẹ thủ công
   */
  static async breedFish(userId: string, fish1Id: string, fish2Id: string) {
    const fish1 = await prisma.fish.findFirst({ where: { id: fish1Id, userId } });
    const fish2 = await prisma.fish.findFirst({ where: { id: fish2Id, userId } });
    
    if (!fish1 || !fish2) return { success: false, error: 'Không tìm thấy cá!' };
    if (fish1.rarity !== 'legendary' || fish2.rarity !== 'legendary') return { success: false, error: 'Chỉ cá huyền thoại mới được lai tạo!' };
    if (fish1.status !== 'adult' || fish2.status !== 'adult') return { success: false, error: 'Chỉ cá trưởng thành mới được lai tạo!' };
    if (fish1Id === fish2Id) return { success: false, error: 'Không thể lai tạo cá với chính nó!' };
    if (fish1.generation !== fish2.generation) return { success: false, error: 'Chỉ cá cùng thế hệ mới được lai tạo với nhau!' };
    
    // Lấy stats của bố mẹ
    const parent1Stats: FishStats = JSON.parse(fish1.stats || '{}');
    const parent2Stats: FishStats = JSON.parse(fish2.stats || '{}');
    
    // Tính toán stats di truyền
    const inheritedStats = this.calculateInheritedStats(parent1Stats, parent2Stats);
    
    // Tạo tên cá con (kết hợp tên bố mẹ)
    const offspringSpecies = this.generateOffspringName(fish1.species, fish2.species);
    
    // Tính giá trị cá con (trung bình + bonus ngẫu nhiên)
    const baseValue = Math.floor((fish1.value + fish2.value) / 2);
    const valueBonus = Math.floor(Math.random() * 1000) + 500; // +500-1500
    const offspringValue = baseValue + valueBonus;
    
    // Tạo traits di truyền
    const parent1Traits = JSON.parse(fish1.specialTraits || '[]');
    const parent2Traits = JSON.parse(fish2.specialTraits || '[]');
    const inheritedTraits = this.inheritTraits(parent1Traits, parent2Traits);
    
    const offspring = await prisma.fish.create({
      data: {
        userId,
        guildId: fish1.guildId,
        species: offspringSpecies,
        level: 1,
        experience: 0,
        rarity: 'legendary',
        value: offspringValue,
        generation: Math.max(fish1.generation, fish2.generation) + 1,
        specialTraits: JSON.stringify(inheritedTraits),
        stats: JSON.stringify(inheritedStats),
        status: 'growing',
      }
    });
    
    // Xóa cá bố mẹ sau khi lai tạo thành công
    await prisma.fish.delete({ where: { id: fish1Id } });
    await prisma.fish.delete({ where: { id: fish2Id } });
    
    // Ghi lại lịch sử lai tạo
    await prisma.breedingHistory.create({
      data: {
        userId,
        guildId: fish1.guildId,
        parent1Id: fish1Id,
        parent2Id: fish2Id,
        offspringId: offspring.id,
        success: true,
        notes: `Lai tạo thành công: ${fish1.species} + ${fish2.species} = ${offspringSpecies}`
      }
    });
    
    return {
      success: true,
      parent1: { 
        ...fish1, 
        name: fish1.species,
        stats: parent1Stats
      },
      parent2: { 
        ...fish2, 
        name: fish2.species,
        stats: parent2Stats
      },
      offspring: {
        ...offspring,
        name: offspring.species,
        experienceToNext: 20,
        traits: inheritedTraits,
        stats: inheritedStats,
        canBreed: false,
      }
    };
  }

  /**
   * Tạo tên cá con từ tên bố mẹ
   */
  static generateOffspringName(parent1Name: string, parent2Name: string): string {
    const prefixes = ['Baby', 'Young', 'Little', 'Tiny', 'Mini'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    // Lấy từ đầu tiên của tên bố mẹ
    const parent1First = parent1Name.split(' ')[0];
    const parent2First = parent2Name.split(' ')[0];
    
    // Kết hợp tên
    if (Math.random() > 0.5) {
      return `${prefix} ${parent1First} ${parent2First}`;
    } else {
      return `${prefix} ${parent2First} ${parent1First}`;
    }
  }

  /**
   * Di truyền traits từ bố mẹ
   */
  static inheritTraits(parent1Traits: string[], parent2Traits: string[]): string[] {
    const allTraits = [...new Set([...parent1Traits, ...parent2Traits])];
    const inheritedTraits: string[] = [];
    
    // 70% khả năng di truyền mỗi trait
    allTraits.forEach(trait => {
      if (Math.random() < 0.7) {
        inheritedTraits.push(trait);
      }
    });
    
    // Thêm trait "Bred" để đánh dấu cá được lai tạo
    inheritedTraits.push('Bred');
    
    return inheritedTraits;
  }

  /**
   * Lấy danh sách cá có thể lai tạo (trưởng thành, nhóm theo thế hệ)
   */
  static async getBreedableFish(userId: string) {
    const fish = await prisma.fish.findMany({
      where: { 
        userId, 
        rarity: 'legendary',
        status: 'adult'
      },
      orderBy: [
        { generation: 'asc' },
        { level: 'desc' },
        { value: 'desc' },
      ],
    });
    
    // Nhóm cá theo thế hệ
    const fishByGeneration: { [generation: number]: any[] } = {};
    
    fish.forEach(fish => {
      const generation = fish.generation;
      if (!fishByGeneration[generation]) {
        fishByGeneration[generation] = [];
      }
      
      fishByGeneration[generation].push({
        ...fish,
        name: fish.species,
        stats: JSON.parse(fish.stats || '{}'),
        traits: JSON.parse(fish.specialTraits || '[]'),
      });
    });
    
    return fishByGeneration;
  }

  /**
   * Tính tổng sức mạnh của cá (tổng các stats)
   */
  static calculateTotalPower(fish: any): number {
    const stats = fish.stats || {};
    const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
    return totalPower;
  }

  /**
   * Tính tổng sức mạnh với level bonus (cho đấu cá)
   */
  static calculateTotalPowerWithLevel(fish: any): number {
    const stats = fish.stats || {};
    const basePower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
    const levelBonus = (fish.level - 1) * 10; // +10 power mỗi level
    return basePower + levelBonus;
  }

  /**
   * Sell fish
   */
  static async sellFish(userId: string, fishId: string) {
    const fish = await prisma.fish.findFirst({
      where: { id: fishId, userId }
    });
    
    if (!fish) {
      return { success: false, error: 'Fish not found or doesn\'t belong to you!' };
    }
    
    // Kiểm tra xem cá có trong battle inventory không
    const isInBattleInventory = await prisma.battleFishInventoryItem.findFirst({
      where: { fishId },
    });

    if (isInBattleInventory) {
      return { success: false, error: 'Không thể bán cá đang trong túi đấu! Hãy xóa cá khỏi túi đấu trước.' };
    }
    
    // Get user balance
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId: fish.guildId } }
    });
    
    if (!user) {
      return { success: false, error: 'User not found!' };
    }
    
    // Delete fish and update balance
    await prisma.fish.delete({ where: { id: fishId } });
    
    const newBalance = user.balance + fish.value;
    await prisma.user.update({
      where: { userId_guildId: { userId, guildId: fish.guildId } },
      data: { balance: newBalance }
    });
    
    return {
      success: true,
      fish: { ...fish, name: fish.species },
      coinsEarned: fish.value,
      newBalance
    };
  }

  /**
   * Get market fish
   */
  static async getMarketFish() {
    const marketFish = await prisma.fishMarket.findMany({
      include: {
        fish: true,
      },
      orderBy: [
        { price: 'asc' },
        { listedAt: 'desc' },
      ],
    });
    
    return marketFish.map(item => ({
      ...item,
      fish: {
        ...item.fish,
        name: item.fish.species,
        experienceToNext: (item.fish.level + 1) * 10,
        traits: JSON.parse(item.fish.specialTraits || '[]'),
        stats: JSON.parse(item.fish.stats || '{}'),
        canBreed: item.fish.status === 'adult',
      }
    }));
  }

  /**
   * Buy fish from market
   */
  static async buyFishFromMarket(userId: string, fishId: string) {
    const marketItem = await prisma.fishMarket.findFirst({
      where: { fishId },
      include: { fish: true }
    });
    
    if (!marketItem) {
      return { success: false, error: 'Fish not found in market!' };
    }
    
    if (marketItem.sellerId === userId) {
      return { success: false, error: 'You cannot buy your own fish!' };
    }
    
    // Check if user has enough money
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId: marketItem.guildId } }
    });
    
    if (!user || user.balance < marketItem.price) {
      return { success: false, error: 'Not enough money!' };
    }
    
    // Transfer fish and money
    await prisma.fish.update({
      where: { id: fishId },
      data: { userId, guildId: marketItem.guildId }
    });
    
    await prisma.user.update({
      where: { userId_guildId: { userId, guildId: marketItem.guildId } },
      data: { balance: { decrement: marketItem.price } }
    });
    
    await prisma.user.update({
      where: { userId_guildId: { userId: marketItem.sellerId, guildId: marketItem.guildId } },
      data: { balance: { increment: marketItem.price } }
    });
    
    // Remove from market
    await prisma.fishMarket.delete({
      where: { fishId }
    });
    
    return {
      success: true,
      fish: {
        ...marketItem.fish,
        name: marketItem.fish.species,
        experienceToNext: marketItem.fish.level * 10,
        traits: JSON.parse(marketItem.fish.specialTraits || '[]'),
        stats: JSON.parse(marketItem.fish.stats || '{}'),
        canBreed: marketItem.fish.status === 'adult',
      },
      price: marketItem.price
    };
  }
} 