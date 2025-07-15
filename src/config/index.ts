import type { ColorResolvable } from "discord.js";

import type { Locale } from "@/utils/locales";

export * from "./autocomplete";
export { default as emojis } from "./data/emojis.json";

export type BotConfig = {
    developers: string[];
    embedColor: ColorResolvable;
    defaultLocales: Locale;
    prefix: string;
};

export const config: BotConfig = {
    developers: ["769244837030526976"],
    embedColor: "#ffa5f8",
    defaultLocales: "vi",
    prefix: "n.",
};
