import prisma from './prisma';
import { ecommerceDB } from './ecommerce-db';

// Định nghĩa các loại thức ăn
export const FISH_FOOD_TYPES = {
  basic: {
    name: 'Thức Ăn Cơ Bản',
    emoji: '🍞',
    price: 10000,
    expBonus: 1,
    description: 'Thức ăn cơ bản cho cá, tăng 1 exp'
  },
  premium: {
    name: 'Thức Ăn Cao Cấp',
    emoji: '🥩',
    price: 30000,
    expBonus: 3,
    description: 'Thức ăn cao cấp, tăng 3 exp'
  },
  luxury: {
    name: 'Thức Ăn Xa Xỉ',
    emoji: '🦐',
    price: 50000,
    expBonus: 5,
    description: 'Thức ăn xa xỉ, tăng 5 exp'
  },
  legendary: {
    name: 'Thức Ăn Huyền Thoại',
    emoji: '🌟',
    price: 100000,
    expBonus: 10,
    description: 'Thức ăn huyền thoại, tăng 10 exp'
  }
} as const;

export type FishFoodType = keyof typeof FISH_FOOD_TYPES;

export class FishFoodService {
  /**
   * Lấy danh sách thức ăn của user
   */
  static async getUserFishFood(userId: string, guildId: string) {
    const fishFood = await prisma.fishFood.findMany({
      where: {
        userId,
        guildId
      },
      orderBy: {
        foodType: 'asc'
      }
    });

    return fishFood.map(item => ({
      ...item,
      foodInfo: FISH_FOOD_TYPES[item.foodType as FishFoodType]
    }));
  }

  /**
   * Mua thức ăn
   */
  static async buyFishFood(userId: string, guildId: string, foodType: FishFoodType, quantity: number = 1) {
    // Kiểm tra loại thức ăn có tồn tại không
    if (!FISH_FOOD_TYPES[foodType]) {
      return { success: false, error: 'Loại thức ăn không tồn tại!' };
    }

    const foodInfo = FISH_FOOD_TYPES[foodType];
    const totalCost = foodInfo.price * quantity;

    // Kiểm tra số dư
    const user = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });

    if (!user) {
      return { success: false, error: 'User không tồn tại!' };
    }

    if (user.balance < totalCost) {
      return { success: false, error: `Không đủ tiền! Cần ${totalCost.toLocaleString()} coins, hiện có ${user.balance.toLocaleString()} coins` };
    }

    // Trừ tiền
    await ecommerceDB.subtractMoney(userId, guildId, totalCost, 'buy_fish_food');

    // Thêm thức ăn vào inventory
    const existingFood = await prisma.fishFood.findUnique({
      where: {
        userId_guildId_foodType: {
          userId,
          guildId,
          foodType
        }
      }
    });

    if (existingFood) {
      // Cập nhật số lượng
      await prisma.fishFood.update({
        where: { id: existingFood.id },
        data: { quantity: existingFood.quantity + quantity }
      });
    } else {
      // Tạo mới
      await prisma.fishFood.create({
        data: {
          userId,
          guildId,
          foodType,
          quantity
        }
      });
    }

    return {
      success: true,
      foodType,
      quantity,
      totalCost,
      foodInfo
    };
  }

  /**
   * Sử dụng thức ăn
   */
  static async useFishFood(userId: string, guildId: string, foodType: FishFoodType) {
    // Kiểm tra có thức ăn không
    const fishFood = await prisma.fishFood.findUnique({
      where: {
        userId_guildId_foodType: {
          userId,
          guildId,
          foodType
        }
      }
    });

    if (!fishFood || fishFood.quantity <= 0) {
      return { success: false, error: 'Không có thức ăn này!' };
    }

    // Giảm số lượng
    await prisma.fishFood.update({
      where: { id: fishFood.id },
      data: { quantity: fishFood.quantity - 1 }
    });

    const foodInfo = FISH_FOOD_TYPES[foodType];

    return {
      success: true,
      foodType,
      expBonus: foodInfo.expBonus,
      foodInfo
    };
  }

  /**
   * Lấy thông tin thức ăn
   */
  static getFoodInfo(foodType: FishFoodType) {
    return FISH_FOOD_TYPES[foodType];
  }

  /**
   * Lấy tất cả loại thức ăn
   */
  static getAllFoodTypes() {
    return FISH_FOOD_TYPES;
  }
} 