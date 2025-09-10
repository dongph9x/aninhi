import prisma from '../src/utils/prisma';
import { EmbedBuilder } from 'discord.js';
import { FishSkillHelper } from '../src/config/fish-skills';

async function testSkillInventory() {
    try {
        console.log('🔍 Testing Skill Inventory Display...\n');

        const userId = '389957152153796608';
        const guildId = '1005280612845891615';

        // Lấy tất cả cá của user
        const userFish = await prisma.fish.findMany({
            where: { userId: userId, guildId: guildId },
            include: {
                fishSkills: {
                    include: {
                        skillDefinition: true
                    }
                }
            }
        });

        console.log('📋 User Fish:', userFish.length);
        for (const fish of userFish) {
            console.log(`- ${fish.species} (Lv.${fish.level}) | Skills: ${fish.fishSkills.length}`);
        }

        const embed = new EmbedBuilder()
            .setTitle('🎒 Skills Đã Mua')
            .setColor('#4ECDC4')
            .setDescription('Danh sách skills đã mua cho các cá của bạn!')
            .setTimestamp();

        let hasSkills = false;
        userFish.forEach(fish => {
            if (fish.fishSkills.length > 0) {
                hasSkills = true;
                const skillsText = fish.fishSkills.map(fishSkill => {
                    const skillDef = fishSkill.skillDefinition;
                    if (!skillDef) return '';
                    
                    const damage = FishSkillHelper.calculateSkillDamage({
                        baseDamage: skillDef.baseDamage,
                        damageMultiplier: Number(skillDef.damageMultiplier),
                        damagePerLevel: Number(skillDef.damagePerLevel)
                    }, fishSkill.level);
                    const successRate = FishSkillHelper.calculateSkillSuccessRate({
                        baseSuccessRate: Number(skillDef.baseSuccessRate),
                        successRatePerLevel: Number(skillDef.successRatePerLevel)
                    }, fishSkill.level);
                    
                    return `**${skillDef.emoji}** **${skillDef.name}** (Lv.${fishSkill.level})\n` +
                           `💥 ${damage} damage | 🎯 ${Math.round(successRate * 100)}% thành công`;
                }).join('\n\n');

                embed.addFields({
                    name: `🐟 ${fish.species} (Lv.${fish.level})`,
                    value: skillsText,
                    inline: false
                });
            }
        });

        if (!hasSkills) {
            embed.addFields({
                name: '❌ Chưa Có Skill',
                value: 'Bạn chưa mua skill nào cho cá của mình!\nSử dụng `n.skillshop ui` để mua skill.',
                inline: false
            });
        }

        console.log('\n📋 Embed Fields:');
        for (const field of embed.data.fields || []) {
            console.log(`- ${field.name}: ${field.value}`);
        }

        console.log('\n🎉 Skill Inventory Test Complete!');

    } catch (error) {
        console.error('❌ Error testing skill inventory:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testSkillInventory();
