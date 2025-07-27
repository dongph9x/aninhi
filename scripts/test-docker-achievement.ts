/**
 * 🐳 Test Achievement in Docker
 * 
 * Script này test Achievement system trong Docker
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDockerAchievement() {
    console.log('🐳 Test Achievement in Docker\n');

    try {
        // 1. Kiểm tra kết nối database
        console.log('1️⃣ Kiểm tra kết nối database:');
        await prisma.$connect();
        console.log('   ✅ Kết nối database thành công\n');

        // 2. Kiểm tra bảng Achievement
        console.log('2️⃣ Kiểm tra bảng Achievement:');
        const count = await prisma.achievement.count();
        console.log(`   ✅ Bảng Achievement tồn tại, có ${count} records\n`);

        // 3. Tạo test achievement
        console.log('3️⃣ Tạo test achievement:');
        const testAchievement = await prisma.achievement.create({
            data: {
                name: "Docker Test Achievement",
                link: "https://example.com/docker-badge.png",
                target: "987654321",
                type: 1, // Top FishCoin
                active: true
            }
        });
        console.log(`   ✅ Tạo thành công: ${testAchievement.name}`);
        console.log(`   📊 ID: ${testAchievement.id}`);
        console.log(`   🎯 Target: ${testAchievement.target}`);
        console.log(`   📊 Type: ${testAchievement.type}`);
        console.log(`   🔗 Link: ${testAchievement.link}\n`);

        // 4. Lấy danh sách achievements
        console.log('4️⃣ Lấy danh sách achievements:');
        const achievements = await prisma.achievement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`   📊 Tổng số: ${achievements.length} achievements`);
        achievements.forEach((achievement, index) => {
            const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
            const typeName = typeNames[achievement.type] || 'Unknown';
            console.log(`   ${index + 1}. ${achievement.name} (${typeName})`);
        });
        console.log('');

        // 5. Test update achievement
        console.log('5️⃣ Test update achievement:');
        const updatedAchievement = await prisma.achievement.update({
            where: { id: testAchievement.id },
            data: { active: false }
        });
        console.log(`   ✅ Cập nhật thành công: active = ${updatedAchievement.active}\n`);

        // 6. Xóa test achievement
        console.log('6️⃣ Xóa test achievement:');
        await prisma.achievement.delete({
            where: { id: testAchievement.id }
        });
        console.log('   ✅ Đã xóa test achievement\n');

        // 7. Kiểm tra cuối cùng
        console.log('7️⃣ Kiểm tra cuối cùng:');
        const finalCount = await prisma.achievement.count();
        console.log(`   📊 Còn lại: ${finalCount} achievements\n`);

        console.log('✅ Test Achievement in Docker hoàn tất!');
        console.log('🏆 Achievement system hoạt động bình thường trong Docker!');

    } catch (error: any) {
        console.error('❌ Lỗi:', error);
        
        if (error.code === 'P2021') {
            console.log('🔧 Giải pháp:');
            console.log('   1. Chạy: ./scripts/deploy-docker-database.sh');
            console.log('   2. Hoặc: docker-compose --profile init up database-init');
            console.log('   3. Kiểm tra logs: docker-compose logs database-init');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testDockerAchievement().catch(console.error); 