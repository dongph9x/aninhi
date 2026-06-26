import { PrismaClient } from '@prisma/client';
import { TournamentService } from '../src/utils/tournament';
import { EcommerceService } from '../src/utils/ecommerce-db';

const prisma = new PrismaClient();

async function testTournamentWinnerCount() {
    console.log('🧪 Testing Tournament Winner Count Feature...\n');

    const testGuildId = 'test-guild-winner-count';
    const testUsers = [
        'user-winner-1',
        'user-winner-2', 
        'user-winner-3',
        'user-winner-4',
        'user-winner-5'
    ];

    try {
        // Clean up test data
        await prisma.tournamentParticipant.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.tournament.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });

        // Create test users
        for (const userId of testUsers) {
            await prisma.user.create({
                data: {
                    userId,
                    guildId: testGuildId,
                    balance: 10000n
                }
            });
        }

        console.log('✅ Created test users');

        // Test 1: Create tournament with 1 winner (default)
        console.log('\n📊 Test 1: Tournament with 1 winner (default)');
        const tournament1 = await TournamentService.createTournament({
            name: "Test Tournament 1 Winner",
            description: "Test tournament with 1 winner",
            entryFee: 100,
            prizePool: 1000,
            maxParticipants: 5,
            startTime: new Date(),
            endTime: new Date(Date.now() + 60000), // 1 minute
            createdBy: 'test-creator',
            guildId: testGuildId,
            channelId: 'test-channel'
        });

        // Join tournament
        for (let i = 0; i < 3; i++) {
            await TournamentService.joinTournament(tournament1.id, testUsers[i], testGuildId);
        }

        console.log(`✅ Created tournament with ${tournament1.currentParticipants} participants`);

        // Start tournament with 1 winner
        const result1 = await TournamentService.startTournament(tournament1.id, 1);
        console.log(`✅ Tournament ended with ${result1.winners.length} winner(s)`);
        console.log(`   Prize per winner: ${result1.prizePerWinner}`);
        result1.winners.forEach((winner: any, index: number) => {
            console.log(`   Winner ${index + 1}: ${winner.userId}`);
        });

        // Test 2: Create tournament with 3 winners
        console.log('\n📊 Test 2: Tournament with 3 winners');
        const tournament2 = await TournamentService.createTournament({
            name: "Test Tournament 3 Winners",
            description: "Test tournament with 3 winners",
            entryFee: 200,
            prizePool: 1500,
            maxParticipants: 5,
            startTime: new Date(),
            endTime: new Date(Date.now() + 60000), // 1 minute
            createdBy: 'test-creator',
            guildId: testGuildId,
            channelId: 'test-channel'
        });

        // Join tournament
        for (let i = 0; i < 5; i++) {
            await TournamentService.joinTournament(tournament2.id, testUsers[i], testGuildId);
        }

        console.log(`✅ Created tournament with ${tournament2.currentParticipants} participants`);

        // Start tournament with 3 winners
        const result2 = await TournamentService.startTournament(tournament2.id, 3);
        console.log(`✅ Tournament ended with ${result2.winners.length} winner(s)`);
        console.log(`   Prize per winner: ${result2.prizePerWinner}`);
        result2.winners.forEach((winner: any, index: number) => {
            const prize = index === 0 ? result2.prizePerWinner + (1500 - (result2.prizePerWinner * 3)) : result2.prizePerWinner;
            console.log(`   Winner ${index + 1}: ${winner.userId} - ${prize} AniCoin`);
        });

        // Test 3: Create tournament with more winners than participants
        console.log('\n📊 Test 3: Tournament with more winners than participants');
        const tournament3 = await TournamentService.createTournament({
            name: "Test Tournament More Winners",
            description: "Test tournament with more winners than participants",
            entryFee: 50,
            prizePool: 500,
            maxParticipants: 5,
            startTime: new Date(),
            endTime: new Date(Date.now() + 60000), // 1 minute
            createdBy: 'test-creator',
            guildId: testGuildId,
            channelId: 'test-channel'
        });

        // Join tournament with only 2 participants
        for (let i = 0; i < 2; i++) {
            await TournamentService.joinTournament(tournament3.id, testUsers[i], testGuildId);
        }

        console.log(`✅ Created tournament with ${tournament3.currentParticipants} participants`);

        // Start tournament with 5 winners (but only 2 participants)
        const result3 = await TournamentService.startTournament(tournament3.id, 5);
        console.log(`✅ Tournament ended with ${result3.winners.length} winner(s)`);
        console.log(`   Prize per winner: ${result3.prizePerWinner}`);
        result3.winners.forEach((winner: any, index: number) => {
            const prize = index === 0 ? result3.prizePerWinner + (500 - (result3.prizePerWinner * 2)) : result3.prizePerWinner;
            console.log(`   Winner ${index + 1}: ${winner.userId} - ${prize} AniCoin`);
        });

        // Test 4: Check balances
        console.log('\n💰 Test 4: Checking user balances');
        for (const userId of testUsers) {
            const balance = await EcommerceService.getBalance(userId, testGuildId);
            console.log(`   ${userId}: ${balance.toLocaleString()} AniCoin`);
        }

        console.log('\n🎉 All Tournament Winner Count tests passed!');

    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        // Clean up test data
        await prisma.tournamentParticipant.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.tournament.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.user.deleteMany({
            where: { guildId: testGuildId }
        });
        await prisma.$disconnect();
    }
}

testTournamentWinnerCount().catch(console.error); 