-- CreateTable
CREATE TABLE "FishPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishName" TEXT NOT NULL,
    "basePrice" INTEGER NOT NULL,
    "currentPrice" INTEGER NOT NULL,
    "priceChange" INTEGER NOT NULL DEFAULT 0,
    "changePercent" REAL NOT NULL DEFAULT 0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "priceHistory" TEXT
);

-- CreateIndex
CREATE INDEX "FishPrice_fishName_idx" ON "FishPrice"("fishName");

-- CreateIndex
CREATE INDEX "FishPrice_lastUpdated_idx" ON "FishPrice"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "FishPrice_fishName_key" ON "FishPrice"("fishName");
