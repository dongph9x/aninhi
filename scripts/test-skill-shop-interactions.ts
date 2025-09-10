import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';
import { SkillShopHandler } from '../src/components/MessageComponent/SkillShopHandler';

async function testSkillShopInteractions() {
    try {
        console.log('🚀 Testing Skill Shop Interactions...\n');

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
        console.log('- battleFish count:', messageData.battleFish.length);

        // Test 1: User chọn skill đầu tiên
        console.log('\n🎯 Test 1: User selects first skill');
        const firstSkill = skills[0];
        console.log('- Selected skill:', firstSkill.name);
        
        // Mô phỏng skill selection
        messageData.selectedSkillId = firstSkill.id;
        if (!messageData.selectedFishId && messageData.battleFish.length > 0) {
            messageData.selectedFishId = messageData.battleFish[0].id;
            console.log('- Auto-selected fish:', messageData.selectedFishId);
        }

        const ui1 = new SkillShopUI(
            skills,
            messageData.battleFish,
            messageData.userId,
            messageData.guildId,
            messageData.userBalance,
            messageData.selectedSkillId,
            messageData.selectedFishId
        );

        console.log('- Can buy skill:', ui1.canBuySelectedSkill());

        // Test 2: User chọn fish khác
        console.log('\n🐟 Test 2: User selects different fish');
        if (messageData.battleFish.length > 1) {
            const secondFish = messageData.battleFish[1];
            console.log('- Selected fish:', secondFish.species);
            
            messageData.selectedFishId = secondFish.id;

            const ui2 = new SkillShopUI(
                skills,
                messageData.battleFish,
                messageData.userId,
                messageData.guildId,
                messageData.userBalance,
                messageData.selectedSkillId,
                messageData.selectedFishId
            );

            console.log('- Can buy skill:', ui2.canBuySelectedSkill());
        } else {
            console.log('- Only one fish available, skipping test');
        }

        // Test 3: User chọn skill khác
        console.log('\n🎯 Test 3: User selects different skill');
        if (skills.length > 1) {
            const secondSkill = skills[1];
            console.log('- Selected skill:', secondSkill.name);
            
            messageData.selectedSkillId = secondSkill.id;

            const ui3 = new SkillShopUI(
                skills,
                messageData.battleFish,
                messageData.userId,
                messageData.guildId,
                messageData.userBalance,
                messageData.selectedSkillId,
                messageData.selectedFishId
            );

            console.log('- Can buy skill:', ui3.canBuySelectedSkill());
        }

        // Test 4: Test với skill không thể mua
        console.log('\n❌ Test 4: User selects skill that cannot be bought');
        const earthSkill = skills.find(s => s.id === 'earth_shield');
        if (earthSkill) {
            console.log('- Selected skill:', earthSkill.name);
            console.log('- Requirements:', earthSkill.requirements);
            
            messageData.selectedSkillId = earthSkill.id;

            const ui4 = new SkillShopUI(
                skills,
                messageData.battleFish,
                messageData.userId,
                messageData.guildId,
                messageData.userBalance,
                messageData.selectedSkillId,
                messageData.selectedFishId
            );

            console.log('- Can buy skill:', ui4.canBuySelectedSkill());
        }

    } catch (error) {
        console.error('❌ Error testing skill shop interactions:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillShopInteractions();
