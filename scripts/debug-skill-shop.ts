import prisma from '../src/utils/prisma';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function debugSkillShop() {
    try {
        console.log('🔍 Debugging Skill Shop Issue...\n');

        // Lấy user test
        const user = await prisma.user.findUnique({
            where: { userId_guildId: { userId: 'test-skill-user', guildId: 'test-guild' } }
        });

        if (!user) {
            console.log('❌ User not found!');
            return;
        }

        console.log('👤 User:', user.userId, '| FishCoin:', Number(user.fishBalance));

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
        console.log('📊 Stats:', fish.stats);

        // Lấy skills
        const skills = await FishSkillService.getAllSkillDefinitions();
        console.log('📋 Skills count:', skills.length);

        // Test từng skill
        for (const skill of skills) {
            console.log(`\n🎯 Testing ${skill.name}:`);
            console.log(`💰 Cost: ${skill.baseCost.toLocaleString()} FishCoin`);
            console.log(`📋 Requirements:`, skill.requirements);
            
            // Test UI với skill này
            const ui = new SkillShopUI(
                skills,
                [fish],
                user.userId,
                user.guildId,
                Number(user.fishBalance),
                skill.id,
                fish.id
            );

            console.log(`🔍 Can buy: ${ui.canBuySelectedSkill()}`);
            
            // Test chi tiết
            const skillFromUI = ui.skills.find(s => s.id === skill.id);
            const fishFromUI = ui.battleFish.find(f => f.id === fish.id);
            
            console.log(`- Skill found in UI: ${!!skillFromUI}`);
            console.log(`- Fish found in UI: ${!!fishFromUI}`);
            console.log(`- Selected skill ID: ${ui.selectedSkillId}`);
            console.log(`- Selected fish ID: ${ui.selectedFishId}`);
            console.log(`- User balance: ${ui.userBalance}`);
            
            if (skillFromUI && fishFromUI) {
                // Parse fish stats
                let fishStats = fishFromUI.stats;
                if (typeof fishStats === 'string') {
                    try {
                        fishStats = JSON.parse(fishStats);
                    } catch (e) {
                        fishStats = {};
                    }
                }
                
                console.log(`- Fish stats parsed:`, fishStats);
                console.log(`- Fish level: ${fishFromUI.level}`);
                console.log(`- Fish rarity: ${fishFromUI.rarity}`);
                
                // Test requirements
                const req = skillFromUI.requirements;
                if (req) {
                    console.log(`- Level check: ${fishFromUI.level} >= ${req.level} = ${fishFromUI.level >= req.level}`);
                    if (req.strength) console.log(`- Strength check: ${fishStats?.strength || 0} >= ${req.strength} = ${(fishStats?.strength || 0) >= req.strength}`);
                    if (req.agility) console.log(`- Agility check: ${fishStats?.agility || 0} >= ${req.agility} = ${(fishStats?.agility || 0) >= req.agility}`);
                    if (req.intelligence) console.log(`- Intelligence check: ${fishStats?.intelligence || 0} >= ${req.intelligence} = ${(fishStats?.intelligence || 0) >= req.intelligence}`);
                    if (req.defense) console.log(`- Defense check: ${fishStats?.defense || 0} >= ${req.defense} = ${(fishStats?.defense || 0) >= req.defense}`);
                    if (req.luck) console.log(`- Luck check: ${fishStats?.luck || 0} >= ${req.luck} = ${(fishStats?.luck || 0) >= req.luck}`);
                    if (req.rarity) console.log(`- Rarity check: ${fishFromUI.rarity} === ${req.rarity} = ${fishFromUI.rarity === req.rarity}`);
                }
                
                console.log(`- Money check: ${ui.userBalance} >= ${skillFromUI.baseCost} = ${ui.userBalance >= skillFromUI.baseCost}`);
            }
        }

        // Test UI không có selection
        console.log('\n🔍 Testing UI without selection:');
        const uiNoSelection = new SkillShopUI(
            skills,
            [fish],
            user.userId,
            user.guildId,
            Number(user.fishBalance)
        );
        console.log(`Can buy (no selection): ${uiNoSelection.canBuySelectedSkill()}`);

    } catch (error) {
        console.error('❌ Error debugging skill shop:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSkillShop();
