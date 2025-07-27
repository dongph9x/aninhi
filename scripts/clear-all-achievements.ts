import prisma from '../src/utils/prisma';

async function clearAllAchievements() {
  console.log('🗑️ Clear All Achievements...\n');

  try {
    // Đếm số achievement hiện có
    const count = await prisma.achievement.count();
    console.log(`📊 Tìm thấy ${count} achievement trong database`);

    if (count === 0) {
      console.log('✅ Không có achievement nào để xóa!');
      return;
    }

    // Xem danh sách achievement trước khi xóa
    console.log('\n📋 Danh sách achievement sẽ bị xóa:');
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: 'desc' },
    });

    achievements.forEach((achievement, index) => {
      const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
      const typeName = typeNames[achievement.type] || 'Unknown';
      console.log(`   ${index + 1}. ${achievement.name} (${typeName}) - ID: ${achievement.id}`);
    });

    // Xác nhận xóa
    console.log('\n⚠️  Bạn có chắc chắn muốn xóa tất cả achievement?');
    console.log('   Lưu ý: Hành động này không thể hoàn tác!');
    
    // Trong thực tế, bạn có thể thêm prompt để xác nhận
    // Nhưng trong script này, chúng ta sẽ xóa trực tiếp
    
    // Xóa tất cả achievement
    const deleteResult = await prisma.achievement.deleteMany({});
    
    console.log(`\n✅ Đã xóa thành công ${deleteResult.count} achievement!`);
    
    // Kiểm tra lại
    const remainingCount = await prisma.achievement.count();
    console.log(`📊 Số achievement còn lại: ${remainingCount}`);

  } catch (error) {
    console.error('❌ Lỗi khi xóa achievement:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearAllAchievements().catch(console.error); 