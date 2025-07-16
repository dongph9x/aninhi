-- CreateTable
CREATE TABLE "FishingData" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "totalFish" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" INTEGER NOT NULL DEFAULT 0,
    "biggestFish" TEXT NOT NULL DEFAULT '',
    "biggestValue" INTEGER NOT NULL DEFAULT 0,
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

-- CreateTable
CREATE TABLE "FishingRod" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishingDataId" TEXT NOT NULL,
    "rodType" TEXT NOT NULL,
    "durability" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishingRod_fishingDataId_fkey" FOREIGN KEY ("fishingDataId") REFERENCES "FishingData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishingBait" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishingDataId" TEXT NOT NULL,
    "baitType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishingBait_fishingDataId_fkey" FOREIGN KEY ("fishingDataId") REFERENCES "FishingData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CaughtFish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishingDataId" TEXT NOT NULL,
    "fishName" TEXT NOT NULL,
    "fishRarity" TEXT NOT NULL,
    "fishValue" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CaughtFish_fishingDataId_fkey" FOREIGN KEY ("fishingDataId") REFERENCES "FishingData" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FishingData_userId_guildId_idx" ON "FishingData"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "FishingData_userId_guildId_key" ON "FishingData"("userId", "guildId");

-- CreateIndex
CREATE INDEX "FishingRod_fishingDataId_idx" ON "FishingRod"("fishingDataId");

-- CreateIndex
CREATE UNIQUE INDEX "FishingRod_fishingDataId_rodType_key" ON "FishingRod"("fishingDataId", "rodType");

-- CreateIndex
CREATE INDEX "FishingBait_fishingDataId_idx" ON "FishingBait"("fishingDataId");

-- CreateIndex
CREATE UNIQUE INDEX "FishingBait_fishingDataId_baitType_key" ON "FishingBait"("fishingDataId", "baitType");

-- CreateIndex
CREATE INDEX "CaughtFish_fishingDataId_idx" ON "CaughtFish"("fishingDataId");

-- CreateIndex
CREATE INDEX "CaughtFish_fishRarity_idx" ON "CaughtFish"("fishRarity");

-- CreateIndex
CREATE UNIQUE INDEX "CaughtFish_fishingDataId_fishName_key" ON "CaughtFish"("fishingDataId", "fishName");
