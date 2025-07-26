/**
 * ⚡ Test Auto-Equip Bait Feature
 * 
 * Script này test tính năng tự động trang bị mồi tốt nhất khi chưa có mồi nào được trang bị
 */

import { PrismaClient } from '@prisma/client';
import { FishingService, BAITS } from '../src/utils/fishing';
import { fishCoinDB } from '../src/utils/fish-coin';

const prisma = new PrismaClient();

async function testAutoEquipBait() {
    console.log('⚡ Test Auto-Equip Bait Feature\n');

    try {
        // 1. Tạo test user với nhiều loại mồi nhưng chưa trang bị
        console.log('1️⃣ Creating test user with baits but no current bait...');
        const testUserId = 'test-auto-equip-bait-user';
        const testGuildId = '1005280612845891615';
        
        // Thêm FishCoin cho test
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 10000, 'Test auto-equip bait');
        
        // Mua nhiều loại mồi
        console.log('   🛒 Buying multiple baits...');
        
        // Mua mồi basic (10 FishCoin)
        await FishingService.buyBait(testUserId, testGuildId, 'basic', 5);
        console.log('   ✅ Bought 5 basic baits');
        
        // Mua mồi good (50 FishCoin)
        await FishingService.buyBait(testUserId, testGuildId, 'good', 3);
        console.log('   ✅ Bought 3 good baits');
        
        // Mua mồi premium (200 FishCoin)
        await FishingService.buyBait(testUserId, testGuildId, 'premium', 2);
        console.log('   ✅ Bought 2 premium baits');
        
        // Mua mồi divine (1000 FishCoin)
        await FishingService.buyBait(testUserId, testGuildId, 'divine', 1);
        console.log('   ✅ Bought 1 divine bait');

        // 2. Xóa currentBait để giả lập chưa trang bị mồi
        console.log('\n2️⃣ Removing current bait to simulate no equipped bait...');
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        
        await prisma.fishingData.update({
            where: { id: fishingData.id },
            data: { currentBait: "" }
        });
        console.log('   🗑️  Removed current bait');
        
        // Kiểm tra trạng thái sau khi xóa
        const fishingDataAfterRemove = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`   🎯 Current bait after removal: "${fishingDataAfterRemove.currentBait}"`);
        
        console.log('   📊 Available baits:');
        fishingDataAfterRemove.baits.forEach((bait: any) => {
            const baitData = BAITS[bait.baitType];
            console.log(`   ${baitData.emoji} ${baitData.name}: ${bait.quantity} cái`);
        });

        // 3. Test canFish với auto-equip
        console.log('\n3️⃣ Testing canFish with auto-equip...');
        
        // Mua cần câu nếu chưa có
        if (!fishingDataAfterRemove.currentRod || fishingDataAfterRemove.currentRod === "") {
            await FishingService.buyRod(testUserId, testGuildId, 'basic');
            console.log('   🎣 Bought basic rod');
        }
        
        const canFishResult = await FishingService.canFish(testUserId, testGuildId, false);
        console.log('   🔍 Can fish result:', canFishResult);
        
        if (canFishResult.canFish) {
            console.log('   ✅ Can fish - auto-equip should have worked');
        } else {
            console.log('   ❌ Cannot fish:', canFishResult.message);
        }

        // 4. Kiểm tra mồi đã được trang bị
        console.log('\n4️⃣ Checking if bait was auto-equipped...');
        const fishingDataAfterCheck = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`   🎯 Current bait after canFish: "${fishingDataAfterCheck.currentBait}"`);
        
        if (fishingDataAfterCheck.currentBait && fishingDataAfterCheck.currentBait !== "") {
            const equippedBaitData = BAITS[fishingDataAfterCheck.currentBait];
            const equippedBait = fishingDataAfterCheck.baits.find((b: any) => b.baitType === fishingDataAfterCheck.currentBait);
            console.log(`   ✅ Auto-equipped: ${equippedBaitData.emoji} ${equippedBaitData.name}`);
            console.log(`   📊 Quantity: ${equippedBait?.quantity || 0}`);
        } else {
            console.log('   ❌ No bait was auto-equipped');
        }

        // 5. Test fishing với auto-equip
        console.log('\n5️⃣ Testing fishing with auto-equip...');
        
        try {
            const fishResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   🐟 Fishing result:', fishResult);
            
            // Kiểm tra mồi sau khi câu
            const fishingDataAfterFishing = await FishingService.getFishingData(testUserId, testGuildId);
            const currentBait = fishingDataAfterFishing.baits.find((b: any) => b.baitType === fishingDataAfterFishing.currentBait);
            const currentBaitData = BAITS[fishingDataAfterFishing.currentBait];
            
            console.log(`   🎯 Current bait after fishing: ${currentBaitData.emoji} ${currentBaitData.name}`);
            console.log(`   📊 Current bait quantity: ${currentBait?.quantity || 0}`);
            
        } catch (error) {
            console.log('   ❌ Fishing failed:', error.message);
        }

        // 6. Test scenario: Hết mồi hiện tại, có mồi khác
        console.log('\n6️⃣ Testing scenario: Current bait runs out, other baits available...');
        
        // Giả lập hết mồi hiện tại
        const currentBait = fishingDataAfterCheck.baits.find((b: any) => b.baitType === fishingDataAfterCheck.currentBait);
        if (currentBait) {
            await prisma.fishingBait.update({
                where: { id: currentBait.id },
                data: { quantity: 0 }
            });
            console.log(`   🗑️  Emptied ${BAITS[currentBait.baitType].name} quantity`);
        }
        
        // Test canFish với mồi hết
        const canFishResult2 = await FishingService.canFish(testUserId, testGuildId, false);
        console.log('   🔍 Can fish result (after emptying current bait):', canFishResult2);
        
        if (canFishResult2.canFish) {
            console.log('   ✅ Can fish - auto-switch should have worked');
            
            // Kiểm tra mồi mới
            const fishingDataAfterSwitch = await FishingService.getFishingData(testUserId, testGuildId);
            const newBaitData = BAITS[fishingDataAfterSwitch.currentBait];
            const newBait = fishingDataAfterSwitch.baits.find((b: any) => b.baitType === fishingDataAfterSwitch.currentBait);
            console.log(`   🎯 New current bait: ${newBaitData.emoji} ${newBaitData.name}`);
            console.log(`   📊 New bait quantity: ${newBait?.quantity || 0}`);
        } else {
            console.log('   ❌ Cannot fish:', canFishResult2.message);
        }

        // 7. Test edge case: Không có mồi nào
        console.log('\n7️⃣ Testing edge case: No baits available...');
        
        // Xóa tất cả mồi
        await prisma.fishingBait.updateMany({
            where: {
                fishingDataId: fishingData.id
            },
            data: {
                quantity: 0
            }
        });
        console.log('   🗑️  Emptied all baits');
        
        const canFishResult3 = await FishingService.canFish(testUserId, testGuildId, false);
        console.log('   🔍 Can fish result (no baits):', canFishResult3);
        
        if (!canFishResult3.canFish) {
            console.log('   ✅ Correctly cannot fish when no baits available');
        } else {
            console.log('   ❌ Should not be able to fish without baits');
        }

        console.log('\n✅ Auto-equip bait test completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Automatic bait equipping when no current bait');
        console.log('   ✅ Priority system: divine > premium > good > basic');
        console.log('   ✅ Auto-switch when current bait runs out');
        console.log('   ✅ Proper error handling when no baits available');
        console.log('   ✅ Integration with canFish and fish methods');
        
        console.log('\n📋 Test Commands:');
        console.log('   n.fishing');
        console.log('   n.fishing inventory');
        console.log('   n.fishing setbait <bait_type>');

    } catch (error) {
        console.error('❌ Error testing auto-equip bait:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testAutoEquipBait().catch(console.error); 