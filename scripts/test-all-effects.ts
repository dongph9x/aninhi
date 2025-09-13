import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testAllEffects() {
  try {
    console.log('🔧 Tăng success rate và effect chances lên 100% để test...');
    
    // Tìm skill definition
    const skillDef = await prisma.fishSkillDefinition.findFirst({
      where: { name: 'Hắc Ám Tuyệt Đối' }
    });
    
    if (!skillDef) {
      console.log('❌ Không tìm thấy skill "Hắc Ám Tuyệt Đối"');
      return;
    }
    
    console.log(`📋 Skill hiện tại: ${skillDef.name}`);
    console.log(`📊 Success rate hiện tại: ${skillDef.baseSuccessRate * 100}%`);
    console.log(`🎭 Effects hiện tại:`, skillDef.effects);
    
    // Tăng success rate và effect chances lên 100%
    const updatedEffects = {
      ...skillDef.effects,
      effectChances: {
        skill_lock: 1.0,      // 100% chance
        darkness_curse: 1.0   // 100% chance
      }
    };
    
    await prisma.fishSkillDefinition.update({
      where: { id: skillDef.id },
      data: { 
        baseSuccessRate: 1.0,  // 100% success rate
        effects: updatedEffects
      }
    });
    
    console.log('✅ Đã tăng success rate và effect chances lên 100%');
    console.log('🎯 Bây giờ hãy test battle để xem CẢ 2 effects!');
    console.log('⚠️  Nhớ chạy script restore-all-effects.ts sau khi test xong!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAllEffects();
