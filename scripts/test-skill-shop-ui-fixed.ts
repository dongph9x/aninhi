import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function testSkillShopUIFixed() {
    try {
        console.log('🚀 Testing Fixed Skill Shop UI...\n');

        const userId = 'test-skill-user';
        const guildId = 'test-guild';

        // Lấy user
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId, guildId } }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        // Lấy battle fish inventory
        const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
        const skills = await FishSkillService.getAllSkillDefinitions();

        console.log('📋 Test Results:');
        console.log('- User FishCoin:', Number(user.fishBalance).toLocaleString());
        console.log('- Battle fish count:', inventory.items.length);
        console.log('- Skills count:', skills.length);

        // Test UI ban đầu (không có selection)
        console.log('\n🔍 Test 1: Initial UI (no selection)');
        const ui1 = new SkillShopUI(
            skills,
            inventory.items.map(item => item.fish),
            userId,
            guildId,
            Number(user.fishBalance)
        );
        
        const embed1 = ui1.createEmbed();
        const components1 = ui1.createComponents();
        
        console.log('- Can buy skill:', ui1.canBuySelectedSkill());
        console.log('- Selected skill ID:', ui1.selectedSkillId);
        console.log('- Selected fish ID:', ui1.selectedFishId);
        console.log('- Components count:', components1.length);

        // Test UI với skill được chọn
        console.log('\n🔍 Test 2: UI with skill selected');
        const ui2 = new SkillShopUI(
            skills,
            inventory.items.map(item => item.fish),
            userId,
            guildId,
            Number(user.fishBalance),
            skills[0].id,
            inventory.items[0].fish.id
        );
        
        const embed2 = ui2.createEmbed();
        const components2 = ui2.createComponents();
        
        console.log('- Can buy skill:', ui2.canBuySelectedSkill());
        console.log('- Selected skill:', skills[0].name);
        console.log('- Selected fish:', inventory.items[0].fish.species);
        console.log('- Components count:', components2.length);

        // Test từng skill
        console.log('\n🔍 Test 3: Testing each skill');
        for (const skill of skills) {
            const ui = new SkillShopUI(
                skills,
                inventory.items.map(item => item.fish),
                userId,
                guildId,
                Number(user.fishBalance),
                skill.id,
                inventory.items[0].fish.id
            );
            
            const canBuy = ui.canBuySelectedSkill();
            const status = canBuy ? '✅ CAN BUY' : '❌ CANNOT BUY';
            console.log(`- ${skill.name}: ${status}`);
        }

        console.log('\n🎉 Fixed UI Test Complete!');
        console.log('The skill shop UI should now work without setDefaultValues error.');

    } catch (error) {
        console.error('❌ Error in fixed UI test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillShopUIFixed();
