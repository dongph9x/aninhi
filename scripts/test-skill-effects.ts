import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testSkillEffects() {
  try {
    console.log('🔧 Tạm thời tăng success rate của "Hắc Ám Tuyệt Đối" lên 100% để test effects...');
    
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
    
    // Tạm thời set success rate = 1.0 (100%)
    await prisma.fishSkillDefinition.update({
      where: { id: skillDef.id },
      data: { baseSuccessRate: 1.0 }
    });
    
    console.log('✅ Đã tăng success rate lên 100%');
    console.log('🎯 Bây giờ hãy test battle để xem effects!');
    console.log('⚠️  Nhớ chạy script restore-skill-effects.ts sau khi test xong!');
    
  } catch (error) {
    console.error('❌ Lỗi:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSkillEffects();
