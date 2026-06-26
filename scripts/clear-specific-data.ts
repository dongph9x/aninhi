import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearSpecificData() {
    console.log('🧹 Clear Specific Data Options:\n');
    console.log('1. Clear all fishing data');
    console.log('2. Clear all user data');
    console.log('3. Clear all tournament data');
    console.log('4. Clear all battle data');
    console.log('5. Clear all inventory data');
    console.log('6. Clear all transaction data');
    console.log('7. Clear all moderation data');
    console.log('8. Clear all game stats');
    console.log('9. Clear all fish prices');
    console.log('10. Clear everything (reset database)');
    console.log('0. Exit\n');

    // Để đơn giản, tôi sẽ tạo các function riêng cho từng loại
    console.log('📋 Available functions:');
    console.log('- clearFishingData()');
    console.log('- clearUserData()');
    console.log('- clearTournamentData()');
    console.log('- clearBattleData()');
    console.log('- clearInventoryData()');
    console.log('- clearTransactionData()');
    console.log('- clearModerationData()');
    console.log('- clearGameStats()');
    console.log('- clearFishPrices()');
    console.log('- clearAllData()');
}

async function clearFishingData() {
    console.log('🎣 Clearing fishing data...');
    try {
        await prisma.caughtFish.deleteMany({});
        await prisma.fishingRod.deleteMany({});
        await prisma.fishingBait.deleteMany({});
        await prisma.fishingData.deleteMany({});
        await prisma.fishFood.deleteMany({});
        console.log('✅ All fishing data cleared!');
    } catch (error) {
        console.error('❌ Error clearing fishing data:', error);
    }
}

async function clearUserData() {
    console.log('👥 Clearing user data...');
    try {
        await prisma.user.deleteMany({});
        console.log('✅ All user data cleared!');
    } catch (error) {
        console.error('❌ Error clearing user data:', error);
    }
}

async function clearTournamentData() {
    console.log('🏆 Clearing tournament data...');
    try {
        await prisma.tournamentParticipant.deleteMany({});
        await prisma.tournamentMessage.deleteMany({});
        await prisma.tournament.deleteMany({});
        console.log('✅ All tournament data cleared!');
    } catch (error) {
        console.error('❌ Error clearing tournament data:', error);
    }
}

async function clearBattleData() {
    console.log('⚔️ Clearing battle data...');
    try {
        await prisma.battleHistory.deleteMany({});
        await prisma.battleFishInventory.deleteMany({});
        console.log('✅ All battle data cleared!');
    } catch (error) {
        console.error('❌ Error clearing battle data:', error);
    }
}

async function clearInventoryData() {
    console.log('📦 Clearing inventory data...');
    try {
        await prisma.inventoryItem.deleteMany({});
        await prisma.inventory.deleteMany({});
        await prisma.fishInventory.deleteMany({});
        await prisma.fishInventoryItem.deleteMany({});
        await prisma.battleFishInventoryItem.deleteMany({});
        console.log('✅ All inventory data cleared!');
    } catch (error) {
        console.error('❌ Error clearing inventory data:', error);
    }
}

async function clearTransactionData() {
    console.log('💰 Clearing transaction data...');
    try {
        await prisma.transaction.deleteMany({});
        console.log('✅ All transaction data cleared!');
    } catch (error) {
        console.error('❌ Error clearing transaction data:', error);
    }
}

async function clearModerationData() {
    console.log('🛡️ Clearing moderation data...');
    try {
        await prisma.moderationLog.deleteMany({});
        await prisma.banRecord.deleteMany({});
        console.log('✅ All moderation data cleared!');
    } catch (error) {
        console.error('❌ Error clearing moderation data:', error);
    }
}

async function clearGameStats() {
    console.log('📊 Clearing game stats...');
    try {
        await prisma.gameStats.deleteMany({});
        console.log('✅ All game stats cleared!');
    } catch (error) {
        console.error('❌ Error clearing game stats:', error);
    }
}

async function clearFishPrices() {
    console.log('🐟 Clearing fish prices...');
    try {
        await prisma.fishPrice.deleteMany({});
        console.log('✅ All fish prices cleared!');
    } catch (error) {
        console.error('❌ Error clearing fish prices:', error);
    }
}

async function clearAllData() {
    console.log('🧹 Clearing ALL data...');
    try {
        // Xóa theo thứ tự để tránh lỗi foreign key constraint
        await prisma.fishFood.deleteMany({});
        await prisma.caughtFish.deleteMany({});
        await prisma.fishingRod.deleteMany({});
        await prisma.fishingBait.deleteMany({});
        await prisma.fishingData.deleteMany({});
        await prisma.fishPrice.deleteMany({});
        await prisma.transaction.deleteMany({});
        await prisma.dailyClaim.deleteMany({});
        await prisma.gameStats.deleteMany({});
        await prisma.tournamentParticipant.deleteMany({});
        await prisma.tournamentMessage.deleteMany({});
        await prisma.tournament.deleteMany({});
        await prisma.battleHistory.deleteMany({});
        await prisma.battleFishInventory.deleteMany({});
        await prisma.breedingHistory.deleteMany({});
        await prisma.inventoryItem.deleteMany({});
        await prisma.inventory.deleteMany({});
        await prisma.fishInventory.deleteMany({});
        await prisma.fishInventoryItem.deleteMany({});
        await prisma.battleFishInventoryItem.deleteMany({});
        await prisma.moderationLog.deleteMany({});
        await prisma.banRecord.deleteMany({});
        await prisma.user.deleteMany({});
        
        console.log('✅ ALL data cleared successfully!');
    } catch (error) {
        console.error('❌ Error clearing all data:', error);
    }
}

// Export các function để có thể sử dụng riêng lẻ
export {
    clearFishingData,
    clearUserData,
    clearTournamentData,
    clearBattleData,
    clearInventoryData,
    clearTransactionData,
    clearModerationData,
    clearGameStats,
    clearFishPrices,
    clearAllData
};

// Chạy menu nếu file được chạy trực tiếp
if (require.main === module) {
    clearSpecificData().catch(console.error);
} 