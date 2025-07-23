import { Client, GatewayIntentBits, AttachmentBuilder } from 'discord.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script để upload file GIF lên Discord và lấy URL
 * Chạy script này để lấy URL của GIF để sử dụng trong animation
 */

async function uploadFishingGif() {
  console.log('🎣 Uploading Fishing GIF to Discord...\n');

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

  // Tạo attachment
  const attachment = new AttachmentBuilder(gifBuffer, { name: 'fishing-animation.gif' });
  
  console.log('\n📋 Instructions:');
  console.log('1. Tạo một channel riêng để upload GIF');
  console.log('2. Upload file fish-shark.gif vào channel đó');
  console.log('3. Click chuột phải vào GIF và chọn "Copy Link"');
  console.log('4. Sử dụng URL đó trong code animation');
  console.log('\n📁 File location:', gifPath);
  console.log('📊 File size:', (gifBuffer.length / 1024).toFixed(2), 'KB');
  
  // Hiển thị thông tin file
  const stats = fs.statSync(gifPath);
  console.log('📅 Created:', stats.birthtime);
  console.log('📅 Modified:', stats.mtime);
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Upload file lên Discord channel');
  console.log('2. Copy URL của GIF');
  console.log('3. Thay thế URL trong fishing.ts');
  console.log('4. Test animation với lệnh n.fishing');
  
  console.log('\n💡 Alternative:');
  console.log('- Có thể sử dụng Giphy hoặc Imgur để upload');
  console.log('- Hoặc tạo Discord bot để tự động upload');
  
  console.log('\n✅ Script completed!');
}

// Chạy script
uploadFishingGif().catch(console.error); 