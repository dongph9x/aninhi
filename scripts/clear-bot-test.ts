import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clearBotTestData() {
  console.log('🧹 Clearing BOT test data...');
  
  const testGuildId = 'test-guild-bot-opponent-123';
  
  try {
    // Xóa battle history trước (vì có thể reference đến fish)
    await prisma.battleHistory.deleteMany({
      where: { guildId: testGuildId }
    });
    console.log('✅ Cleared battle history');
    
    // Xóa battle inventory items
    await prisma.battleFishInventoryItem.deleteMany({
      where: {
        battleFishInventory: {
          guildId: testGuildId
        }
      }
    });
    console.log('✅ Cleared battle inventory items');
    
    // Xóa battle inventory
    await prisma.battleFishInventory.deleteMany({
      where: { guildId: testGuildId }
    });
    console.log('✅ Cleared battle inventory');
    
    // Xóa fish
    await prisma.fish.deleteMany({
      where: { guildId: testGuildId }
    });
    console.log('✅ Cleared fish');
    
    // Bỏ qua việc xóa users vì có thể có foreign key constraints
    console.log('⚠️ Skipped clearing users (foreign key constraints)');
    
    console.log('🎉 BOT test data cleared successfully!');
    
  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clearBotTestData();
