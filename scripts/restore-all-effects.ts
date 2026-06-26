import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreAllEffects() {
  try {
    console.log('🔧 Khôi phục success rate và effect chances gốc...');
    
    // Tìm skill definition
    const skillDef = await prisma.fishSkillDefinition.findFirst({
      where: { name: 'Hắc Ám Tuyệt Đối' }
    });
    
    if (!skillDef) {
      console.log('❌ Không tìm thấy skill "Hắc Ám Tuyệt Đối"');
      return;
    }
    
    // Khôi phục về giá trị gốc
    const originalEffects = {
      effectIds: ["skill_lock", "darkness_curse"],
      effectChances: {
        skill_lock: 0.8,      // 80% chance
        darkness_curse: 0.6   // 60% chance
      },
      effectIntensities: {
        darkness_curse: 0.4
      }
    };
    
    await prisma.fishSkillDefinition.update({
      where: { id: skillDef.id },
      data: { 
        baseSuccessRate: 0.4,  // 40% success rate
        effects: originalEffects
      }
    });
    
    console.log('✅ Đã khôi phục về giá trị gốc:');
    console.log('📊 Success rate: 40%');
    console.log('🎭 Skill Lock chance: 80%');
    console.log('🌑 Darkness Curse chance: 60%');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreAllEffects();
