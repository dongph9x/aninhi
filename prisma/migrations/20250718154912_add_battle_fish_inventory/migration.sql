-- CreateTable
CREATE TABLE "BattleFishInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BattleFishInventory_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BattleFishInventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "battleFishInventoryId" TEXT NOT NULL,
    "fishId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "BattleFishInventoryItem_battleFishInventoryId_fkey" FOREIGN KEY ("battleFishInventoryId") REFERENCES "BattleFishInventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BattleFishInventoryItem_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "BattleFishInventory_userId_guildId_idx" ON "BattleFishInventory"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleFishInventory_userId_guildId_key" ON "BattleFishInventory"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleFishInventoryItem_fishId_key" ON "BattleFishInventoryItem"("fishId");

-- CreateIndex
CREATE INDEX "BattleFishInventoryItem_battleFishInventoryId_idx" ON "BattleFishInventoryItem"("battleFishInventoryId");

-- CreateIndex
CREATE INDEX "BattleFishInventoryItem_fishId_idx" ON "BattleFishInventoryItem"("fishId");
