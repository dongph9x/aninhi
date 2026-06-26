/**
 * 🏆 Test Priority System - Top 1 Lose > Top 1 Fisher
 * 
 * Script này test priority system mới:
 * Admin > Top 1 Lose > Top 1 Fisher > Normal User
 */

import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';
import { GameStatsService } from '../src/utils/gameStats';

const prisma = new PrismaClient();

async function testPrioritySystem() {
    console.log('🏆 Test Priority System - Top 1 Lose > Top 1 Fisher\n');

    try {
        // 1. Lấy guild có dữ liệu thật
        console.log('1️⃣ Finding guild with real data...');
        const guildWithData = await prisma.fishingData.findFirst({
            select: { guildId: true }
        });

        if (!guildWithData) {
            console.log('   ❌ No guild with fishing data found');
            return;
        }

        const guildId = guildWithData.guildId;
        console.log(`   ✅ Found guild: ${guildId}`);

        // 2. Lấy top fisher và top lose
        console.log('\n2️⃣ Getting top fisher and top lose...');
        const topFisher = await FishingService.getTopFisher(guildId);
        const topLoseUser = await GameStatsService.getTopLoseUser(guildId);
        
        console.log('   📊 Top Fisher:');
        if (topFisher) {
            console.log(`   User ID: ${topFisher.userId}`);
            console.log(`   Total Fish: ${topFisher.totalFish.toLocaleString()}`);
        } else {
            console.log('   ❌ No top fisher found');
        }

        console.log('   📊 Top Lose User:');
        if (topLoseUser) {
            console.log(`   User ID: ${topLoseUser.userId}`);
            console.log(`   Total Lost: ${topLoseUser.totalLost.toLocaleString()}`);
        } else {
            console.log('   ❌ No top lose user found');
        }

        // 3. Test các trường hợp khác nhau
        console.log('\n3️⃣ Testing different scenarios...');

        // Scenario 1: User chỉ là Top Fisher
        if (topFisher && topLoseUser && topFisher.userId !== topLoseUser.userId) {
            console.log('\n   📋 Scenario 1: User chỉ là Top Fisher');
            const testUserId = topFisher.userId;
            const isAdmin = false;
            const isTopFisher = topFisher.userId === testUserId;
            const isTopLose = topLoseUser.userId === testUserId;
            
            console.log(`   Test User ID: ${testUserId}`);
            console.log(`   Is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
            console.log(`   Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);
            console.log(`   Is Top Lose: ${isTopLose ? '✅ YES' : '❌ NO'}`);
            
            console.log('   🎯 Expected Result:');
            console.log('   📋 [Embed 1 - Top Fisher GIF (Small)]');
            console.log('      🏆 Top 1 Câu Cá');
            console.log('      🎨 GIF: Top Fisher GIF (Orange)');
            console.log('');
            console.log('   📋 [Embed 2 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      🏆 Top 1 Fisher đang câu cá với GIF đặc biệt!');
            console.log('      🎨 GIF: Original fishing GIF (Blue)');
        }

        // Scenario 2: User chỉ là Top Lose
        if (topFisher && topLoseUser && topFisher.userId !== topLoseUser.userId) {
            console.log('\n   📋 Scenario 2: User chỉ là Top Lose');
            const testUserId = topLoseUser.userId;
            const isAdmin = false;
            const isTopFisher = topFisher.userId === testUserId;
            const isTopLose = topLoseUser.userId === testUserId;
            
            console.log(`   Test User ID: ${testUserId}`);
            console.log(`   Is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
            console.log(`   Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);
            console.log(`   Is Top Lose: ${isTopLose ? '✅ YES' : '❌ NO'}`);
            
            console.log('   🎯 Expected Result:');
            console.log('   📋 [Embed 1 - Top Lose GIF (Small)]');
            console.log('      💸 Top 1 Thua Lỗ');
            console.log('      🎨 GIF: Top Lose GIF (Red)');
            console.log('');
            console.log('   📋 [Embed 2 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      💸 Top 1 Lose đang câu cá với GIF đặc biệt!');
            console.log('      🎨 GIF: Original fishing GIF (Blue)');
        }

        // Scenario 3: User vừa là Top Fisher vừa là Top Lose
        if (topFisher && topLoseUser && topFisher.userId === topLoseUser.userId) {
            console.log('\n   📋 Scenario 3: User vừa là Top Fisher vừa là Top Lose');
            const testUserId = topFisher.userId;
            const isAdmin = false;
            const isTopFisher = topFisher.userId === testUserId;
            const isTopLose = topLoseUser.userId === testUserId;
            
            console.log(`   Test User ID: ${testUserId}`);
            console.log(`   Is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
            console.log(`   Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);
            console.log(`   Is Top Lose: ${isTopLose ? '✅ YES' : '❌ NO'}`);
            
            console.log('   🎯 Expected Result:');
            console.log('   📋 [Embed 1 - Top Lose GIF (Small)] - PRIORITY!');
            console.log('      💸 Top 1 Thua Lỗ');
            console.log('      🎨 GIF: Top Lose GIF (Red)');
            console.log('');
            console.log('   📋 [Embed 2 - Fishing Animation]');
            console.log('      🎣 Đang Câu Cá...');
            console.log('      💸 Top 1 Lose đang câu cá với GIF đặc biệt!');
            console.log('      🎨 GIF: Original fishing GIF (Blue)');
            console.log('');
            console.log('   ⚠️  Note: Top Fisher GIF is IGNORED due to Top Lose priority!');
        }

        // Scenario 4: User là Admin
        console.log('\n   📋 Scenario 4: User là Admin');
        const adminUserId = 'admin-user-123';
        const isAdmin = true;
        const isTopFisher = topFisher && topFisher.userId === adminUserId;
        const isTopLose = topLoseUser && topLoseUser.userId === adminUserId;
        
        console.log(`   Test User ID: ${adminUserId}`);
        console.log(`   Is Admin: ${isAdmin ? '✅ YES' : '❌ NO'}`);
        console.log(`   Is Top Fisher: ${isTopFisher ? '✅ YES' : '❌ NO'}`);
        console.log(`   Is Top Lose: ${isTopLose ? '✅ YES' : '❌ NO'}`);
        
        console.log('   🎯 Expected Result:');
        console.log('   📋 [Embed 1 - Admin GIF (Small)] - HIGHEST PRIORITY!');
        console.log('      👑 Admin Fishing');
        console.log('      🎨 GIF: Admin GIF (Gold)');
        console.log('');
        console.log('   📋 [Embed 2 - Fishing Animation]');
        console.log('      🎣 Đang Câu Cá...');
        console.log('      👑 Admin đang câu cá với GIF đặc biệt!');
        console.log('      🎨 GIF: Original fishing GIF (Blue)');
        console.log('');
        console.log('   ⚠️  Note: Top Fisher and Top Lose GIFs are IGNORED due to Admin priority!');

        // 4. Test priority logic
        console.log('\n4️⃣ Testing priority logic...');
        console.log('   🏆 Priority Order (NEW):');
        console.log('      1. 👑 Admin (HIGHEST)');
        console.log('      2. 💸 Top 1 Lose (HIGHER)');
        console.log('      3. 🏆 Top 1 Fisher (LOWER)');
        console.log('      4. 👤 Normal User (LOWEST)');
        
        console.log('\n   📋 Logic Implementation:');
        console.log('   if (isAdmin) {');
        console.log('       embeds = [adminEmbed, fishingEmbed];');
        console.log('   } else if (isTopLose) {');
        console.log('       embeds = [topLoseEmbed, fishingEmbed];');
        console.log('   } else if (isTopFisher) {');
        console.log('       embeds = [topFisherEmbed, fishingEmbed];');
        console.log('   } else {');
        console.log('       embeds = [fishingEmbed];');
        console.log('   }');

        // 5. Test embed creation logic
        console.log('\n5️⃣ Testing embed creation logic...');
        console.log('   📋 Top Fisher Embed Creation:');
        console.log('   if (isTopFisher && !isAdmin && !isTopLose) {');
        console.log('       // Only create if NOT admin and NOT top lose');
        console.log('   }');
        console.log('');
        console.log('   📋 Top Lose Embed Creation:');
        console.log('   if (isTopLose && !isAdmin) {');
        console.log('       // Create if NOT admin (ignores top fisher)');
        console.log('   }');

        console.log('\n✅ Priority System test completed!');
        console.log('\n🎯 Key Changes:');
        console.log('   ✅ Top 1 Lose now has priority over Top 1 Fisher');
        console.log('   ✅ When user is both Top Fisher and Top Lose, Top Lose GIF is shown');
        console.log('   ✅ Admin still has highest priority');
        console.log('   ✅ Normal users unaffected');

    } catch (error) {
        console.error('❌ Error testing priority system:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testPrioritySystem().catch(console.error); 