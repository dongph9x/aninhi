import prisma from '../src/utils/prisma';

async function testWarningRecord() {
  console.log('🔍 Testing WarningRecord in Docker...\n');

  try {
    // Test tạo warning record
    console.log('1. Creating test warning record...');
    const testWarning = await prisma.warningRecord.create({
      data: {
        id: 'test_warning_' + Date.now(),
        userId: 'test_user_docker',
        guildId: 'test_guild_docker',
        moderatorId: 'test_moderator_docker',
        warningLevel: 1,
        reason: 'Test warning in Docker',
        message: 'This is a test warning in Docker environment',
        isActive: true,
      }
    });
    console.log('✅ Test warning created:', testWarning.id);

    // Test đọc warning record
    console.log('\n2. Reading test warning record...');
    const readWarning = await prisma.warningRecord.findUnique({
      where: { id: testWarning.id }
    });
    console.log('✅ Warning record read:', readWarning?.reason);

    // Test đọc tất cả warnings
    console.log('\n3. Reading all warning records...');
    const allWarnings = await prisma.warningRecord.findMany({
      where: { userId: 'test_user_docker' }
    });
    console.log('✅ Found warnings:', allWarnings.length);

    // Xóa test warning
    console.log('\n4. Cleaning up test warning...');
    await prisma.warningRecord.delete({
      where: { id: testWarning.id }
    });
    console.log('✅ Test warning cleaned up');

    console.log('\n🎉 WarningRecord test completed successfully!');
    console.log('📊 Table is working correctly in Docker environment');

  } catch (error) {
    console.error('❌ Error testing WarningRecord:', error);
    
    // Nếu table không tồn tại, tạo nó
    if (error.message.includes('WarningRecord') && error.message.includes('does not exist')) {
      console.log('\n🔧 Creating WarningRecord table...');
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS WarningRecord (
            id TEXT NOT NULL PRIMARY KEY,
            userId TEXT NOT NULL,
            guildId TEXT NOT NULL,
            moderatorId TEXT NOT NULL,
            warningLevel INTEGER NOT NULL DEFAULT 1,
            reason TEXT NOT NULL,
            message TEXT NOT NULL,
            isActive BOOLEAN NOT NULL DEFAULT true,
            createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
            expiresAt DATETIME
          )
        `;
        console.log('✅ WarningRecord table created successfully');
        
        // Tạo indexes
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_userId_idx ON WarningRecord(userId)`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_guildId_idx ON WarningRecord(guildId)`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_moderatorId_idx ON WarningRecord(moderatorId)`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_warningLevel_idx ON WarningRecord(warningLevel)`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_isActive_idx ON WarningRecord(isActive)`;
        await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_expiresAt_idx ON WarningRecord(expiresAt)`;
        console.log('✅ All indexes created successfully');
        
        console.log('\n🔄 Retrying test...');
        await testWarningRecord();
      } catch (createError) {
        console.error('❌ Error creating WarningRecord table:', createError);
      }
    }
  } finally {
    await prisma.$disconnect();
  }
}

testWarningRecord();