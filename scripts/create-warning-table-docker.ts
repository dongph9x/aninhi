import prisma from '../src/utils/prisma';

async function createWarningTable() {
  console.log('🔧 Creating WarningRecord table in Docker...\n');

  try {
    // Tạo table WarningRecord bằng raw SQL
    console.log('1. Creating WarningRecord table...');
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
    console.log('\n2. Creating indexes...');
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_userId_idx ON WarningRecord(userId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_guildId_idx ON WarningRecord(guildId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_moderatorId_idx ON WarningRecord(moderatorId)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_warningLevel_idx ON WarningRecord(warningLevel)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_isActive_idx ON WarningRecord(isActive)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS WarningRecord_expiresAt_idx ON WarningRecord(expiresAt)`;
    console.log('✅ All indexes created successfully');

    // Test tạo một warning record
    console.log('\n3. Testing WarningRecord functionality...');
    const testWarning = await prisma.warningRecord.create({
      data: {
        id: 'test_warning_' + Date.now(),
        userId: 'test_user',
        guildId: 'test_guild',
        moderatorId: 'test_moderator',
        warningLevel: 1,
        reason: 'Test warning',
        message: 'This is a test warning',
        isActive: true,
      }
    });
    console.log('✅ Test warning created:', testWarning.id);

    // Xóa test warning
    await prisma.warningRecord.delete({
      where: { id: testWarning.id }
    });
    console.log('✅ Test warning cleaned up');

    console.log('\n🎉 WarningRecord table setup completed successfully!');
    console.log('📊 Table is now ready for use in Docker environment');

  } catch (error) {
    console.error('❌ Error creating WarningRecord table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createWarningTable();