import { PrismaClient } from "@prisma/client";
import { EcommerceService } from "../src/utils/ecommerce-db";

const prisma = new PrismaClient();

async function testSubtractCommand() {
    try {
        console.log("🧪 Testing Subtract Command...\n");

        const testUserId = 'test_user_subtract';
        const testGuildId = 'test_guild_subtract';

        // 1. Tạo test user với số dư ban đầu
        console.log("1. Creating test user with initial balance...");
        const user = await prisma.user.upsert({
            where: { userId_guildId: { userId: testUserId, guildId: testGuildId } },
            update: { balance: 10000 }, // Set balance to 10,000
            create: {
                userId: testUserId,
                guildId: testGuildId,
                balance: 10000,
            },
        });
        console.log("✅ User created with balance:", user.balance.toLocaleString(), "AniCoin");

        // 2. Test trừ tiền bình thường
        console.log("\n2. Testing normal money subtraction...");
        const subtractAmount1 = 2000;
        const result1 = await EcommerceService.subtractMoney(
            testUserId,
            testGuildId,
            subtractAmount1,
            "Test subtraction 1"
        );
        console.log(`✅ Subtracted ${subtractAmount1.toLocaleString()} AniCoin`);
        console.log(`   New balance: ${result1.balance.toLocaleString()} AniCoin`);

        // 3. Test trừ tiền khi số dư không đủ
        console.log("\n3. Testing subtraction with insufficient balance...");
        const subtractAmount2 = 15000; // Lớn hơn số dư hiện tại
        try {
            await EcommerceService.subtractMoney(
                testUserId,
                testGuildId,
                subtractAmount2,
                "Test subtraction 2"
            );
            console.log("❌ Should have failed but didn't!");
        } catch (error) {
            console.log("✅ Correctly failed with insufficient balance");
            console.log("   Error message:", error instanceof Error ? error.message : "Unknown error");
        }

        // 4. Test trừ toàn bộ số dư
        console.log("\n4. Testing subtraction of entire balance...");
        const currentBalance = await EcommerceService.getBalance(testUserId, testGuildId);
        const result2 = await EcommerceService.subtractMoney(
            testUserId,
            testGuildId,
            currentBalance,
            "Test subtraction entire balance"
        );
        console.log(`✅ Subtracted entire balance: ${currentBalance.toLocaleString()} AniCoin`);
        console.log(`   New balance: ${result2.balance.toLocaleString()} AniCoin`);

        // 5. Test trừ tiền khi số dư = 0
        console.log("\n5. Testing subtraction with zero balance...");
        try {
            await EcommerceService.subtractMoney(
                testUserId,
                testGuildId,
                1000,
                "Test subtraction with zero balance"
            );
            console.log("❌ Should have failed but didn't!");
        } catch (error) {
            console.log("✅ Correctly failed with zero balance");
            console.log("   Error message:", error instanceof Error ? error.message : "Unknown error");
        }

        // 6. Kiểm tra transaction logs
        console.log("\n6. Checking transaction logs...");
        const transactions = await prisma.transaction.findMany({
            where: {
                userId: testUserId,
                guildId: testGuildId,
                type: "subtract"
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`✅ Found ${transactions.length} subtract transactions:`);
        transactions.forEach((tx, index) => {
            console.log(`   ${index + 1}. Amount: ${tx.amount.toLocaleString()}, Description: ${tx.description}`);
        });

        // 7. Kiểm tra số dư cuối cùng
        console.log("\n7. Final balance check...");
        const finalBalance = await EcommerceService.getBalance(testUserId, testGuildId);
        console.log(`✅ Final balance: ${finalBalance.toLocaleString()} AniCoin`);

        console.log("\n🎉 Subtract command test completed!");

    } catch (error) {
        console.error("❌ Error in test:", error);
    } finally {
        await prisma.$disconnect();
    }
}

testSubtractCommand(); 