import prisma from './prisma';

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
        canBreed: fish.status === 'adult',
      }));
    } catch (e) {
      console.error('Error in getUserFishCollection:', e);
      return [];
    }
  }

  /**
   * Chỉ cho phép nuôi 1 cá huyền thoại chưa trưởng thành
   */
  static async canRaiseLegendary(userId: string) {
    const growing = await prisma.fish.findFirst({
      where: { userId, rarity: 'legendary', status: 'growing' },
    });
    return !growing;
  }

  /**
   * Cho cá ăn theo yêu cầu mới: random 1-5 exp, max level 10, cooldown 1 giờ
   * Nếu exp = 0 thì bỏ qua cooldown
   * Nếu isAdmin = true thì bỏ qua cooldown
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
    
    // Random exp từ 1-5
    const expGained = Math.floor(Math.random() * 5) + 1;
    
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
      canBreed: fish.status === 'adult',
    };
  }

  /**
   * Breed chỉ cho phép cá trưởng thành
   */
  static async breedFish(userId: string, fish1Id: string, fish2Id: string) {
    const fish1 = await prisma.fish.findFirst({ where: { id: fish1Id, userId } });
    const fish2 = await prisma.fish.findFirst({ where: { id: fish2Id, userId } });
    if (!fish1 || !fish2) return { success: false, error: 'Không tìm thấy cá!' };
    if (fish1.rarity !== 'legendary' || fish2.rarity !== 'legendary') return { success: false, error: 'Chỉ cá huyền thoại mới được lai tạo!' };
    if (fish1.status !== 'adult' || fish2.status !== 'adult') return { success: false, error: 'Chỉ cá trưởng thành mới được lai tạo!' };
    
    // Simple breeding logic for Phase 1
    const offspringSpecies = fish1.species;
    const offspringValue = Math.floor((fish1.value + fish2.value) / 2);
    
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
        specialTraits: JSON.stringify([]),
        status: 'growing',
      }
    });
    
    return {
      success: true,
      parent1: { ...fish1, name: fish1.species },
      parent2: { ...fish2, name: fish2.species },
      offspring: {
        ...offspring,
        name: offspring.species,
        experienceToNext: 20,
        traits: [],
        canBreed: false,
      }
    };
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
    
    // Get user balance
    const user = await prisma.user.findFirst({
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
    const user = await prisma.user.findFirst({
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
        canBreed: marketItem.fish.status === 'adult',
      },
      price: marketItem.price
    };
  }
} 