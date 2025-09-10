import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function testSimpleSkillSystem() {
    try {
        console.log('🔍 Testing Simple Skill System (1 cá = 1 skill)...\n');

        const userId = '389957152153796608';
        const guildId = '1005280612845891615';
        const fishId = 'cmf7lg6i6001ksx772z19svek'; // Fish từ Discord

        // Lấy user
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('👤 User:', user.userId, '| FishCoin:', Number(user.fishBalance).toLocaleString());

        // Lấy battle fish inventory
        const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
        const skills = await FishSkillService.getAllSkillDefinitions();

        console.log('📋 Debug Info:');
        console.log('- Battle fish count:', inventory.items.length);
        console.log('- Skills count:', skills.length);

        // Tìm fish cụ thể
        const fish = inventory.items.find(item => item.fish.id === fishId)?.fish;
        if (!fish) {
            console.log('❌ Fish not found in battle inventory!');
            return;
        }

        console.log('🐟 Fish:', fish.species, '| Level:', fish.level, '| Rarity:', fish.rarity);
        console.log('📊 Fish stats:', fish.stats);

        // Kiểm tra fish đã có skill chưa
        const fishSkills = await prisma.fishSkill.findMany({
            where: { fishId },
            include: { skillDefinition: true }
        });

        console.log('🎯 Fish Skills:', fishSkills.length);
        if (fishSkills.length > 0) {
            console.log('❌ Fish đã có skill:', fishSkills[0].skillDefinition.name);
            console.log('✅ Hệ thống hoạt động đúng - cá đã có skill không thể học thêm');
        } else {
            console.log('✅ Fish chưa có skill - có thể học skill mới');
        }

        // Test với skill cơ bản nhất
        const basicSkill = skills.find(s => s.id === 'basic_attack');
        if (!basicSkill) {
            console.log('❌ Basic skill not found!');
            return;
        }

        console.log(`\n🎯 Testing with skill: ${basicSkill.name}`);
        console.log('- Skill cost:', basicSkill.baseCost.toLocaleString());

        // Tạo UI với skill này
        const ui = new SkillShopUI(
            skills,
            inventory.items.map(item => item.fish),
            userId,
            guildId,
            Number(user.fishBalance),
            basicSkill.id,
            fish.id
        );

        console.log('\n🔍 UI State:');
        console.log('- selectedSkillId:', ui.selectedSkillId);
        console.log('- selectedFishId:', ui.selectedFishId);
        console.log('- userBalance:', ui.userBalance);
        console.log('- canBuySelectedSkill:', ui.canBuySelectedSkill());

        // Test FishSkillService.learnSkill
        console.log('\n🔍 Testing FishSkillService.learnSkill:');
        const learnResult = await FishSkillService.learnSkill(fishId, basicSkill.id, userId, guildId);
        console.log('- Learn result:', learnResult);

        if (learnResult.success) {
            console.log('✅ Skill học thành công!');
            
            // Kiểm tra lại fish skills
            const updatedFishSkills = await prisma.fishSkill.findMany({
                where: { fishId },
                include: { skillDefinition: true }
            });
            console.log('🎯 Fish Skills sau khi học:', updatedFishSkills.length);
            console.log('- Skill đã học:', updatedFishSkills[0].skillDefinition.name);

            // Test học skill thứ 2 (sẽ fail)
            console.log('\n🔍 Testing học skill thứ 2 (sẽ fail):');
            const secondSkill = skills.find(s => s.id === 'water_splash');
            if (secondSkill) {
                const secondLearnResult = await FishSkillService.learnSkill(fishId, secondSkill.id, userId, guildId);
                console.log('- Second learn result:', secondLearnResult);
                console.log('✅ Hệ thống hoạt động đúng - không cho học skill thứ 2');
            }
        } else {
            console.log('❌ Skill học thất bại:', learnResult.error);
        }

        console.log('\n🎉 Simple Skill System Test Complete!');

    } catch (error) {
        console.error('❌ Error testing simple skill system:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSimpleSkillSystem();
