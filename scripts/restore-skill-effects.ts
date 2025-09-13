import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restoreSkillEffects() {
  try {
    console.log('🔧 Khôi phục success rate gốc của "Hắc Ám Tuyệt Đối"...');
    
    // Tìm skill definition
    const skillDef = await prisma.fishSkillDefinition.findFirst({
      where: { name: 'Hắc Ám Tuyệt Đối' }
    });
    
    if (!skillDef) {
      console.log('❌ Không tìm thấy skill "Hắc Ám Tuyệt Đối"');
      return;
    }
    
    // Khôi phục success rate gốc = 0.4 (40%)
    await prisma.fishSkillDefinition.update({
      where: { id: skillDef.id },
      data: { baseSuccessRate: 0.4 }
    });
    
    console.log('✅ Đã khôi phục success rate về 40%');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

restoreSkillEffects();
