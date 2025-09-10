import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function testBotRestart() {
    try {
        console.log('🔄 Testing Bot Restart...\n');

        // Dừng bot cũ
        console.log('⏹️ Stopping old bot...');
        try {
            await execAsync('pkill -f "tsx watch"');
            console.log('✅ Old bot stopped');
        } catch (error) {
            console.log('ℹ️ No old bot running');
        }

        // Đợi một chút
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Khởi động bot mới
        console.log('🚀 Starting new bot...');
        const { stdout, stderr } = await execAsync('yarn dev', { 
            timeout: 10000,
            killSignal: 'SIGTERM'
        });

        console.log('✅ Bot started successfully');
        console.log('📋 Output:', stdout);
        if (stderr) {
            console.log('⚠️ Warnings:', stderr);
        }

        console.log('\n🎉 Bot Restart Test Complete!');
        console.log('✅ Now test `n.fishbattle skills` in Discord');

    } catch (error) {
        console.error('❌ Error testing bot restart:', error);
    }
}

testBotRestart();
