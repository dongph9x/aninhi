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
    "isCloned" BOOLEAN NOT NULL DEFAULT false,
    "clonedFrom" TEXT,
    "clonedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Fish" ("createdAt", "experience", "generation", "guildId", "id", "level", "rarity", "specialTraits", "species", "stats", "status", "updatedAt", "userId", "value") SELECT "createdAt", "experience", "generation", "guildId", "id", "level", "rarity", "specialTraits", "species", "stats", "status", "updatedAt", "userId", "value" FROM "Fish";
DROP TABLE "Fish";
ALTER TABLE "new_Fish" RENAME TO "Fish";
CREATE INDEX "Fish_userId_idx" ON "Fish"("userId");
CREATE INDEX "Fish_guildId_idx" ON "Fish"("guildId");
CREATE INDEX "Fish_rarity_idx" ON "Fish"("rarity");
CREATE INDEX "Fish_status_idx" ON "Fish"("status");
CREATE INDEX "Fish_isCloned_idx" ON "Fish"("isCloned");
CREATE INDEX "Fish_clonedFrom_idx" ON "Fish"("clonedFrom");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
