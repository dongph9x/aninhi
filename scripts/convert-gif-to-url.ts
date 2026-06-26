import * as fs from 'fs';
import * as path from 'path';

/**
 * Script để convert file GIF thành base64 hoặc tạo URL
 */

async function convertGifToUrl() {
  console.log('🎣 Converting GIF to usable format...\n');

  // Đường dẫn đến file GIF
  const gifPath = path.join(__dirname, '../assets/fishing/fish-shark.gif');
  
  // Kiểm tra file có tồn tại không
  if (!fs.existsSync(gifPath)) {
    console.error('❌ File GIF không tồn tại:', gifPath);
    return;
  }

  console.log('📁 File GIF found:', gifPath);
  
  // Đọc file
  const gifBuffer = fs.readFileSync(gifPath);
  console.log('📊 File size:', (gifBuffer.length / 1024).toFixed(2), 'KB');

  // Convert thành base64
  const base64 = gifBuffer.toString('base64');
  const dataUrl = `data:image/gif;base64,${base64}`;
  
  console.log('\n📋 Options to use this GIF:');
  console.log('\n1. 📤 Upload to Discord CDN (Recommended):');
  console.log('   - Upload file lên Discord channel');
  console.log('   - Copy URL từ Discord');
  console.log('   - Use: https://cdn.discordapp.com/attachments/...');
  
  console.log('\n2. 🌐 Upload to Giphy:');
  console.log('   - Go to https://giphy.com/upload');
  console.log('   - Upload fish-shark.gif');
  console.log('   - Copy URL: https://media.giphy.com/media/...');
  
  console.log('\n3. 🖼️ Upload to Imgur:');
  console.log('   - Go to https://imgur.com/upload');
  console.log('   - Upload fish-shark.gif');
  console.log('   - Copy URL: https://i.imgur.com/...');
  
  console.log('\n4. 📄 Data URL (Not recommended for Discord):');
  console.log('   - Size:', (dataUrl.length / 1024).toFixed(2), 'KB');
  console.log('   - Format: data:image/gif;base64,...');
  console.log('   - Note: Discord may not support data URLs');
  
  console.log('\n🎯 Recommended Steps:');
  console.log('1. Upload fish-shark.gif lên Discord channel');
  console.log('2. Click chuột phải vào GIF → Copy Link');
  console.log('3. Thay thế URL trong fishing.ts');
  console.log('4. Test với lệnh n.fishing');
  
  console.log('\n📁 File Info:');
  console.log('   - Path:', gifPath);
  console.log('   - Size:', (gifBuffer.length / 1024).toFixed(2), 'KB');
  console.log('   - Format: GIF');
  console.log('   - Ready for upload');
  
  console.log('\n✅ Conversion completed!');
  console.log('💡 Use Discord CDN URL for best performance');
}

// Chạy script
convertGifToUrl().catch(console.error); 