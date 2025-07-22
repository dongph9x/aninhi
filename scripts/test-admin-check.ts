import { FishBattleService } from '../src/utils/fish-battle';

// Test với User ID thực tế của bạn
const testUserIds = [
    '389957152153796608', // ID trong danh sách admin
    'test-user-regular',   // User thường
    'your-actual-user-id'  // Thay bằng User ID thực của bạn
];

async function testAdminCheck() {
    console.log('🧪 Testing Admin Check...\n');

    try {
        for (const userId of testUserIds) {
            console.log(`Testing User ID: ${userId}`);
            
            // Test với guild ID mẫu
            const guildId = 'test-guild-admin-check';
            const isAdmin = await FishBattleService.isAdministrator(userId, guildId);
            
            console.log(`   Is Admin: ${isAdmin}`);
            
            if (isAdmin) {
                console.log('   ⚠️  WARNING: This user is ADMIN!');
                console.log('   💡 Admin users get:');
                console.log('      - Free breeding (no 100k FishCoin cost)');
                console.log('      - Free feeding (no daily limit)');
                console.log('      - Free battles (no cooldown/limit)');
            } else {
                console.log('   ✅ This user is REGULAR (not admin)');
                console.log('   💡 Regular users get:');
                console.log('      - Breeding costs 100k FishCoin');
                console.log('      - Feeding has daily limit (20 times)');
                console.log('      - Battles have cooldown and daily limit');
            }
            console.log('');
        }

        console.log('🔧 To fix admin issues:');
        console.log('1. Check if your User ID is in the admin list');
        console.log('2. Remove your User ID from admin list if you want to test regular user features');
        console.log('3. Or add your User ID to admin list if you want admin privileges');
        
        console.log('\n📝 Current admin list in src/utils/fish-battle.ts:');
        console.log('   const adminUserIds: string[] = [');
        console.log('     "389957152153796608", // Your ID might be here');
        console.log('   ];');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testAdminCheck().catch(console.error); 