type CommandDataDescription = {
    vi: string;
    en: string;
};

type CommandData = {
    description: CommandDataDescription;
    parameters: {
        name: string;
        required: boolean;
    }[];
    parameters_info: {
        name: string;
        description: CommandDataDescription;
    }[];
    subcommands: {
        name: string;
        description: CommandDataDescription;
        parameters: {
            name: string;
            required: boolean;
        }[];
    }[];
};

const data: Record<string, CommandData> = {
    help: {
        description: {
            vi: "Hiển thị danh sách các danh mục lệnh có sẵn.",
            en: "Display the list of available command categories.",
        },
        parameters: [
            {
                name: "command",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "command",
                description: {
                    vi: "Hiển thị thông tin chi tiết về một lệnh cụ thể.",
                    en: "Display detailed information about a specific command.",
                },
            },
        ],
        subcommands: [],
    },
    ping: {
        description: {
            vi: "Kiểm tra độ trễ của bot.",
            en: "Check the bot's latency.",
        },
        parameters: [],
        parameters_info: [],
        subcommands: [],
    },
    uptime: {
        description: {
            vi: "Kiểm tra thời gian hoạt động của bot.",
            en: "Check the bot's uptime.",
        },
        parameters: [],
        parameters_info: [],
        subcommands: [],
    },
    ban: {
        description: {
            vi: "Cấm một người dùng khỏi máy chủ.",
            en: "Ban a user from the server.",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
            {
                name: "reason",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng cần bị cấm.",
                    en: "The user to be banned.",
                },
            },
            {
                name: "reason",
                description: {
                    vi: "Lý do cấm người dùng.",
                    en: "The reason for banning the user.",
                },
            },
        ],
        subcommands: [],
    },
    kick: {
        description: {
            vi: "Đuổi một người dùng khỏi máy chủ.",
            en: "Kick a user from the server.",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
            {
                name: "reason",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng cần bị đuổi.",
                    en: "The user to be kicked.",
                },
            },
            {
                name: "reason",
                description: {
                    vi: "Lý do đuổi người dùng.",
                    en: "The reason for kicking the user.",
                },
            },
        ],
        subcommands: [],
    },
    mute: {
        description: {
            vi: "Tạm thời cấm một người dùng khỏi máy chủ.",
            en: "Temporarily mute a user from the server.",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
            {
                name: "duration",
                required: false,
            },
            {
                name: "reason",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng cần bị cấm tạm thời.",
                    en: "The user to be temporarily muted.",
                },
            },
            {
                name: "duration",
                description: {
                    vi: "Thời gian cấm tạm thời.",
                    en: "The duration of the temporary mute.",
                },
            },
            {
                name: "reason",
                description: {
                    vi: "Lý do cấm tạm thời người dùng.",
                    en: "The reason for temporarily muting the user.",
                },
            },
        ],
        subcommands: [],
    },
    unban: {
        description: {
            vi: "Gỡ bỏ lệnh cấm một người dùng khỏi máy chủ.",
            en: "Unban a user from the server.",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng cần được gỡ bỏ lệnh cấm.",
                    en: "The user to be unbanned.",
                },
            },
        ],
        subcommands: [],
    },
    unmute: {
        description: {
            vi: "Gỡ bỏ lệnh cấm tạm thời một người dùng khỏi máy chủ.",
            en: "Unmute a user from the server.",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng cần được gỡ bỏ lệnh cấm tạm thời.",
                    en: "The user to be unmuted.",
                },
            },
        ],
        subcommands: [],
    },
    role: {
        description: {
            vi: "Quản lý vai trò của người dùng.",
            en: "Manage user roles.",
        },
        parameters: [],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng cần quản lý vai trò.",
                    en: "The user to manage roles for.",
                },
            },
            {
                name: "role",
                description: {
                    vi: "Vai trò cần thêm hoặc xóa.",
                    en: "The role to add or remove.",
                },
            },
        ],
        subcommands: [
            {
                name: "add",
                description: {
                    vi: "Thêm vai trò cho người dùng.",
                    en: "Add a role to a user.",
                },
                parameters: [
                    {
                        name: "user",
                        required: true,
                    },
                    {
                        name: "role",
                        required: true,
                    },
                ],
            },
            {
                name: "remove",
                description: {
                    vi: "Xóa vai trò khỏi người dùng.",
                    en: "Remove a role from a user.",
                },
                parameters: [
                    {
                        name: "user",
                        required: true,
                    },
                    {
                        name: "role",
                        required: true,
                    },
                ],
            },
        ],
    },
    add: {
        description: {
            vi: "Thêm AniCoin cho người dùng (Admin only).",
            en: "Add AniCoin to a user (Admin only).",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
            {
                name: "amount",
                required: true,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng nhận tiền",
                    en: "User to receive money",
                },
            },
            {
                name: "amount",
                description: {
                    vi: "Số tiền thêm",
                    en: "Amount to add",
                },
            },
        ],
        subcommands: [],
    },
    subtract: {
        description: {
            vi: "Trừ AniCoin từ người dùng (Admin only).",
            en: "Subtract AniCoin from a user (Admin only).",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
            {
                name: "amount",
                required: true,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng bị trừ tiền",
                    en: "User to subtract money from",
                },
            },
            {
                name: "amount",
                description: {
                    vi: "Số tiền trừ",
                    en: "Amount to subtract",
                },
            },
        ],
        subcommands: [],
    },
    balance: {
        description: {
            vi: "Xem số dư AniCoin và thông tin tài khoản.",
            en: "View AniCoin balance and account information.",
        },
        parameters: [],
        parameters_info: [],
        subcommands: [],
    },
    daily: {
        description: {
            vi: "Nhận thưởng hàng ngày và tăng chuỗi streak.",
            en: "Claim daily reward and increase streak.",
        },
        parameters: [],
        parameters_info: [],
        subcommands: [],
    },
    give: {
        description: {
            vi: "Chuyển AniCoin cho người dùng khác.",
            en: "Transfer AniCoin to another user.",
        },
        parameters: [
            {
                name: "user",
                required: true,
            },
            {
                name: "amount",
                required: true,
            },
        ],
        parameters_info: [
            {
                name: "user",
                description: {
                    vi: "Người dùng nhận tiền",
                    en: "User to receive money",
                },
            },
            {
                name: "amount",
                description: {
                    vi: "Số tiền chuyển",
                    en: "Amount to transfer",
                },
            },
        ],
        subcommands: [],
    },
    leaderboard: {
        description: {
            vi: "Xem bảng xếp hạng người giàu nhất.",
            en: "View the richest users leaderboard.",
        },
        parameters: [],
        parameters_info: [],
        subcommands: [],
    },
    blackjack: {
        description: {
            vi: "Chơi blackjack với bot.",
            en: "Play blackjack against the bot.",
        },
        parameters: [
            {
                name: "amount",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "amount",
                description: {
                    vi: "Số tiền cược (mặc định: 1)",
                    en: "Bet amount (default: 1)",
                },
            },
        ],
        subcommands: [],
    },
    slots: {
        description: {
            vi: "Chơi máy đánh bạc slots.",
            en: "Play slot machine.",
        },
        parameters: [
            {
                name: "amount",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "amount",
                description: {
                    vi: "Số tiền cược (mặc định: 10)",
                    en: "Bet amount (default: 10)",
                },
            },
        ],
        subcommands: [],
    },
    coinflip: {
        description: {
            vi: "Tung đồng xu với cược.",
            en: "Flip a coin with betting.",
        },
        parameters: [
            {
                name: "choice",
                required: true,
            },
            {
                name: "amount",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "choice",
                description: {
                    vi: "Lựa chọn (heads/tails hoặc h/t)",
                    en: "Choice (heads/tails or h/t)",
                },
            },
            {
                name: "amount",
                description: {
                    vi: "Số tiền cược (mặc định: 10)",
                    en: "Bet amount (default: 10)",
                },
            },
        ],
        subcommands: [],
    },
    roulette: {
        description: {
            vi: "Chơi roulette với nhiều loại cược khác nhau.",
            en: "Play roulette with various betting options.",
        },
        parameters: [
            {
                name: "bet_type",
                required: false,
            },
            {
                name: "amount",
                required: false,
            },
        ],
        parameters_info: [
            {
                name: "bet_type",
                description: {
                    vi: "Loại cược (red, black, even, odd, số 0-36, v.v.)",
                    en: "Type of bet (red, black, even, odd, number 0-36, etc.)",
                },
            },
            {
                name: "amount",
                description: {
                    vi: "Số tiền cược (mặc định: 100)",
                    en: "Bet amount (default: 100)",
                },
            },
        ],
        subcommands: [],
    },
};

export default data;
