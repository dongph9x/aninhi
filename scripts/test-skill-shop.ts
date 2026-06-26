import prisma from '../src/utils/prisma';
import { FishSkillService } from '../src/utils/fish-skills';
import { FishSkillHelper } from '../src/config/fish-skills';

async function testSkillShop() {
    try {
        console.log('🚀 Testing Skill Shop System...\n');

        // Lấy user test-skill-user
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId: 'test-skill-user', guildId: 'test-guild' } }
        });

        if (!user) {
            console.log('❌ Không tìm thấy user nào có FishCoin!');
            return;
        }

        console.log('👤 User:', user.userId, '| FishCoin:', Number(user.fishBalance));

        // Lấy fish của user này
        const fish = await prisma.fish.findFirst({
            where: { userId: user.userId, guildId: user.guildId }
        });

        if (!fish) {
            console.log('❌ Không tìm thấy fish nào!');
            return;
        }

        console.log('🐟 Fish:', fish.species, '| Level:', fish.level, '| Rarity:', fish.rarity);
        console.log('📊 Stats:', fish.stats);

        // Lấy tất cả skills
        const skills = await FishSkillService.getAllSkillDefinitions();
        console.log('\n📋 Available Skills:');
        
        for (const skill of skills) {
            console.log(`\n🎯 ${skill.name} (${skill.element})`);
            console.log(`💰 Cost: ${skill.baseCost.toLocaleString()} FishCoin`);
            console.log(`📋 Requirements:`, skill.requirements);
            
            // Test canLearnSkill
            const canLearn = FishSkillHelper.canLearnSkill(fish, skill);
            console.log(`✅ Can Learn: ${canLearn.canLearn}`);
            if (!canLearn.canLearn) {
                console.log(`❌ Reason: ${canLearn.reason}`);
            }
            
            // Test có đủ tiền không
            const hasEnoughMoney = Number(user.fishBalance) >= skill.baseCost;
            console.log(`💰 Has Enough Money: ${hasEnoughMoney}`);
            
            // Test tổng thể
            const canBuy = canLearn.canLearn && hasEnoughMoney;
            console.log(`🛒 Can Buy: ${canBuy}`);
        }

        // Test với một skill cụ thể
        console.log('\n🔍 Testing specific skill...');
        const testSkill = skills.find(s => s.id === 'fire_blast');
        if (testSkill) {
            console.log(`\n🔥 Testing ${testSkill.name}:`);
            console.log('Fish stats type:', typeof fish.stats);
            
            // Parse stats nếu cần
            let fishStats = fish.stats;
            if (typeof fishStats === 'string') {
                try {
                    fishStats = JSON.parse(fishStats);
                    console.log('Parsed stats:', fishStats);
                } catch (e) {
                    console.log('Error parsing stats:', e);
                }
            }
            
            const canLearn = FishSkillHelper.canLearnSkill(fish, testSkill);
            console.log('Can learn result:', canLearn);
        }

    } catch (error) {
        console.error('❌ Error testing skill shop:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillShop();
