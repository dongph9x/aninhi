import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface FishStats {
  strength: number;      // Sức mạnh (1-100)
  agility: number;       // Thể lực/Nhanh nhẹn (1-100)
  intelligence: number;  // Trí thông minh (1-100)
  defense: number;       // Phòng thủ (1-100)
  luck: number;          // May mắn (1-100)
  accuracy: number;      // Độ chính xác (1-100) - MỚI THÊM
}

/**
 * Tạo stats mặc định với accuracy
 */
function generateDefaultStats(): FishStats {
  return {
    strength: Math.floor(Math.random() * 20) + 1,      // 1-20
    agility: Math.floor(Math.random() * 20) + 1,       // 1-20
    intelligence: Math.floor(Math.random() * 20) + 1,  // 1-20
    defense: Math.floor(Math.random() * 20) + 1,       // 1-20
    luck: Math.floor(Math.random() * 20) + 1,          // 1-20
    accuracy: Math.floor(Math.random() * 20) + 1       // 1-20 - MỚI THÊM
  };
}

/**
 * Cập nhật stats hiện có để thêm accuracy
 */
function updateExistingStats(oldStats: any): FishStats {
  const stats = typeof oldStats === 'string' ? JSON.parse(oldStats) : oldStats;
  
  return {
    strength: stats.strength || 0,
    agility: stats.agility || 0,
    intelligence: stats.intelligence || 0,
    defense: stats.defense || 0,
    luck: stats.luck || 0,
    accuracy: stats.accuracy || Math.floor(Math.random() * 20) + 1 // Thêm accuracy ngẫu nhiên nếu chưa có
  };
}

async function main() {
  try {
    console.log('🐟 Bắt đầu cập nhật stats cá để thêm chỉ số accuracy...\n');

    // 1. Đếm số lượng cá hiện có
    const totalFish = await prisma.fish.count();
    console.log(`📊 Tổng số cá trong database: ${totalFish}`);

    // 2. Lấy tất cả cá
    const allFish = await prisma.fish.findMany();
    console.log(`📋 Đã lấy ${allFish.length} con cá để cập nhật\n`);

    let updatedCount = 0;
    let skippedCount = 0;

    // 3. Cập nhật từng con cá
    for (const fish of allFish) {
      try {
        let newStats: FishStats;

        if (!fish.stats || fish.stats === '{}' || fish.stats === 'null') {
          // Cá chưa có stats, tạo mới với accuracy
          newStats = generateDefaultStats();
          console.log(`✅ Cá ${fish.species} (ID: ${fish.id}): Tạo stats mới với accuracy`);
        } else {
          // Cá đã có stats, thêm accuracy
          newStats = updateExistingStats(fish.stats);
          console.log(`✅ Cá ${fish.species} (ID: ${fish.id}): Cập nhật stats với accuracy`);
        }

        // Cập nhật database
        await prisma.fish.update({
          where: { id: fish.id },
          data: {
            stats: JSON.stringify(newStats),
            updatedAt: new Date()
          }
        });

        updatedCount++;
        
        // Log stats mới
        console.log(`   📊 Stats mới: 💪${newStats.strength} 🏃${newStats.agility} 🧠${newStats.intelligence} 🛡️${newStats.defense} 🍀${newStats.luck} 🎯${newStats.accuracy}`);
        console.log('');

      } catch (error) {
        console.error(`❌ Lỗi khi cập nhật cá ${fish.species} (ID: ${fish.id}):`, error);
        skippedCount++;
      }
    }

    // 4. Thống kê kết quả
    console.log('🎉 Hoàn thành cập nhật stats cá!');
    console.log(`📈 Kết quả:`);
    console.log(`   ✅ Đã cập nhật: ${updatedCount} con cá`);
    console.log(`   ⚠️  Bỏ qua: ${skippedCount} con cá`);
    console.log(`   📊 Tổng cộng: ${updatedCount + skippedCount} con cá`);

    // 5. Kiểm tra kết quả
    console.log('\n🔍 Kiểm tra kết quả...');
    const sampleFish = await prisma.fish.findFirst({
      where: { stats: { not: null } }
    });

    if (sampleFish && sampleFish.stats) {
      const sampleStats = JSON.parse(sampleFish.stats);
      console.log(`📋 Ví dụ stats sau cập nhật:`);
      console.log(`   🐟 Cá: ${sampleFish.species}`);
      console.log(`   📊 Stats: 💪${sampleStats.strength} 🏃${sampleStats.agility} 🧠${sampleStats.intelligence} 🛡️${sampleStats.defense} 🍀${sampleStats.luck} 🎯${sampleStats.accuracy}`);
      
      if (sampleStats.accuracy !== undefined) {
        console.log('✅ Chỉ số accuracy đã được thêm thành công!');
      } else {
        console.log('❌ Chỉ số accuracy chưa được thêm!');
      }
    }

  } catch (error) {
    console.error('❌ Lỗi trong quá trình cập nhật:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
main().catch(console.error); 