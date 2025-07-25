import { Message, AttachmentBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { Bot } from "@/classes";

export default Bot.createCommand({
    structure: {
        name: "restoredb",
        aliases: ["importdb"],
    },
    options: { onlyDev: false, inGuild: true },
    hidden: false,
    run: async ({ client, message }) => {
        // Chỉ cho phép admin
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        // Kiểm tra có file đính kèm không
        if (message.attachments.size === 0) {
            return message.reply('❌ Vui lòng đính kèm file database backup (.db)!\n\n💡 Cách sử dụng:\n1. Upload file backup database (.db)\n2. Gõ lệnh `n.restoredb`\n\n⚠️ **CẢNH BÁO**: Lệnh này sẽ ghi đè hoàn toàn database hiện tại!');
        }

        const attachment = message.attachments.first();
        if (!attachment) {
            return message.reply('❌ Không tìm thấy file đính kèm!');
        }

        // Kiểm tra file có phải là .db không
        if (!attachment.name?.endsWith('.db')) {
            return message.reply('❌ File phải có định dạng .db!');
        }

        try {
            // Tạo thư mục temp nếu chưa có
            const tempDir = path.resolve('temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir, { recursive: true });
            }

            // Download file backup
            const response = await fetch(attachment.url);
            const buffer = await response.arrayBuffer();
            const tempFile = path.join(tempDir, `backup-${Date.now()}.db`);
            fs.writeFileSync(tempFile, Buffer.from(buffer));

            // Backup database hiện tại (cả data và prisma)
            const dataDb = path.resolve('data/database.db');
            const prismaDb = path.resolve('prisma/data/database.db');
            
            if (fs.existsSync(dataDb)) {
                const backupData = path.resolve('data/database.db.backup-' + Date.now());
                fs.copyFileSync(dataDb, backupData);
                await message.reply(`💾 Đã backup data database: ${path.basename(backupData)}`);
            }
            
            if (fs.existsSync(prismaDb)) {
                const backupPrisma = path.resolve('data/prisma-database.db.backup-' + Date.now());
                fs.copyFileSync(prismaDb, backupPrisma);
                await message.reply(`💾 Đã backup prisma database: ${path.basename(backupPrisma)}`);
            }

            // Thay thế cả hai database
            fs.copyFileSync(tempFile, dataDb);
            fs.copyFileSync(tempFile, prismaDb);
            
            // Xóa file temp
            fs.unlinkSync(tempFile);

            const stats = fs.statSync(dataDb);
            const sizeKB = Math.round(stats.size / 1024);

            await message.reply(`✅ **Đã restore database thành công!**

📁 File: ${attachment.name}
📊 Kích thước: ${sizeKB} KB
🕐 Thời gian: ${new Date().toLocaleString('vi-VN')}
🔄 Đã cập nhật: Data Database + Prisma Database

🚀 **Bước tiếp theo:**
1. \`docker-compose down\`
2. \`docker-compose up -d --build\`
3. \`n.balance\` để kiểm tra dữ liệu

💡 **Lý do restart:** Đảm bảo bot đọc database mới và đồng bộ cache`);

        } catch (err) {
            console.error('Restore DB error:', err);
            await message.reply('❌ Đã xảy ra lỗi khi restore database!');
        }
    },
}); 