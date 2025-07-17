import { Message } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { Bot } from "@/classes";
import { prisma } from "@/utils/database";

export default Bot.createCommand({
    structure: {
        name: "dbstatus",
        aliases: ["dbinfo", "database"],
    },
    options: { onlyDev: false, inGuild: true },
    hidden: false,
    run: async ({ client, message }) => {
        // Chỉ cho phép admin
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        try {
            // Kiểm tra file database
            const dbPath = path.resolve('data/database.db');
            const dbExists = fs.existsSync(dbPath);
            
            let response = '📊 **Trạng thái Database:**\n\n';
            
            if (dbExists) {
                const stats = fs.statSync(dbPath);
                const sizeKB = Math.round(stats.size / 1024);
                const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
                
                response += `📁 **File Database:**\n`;
                response += `✅ Tồn tại: data/database.db\n`;
                response += `📊 Kích thước: ${sizeKB} KB (${sizeMB} MB)\n`;
                response += `🕐 Cập nhật lần cuối: ${stats.mtime.toLocaleString('vi-VN')}\n\n`;
            } else {
                response += `❌ **File Database:** Không tồn tại!\n\n`;
            }

            // Kiểm tra kết nối Prisma
            try {
                await prisma.$queryRaw`SELECT 1`;
                response += `🔌 **Kết nối Database:** ✅ Hoạt động\n\n`;
                
                // Đếm số lượng records trong các bảng chính
                const [userCount, transactionCount, dailyCount, banCount, gameStatsCount, fishingCount, tournamentCount] = await Promise.all([
                    prisma.user.count(),
                    prisma.transaction.count(),
                    prisma.dailyClaim.count(),
                    prisma.banRecord.count(),
                    prisma.gameStats.count(),
                    prisma.fishingData.count(),
                    prisma.tournament.count(),
                ]);

                response += `📈 **Thống kê Records:**\n`;
                response += `👥 Users: ${userCount}\n`;
                response += `💰 Transactions: ${transactionCount}\n`;
                response += `📅 Daily Claims: ${dailyCount}\n`;
                response += `🚫 Ban Records: ${banCount}\n`;
                response += `🎮 Game Stats: ${gameStatsCount}\n`;
                response += `🐟 Fishing Data: ${fishingCount}\n`;
                response += `🏆 Tournaments: ${tournamentCount}\n\n`;

            } catch (dbError) {
                response += `❌ **Kết nối Database:** Lỗi kết nối\n`;
                response += `🔧 **Khuyến nghị:** Restart bot hoặc kiểm tra file database\n\n`;
            }

            response += `💡 **Lệnh hữu ích:**\n`;
            response += `• \`n.backupdb\` - Tạo backup\n`;
            response += `• \`n.listbackups\` - Xem danh sách backup\n`;
            response += `• \`n.restoredb\` - Restore database\n`;
            response += `• \`n.dbstatus\` - Xem trạng thái này\n`;

            await message.reply(response);

        } catch (err) {
            console.error('DB Status error:', err);
            await message.reply('❌ Đã xảy ra lỗi khi kiểm tra trạng thái database!');
        }
    },
}); 