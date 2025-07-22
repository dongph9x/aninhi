import { BankUI } from '../src/components/MessageComponent/BankUI';
import { BankService } from '../src/utils/bank-service';

async function testBankUI() {
  console.log('🏦 Testing Bank UI Components...\n');

  const testUserId = 'test_user_bank_ui';
  const testGuildId = 'test_guild_bank_ui';

  try {
    // 1. Test tạo bank info embed
    console.log('1. Testing bank info embed...');
    const bankInfoEmbed = BankUI.createBankInfoEmbed(testUserId, testGuildId);
    console.log('✅ Bank info embed created successfully');
    console.log(`   Title: ${bankInfoEmbed.data.title}`);
    console.log(`   Description length: ${bankInfoEmbed.data.description?.length || 0} characters`);

    // 2. Test tạo bank buttons
    console.log('\n2. Testing bank buttons...');
    const bankButtons = BankUI.createBankButtons();
    console.log('✅ Bank buttons created successfully');
    console.log(`   Number of rows: ${bankButtons.length}`);
    console.log(`   Row 1 buttons: ${bankButtons[0].components.length}`);
    console.log(`   Row 2 buttons: ${bankButtons[1].components.length}`);

    // 3. Test tạo rates embed
    console.log('\n3. Testing rates embed...');
    const ratesEmbed = BankUI.createRatesEmbed();
    console.log('✅ Rates embed created successfully');
    console.log(`   Title: ${ratesEmbed.data.title}`);
    console.log(`   Description length: ${ratesEmbed.data.description?.length || 0} characters`);

    // 4. Test tạo amount select menu cho AniCoin
    console.log('\n4. Testing AniCoin amount select menu...');
    const aniSelectMenu = BankUI.createAmountSelectMenu('AniCoin');
    console.log('✅ AniCoin select menu created successfully');
    console.log(`   Custom ID: ${aniSelectMenu.components[0].data.custom_id}`);
    console.log(`   Options count: ${aniSelectMenu.components[0].data.options?.length || 0}`);

    // 5. Test tạo amount select menu cho FishCoin
    console.log('\n5. Testing FishCoin amount select menu...');
    const fishSelectMenu = BankUI.createAmountSelectMenu('FishCoin');
    console.log('✅ FishCoin select menu created successfully');
    console.log(`   Custom ID: ${fishSelectMenu.components[0].data.custom_id}`);
    console.log(`   Options count: ${fishSelectMenu.components[0].data.options?.length || 0}`);

    // 6. Test tính toán chuyển đổi
    console.log('\n6. Testing exchange calculations...');
    const testAmounts = [500, 1000, 2000, 5000];
    
    console.log('✅ Exchange calculations:');
    testAmounts.forEach(amount => {
      const aniToFish = BankService.calculateExchange('AniCoin', amount);
      const fishToAni = BankService.calculateExchange('FishCoin', amount);
      
      console.log(`   ${amount}₳ → ${aniToFish.received}🐟 (Valid: ${aniToFish.isValid})`);
      console.log(`   ${amount}🐟 → ${fishToAni.received}₳ (Valid: ${fishToAni.isValid})`);
    });

    // 7. Test tạo confirm embed
    console.log('\n7. Testing confirm embed...');
    const confirmEmbed = BankUI.createConfirmEmbed('AniCoin', 2000);
    console.log('✅ Confirm embed created successfully');
    console.log(`   Title: ${confirmEmbed.data.title}`);
    console.log(`   Description length: ${confirmEmbed.data.description?.length || 0} characters`);

    // 8. Test tạo confirm buttons
    console.log('\n8. Testing confirm buttons...');
    const confirmButtons = BankUI.createConfirmButtons('AniCoin', 2000);
    console.log('✅ Confirm buttons created successfully');
    console.log(`   Number of rows: ${confirmButtons.length}`);
    console.log(`   Buttons in row: ${confirmButtons[0].components.length}`);

    // 9. Test tạo back button
    console.log('\n9. Testing back button...');
    const backButton = BankUI.createBackButton();
    console.log('✅ Back button created successfully');
    console.log(`   Number of rows: ${backButton.length}`);
    console.log(`   Button custom ID: ${backButton[0].components[0].data.custom_id}`);

    // 10. Test tạo result embed
    console.log('\n10. Testing result embed...');
    const mockResult = {
      success: true,
      fromCurrency: 'AniCoin' as const,
      toCurrency: 'FishCoin' as const,
      amount: 2000,
      received: 1000,
      exchangeRate: 0.5
    };
    const resultEmbed = BankUI.createResultEmbed(mockResult, 'TestUser');
    console.log('✅ Result embed created successfully');
    console.log(`   Title: ${resultEmbed.data.title}`);
    console.log(`   Description length: ${resultEmbed.data.description?.length || 0} characters`);

    // 11. Test select menu options
    console.log('\n11. Testing select menu options...');
    const aniOptions = aniSelectMenu.components[0].data.options || [];
    const fishOptions = fishSelectMenu.components[0].data.options || [];
    
    console.log('✅ AniCoin options:');
    aniOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.label} (${option.value})`);
    });
    
    console.log('✅ FishCoin options:');
    fishOptions.forEach((option, index) => {
      console.log(`   ${index + 1}. ${option.label} (${option.value})`);
    });

    // 12. Test button custom IDs
    console.log('\n12. Testing button custom IDs...');
    const buttonIds = bankButtons.flatMap(row => 
      row.components.map(button => button.data.custom_id)
    );
    
    console.log('✅ Button custom IDs:');
    buttonIds.forEach(id => {
      console.log(`   ${id}`);
    });

    console.log('\n✅ All Bank UI tests completed successfully!');
    console.log('\n📋 Bank UI features:');
    console.log('   🏦 Interactive bank interface');
    console.log('   💰 AniCoin/FishCoin exchange buttons');
    console.log('   📊 Exchange rates display');
    console.log('   📋 Transaction history');
    console.log('   💳 Balance display');
    console.log('   🎯 Amount selection menus');
    console.log('   ✅ Confirmation dialogs');
    console.log('   🔙 Navigation buttons');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBankUI(); 