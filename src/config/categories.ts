type CategoryData = {
    icon: string;
    name: {
        en: string;
        vi: string;
    };
    description: {
        en: string;
        vi: string;
    };
};

const data: Record<string, CategoryData> = {
    information: {
        icon: "ℹ️",
        name: {
            en: "Information",
            vi: "Thông tin",
        },
        description: {
            en: "Information about the app, its features, and how to use it.",
            vi: "Thông tin về ứng dụng, các tính năng và cách sử dụng.",
        },
    },
    moderation: {
        icon: "🛠️",
        name: {
            en: "Moderation",
            vi: "Quản lý",
        },
        description: {
            en: "Tools for managing and moderating the server.",
            vi: "Công cụ để quản lý và điều hành máy chủ.",
        },
    },
    ecommerce: {
        icon: "🪙",
        name: {
            en: "Ecommerce",
            vi: "Ecommerce",
        },
        description: {
            en: "Economy system with currency, games, and transactions",
            vi: "Hệ thống kinh tế với tiền tệ, mini games và giao dịch",
        },
    },
};

export default data;
