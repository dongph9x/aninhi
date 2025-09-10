import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';
import { SkillShopHandler } from '../src/components/MessageComponent/SkillShopHandler';

async function testSkillShopCommand() {
    try {
        console.log('🚀 Testing Skill Shop Command Flow...\n');

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

        console.log('👤 User:', user.userId, '| FishCoin:', Number(user.fishBalance));

        // Lấy battle fish inventory
        const inventory = await BattleFishInventoryService.getBattleFishInventory(userId, guildId);
        console.log('🎒 Battle Fish Inventory:');
        console.log('- Items count:', inventory.items.length);
        
        for (const item of inventory.items) {
            console.log(`  - ${item.fish.species} (Level ${item.fish.level}, ${item.fish.rarity})`);
        }

        // Lấy skills
        const skills = await FishSkillService.getAllSkillDefinitions();
        console.log('📋 Skills count:', skills.length);

        // Tạo UI như trong command
        const ui = new SkillShopUI(
            skills,
            inventory.items.map(item => item.fish),
            userId,
            guildId,
            Number(user.fishBalance)
        );

        console.log('\n🔍 Testing UI creation:');
        console.log('- Skills in UI:', ui.skills.length);
        console.log('- Battle fish in UI:', ui.battleFish.length);
        console.log('- User balance:', ui.userBalance);
        console.log('- Selected skill ID:', ui.selectedSkillId);
        console.log('- Selected fish ID:', ui.selectedFishId);
        console.log('- Can buy selected skill:', ui.canBuySelectedSkill());

        // Test với skill được chọn
        if (skills.length > 0 && inventory.items.length > 0) {
            const testSkill = skills[0];
            const testFish = inventory.items[0].fish;
            
            console.log(`\n🎯 Testing with selected skill: ${testSkill.name}`);
            console.log(`🐟 Testing with selected fish: ${testFish.species}`);
            
            const uiWithSelection = new SkillShopUI(
                skills,
                inventory.items.map(item => item.fish),
                userId,
                guildId,
                Number(user.fishBalance),
                testSkill.id,
                testFish.id
            );
            
            console.log('- Can buy with selection:', uiWithSelection.canBuySelectedSkill());
        }

        // Test message data như trong command
        const messageData = {
            userId,
            guildId,
            userBalance: Number(user.fishBalance),
            battleFish: inventory.items.map(item => item.fish),
            messageType: 'skill_shop_ui'
        };

        console.log('\n🔍 Testing message data:');
        console.log('- messageData:', messageData);
        console.log('- battleFish count:', messageData.battleFish.length);
        console.log('- battleFish[0]:', messageData.battleFish[0]);

        // Test SkillShopHandler với message data
        const mockMessageId = 'test-message-id';
        SkillShopHandler.setMessageData(mockMessageId, messageData);
        
        const retrievedData = SkillShopHandler.getMessageData(mockMessageId);
        console.log('\n🔍 Testing SkillShopHandler:');
        console.log('- Retrieved data:', retrievedData);
        console.log('- Retrieved battleFish:', retrievedData?.battleFish);

    } catch (error) {
        console.error('❌ Error testing skill shop command:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillShopCommand();
