import { Message } from 'discord.js';

import { Bot } from "@/classes";
import { prisma } from "@/utils/database";

export default Bot.createCommand({
    structure: {
        name: "refreshdb",
        aliases: ["reloaddb", "resetdb"],
    },
    options: { onlyDev: false, inGuild: true },
    hidden: false,
    run: async ({ client, message }) => {
        // Chỉ cho phép admin
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        try {
            await message.reply('🔄 Đang refresh database connection...');

            // Disconnect Prisma
            await prisma.$disconnect();
            await message.reply('🔌 Đã disconnect database');

            // Reconnect Prisma
            await prisma.$connect();
            await message.reply('🔌 Đã reconnect database');

            // Test connection
            await prisma.$queryRaw`SELECT 1`;
            await message.reply('✅ Database connection đã được refresh thành công!');

            // Test một query thực tế
            const userCount = await prisma.user.count();
            await message.reply(`📊 Test query thành công: Có ${userCount} users trong database`);

        } catch (err) {
            console.error('Refresh DB error:', err);
            await message.reply('❌ Đã xảy ra lỗi khi refresh database!');
            
            // Thử kết nối lại
            try {
                await prisma.$connect();
                await message.reply('🔌 Đã kết nối lại database sau lỗi.');
            } catch (connectErr) {
                await message.reply('⚠️ Không thể kết nối lại database. Vui lòng restart bot!');
            }
        }
    },
}); 