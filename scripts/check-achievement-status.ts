/**
 * 🏆 Check Achievement Status
 * 
 * Script này kiểm tra trạng thái Achievement system
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAchievementStatus() {
    console.log('🏆 Check Achievement Status\n');

    try {
        // 1. Kiểm tra kết nối database
        console.log('1️⃣ Kiểm tra kết nối database:');
        await prisma.$connect();
        console.log('   ✅ Kết nối database thành công\n');

        // 2. Kiểm tra bảng Achievement
        console.log('2️⃣ Kiểm tra bảng Achievement:');
        const count = await prisma.achievement.count();
        console.log(`   ✅ Bảng Achievement tồn tại, có ${count} records\n`);

        // 3. Lấy danh sách achievements
        let achievements: any[] = [];
        if (count > 0) {
            console.log('3️⃣ Danh sách achievements:');
            achievements = await prisma.achievement.findMany({
                orderBy: { createdAt: 'desc' }
            });
            
            const typeNames = ['Top câu cá', 'Top FishCoin', 'Top FishBattle', 'Top Custom'];
            
            achievements.forEach((achievement, index) => {
                const typeName = typeNames[achievement.type] || 'Unknown';
                const status = achievement.active ? '✅ Active' : '❌ Inactive';
                console.log(`   ${index + 1}. ${achievement.name}`);
                console.log(`      📊 Type: ${typeName} (${achievement.type})`);
                console.log(`      👤 Target: ${achievement.target}`);
                console.log(`      🔗 Link: ${achievement.link}`);
                console.log(`      📅 Created: ${achievement.createdAt.toLocaleString()}`);
                console.log(`      🎯 Status: ${status}`);
                console.log('');
            });
        }

        // 4. Kiểm tra các bảng liên quan
        console.log('4️⃣ Kiểm tra các bảng liên quan:');
        
        try {
            const userCount = await prisma.user.count();
            console.log(`   ✅ Bảng User: ${userCount} users`);
        } catch (error: any) {
            console.log(`   ❌ Bảng User: ${error.message}`);
        }

        try {
            const systemSettingsCount = await prisma.systemSettings.count();
            console.log(`   ✅ Bảng SystemSettings: ${systemSettingsCount} records`);
        } catch (error: any) {
            console.log(`   ❌ Bảng SystemSettings: ${error.message}`);
        }

        console.log('');

        // 5. Tóm tắt
        console.log('5️⃣ Tóm tắt:');
        console.log(`   🏆 Achievement system: ✅ Hoạt động bình thường`);
        console.log(`   📊 Total achievements: ${count}`);
        console.log(`   🎯 Active achievements: ${achievements?.filter(a => a.active).length || 0}`);
        console.log(`   📅 Last updated: ${achievements?.[0]?.updatedAt.toLocaleString() || 'N/A'}`);

        console.log('\n✅ Achievement system đã sẵn sàng sử dụng!');

    } catch (error: any) {
        console.error('❌ Lỗi:', error);
        
        if (error.code === 'P2021') {
            console.log('🔧 Giải pháp:');
            console.log('   1. Chạy: docker compose --profile init up database-init');
            console.log('   2. Hoặc: npx prisma db push --force-reset');
            console.log('   3. Restart bot: docker compose restart aninhi-bot');
        }
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy check
checkAchievementStatus().catch(console.error); 