import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message } from "discord.js";

import { Bot } from "@/classes";
import { ModerationService } from "@/utils/moderation";

// Lưu trữ các vote đang diễn ra
interface VoteKickSession {
    messageId: string;
    channelId: string;
    guildId: string;
    targetUserId: string;
    moderatorId: string;
    reason: string;
    yesVotes: Set<string>;
    noVotes: Set<string>;
    endTime: number;
    timeoutId: NodeJS.Timeout;
    kickDuration: number; // Kick duration in milliseconds
}

const activeVoteKicks = new Map<string, VoteKickSession>();

export default Bot.createCommand({
    structure: {
        name: "votekick",
        aliases: ["vote", "vkick", "democracy"],
    },
    options: {
        permissions: ["ManageChannels", "ManageRoles"],
        inGuild: true,
    },
    run: async ({ message, t, args }) => {
        // Kiểm tra arguments
        if (args.length < 1) {
            const embed = new EmbedBuilder()
                .setTitle("❌ Cách Dùng Không Đúng")
                .setDescription(
                    "**Cách dùng:** `p!votekick <người dùng> [thời gian vote] [thời gian kick] [lý do]`\n\n" +
                        "**Ví dụ:**\n" +
                        "• `p!votekick @user spam` (30s vote, 1m kick mặc định)\n" +
                        "• `p!votekick @user 60 spam` (60s vote, 1m kick)\n" +
                        "• `p!votekick @user 2m 5m vi phạm nội quy` (2m vote, 5m kick)\n" +
                        "• `p!votekick 123456789 30s 2m quấy rối` (30s vote, 2m kick)\n\n" +
                        "**Định dạng thời gian:**\n" +
                        "• `30` hoặc `30s` = 30 giây\n" +
                        "• `1m` = 1 phút\n" +
                        "• `2m` = 2 phút\n" +
                        "• `1h` = 1 giờ\n\n" +
                        "**Cách hoạt động:**\n" +
                        "• Thời gian vote: Tùy chỉnh (mặc định 30s)\n" +
                        "• Thời gian kick: Tùy chỉnh (mặc định 1m)\n" +
                        "• Nếu số Yes > số No: Kick khỏi channel theo thời gian đã chọn\n" +
                        "• Nếu không: Hủy bỏ\n" +
                        "• Mỗi người chỉ được vote 1 lần",
                )
                .setColor("#ff0000")
                .setTimestamp();

            return message.reply({ embeds: [embed] });
        }

        try {
            // Parse target user
            const targetUser =
                message.mentions.users.first() ||
                (args[0] && args[0].match(/^\d+$/) ? { id: args[0]! } : null);

            if (!targetUser) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Hợp Lệ")
                    .setDescription(
                        "Vui lòng tag một người dùng hợp lệ hoặc cung cấp ID người dùng hợp lệ.",
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to vote kick themselves
            if (targetUser.id === message.author.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Vote Kick Chính Mình")
                    .setDescription("Bạn không thể tạo vote kick cho chính mình.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user is trying to vote kick the bot
            if (targetUser.id === message.client.user.id) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Thể Vote Kick Bot")
                    .setDescription("Bạn không thể tạo vote kick cho bot.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Get target member
            const targetMember = await message.guild!.members.fetch(targetUser.id).catch(() => null);
            
            if (!targetMember) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Người Dùng Không Tìm Thấy")
                    .setDescription("Người dùng này không có trong máy chủ.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if user has permission to timeout the target
            if (!targetMember.moderatable) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Không Có Quyền Kick")
                    .setDescription("Bạn không có quyền kick người dùng này khỏi channel.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Parse time and reason
            let voteDuration = 30000; // Default 30 seconds
            let kickDuration = 60000; // Default 1 minute
            let reason = "Không có lý do";
            let timeArg = "";
            let kickTimeArg = "";
            let reasonStartIndex = 1;

            // Check if second argument is a time parameter (vote duration)
            if (args.length > 1) {
                const timeParam = args[1]!;
                const timeMatch = timeParam.match(/^(\d+)(s|m|h)?$/i);
                
                if (timeMatch) {
                    const value = parseInt(timeMatch[1]);
                    const unit = timeMatch[2]?.toLowerCase();
                    
                    if (unit === 'm') {
                        voteDuration = value * 60 * 1000; // minutes to milliseconds
                        timeArg = `${value} phút`;
                    } else if (unit === 'h') {
                        voteDuration = value * 60 * 60 * 1000; // hours to milliseconds
                        timeArg = `${value} giờ`;
                    } else {
                        voteDuration = value * 1000; // seconds to milliseconds
                        timeArg = `${value} giây`;
                    }
                    
                    reasonStartIndex = 2;
                }
            }

            // Check if third argument is a kick duration parameter
            if (args.length > reasonStartIndex) {
                const kickTimeParam = args[reasonStartIndex]!;
                const kickTimeMatch = kickTimeParam.match(/^(\d+)(s|m|h)?$/i);
                
                if (kickTimeMatch) {
                    const value = parseInt(kickTimeMatch[1]);
                    const unit = kickTimeMatch[2]?.toLowerCase();
                    
                    if (unit === 'm') {
                        kickDuration = value * 60 * 1000; // minutes to milliseconds
                        kickTimeArg = `${value} phút`;
                    } else if (unit === 'h') {
                        kickDuration = value * 60 * 60 * 1000; // hours to milliseconds
                        kickTimeArg = `${value} giờ`;
                    } else {
                        kickDuration = value * 1000; // seconds to milliseconds
                        kickTimeArg = `${value} giây`;
                    }
                    
                    reasonStartIndex++;
                }
            }

            // Parse reason from remaining arguments
            if (args.length > reasonStartIndex) {
                reason = args.slice(reasonStartIndex).join(" ");
            }

            // Validate vote duration
            if (voteDuration < 10000) { // Minimum 10 seconds
                const embed = new EmbedBuilder()
                    .setTitle("❌ Thời Gian Vote Quá Ngắn")
                    .setDescription("Thời gian vote tối thiểu là 10 giây.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            if (voteDuration > 300000) { // Maximum 5 minutes
                const embed = new EmbedBuilder()
                    .setTitle("❌ Thời Gian Vote Quá Dài")
                    .setDescription("Thời gian vote tối đa là 5 phút.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Validate kick duration
            if (kickDuration < 10000) { // Minimum 10 seconds
                const embed = new EmbedBuilder()
                    .setTitle("❌ Thời Gian Kick Quá Ngắn")
                    .setDescription("Thời gian kick tối thiểu là 10 giây.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            if (kickDuration > 2419200000) { // Maximum 28 days (Discord limit)
                const embed = new EmbedBuilder()
                    .setTitle("❌ Thời Gian Kick Quá Dài")
                    .setDescription("Thời gian kick tối đa là 28 ngày.")
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Check if there's already an active vote for this user in this channel
            const existingVote = Array.from(activeVoteKicks.values()).find(
                vote => vote.targetUserId === targetUser.id && 
                       vote.channelId === message.channelId &&
                       vote.endTime > Date.now()
            );

            if (existingVote) {
                const embed = new EmbedBuilder()
                    .setTitle("❌ Đã Có Vote Đang Diễn Ra")
                    .setDescription(
                        `Đã có một vote kick cho <@${targetUser.id}> đang diễn ra trong channel này.\n` +
                        `Vui lòng chờ vote hiện tại kết thúc.`
                    )
                    .setColor("#ff0000")
                    .setTimestamp();

                return message.reply({ embeds: [embed] });
            }

            // Create vote embed
            const voteEmbed = new EmbedBuilder()
                .setTitle("🗳️ Vote Kick Channel")
                .setDescription(
                    `**${message.author.username}** muốn kick **<@${targetUser.id}>** khỏi channel này\n\n` +
                    `👤 **Người dùng:** <@${targetUser.id}>\n` +
                    `📝 **Lý do:** ${reason}\n` +
                    `⏰ **Thời gian vote:** ${timeArg || "30 giây"}\n` +
                    `🚫 **Thời gian kick:** ${kickTimeArg || "1 phút"}\n` +
                    `🎯 **Điều kiện:** Số Yes > Số No thì kick theo thời gian đã chọn\n\n` +
                    `**Bấm button bên dưới để vote!**`
                )
                .setColor("#ff6b35")
                .setThumbnail(
                    "displayAvatarURL" in targetUser ? targetUser.displayAvatarURL() : null,
                )
                .setFooter({
                    text: `Vote kick bởi ${message.author.username}`,
                    iconURL: message.author.displayAvatarURL(),
                })
                .setTimestamp();

            // Create buttons with JSON custom IDs
            const yesButton = new ButtonBuilder()
                .setCustomId(JSON.stringify({
                    type: "votekick",
                    action: "yes",
                    targetUserId: targetUser.id
                }))
                .setLabel("✅ Yes")
                .setStyle(ButtonStyle.Success);

            const noButton = new ButtonBuilder()
                .setCustomId(JSON.stringify({
                    type: "votekick",
                    action: "no",
                    targetUserId: targetUser.id
                }))
                .setLabel("❌ No")
                .setStyle(ButtonStyle.Danger);

            const row = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(yesButton, noButton);

            // Send vote message
            const voteMessage = await message.reply({
                embeds: [voteEmbed],
                components: [row]
            });

            // Create vote session
            const voteSession: VoteKickSession = {
                messageId: voteMessage.id,
                channelId: message.channelId,
                guildId: message.guildId!,
                targetUserId: targetUser.id,
                moderatorId: message.author.id,
                reason: reason,
                yesVotes: new Set(),
                noVotes: new Set(),
                endTime: Date.now() + voteDuration,
                timeoutId: setTimeout(() => endVote(voteMessage.id), voteDuration),
                kickDuration: kickDuration // Add kick duration to session
            };

            // Store vote session
            activeVoteKicks.set(voteMessage.id, voteSession);

            // Update embed with initial state (no votes yet)
            await updateVoteEmbed(voteMessage, voteSession);

            // Start countdown timer to update embed every second
            startCountdownTimer(voteMessage.id);

        } catch (error) {
            console.error("Error in votekick command:", error);

            const errorEmbed = new EmbedBuilder()
                .setTitle("❌ Vote Kick Thất Bại")
                .setDescription(
                    error instanceof Error
                        ? error.message
                        : "Đã xảy ra lỗi khi tạo vote kick. Vui lòng thử lại sau.",
                )
                .setColor("#ff0000")
                .setTimestamp();

            message.reply({ embeds: [errorEmbed] });
        }
    },
});

// Function to start countdown timer for vote embed updates
async function startCountdownTimer(messageId: string) {
    const updateInterval = setInterval(async () => {
        const voteSession = activeVoteKicks.get(messageId);
        if (!voteSession) {
            clearInterval(updateInterval);
            return;
        }

        const timeLeft = Math.max(0, Math.floor((voteSession.endTime - Date.now()) / 1000));
        
        // Stop updating if time is up
        if (timeLeft <= 0) {
            clearInterval(updateInterval);
            return;
        }

        try {
            // Get client from global reference
            const client = (globalThis as any).tournamentClient;
            if (!client) return;

            const guild = await client.guilds.fetch(voteSession.guildId);
            if (!guild) return;

            const channel = await guild.channels.fetch(voteSession.channelId);
            if (!channel || !channel.isTextBased()) return;

            const message = await channel.messages.fetch(messageId);
            await updateVoteEmbed(message, voteSession);
        } catch (error) {
            console.error("Error updating countdown timer:", error);
            clearInterval(updateInterval);
        }
    }, 1000); // Update every 1 second
}

// Function to update vote embed
async function updateVoteEmbed(message: Message, voteSession: VoteKickSession) {
    try {
        const yesCount = voteSession.yesVotes.size;
        const noCount = voteSession.noVotes.size;
        const totalVotes = yesCount + noCount;
        const timeLeft = Math.max(0, Math.floor((voteSession.endTime - Date.now()) / 1000));

        const embed = new EmbedBuilder()
            .setTitle("🗳️ Vote Kick Channel")
            .setDescription(
                `**Vote kick cho <@${voteSession.targetUserId}>**\n\n` +
                `📝 **Lý do:** ${voteSession.reason}\n` +
                `⏰ **Còn lại:** ${timeLeft} giây\n\n` +
                `**Kết quả hiện tại:**\n` +
                `✅ **Yes:** ${yesCount} vote\n` +
                `❌ **No:** ${noCount} vote\n` +
                `📊 **Tổng:** ${totalVotes} vote\n\n` +
                `**Điều kiện:** Số Yes > Số No thì kick theo thời gian đã chọn\n\n` +
                `**Bấm button bên dưới để vote!**`
            )
            .setColor("#ff6b35")
            .setFooter({
                text: `Vote kick bởi ${message.client.users.cache.get(voteSession.moderatorId)?.username || "Unknown"}`,
                iconURL: message.client.users.cache.get(voteSession.moderatorId)?.displayAvatarURL(),
            })
            .setTimestamp();

        // Create buttons with JSON custom IDs
        const yesButton = new ButtonBuilder()
            .setCustomId(JSON.stringify({
                type: "votekick",
                action: "yes",
                targetUserId: voteSession.targetUserId
            }))
            .setLabel(`✅ Yes (${yesCount})`)
            .setStyle(ButtonStyle.Success);

        const noButton = new ButtonBuilder()
            .setCustomId(JSON.stringify({
                type: "votekick",
                action: "no",
                targetUserId: voteSession.targetUserId
            }))
            .setLabel(`❌ No (${noCount})`)
            .setStyle(ButtonStyle.Danger);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(yesButton, noButton);

        await message.edit({ embeds: [embed], components: [row] });
    } catch (error) {
        console.error("Error updating vote embed:", error);
    }
}

// Function to end vote
async function endVote(messageId: string) {
    const voteSession = activeVoteKicks.get(messageId);
    if (!voteSession) return;

    try {
        // Get client from global reference (set in ready event)
        const client = (globalThis as any).tournamentClient;
        if (!client) {
            console.error("No client available to end vote");
            return;
        }

        const guild = await client.guilds.fetch(voteSession.guildId);
        if (!guild) return;

        const channel = await guild.channels.fetch(voteSession.channelId);
        if (!channel || !channel.isTextBased()) return;

        const message = await channel.messages.fetch(messageId);
        const yesCount = voteSession.yesVotes.size;
        const noCount = voteSession.noVotes.size;
        const totalVotes = yesCount + noCount;

        // Disable buttons with JSON custom IDs
        const yesButton = new ButtonBuilder()
            .setCustomId(JSON.stringify({
                type: "votekick",
                action: "yes",
                targetUserId: voteSession.targetUserId
            }))
            .setLabel(`✅ Yes (${yesCount})`)
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

        const noButton = new ButtonBuilder()
            .setCustomId(JSON.stringify({
                type: "votekick",
                action: "no",
                targetUserId: voteSession.targetUserId
            }))
            .setLabel(`❌ No (${noCount})`)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(true);

        const row = new ActionRowBuilder<ButtonBuilder>()
            .addComponents(yesButton, noButton);

        // Determine result
        let resultEmbed: EmbedBuilder;
        let kicked = false;

        if (yesCount > noCount && totalVotes > 0) {
            // Vote passed - kick the user
            try {
                const targetMember = await guild.members.fetch(voteSession.targetUserId);
                
                if (targetMember.moderatable) {
                    await targetMember.timeout(voteSession.kickDuration, `Vote kick: ${voteSession.reason}`);
                    kicked = true;

                    // Convert kick duration to readable format
                    const kickDurationMinutes = Math.floor(voteSession.kickDuration / 60000);
                    const kickDurationSeconds = Math.floor((voteSession.kickDuration % 60000) / 1000);
                    let kickDurationText = "";
                    
                    if (kickDurationMinutes > 0) {
                        kickDurationText = `${kickDurationMinutes} phút`;
                        if (kickDurationSeconds > 0) {
                            kickDurationText += ` ${kickDurationSeconds} giây`;
                        }
                    } else {
                        kickDurationText = `${kickDurationSeconds} giây`;
                    }

                    // Log moderation action
                    await ModerationService.logAction({
                        guildId: voteSession.guildId,
                        targetUserId: voteSession.targetUserId,
                        moderatorId: voteSession.moderatorId,
                        action: "kick",
                        reason: `Vote kick (${kickDurationText}): ${voteSession.reason}`,
                        channelId: voteSession.channelId,
                        messageId: voteSession.messageId,
                        duration: voteSession.kickDuration
                    });
                }
            } catch (error) {
                console.error("Error kicking user from vote:", error);
            }

            // Convert kick duration to readable format for display
            const kickDurationMinutes = Math.floor(voteSession.kickDuration / 60000);
            const kickDurationSeconds = Math.floor((voteSession.kickDuration % 60000) / 1000);
            let kickDurationText = "";
            
            if (kickDurationMinutes > 0) {
                kickDurationText = `${kickDurationMinutes} phút`;
                if (kickDurationSeconds > 0) {
                    kickDurationText += ` ${kickDurationSeconds} giây`;
                }
            } else {
                kickDurationText = `${kickDurationSeconds} giây`;
            }

            resultEmbed = new EmbedBuilder()
                .setTitle("✅ Vote Kick Thành Công")
                .setDescription(
                    `**Vote kick cho <@${voteSession.targetUserId}> đã thành công!**\n\n` +
                    `✅ **Yes:** ${yesCount} vote\n` +
                    `❌ **No:** ${noCount} vote\n` +
                    `📊 **Tổng:** ${totalVotes} vote\n\n` +
                    `👤 **Kết quả:** <@${voteSession.targetUserId}> đã bị kick khỏi channel trong ${kickDurationText}\n` +
                    `📝 **Lý do:** ${voteSession.reason}`
                )
                .setColor("#00ff00")
                .setTimestamp();
        } else {
            // Vote failed
            resultEmbed = new EmbedBuilder()
                .setTitle("❌ Vote Kick Thất Bại")
                .setDescription(
                    `**Vote kick cho <@${voteSession.targetUserId}> đã thất bại!**\n\n` +
                    `✅ **Yes:** ${yesCount} vote\n` +
                    `❌ **No:** ${noCount} vote\n` +
                    `📊 **Tổng:** ${totalVotes} vote\n\n` +
                    `👤 **Kết quả:** <@${voteSession.targetUserId}> không bị kick\n` +
                    `📝 **Lý do:** Số Yes không lớn hơn số No`
                )
                .setColor("#ff0000")
                .setTimestamp();
        }

        await message.edit({ embeds: [resultEmbed], components: [row] });

        // Clean up
        clearTimeout(voteSession.timeoutId);
        activeVoteKicks.delete(messageId);
        
        // Note: The countdown timer will automatically stop when voteSession is deleted

    } catch (error) {
        console.error("Error ending vote:", error);
        activeVoteKicks.delete(messageId);
    }
}

// Export function to handle button interactions
export async function handleVoteKickButton(interaction: any) {
    try {
        const data = JSON.parse(interaction.customId);
        
        if (data.type !== 'votekick' || !data.action || !data.targetUserId) return false;

        const voteSession = activeVoteKicks.get(interaction.message.id);
        if (!voteSession || voteSession.targetUserId !== data.targetUserId) {
            await interaction.reply({ 
                content: "❌ Vote này đã kết thúc hoặc không hợp lệ!", 
                ephemeral: true 
            });
            return true;
        }

        // Check if user already voted
        if (voteSession.yesVotes.has(interaction.user.id) || voteSession.noVotes.has(interaction.user.id)) {
            await interaction.reply({ 
                content: "❌ Bạn đã vote rồi!", 
                ephemeral: true 
            });
            return true;
        }

        // Add vote
        if (data.action === 'yes') {
            voteSession.yesVotes.add(interaction.user.id);
        } else if (data.action === 'no') {
            voteSession.noVotes.add(interaction.user.id);
        }

        // Note: Embed will be updated automatically by the countdown timer
        // No need to manually update here

        // Reply to user
        await interaction.reply({ 
            content: `✅ Bạn đã vote **${data.action === 'yes' ? 'Yes' : 'No'}** cho vote kick <@${data.targetUserId}>!`, 
            ephemeral: true 
        });

        return true;
    } catch (error) {
        console.error("Error handling vote kick button:", error);
        return false;
    }
} 