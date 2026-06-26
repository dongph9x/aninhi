-- CreateTable
CREATE TABLE "Fish" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "rarity" TEXT NOT NULL,
    "value" INTEGER NOT NULL DEFAULT 0,
    "generation" INTEGER NOT NULL DEFAULT 1,
    "specialTraits" TEXT,
    "status" TEXT NOT NULL DEFAULT 'growing',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FishInventory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishInventory_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishInventoryItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishInventoryId" TEXT NOT NULL,
    "fishId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishInventoryItem_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FishInventoryItem_fishInventoryId_fkey" FOREIGN KEY ("fishInventoryId") REFERENCES "FishInventory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FishMarket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "listedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "FishMarket_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BreedingHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "parent1Id" TEXT NOT NULL,
    "parent2Id" TEXT NOT NULL,
    "offspringId" TEXT NOT NULL,
    "bredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT
);

-- CreateIndex
CREATE INDEX "Fish_userId_idx" ON "Fish"("userId");

-- CreateIndex
CREATE INDEX "Fish_guildId_idx" ON "Fish"("guildId");

-- CreateIndex
CREATE INDEX "Fish_rarity_idx" ON "Fish"("rarity");

-- CreateIndex
CREATE INDEX "Fish_status_idx" ON "Fish"("status");

-- CreateIndex
CREATE INDEX "FishInventory_userId_guildId_idx" ON "FishInventory"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "FishInventory_userId_guildId_key" ON "FishInventory"("userId", "guildId");

-- CreateIndex
CREATE UNIQUE INDEX "FishInventoryItem_fishId_key" ON "FishInventoryItem"("fishId");

-- CreateIndex
CREATE INDEX "FishInventoryItem_fishInventoryId_idx" ON "FishInventoryItem"("fishInventoryId");

-- CreateIndex
CREATE INDEX "FishInventoryItem_fishId_idx" ON "FishInventoryItem"("fishId");

-- CreateIndex
CREATE UNIQUE INDEX "FishMarket_fishId_key" ON "FishMarket"("fishId");

-- CreateIndex
CREATE INDEX "FishMarket_sellerId_idx" ON "FishMarket"("sellerId");

-- CreateIndex
CREATE INDEX "FishMarket_guildId_idx" ON "FishMarket"("guildId");

-- CreateIndex
CREATE INDEX "FishMarket_price_idx" ON "FishMarket"("price");

-- CreateIndex
CREATE INDEX "FishMarket_expiresAt_idx" ON "FishMarket"("expiresAt");

-- CreateIndex
CREATE INDEX "BreedingHistory_userId_idx" ON "BreedingHistory"("userId");

-- CreateIndex
CREATE INDEX "BreedingHistory_guildId_idx" ON "BreedingHistory"("guildId");

-- CreateIndex
CREATE INDEX "BreedingHistory_parent1Id_idx" ON "BreedingHistory"("parent1Id");

-- CreateIndex
CREATE INDEX "BreedingHistory_parent2Id_idx" ON "BreedingHistory"("parent2Id");

-- CreateIndex
CREATE INDEX "BreedingHistory_offspringId_idx" ON "BreedingHistory"("offspringId");
