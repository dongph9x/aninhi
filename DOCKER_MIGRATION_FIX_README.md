# 🐳 Docker Migration Fix - Sửa Lỗi isCloned Column

## 🚨 Vấn Đề Đã Gặp Phải

### **Lỗi Database Schema**
```
Error adding legendary fish to inventory: PrismaClientKnownRequestError: 
Invalid `prisma.fish.create()` invocation:

The column `isCloned` does not exist in the current database.
    at ri.handleRequestError (/app/node_modules/@prisma/client/src/runtime/RequestHandler.ts:228:13)
    at ri.handleAndLogRequestError (/app/node_modules/@prisma/client/src/runtime/RequestHandler.ts:174:12)
    at ri.request (/app/node_modules/@prisma/client/src/runtime/RequestHandler.ts:143:12)
    at l (/app/node_modules/@prisma/client/src/runtime/getPrismaClient.ts:862:24)
    at fishWithAnimation (/app/src/commands/text/ecommerce/fishing.ts:484:37)
    at Object.run (/app/src/commands/text/ecommerce/fishing.ts:59:20) {
  code: 'P2022',
  meta: { modelName: 'Fish', column: 'isCloned' },
  clientVersion: '6.12.0'
}
```

### **Nguyên Nhân**
- ❌ Database schema cũ không có cột `isCloned`, `clonedFrom`, `clonedAt`
- ❌ Code mới sử dụng các trường này nhưng database chưa được migrate
- ❌ Docker container sử dụng database volume cũ
- ❌ Migration chưa được chạy trong Docker environment

## ✅ Giải Pháp Đã Áp Dụng

### **1. Sửa Code - Thêm Default Values**

#### **A. File: `src/commands/text/ecommerce/fishing.ts`**
```typescript
// TRƯỚC - Thiếu cloning fields
const fishData = {
    userId,
    guildId,
    species: fish.name,
    level: 1,
    experience: 0,
    rarity: 'legendary',
    value: value,
    generation: 1,
    specialTraits: JSON.stringify(['Caught']),
    status: 'growing',
};

// SAU - Thêm cloning fields
const fishData = {
    userId,
    guildId,
    species: fish.name,
    level: 1,
    experience: 0,
    rarity: 'legendary',
    value: value,
    generation: 1,
    specialTraits: JSON.stringify(['Caught']),
    status: 'growing',
    // Cloning fields (default values for new fish)
    isCloned: false,
    clonedFrom: null,
    clonedAt: null,
};
```

#### **B. File: `src/utils/fish-breeding.ts`**
```typescript
// Thêm vào fishData object trong migrateCaughtFishToFish()
const fishData = {
    // ... existing fields ...
    // Cloning fields (default values for new fish)
    isCloned: false,
    clonedFrom: null,
    clonedAt: null,
    // ... rest of fields ...
};

// Thêm vào offspring creation trong breedFish()
const offspring = await prisma.fish.create({
    data: {
        // ... existing fields ...
        // Cloning fields (default values for new fish)
        isCloned: false,
        clonedFrom: null,
        clonedAt: null,
    }
});
```

#### **C. File: `src/commands/text/admin/simulateuser.ts`**
```typescript
// Thêm vào test fish creation
const fish = await prisma.fish.create({
    data: {
        // ... existing fields ...
        // Cloning fields (default values for new fish)
        isCloned: false,
        clonedFrom: null,
        clonedAt: null,
    }
});
```

### **2. Docker Migration Script**

#### **File: `docker-migration-fix.sh`**
```bash
#!/bin/bash

echo "🚀 Starting Docker Migration Fix..."

# 1. Stop containers
docker-compose down

# 2. Remove old database volume (WARNING: This will delete all data!)
docker volume rm aninhi_postgres_data 2>/dev/null || echo "Volume not found, continuing..."

# 3. Build and start containers
docker-compose up -d --build

# 4. Wait for database to be ready
sleep 10

# 5. Run Prisma migrations
docker-compose exec app npx prisma migrate deploy

# 6. Generate Prisma client
docker-compose exec app npx prisma generate

# 7. Check migration status
docker-compose exec app npx prisma migrate status

echo "✅ Migration fix completed!"
```

## 🔄 Cách Sử Dụng

### **1. Chạy Migration Script**
```bash
# Make script executable
chmod +x docker-migration-fix.sh

# Run the fix
./docker-migration-fix.sh
```

### **2. Manual Steps (Alternative)**
```bash
# 1. Stop containers
docker compose down

# 2. Remove old database volume
docker volume rm aninhi_postgres_data

# 3. Start containers
docker compose up -d --build

# 4. Wait for database
sleep 10

# 5. Run migrations
docker compose exec app npx prisma migrate deploy

# 6. Generate client
docker compose exec app npx prisma generate
```

## 📊 Database Schema

