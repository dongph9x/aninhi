-- CreateTable
CREATE TABLE "FishSkillDefinition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "element" TEXT NOT NULL,
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseCost" BIGINT NOT NULL,
    "baseDamage" INTEGER NOT NULL,
    "damageMultiplier" DECIMAL NOT NULL DEFAULT 1.00,
    "damagePerLevel" DECIMAL NOT NULL DEFAULT 0.10,
    "maxLevel" INTEGER NOT NULL DEFAULT 5,
    "baseSuccessRate" DECIMAL NOT NULL DEFAULT 0.50,
    "successRatePerLevel" DECIMAL NOT NULL DEFAULT 0.05,
    "cooldown" INTEGER NOT NULL DEFAULT 3,
    "requirements" TEXT,
    "effects" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FishSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fishId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "learnedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" DATETIME,
    CONSTRAINT "FishSkill_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FishSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FishSkillDefinition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "FishSkillDefinition_element_idx" ON "FishSkillDefinition"("element");

-- CreateIndex
CREATE INDEX "FishSkill_fishId_idx" ON "FishSkill"("fishId");

-- CreateIndex
CREATE INDEX "FishSkill_skillId_idx" ON "FishSkill"("skillId");

-- CreateIndex
CREATE UNIQUE INDEX "FishSkill_fishId_skillId_key" ON "FishSkill"("fishId", "skillId");
