import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteGen2PlusFish() {
  console.log('🗑️ Xóa Toàn Bộ Cá Từ Gen 2 Trở Lên\n');

  try {
    // 1. Đếm số lượng cá theo generation trước khi xóa
    console.log('1️⃣ Thống Kê Trước Khi Xóa:');
    
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

    // 2. Tìm tất cả cá gen 2 trở lên
    console.log('\n2️⃣ Tìm Cá Gen 2 Trở Lên:');
    
    const gen2PlusFish = await prisma.fish.findMany({
      where: {
        generation: {
          gte: 2
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
        status: true,
        createdAt: true
      },
      orderBy: [
        { generation: 'desc' },
        { createdAt: 'desc' }
      ]
    });

    if (gen2PlusFish.length === 0) {
      console.log('   ✅ Không có cá gen 2 trở lên nào để xóa');
      return;
    }

    console.log(`   📊 Tìm thấy ${gen2PlusFish.length} con cá gen 2 trở lên:`);
    
    // Nhóm theo generation
    const fishByGen = gen2PlusFish.reduce((acc, fish) => {
      if (!acc[fish.generation]) {
        acc[fish.generation] = [];
      }
      acc[fish.generation].push(fish);
      return acc;
    }, {} as Record<number, any[]>);

    Object.entries(fishByGen).forEach(([gen, fishes]) => {
      console.log(`\n   Gen ${gen} (${fishes.length} con):`);
      fishes.slice(0, 5).forEach((fish, index) => {
        console.log(`     ${index + 1}. ${fish.species} - Level ${fish.level} - ${fish.rarity} - ${fish.value.toLocaleString()} coins`);
      });
      if (fishes.length > 5) {
        console.log(`     ... và ${fishes.length - 5} con khác`);
      }
    });

    // 3. Xác nhận xóa
    console.log('\n3️⃣ Xác Nhận Xóa:');
    console.log(`   ⚠️  Bạn sắp xóa ${gen2PlusFish.length} con cá gen 2 trở lên!`);
    console.log('   ⚠️  Hành động này KHÔNG THỂ HOÀN TÁC!');
    console.log('   ⚠️  Tất cả dữ liệu cá gen 2+ sẽ bị mất vĩnh viễn!');
    
    // 4. Bắt đầu xóa
    console.log('\n4️⃣ Bắt Đầu Xóa...');
    
    // Xóa từng con cá gen 2 trở lên
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const fish of gen2PlusFish) {
      try {
        // Xóa cá
        await prisma.fish.delete({
          where: { id: fish.id }
        });
        
        deletedCount++;
        if (deletedCount % 10 === 0) {
          console.log(`   ✅ Đã xóa ${deletedCount}/${gen2PlusFish.length} con cá`);
        }
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Lỗi khi xóa cá ${fish.id}:`, error);
      }
    }

    // 5. Thống kê sau khi xóa
    console.log('\n5️⃣ Thống Kê Sau Khi Xóa:');
    
    const remainingFish = await prisma.fish.groupBy({
      by: ['generation'],
      _count: {
        id: true
      },
      orderBy: {
        generation: 'asc'
      }
    });

    console.log('   Cá còn lại:');
    remainingFish.forEach(group => {
      console.log(`     Gen ${group.generation}: ${group._count.id} con cá`);
    });

    // 6. Tóm tắt kết quả
    console.log('\n6️⃣ Tóm Tắt Kết Quả:');
    console.log(`   ✅ Đã xóa thành công: ${deletedCount} con cá`);
    console.log(`   ❌ Lỗi khi xóa: ${errorCount} con cá`);
    console.log(`   📊 Tổng cộng: ${gen2PlusFish.length} con cá gen 2+`);
    
    if (deletedCount === gen2PlusFish.length) {
      console.log('   🎉 Xóa thành công 100%!');
    } else {
      console.log(`   ⚠️  Xóa thành công ${Math.round((deletedCount / gen2PlusFish.length) * 100)}%`);
    }

    // 7. Kiểm tra breeding history
    console.log('\n7️⃣ Kiểm Tra Breeding History:');
    
    const breedingHistory = await prisma.breedingHistory.findMany({
      select: {
        id: true,
        offspringId: true
      }
    });

    if (breedingHistory.length > 0) {
      console.log(`   📊 Có ${breedingHistory.length} lần lai tạo trong lịch sử`);
      console.log('   💡 Lưu ý: Breeding history vẫn còn, nhưng cá con đã bị xóa');
    } else {
      console.log('   ✅ Không có lịch sử lai tạo nào');
    }

  } catch (error) {
    console.error('❌ Lỗi khi xóa cá gen 2+:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
deleteGen2PlusFish(); 