import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function testFinalSkillShop() {
    try {
        console.log('🚀 Final Skill Shop Test...\n');

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
        console.log('- Can buy skill:', ui1.canBuySelectedSkill());
        console.log('- Selected skill ID:', ui1.selectedSkillId);
        console.log('- Selected fish ID:', ui1.selectedFishId);

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
        console.log('- Can buy skill:', ui2.canBuySelectedSkill());
        console.log('- Selected skill:', skills[0].name);
        console.log('- Selected fish:', inventory.items[0].fish.species);

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
            
            if (!canBuy) {
                // Test requirements
                const fish = inventory.items[0].fish;
                let fishStats = fish.stats;
                if (typeof fishStats === 'string') {
                    fishStats = JSON.parse(fishStats);
                }
                
                const req = skill.requirements;
                if (req) {
                    if (req.level && fish.level < req.level) {
                        console.log(`  ❌ Level: ${fish.level} < ${req.level}`);
                    }
                    if (req.strength && (fishStats?.strength || 0) < req.strength) {
                        console.log(`  ❌ Strength: ${fishStats?.strength || 0} < ${req.strength}`);
                    }
                    if (req.agility && (fishStats?.agility || 0) < req.agility) {
                        console.log(`  ❌ Agility: ${fishStats?.agility || 0} < ${req.agility}`);
                    }
                    if (req.intelligence && (fishStats?.intelligence || 0) < req.intelligence) {
                        console.log(`  ❌ Intelligence: ${fishStats?.intelligence || 0} < ${req.intelligence}`);
                    }
                    if (req.defense && (fishStats?.defense || 0) < req.defense) {
                        console.log(`  ❌ Defense: ${fishStats?.defense || 0} < ${req.defense}`);
                    }
                    if (req.luck && (fishStats?.luck || 0) < req.luck) {
                        console.log(`  ❌ Luck: ${fishStats?.luck || 0} < ${req.luck}`);
                    }
                    if (req.rarity && fish.rarity !== req.rarity) {
                        console.log(`  ❌ Rarity: ${fish.rarity} !== ${req.rarity}`);
                    }
                }
            }
        }

        console.log('\n🎉 Final Test Complete!');
        console.log('The skill shop should now work correctly in Discord.');

    } catch (error) {
        console.error('❌ Error in final test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testFinalSkillShop();
