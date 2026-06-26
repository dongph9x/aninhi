import { EmbedBuilder } from 'discord.js';
import { FishSkillService } from '../src/utils/fish-skills';

async function debugEmbedCreation() {
    try {
        console.log('🔍 Debugging Embed Creation...\n');

        // Lấy tất cả skill definitions
        const allSkills = await FishSkillService.getAllSkillDefinitions();
        console.log('📊 Total skills:', allSkills.length);

        // Nhóm skills theo element
        const skillsByElement = allSkills.reduce((acc: Record<string, any[]>, skill: any) => {
            if (!acc[skill.element]) acc[skill.element] = [];
            acc[skill.element].push(skill);
            return acc;
        }, {} as Record<string, any[]>);

        console.log('📊 Skills by element:', Object.keys(skillsByElement));

        // Tạo embed chính
        const mainEmbed = new EmbedBuilder()
            .setTitle('🎯 Hệ Thống Skills - Tất Cả Skills')
            .setColor('#FF6B6B')
            .setDescription('Danh sách tất cả skills có sẵn trong hệ thống!')
            .setTimestamp();

        console.log('✅ Embed created with title and description');

        // Thêm thông tin tổng quan
        const totalSkills = allSkills.length;
        const elements = Object.keys(skillsByElement);
        
        mainEmbed.addFields({
            name: '📊 Thống Kê Tổng Quan',
            value: `**${totalSkills}** skills tổng cộng\n**${elements.length}** hệ elements\n**${allSkills.filter((s: any) => (s.requirements?.rarity || 'common') === 'common').length}** skills Common\n**${allSkills.filter((s: any) => (s.requirements?.rarity || 'common') === 'rare').length}** skills Rare\n**${allSkills.filter((s: any) => (s.requirements?.rarity || 'common') === 'epic').length}** skills Epic\n**${allSkills.filter((s: any) => (s.requirements?.rarity || 'common') === 'legendary').length}** skills Legendary`,
            inline: false
        });

        console.log('✅ Added overview field');

        // Thêm từng hệ element
        const elementEmojis = {
            fire: '🔥',
            water: '💧',
            earth: '🪨',
            air: '💨',
            light: '✨',
            dark: '🌑'
        };

        // Chỉ hiển thị skill đầu tiên của mỗi element
        Object.entries(skillsByElement).forEach(([element, skills]: [string, any[]]) => {
            const elementEmoji = elementEmojis[element as keyof typeof elementEmojis] || '❓';
            const firstSkill = skills[0]; // Chỉ lấy skill đầu tiên
            
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

            mainEmbed.addFields({
                name: `${elementEmoji} ${element.toUpperCase()} Skills (${skills.length})`,
                value: skillsText,
                inline: false
            });

            console.log(`✅ Added ${element} field with ${skills.length} skills`);
        });

        // Thêm hướng dẫn sử dụng
        mainEmbed.addFields({
            name: '🎯 Cách Sử Dụng',
            value: '• `n.fishbattle skills` - Xem tất cả skills (lệnh này)\n• `n.fishbattle skills <fish_id>` - Quản lý skills cho cá cụ thể\n• Skills được học bằng FishCoin\n• Mỗi skill có requirements về level, stats, rarity',
            inline: false
        });

        console.log('✅ Added usage guide field');

        // Kiểm tra embed cuối cùng
        const embedData = mainEmbed.toJSON();
        console.log('\n📋 Final Embed Data:');
        console.log('- Title:', embedData.title);
        console.log('- Description:', embedData.description);
        console.log('- Fields:', embedData.fields?.length || 0);
        
        if (embedData.fields) {
            embedData.fields.forEach((field, index) => {
                console.log(`\n--- Field ${index + 1}: ${field.name} ---`);
                console.log(field.value.substring(0, 100) + '...');
            });
        }

        console.log('\n🎉 Embed Creation Debug Complete!');

    } catch (error) {
        console.error('❌ Error debugging embed creation:', error);
    }
}

debugEmbedCreation();
