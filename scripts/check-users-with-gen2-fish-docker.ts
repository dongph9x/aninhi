import { PrismaClient } from '@prisma/client';

// Kết nối với database trong Docker container
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "file:/app/prisma/data/database.db"
    }
  }
});

async function checkUsersWithGen2FishDocker() {
  console.log('🔍 Kiểm Tra User Có Cá Gen 2 (Docker Database)\n');

  try {
    // 1. Kiểm tra kết nối database
    console.log('1️⃣ Kiểm Tra Kết Nối Database Docker:');
    
    await prisma.$connect();
    console.log('   ✅ Kết nối database Docker thành công');

    // 2. Thống kê tổng quan
    console.log('\n2️⃣ Thống Kê Tổng Quan:');
    
    const totalUsers = await prisma.user.count();
    const totalFish = await prisma.fish.count();
    
    console.log(`   👥 Tổng số user: ${totalUsers}`);
    console.log(`   🐟 Tổng số cá: ${totalFish}`);

    // 3. Thống kê theo generation
    console.log('\n3️⃣ Thống Kê Theo Generation:');
    
    const fishByGeneration = await prisma.fish.groupBy({
      by: ['generation'],
      _count: {
        id: true
      },
      orderBy: {
        generation: 'asc'
      }
    });

    fishByGeneration.forEach(group => {
      console.log(`   Gen ${group.generation}: ${group._count.id} con cá`);
    });

    // 4. Tìm user có cá gen 2
    console.log('\n4️⃣ Tìm User Có Cá Gen 2:');
    
    // Tìm tất cả cá gen 2
    const gen2Fish = await prisma.fish.findMany({
      where: {
        generation: 2
      },
      select: {
        id: true,
        userId: true,
        guildId: true,
        species: true,
        level: true,
        rarity: true,
        value: true,
        status: true,
        createdAt: true
      },
      orderBy: [
        { userId: 'asc' },
        { createdAt: 'desc' }
      ]
    });

    if (gen2Fish.length === 0) {
      console.log('   ✅ Không có cá gen 2 nào');
    } else {
      // Nhóm theo user
      const fishByUser = gen2Fish.reduce((acc, fish) => {
        const key = `${fish.userId}-${fish.guildId}`;
        if (!acc[key]) {
          acc[key] = {
            userId: fish.userId,
            guildId: fish.guildId,
            fish: []
          };
        }
        acc[key].fish.push(fish);
        return acc;
      }, {} as Record<string, any>);

      console.log(`   📊 Tìm thấy ${Object.keys(fishByUser).length} user có cá gen 2:`);
      
      // Lấy thông tin user cho mỗi user có cá gen 2
      for (const userKey of Object.keys(fishByUser)) {
        const userData = fishByUser[userKey];
        const user = await prisma.user.findUnique({
          where: {
            userId_guildId: {
              userId: userData.userId,
              guildId: userData.guildId
            }
          },
          select: {
            balance: true,
            dailyStreak: true
          }
        });

        console.log(`\n   👤 User: ${userData.userId} (Guild: ${userData.guildId})`);
        if (user) {
          console.log(`      💰 Balance: ${user.balance.toLocaleString()} coins`);
          console.log(`      🔥 Daily Streak: ${user.dailyStreak} ngày`);
        }
        console.log(`      🐟 Cá Gen 2 (${userData.fish.length} con):`);
        
        userData.fish.forEach((fish: any, fishIndex: number) => {
          console.log(`        ${fishIndex + 1}. ${fish.species} - Level ${fish.level} - ${fish.rarity} - ${fish.value.toLocaleString()} coins - ${fish.status}`);
        });
      }
    }

    // 5. Tìm user có cá gen 3+
    console.log('\n5️⃣ Tìm User Có Cá Gen 3+:');
    
    // Tìm tất cả cá gen 3+
    const gen3PlusFish = await prisma.fish.findMany({
      where: {
        generation: {
          gte: 3
        }
      },
      select: {
        id: true,
        userId: true,
        guildId: true,
        species: true,
        generation: true,
        level: true,
        rarity: true,
        value: true,
        status: true
      },
      orderBy: [
        { userId: 'asc' },
        { generation: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    if (gen3PlusFish.length === 0) {
      console.log('   ✅ Không có cá gen 3+ nào');
    } else {
      // Nhóm theo user
      const fishByUser = gen3PlusFish.reduce((acc, fish) => {
        const key = `${fish.userId}-${fish.guildId}`;
        if (!acc[key]) {
          acc[key] = {
            userId: fish.userId,
            guildId: fish.guildId,
            fish: []
          };
        }
        acc[key].fish.push(fish);
        return acc;
      }, {} as Record<string, any>);

      console.log(`   📊 Tìm thấy ${Object.keys(fishByUser).length} user có cá gen 3+:`);
      
      // Lấy thông tin user cho mỗi user có cá gen 3+
      for (const userKey of Object.keys(fishByUser)) {
        const userData = fishByUser[userKey];
        
        console.log(`\n   👤 User: ${userData.userId} (Guild: ${userData.guildId})`);
        console.log(`      🐟 Cá Gen 3+ (${userData.fish.length} con):`);
        
        // Nhóm theo generation
        const fishByGen = userData.fish.reduce((acc: any, fish: any) => {
          if (!acc[fish.generation]) {
            acc[fish.generation] = [];
          }
          acc[fish.generation].push(fish);
          return acc;
        }, {} as Record<number, any[]>);

        Object.entries(fishByGen).forEach(([gen, fishes]) => {
          console.log(`        Gen ${gen} (${fishes.length} con):`);
          fishes.forEach((fish: any, fishIndex: number) => {
            console.log(`          ${fishIndex + 1}. ${fish.species} - Level ${fish.level} - ${fish.rarity} - ${fish.value.toLocaleString()} coins - ${fish.status}`);
          });
        });
      }
    }

    // 6. Thống kê chi tiết theo rarity
    console.log('\n6️⃣ Thống Kê Chi Tiết Theo Rarity:');
    
    const fishByRarity = await prisma.fish.groupBy({
      by: ['rarity', 'generation'],
      _count: {
        id: true
      },
      orderBy: [
        { rarity: 'asc' },
        { generation: 'asc' }
      ]
    });

    const rarityStats = fishByRarity.reduce((acc, group) => {
      if (!acc[group.rarity]) {
        acc[group.rarity] = {};
      }
      acc[group.rarity][group.generation] = group._count.id;
      return acc;
    }, {} as Record<string, Record<number, number>>);

    Object.entries(rarityStats).forEach(([rarity, generations]) => {
      console.log(`\n   ${getRarityEmoji(rarity)} ${rarity.toUpperCase()}:`);
      Object.entries(generations).forEach(([gen, count]) => {
        console.log(`     Gen ${gen}: ${count} con`);
      });
    });

    // 7. Top 10 user có nhiều cá nhất
    console.log('\n7️⃣ Top 10 User Có Nhiều Cá Nhất:');
    
    // Đếm số cá theo user
    const fishCountByUser = await prisma.fish.groupBy({
      by: ['userId', 'guildId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    // Lấy top 10
    const top10Users = fishCountByUser.slice(0, 10);
    
    if (top10Users.length === 0) {
      console.log('   ✅ Không có user nào có cá');
    } else {
      // Lấy thông tin chi tiết cho top 10
      for (let i = 0; i < top10Users.length; i++) {
        const userData = top10Users[i];
        const user = await prisma.user.findUnique({
          where: {
            userId_guildId: {
              userId: userData.userId,
              guildId: userData.guildId
            }
          },
          select: {
            balance: true
          }
        });

        console.log(`   ${i + 1}. ${userData.userId} (Guild: ${userData.guildId}) - ${userData._count.id} con cá${user ? ` - ${user.balance.toLocaleString()} coins` : ''}`);
      }
    }

    // 8. Kiểm tra breeding history
    console.log('\n8️⃣ Kiểm Tra Breeding History:');
    
    const breedingHistory = await prisma.breedingHistory.findMany({
      select: {
        id: true,
        userId: true,
        guildId: true,
        parent1Id: true,
        parent2Id: true,
        offspringId: true,
        bredAt: true,
        success: true
      },
      orderBy: {
        bredAt: 'desc'
      }
    });

    if (breedingHistory.length === 0) {
      console.log('   ✅ Không có lịch sử lai tạo nào');
    } else {
      console.log(`   📊 Có ${breedingHistory.length} lần lai tạo:`);
      
      breedingHistory.slice(0, 5).forEach((record, index) => {
        console.log(`\n   ${index + 1}. User: ${record.userId} (Guild: ${record.guildId})`);
        console.log(`      🐟 Parent 1: ${record.parent1Id}`);
        console.log(`      🐟 Parent 2: ${record.parent2Id}`);
        console.log(`      🐟 Offspring: ${record.offspringId}`);
        console.log(`      ✅ Success: ${record.success}`);
        console.log(`      📅 Bred At: ${record.bredAt.toLocaleString()}`);
      });
      
      if (breedingHistory.length > 5) {
        console.log(`      ... và ${breedingHistory.length - 5} lần khác`);
      }
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra user có cá gen 2 (Docker):', error);
  } finally {
    await prisma.$disconnect();
  }
}

function getRarityEmoji(rarity: string): string {
  switch (rarity) {
    case 'common': return '🐟';
    case 'uncommon': return '🐠';
    case 'rare': return '🐡';
    case 'epic': return '🦈';
    case 'legendary': return '🐋';
    default: return '🐟';
  }
}

// Chạy script
checkUsersWithGen2FishDocker(); 