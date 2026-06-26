import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkAllDatabaseTables() {
  console.log('🔍 Kiểm Tra Tất Cả Bảng Trong Database\n');

  try {
    // 1. Kiểm tra kết nối database
    console.log('1️⃣ Kiểm Tra Kết Nối Database:');
    
    await prisma.$connect();
    console.log('   ✅ Kết nối database thành công');

    // 2. Thử query tất cả các bảng chính
    console.log('\n2️⃣ Kiểm Tra Các Bảng Chính:');
    
    // Kiểm tra bảng User
    try {
      const userCount = await prisma.user.count();
      console.log(`   ✅ Bảng User: ${userCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng User: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng Fish
    try {
      const fishCount = await prisma.fish.count();
      console.log(`   ✅ Bảng Fish: ${fishCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng Fish: Không tồn tại hoặc lỗi');
      console.log(`   🔍 Lỗi chi tiết: ${error}`);
    }

    // Kiểm tra bảng FishInventory
    try {
      const fishInventoryCount = await prisma.fishInventory.count();
      console.log(`   ✅ Bảng FishInventory: ${fishInventoryCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng FishInventory: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng FishInventoryItem
    try {
      const fishInventoryItemCount = await prisma.fishInventoryItem.count();
      console.log(`   ✅ Bảng FishInventoryItem: ${fishInventoryItemCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng FishInventoryItem: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng BattleFishInventory
    try {
      const battleFishInventoryCount = await prisma.battleFishInventory.count();
      console.log(`   ✅ Bảng BattleFishInventory: ${battleFishInventoryCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng BattleFishInventory: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng BattleFishInventoryItem
    try {
      const battleFishInventoryItemCount = await prisma.battleFishInventoryItem.count();
      console.log(`   ✅ Bảng BattleFishInventoryItem: ${battleFishInventoryItemCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng BattleFishInventoryItem: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng BreedingHistory
    try {
      const breedingHistoryCount = await prisma.breedingHistory.count();
      console.log(`   ✅ Bảng BreedingHistory: ${breedingHistoryCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng BreedingHistory: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng FishMarket
    try {
      const fishMarketCount = await prisma.fishMarket.count();
      console.log(`   ✅ Bảng FishMarket: ${fishMarketCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng FishMarket: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng FishFood
    try {
      const fishFoodCount = await prisma.fishFood.count();
      console.log(`   ✅ Bảng FishFood: ${fishFoodCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng FishFood: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng Transaction
    try {
      const transactionCount = await prisma.transaction.count();
      console.log(`   ✅ Bảng Transaction: ${transactionCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng Transaction: Không tồn tại hoặc lỗi');
    }

    // Kiểm tra bảng FishTransaction
    try {
      const fishTransactionCount = await prisma.fishTransaction.count();
      console.log(`   ✅ Bảng FishTransaction: ${fishTransactionCount} records`);
    } catch (error) {
      console.log('   ❌ Bảng FishTransaction: Không tồn tại hoặc lỗi');
    }

    // 3. Kiểm tra schema
    console.log('\n3️⃣ Kiểm Tra Schema:');
    
    // Thử lấy một record từ bảng User để kiểm tra schema
    try {
      const sampleUser = await prisma.user.findFirst({
        select: {
          id: true,
          userId: true,
          guildId: true,
          balance: true,
          fishBalance: true,
          dailyStreak: true,
          dailyBattleCount: true,
          dailyFeedCount: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      if (sampleUser) {
        console.log('   ✅ Schema User hợp lệ');
        console.log(`   📋 Sample User: ${JSON.stringify(sampleUser, null, 2)}`);
      } else {
        console.log('   ⚠️ Bảng User trống');
      }
    } catch (error) {
      console.log('   ❌ Lỗi khi kiểm tra schema User');
    }

    // 4. Kiểm tra Prisma Client
    console.log('\n4️⃣ Kiểm Tra Prisma Client:');
    
    const prismaModels = Object.keys(prisma).filter(key => 
      typeof prisma[key as keyof typeof prisma] === 'object' && 
      prisma[key as keyof typeof prisma] !== null &&
      typeof (prisma[key as keyof typeof prisma] as any).findMany === 'function'
    );
    
    console.log('   📋 Các model có sẵn trong Prisma Client:');
    prismaModels.forEach(model => {
      console.log(`      - ${model}`);
    });

    // 5. Kiểm tra file schema.prisma
    console.log('\n5️⃣ Kiểm Tra File Schema:');
    
    const fs = require('fs');
    const path = require('path');
    
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    
    if (fs.existsSync(schemaPath)) {
      console.log('   ✅ File schema.prisma tồn tại');
      
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      const modelMatches = schemaContent.match(/model\s+(\w+)\s*{/g);
      
      if (modelMatches) {
        console.log('   📋 Các model trong schema.prisma:');
        modelMatches.forEach(match => {
          const modelName = match.replace(/model\s+(\w+)\s*{/, '$1');
          console.log(`      - ${modelName}`);
        });
      }
    } else {
      console.log('   ❌ File schema.prisma không tồn tại');
    }

    // 6. Kiểm tra migrations
    console.log('\n6️⃣ Kiểm Tra Migrations:');
    
    const migrationsPath = path.join(process.cwd(), 'prisma', 'migrations');
    
    if (fs.existsSync(migrationsPath)) {
      const migrations = fs.readdirSync(migrationsPath).filter(dir => 
        fs.statSync(path.join(migrationsPath, dir)).isDirectory()
      );
      
      console.log(`   📋 Số migrations: ${migrations.length}`);
      migrations.forEach(migration => {
        console.log(`      - ${migration}`);
      });
    } else {
      console.log('   ❌ Thư mục migrations không tồn tại');
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Chạy script
checkAllDatabaseTables(); 