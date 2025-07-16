-- CreateTable
CREATE TABLE "TournamentMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "tournamentId" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "guildId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentMessage_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "TournamentMessage_tournamentId_idx" ON "TournamentMessage"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentMessage_guildId_idx" ON "TournamentMessage"("guildId");

-- CreateIndex
CREATE INDEX "TournamentMessage_channelId_idx" ON "TournamentMessage"("channelId");

-- CreateIndex
CREATE INDEX "TournamentMessage_messageId_idx" ON "TournamentMessage"("messageId");
