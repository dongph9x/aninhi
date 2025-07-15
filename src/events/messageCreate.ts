import { Bot, SubCommand } from "@/classes";
import { config } from "@/config";
import { i18n } from "@/utils/locales";
import { logger } from "@/utils/logger";

export default Bot.createEvent({
    eventName: "messageCreate",
    emit: async (client, message) => {
        if (message.author.bot) return;
        if (!message.content.startsWith(config.prefix)) {
            if (message.mentions.has(client.user.id)) {
                const { t } = await i18n(message.guildId);
                return message.reply(`ヾ(≧▽≦*)o | ${t("prefix", config.prefix)}`);
            }

            return;
        }

        const input = message.content.slice(config.prefix.length);
        const args = input.trim().split(/\s+/g);

        const commandName = args.shift()?.toLowerCase();
        if (!commandName) return;

        const { commands, aliases } = client.text;
        const command = commands.get(commandName) ?? commands.get(aliases.get(commandName)!);
        if (!command) return;

        try {
            const pull = SubCommand.handleParamPull(command, args, message);
            const { t, locale } = await i18n(message.guildId);

            if (!client.filter.text(message, commandName, t, pull.exec.options)) return;

            const content = command.includeContent
                ? input.slice(commandName.length + 1).trim()
                : null;

            pull.exec.run({
                t,
                client,
                message,
                content,
                locale,
                args: pull.args,
                params: pull.params,
            });
        } catch (error) {
            logger.error(error);
        }
    },
});
