import prisma from '../src/utils/prisma';
import { BattleFishInventoryService } from '../src/utils/battle-fish-inventory';
import { FishSkillService } from '../src/utils/fish-skills';
import { SkillShopUI } from '../src/components/MessageComponent/SkillShopUI';

async function debugSpecificFish() {
    try {
        console.log('🔍 Debugging Specific Fish Issue...\n');

        const userId = 'test-skill-user';
        const guildId = 'test-guild';
        const specificFishId = 'cmf7lg6i6001ksx772z19svek'; // Fish ID từ Discord

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

        // Tìm fish cụ thể
        const specificFish = inventory.items.find(item => item.fish.id === specificFishId);
        if (!specificFish) {
            console.log('❌ Specific fish not found in battle inventory!');
            console.log('Available fish IDs:', inventory.items.map(item => item.fish.id));
            return;
        }

        const fish = specificFish.fish;
        console.log('🐟 Specific Fish:', fish.species, '| Level:', fish.level, '| Rarity:', fish.rarity);
        console.log('📊 Fish stats:', fish.stats);

        // Test với skill "Hắc Ám Tuyệt Đối"
        const testSkill = skills.find(s => s.id === 'absolute_darkness');
        if (!testSkill) {
            console.log('❌ Test skill not found!');
            return;
        }

        console.log(`\n🎯 Testing with skill: ${testSkill.name}`);
        console.log('- Skill cost:', testSkill.baseCost.toLocaleString());
        console.log('- Skill requirements:', testSkill.requirements);

        // Tạo UI với fish cụ thể
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

        // Test canBuySelectedSkill với debug chi tiết
        console.log('\n🔍 Testing canBuySelectedSkill with debug:');
        const canBuy = ui.canBuySelectedSkill();

        // Test FishSkillHelper.canLearnSkill chi tiết
        console.log('\n🔍 Testing FishSkillHelper.canLearnSkill:');
        const { FishSkillHelper } = await import('../src/config/fish-skills');
        
        // Parse fish stats
        let fishStats = fish.stats;
        if (typeof fishStats === 'string') {
            try {
                fishStats = JSON.parse(fishStats);
                console.log('- Fish stats parsed:', fishStats);
            } catch (e) {
                console.log('❌ Error parsing fish stats:', e);
                fishStats = {};
            }
        }

        const canLearn = FishSkillHelper.canLearnSkill(fish, testSkill);
        console.log('- canLearn result:', canLearn);

        // Test requirements chi tiết
        const req = testSkill.requirements;
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
        const hasEnoughMoney = Number(user.fishBalance) >= testSkill.baseCost;
        console.log('- Money check:', Number(user.fishBalance), '>=', testSkill.baseCost, '=', hasEnoughMoney);

        console.log('\n🎉 Debug Complete!');

    } catch (error) {
        console.error('❌ Error debugging specific fish:', error);
    } finally {
        await prisma.$disconnect();
    }
}

debugSpecificFish();
