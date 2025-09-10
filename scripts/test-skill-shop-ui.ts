import prisma from '../src/utils/prisma';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function testSkillShopUI() {
    try {
        console.log('🚀 Testing Skill Shop UI...\n');

        // Lấy user và fish test
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId: 'test-skill-user', guildId: 'test-guild' } }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        // Lấy fish từ battle inventory
        const battleInventory = await prisma.battleFishInventory.findUnique({
            where: { userId_guildId: { userId: user.userId, guildId: user.guildId } },
            include: {
                items: {
                    include: {
                        fish: true
                    }
                }
            }
        });

        if (!battleInventory || battleInventory.items.length === 0) {
            console.log('❌ No fish in battle inventory!');
            return;
        }

        const fish = battleInventory.items[0].fish;
        console.log('🐟 Fish:', fish.species, '| Level:', fish.level, '| Rarity:', fish.rarity);

        // Lấy skills
        const skills = await FishSkillService.getAllSkillDefinitions();
        console.log('📋 Skills count:', skills.length);

        // Test UI với skill được chọn
        const testSkill = skills.find(s => s.id === 'fire_blast');
        if (!testSkill) {
            console.log('❌ Test skill not found!');
            return;
        }

        console.log('\n🔍 Testing UI with selected skill:', testSkill.name);

        const ui = new SkillShopUI(
            skills,
            [fish],
            user.userId,
            user.guildId,
            Number(user.fishBalance),
            testSkill.id,
            fish.id
        );

        console.log('✅ UI created');
        console.log('🔍 Can buy skill:', ui.canBuySelectedSkill());

        // Test UI không có skill được chọn
        console.log('\n🔍 Testing UI without selected skill:');
        const uiNoSkill = new SkillShopUI(
            skills,
            [fish],
            user.userId,
            user.guildId,
            Number(user.fishBalance)
        );

        console.log('🔍 Can buy skill (no selection):', uiNoSkill.canBuySelectedSkill());

        // Test UI không có cá được chọn
        console.log('\n🔍 Testing UI without selected fish:');
        const uiNoFish = new SkillShopUI(
            skills,
            [fish],
            user.userId,
            user.guildId,
            Number(user.fishBalance),
            testSkill.id
        );

        console.log('🔍 Can buy skill (no fish):', uiNoFish.canBuySelectedSkill());

    } catch (error) {
        console.error('❌ Error testing skill shop UI:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillShopUI();
