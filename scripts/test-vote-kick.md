# Vote Kick System Test Guide

## Fixed Issues
- ✅ Fixed JSON parsing errors for button custom IDs
- ✅ Fixed channel fetching in endVote function
- ✅ Added proper vote kick button handler in interactionCreate event
- ✅ Removed automatic moderator vote (moderator must vote manually)
- ✅ Dynamic time display (shows actual remaining time, not always 30s)
- ✅ **Real-time countdown timer** (updates every second automatically)
- ✅ **Customizable vote duration** (10s to 5m, default 30s)
- ✅ **Customizable kick duration** (10s to 28d, default 1m)

## How to Test

### 1. Basic Vote Kick Test
```
p!votekick @user spam
```
- Should create an embed with Yes/No buttons
- Buttons should have JSON custom IDs (no more parsing errors)
- Vote should last 30 seconds (default)
- **Initial state**: Yes: 0, No: 0 (moderator doesn't get automatic vote)
- **Time display**: Shows actual remaining time (30s, 29s, 28s, etc.)

### 1.1 Custom Time Vote Kick Test
```
p!votekick @user 60 spam
p!votekick @user 2m vi phạm nội quy
p!votekick @user 30s quấy rối
p!votekick @user 1h spam liên tục
```
- **60**: 60 seconds vote, 1 minute kick (default)
- **2m**: 2 minutes vote, 1 minute kick (default)
- **30s**: 30 seconds vote, 1 minute kick (default)
- **1h**: 1 hour vote (max 5 minutes allowed), 1 minute kick (default)

### 1.2 Custom Kick Duration Test
```
p!votekick @user 30s 5m spam
p!votekick @user 2m 1h vi phạm nội quy
p!votekick @user 60 30s quấy rối
p!votekick @user 1m 1d spam liên tục
```
- **30s 5m**: 30 seconds vote, 5 minutes kick
- **2m 1h**: 2 minutes vote, 1 hour kick
- **60 30s**: 60 seconds vote, 30 seconds kick
- **1m 1d**: 1 minute vote, 1 day kick

### 2. Button Interaction Test
- Click "Yes" button → Should show "✅ Bạn đã vote Yes"
- Click "No" button → Should show "✅ Bạn đã vote No"
- Try voting twice → Should show "❌ Bạn đã vote rồi!"
- **Moderator must vote manually** - no automatic vote

### 3. Vote Result Test
**Scenario 1: Yes > No**
- Get multiple people to vote Yes
- After 30 seconds, user should be kicked for 1 minute
- Embed should show "✅ Vote Kick Thành Công"

**Scenario 2: Yes ≤ No**
- Get more No votes than Yes votes
- After 30 seconds, user should NOT be kicked
- Embed should show "❌ Vote Kick Thất Bại"

### 4. Error Handling Test
```
p!votekick @user
```
- Should show usage instructions

```
p!votekick 123456789
```
- Should show "Người dùng không hợp lệ" if user doesn't exist

```
p!votekick @yourself
```
- Should show "Không thể vote kick chính mình"

### 5. Duplicate Vote Test
- Start a vote kick for a user
- Try to start another vote kick for the same user in the same channel
- Should show "Đã có vote đang diễn ra"

### 5.1 Time Validation Test
```
p!votekick @user 5 spam
```
- Should show "Thời gian vote tối thiểu là 10 giây"

```
p!votekick @user 10m spam
```
- Should show "Thời gian vote tối đa là 5 phút"

```
p!votekick @user 30s 5 spam
```
- Should show "Thời gian kick tối thiểu là 10 giây"

```
p!votekick @user 30s 30d spam
```
- Should show "Thời gian kick tối đa là 28 ngày"

```
p!votekick @user invalid spam
```
- Should treat "invalid" as part of reason, use default 30s vote, 1m kick

### 6. Time Display Test
- Create a vote kick
- Watch the time countdown: 30s → 29s → 28s → ... → 0s
- **Time updates automatically every second** - no need to vote to see countdown
- Countdown continues even if no one votes

## Technical Details

### Button Custom IDs (JSON Format)
```json
{
  "type": "votekick",
  "action": "yes",
  "targetUserId": "123456789"
}
```

### Vote Session Structure
```typescript
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
}
```

### Handler Flow
1. Button clicked → `interactionCreate.ts` detects vote kick JSON
2. Calls `handleVoteKickButton()` from vote kick command
3. Validates vote session and user eligibility
4. Updates vote counts and embed
5. After 30 seconds → `endVote()` function processes result

## Expected Behavior
- ✅ No more JSON parsing errors
- ✅ Buttons work correctly
- ✅ Vote counting works (starts from 0)
- ✅ Auto-kick after 30 seconds if Yes > No
- ✅ Proper error messages
- ✅ Moderation logging
- ✅ Channel timeout (1 minute)
- ✅ **Moderator must vote manually** (no automatic vote)
- ✅ **Dynamic time display** (real countdown)

## Key Changes Made
1. **Removed automatic moderator vote** - Moderator now starts with 0 votes like everyone else
2. **Dynamic time display** - Shows actual remaining time instead of always 30s
3. **Fair voting system** - Everyone including moderator must vote manually
4. **Real-time countdown timer** - Updates embed every second automatically
5. **Customizable vote duration** - Support 10s to 5m with flexible time formats (30s, 2m, 1h)
6. **Customizable kick duration** - Support 10s to 28d with flexible time formats (30s, 5m, 1h, 1d)

## Troubleshooting
If buttons still don't work:
1. Check console for any remaining errors
2. Verify the interaction handler is properly detecting vote kick JSON
3. Ensure the vote session is being stored correctly
4. Check if the client reference is available for endVote function 