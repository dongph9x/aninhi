import { ChannelRestrictionsStorage } from '../src/utils/channel-restrictions-storage';
import { defaultChannelRestrictions } from '../src/config/channel-restrictions';

console.log('🔄 Resetting Channel Restrictions to Default\n');

// Reset về cấu hình mặc định
const success = ChannelRestrictionsStorage.save(defaultChannelRestrictions);

if (success) {
    console.log('✅ Channel restrictions reset to default successfully!');
    console.log('📋 Default configuration:');
    console.log('- Whitelist Mode:', defaultChannelRestrictions.useWhitelistMode ? 'ENABLED' : 'DISABLED');
    console.log('- Blacklist Mode:', defaultChannelRestrictions.useBlacklistMode ? 'ENABLED' : 'DISABLED');
    console.log('- Allowed Channels:', defaultChannelRestrictions.allowedChannels.length);
    console.log('- Blocked Channels:', defaultChannelRestrictions.blockedChannels.length);
    console.log('- Allowed Categories:', defaultChannelRestrictions.allowedCategories.length);
    console.log('- Blocked Categories:', defaultChannelRestrictions.blockedCategories.length);
    
    console.log('\n⚠️  IMPORTANT:');
    console.log('- Whitelist mode is now ENABLED by default');
    console.log('- No channels are allowed by default');
    console.log('- All regular commands will be BLOCKED');
    console.log('- Only exempt commands and admin commands will work');
    console.log('- Admin must add channels to whitelist for bot to work normally');
} else {
    console.log('❌ Failed to reset channel restrictions!');
} 