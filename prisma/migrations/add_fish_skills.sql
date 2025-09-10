-- Migration: Add Fish Skills System
-- Tạo bảng định nghĩa skills
CREATE TABLE "FishSkillDefinition" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "element" TEXT NOT NULL, -- fire, water, earth, air, light, dark
    "emoji" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "baseCost" BIGINT NOT NULL, -- Giá FishCoin cơ bản
    "baseDamage" INTEGER NOT NULL, -- Damage cơ bản
    "damageMultiplier" DECIMAL(3,2) NOT NULL DEFAULT 1.00, -- Hệ số damage cơ bản
    "damagePerLevel" DECIMAL(3,2) NOT NULL DEFAULT 0.10, -- Hệ số tăng damage mỗi cấp
    "maxLevel" INTEGER NOT NULL DEFAULT 5,
    "cooldown" INTEGER NOT NULL DEFAULT 3, -- Cooldown (rounds)
    "requirements" TEXT, -- JSON: {level: 10, strength: 50}
    "effects" TEXT, -- JSON: {burn: 0.1, stun: 0.05}
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FishSkillDefinition_pkey" PRIMARY KEY ("id")
);

-- Tạo bảng skills của cá
CREATE TABLE "FishSkill" (
    "id" TEXT NOT NULL,
    "fishId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "learnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsed" TIMESTAMP(3),

    CONSTRAINT "FishSkill_pkey" PRIMARY KEY ("id")
);

-- Tạo indexes
CREATE INDEX "FishSkillDefinition_element_idx" ON "FishSkillDefinition"("element");
CREATE INDEX "FishSkill_fishId_idx" ON "FishSkill"("fishId");
CREATE INDEX "FishSkill_skillId_idx" ON "FishSkill"("skillId");
CREATE UNIQUE INDEX "FishSkill_fishId_skillId_key" ON "FishSkill"("fishId", "skillId");

-- Foreign keys
ALTER TABLE "FishSkill" ADD CONSTRAINT "FishSkill_fishId_fkey" FOREIGN KEY ("fishId") REFERENCES "Fish"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FishSkill" ADD CONSTRAINT "FishSkill_skillId_fkey" FOREIGN KEY ("skillId") REFERENCES "FishSkillDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;
