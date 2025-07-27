/**
 * 🏆 Test Achievement Table
 * 
 * Script này test bảng Achievement
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAchievementTable() {
    console.log('🏆 Test Achievement Table\n');

    try {
        // 1. Kiểm tra bảng có tồn tại không
        console.log('1️⃣ Kiểm tra bảng Achievement:');
        const count = await prisma.achievement.count();
        console.log(`   ✅ Bảng Achievement tồn tại, có ${count} records\n`);

        // 2. Tạo test achievement
        console.log('2️⃣ Tạo test achievement:');
        const testAchievement = await prisma.achievement.create({
            data: {
                name: "Test Achievement",
                link: "https://example.com/badge.png",
                target: "123456789",
                type: 0, // Top câu cá
                active: true
            }
        });
        console.log(`   ✅ Tạo thành công: ${testAchievement.name} (ID: ${testAchievement.id})\n`);

        // 3. Lấy danh sách achievements
        console.log('3️⃣ Lấy danh sách achievements:');
        const achievements = await prisma.achievement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        console.log(`   📊 Tổng số: ${achievements.length} achievements`);
        achievements.forEach((achievement, index) => {
            console.log(`   ${index + 1}. ${achievement.name} (Type: ${achievement.type}, Active: ${achievement.active})`);
        });
        console.log('');

        // 4. Xóa test achievement
        console.log('4️⃣ Xóa test achievement:');
        await prisma.achievement.delete({
            where: { id: testAchievement.id }
        });
        console.log('   ✅ Đã xóa test achievement\n');

        // 5. Kiểm tra lại
        console.log('5️⃣ Kiểm tra sau khi xóa:');
        const finalCount = await prisma.achievement.count();
        console.log(`   📊 Còn lại: ${finalCount} achievements\n`);

        console.log('✅ Test Achievement Table hoàn tất!');
        console.log('🏆 Bảng Achievement hoạt động bình thường!');

    } catch (error: any) {
        console.error('❌ Lỗi:', error);
        
        if (error.code === 'P2021') {
            console.log('🔧 Giải pháp:');
            console.log('   1. Chạy: npx prisma db push --force-reset');
            console.log('   2. Hoặc: npx prisma migrate deploy');
            console.log('   3. Kiểm tra lại schema.prisma');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testAchievementTable().catch(console.error); 