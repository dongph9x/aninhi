import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Message,
    MessageMentions,
    type OmitPartialGroupDMChannel,
    SlashCommandBuilder,
    SlashCommandSubcommandBuilder,
    SlashCommandSubcommandGroupBuilder,
} from "discord.js";
import fs from "fs";
import path from "path";

import type {
    ReadySubSlashCommandProps,
    SlashCommandProps,
    SlashCommandSubCommands,
    SubCommandMap,
    SubSlashCommandProps,
    SubTextCommandProps,
    TextCommandProps,
} from "@/typings";
import { importDefault } from "@/utils/import";

const pattern = {
    argument: /\[(.*?)\]/,
    role: MessageMentions.RolesPattern,
    mention: MessageMentions.UsersPattern,
    channel: MessageMentions.ChannelsPattern,
};

export class SubCommand {
    static handleParamLabel(
        value: string,
        pull: SubTextCommandProps,
        message: OmitPartialGroupDMChannel<Message>,
    ) {
        if (pattern.argument.test(value)) {
            return {
                name: "[string]",
                params: pull.params!.get("[string]"),
                value: value,
            };
        }

        if (pull.params!.has(value) || pull.subCommandAliases?.has(value)) {
            const params = pull.subCommandAliases?.has(value)
                ? pull.params!.get(pull.subCommandAliases.get(value)!)
                : pull.params!.get(value);

            return {
                name: value,
                params: params,
                value: value,
            };
        }

        if (pattern.mention.test(value)) {
            const result = pattern.mention.exec(value) as RegExpExecArray;

            return {
                name: "[mention]",
                params: pull.params!.get("[mention]"),
                value: message.inGuild()
                    ? message.mentions.members.get(result[1])
                    : message.mentions.parsedUsers.get(result[1]),
            };
        }

        if (pattern.channel.test(value)) {
            const result = pattern.channel.exec(value) as RegExpExecArray;

            return {
                name: "[channel]",
                params: pull.params!.get("[channel]"),
                value: message.mentions.channels.get(result[1]),
            };
        }

        if (pattern.role.test(value)) {
            const result = pattern.role.exec(value) as RegExpExecArray;

            return {
                name: "[role]",
                params: pull.params!.get("[role]"),
                value: message.mentions.roles.get(result[1]),
            };
        }

        return {
            name: "[string]",
            params: pull.params!.get("[string]"),
            value: value,
        };
    }

    static handleParamPull(
        pull: SubTextCommandProps,
        args: string[],
        message: OmitPartialGroupDMChannel<Message>,
    ) {
        const params = [];
        let paramCount = 0;
        let paramsPull = pull;

        for (const arg of args) {
            if (!paramsPull.params) break;

            const label = this.handleParamLabel(arg, paramsPull, message);
            if (pattern.argument.test(label.name)) {
                params.push(label.value);
            } else {
                paramCount++;
            }

            if (!label.params) break;
            paramsPull = label.params;
        }

        return {
            params: params,
            args: args.slice(params.length + paramCount),
            exec: paramsPull,
        };
    }

    static handleGetPullSlashCommand(
        pull: SlashCommandProps,
        interaction: ChatInputCommandInteraction | AutocompleteInteraction,
    ) {
        if (!pull.subcommands) return pull;

        const subCommand = interaction.options.getSubcommand();
        const subCommandGroup = interaction.options.getSubcommandGroup();

        if (subCommandGroup) {
            const group = pull.subcommands.get(subCommandGroup) as SlashCommandSubCommands;
            return group.get(subCommand) as SubSlashCommandProps;
        } else {
            return pull.subcommands.get(subCommand) as SubSlashCommandProps;
        }
    }

    static async text(pathname: string, pull: TextCommandProps | SubTextCommandProps) {
        const files = fs.readdirSync(pathname);
        pull.params = new Map();

        for (const file of files) {
            if (file === "index.ts") continue;

            const paramsFolder = path.join(pathname, file);
            const paramPull = await importDefault<SubTextCommandProps>(paramsFolder);

            if (!paramPull) continue;

            if (pull.options) {
                paramPull.options = Object.assign(paramPull.options ?? {}, pull.options);
            }

            if (file.endsWith(".ts")) {
                const filename = file.slice(0, file.indexOf(".ts"));

                if (Array.isArray(paramPull.aliases)) {
                    if (!pull.subCommandAliases) {
                        pull.subCommandAliases = new Map();
                    }

                    for (const alias of paramPull.aliases) {
                        pull.subCommandAliases.set(alias, filename);
                    }
                }

                pull.params.set(filename, paramPull);
            } else {
                paramPull.params = new Map();
                pull.params.set(file, paramPull);

                await this.text(paramsFolder, paramPull);
            }
        }
    }

    static async slash(pathname: string, pull: SlashCommandProps | SubSlashCommandProps) {
        const files = fs.readdirSync(pathname);

        pull.subcommands = new Map<string, ReadySubSlashCommandProps | SubCommandMap>();

        for (const file of files) {
            if (file === "index.ts") continue;

            const metadata = pull.builder as SlashCommandBuilder;

            if (!file.endsWith(".ts")) {
                const group = new SlashCommandSubcommandGroupBuilder();
                const groupPath = path.join(pathname, file);

                const groupSubCommands = new Map<string, ReadySubSlashCommandProps>();
                for (const f of fs.readdirSync(groupPath)) {
                    if (!f.endsWith(".ts")) continue;

                    const groupCommandPath = path.join(groupPath, f);
                    const groupCommand =
                        await importDefault<SubSlashCommandProps>(groupCommandPath);

                    if (!groupCommand) continue;

                    if (pull.options) {
                        groupCommand.options = Object.assign(
                            groupCommand.options ?? {},
                            pull.options,
                        );
                    }

                    groupCommand.builder = new SlashCommandSubcommandBuilder();
                    groupCommand.metadata(groupCommand.builder);

                    groupSubCommands.set(
                        groupCommand.builder.name,
                        groupCommand as ReadySubSlashCommandProps,
                    );

                    group.addSubcommand(groupCommand.builder);
                }

                group.setName(file).setDescription(file);
                pull.subcommands.set(file, groupSubCommands);

                metadata.addSubcommandGroup(group);
            } else {
                const subCommandPath = path.join(pathname, file);
                const subCommand = await importDefault<SubSlashCommandProps>(subCommandPath);
                if (!subCommand) continue;

                if (pull.options) {
                    subCommand.options = Object.assign(subCommand.options ?? {}, pull.options);
                }

                subCommand.builder = new SlashCommandSubcommandBuilder();
                subCommand.metadata(subCommand.builder);

                pull.subcommands.set(
                    subCommand.builder.name,
                    subCommand as ReadySubSlashCommandProps,
                );

                metadata.addSubcommand(subCommand.builder);
            }
        }
    }
}
