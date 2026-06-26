import { FishBattleService } from '../src/utils/fish-battle';

async function testAdminPermissions() {
  console.log('🧪 Testing Admin Permissions...\n');

  try {
    // Test với các User ID khác nhau
    const testCases = [
      {
        userId: '389957152153796608', // ID trong danh sách admin
        guildId: 'test-guild-admin-permissions',
        description: 'User trong danh sách admin'
      },
      {
        userId: '123456789012345678', // User thường
        guildId: 'test-guild-admin-permissions',
        description: 'User thường (không trong danh sách)'
      },
      {
        userId: '876543210987654321', // User khác
        guildId: 'test-guild-admin-permissions',
        description: 'User khác (không trong danh sách)'
      }
    ];

    for (const testCase of testCases) {
      console.log(`📋 Testing: ${testCase.description}`);
      console.log(`   User ID: ${testCase.userId}`);
      console.log(`   Guild ID: ${testCase.guildId}`);
      
      // Test không có client (chỉ kiểm tra ID list)
      const isAdminWithoutClient = await FishBattleService.isAdministrator(
        testCase.userId, 
        testCase.guildId
      );
      console.log(`   Is Admin (ID list only): ${isAdminWithoutClient}`);
      
      // Test với client null (sẽ fallback về ID list)
      const isAdminWithNullClient = await FishBattleService.isAdministrator(
        testCase.userId, 
        testCase.guildId, 
        null
      );
      console.log(`   Is Admin (with null client): ${isAdminWithNullClient}`);
      
      console.log('');
    }

    console.log('📝 Kết luận:');
    console.log('✅ Hệ thống đã được cập nhật để hỗ trợ cả:');
    console.log('   1. Danh sách ID cứng (fallback)');
    console.log('   2. Discord permissions (khi có client)');
    console.log('');
    console.log('🔧 Để thêm admin mới:');
    console.log('   1. Thêm User ID vào danh sách trong src/utils/fish-battle.ts');
    console.log('   2. Hoặc cấp quyền Administrator/ManageGuild trong Discord');
    console.log('');
    console.log('⚠️  Lưu ý: Discord permissions chỉ hoạt động khi có client context');
    console.log('   (từ message hoặc interaction)');

  } catch (error) {
    console.error('❌ Error testing admin permissions:', error);
  }
}

testAdminPermissions(); 