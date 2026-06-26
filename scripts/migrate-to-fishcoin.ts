import prisma from '../src/utils/prisma';
import { fishCoinDB } from '../src/utils/fish-coin';

async function migrateToFishCoin() {
  console.log('🔄 Migrating to FishCoin System...\n');

  try {
    // 1. Kiểm tra database
    console.log('1. Checking database...');
    const userCount = await prisma.user.count();
    const fishCount = await prisma.fish.count();
    const fishMarketCount = await prisma.fishMarket.count();
    const fishFoodCount = await prisma.fishFood.count();
    
    console.log('✅ Database stats:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Fish: ${fishCount}`);
    console.log(`   Fish Market listings: ${fishMarketCount}`);
    console.log(`   Fish Food items: ${fishFoodCount}`);

    // 2. Tạo FishCoin cho tất cả users hiện tại
    console.log('\n2. Initializing FishCoin for existing users...');
    const users = await prisma.user.findMany();
    
    for (const user of users) {
      // Kiểm tra xem user đã có fishBalance chưa
      if (user.fishBalance === undefined || user.fishBalance === null) {
        await prisma.user.update({
          where: { id: user.id },
          data: { fishBalance: 0n }
        });
        console.log(`   ✅ Initialized FishCoin for user ${user.userId}`);
      }
    }

    // 3. Tạo FishCoin starter bonus cho users có cá
    console.log('\n3. Giving starter FishCoin to users with fish...');
    const usersWithFish = await prisma.user.findMany({
      where: {
        fish: {
          some: {}
        }
      },
      include: {
        fish: true
      }
    });

    for (const user of usersWithFish) {
      const fishCount = user.fish.length;
      const starterBonus = fishCount * 100; // 100 FishCoin per fish
      
      await fishCoinDB.addFishCoin(
        user.userId,
        user.guildId,
        starterBonus,
        `Starter bonus for ${fishCount} fish`
      );
      
      console.log(`   ✅ User ${user.userId}: +${starterBonus} FishCoin (${fishCount} fish)`);
    }

    // 4. Tạo FishCoin cho users có fish food
    console.log('\n4. Giving FishCoin to users with fish food...');
    const usersWithFood = await prisma.user.findMany({
      where: {
        fishFood: {
          some: {}
        }
      },
      include: {
        fishFood: true
      }
    });

    for (const user of usersWithFood) {
      const totalFoodValue = user.fishFood.reduce((sum, food) => {
        const foodPrices = {
          basic: 100,
          premium: 300,
          luxury: 500,
          legendary: 1000
        };
        return sum + (foodPrices[food.foodType as keyof typeof foodPrices] || 0) * food.quantity;
      }, 0);

      if (totalFoodValue > 0) {
        await fishCoinDB.addFishCoin(
          user.userId,
          user.guildId,
          totalFoodValue,
          `Fish food compensation`
        );
        
        console.log(`   ✅ User ${user.userId}: +${totalFoodValue} FishCoin (fish food compensation)`);
      }
    }

    // 5. Tạo FishCoin cho users có fish market listings
    console.log('\n5. Compensating fish market sellers...');
    const marketListings = await prisma.fishMarket.findMany({
      include: {
        fish: true
      }
    });

    for (const listing of marketListings) {
      const compensation = Math.floor(Number(listing.price) * 0.1); // 10% compensation
      
      await fishCoinDB.addFishCoin(
        listing.sellerId,
        listing.guildId,
        compensation,
        `Market listing compensation`
      );
      
      console.log(`   ✅ Seller ${listing.sellerId}: +${compensation} FishCoin (market compensation)`);
    }

    // 6. Tạo FishCoin cho users có battle history
    console.log('\n6. Compensating battle participants...');
    const battleParticipants = await prisma.battleHistory.groupBy({
      by: ['userId', 'guildId'],
      _sum: {
        reward: true
      }
    });

    for (const participant of battleParticipants) {
      if (participant._sum.reward && participant._sum.reward > 0) {
        const compensation = Math.floor(Number(participant._sum.reward) * 0.2); // 20% compensation
        
        await fishCoinDB.addFishCoin(
          participant.userId,
          participant.guildId,
          compensation,
          `Battle history compensation`
        );
        
        console.log(`   ✅ User ${participant.userId}: +${compensation} FishCoin (battle compensation)`);
      }
    }

    // 7. Tạo FishCoin cho users có fishing data
    console.log('\n7. Compensating fishing players...');
    const fishingUsers = await prisma.fishingData.findMany();

    for (const fishingData of fishingUsers) {
      const fishingBonus = Math.floor(Number(fishingData.totalEarnings) * 0.1); // 10% compensation
      
      if (fishingBonus > 0) {
        await fishCoinDB.addFishCoin(
          fishingData.userId,
          fishingData.guildId,
          fishingBonus,
          `Fishing activity compensation`
        );
        
        console.log(`   ✅ User ${fishingData.userId}: +${fishingBonus} FishCoin (fishing compensation)`);
      }
    }

    // 8. Tổng kết migration
    console.log('\n8. Migration Summary...');
    const finalStats = await prisma.user.aggregate({
      _sum: {
        fishBalance: true
      },
      _count: {
        id: true
      }
    });

    const totalFishCoin = finalStats._sum.fishBalance || 0n;
    const totalUsers = finalStats._count.id;

    console.log('✅ Migration completed successfully!');
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Total FishCoin distributed: ${totalFishCoin.toString()}`);
    console.log(`   Average FishCoin per user: ${Math.floor(Number(totalFishCoin) / totalUsers)}`);

    // 9. Tạo migration log
    const migrationLog = {
      timestamp: new Date().toISOString(),
      totalUsers,
      totalFishCoinDistributed: totalFishCoin.toString(),
      usersWithFish: usersWithFish.length,
      usersWithFood: usersWithFood.length,
      marketListings: marketListings.length,
      battleParticipants: battleParticipants.length,
      fishingUsers: fishingUsers.length
    };

    console.log('\n📋 Migration Log:');
    console.log(JSON.stringify(migrationLog, null, 2));

    console.log('\n🎉 FishCoin migration completed!');
    console.log('🐟 Users can now use FishCoin commands:');
    console.log('   !fishbalance - Check FishCoin balance');
    console.log('   !fishtransfer @user <amount> - Transfer FishCoin');
    console.log('   !fishgive @user <amount> - Admin add FishCoin');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

migrateToFishCoin(); 