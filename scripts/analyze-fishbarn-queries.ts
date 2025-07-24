import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeFishbarnQueries() {
  console.log('🔍 Phân Tích Các Query Của Lệnh n.fishbarn\n');

  const testUserId = 'test-user-fishbarn';
  const testGuildId = 'test-guild-fishbarn';

  try {
    console.log('1️⃣ Query 1: Kiểm tra và tạo User (nếu chưa có)');
    console.log('   Bảng: User');
    console.log('   Query: prisma.user.upsert()');
    console.log('   Mục đích: Đảm bảo user tồn tại trước khi tạo FishInventory');
    console.log('   Fields được query:');
    console.log('     - userId, guildId (unique constraint)');
    console.log('     - balance, dailyStreak (nếu tạo mới)');
    console.log();

    console.log('2️⃣ Query 2: Lấy hoặc tạo FishInventory');
    console.log('   Bảng: FishInventory');
    console.log('   Query: prisma.fishInventory.upsert()');
    console.log('   Include: items (FishInventoryItem) với fish (Fish)');
    console.log('   Mục đích: Lấy inventory của user với tất cả cá');
    console.log('   Fields được query:');
    console.log('     - id, userId, guildId, capacity');
    console.log('     - items: id, fishInventoryId, fishId, createdAt');
    console.log('     - fish: tất cả fields của bảng Fish');
    console.log();

    console.log('3️⃣ Query 3: Kiểm tra Daily Feed Limit');
    console.log('   Bảng: User');
    console.log('   Query: prisma.user.findUnique()');
    console.log('   Mục đích: Kiểm tra giới hạn cho cá ăn hàng ngày');
    console.log('   Fields được query:');
    console.log('     - dailyFeedCount');
    console.log('     - lastFeedReset');
    console.log();

    console.log('4️⃣ Query 4: Update Daily Feed Count (nếu reset)');
    console.log('   Bảng: User');
    console.log('   Query: prisma.user.update() (nếu sang ngày mới)');
    console.log('   Mục đích: Reset daily feed count về 0');
    console.log('   Fields được update:');
    console.log('     - dailyFeedCount: 0');
    console.log('     - lastFeedReset: now()');
    console.log();

    console.log('5️⃣ Query 5: Load User Fish Food (từ FishBarnUI)');
    console.log('   Bảng: FishFood');
    console.log('   Query: prisma.fishFood.findMany()');
    console.log('   Mục đích: Lấy danh sách thức ăn của user');
    console.log('   Fields được query:');
    console.log('     - id, userId, guildId, foodType, quantity');
    console.log('     - createdAt, updatedAt');
    console.log();

    console.log('📊 Tóm Tắt Các Bảng Được Query:');
    console.log('   1. User - Thông tin user và daily feed limit');
    console.log('   2. FishInventory - Rương nuôi cá');
    console.log('   3. FishInventoryItem - Cá trong rương');
    console.log('   4. Fish - Thông tin chi tiết cá');
    console.log('   5. FishFood - Thức ăn của user');
    console.log();

    console.log('🔗 Mối Quan Hệ Giữa Các Bảng:');
    console.log('   User (1) ←→ (1) FishInventory');
    console.log('   FishInventory (1) ←→ (N) FishInventoryItem');
    console.log('   FishInventoryItem (1) ←→ (1) Fish');
    console.log('   User (1) ←→ (N) FishFood');
    console.log();

    console.log('📋 Các Query Chính:');
    console.log('   1. prisma.user.upsert() - Tạo/update user');
    console.log('   2. prisma.fishInventory.upsert() - Tạo/lấy inventory');
    console.log('   3. prisma.user.findUnique() - Kiểm tra daily feed limit');
    console.log('   4. prisma.user.update() - Reset daily feed count (nếu cần)');
    console.log('   5. prisma.fishFood.findMany() - Lấy thức ăn');
    console.log();

    console.log('🎯 Mục Đích Chính:');
    console.log('   - Hiển thị danh sách cá trong rương nuôi');
    console.log('   - Hiển thị thông tin daily feed limit');
    console.log('   - Hiển thị danh sách thức ăn có sẵn');
    console.log('   - Cho phép tương tác (cho ăn, bán, lai tạo)');

  } catch (error) {
    console.error('❌ Lỗi khi phân tích:', error);
  } finally {
    await prisma.$disconnect();
  }
}

analyzeFishbarnQueries(); 