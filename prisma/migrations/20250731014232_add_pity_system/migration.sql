-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "legendaryPityCount" INTEGER NOT NULL DEFAULT 0,
    "lastLegendaryCaught" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishingData_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FishingData" ("biggestFish", "biggestValue", "createdAt", "currentBait", "currentRod", "fishingTime", "guildId", "id", "lastFished", "rarestFish", "rarestRarity", "totalEarnings", "totalFish", "updatedAt", "userId") SELECT "biggestFish", "biggestValue", "createdAt", "currentBait", "currentRod", "fishingTime", "guildId", "id", "lastFished", "rarestFish", "rarestRarity", "totalEarnings", "totalFish", "updatedAt", "userId" FROM "FishingData";
DROP TABLE "FishingData";
ALTER TABLE "new_FishingData" RENAME TO "FishingData";
CREATE INDEX "FishingData_userId_guildId_idx" ON "FishingData"("userId", "guildId");
CREATE UNIQUE INDEX "FishingData_userId_guildId_key" ON "FishingData"("userId", "guildId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
