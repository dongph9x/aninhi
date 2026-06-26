import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';
import { SkillShopHandler } from '../src/components/MessageComponent/SkillShopHandler';

async function testSkillShopFlow() {
    try {
        console.log('🚀 Testing Skill Shop Flow...\n');

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

        // Tạo message data như trong command
        const messageData = {
            userId,
            guildId,
            userBalance: Number(user.fishBalance),
            battleFish: inventory.items.map(item => item.fish),
            messageType: 'skill_shop_ui'
        };

        console.log('📋 Initial message data:');
        console.log('- selectedSkillId:', messageData.selectedSkillId);
        console.log('- selectedFishId:', messageData.selectedFishId);

        // Mô phỏng SkillShopHandler.handleSkillSelection
        console.log('\n🎯 Simulating skill selection...');
        const skillId = skills[0].id;
        console.log('- Selected skill:', skills[0].name);

        // Cập nhật message data TRƯỚC KHI tạo UI (như đã sửa)
        messageData.selectedSkillId = skillId;
        if (!messageData.selectedFishId && messageData.battleFish && messageData.battleFish.length > 0) {
            messageData.selectedFishId = messageData.battleFish[0].id;
            console.log('- Auto-selected fish:', messageData.selectedFishId);
        }

        // Tạo UI với state mới
        const ui1 = new SkillShopUI(
            skills,
            messageData.battleFish,
            messageData.userId,
            messageData.guildId,
            messageData.userBalance,
            messageData.selectedSkillId,
            messageData.selectedFishId
        );

        console.log('- UI canBuySelectedSkill:', ui1.canBuySelectedSkill());
        console.log('- UI selectedSkillId:', ui1.selectedSkillId);
        console.log('- UI selectedFishId:', ui1.selectedFishId);

        // Test tạo components
        const components1 = ui1.createComponents();
        const buyButton1 = components1.find(row => 
            row.components.some(comp => comp.data.custom_id === 'skill_shop_buy')
        )?.components.find(comp => comp.data.custom_id === 'skill_shop_buy');

        console.log('- Buy button disabled:', buyButton1?.data.disabled);

        // Mô phỏng SkillShopHandler.handleFishSelection
        console.log('\n🐟 Simulating fish selection...');
        const fishId = messageData.battleFish[0].id;
        console.log('- Selected fish:', messageData.battleFish[0].species);

        // Cập nhật message data TRƯỚC KHI tạo UI
        messageData.selectedFishId = fishId;
        if (!messageData.selectedSkillId && skills && skills.length > 0) {
            messageData.selectedSkillId = skills[0].id;
            console.log('- Auto-selected skill:', messageData.selectedSkillId);
        }

        // Tạo UI với state mới
        const ui2 = new SkillShopUI(
            skills,
            messageData.battleFish,
            messageData.userId,
            messageData.guildId,
            messageData.userBalance,
            messageData.selectedSkillId,
            messageData.selectedFishId
        );

        console.log('- UI canBuySelectedSkill:', ui2.canBuySelectedSkill());
        console.log('- UI selectedSkillId:', ui2.selectedSkillId);
        console.log('- UI selectedFishId:', ui2.selectedFishId);

        // Test tạo components
        const components2 = ui2.createComponents();
        const buyButton2 = components2.find(row => 
            row.components.some(comp => comp.data.custom_id === 'skill_shop_buy')
        )?.components.find(comp => comp.data.custom_id === 'skill_shop_buy');

        console.log('- Buy button disabled:', buyButton2?.data.disabled);

        // Test với skill khác
        console.log('\n🎯 Testing with different skill...');
        const skill2 = skills[1];
        console.log('- Selected skill:', skill2.name);

        messageData.selectedSkillId = skill2.id;

        const ui3 = new SkillShopUI(
            skills,
            messageData.battleFish,
            messageData.userId,
            messageData.guildId,
            messageData.userBalance,
            messageData.selectedSkillId,
            messageData.selectedFishId
        );

        console.log('- UI canBuySelectedSkill:', ui3.canBuySelectedSkill());

        const components3 = ui3.createComponents();
        const buyButton3 = components3.find(row => 
            row.components.some(comp => comp.data.custom_id === 'skill_shop_buy')
        )?.components.find(comp => comp.data.custom_id === 'skill_shop_buy');

        console.log('- Buy button disabled:', buyButton3?.data.disabled);

        console.log('\n🎉 Flow Test Complete!');

    } catch (error) {
        console.error('❌ Error testing skill shop flow:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillShopFlow();
