import fs from 'fs';
import path from 'path';

console.log('📁 Checking Maintenance Mode Storage File\n');

// Check if maintenance storage file exists
const storagePath = path.join(process.cwd(), 'data', 'maintenance-mode.json');

console.log('📋 File Check:');
console.log(`Storage path: ${storagePath}`);
console.log(`File exists: ${fs.existsSync(storagePath)}`);

if (fs.existsSync(storagePath)) {
    try {
        const fileContent = fs.readFileSync(storagePath, 'utf8');
        console.log(`\n📄 File content:`);
        console.log(fileContent);
        
        const parsed = JSON.parse(fileContent);
        console.log(`\n📊 Parsed content:`);
        console.log(`Enabled: ${parsed.enabled}`);
        console.log(`Last Updated: ${parsed.lastUpdated}`);
        console.log(`Updated By: ${parsed.updatedBy}`);
        console.log(`Reason: ${parsed.reason}`);
        
        console.log(`\n🔍 Analysis:`);
        if (parsed.enabled) {
            console.log('✅ File shows maintenance mode is ENABLED');
            console.log('✅ This matches our storage load');
        } else {
            console.log('❌ File shows maintenance mode is DISABLED');
            console.log('❌ This does NOT match our storage load');
        }
    } catch (error) {
        console.log(`❌ Error reading file: ${error}`);
    }
} else {
    console.log('❌ Maintenance storage file does not exist');
    console.log('❌ This might explain why maintenance mode is not working');
}

// Check data directory
const dataDir = path.join(process.cwd(), 'data');
console.log(`\n📁 Data directory check:`);
console.log(`Data dir: ${dataDir}`);
console.log(`Data dir exists: ${fs.existsSync(dataDir)}`);

if (fs.existsSync(dataDir)) {
    const files = fs.readdirSync(dataDir);
    console.log(`Files in data directory: [${files.join(', ')}]`);
}

console.log('\n💡 Possible Issues:');
console.log('1. Bot is not reading from the correct file path');
console.log('2. Bot is using a different storage mechanism');
console.log('3. Bot has not restarted to load new maintenance mode');
console.log('4. Bot is running old code without maintenance mode support');

console.log('\n💡 Solutions:');
console.log('1. Restart the bot');
console.log('2. Check if bot is using the correct file path');
console.log('3. Verify bot is running latest code');
console.log('4. Check bot logs for maintenance mode loading'); 