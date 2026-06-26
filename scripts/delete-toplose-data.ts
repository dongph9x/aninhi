import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTopLoseData() {
  console.log('🗑️ Xóa Toàn Bộ Data n.toplose (GameStats)\n');

  try {
    // 1. Thống kê trước khi xóa
    console.log('1️⃣ Thống Kê Trước Khi Xóa:');
    
    // Đếm tổng số GameStats records
    const totalGameStats = await prisma.gameStats.count();
    console.log(`   📊 Tổng số GameStats records: ${totalGameStats.toLocaleString()}`);
    
    // Đếm theo gameType
    const gameStatsByType = await prisma.gameStats.groupBy({
      by: ['gameType'],
      _count: {
        id: true
      },
      _sum: {
        totalLost: true,
        totalBet: true,
        gamesPlayed: true,
        gamesWon: true
      },
      orderBy: {
        gameType: 'asc'
      }
    });

    console.log('\n   📈 Thống kê theo loại game:');
    gameStatsByType.forEach(group => {
      const totalLost = group._sum.totalLost || 0n;
      const totalBet = group._sum.totalBet || 0n;
      const gamesPlayed = group._sum.gamesPlayed || 0;
      const gamesWon = group._sum.gamesWon || 0;
      
      console.log(`   🎮 ${group.gameType}:`);
      console.log(`      📊 Records: ${group._count.id.toLocaleString()}`);
      console.log(`      💸 Total Lost: ${totalLost.toLocaleString()} AniCoin`);
      console.log(`      💰 Total Bet: ${totalBet.toLocaleString()} AniCoin`);
      console.log(`      🎯 Games Played: ${gamesPlayed.toLocaleString()}`);
      console.log(`      🏆 Games Won: ${gamesWon.toLocaleString()}`);
    });

    // 2. Tìm tất cả GameStats records
    console.log('\n2️⃣ Tìm Tất Cả GameStats Records:');
    
    const allGameStats = await prisma.gameStats.findMany({
      select: {
        id: true,
        userId: true,
        guildId: true,
        gameType: true,
        totalLost: true,
        totalBet: true,
        gamesPlayed: true,
        gamesWon: true,
        biggestLoss: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { totalLost: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    if (allGameStats.length === 0) {
      console.log('   ✅ Không có GameStats data nào để xóa');
      return;
    }

    console.log(`   📊 Tìm thấy ${allGameStats.length.toLocaleString()} GameStats records:`);
    
    // Nhóm theo gameType
    const statsByGameType = allGameStats.reduce((acc, stat) => {
      if (!acc[stat.gameType]) {
        acc[stat.gameType] = [];
      }
      acc[stat.gameType].push(stat);
      return acc;
    }, {} as Record<string, any[]>);

    Object.entries(statsByGameType).forEach(([gameType, stats]) => {
      console.log(`\n   🎮 ${gameType} (${stats.length} records):`);
      
      // Hiển thị top 5 records có totalLost cao nhất
      const topLosers = stats
        .sort((a, b) => Number(b.totalLost - a.totalLost))
        .slice(0, 5);
      
      topLosers.forEach((stat, index) => {
        const winRate = stat.gamesPlayed > 0 ? Math.round((stat.gamesWon / stat.gamesPlayed) * 100) : 0;
        console.log(`     ${index + 1}. User ${stat.userId}:`);
        console.log(`        💸 Lost: ${stat.totalLost.toLocaleString()} AniCoin`);
        console.log(`        💰 Bet: ${stat.totalBet.toLocaleString()} AniCoin`);
        console.log(`        📊 Games: ${stat.gamesPlayed} | 🏆 Won: ${stat.gamesWon} (${winRate}%)`);
        console.log(`        🎯 Biggest Loss: ${stat.biggestLoss.toLocaleString()} AniCoin`);
      });
      
      if (stats.length > 5) {
        console.log(`     ... và ${stats.length - 5} records khác`);
      }
    });

    // 3. Xác nhận xóa
    console.log('\n3️⃣ Xác Nhận Xóa:');
    console.log(`   ⚠️  Bạn sắp xóa ${allGameStats.length.toLocaleString()} GameStats records!`);
    console.log('   ⚠️  Hành động này KHÔNG THỂ HOÀN TÁC!');
    console.log('   ⚠️  Tất cả dữ liệu n.toplose sẽ bị mất vĩnh viễn!');
    console.log('   ⚠️  Các lệnh sau sẽ không hoạt động:');
    console.log('      - n.toplose');
    console.log('      - n.toplose all');
    console.log('      - n.toplose blackjack');
    console.log('      - n.toplose slots');
    console.log('      - n.toplose roulette');
    console.log('      - n.toplose coinflip');
    console.log('      - n.toplose stats');
    console.log('   ⚠️  Top Lose GIF trong n.fishing sẽ không hiển thị!');
    
    // 4. Bắt đầu xóa
    console.log('\n4️⃣ Bắt Đầu Xóa...');
    
    // Xóa từng GameStats record
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const stat of allGameStats) {
      try {
        // Xóa GameStats record
        await prisma.gameStats.delete({
          where: { id: stat.id }
        });
        
        deletedCount++;
        if (deletedCount % 50 === 0) {
          console.log(`   ✅ Đã xóa ${deletedCount.toLocaleString()}/${allGameStats.length.toLocaleString()} records`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Lỗi khi xóa record ${stat.id}:`, error);
      }
    }

    // 5. Thống kê sau khi xóa
    console.log('\n5️⃣ Thống Kê Sau Khi Xóa:');
    
    const remainingGameStats = await prisma.gameStats.count();
    console.log(`   📊 GameStats records còn lại: ${remainingGameStats.toLocaleString()}`);
    
    if (remainingGameStats === 0) {
      console.log('   ✅ Đã xóa sạch tất cả GameStats data!');
    } else {
      console.log(`   ⚠️  Vẫn còn ${remainingGameStats.toLocaleString()} records chưa xóa được`);
    }

    // 6. Tóm tắt kết quả
    console.log('\n6️⃣ Tóm Tắt Kết Quả:');
    console.log(`   ✅ Đã xóa thành công: ${deletedCount.toLocaleString()} records`);
    console.log(`   ❌ Lỗi khi xóa: ${errorCount} records`);
    console.log(`   📊 Tổng cộng: ${allGameStats.length.toLocaleString()} GameStats records`);
    
    if (deletedCount === allGameStats.length) {
      console.log('   🎉 Xóa thành công 100%!');
    } else {
      console.log(`   ⚠️  Xóa thành công ${Math.round((deletedCount / allGameStats.length) * 100)}%`);
    }

    // 7. Kiểm tra ảnh hưởng
    console.log('\n7️⃣ Kiểm Tra Ảnh Hưởng:');
    
    // Kiểm tra xem còn user nào không
    const remainingUsers = await prisma.user.count();
    console.log(`   👥 Users còn lại: ${remainingUsers.toLocaleString()}`);
    
    // Kiểm tra xem còn fish nào không
    const remainingFish = await prisma.fish.count();
    console.log(`   🐟 Fish còn lại: ${remainingFish.toLocaleString()}`);
    
    // Kiểm tra xem còn breeding history không
    const remainingBreeding = await prisma.breedingHistory.count();
    console.log(`   🧬 Breeding history còn lại: ${remainingBreeding.toLocaleString()}`);
    
    // Kiểm tra xem còn battle history không
    const remainingBattles = await prisma.battleHistory.count();
    console.log(`   ⚔️ Battle history còn lại: ${remainingBattles.toLocaleString()}`);

    // 8. Thông báo về các lệnh bị ảnh hưởng
    console.log('\n8️⃣ Lệnh Bị Ảnh Hưởng:');
    console.log('   ❌ n.toplose - Sẽ hiển thị "Chưa có dữ liệu thua lỗ nào!"');
    console.log('   ❌ n.toplose all - Sẽ hiển thị "Chưa có dữ liệu thua lỗ nào!"');
    console.log('   ❌ n.toplose blackjack - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Blackjack nào!"');
    console.log('   ❌ n.toplose slots - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Slots nào!"');
    console.log('   ❌ n.toplose roulette - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Roulette nào!"');
    console.log('   ❌ n.toplose coinflip - Sẽ hiển thị "Chưa có dữ liệu thua lỗ Coin Flip nào!"');
    console.log('   ❌ n.toplose stats - Sẽ hiển thị "Chưa có dữ liệu thống kê nào!"');
    console.log('   ⚠️  n.fishing - Top Lose GIF sẽ không hiển thị cho bất kỳ ai');

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Xóa data n.toplose hoàn tất!');
    console.log('💡 Lưu ý: Các lệnh n.toplose sẽ không hoạt động cho đến khi có data mới');

  } catch (error) {
    console.error('❌ Lỗi khi xóa data n.toplose:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
deleteTopLoseData(); 