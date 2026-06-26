import { Bot } from "@/classes";
import { emojis } from "@/config";
import { AdminFishingBypassStorage } from "@/utils/admin-fishing-bypass-storage";

export default Bot.createCommand({
    structure: {
        name: "adminfishing",
        aliases: ["fishingbypass", "adminfish"],
    },
    options: { inGuild: true },
    hidden: false,
    run: async ({ client, message, args }) => {
        if (!message.member?.permissions.has("Administrator")) {
            return message.reply(`${emojis.error} Bạn cần quyền Administrator để sử dụng lệnh này!`);
        }

        const action = args[0]?.toLowerCase();

        if (action !== "on" && action !== "off" && action !== "status") {
            return message.reply(
                `${emojis.info} **Quản lý đặc quyền Admin khi câu cá**\n\n` +
                `Khi bật, Admin câu cá sẽ bypass cooldown, không cần cần câu/mồi, không giảm độ bền/số lượng mồi.\n` +
                `Khi tắt, Admin câu cá hoàn toàn như user thường.\n\n` +
                `**Cách dùng:**\n` +
                `\`n.adminfishing on\` - Bật bypass cho Admin\n` +
                `\`n.adminfishing off\` - Tắt bypass, Admin chơi như user thường\n` +
                `\`n.adminfishing status\` - Xem trạng thái hiện tại`
            );
        }

        if (action === "status") {
            const status = AdminFishingBypassStorage.load();
            return message.reply(
                `${emojis.info} **Trạng thái Admin Fishing Bypass:** ${status.enabled ? "🟢 BẬT" : "🔴 TẮT"}\n` +
                `Cập nhật lần cuối: ${new Date(status.lastUpdated).toLocaleString("vi-VN")} bởi ${status.updatedBy || "Không rõ"}`
            );
        }

        const enabled = action === "on";
        const success = AdminFishingBypassStorage.set(enabled, message.author.username);

        if (!success) {
            return message.reply(`${emojis.error} Có lỗi xảy ra khi lưu cấu hình!`);
        }

        client.adminFishingBypass = enabled;

        if (enabled) {
            await message.reply(`${emojis.success} **Đã BẬT** đặc quyền Admin khi câu cá (bypass cooldown/cần/mồi).`);
        } else {
            await message.reply(`${emojis.success} **Đã TẮT** đặc quyền Admin khi câu cá. Admin giờ câu cá như user thường.`);
        }
    },
});
