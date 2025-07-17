import { Message } from 'discord.js';
import fs from 'fs';
import path from 'path';

import { Bot } from "@/classes";

export default Bot.createCommand({
    structure: {
        name: "syncdb",
        aliases: ["sync", "checkdb"],
    },
    options: { onlyDev: false, inGuild: true },
    hidden: false,
    run: async ({ client, message }) => {
        // Chỉ cho phép admin
        if (!message.member?.permissions.has('Administrator')) {
            return message.reply('❌ Bạn không có quyền sử dụng lệnh này.');
        }

        try {
            await message.reply('🔍 Đang kiểm tra database...');

            const hostDb = path.resolve('data/database.db');
            const hostExists = fs.existsSync(hostDb);
            
            let response = '📊 **Kiểm tra Database:**\n\n';

            // Kiểm tra file trên host
            if (hostExists) {
                const hostStats = fs.statSync(hostDb);
                const hostSizeKB = Math.round(hostStats.size / 1024);
                response += `📁 **Database File:**\n`;
                response += `✅ Tồn tại: data/database.db\n`;
                response += `📊 Kích thước: ${hostSizeKB} KB\n`;
                response += `🕐 Cập nhật: ${hostStats.mtime.toLocaleString('vi-VN')}\n\n`;
            } else {
                response += `❌ **Database File:** Không tồn tại!\n\n`;
            }

            // Kiểm tra thư mục backup
            const backupDir = path.resolve('data/backup');
            if (fs.existsSync(backupDir)) {
                const backupFiles = fs.readdirSync(backupDir)
                    .filter(file => file.endsWith('.db'))
                    .sort((a, b) => {
                        const statA = fs.statSync(path.join(backupDir, a));
                        const statB = fs.statSync(path.join(backupDir, b));
                        return statB.mtime.getTime() - statA.mtime.getTime();
                    });

                if (backupFiles.length > 0) {
                    response += `📁 **Backup Files:**\n`;
                    backupFiles.slice(0, 5).forEach((file, index) => {
                        const filePath = path.join(backupDir, file);
                        const stats = fs.statSync(filePath);
                        const sizeKB = Math.round(stats.size / 1024);
                        const date = stats.mtime.toLocaleString('vi-VN');
                        response += `${index + 1}. **${file}** (${sizeKB} KB) - ${date}\n`;
                    });
                    if (backupFiles.length > 5) {
                        response += `... và ${backupFiles.length - 5} file khác\n`;
                    }
                    response += '\n';
                }
            }

            // Kiểm tra tham số để thực hiện hành động
            const args = message.content.split(' ').slice(1);
            if (args.length > 0) {
                const action = args[0].toLowerCase();
                
                if (action === 'backup') {
                    await message.reply('🔄 Đang tạo backup...');
                    try {
                        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                        const backupFile = path.join(backupDir, `database-${timestamp}.db`);
                        fs.copyFileSync(hostDb, backupFile);
                        const stats = fs.statSync(backupFile);
                        const sizeKB = Math.round(stats.size / 1024);
                        await message.reply(`✅ Đã tạo backup: ${path.basename(backupFile)} (${sizeKB} KB)`);
                    } catch (error) {
                        await message.reply(`❌ Lỗi khi tạo backup: ${(error as Error).message}`);
                    }
                } else if (action === 'list') {
                    response += `📋 **Tất cả file backup:**\n`;
                    const backupFiles = fs.readdirSync(backupDir)
                        .filter(file => file.endsWith('.db'))
                        .sort((a, b) => {
                            const statA = fs.statSync(path.join(backupDir, a));
                            const statB = fs.statSync(path.join(backupDir, b));
                            return statB.mtime.getTime() - statA.mtime.getTime();
                        });

                    backupFiles.forEach((file, index) => {
                        const filePath = path.join(backupDir, file);
                        const stats = fs.statSync(filePath);
                        const sizeKB = Math.round(stats.size / 1024);
                        const date = stats.mtime.toLocaleString('vi-VN');
                        response += `${index + 1}. **${file}** (${sizeKB} KB) - ${date}\n`;
                    });
                    
                    await message.reply(response);
                }
            } else {
                response += `💡 **Lệnh hữu ích:**\n`;
                response += `• \`n.syncdb\` - Kiểm tra trạng thái\n`;
                response += `• \`n.syncdb backup\` - Tạo backup mới\n`;
                response += `• \`n.syncdb list\` - Xem tất cả backup\n`;
                response += `• \`n.backupdb\` - Tạo backup và gửi file\n`;
                response += `• \`n.restoredb\` - Restore từ file upload\n`;
                response += `• \`n.refreshdb\` - Refresh database connection\n`;
                response += `• \`n.dbstatus\` - Xem thống kê database\n`;

                await message.reply(response);
            }

        } catch (err) {
            console.error('Sync DB error:', err);
            await message.reply('❌ Đã xảy ra lỗi khi kiểm tra database!');
        }
    },
}); 