import { get } from "lodash";
import { format } from "util";

import { config } from "@/config";
import enLang from "@/locales/en.json";
import viLang from "@/locales/vi.json";
import type { Path } from "@/typings";

const lang = { vi: viLang, en: enLang };

export function translate(locale: keyof typeof lang) {
    const data = lang[locale];

    return (path: Path<typeof data>, ...args: unknown[]) => {
        return format(get(data, path), ...args);
    };
}

export async function i18n(guildId?: string | null) {
    // Replace this with your own logic to determine the locale.
    const placeholderLanguage = "en";

    const locale = guildId ? placeholderLanguage : config.defaultLocales;

    return { locale, t: translate(locale) };
}

export type TranslationFn = ReturnType<typeof translate>;
export type Locale = keyof typeof lang;
