#!/usr/bin/env tsx

import { config } from 'dotenv';
import path from 'path';
import { PrismaClient } from "@prisma/client";
import { EcommerceService } from "../src/utils/ecommerce-db";
import { GameStatsService } from "../src/utils/gameStats";
import { TournamentService } from "../src/utils/tournament";
import { FishingService } from "../src/utils/fishing";
import { banDB } from "../src/utils/ban-db";
import { ModerationService } from "../src/utils/moderation";

const prisma = new PrismaClient();

// Load environment variables
const envFolder = path.join(process.cwd(), 'env');
config({ path: path.resolve(envFolder, '.env') });
config({ path: path.resolve(envFolder, '.env.local') });

async function testCommands() {
    console.log("🧪 Bắt đầu test các lệnh...\n");

    const testGuildId = "test-guild-123";
    const testUserId = "test-user-456";
    const testModeratorId = "moderator-789";

    try {
        // Test Ecommerce Commands
        console.log("💰 Testing Ecommerce Commands...");
        
        // Test daily command
        try {
            const dailyResult = await EcommerceService.claimDaily(testUserId, testGuildId);
            console.log(`✅ Daily claim: ${dailyResult.amount} coins, streak: ${dailyResult.streak}`);
        } catch (error) {
            console.log(`ℹ️ Daily claim: ${error instanceof Error ? error.message : 'Already claimed'}`);
        }

        // Test balance
        const balance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Balance: ${balance} coins`);

        // Test add money (moderation)
        const addResult = await EcommerceService.addMoney(testUserId, testGuildId, 1000, "Test add");
        console.log(`✅ Add money: ${addResult.balance} coins`);

        // Test subtract money (moderation)
        const subtractResult = await EcommerceService.subtractMoney(testUserId, testGuildId, 500, "Test subtract");
        console.log(`✅ Subtract money: ${subtractResult.balance} coins`);

        // Test leaderboard
        const leaderboard = await EcommerceService.getTopUsers(testGuildId, 10);
        console.log(`✅ Leaderboard: ${leaderboard.length} users`);

        console.log("\n🎮 Testing Game Commands...");

        // Test game stats
        await GameStatsService.recordGameResult(testUserId, testGuildId, "blackjack", {
            won: true,
            bet: 100,
            winnings: 200
        });
        console.log("✅ Blackjack stats updated");

        await GameStatsService.recordGameResult(testUserId, testGuildId, "coinflip", {
            won: false,
            bet: 50,
            winnings: 0
        });
        console.log("✅ Coinflip stats updated");

        // Test fishing
        const fishingData = await FishingService.getFishingData(testUserId, testGuildId);
        console.log(`✅ Fishing data: ${fishingData.totalFish} fish caught`);

        // Test tournament
        const tournament = await TournamentService.createTournament({
            name: "Test Tournament",
            description: "Test tournament",
            entryFee: 100,
            prizePool: 1000,
            maxParticipants: 10,
            startTime: new Date(Date.now() + 3600000), // 1 hour from now
            endTime: new Date(Date.now() + 7200000), // 2 hours from now
            createdBy: testModeratorId,
            guildId: testGuildId,
            channelId: "test-channel"
        });
        console.log(`✅ Tournament created: ${tournament.name}`);

        await TournamentService.joinTournament(tournament.id, testUserId, testGuildId);
        console.log("✅ User joined tournament");

        console.log("\n🛡️ Testing Moderation Commands...");

        // Test ban system
        await banDB.createBan(
            testUserId,
            testGuildId,
            testModeratorId,
            "Test ban",
            "temporary",
            60000 // 1 minute
        );
        console.log("✅ User banned");

        const banRecord = await banDB.getActiveBan(testUserId, testGuildId);
        console.log(`✅ Ban record: ${banRecord?.type} ban`);

        // Test moderation logs
        await ModerationService.logAction({
            guildId: testGuildId,
            targetUserId: testUserId,
            moderatorId: testModeratorId,
            action: "ban",
            reason: "Test ban",
            duration: 60000,
            channelId: "test-channel",
            messageId: "test-message"
        });
        console.log("✅ Moderation log created");

        await ModerationService.logAction({
            guildId: testGuildId,
            targetUserId: testUserId,
            moderatorId: testModeratorId,
            action: "add_money",
            reason: "Test add money",
            amount: 1000,
            channelId: "test-channel",
            messageId: "test-message"
        });
        console.log("✅ Money moderation log created");

        // Test moderation history
        const userHistory = await ModerationService.getUserHistory(testUserId, testGuildId, 5);
        console.log(`✅ User moderation history: ${userHistory.length} logs`);

        const guildHistory = await ModerationService.getGuildHistory(testGuildId, 10);
        console.log(`✅ Guild moderation history: ${guildHistory.length} logs`);

        // Test moderation stats
        const stats = await ModerationService.getModerationStats(testGuildId);
        console.log(`✅ Moderation stats: ${stats.length} action types`);

        const topModerators = await ModerationService.getTopModerators(testGuildId, 5);
        console.log(`✅ Top moderators: ${topModerators.length} moderators`);

        const topTargets = await ModerationService.getTopTargets(testGuildId, 5);
        console.log(`✅ Top targets: ${topTargets.length} users`);

        console.log("\n🧹 Cleaning up test data...");

        // Clean up test data
        await prisma.moderationLog.deleteMany({
            where: { guildId: testGuildId }
        });

        await prisma.banRecord.deleteMany({
            where: { guildId: testGuildId }
        });

        await prisma.tournamentParticipant.deleteMany({
            where: { tournamentId: tournament.id }
        });

        await prisma.tournament.deleteMany({
            where: { id: tournament.id }
        });

        await prisma.caughtFish.deleteMany({
            where: { fishingData: { userId: testUserId, guildId: testGuildId } }
        });

        await prisma.fishingBait.deleteMany({
            where: { fishingData: { userId: testUserId, guildId: testGuildId } }
        });

        await prisma.fishingRod.deleteMany({
            where: { fishingData: { userId: testUserId, guildId: testGuildId } }
        });

        await prisma.fishingData.deleteMany({
            where: { userId: testUserId, guildId: testGuildId }
        });

        await prisma.gameStats.deleteMany({
            where: { userId: testUserId, guildId: testGuildId }
        });

        await prisma.dailyClaim.deleteMany({
            where: { userId: testUserId, guildId: testGuildId }
        });

        await prisma.transaction.deleteMany({
            where: { userId: testUserId, guildId: testGuildId }
        });

        await prisma.user.deleteMany({
            where: { userId: testUserId, guildId: testGuildId }
        });

        console.log("✅ Test data cleaned up");

        console.log("\n🎉 Tất cả tests đã hoàn thành thành công!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testCommands(); 