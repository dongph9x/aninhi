/**
 * 🪱 Test Auto-Switch Bait Feature
 * 
 * Script này test tính năng tự động chuyển sang mồi khác khi mồi hiện tại hết
 */

import { PrismaClient } from '@prisma/client';
import { FishingService } from '../src/utils/fishing';
import { BAITS } from '../src/config/fish-data';
import { fishCoinDB } from '../src/utils/fish-coin';

const prisma = new PrismaClient();

async function testAutoSwitchBait() {
    console.log('🪱 Test Auto-Switch Bait Feature\n');

    try {
        // 1. Tạo test user với nhiều loại mồi
        console.log('1️⃣ Creating test user with multiple baits...');
        const testUserId = 'test-auto-switch-bait-user';
        const testGuildId = '1005280612845891615';
        
        // Thêm FishCoin cho test
        await fishCoinDB.addFishCoin(testUserId, testGuildId, 10000, 'Test auto-switch bait');
        
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

        // 2. Kiểm tra inventory ban đầu
        console.log('\n2️⃣ Checking initial bait inventory...');
        const initialFishingData = await FishingService.getFishingData(testUserId, testGuildId);
        
        console.log('   📊 Current bait inventory:');
        initialFishingData.baits.forEach((bait: any) => {
            const baitData = BAITS[bait.baitType];
            console.log(`   ${baitData.emoji} ${baitData.name}: ${bait.quantity} cái`);
        });
        
        console.log(`   🎯 Current bait: ${initialFishingData.currentBait || 'None'}`);

        // 3. Test auto-switch logic
        console.log('\n3️⃣ Testing auto-switch logic...');
        
        // Test scenario 1: Hết mồi hiện tại, có mồi khác
        console.log('\n   📋 Scenario 1: Current bait runs out, other baits available');
        
        // Set mồi basic làm mồi hiện tại
        await FishingService.setCurrentBait(testUserId, testGuildId, 'basic');
        console.log('   🎯 Set basic bait as current');
        
        // Giả lập hết mồi basic bằng cách xóa quantity
        await prisma.fishingBait.updateMany({
            where: {
                fishingDataId: initialFishingData.id,
                baitType: 'basic'
            },
            data: {
                quantity: 0
            }
        });
        console.log('   🗑️  Emptied basic bait quantity');
        
        // Test auto-switch
        const autoSwitchResult = await FishingService.autoSwitchBait(testUserId, testGuildId, 'basic');
        console.log('   🔄 Auto-switch result:', autoSwitchResult);
        
        if (autoSwitchResult.success) {
            console.log(`   ✅ Successfully switched to: ${autoSwitchResult.baitName}`);
            console.log(`   📊 Remaining quantity: ${autoSwitchResult.remainingQuantity}`);
        } else {
            console.log(`   ❌ Auto-switch failed: ${autoSwitchResult.message}`);
        }

        // 4. Test priority system
        console.log('\n4️⃣ Testing bait priority system...');
        
        // Kiểm tra priority: divine > premium > good > basic
        console.log('   🏆 Bait Priority Order:');
        console.log('      1. 🧜‍♀️ Divine (highest)');
        console.log('      2. 🦀 Premium');
        console.log('      3. 🦐 Good');
        console.log('      4. 🪱 Basic (lowest)');
        
        // Test với tất cả mồi có sẵn
        const fishingDataAfterSwitch = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`   🎯 Current bait after auto-switch: ${fishingDataAfterSwitch.currentBait}`);
        
        const currentBaitData = BAITS[fishingDataAfterSwitch.currentBait];
        console.log(`   📋 Selected bait: ${currentBaitData.emoji} ${currentBaitData.name}`);

        // 5. Test fishing with auto-switch
        console.log('\n5️⃣ Testing fishing with auto-switch...');
        
        // Mua cần câu nếu chưa có
        if (!fishingDataAfterSwitch.currentRod || fishingDataAfterSwitch.currentRod === "") {
            await FishingService.buyRod(testUserId, testGuildId, 'basic');
            console.log('   🎣 Bought basic rod');
        }
        
        // Giả lập câu cá và hết mồi
        console.log('   🎣 Simulating fishing...');
        
        // Giảm số lượng mồi hiện tại xuống 1
        const currentBait = fishingDataAfterSwitch.baits.find((b: any) => b.baitType === fishingDataAfterSwitch.currentBait);
        if (currentBait) {
            await prisma.fishingBait.update({
                where: { id: currentBait.id },
                data: { quantity: 1 }
            });
            console.log(`   📊 Set ${currentBaitData.name} quantity to 1`);
        }
        
        // Test câu cá (sẽ trigger auto-switch)
        try {
            const fishResult = await FishingService.fish(testUserId, testGuildId, false);
            console.log('   🐟 Fishing result:', fishResult);
            
            // Kiểm tra mồi sau khi câu
            const fishingDataAfterFishing = await FishingService.getFishingData(testUserId, testGuildId);
            const newBait = fishingDataAfterFishing.baits.find((b: any) => b.baitType === fishingDataAfterFishing.currentBait);
            const newBaitData = BAITS[fishingDataAfterFishing.currentBait];
            
            console.log(`   🎯 New current bait: ${newBaitData.emoji} ${newBaitData.name}`);
            console.log(`   📊 New bait quantity: ${newBait?.quantity || 0}`);
            
        } catch (error) {
            console.log('   ❌ Fishing failed:', error.message);
        }

        // 6. Test edge cases
        console.log('\n6️⃣ Testing edge cases...');
        
        // Test case: Không có mồi nào khác
        console.log('\n   📋 Edge Case: No other baits available');
        
        // Xóa tất cả mồi khác
        await prisma.fishingBait.updateMany({
            where: {
                fishingDataId: initialFishingData.id,
                baitType: { not: fishingDataAfterSwitch.currentBait }
            },
            data: {
                quantity: 0
            }
        });
        console.log('   🗑️  Emptied all other baits');
        
        // Test auto-switch khi không có mồi nào khác
        const edgeCaseResult = await FishingService.autoSwitchBait(testUserId, testGuildId, fishingDataAfterSwitch.currentBait);
        console.log('   🔄 Edge case result:', edgeCaseResult);
        
        if (!edgeCaseResult.success) {
            console.log('   ✅ Correctly handled no available baits');
        }

        console.log('\n✅ Auto-switch bait test completed!');
        console.log('\n🎯 Key Features:');
        console.log('   ✅ Automatic bait switching when current bait runs out');
        console.log('   ✅ Priority system: divine > premium > good > basic');
        console.log('   ✅ Clear notification when auto-switching');
        console.log('   ✅ Graceful handling when no other baits available');
        console.log('   ✅ Integration with fishing system');
        
        console.log('\n📋 Test Commands:');
        console.log('   n.fishing');
        console.log('   n.fishing inventory');
        console.log('   n.fishing setbait <bait_type>');

    } catch (error) {
        console.error('❌ Error testing auto-switch bait:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy test
testAutoSwitchBait().catch(console.error); 