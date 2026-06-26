import { EmbedBuilder } from "discord.js";

import { Bot } from "@/classes";
import { config, emojis, defaultChannelRestrictions, addToWhitelist, removeFromWhitelist, addToBlacklist, removeFromBlacklist, addCategoryToWhitelist, removeCategoryFromWhitelist, addCategoryToBlacklist, removeCategoryFromBlacklist } from "@/config";
import { ChannelRestrictionsStorage } from "@/utils/channel-restrictions-storage";

export default Bot.createCommand({
    structure: {
        name: "channelrestrictions",
        aliases: ["chrestrict", "chrest", "restrictch"],
    },
    options: { 
        inGuild: true,
        permissions: ["Administrator"]
    },
    run: async ({ client, message, args }) => {
        if (!message.member?.permissions.has("Administrator")) {
            return message.reply(`${emojis.error} Bạn cần quyền Administrator để sử dụng lệnh này!`);
        }

        const action = args[0]?.toLowerCase();
        const type = args[1]?.toLowerCase();
        const target = args[2];

        if (!action || action === "help") {
            const helpEmbed = new EmbedBuilder()
                .setTitle("🔒 Quản Lý Hạn Chế Channel")
                .setDescription("Lệnh để quản lý các channel được phép sử dụng bot")
                .setColor("#ffa5f8")
                .addFields(
                    {
                        name: "📋 Cách sử dụng",
                        value: "`n.channelrestrictions <action> <type> [target]`",
                        inline: false
                    },
                    {
                        name: "🔄 Actions",
                        value: "`show` - Hiển thị cấu hình hiện tại\n`add` - Thêm vào whitelist/blacklist\n`remove` - Xóa khỏi whitelist/blacklist\n`clear` - Xóa tất cả cấu hình\n`mode` - Bật/tắt whitelist/blacklist mode\n`backup` - Tạo backup\n`restore` - Khôi phục từ backup\n`export` - Xuất cấu hình\n`import` - Nhập cấu hình",
                        inline: false
                    },
                    {
                        name: "📝 Types",
                        value: "`channel` - Áp dụng cho channel cụ thể\n`category` - Áp dụng cho category (tất cả channels trong category)",
                        inline: false
                    },
                    {
                        name: "🎯 Ví dụ",
                        value: "```\nn.chrestrict add channel 123456789\nn.chrestrict add category 987654321\nn.chrestrict remove channel 123456789\nn.chrestrict show\nn.chrestrict mode whitelist on\nn.chrestrict mode blacklist off```",
                        inline: false
                    }
                )
                .setTimestamp();

            return message.reply({ embeds: [helpEmbed] });
        }

        // Khởi tạo channel restrictions nếu chưa có
        if (!client.channelRestrictions) {
            client.channelRestrictions = ChannelRestrictionsStorage.load();
        }

        if (action === "show") {
            const restrictions = client.channelRestrictions;
            const embed = new EmbedBuilder()
                .setTitle("🔒 Cấu Hình Channel Restrictions")
                .setColor("#ffa5f8")
                .addFields(
                    {
                        name: "⚙️ Chế độ",
                        value: `**Whitelist Mode:** ${restrictions.useWhitelistMode ? "✅ Bật" : "❌ Tắt"}\n**Blacklist Mode:** ${restrictions.useBlacklistMode ? "✅ Bật" : "❌ Tắt"}\n**Check Categories:** ${restrictions.checkCategories ? "✅ Bật" : "❌ Tắt"}`,
                        inline: false
                    },
                    {
                        name: "⚠️ Lưu ý quan trọng",
                        value: restrictions.useWhitelistMode && restrictions.allowedChannels.length === 0 
                            ? "**Whitelist mode đang BẬT nhưng chưa có channel nào được phép!**\nTất cả lệnh sẽ bị chặn. Hãy thêm channels vào whitelist."
                            : "Hệ thống hoạt động bình thường.",
                        inline: false
                    },
                    {
                        name: "✅ Channels được phép",
                        value: restrictions.allowedChannels.length > 0 
                            ? restrictions.allowedChannels.map(id => `<#${id}>`).join(", ")
                            : "Không có",
                        inline: false
                    },
                    {
                        name: "❌ Channels bị cấm",
                        value: restrictions.blockedChannels.length > 0 
                            ? restrictions.blockedChannels.map(id => `<#${id}>`).join(", ")
                            : "Không có",
                        inline: false
                    },
                    {
                        name: "✅ Categories được phép",
                        value: restrictions.allowedCategories.length > 0 
                            ? restrictions.allowedCategories.map(id => `<#${id}>`).join(", ")
                            : "Không có",
                        inline: false
                    },
                    {
                        name: "❌ Categories bị cấm",
                        value: restrictions.blockedCategories.length > 0 
                            ? restrictions.blockedCategories.map(id => `<#${id}>`).join(", ")
                            : "Không có",
                        inline: false
                    }
                )
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        if (action === "add" || action === "remove") {
            if (!type || !target) {
                return message.reply(`${emojis.error} Thiếu tham số! Dùng \`n.channelrestrictions help\` để xem hướng dẫn.`);
            }

            if (!target.match(/^\d+$/)) {
                return message.reply(`${emojis.error} ID không hợp lệ! Vui lòng cung cấp ID channel/category hợp lệ.`);
            }

            const targetId = target;
            let newRestrictions = { ...client.channelRestrictions };

            if (type === "channel") {
                if (action === "add") {
                    // Hỏi người dùng muốn thêm vào whitelist hay blacklist
                    const response = await message.reply(`${emojis.info} Bạn muốn thêm channel <#${targetId}> vào:\n1️⃣ **Whitelist** (chỉ cho phép channels này)\n2️⃣ **Blacklist** (cấm channel này)\n\nPhản hồi bằng số 1 hoặc 2.`);
                    
                    try {
                        const filter = (m: any) => m.author.id === message.author.id && ['1', '2'].includes(m.content);
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
                        
                        if (collected.size === 0) {
                            return message.reply(`${emojis.error} Hết thời gian!`);
                        }

                        const choice = collected.first()!.content;
                        
                        if (choice === "1") {
                            newRestrictions = addToWhitelist(newRestrictions, targetId);
                            await message.reply(`${emojis.success} Đã thêm channel <#${targetId}> vào **whitelist**!`);
                        } else {
                            newRestrictions = addToBlacklist(newRestrictions, targetId);
                            await message.reply(`${emojis.success} Đã thêm channel <#${targetId}> vào **blacklist**!`);
                        }
                    } catch (error) {
                        return message.reply(`${emojis.error} Có lỗi xảy ra!`);
                    }
                } else {
                    // Xóa khỏi cả whitelist và blacklist
                    newRestrictions = removeFromWhitelist(newRestrictions, targetId);
                    newRestrictions = removeFromBlacklist(newRestrictions, targetId);
                    await message.reply(`${emojis.success} Đã xóa channel <#${targetId}> khỏi cả whitelist và blacklist!`);
                }
            } else if (type === "category") {
                if (action === "add") {
                    // Hỏi người dùng muốn thêm vào whitelist hay blacklist
                    const response = await message.reply(`${emojis.info} Bạn muốn thêm category <#${targetId}> vào:\n1️⃣ **Whitelist** (chỉ cho phép categories này)\n2️⃣ **Blacklist** (cấm category này)\n\nPhản hồi bằng số 1 hoặc 2.`);
                    
                    try {
                        const filter = (m: any) => m.author.id === message.author.id && ['1', '2'].includes(m.content);
                        const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
                        
                        if (collected.size === 0) {
                            return message.reply(`${emojis.error} Hết thời gian!`);
                        }

                        const choice = collected.first()!.content;
                        
                        if (choice === "1") {
                            newRestrictions = addCategoryToWhitelist(newRestrictions, targetId);
                            await message.reply(`${emojis.success} Đã thêm category <#${targetId}> vào **whitelist**!`);
                        } else {
                            newRestrictions = addCategoryToBlacklist(newRestrictions, targetId);
                            await message.reply(`${emojis.success} Đã thêm category <#${targetId}> vào **blacklist**!`);
                        }
                    } catch (error) {
                        return message.reply(`${emojis.error} Có lỗi xảy ra!`);
                    }
                } else {
                    // Xóa khỏi cả whitelist và blacklist
                    newRestrictions = removeCategoryFromWhitelist(newRestrictions, targetId);
                    newRestrictions = removeCategoryFromBlacklist(newRestrictions, targetId);
                    await message.reply(`${emojis.success} Đã xóa category <#${targetId}> khỏi cả whitelist và blacklist!`);
                }
            } else {
                return message.reply(`${emojis.error} Type không hợp lệ! Dùng \`channel\` hoặc \`category\`.`);
            }

            client.channelRestrictions = newRestrictions;
            // Lưu vào file
            ChannelRestrictionsStorage.save(newRestrictions);
            return;
        }

        if (action === "clear") {
            client.channelRestrictions = { ...defaultChannelRestrictions };
            ChannelRestrictionsStorage.save(client.channelRestrictions);
            return message.reply(`${emojis.success} Đã xóa tất cả cấu hình channel restrictions!`);
        }

        if (action === "mode") {
            const mode = args[1]?.toLowerCase();
            const status = args[2]?.toLowerCase();

            if (!mode || !status || !['whitelist', 'blacklist'].includes(mode) || !['on', 'off'].includes(status)) {
                return message.reply(`${emojis.error} Cách dùng: \`n.channelrestrictions mode <whitelist|blacklist> <on|off>\``);
            }

            if (mode === "whitelist") {
                client.channelRestrictions.useWhitelistMode = status === "on";
                ChannelRestrictionsStorage.save(client.channelRestrictions);
                await message.reply(`${emojis.success} **Whitelist mode** đã được ${status === "on" ? "BẬT" : "TẮT"}!`);
            } else {
                client.channelRestrictions.useBlacklistMode = status === "on";
                ChannelRestrictionsStorage.save(client.channelRestrictions);
                await message.reply(`${emojis.success} **Blacklist mode** đã được ${status === "on" ? "BẬT" : "TẮT"}!`);
            }

            return;
        }

        if (action === "backup") {
            const success = ChannelRestrictionsStorage.backup();
            if (success) {
                return message.reply(`${emojis.success} Đã tạo backup channel restrictions thành công!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi tạo backup!`);
            }
        }

        if (action === "restore") {
            const backupFiles = ChannelRestrictionsStorage.getBackupFiles();
            if (backupFiles.length === 0) {
                return message.reply(`${emojis.error} Không có file backup nào!`);
            }

            const latestBackup = backupFiles[0];
            const success = ChannelRestrictionsStorage.restore(latestBackup);
            if (success) {
                // Reload restrictions vào client
                client.channelRestrictions = ChannelRestrictionsStorage.load();
                return message.reply(`${emojis.success} Đã khôi phục channel restrictions từ backup thành công!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi khôi phục backup!`);
            }
        }

        if (action === "export") {
            const success = ChannelRestrictionsStorage.export();
            if (success) {
                return message.reply(`${emojis.success} Đã xuất channel restrictions thành công!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi xuất cấu hình!`);
            }
        }

        if (action === "import") {
            if (!target) {
                return message.reply(`${emojis.error} Vui lòng cung cấp đường dẫn file import!`);
            }

            const success = ChannelRestrictionsStorage.import(target);
            if (success) {
                // Reload restrictions vào client
                client.channelRestrictions = ChannelRestrictionsStorage.load();
                return message.reply(`${emojis.success} Đã nhập channel restrictions thành công!`);
            } else {
                return message.reply(`${emojis.error} Có lỗi xảy ra khi nhập cấu hình!`);
            }
        }

        return message.reply(`${emojis.error} Action không hợp lệ! Dùng \`n.channelrestrictions help\` để xem hướng dẫn.`);
    },
}); 