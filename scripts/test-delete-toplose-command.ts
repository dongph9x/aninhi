/**
 * 🧪 Test Command n.delete toplose
 * 
 * Script này test command n.delete toplose
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testDeleteTopLoseCommand() {
    console.log('🧪 Test Command n.delete toplose\n');

    const testGuildId = "test-guild-123";

    try {
        // 1. Kiểm tra dữ liệu hiện tại
        console.log('1️⃣ Kiểm tra dữ liệu hiện tại:');
        
        const currentGameStats = await prisma.gameStats.count({
            where: { guildId: testGuildId }
        });
        console.log(`   📊 GameStats records hiện tại: ${currentGameStats}`);

        // 2. Tạo dữ liệu test nếu cần
        if (currentGameStats === 0) {
            console.log('\n2️⃣ Tạo dữ liệu test:');
            
            // Tạo user test
            await prisma.user.upsert({
                where: {
                    userId_guildId: {
                        userId: "test-user-456",
                        guildId: testGuildId
                    }
                },
                update: {},
                create: {
                    userId: "test-user-456",
                    guildId: testGuildId,
                    balance: 1000000n,
                    fishBalance: 5000n
                }
            });

            // Tạo GameStats test
            await GameStatsService.recordGameResult("test-user-456", testGuildId, "blackjack", {
                won: false,
                bet: 100000,
                winnings: 0
            });

            await GameStatsService.recordGameResult("test-user-456", testGuildId, "coinflip", {
                won: false,
                bet: 50000,
                winnings: 0
            });

            console.log('   ✅ Đã tạo dữ liệu test');
        }

        // 3. Test thống kê trước khi xóa
        console.log('\n3️⃣ Test thống kê trước khi xóa:');
        
        const serverGameStats = await GameStatsService.getServerGameStats(testGuildId);
        console.log(`   📊 Server GameStats: ${serverGameStats.length} loại game`);
        
        const serverLoseStats = await GameStatsService.getServerLoseStats(testGuildId);
        console.log(`   📈 Server Lose Stats: ${serverLoseStats.length} loại game`);
        
        serverLoseStats.forEach(stat => {
            console.log(`   🎮 ${stat.gameType}: ${stat.totalGames} trận, ${stat.totalLost.toLocaleString()} AniCoin thua`);
        });

        // 4. Test method deleteAllGameStats
        console.log('\n4️⃣ Test method deleteAllGameStats:');
        
        const deletedCount = await GameStatsService.deleteAllGameStats(testGuildId);
        console.log(`   🗑️ Đã xóa: ${deletedCount} GameStats records`);

        // 5. Kiểm tra sau khi xóa
        console.log('\n5️⃣ Kiểm tra sau khi xóa:');
        
        const remainingGameStats = await prisma.gameStats.count({
            where: { guildId: testGuildId }
        });
        console.log(`   📊 GameStats records còn lại: ${remainingGameStats}`);

        const remainingServerGameStats = await GameStatsService.getServerGameStats(testGuildId);
        console.log(`   📊 Server GameStats còn lại: ${remainingServerGameStats.length} loại game`);

        // 6. Mô phỏng command n.delete toplose
        console.log('\n6️⃣ Mô phỏng command n.delete toplose:');
        
        console.log('   📋 Command: n.delete toplose');
        console.log('   📋 Expected output:');
        console.log('   🗑️ Xóa Dữ Liệu n.toplose');
        console.log('   📊 Thống kê trước khi xóa:');
        console.log('   📈 Tổng số GameStats records: 0');
        console.log('   ✅ Không có dữ liệu n.toplose nào để xóa!');

        // 7. Mô phỏng command n.delete toplose confirm
        console.log('\n7️⃣ Mô phỏng command n.delete toplose confirm:');
        
        console.log('   📋 Command: n.delete toplose confirm');
        console.log('   📋 Expected output:');
        console.log('   🗑️ Xác Nhận Xóa Dữ Liệu n.toplose');
        console.log('   ✅ Không có dữ liệu n.toplose nào để xóa!');

        // 8. Test với dữ liệu mới
        console.log('\n8️⃣ Test với dữ liệu mới:');
        
        // Tạo lại dữ liệu test
        await GameStatsService.recordGameResult("test-user-456", testGuildId, "slots", {
            won: false,
            bet: 75000,
            winnings: 0
        });

        const newGameStats = await prisma.gameStats.count({
            where: { guildId: testGuildId }
        });
        console.log(`   📊 GameStats records mới: ${newGameStats}`);

        // Xóa dữ liệu test
        await GameStatsService.deleteAllGameStats(testGuildId);
        console.log('   🗑️ Đã xóa dữ liệu test');

        console.log('\n✅ Test command n.delete toplose hoàn tất!');

    } catch (error) {
        console.error('❌ Test error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testDeleteTopLoseCommand(); 