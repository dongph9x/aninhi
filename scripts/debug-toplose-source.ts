/**
 * 🔍 Debug nguồn dữ liệu n.toplose
 * 
 * Script này debug để tìm nguồn dữ liệu toplose
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function debugTopLoseSource() {
    console.log('🔍 Debug nguồn dữ liệu n.toplose\n');

    try {
        // 1. Kiểm tra tất cả database files
        console.log('1️⃣ Kiểm tra tất cả database files:');
        
        const fs = require('fs');
        const path = require('path');
        
        const dataDir = './data';
        const files = fs.readdirSync(dataDir);
        
        const dbFiles = files.filter(file => file.includes('database.db'));
        console.log(`   📁 Tìm thấy ${dbFiles.length} database files:`);
        
        dbFiles.forEach(file => {
            const filePath = path.join(dataDir, file);
            const stats = fs.statSync(filePath);
            console.log(`   📄 ${file} (${(stats.size / 1024).toFixed(1)} KB)`);
        });

        // 2. Kiểm tra environment variables
        console.log('\n2️⃣ Kiểm tra environment variables:');
        console.log(`   🗄️ DATABASE_URL: ${process.env.DATABASE_URL || 'Not set'}`);
        console.log(`   🗄️ PRISMA_DATABASE_URL: ${process.env.PRISMA_DATABASE_URL || 'Not set'}`);

        // 3. Kiểm tra Prisma schema
        console.log('\n3️⃣ Kiểm tra Prisma schema:');
        const schemaPath = './prisma/schema.prisma';
        if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, 'utf8');
            const dbUrlMatch = schema.match(/url\s*=\s*["']([^"']+)["']/);
            if (dbUrlMatch) {
                console.log(`   📋 Schema database URL: ${dbUrlMatch[1]}`);
            }
        }

        // 4. Test GameStatsService trực tiếp
        console.log('\n4️⃣ Test GameStatsService trực tiếp:');
        
        try {
            // Test với guildId thực tế (có thể cần thay đổi)
            const testGuildId = "your-actual-guild-id"; // Cần thay đổi thành guildId thực tế
            
            const overallLoseLeaderboard = await GameStatsService.getOverallLoseLeaderboard(testGuildId, 10);
            console.log(`   📊 GameStatsService.getOverallLoseLeaderboard result: ${overallLoseLeaderboard.length} records`);
            
            if (overallLoseLeaderboard.length > 0) {
                console.log('   🏆 Top losers from GameStatsService:');
                overallLoseLeaderboard.forEach((player, index) => {
                    console.log(`   ${index + 1}. ${player.userId}`);
                    console.log(`      💸 ${player.totalLost.toLocaleString()} AniCoin thua`);
                    console.log(`      📊 ${player.gamesPlayed} trận | 🏆 ${player.gamesWon} thắng`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`   ❌ GameStatsService error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // 5. Kiểm tra tất cả bảng trong database hiện tại
        console.log('\n5️⃣ Kiểm tra tất cả bảng trong database hiện tại:');
        
        try {
            const tables = await prisma.$queryRaw`
                SELECT name FROM sqlite_master 
                WHERE type='table' 
                ORDER BY name;
            `;
            console.log('   📋 Tables found:');
            (tables as any[]).forEach(table => {
                console.log(`   - ${table.name}`);
            });
        } catch (error) {
            console.log(`   ❌ Error querying tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // 6. Kiểm tra xem có GameStats table không
        console.log('\n6️⃣ Kiểm tra GameStats table:');
        
        try {
            const gameStatsCount = await prisma.gameStats.count();
            console.log(`   📊 GameStats records: ${gameStatsCount}`);
            
            if (gameStatsCount > 0) {
                const sampleStats = await prisma.gameStats.findMany({
                    take: 3,
                    orderBy: { totalLost: 'desc' }
                });
                
                console.log('   📋 Sample GameStats records:');
                sampleStats.forEach((stat, index) => {
                    console.log(`   ${index + 1}. User: ${stat.userId}, Game: ${stat.gameType}`);
                    console.log(`      💸 Total Lost: ${stat.totalLost.toLocaleString()}`);
                    console.log(`      💰 Total Bet: ${stat.totalBet.toLocaleString()}`);
                    console.log('');
                });
            }
        } catch (error) {
            console.log(`   ❌ GameStats table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        // 7. Kiểm tra User table
        console.log('\n7️⃣ Kiểm tra User table:');
        
        try {
            const userCount = await prisma.user.count();
            console.log(`   👥 User records: ${userCount}`);
            
            if (userCount > 0) {
                const sampleUsers = await prisma.user.findMany({
                    take: 5,
                    orderBy: { username: 'asc' }
                });
                
                console.log('   📋 Sample Users:');
                sampleUsers.forEach((user, index) => {
                    console.log(`   ${index + 1}. ${user.username || user.userId} (${user.userId})`);
                });
            }
        } catch (error) {
            console.log(`   ❌ User table error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

    } catch (error) {
        console.error('❌ Debug error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugTopLoseSource(); 