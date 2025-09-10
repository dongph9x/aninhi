import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function debugBuyButton() {
    try {
        console.log('🔍 Debugging Buy Button Issue...\n');

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

        console.log('📋 Debug Info:');
        console.log('- User FishCoin:', Number(user.fishBalance).toLocaleString());
        console.log('- Battle fish count:', inventory.items.length);
        console.log('- Skills count:', skills.length);

        if (inventory.items.length === 0) {
            console.log('❌ No battle fish found!');
            return;
        }

        const fish = inventory.items[0].fish;
        console.log('🐟 Fish:', fish.species, '| Level:', fish.level, '| Rarity:', fish.rarity);
        console.log('📊 Fish stats:', fish.stats);

        // Test với skill đầu tiên
        const testSkill = skills[0];
        console.log(`\n🎯 Testing with skill: ${testSkill.name}`);
        console.log('- Skill cost:', testSkill.baseCost.toLocaleString());
        console.log('- Skill requirements:', testSkill.requirements);

        // Tạo UI với selection
        const ui = new SkillShopUI(
            skills,
            inventory.items.map(item => item.fish),
            userId,
            guildId,
            Number(user.fishBalance),
            testSkill.id,
            fish.id
        );

        console.log('\n🔍 UI State:');
        console.log('- selectedSkillId:', ui.selectedSkillId);
        console.log('- selectedFishId:', ui.selectedFishId);
        console.log('- userBalance:', ui.userBalance);
        console.log('- skills count:', ui.skills.length);
        console.log('- battleFish count:', ui.battleFish.length);

        // Test canBuySelectedSkill
        console.log('\n🔍 Testing canBuySelectedSkill:');
        const canBuy = ui.canBuySelectedSkill();
        console.log('- canBuySelectedSkill result:', canBuy);

        // Test chi tiết logic
        if (!ui.selectedSkillId || !ui.selectedFishId) {
            console.log('❌ Missing selection:', {
                selectedSkillId: ui.selectedSkillId,
                selectedFishId: ui.selectedFishId
            });
        } else {
            const skill = ui.skills.find(s => s.id === ui.selectedSkillId);
            const fishFromUI = ui.battleFish.find(f => f.id === ui.selectedFishId);
            
            console.log('- skill found:', !!skill);
            console.log('- fish found:', !!fishFromUI);
            
            if (skill && fishFromUI) {
                console.log('- skill baseCost:', skill.baseCost);
                console.log('- userBalance >= skill.baseCost:', ui.userBalance >= skill.baseCost);
                
                // Test FishSkillHelper.canLearnSkill
                const { FishSkillHelper } = await import('../src/config/fish-skills');
                const canLearn = FishSkillHelper.canLearnSkill(fishFromUI, skill);
                console.log('- canLearn result:', canLearn);
                
                // Parse fish stats
                let fishStats = fishFromUI.stats;
                if (typeof fishStats === 'string') {
                    try {
                        fishStats = JSON.parse(fishStats);
                    } catch (e) {
                        fishStats = {};
                    }
                }
                console.log('- fishStats parsed:', fishStats);
                
                // Test requirements chi tiết
                const req = skill.requirements;
                if (req) {
                    console.log('- Requirements check:');
                    if (req.level) {
                        console.log(`  - Level: ${fishFromUI.level} >= ${req.level} = ${fishFromUI.level >= req.level}`);
                    }
                    if (req.strength) {
                        console.log(`  - Strength: ${fishStats?.strength || 0} >= ${req.strength} = ${(fishStats?.strength || 0) >= req.strength}`);
                    }
                    if (req.agility) {
                        console.log(`  - Agility: ${fishStats?.agility || 0} >= ${req.agility} = ${(fishStats?.agility || 0) >= req.agility}`);
                    }
                    if (req.intelligence) {
                        console.log(`  - Intelligence: ${fishStats?.intelligence || 0} >= ${req.intelligence} = ${(fishStats?.intelligence || 0) >= req.intelligence}`);
                    }
                    if (req.defense) {
                        console.log(`  - Defense: ${fishStats?.defense || 0} >= ${req.defense} = ${(fishStats?.defense || 0) >= req.defense}`);
                    }
                    if (req.luck) {
                        console.log(`  - Luck: ${fishStats?.luck || 0} >= ${req.luck} = ${(fishStats?.luck || 0) >= req.luck}`);
                    }
                    if (req.rarity) {
                        console.log(`  - Rarity: ${fishFromUI.rarity} === ${req.rarity} = ${fishFromUI.rarity === req.rarity}`);
                    }
                }
            }
        }

        // Test tạo components
        console.log('\n🔍 Testing createComponents:');
        try {
            const components = ui.createComponents();
            console.log('- Components created successfully:', components.length);
            
            // Tìm buy button
            const buttonRow = components.find(row => 
                row.components.some(comp => comp.data.custom_id === 'skill_shop_buy')
            );
            
            if (buttonRow) {
                const buyButton = buttonRow.components.find(comp => comp.data.custom_id === 'skill_shop_buy');
                if (buyButton) {
                    console.log('- Buy button found:', buyButton.data.custom_id);
                    console.log('- Buy button disabled:', buyButton.data.disabled);
                    console.log('- Buy button label:', buyButton.data.label);
                } else {
                    console.log('❌ Buy button not found in components');
                }
            } else {
                console.log('❌ Button row not found');
            }
        } catch (error) {
            console.error('❌ Error creating components:', error);
        }

    } catch (error) {
        console.error('❌ Error debugging buy button:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugBuyButton();
