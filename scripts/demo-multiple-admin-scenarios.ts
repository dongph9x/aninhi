/**
 * 🎭 Demo Multiple Admin Scenarios
 * 
 * Script này demo các trường hợp khác nhau với nhiều Admin
 */

import { PrismaClient } from '@prisma/client';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function demoMultipleAdminScenarios() {
    console.log('🎭 Demo Multiple Admin Scenarios\n');

    try {
        // 1. Tìm guild có dữ liệu thật
        console.log('1️⃣ Finding guild with real game stats data...');
        const guildWithData = await prisma.gameStats.findFirst({
            select: { guildId: true }
        });

        if (!guildWithData) {
            console.log('   ❌ No guild with game stats data found');
            return;
        }

        const guildId = guildWithData.guildId;
        console.log(`   ✅ Found guild: ${guildId}`);

        // 2. Lấy dữ liệu thực tế
        console.log('\n2️⃣ Current real data:');
        const allUsers = await prisma.gameStats.groupBy({
            by: ['userId'],
            where: { guildId, totalLost: { gt: 0 } },
            _sum: {
                totalLost: true,
                totalBet: true,
                gamesPlayed: true,
                gamesWon: true,
                biggestLoss: true
            },
            orderBy: { _sum: { totalLost: 'desc' } },
            take: 10
        });

        console.log(`   📊 Found ${allUsers.length} users with game stats:`);
        allUsers.forEach((user, index) => {
            const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
            console.log(`   ${medal} User ID: ${user.userId}`);
            console.log(`      Total Lost: ${user._sum.totalLost?.toLocaleString()}`);
        });

        // 3. Demo các trường hợp giả định
        console.log('\n3️⃣ Demo Hypothetical Scenarios:');
        
        // Scenario 1: Top 1, 2, 3 đều là Admin
        console.log('\n📊 Scenario 1: Top 1, 2, 3 đều là Admin');
        console.log('🥇 Admin A (1,000,000 lost) - ❌ SKIP');
        console.log('🥈 Admin B (800,000 lost) - ❌ SKIP');
        console.log('🥉 Admin C (600,000 lost) - ❌ SKIP');
        console.log('4. User D (500,000 lost) - ✅ SELECT');
        console.log('🎯 Result: User D sẽ thấy Top Lose GIF');
        console.log('🎣 Top Lose GIF: Hiển thị cho User D (4th place)');

        // Scenario 2: Top 1, 2 là Admin, Top 3 là Regular
        console.log('\n📊 Scenario 2: Top 1, 2 là Admin, Top 3 là Regular');
        console.log('🥇 Admin A (1,000,000 lost) - ❌ SKIP');
        console.log('🥈 Admin B (800,000 lost) - ❌ SKIP');
        console.log('🥉 User C (600,000 lost) - ✅ SELECT');
        console.log('🎯 Result: User C sẽ thấy Top Lose GIF');
        console.log('🎣 Top Lose GIF: Hiển thị cho User C (3rd place)');

        // Scenario 3: Top 1 là Admin, Top 2 là Regular
        console.log('\n📊 Scenario 3: Top 1 là Admin, Top 2 là Regular');
        console.log('🥇 Admin A (1,000,000 lost) - ❌ SKIP');
        console.log('🥈 User B (800,000 lost) - ✅ SELECT');
        console.log('🎯 Result: User B sẽ thấy Top Lose GIF');
        console.log('🎣 Top Lose GIF: Hiển thị cho User B (2nd place)');

        // Scenario 4: Top 1, 2, 3, 4 đều là Admin
        console.log('\n📊 Scenario 4: Top 1, 2, 3, 4 đều là Admin');
        console.log('🥇 Admin A (1,000,000 lost) - ❌ SKIP');
        console.log('🥈 Admin B (800,000 lost) - ❌ SKIP');
        console.log('🥉 Admin C (600,000 lost) - ❌ SKIP');
        console.log('4. Admin D (500,000 lost) - ❌ SKIP');
        console.log('5. User E (400,000 lost) - ✅ SELECT');
        console.log('🎯 Result: User E sẽ thấy Top Lose GIF');
        console.log('🎣 Top Lose GIF: Hiển thị cho User E (5th place)');

        // Scenario 5: Tất cả đều là Admin
        console.log('\n📊 Scenario 5: Tất cả đều là Admin');
        console.log('🥇 Admin A (1,000,000 lost) - ❌ SKIP');
        console.log('🥈 Admin B (800,000 lost) - ❌ SKIP');
        console.log('🥉 Admin C (600,000 lost) - ❌ SKIP');
        console.log('... (tất cả đều là Admin)');
        console.log('🎯 Result: Không có Top Lose GIF');
        console.log('🎣 Top Lose GIF: Không hiển thị');

        // 4. Test logic thực tế
        console.log('\n4️⃣ Testing real logic with current data:');
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        
        if (topLoseUser) {
            const originalPosition = allUsers.findIndex(u => u.userId === topLoseUser.userId);
            const position = originalPosition === 0 ? '🥇' : originalPosition === 1 ? '🥈' : originalPosition === 2 ? '🥉' : `${originalPosition + 1}.`;
            
            console.log(`   ✅ Current result: ${topLoseUser.userId} (${position})`);
            console.log(`   📊 Original position: ${originalPosition + 1}th place`);
            console.log(`   🎣 Top Lose GIF: Hiển thị cho user này`);
        } else {
            console.log('   ❌ Current result: No user found');
            console.log('   🎣 Top Lose GIF: Không hiển thị');
        }

        // 5. Tóm tắt logic
        console.log('\n5️⃣ Logic Summary:');
        console.log('   🔍 Hệ thống kiểm tra từng user theo thứ tự:');
        console.log('   📋 1. Lấy top 10 users theo totalLost (giảm dần)');
        console.log('   📋 2. Kiểm tra từng user có phải Admin/Owner không');
        console.log('   📋 3. Nếu là Admin/Owner → Bỏ qua → Kiểm tra user tiếp theo');
        console.log('   📋 4. Nếu là Regular User → Chọn → Trả về user này');
        console.log('   📋 5. Nếu tất cả đều là Admin/Owner → Trả về null');
        console.log('   🎣 Kết quả: User thường có thứ hạng cao nhất sẽ thấy Top Lose GIF');

        console.log('\n✅ Demo Multiple Admin Scenarios Completed!');
        console.log('\n🎯 Key Points:');
        console.log('   ✅ Logic hoạt động với bất kỳ số lượng Admin liên tiếp nào');
        console.log('   ✅ Luôn tìm user thường có thứ hạng cao nhất');
        console.log('   ✅ Top Lose GIF hiển thị cho user thường đầu tiên');
        console.log('   ✅ Nếu tất cả đều là Admin → Không có Top Lose GIF');

    } catch (error) {
        console.error('❌ Error in demo:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy demo
demoMultipleAdminScenarios()
    .then(() => {
        console.log('\n🎉 Demo completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Demo failed:', error);
        process.exit(1);
    });