declare namespace NodeJS {
    interface ProcessEnv {
        readonly NODE_ENV: "development" | "production";
        readonly SUPPORT_GUILD_INVITE: string;
        readonly DEBUG: `bot:${string}`;
        readonly DASHBOARD_URL: string;
        readonly SUPPORT_NAME: string;
        readonly BOT_TOKEN: string;
    }
}
