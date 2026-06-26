-- CreateTable
CREATE TABLE "FishFood" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "foodType" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FishFood_userId_guildId_fkey" FOREIGN KEY ("userId", "guildId") REFERENCES "User" ("userId", "guildId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FishFood_userId_guildId_idx" ON "FishFood"("userId", "guildId");

-- CreateIndex
CREATE INDEX "FishFood_foodType_idx" ON "FishFood"("foodType");

-- CreateIndex
CREATE UNIQUE INDEX "FishFood_userId_guildId_foodType_key" ON "FishFood"("userId", "guildId", "foodType");
