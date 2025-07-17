import { Message, AttachmentBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { Bot } from "@/classes";

export default Bot.createCommand({
    structure: {
        name: "backupdb",
        aliases: [],
    },
    options: { onlyDev: false, inGuild: true },
    hidden: false,
    run: async ({ client, message }) => {
        // Chỉ cho phép admin
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        try {
            // Sử dụng Prisma database thực tế (database mà bot đang dùng)
            const dbPath = path.resolve('prisma/data/database.db');
            const backupDir = path.resolve('data/backup');
            
            // Nếu Prisma database không tồn tại, fallback về data/database.db
            if (!fs.existsSync(dbPath)) {
                const fallbackPath = path.resolve('data/database.db');
                if (!fs.existsSync(fallbackPath)) {
                    return message.reply('❌ Không tìm thấy file database!');
                }
                console.log('⚠️ Using fallback database path:', fallbackPath);
            }
            
            const actualDbPath = fs.existsSync(dbPath) ? dbPath : path.resolve('data/database.db');
            if (!fs.existsSync(backupDir)) {
                fs.mkdirSync(backupDir, { recursive: true });
            }
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = path.join(backupDir, `database-${timestamp}.db`);
            fs.copyFileSync(actualDbPath, backupFile);
            const stats = fs.statSync(backupFile);
            const sizeMB = stats.size / (1024 * 1024);
            const sizeKB = Math.round(stats.size / 1024);
            const dbSource = actualDbPath.includes('prisma') ? 'Prisma Database' : 'Data Database';
            
            if (sizeMB <= 8) {
                // Gửi file backup về Discord
                const attachment = new AttachmentBuilder(backupFile);
                await message.reply({
                    content: `✅ Đã backup database thành công!\n📊 Nguồn: ${dbSource}\n📁 Kích thước: ${sizeKB} KB`,
                    files: [attachment],
                });
            } else {
                await message.reply(`✅ Đã backup database thành công!\n📊 Nguồn: ${dbSource}\n📁 File: data/backup/${path.basename(backupFile)}\n📁 Kích thước: ${sizeKB} KB (quá lớn để gửi file lên Discord)`);
            }
        } catch (err) {
            console.error('Backup DB error:', err);
            await message.reply('❌ Đã xảy ra lỗi khi backup database!');
        }
    },
}); 