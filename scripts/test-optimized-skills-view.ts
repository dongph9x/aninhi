import prisma from '../src/utils/prisma';
import { FishSkillService } from '../src/utils/fish-skills';

async function testOptimizedSkillsView() {
    try {
        console.log('🔍 Testing Optimized Skills View...\n');

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
            console.log(`- ${element}: ${skills.length} skills`);
            console.log(`  - First skill: ${skills[0].name}`);
            if (skills.length > 1) {
                console.log(`  - Other skills: ${skills.slice(1).map(s => s.name).join(', ')}`);
            }
        });

        // Test element emojis
        const elementEmojis = {
            fire: '🔥',
            water: '💧',
            earth: '🪨',
            air: '💨',
            light: '✨',
            dark: '🌑'
        };

        console.log('\n🎨 Element Emojis:');
        Object.entries(elementEmojis).forEach(([element, emoji]) => {
            console.log(`- ${element}: ${emoji}`);
        });

        // Test dropdown options
        console.log('\n📋 Dropdown Options:');
        Object.entries(skillsByElement).forEach(([element, skills]) => {
            const elementEmoji = elementEmojis[element as keyof typeof elementEmojis] || '❓';
            console.log(`- ${elementEmoji} ${element.toUpperCase()} Skills`);
            console.log(`  - Description: ${skills.length} skills | Chọn để xem chi tiết`);
            console.log(`  - Value: ${element}`);
        });

        console.log('\n🎉 Optimized Skills View Test Complete!');

    } catch (error) {
        console.error('❌ Error testing optimized skills view:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testOptimizedSkillsView();
