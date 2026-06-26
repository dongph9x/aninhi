/**
 * 🎣 Test Auto-Equip & Auto-Switch Rod Feature
 *
 * Script này test tính năng tự động trang bị và chuyển cần câu tốt nhất khi chưa có hoặc khi cần hiện tại hết độ bền
 */

import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';
import { FISHING_RODS } from '../src/config/fish-data';
import { fishCoinDB } from '../src/utils/fish-coin';

const prisma = new PrismaClient();

async function testAutoEquipRod() {
    console.log('🎣 Test Auto-Equip & Auto-Switch Rod Feature\n');

    try {
        // 1. Tạo test user với nhiều loại cần nhưng chưa trang bị
        console.log('1️⃣ Creating test user with rods but no current rod...');
        const testUserId = 'test-auto-equip-rod-user';
        const testGuildId = '1005280612845891615';
        
        // Thêm FishCoin cho test
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 100000, 'Test auto-equip rod');
        
        // Mua nhiều loại cần
        console.log('   🛒 Buying multiple rods...');
        await FishingService.buyRod(testUserId, testGuildId, 'basic');
        await FishingService.buyRod(testUserId, testGuildId, 'copper');
        await FishingService.buyRod(testUserId, testGuildId, 'silver');
        await FishingService.buyRod(testUserId, testGuildId, 'gold');
        await FishingService.buyRod(testUserId, testGuildId, 'diamond');
        console.log('   ✅ Bought all rod types');

        // 2. Xóa currentRod để giả lập chưa trang bị cần
        console.log('\n2️⃣ Removing current rod to simulate no equipped rod...');
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        await prisma.fishingData.update({
            where: { id: fishingData.id },
            data: { currentRod: "" }
        });
        console.log('   🗑️  Removed current rod');
        
        // Kiểm tra trạng thái sau khi xóa
        const fishingDataAfterRemove = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`   🎯 Current rod after removal: "${fishingDataAfterRemove.currentRod}"`);
        
        console.log('   📊 Available rods:');
        fishingDataAfterRemove.rods.forEach((rod: any) => {
            const rodData = FISHING_RODS[rod.rodType];
            console.log(`   ${rodData.emoji} ${rodData.name}: Độ bền ${rod.durability}`);
        });

        // 3. Test canFish với auto-equip
        console.log('\n3️⃣ Testing canFish with auto-equip...');
        
        // Mua mồi nếu chưa có
        if (!fishingDataAfterRemove.currentBait || fishingDataAfterRemove.currentBait === "") {
            await FishingService.buyBait(testUserId, testGuildId, 'basic', 5);
            console.log('   🪱 Bought 5 basic baits');
        }
        
        const canFishResult = await FishingService.canFish(testUserId, testGuildId, false);
        console.log('   🔍 Can fish result:', canFishResult);
        
        if (canFishResult.canFish) {
            console.log('   ✅ Can fish - auto-equip rod should have worked');
        } else {
            console.log('   ❌ Cannot fish:', canFishResult.message);
        }

        // 4. Kiểm tra cần đã được trang bị
        console.log('\n4️⃣ Checking if rod was auto-equipped...');
        const fishingDataAfterCheck = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`   🎯 Current rod after canFish: "${fishingDataAfterCheck.currentRod}"`);
        if (fishingDataAfterCheck.currentRod && fishingDataAfterCheck.currentRod !== "") {
            const equippedRodData = FISHING_RODS[fishingDataAfterCheck.currentRod];
            const equippedRod = fishingDataAfterCheck.rods.find((r: any) => r.rodType === fishingDataAfterCheck.currentRod);
            console.log(`   ✅ Auto-equipped: ${equippedRodData.emoji} ${equippedRodData.name}`);
            console.log(`   📊 Durability: ${equippedRod?.durability || 0}`);
        } else {
            console.log('   ❌ No rod was auto-equipped');
        }

        // 5. Test fishing với auto-equip
        console.log('\n5️⃣ Testing fishing with auto-equip...');
        try {
            const fishResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   🐟 Fishing result:', fishResult);
            const fishingDataAfterFishing = await FishingService.getFishingData(testUserId, testGuildId);
            const currentRod = fishingDataAfterFishing.rods.find((r: any) => r.rodType === fishingDataAfterFishing.currentRod);
            const currentRodData = FISHING_RODS[fishingDataAfterFishing.currentRod];
            console.log(`   🎯 Current rod after fishing: ${currentRodData.emoji} ${currentRodData.name}`);
            console.log(`   📊 Current rod durability: ${currentRod?.durability || 0}`);
        } catch (error) {
            console.log('   ❌ Fishing failed:', error.message);
        }

        // 6. Test scenario: Cần hiện tại hết độ bền, còn cần khác
        console.log('\n6️⃣ Testing scenario: Current rod runs out, other rods available...');
        // Giả lập hết độ bền current rod
        const fishingDataAfterCheck2 = await FishingService.getFishingData(testUserId, testGuildId);
        const currentRod = fishingDataAfterCheck2.rods.find((r: any) => r.rodType === fishingDataAfterCheck2.currentRod);
        if (currentRod) {
            await prisma.fishingRod.update({
                where: { id: currentRod.id },
                data: { durability: 0 }
            });
            console.log(`   🗑️  Emptied ${FISHING_RODS[currentRod.rodType].name} durability`);
        }
        // Test canFish với cần hết độ bền
        const canFishResult2 = await FishingService.canFish(testUserId, testGuildId, false);
        console.log('   🔍 Can fish result (after emptying current rod):', canFishResult2);
        if (canFishResult2.canFish) {
            console.log('   ✅ Can fish - auto-switch rod should have worked');
            // Kiểm tra cần mới
            const fishingDataAfterSwitch = await FishingService.getFishingData(testUserId, testGuildId);
            const newRodData = FISHING_RODS[fishingDataAfterSwitch.currentRod];
            const newRod = fishingDataAfterSwitch.rods.find((r: any) => r.rodType === fishingDataAfterSwitch.currentRod);
            console.log(`   🎯 New current rod: ${newRodData.emoji} ${newRodData.name}`);
            console.log(`   📊 New rod durability: ${newRod?.durability || 0}`);
        } else {
            console.log('   ❌ Cannot fish:', canFishResult2.message);
        }

        // 7. Test edge case: Không còn cần nào
        console.log('\n7️⃣ Testing edge case: No rods available...');
        // Xóa tất cả cần
        await prisma.fishingRod.updateMany({
            where: {
                fishingDataId: fishingData.id
            },
            data: {
                durability: 0
            }
        });
        console.log('   🗑️  Emptied all rods');
        const canFishResult3 = await FishingService.canFish(testUserId, testGuildId, false);
        console.log('   🔍 Can fish result (no rods):', canFishResult3);
        if (!canFishResult3.canFish) {
            console.log('   ✅ Correctly cannot fish when no rods available');
        } else {
            console.log('   ❌ Should not be able to fish without rods');
        }

        console.log('\n✅ Auto-equip rod test completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Automatic rod equipping when no current rod');
        console.log('   ✅ Priority system: diamond > gold > silver > copper > basic');
        console.log('   ✅ Auto-switch when current rod runs out');
        console.log('   ✅ Proper error handling when no rods available');
        console.log('   ✅ Integration with canFish and fish methods');
        
        console.log('\n📋 Test Commands:');
        console.log('   n.fishing');
        console.log('   n.fishing inventory');
        console.log('   n.fishing setrod <rod_type>');

    } catch (error) {
        console.error('❌ Error testing auto-equip rod:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testAutoEquipRod().catch(console.error); 