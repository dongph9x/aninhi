-- CreateTable
CREATE TABLE "BattleHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "fishId" TEXT NOT NULL,
    "opponentId" TEXT NOT NULL,
    "opponentUserId" TEXT NOT NULL,
    "userPower" INTEGER NOT NULL,
    "opponentPower" INTEGER NOT NULL,
    "userWon" BOOLEAN NOT NULL,
    "reward" INTEGER NOT NULL,
    "battleLog" TEXT NOT NULL,
    "battledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "BattleHistory_userId_idx" ON "BattleHistory"("userId");

-- CreateIndex
CREATE INDEX "BattleHistory_guildId_idx" ON "BattleHistory"("guildId");

-- CreateIndex
CREATE INDEX "BattleHistory_fishId_idx" ON "BattleHistory"("fishId");

-- CreateIndex
CREATE INDEX "BattleHistory_opponentId_idx" ON "BattleHistory"("opponentId");

-- CreateIndex
CREATE INDEX "BattleHistory_battledAt_idx" ON "BattleHistory"("battledAt");
