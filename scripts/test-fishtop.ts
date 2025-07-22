import { fishCoinDB } from '../src/utils/fish-coin';
import { ecommerceDB } from '../src/utils/ecommerce-db';

const testGuildId = 'test-guild-fishtop';

async function testFishTop() {
    console.log('🧪 Testing FishTop Command...\n');

    try {
        // Tạo dữ liệu test
        console.log('1️⃣ Creating test data...');
        
        const testUsers = [
            { userId: 'user1', fishBalance: 50000 },
            { userId: 'user2', fishBalance: 75000 },
            { userId: 'user3', fishBalance: 25000 },
            { userId: 'user4', fishBalance: 100000 },
            { userId: 'user5', fishBalance: 15000 },
            { userId: 'user6', fishBalance: 80000 },
            { userId: 'user7', fishBalance: 30000 },
            { userId: 'user8', fishBalance: 60000 },
            { userId: 'user9', fishBalance: 45000 },
            { userId: 'user10', fishBalance: 90000 },
            { userId: 'user11', fishBalance: 12000 },
            { userId: 'user12', fishBalance: 35000 }
        ];

        // Reset và thêm FishCoin cho các user
        for (const user of testUsers) {
            await ecommerceDB.resetBalance(user.userId, testGuildId);
            await fishCoinDB.addFishCoin(user.userId, testGuildId, user.fishBalance, 'Test FishCoin');
        }

        console.log('   ✅ Test data created\n');

        // Test getTopFishCoinUsers
        console.log('2️⃣ Testing getTopFishCoinUsers...');
        
        const topUsers = await fishCoinDB.getTopFishCoinUsers(testGuildId, 10);
        console.log(`   ✅ Found ${topUsers.length} users in top 10`);
        
        // Hiển thị top 10
        console.log('\n🏆 Top 10 FishCoin Users:');
        topUsers.forEach((user, index) => {
            const rank = index + 1;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `${rank}.`;
            console.log(`   ${medal} User ${user.userId.slice(-4)} - ${user.fishBalance.toLocaleString()} 🐟`);
        });

        // Test thống kê
        console.log('\n3️⃣ Testing statistics...');
        const totalFishCoin = topUsers.reduce((sum, user) => sum + user.fishBalance, 0n);
        const averageFishCoin = totalFishCoin / BigInt(topUsers.length);
        
        console.log(`   Total FishCoin: ${totalFishCoin.toLocaleString()}`);
        console.log(`   Average FishCoin: ${averageFishCoin.toLocaleString()}`);
        console.log(`   Players count: ${topUsers.length}`);

        // Test với limit khác nhau
        console.log('\n4️⃣ Testing different limits...');
        
        const top5 = await fishCoinDB.getTopFishCoinUsers(testGuildId, 5);
        console.log(`   Top 5: ${top5.length} users`);
        
        const top20 = await fishCoinDB.getTopFishCoinUsers(testGuildId, 20);
        console.log(`   Top 20: ${top20.length} users`);

        // Test với guild không có dữ liệu
        console.log('\n5️⃣ Testing empty guild...');
        const emptyGuildTop = await fishCoinDB.getTopFishCoinUsers('empty-guild', 10);
        console.log(`   Empty guild: ${emptyGuildTop.length} users`);

        // Test tìm user cụ thể
        console.log('\n6️⃣ Testing specific user...');
        const user1Rank = topUsers.findIndex(user => user.userId === 'user1');
        if (user1Rank !== -1) {
            console.log(`   User1 rank: #${user1Rank + 1}`);
        } else {
            console.log(`   User1 not in top 10`);
        }

        // Test FishCoin balance của user cụ thể
        const user1Balance = await fishCoinDB.getFishBalance('user1', testGuildId);
        console.log(`   User1 balance: ${user1Balance.toLocaleString()} FishCoin`);

        console.log('\n🎉 FishTop test completed successfully!');
        console.log('💡 Command n.fishtop is ready to use!');

    } catch (error) {
        console.error('❌ Test failed:', error);
    }
}

// Run the test
testFishTop().catch(console.error); 