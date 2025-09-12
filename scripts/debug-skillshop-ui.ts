import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugSkillShopUI() {
    try {
        console.log('🔍 Debug SkillShopUI...');

        // Lấy skills từ database
        const skills = await prisma.fishSkillDefinition.findMany();
        console.log(`📊 Tìm thấy ${skills.length} skills trong database`);

        if (skills.length === 0) {
            console.log('❌ Không có skills nào!');
            return;
        }

        // Lấy battle fish (giả sử có user test)
        const testUserId = 'test-user';
        const testGuildId = 'test-guild';
        
        // Tạo user test nếu chưa có
        await prisma.user.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: {},
            create: {
                userId: testUserId,
                guildId: testGuildId,
                fishBalance: BigInt(1000000)
            }
        });

        // Lấy battle fish
        const battleFish = await prisma.fish.findMany({
            where: {
                userId: testUserId,
                guildId: testGuildId,
                isInBattleInventory: true
            },
            include: {
                fishSkills: {
                    include: {
                        skillDefinition: true
                    }
                }
            }
        });

        console.log(`🐟 Tìm thấy ${battleFish.length} battle fish`);

        // Simulate SkillShopUI creation
        console.log('\n🎨 Simulating SkillShopUI creation...');
        
        // Test skill options
        console.log('\n📋 Skill Options:');
        let skillOptionCount = 0;
        skills.forEach(skill => {
            skillOptionCount++;
            const skillName = skill.name.length > 20 ? skill.name.substring(0, 17) + '...' : skill.name;
            const label = skillName;
            
            console.log(`${skillOptionCount}. "${label}" (${label.length} chars) - ${skill.name}`);
            
            if (label.length > 25) {
                console.log(`  ❌ LABEL TOO LONG: ${label.length} > 25`);
            }
        });

        // Test fish options
        console.log('\n🐟 Fish Options:');
        let fishOptionCount = 0;
        if (battleFish.length > 0) {
            battleFish.forEach(fish => {
                fishOptionCount++;
                const maxNameLength = 25 - 3 - 7; // 15 ký tự cho tên
                const fishName = fish.name.length > maxNameLength ? fish.name.substring(0, maxNameLength - 6) + '...' : fish.name;
                const fishLabel = `${fishName} (Lv.${fish.level})`;
                
                console.log(`${fishOptionCount}. "${fishLabel}" (${fishLabel.length} chars) - ${fish.name}`);
                
                if (fishLabel.length > 25) {
                    console.log(`  ❌ FISH LABEL TOO LONG: ${fishLabel.length} > 25`);
                }
            });
        } else {
            console.log('❌ Không có battle fish nào!');
        }

        // Test components structure
        console.log('\n🔧 Components Structure:');
        console.log(`- Skill select menu: ${skillOptionCount > 0 ? 'CÓ' : 'KHÔNG'} (${skillOptionCount} options)`);
        console.log(`- Fish select menu: ${fishOptionCount > 0 ? 'CÓ' : 'KHÔNG'} (${fishOptionCount} options)`);
        console.log(`- Total rows: ${(skillOptionCount > 0 ? 1 : 0) + (fishOptionCount > 0 ? 1 : 0) + 2}`); // +2 for button rows

    } catch (error) {
        console.error('❌ Lỗi khi debug SkillShopUI:', error);
    } finally {
        await prisma.$disconnect();
    }
}

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
    debugSkillShopUI();
}

export default debugSkillShopUI;
