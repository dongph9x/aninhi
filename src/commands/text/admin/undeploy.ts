import { Bot } from "@/classes";
import { emojis } from "@/config";
import { logger } from "@/utils/logger";

export default Bot.createCommand({
    structure: {
        name: "undeploy",
    },
    options: { onlyDev: true, inGuild: true },
    hidden: true,
    run: async ({ client, message }) => {
        const awaitMessage = await message.reply(
            `${emojis.info} | Đang xóa **${client.slash.commands.size}** lệnh.`,
        );

        try {
            await message.guild.commands.set([]);

            awaitMessage.edit(
                `${emojis.success} | Đã xóa thành công **${client.slash.commands.size}** lệnh.`,
            );
        } catch (error) {
            awaitMessage.edit(`${emojis.error} | Có lỗi xảy ra khi đang xóa lệnh.`);
            logger.error(error);
        }
    },
});
