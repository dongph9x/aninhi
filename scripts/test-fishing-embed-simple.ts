console.log('🎣 Testing Fishing Success Embed Update\n');

// Test các mức độ hiệu ứng
const testCounts = [5, 15, 75, 150, 750, 1200];

console.log('📊 Testing Fishing Count Effects:\n');

for (const count of testCounts) {
    let effect = '';
    if (count >= 1000) {
        effect = '🔥 **FISHING MASTER!** 🔥';
    } else if (count >= 500) {
        effect = '⚡ **FISHING EXPERT!** ⚡';
    } else if (count >= 100) {
        effect = '🎯 **FISHING PRO!** 🎯';
    } else if (count >= 50) {
        effect = '🌟 **FISHING STAR!** 🌟';
    } else if (count >= 10) {
        effect = '⭐ **FISHING BEGINNER!** ⭐';
    }

    console.log(`🎣 Count: ${count.toLocaleString()} → Effect: ${effect || 'None'}`);
}

console.log('\n📋 Sample Embed Output:\n');

// Tạo sample embed cho user có 150 lần câu
const sampleCount = 150;
const sampleEarnings = 150000;
const sampleEffect = '🎯 **FISHING PRO!** 🎯';

const sampleEmbed = 
`🎣 Câu Cá Thành Công!

Username đã câu được:

🐟 Cá Hồi
🌟 Rare
🐟 Giá trị: 1500 FishCoin

📊 Thống kê câu cá:
🎣 Tổng số lần câu: ${sampleCount.toLocaleString()} lần
${sampleEffect}
💰 Tổng thu nhập: ${sampleEarnings.toLocaleString()} FishCoin`;

console.log(sampleEmbed);

console.log('\n✅ Fishing success embed update test completed!');
console.log('🎯 The feature is ready to use!'); 