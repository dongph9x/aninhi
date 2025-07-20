import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearAllData() {
    console.log('🧹 Clearing all data from database...\n');

    try {
        // Xóa theo thứ tự để tránh lỗi foreign key constraint
        // 1. Xóa các bảng con trước
        
        console.log('🗑️ Deleting fish food...');
        await prisma.fishFood.deleteMany({});
        console.log('✅ Fish food deleted');

        console.log('🗑️ Deleting caught fish...');
        await prisma.caughtFish.deleteMany({});
        console.log('✅ Caught fish deleted');

        console.log('🗑️ Deleting fishing rods...');
        await prisma.fishingRod.deleteMany({});
        console.log('✅ Fishing rods deleted');

        console.log('🗑️ Deleting fishing baits...');
        await prisma.fishingBait.deleteMany({});
        console.log('✅ Fishing baits deleted');

        console.log('🗑️ Deleting fish inventory items...');
        await prisma.fishInventoryItem.deleteMany({});
        console.log('✅ Fish inventory items deleted');

        console.log('🗑️ Deleting battle fish inventory items...');
        await prisma.battleFishInventoryItem.deleteMany({});
        console.log('✅ Battle fish inventory items deleted');

        console.log('🗑️ Deleting inventory items...');
        await prisma.inventoryItem.deleteMany({});
        console.log('✅ Inventory items deleted');

        console.log('🗑️ Deleting tournament messages...');
        await prisma.tournamentMessage.deleteMany({});
        console.log('✅ Tournament messages deleted');

        console.log('🗑️ Deleting tournament participants...');
        await prisma.tournamentParticipant.deleteMany({});
        console.log('✅ Tournament participants deleted');

        // 2. Xóa các bảng chính
        
        console.log('🗑️ Deleting fishing data...');
        await prisma.fishingData.deleteMany({});
        console.log('✅ Fishing data deleted');

        console.log('🗑️ Deleting fish inventory...');
        await prisma.fishInventory.deleteMany({});
        console.log('✅ Fish inventory deleted');

        console.log('🗑️ Deleting battle fish inventory...');
        await prisma.battleFishInventory.deleteMany({});
        console.log('✅ Battle fish inventory deleted');

        console.log('🗑️ Deleting inventory...');
        await prisma.inventory.deleteMany({});
        console.log('✅ Inventory deleted');

        console.log('🗑️ Deleting game stats...');
        await prisma.gameStats.deleteMany({});
        console.log('✅ Game stats deleted');

        console.log('🗑️ Deleting transactions...');
        await prisma.transaction.deleteMany({});
        console.log('✅ Transactions deleted');

        console.log('🗑️ Deleting daily claims...');
        await prisma.dailyClaim.deleteMany({});
        console.log('✅ Daily claims deleted');

        console.log('🗑️ Deleting battle history...');
        await prisma.battleHistory.deleteMany({});
        console.log('✅ Battle history deleted');

        console.log('🗑️ Deleting breeding history...');
        await prisma.breedingHistory.deleteMany({});
        console.log('✅ Breeding history deleted');

        console.log('🗑️ Deleting fish prices...');
        await prisma.fishPrice.deleteMany({});
        console.log('✅ Fish prices deleted');

        console.log('🗑️ Deleting fish market...');
        await prisma.fishMarket.deleteMany({});
        console.log('✅ Fish market deleted');

        console.log('🗑️ Deleting moderation logs...');
        await prisma.moderationLog.deleteMany({});
        console.log('✅ Moderation logs deleted');

        console.log('🗑️ Deleting ban records...');
        await prisma.banRecord.deleteMany({});
        console.log('✅ Ban records deleted');

        // 3. Xóa users và tournaments cuối cùng
        
        console.log('🗑️ Deleting users...');
        await prisma.user.deleteMany({});
        console.log('✅ Users deleted');

        console.log('🗑️ Deleting tournaments...');
        await prisma.tournament.deleteMany({});
        console.log('✅ Tournaments deleted');

        console.log('\n🎉 All data cleared successfully!');
        console.log('📊 Database is now empty and ready for fresh start.');

    } catch (error) {
        console.error('❌ Error clearing data:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

clearAllData().catch(console.error); 