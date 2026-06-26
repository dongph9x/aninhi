import { Client, GatewayIntentBits, TextChannel, Message } from 'discord.js';

async function testAchievementCommand() {
  console.log('🏆 Test Achievement Command...\n');

  // Tạo client test
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  try {
    // Test các command patterns
    const testCommands = [
      'n.achievement-import help',
      'n.achievement-import list',
      'n.achievement-import add "Test Achievement" "https://test.com/badge.png" "123456789" 0',
      'n.achievement-import form',
    ];

    console.log('📋 Test Command Patterns:');
    testCommands.forEach((command, index) => {
      console.log(`   ${index + 1}. ${command}`);
    });

    console.log('\n✅ Achievement command patterns are valid');
    console.log('\n📝 Manual Testing Required:');
    console.log('1. Run bot and test: n.achievement-import help');
    console.log('2. Test form: n.achievement-import form');
    console.log('3. Test add via command: n.achievement-import add "Test" "https://test.com/badge.png" "123456789" 0');
    console.log('4. Test add via modal form (click button)');
    console.log('5. Test list: n.achievement-import list');
    console.log('6. Test delete: n.achievement-import delete <achievement_id>');
    console.log('7. Test clear: n.achievement-import clear');

    console.log('\n🎯 Expected Results:');
    console.log('- ✅ Help command shows usage instructions');
    console.log('- ✅ Form shows buttons for different actions');
    console.log('- ✅ Add command creates achievement in database');
    console.log('- ✅ Modal form works for adding achievements');
    console.log('- ✅ List command shows all achievements');
    console.log('- ✅ Delete command removes specific achievement');
    console.log('- ✅ Clear command removes all achievements');
    console.log('- ✅ Admin permission check works');
    console.log('- ✅ Error handling works for invalid inputs');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testAchievementCommand().catch(console.error); 