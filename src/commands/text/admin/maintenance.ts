import { Bot } from "@/classes";
import { config, emojis } from "@/config";
import { MaintenanceStorage } from "@/utils/maintenance-storage";

export default Bot.createCommand({
    structure: {
        name: "maintenance",
        aliases: ["maint"],
    },
    options: { inGuild: true },
    hidden: false,
    run: async ({ client, message, args }) => {
        if (!message.member?.permissions.has("Administrator")) {
            return message.reply(`${emojis.error} Bạn cần quyền Administrator để sử dụng lệnh này!`);
        }

        const action = args[0]?.toLowerCase();

        if (!action || (action !== "on" && action !== "off" && action !== "status" && action !== "backup" && action !== "restore" && action !== "reset")) {
            const helpEmbed = {
                title: "🔧 Lệnh Maintenance",
                description: "Quản lý chế độ bảo trì của bot",
                fields: [
                    {
                        name: "📋 Cách sử dụng",
                        value: "`n.maintenance <action> [reason]`",
                        inline: false
                    },
                    {
                        name: "🔄 Actions",
                        value: "`on` - Bật chế độ bảo trì\n`off` - Tắt chế độ bảo trì\n`status` - Xem trạng thái\n`backup` - Tạo backup\n`restore` - Khôi phục từ backup\n`reset` - Reset về mặc định",
                        inline: false
                    },
                    {
                        name: "🎯 Ví dụ",
                        value: "```\nn.maintenance on\nn.maintenance off\nn.maintenance on Cập nhật hệ thống\nn.maintenance status\nn.maintenance backup```",
                        inline: false
                    }
                ],
                color: 0xffa5f8,
                timestamp: new Date().toISOString()
            };
            return message.reply({ embeds: [helpEmbed] });
        }

        if (action === "on") {
            const reason = args.slice(1).join(' ') || 'Maintenance mode enabled by admin';
            const success = MaintenanceStorage.enable(message.author.username, reason);
            
            if (success) {
                client.maintenanceMode = true;
                await message.reply(`${emojis.info} **Chế độ bảo trì đã được BẬT**\n**Lý do:** ${reason}\nTất cả lệnh sẽ bị chặn cho đến khi tắt chế độ bảo trì.`);
            } else {
                await message.reply(`${emojis.error} Có lỗi xảy ra khi bật chế độ bảo trì!`);
            }
        } else {
            const reason = args.slice(1).join(' ') || 'Maintenance mode disabled by admin';
            const success = MaintenanceStorage.disable(message.author.username, reason);
            
            if (success) {
                client.maintenanceMode = false;
                await message.reply(`${emojis.success} **Chế độ bảo trì đã được TẮT**\n**Lý do:** ${reason}\nBot đã hoạt động bình thường trở lại.`);
            } else {
                await message.reply(`${emojis.error} Có lỗi xảy ra khi tắt chế độ bảo trì!`);
            }
        }

        if (action === "status") {
            const status = MaintenanceStorage.getStatus();
            const statusEmbed = {
                title: "🔧 Trạng Thái Maintenance Mode",
                fields: [
                    {
                        name: "📊 Trạng thái",
                        value: status.enabled ? "🟢 **BẬT**" : "🔴 **TẮT**",
                        inline: true
                    },
                    {
                        name: "⏰ Cập nhật lần cuối",
                        value: new Date(status.lastUpdated).toLocaleString('vi-VN'),
                        inline: true
                    },
                    {
                        name: "👤 Cập nhật bởi",
                        value: status.updatedBy || "Không rõ",
                        inline: true
                    }
                ],
                color: status.enabled ? 0xff6b6b : 0x51cf66,
                timestamp: new Date().toISOString()
            };

            if (status.reason) {
                statusEmbed.fields.push({
                    name: "📝 Lý do",
                    value: status.reason,
                    inline: false
                });
            }

            return message.reply({ embeds: [statusEmbed] });
        }

        if (action === "backup") {
            const success = MaintenanceStorage.backup();
            if (success) {
                return message.reply(`${emojis.success} Đã tạo backup maintenance mode thành công!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi tạo backup!`);
            }
        }

        if (action === "restore") {
            // Tìm backup file mới nhất
            const fs = require('fs');
            const path = require('path');
            const backupDir = path.join(process.cwd(), 'backups');
            
            if (!fs.existsSync(backupDir)) {
                return message.reply(`${emojis.error} Không có file backup nào!`);
            }

            const backupFiles = fs.readdirSync(backupDir)
                .filter((file: string) => file.startsWith('maintenance-mode-') && file.endsWith('.json'))
                .map((file: string) => path.join(backupDir, file))
                .sort((a: string, b: string) => {
                    const statA = fs.statSync(a);
                    const statB = fs.statSync(b);
                    return statB.mtime.getTime() - statA.mtime.getTime();
                });

            if (backupFiles.length === 0) {
                return message.reply(`${emojis.error} Không có file backup nào!`);
            }

            const latestBackup = backupFiles[0];
            const success = MaintenanceStorage.restore(latestBackup);
            
            if (success) {
                // Reload maintenance mode vào client
                const maintenanceConfig = MaintenanceStorage.load();
                client.maintenanceMode = maintenanceConfig.enabled;
                return message.reply(`${emojis.success} Đã khôi phục maintenance mode từ backup thành công!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi khôi phục backup!`);
            }
        }

        if (action === "reset") {
            const success = MaintenanceStorage.reset();
            if (success) {
                // Reload maintenance mode vào client
                const maintenanceConfig = MaintenanceStorage.load();
                client.maintenanceMode = maintenanceConfig.enabled;
                return message.reply(`${emojis.success} Đã reset maintenance mode về mặc định!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi reset!`);
            }
        }
    },
}); 