### **Migration: `20250903140533_add_fish_cloning_fields`**
```sql
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Fish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL,
    "value" BIGINT NOT NULL DEFAULT 0,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "specialTraits" TEXT,
    "stats" TEXT,
    "status" TEXT NOT NULL DEFAULT 'growing',
    -- NEW FIELDS
    "isCloned" BOOLEAN NOT NULL DEFAULT false,
    "clonedFrom" TEXT,
    "clonedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- Copy existing data
INSERT INTO "new_Fish" ("createdAt", "experience", "generation", "guildId", "id", "level", "rarity", "specialTraits", "species", "stats", "status", "updatedAt", "userId", "value") 
SELECT "createdAt", "experience", "generation", "guildId", "id", "level", "rarity", "specialTraits", "species", "stats", "status", "updatedAt", "userId", "value" 
FROM "Fish";

-- Replace old table
DROP TABLE "Fish";
ALTER TABLE "new_Fish" RENAME TO "Fish";

-- Create indexes
CREATE INDEX "Fish_userId_idx" ON "Fish"("userId");
CREATE INDEX "Fish_guildId_idx" ON "Fish"("guildId");
CREATE INDEX "Fish_rarity_idx" ON "Fish"("rarity");
CREATE INDEX "Fish_status_idx" ON "Fish"("status");
CREATE INDEX "Fish_isCloned_idx" ON "Fish"("isCloned");
CREATE INDEX "Fish_clonedFrom_idx" ON "Fish"("clonedFrom");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
```

### **Prisma Schema**
```prisma
model Fish {
  id                    String                    @id @default(cuid())
  userId                String
  guildId               String
  species               String
  level                 Int                       @default(1)
  experience            Int                       @default(0)
  rarity                String
  value                 BigInt                    @default(0)
  generation            Int                       @default(1)
  specialTraits         String?
  stats                 String?
  status                String                    @default("growing")
  
  // Cloning fields
  isCloned              Boolean                   @default(false)
  clonedFrom            String?
  clonedAt              DateTime?
  
  createdAt             DateTime                  @default(now())
  updatedAt             DateTime                  @updatedAt
  
  // Relations
  inventoryItem         FishInventoryItem?
  battleInventoryItem   BattleFishInventoryItem?
  marketListing         FishMarket?

  @@index([userId])
  @@index([guildId])
  @@index([rarity])
  @@index([status])
  @@index([isCloned])
  @@index([clonedFrom])
}
```

## 🎯 Kết Quả

### **Trước khi sửa:**
- ❌ `prisma.fish.create()` fail với lỗi "column isCloned does not exist"
- ❌ Không thể tạo cá mới
- ❌ Tournament checker bị lỗi

### **Sau khi sửa:**
- ✅ Database có đầy đủ cột `isCloned`, `clonedFrom`, `clonedAt`
- ✅ Code có default values cho các trường mới
- ✅ Có thể tạo cá mới bình thường
- ✅ Tournament checker hoạt động

## 🔍 Chi Tiết Kỹ Thuật

### **1. Default Values**
```typescript
// Cho cá mới (không phải clone)
isCloned: false,
clonedFrom: null,
clonedAt: null,

// Cho cá clone (trong FishBarnHandler.createClonedFish)
isCloned: true,
clonedFrom: originalFish.id,
clonedAt: new Date()
```

### **2. Migration Strategy**
- **Backup data:** Migration copy dữ liệu cũ sang table mới
- **Add columns:** Thêm 3 cột mới với default values
- **Create indexes:** Tạo index cho performance
- **Drop old table:** Xóa table cũ và rename table mới

### **3. Docker Volume Issue**
- **Problem:** Docker volume chứa database cũ không có schema mới
- **Solution:** Xóa volume cũ và tạo lại với schema mới
- **Warning:** Sẽ mất tất cả dữ liệu cũ!

## 🚀 Cải Tiến Tương Lai

### **1. Data Migration Script**
```typescript
// Script để migrate dữ liệu cũ thay vì xóa
const migrateExistingFish = async () => {
  const fishWithoutCloningFields = await prisma.fish.findMany({
    where: {
      isCloned: null // Tìm cá chưa có field này
    }
  });
  
  for (const fish of fishWithoutCloningFields) {
    await prisma.fish.update({
      where: { id: fish.id },
      data: {
        isCloned: false,
        clonedFrom: null,
        clonedAt: null
      }
    });
  }
};
```

### **2. Backup Before Migration**
```bash
# Backup database trước khi migration
docker compose exec postgres pg_dump -U postgres aninhi > backup.sql

# Restore nếu cần
docker compose exec -T postgres psql -U postgres aninhi < backup.sql
```

### **3. Health Check**
```typescript
// Check database schema health
const checkSchemaHealth = async () => {
  try {
    await prisma.fish.findFirst({
      select: {
        isCloned: true,
        clonedFrom: true,
        clonedAt: true
      }
    });
    console.log('✅ Schema is healthy');
  } catch (error) {
    console.error('❌ Schema is missing columns:', error);
  }
};
```

## 📝 Lưu Ý

- **⚠️ WARNING:** Script sẽ xóa tất cả dữ liệu cũ!
- **🔄 Migration:** Chạy migration script để cập nhật database
- **📦 Docker:** Đảm bảo containers được rebuild
- **🔧 Prisma:** Generate client sau khi migration
- **✅ Testing:** Test tạo cá mới sau khi fix

## 🎯 Kết Quả

- ✅ **Database schema được cập nhật đầy đủ**
- ✅ **Code có default values cho các trường mới**
- ✅ **Không còn lỗi "column isCloned does not exist"**
- ✅ **Có thể tạo cá mới bình thường**
- ✅ **Tournament checker hoạt động**
- ✅ **Docker environment ổn định**
