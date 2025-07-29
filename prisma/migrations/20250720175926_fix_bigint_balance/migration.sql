-- Convert monetary fields from INT to BIGINT to handle large numbers
-- This fixes the issue where large balance values cause overflow
-- SQLite doesn't support ALTER COLUMN, so we need to recreate tables

-- User table - balance field
CREATE TABLE "User_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "dailyStreak" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "User_new" SELECT * FROM "User";
DROP TABLE "User";
ALTER TABLE "User_new" RENAME TO "User";
CREATE UNIQUE INDEX "User_userId_guildId_key" ON "User"("userId", "guildId");
CREATE INDEX "User_userId_idx" ON "User"("userId");
CREATE INDEX "User_guildId_idx" ON "User"("guildId");

-- Transaction table - amount field
CREATE TABLE "Transaction_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "Transaction_new" SELECT * FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "Transaction_new" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_guildId_idx" ON "Transaction"("userId", "guildId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- GameStats table - monetary fields
CREATE TABLE "GameStats_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "gameType" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "gamesWon" INTEGER NOT NULL DEFAULT 0,
    "totalBet" BIGINT NOT NULL DEFAULT 0,
    "totalWon" BIGINT NOT NULL DEFAULT 0,
    "totalLost" BIGINT NOT NULL DEFAULT 0,
    "biggestWin" BIGINT NOT NULL DEFAULT 0,
    "biggestLoss" BIGINT NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "GameStats_new" SELECT * FROM "GameStats";
DROP TABLE "GameStats";
ALTER TABLE "GameStats_new" RENAME TO "GameStats";
CREATE UNIQUE INDEX "GameStats_userId_guildId_gameType_key" ON "GameStats"("userId", "guildId", "gameType");
CREATE INDEX "GameStats_userId_guildId_idx" ON "GameStats"("userId", "guildId");
CREATE INDEX "GameStats_gameType_idx" ON "GameStats"("gameType");

-- FishingData table - monetary fields
CREATE TABLE "FishingData_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "totalFish" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" BIGINT NOT NULL DEFAULT 0,
    "biggestFish" TEXT NOT NULL DEFAULT '',
    "biggestValue" BIGINT NOT NULL DEFAULT 0,
    "rarestFish" TEXT NOT NULL DEFAULT '',
    "rarestRarity" TEXT NOT NULL DEFAULT '',
    "fishingTime" INTEGER NOT NULL DEFAULT 0,
    "currentRod" TEXT NOT NULL DEFAULT 'basic',
    "currentBait" TEXT NOT NULL DEFAULT 'basic',
    "lastFished" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "FishingData_new" SELECT * FROM "FishingData";
DROP TABLE "FishingData";
ALTER TABLE "FishingData_new" RENAME TO "FishingData";
CREATE UNIQUE INDEX "FishingData_userId_guildId_key" ON "FishingData"("userId", "guildId");
CREATE INDEX "FishingData_userId_guildId_idx" ON "FishingData"("userId", "guildId");

-- CaughtFish table - fishValue field
CREATE TABLE "CaughtFish_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishingDataId" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "fishRarity" TEXT NOT NULL,
    "fishValue" BIGINT NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "CaughtFish_new" SELECT * FROM "CaughtFish";
DROP TABLE "CaughtFish";
ALTER TABLE "CaughtFish_new" RENAME TO "CaughtFish";
CREATE UNIQUE INDEX "CaughtFish_fishingDataId_fishName_key" ON "CaughtFish"("fishingDataId", "fishName");
CREATE INDEX "CaughtFish_fishingDataId_idx" ON "CaughtFish"("fishingDataId");
CREATE INDEX "CaughtFish_fishRarity_idx" ON "CaughtFish"("fishRarity");

-- Tournament table - monetary fields
CREATE TABLE "Tournament_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "entryFee" BIGINT NOT NULL,
    "prizePool" BIGINT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "currentParticipants" INTEGER NOT NULL DEFAULT 0,
    "winnerCount" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "createdBy" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "winnerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "Tournament_new" SELECT "id", "name", "description", "entryFee", "prizePool", "maxParticipants", "currentParticipants", 1, "status", "startTime", "endTime", "createdBy", "guildId", "channelId", "winnerId", "createdAt", "updatedAt" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "Tournament_new" RENAME TO "Tournament";
CREATE INDEX "Tournament_guildId_idx" ON "Tournament"("guildId");
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");
CREATE INDEX "Tournament_createdBy_idx" ON "Tournament"("createdBy");
CREATE INDEX "Tournament_winnerId_idx" ON "Tournament"("winnerId");

-- ItemTemplate table - baseValue field
CREATE TABLE "ItemTemplate_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "itemId" TEXT NOT NULL UNIQUE,
    "itemName" TEXT NOT NULL,
    "itemType" TEXT NOT NULL,
    "itemRarity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseValue" BIGINT NOT NULL DEFAULT 0,
    "maxStack" INTEGER NOT NULL DEFAULT 1,
    "maxDurability" INTEGER,
    "baseStats" TEXT,
    "effects" TEXT,
    "requirements" TEXT,
    "isTradeable" BOOLEAN NOT NULL DEFAULT true,
    "isDroppable" BOOLEAN NOT NULL DEFAULT true,
    "isConsumable" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "ItemTemplate_new" SELECT * FROM "ItemTemplate";
DROP TABLE "ItemTemplate";
ALTER TABLE "ItemTemplate_new" RENAME TO "ItemTemplate";
CREATE INDEX "ItemTemplate_itemId_idx" ON "ItemTemplate"("itemId");
CREATE INDEX "ItemTemplate_itemType_idx" ON "ItemTemplate"("itemType");
CREATE INDEX "ItemTemplate_itemRarity_idx" ON "ItemTemplate"("itemRarity");
CREATE INDEX "ItemTemplate_category_idx" ON "ItemTemplate"("category");

-- ModerationLog table - amount field
CREATE TABLE "ModerationLog_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "targetUserId" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "duration" INTEGER,
    "amount" BIGINT,
    "channelId" TEXT,
    "messageId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "ModerationLog_new" SELECT * FROM "ModerationLog";
DROP TABLE "ModerationLog";
ALTER TABLE "ModerationLog_new" RENAME TO "ModerationLog";
CREATE INDEX "ModerationLog_guildId_idx" ON "ModerationLog"("guildId");
CREATE INDEX "ModerationLog_targetUserId_idx" ON "ModerationLog"("targetUserId");
CREATE INDEX "ModerationLog_moderatorId_idx" ON "ModerationLog"("moderatorId");
CREATE INDEX "ModerationLog_action_idx" ON "ModerationLog"("action");
CREATE INDEX "ModerationLog_createdAt_idx" ON "ModerationLog"("createdAt");

-- Fish table - value field
CREATE TABLE "Fish_new" (
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "Fish_new" SELECT * FROM "Fish";
DROP TABLE "Fish";
ALTER TABLE "Fish_new" RENAME TO "Fish";
CREATE INDEX "Fish_userId_idx" ON "Fish"("userId");
CREATE INDEX "Fish_guildId_idx" ON "Fish"("guildId");
CREATE INDEX "Fish_rarity_idx" ON "Fish"("rarity");
CREATE INDEX "Fish_status_idx" ON "Fish"("status");

-- FishMarket table - price field
CREATE TABLE "FishMarket_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishId" TEXT NOT NULL UNIQUE,
    "sellerId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL
);
INSERT INTO "FishMarket_new" SELECT * FROM "FishMarket";
DROP TABLE "FishMarket";
ALTER TABLE "FishMarket_new" RENAME TO "FishMarket";
CREATE INDEX "FishMarket_sellerId_idx" ON "FishMarket"("sellerId");
CREATE INDEX "FishMarket_guildId_idx" ON "FishMarket"("guildId");
CREATE INDEX "FishMarket_price_idx" ON "FishMarket"("price");
CREATE INDEX "FishMarket_expiresAt_idx" ON "FishMarket"("expiresAt");

-- FishPrice table - monetary fields
CREATE TABLE "FishPrice_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishName" TEXT NOT NULL UNIQUE,
    "basePrice" BIGINT NOT NULL,
    "currentPrice" BIGINT NOT NULL,
    "priceChange" BIGINT NOT NULL DEFAULT 0,
    "changePercent" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceHistory" TEXT
);
INSERT INTO "FishPrice_new" SELECT * FROM "FishPrice";
DROP TABLE "FishPrice";
ALTER TABLE "FishPrice_new" RENAME TO "FishPrice";
CREATE INDEX "FishPrice_fishName_idx" ON "FishPrice"("fishName");
CREATE INDEX "FishPrice_lastUpdated_idx" ON "FishPrice"("lastUpdated");

-- BattleHistory table - reward field
CREATE TABLE "BattleHistory_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "fishId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "opponentUserId" TEXT NOT NULL,
    "userPower" INTEGER NOT NULL,
    "opponentPower" INTEGER NOT NULL,
    "userWon" BOOLEAN NOT NULL,
    "reward" BIGINT NOT NULL,
    "battleLog" TEXT NOT NULL,
    "battledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "BattleHistory_new" SELECT * FROM "BattleHistory";
DROP TABLE "BattleHistory";
ALTER TABLE "BattleHistory_new" RENAME TO "BattleHistory";
CREATE INDEX "BattleHistory_userId_idx" ON "BattleHistory"("userId");
CREATE INDEX "BattleHistory_guildId_idx" ON "BattleHistory"("guildId");
CREATE INDEX "BattleHistory_fishId_idx" ON "BattleHistory"("fishId");
CREATE INDEX "BattleHistory_opponentId_idx" ON "BattleHistory"("opponentId");
CREATE INDEX "BattleHistory_battledAt_idx" ON "BattleHistory"("battledAt"); 