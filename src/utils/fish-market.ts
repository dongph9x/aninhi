import prisma from './prisma';

export class FishMarketService {
  /**
   * Lấy danh sách cá đang bán trong market
   */
  static async getMarketListings(guildId: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const listings = await prisma.fishMarket.findMany({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        fish: true
      },
      orderBy: {
        listedAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const total = await prisma.fishMarket.count({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    return {
      listings: listings.map(listing => ({
        ...listing,
        fish: {
          ...listing.fish,
          name: listing.fish.species,
          stats: JSON.parse(listing.fish.stats || '{}'),
          traits: JSON.parse(listing.fish.specialTraits || '[]')
        }
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Lấy danh sách cá của user đang bán
   */
  static async getUserListings(userId: string, guildId: string) {
    const listings = await prisma.fishMarket.findMany({
      where: {
        sellerId: userId,
        guildId
      },
      include: {
        fish: true
      },
      orderBy: {
        listedAt: 'desc'
      }
    });

    return listings.map(listing => ({
      ...listing,
      fish: {
        ...listing.fish,
        name: listing.fish.species,
        stats: JSON.parse(listing.fish.stats || '{}'),
        traits: JSON.parse(listing.fish.specialTraits || '[]')
      }
    }));
  }

  /**
   * Treo bán cá
   */
  static async listFish(userId: string, guildId: string, fishId: string, price: number, duration: number = 24) {
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

    // Kiểm tra cá có đang trong battle inventory không
    const isInBattleInventory = await prisma.battleFishInventoryItem.findFirst({
      where: { fishId }
    });

    if (isInBattleInventory) {
      return { success: false, error: 'Không thể bán cá đang trong túi đấu! Hãy xóa cá khỏi túi đấu trước.' };
    }

    // Kiểm tra cá đã được treo bán chưa
    const existingListing = await prisma.fishMarket.findFirst({
      where: { fishId }
    });

    if (existingListing) {
      return { success: false, error: 'Cá này đã được treo bán rồi!' };
    }

    // Kiểm tra giá
    if (price <= 0) {
      return { success: false, error: 'Giá phải lớn hơn 0!' };
    }

    // Tính thời gian hết hạn (mặc định 24 giờ)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + duration);

    // Tạo listing
    const listing = await prisma.fishMarket.create({
      data: {
        fishId,
        sellerId: userId,
        guildId,
        price,
        expiresAt
      },
      include: {
        fish: true
      }
    });

    return {
      success: true,
      listing: {
        ...listing,
        fish: {
          ...listing.fish,
          name: listing.fish.species,
          stats: JSON.parse(listing.fish.stats || '{}'),
          traits: JSON.parse(listing.fish.specialTraits || '[]')
        }
      }
    };
  }

  /**
   * Hủy listing
   */
  static async cancelListing(userId: string, guildId: string, fishId: string) {
    const listing = await prisma.fishMarket.findFirst({
      where: {
        fishId,
        sellerId: userId,
        guildId
      }
    });

    if (!listing) {
      return { success: false, error: 'Không tìm thấy listing này!' };
    }

    await prisma.fishMarket.delete({
      where: { id: listing.id }
    });

    return { success: true };
  }

  /**
   * Mua cá từ market
   */
  static async buyFish(userId: string, guildId: string, fishId: string) {
    const listing = await prisma.fishMarket.findFirst({
      where: {
        fishId,
        guildId,
        expiresAt: {
          gt: new Date()
        }
      },
      include: {
        fish: true
      }
    });

    if (!listing) {
      return { success: false, error: 'Cá không có trong market hoặc đã hết hạn!' };
    }

    if (listing.sellerId === userId) {
      return { success: false, error: 'Bạn không thể mua cá của chính mình!' };
    }

    // Kiểm tra số dư
    const buyer = await prisma.user.findUnique({
      where: { userId_guildId: { userId, guildId } }
    });

    if (!buyer || buyer.balance < listing.price) {
      return { success: false, error: 'Không đủ tiền để mua cá này!' };
    }

    // Thực hiện giao dịch
    await prisma.$transaction(async (tx) => {
      // Chuyển cá cho người mua
      await tx.fish.update({
        where: { id: fishId },
        data: { userId, guildId }
      });

      // Trừ tiền người mua
      await tx.user.update({
        where: { userId_guildId: { userId, guildId } },
        data: { balance: { decrement: listing.price } }
      });

      // Cộng tiền người bán
      await tx.user.update({
        where: { userId_guildId: { userId: listing.sellerId, guildId } },
        data: { balance: { increment: listing.price } }
      });

      // Xóa listing
      await tx.fishMarket.delete({
        where: { id: listing.id }
      });
    });

    return {
      success: true,
      fish: {
        ...listing.fish,
        name: listing.fish.species,
        stats: JSON.parse(listing.fish.stats || '{}'),
        traits: JSON.parse(listing.fish.specialTraits || '[]')
      },
      price: listing.price
    };
  }

  /**
   * Tìm kiếm cá trong market
   */
  static async searchFish(guildId: string, query: string, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const listings = await prisma.fishMarket.findMany({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        },
        fish: {
          species: {
            contains: query
          }
        }
      },
      include: {
        fish: true
      },
      orderBy: {
        listedAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const total = await prisma.fishMarket.count({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        },
        fish: {
          species: {
            contains: query
          }
        }
      }
    });

    return {
      listings: listings.map(listing => ({
        ...listing,
        fish: {
          ...listing.fish,
          name: listing.fish.species,
          stats: JSON.parse(listing.fish.stats || '{}'),
          traits: JSON.parse(listing.fish.specialTraits || '[]')
        }
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Lọc cá theo thế hệ và giá
   */
  static async filterFish(guildId: string, generation?: number, minPrice?: number, maxPrice?: number, page: number = 1, limit: number = 10) {
    const offset = (page - 1) * limit;
    
    const where: any = {
      guildId,
      expiresAt: {
        gt: new Date()
      }
    };

    if (generation) {
      where.fish = { generation };
    }

    if (minPrice !== undefined) {
      where.price = { gte: minPrice };
    }

    if (maxPrice !== undefined) {
      where.price = { ...where.price, lte: maxPrice };
    }

    const listings = await prisma.fishMarket.findMany({
      where,
      include: {
        fish: true
      },
      orderBy: {
        listedAt: 'desc'
      },
      skip: offset,
      take: limit
    });

    const total = await prisma.fishMarket.count({ where });

    return {
      listings: listings.map(listing => ({
        ...listing,
        fish: {
          ...listing.fish,
          name: listing.fish.species,
          stats: JSON.parse(listing.fish.stats || '{}'),
          traits: JSON.parse(listing.fish.specialTraits || '[]')
        }
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Dọn dẹp listings hết hạn
   */
  static async cleanupExpiredListings() {
    const expiredListings = await prisma.fishMarket.findMany({
      where: {
        expiresAt: {
          lt: new Date()
        }
      }
    });

    if (expiredListings.length > 0) {
      await prisma.fishMarket.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
    }

    return expiredListings.length;
  }

  /**
   * Lấy thống kê market
   */
  static async getMarketStats(guildId: string) {
    const totalListings = await prisma.fishMarket.count({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    const totalValue = await prisma.fishMarket.aggregate({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        }
      },
      _sum: {
        price: true
      }
    });

    const avgPrice = await prisma.fishMarket.aggregate({
      where: {
        guildId,
        expiresAt: {
          gt: new Date()
        }
      },
      _avg: {
        price: true
      }
    });

    return {
      totalListings,
      totalValue: totalValue._sum.price || 0,
      averagePrice: Math.round(avgPrice._avg.price || 0)
    };
  }
} 