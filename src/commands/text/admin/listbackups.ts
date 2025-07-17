import { Message } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { Bot } from "@/classes";

export default Bot.createCommand({
    structure: {
        name: "listbackups",
        aliases: ["backups", "lsbackup"],
    },
    options: { onlyDev: false, inGuild: true },
    hidden: false,
    run: async ({ client, message }) => {
        // Chỉ cho phép admin
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        try {
            const backupDir = path.resolve('data/backup');
            const tempDir = path.resolve('temp');
            
            let backupFiles: string[] = [];
            
            // Kiểm tra thư mục backup
            if (fs.existsSync(backupDir)) {
                const files = fs.readdirSync(backupDir)
                    .filter(file => file.endsWith('.db'))
                    .map(file => path.join(backupDir, file));
                backupFiles = backupFiles.concat(files);
            }
            
            // Kiểm tra thư mục temp
            if (fs.existsSync(tempDir)) {
                const files = fs.readdirSync(tempDir)
                    .filter(file => file.endsWith('.db'))
                    .map(file => path.join(tempDir, file));
                backupFiles = backupFiles.concat(files);
            }

            if (backupFiles.length === 0) {
                return message.reply('📁 Không có file backup nào được tìm thấy!');
            }

            // Sắp xếp theo thời gian sửa đổi (mới nhất trước)
            backupFiles.sort((a, b) => {
                const statA = fs.statSync(a);
                const statB = fs.statSync(b);
                return statB.mtime.getTime() - statA.mtime.getTime();
            });

            let response = '📁 **Danh sách file backup:**\n\n';
            
            backupFiles.forEach((file, index) => {
                const stats = fs.statSync(file);
                const sizeKB = Math.round(stats.size / 1024);
                const fileName = path.basename(file);
                const date = stats.mtime.toLocaleString('vi-VN');
                
                response += `${index + 1}. **${fileName}**\n`;
                response += `   📊 Kích thước: ${sizeKB} KB\n`;
                response += `   🕐 Thời gian: ${date}\n\n`;
            });

            response += '💡 **Cách sử dụng:**\n';
            response += '• `n.backupdb` - Tạo backup mới\n';
            response += '• Upload file .db + `n.restoredb` - Restore database\n';
            response += '• `n.listbackups` - Xem danh sách này\n';

            await message.reply(response);

        } catch (err) {
            console.error('List backups error:', err);
            await message.reply('❌ Đã xảy ra lỗi khi liệt kê file backup!');
        }
    },
}); 