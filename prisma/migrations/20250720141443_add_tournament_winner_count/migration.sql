-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CaughtFish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishingDataId" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "fishRarity" TEXT NOT NULL,
    "fishValue" BIGINT NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaughtFish_fishingDataId_fkey" FOREIGN KEY ("fishingDataId") REFERENCES "FishingData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_CaughtFish" ("createdAt", "fishName", "fishRarity", "fishValue", "fishingDataId", "id", "quantity", "updatedAt") SELECT "createdAt", "fishName", "fishRarity", "fishValue", "fishingDataId", "id", "quantity", "updatedAt" FROM "CaughtFish";
DROP TABLE "CaughtFish";
ALTER TABLE "new_CaughtFish" RENAME TO "CaughtFish";
CREATE INDEX "CaughtFish_fishingDataId_idx" ON "CaughtFish"("fishingDataId");
CREATE INDEX "CaughtFish_fishRarity_idx" ON "CaughtFish"("fishRarity");
CREATE UNIQUE INDEX "CaughtFish_fishingDataId_fishName_key" ON "CaughtFish"("fishingDataId", "fishName");
CREATE TABLE "new_FishMarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "FishMarket_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FishMarket" ("expiresAt", "fishId", "guildId", "id", "listedAt", "price", "sellerId") SELECT "expiresAt", "fishId", "guildId", "id", "listedAt", "price", "sellerId" FROM "FishMarket";
DROP TABLE "FishMarket";
ALTER TABLE "new_FishMarket" RENAME TO "FishMarket";
CREATE UNIQUE INDEX "FishMarket_fishId_key" ON "FishMarket"("fishId");
CREATE INDEX "FishMarket_sellerId_idx" ON "FishMarket"("sellerId");
CREATE INDEX "FishMarket_guildId_idx" ON "FishMarket"("guildId");
CREATE INDEX "FishMarket_price_idx" ON "FishMarket"("price");
CREATE INDEX "FishMarket_expiresAt_idx" ON "FishMarket"("expiresAt");
CREATE TABLE "new_FishingData" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishingData_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FishingData" ("biggestFish", "biggestValue", "createdAt", "currentBait", "currentRod", "fishingTime", "guildId", "id", "lastFished", "rarestFish", "rarestRarity", "totalEarnings", "totalFish", "updatedAt", "userId") SELECT "biggestFish", "biggestValue", "createdAt", "currentBait", "currentRod", "fishingTime", "guildId", "id", "lastFished", "rarestFish", "rarestRarity", "totalEarnings", "totalFish", "updatedAt", "userId" FROM "FishingData";
DROP TABLE "FishingData";
ALTER TABLE "new_FishingData" RENAME TO "FishingData";
CREATE INDEX "FishingData_userId_guildId_idx" ON "FishingData"("userId", "guildId");
CREATE UNIQUE INDEX "FishingData_userId_guildId_key" ON "FishingData"("userId", "guildId");
CREATE TABLE "new_GameStats" (
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
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GameStats_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_GameStats" ("biggestLoss", "biggestWin", "createdAt", "gameType", "gamesPlayed", "gamesWon", "guildId", "id", "totalBet", "totalLost", "totalWon", "updatedAt", "userId") SELECT "biggestLoss", "biggestWin", "createdAt", "gameType", "gamesPlayed", "gamesWon", "guildId", "id", "totalBet", "totalLost", "totalWon", "updatedAt", "userId" FROM "GameStats";
DROP TABLE "GameStats";
ALTER TABLE "new_GameStats" RENAME TO "GameStats";
CREATE INDEX "GameStats_userId_guildId_idx" ON "GameStats"("userId", "guildId");
CREATE INDEX "GameStats_gameType_idx" ON "GameStats"("gameType");
CREATE UNIQUE INDEX "GameStats_userId_guildId_gameType_key" ON "GameStats"("userId", "guildId", "gameType");
CREATE TABLE "new_Tournament" (
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
INSERT INTO "new_Tournament" ("channelId", "createdAt", "createdBy", "currentParticipants", "description", "endTime", "entryFee", "guildId", "id", "maxParticipants", "name", "prizePool", "startTime", "status", "updatedAt", "winnerId") SELECT "channelId", "createdAt", "createdBy", "currentParticipants", "description", "endTime", "entryFee", "guildId", "id", "maxParticipants", "name", "prizePool", "startTime", "status", "updatedAt", "winnerId" FROM "Tournament";
DROP TABLE "Tournament";
ALTER TABLE "new_Tournament" RENAME TO "Tournament";
CREATE INDEX "Tournament_guildId_idx" ON "Tournament"("guildId");
CREATE INDEX "Tournament_status_idx" ON "Tournament"("status");
CREATE INDEX "Tournament_createdBy_idx" ON "Tournament"("createdBy");
CREATE INDEX "Tournament_winnerId_idx" ON "Tournament"("winnerId");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "createdAt", "description", "guildId", "id", "type", "userId") SELECT "amount", "createdAt", "description", "guildId", "id", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_userId_guildId_idx" ON "Transaction"("userId", "guildId");
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineIndex
DROP INDEX "sqlite_autoindex_FishPrice_2";
CREATE UNIQUE INDEX "FishPrice_fishName_key" ON "FishPrice"("fishName");

-- RedefineIndex
DROP INDEX "sqlite_autoindex_ItemTemplate_2";
CREATE UNIQUE INDEX "ItemTemplate_itemId_key" ON "ItemTemplate"("itemId");
