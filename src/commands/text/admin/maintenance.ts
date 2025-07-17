import { Bot } from "@/classes";
import { config, emojis } from "@/config";

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

        if (!action || (action !== "on" && action !== "off")) {
            return message.reply(`${emojis.error} Vui lòng chỉ định \`on\` hoặc \`off\`!\nVí dụ: \`n.maintenance on\``);
        }

        if (action === "on") {
            client.maintenanceMode = true;
            await message.reply(`${emojis.info} **Chế độ bảo trì đã được BẬT**\nTất cả lệnh sẽ bị chặn cho đến khi tắt chế độ bảo trì.`);
        } else {
            client.maintenanceMode = false;
            await message.reply(`${emojis.success} **Chế độ bảo trì đã được TẮT**\nBot đã hoạt động bình thường trở lại.`);
        }
    },
}); 