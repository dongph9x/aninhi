import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function testRealFish() {
    try {
        console.log('🔍 Testing with Real Fish from Discord...\n');

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

        // Test với tất cả skills
        console.log('\n🎯 Testing with all skills:');
        for (const skill of skills) {
            console.log(`\n--- ${skill.name} ---`);
            console.log('- Cost:', skill.baseCost.toLocaleString(), 'FishCoin');
            console.log('- Requirements:', skill.requirements);

            // Tạo UI với skill này
            const ui = new SkillShopUI(
                skills,
                inventory.items.map(item => item.fish),
                userId,
                guildId,
                Number(user.fishBalance),
                skill.id,
                fish.id
            );

            console.log('- canBuySelectedSkill:', ui.canBuySelectedSkill());

            // Test FishSkillHelper.canLearnSkill chi tiết
            const { FishSkillHelper } = await import('../src/config/fish-skills');
            
            // Parse fish stats
            let fishStats = fish.stats;
            if (typeof fishStats === 'string') {
                try {
                    fishStats = JSON.parse(fishStats);
                } catch (e) {
                    fishStats = {};
                }
            }

            const canLearn = FishSkillHelper.canLearnSkill(fish, skill);
            console.log('- canLearn result:', canLearn);

            // Test requirements chi tiết
            const req = skill.requirements;
            if (req) {
                console.log('- Requirements check:');
                if (req.level) {
                    console.log(`  - Level: ${fish.level} >= ${req.level} = ${fish.level >= req.level}`);
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
                    console.log(`  - Rarity: ${fish.rarity} === ${req.rarity} = ${fish.rarity === req.rarity}`);
                }
            }

            // Test money
            const hasEnoughMoney = Number(user.fishBalance) >= skill.baseCost;
            console.log('- Money check:', Number(user.fishBalance), '>=', skill.baseCost, '=', hasEnoughMoney);
        }

        console.log('\n🎉 Real Fish Test Complete!');

    } catch (error) {
        console.error('❌ Error testing real fish:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testRealFish();
