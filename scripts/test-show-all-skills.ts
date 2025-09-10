import { FishSkillService } from '../src/utils/fish-skills';

async function testShowAllSkills() {
    try {
        console.log('🔍 Testing showAllSkillsSystem function...\n');

        // Lấy tất cả skill definitions
        const allSkills = await FishSkillService.getAllSkillDefinitions();

        // Nhóm skills theo element
        const skillsByElement = allSkills.reduce((acc: Record<string, any[]>, skill: any) => {
            if (!acc[skill.element]) acc[skill.element] = [];
            acc[skill.element].push(skill);
            return acc;
        }, {} as Record<string, any[]>);

        console.log('📊 Skills by Element:');
        Object.entries(skillsByElement).forEach(([element, skills]) => {
            console.log(`\n--- ${element.toUpperCase()} Skills (${skills.length}) ---`);
            
            // Chỉ hiển thị skill đầu tiên
            const firstSkill = skills[0];
            const damage = firstSkill.baseDamage > 0 ? firstSkill.baseDamage : 'Support';
            const cost = firstSkill.baseCost.toLocaleString();
            const rarity = firstSkill.requirements?.rarity || 'common';
            const rarityFormatted = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            const level = firstSkill.requirements?.level || 1;
            const successRate = Math.round((firstSkill.baseSuccessRate || 0.5) * 100);
            
            const skillsText = `**${firstSkill.emoji}** **${firstSkill.name}**\n` +
                              `💰 ${cost} FishCoin | 💥 ${damage} damage | 🎯 ${successRate}% thành công\n` +
                              `📋 Level ${level} | ${rarityFormatted} | ${firstSkill.element}` +
                              (skills.length > 1 ? `\n\n*+ ${skills.length - 1} skills khác (chọn từ dropdown)*` : '');

            console.log(skillsText);

            if (skills.length > 1) {
                console.log(`\nOther skills in ${element}:`);
                skills.slice(1).forEach(skill => {
                    console.log(`- ${skill.emoji} ${skill.name}`);
                });
            }
        });

        console.log('\n🎉 Test Complete!');
        console.log('✅ Function should only show FIRST skill of each element');
        console.log('✅ Other skills should be mentioned as "+ X skills khác"');

    } catch (error) {
        console.error('❌ Error testing showAllSkillsSystem:', error);
    }
}

testShowAllSkills();
