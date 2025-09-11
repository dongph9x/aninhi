/**
 * 🎨 Battle Visual System
 * Hệ thống hiển thị trực quan cho fishbattle với thanh HP, ảnh cá và stats
 */

import { getMaxLevelForGeneration } from './fish-breeding';

export class BattleVisualSystem {
    /**
     * Tạo thanh HP với Unicode characters
     */
    static createHPBar(currentHP: number, maxHP: number, barLength: number = 20): string {
        try {
            const percentage = Math.max(0, Math.min(100, (currentHP / maxHP) * 100));
            const filledLength = Math.floor((percentage / 100) * barLength);
            const emptyLength = barLength - filledLength;
            
            // Sử dụng Unicode block characters
            const filled = '█'.repeat(filledLength);
            const empty = '░'.repeat(emptyLength);
            
            // Màu sắc dựa trên phần trăm HP
            let color = '';
            if (percentage >= 70) color = '🟢'; // Xanh lá
            else if (percentage >= 40) color = '🟡'; // Vàng
            else if (percentage >= 20) color = '🟠'; // Cam
            else color = '🔴'; // Đỏ
            
            return `${color} ${filled}${empty} ${Math.floor(percentage)}%`;
        } catch (error) {
            console.error('Error creating HP bar:', error);
            return `🔴 ░░░░░░░░░░░░░░░░░░░░ 0%`;
        }
    }

    /**
     * Tạo thanh MP (Mana/Energy) với Unicode characters
     */
    static createMPBar(currentMP: number, maxMP: number, barLength: number = 15): string {
        const percentage = Math.max(0, Math.min(100, (currentMP / maxMP) * 100));
        const filledLength = Math.floor((percentage / 100) * barLength);
        const emptyLength = barLength - filledLength;
        
        const filled = '▓'.repeat(filledLength);
        const empty = '░'.repeat(emptyLength);
        
        return `🔵 ${filled}${empty} ${Math.floor(percentage)}%`;
    }

    /**
     * Tạo thanh EXP với Unicode characters
     */
    static createExpBar(currentExp: number, maxExp: number, barLength: number = 12): string {
        const percentage = Math.max(0, Math.min(100, (currentExp / maxExp) * 100));
        const filledLength = Math.floor((percentage / 100) * barLength);
        const emptyLength = barLength - filledLength;
        
        const filled = '▰'.repeat(filledLength);
        const empty = '▱'.repeat(emptyLength);
        
        return `⭐ ${filled}${empty} ${Math.floor(percentage)}%`;
    }

    /**
     * Tạo visual stats display với progress bars
     */
    static createStatsDisplay(stats: any): string {
        const maxStat = 100; // Giả định max stat là 100
        const barLength = 8;
        
        const strengthBar = this.createStatBar(stats.strength || 0, maxStat, barLength, '💪');
        const agilityBar = this.createStatBar(stats.agility || 0, maxStat, barLength, '🏃');
        const intelligenceBar = this.createStatBar(stats.intelligence || 0, maxStat, barLength, '🧠');
        const defenseBar = this.createStatBar(stats.defense || 0, maxStat, barLength, '🛡️');
        const luckBar = this.createStatBar(stats.luck || 0, maxStat, barLength, '🍀');
        const accuracyBar = this.createStatBar(stats.accuracy || 0, maxStat, barLength, '🎯');
        
        return [
            strengthBar,
            agilityBar,
            intelligenceBar,
            defenseBar,
            luckBar,
            accuracyBar
        ].join('\n');
    }

    /**
     * Tạo visual stats display với box format
     */
    static createStatsBox(stats: any): string {
        const maxStat = 100;
        const barLength = 10;
        
        let display = `══════════════════════════════════════\n`;
        display += `           📊 STATS DISPLAY 📊       \n`;
        display += `══════════════════════════════════════\n`;
        display += `                                                              \n`;
        
        // Row 1: Strength, Agility, Intelligence
        const strengthBar = this.createStatBar(stats.strength || 0, maxStat, barLength, '💪');
        const agilityBar = this.createStatBar(stats.agility || 0, maxStat, barLength, '🏃');
        const intelligenceBar = this.createStatBar(stats.intelligence || 0, maxStat, barLength, '🧠');
        
        display += `  ${strengthBar.padEnd(25)} ${agilityBar.padEnd(25)}  \n`;
        display += `  ${intelligenceBar.padEnd(25)}                                 \n`;
        display += `                                                              \n`;
        
        // Row 2: Defense, Luck, Accuracy
        const defenseBar = this.createStatBar(stats.defense || 0, maxStat, barLength, '🛡️');
        const luckBar = this.createStatBar(stats.luck || 0, maxStat, barLength, '🍀');
        const accuracyBar = this.createStatBar(stats.accuracy || 0, maxStat, barLength, '🎯');
        
        display += `  ${defenseBar.padEnd(25)} ${luckBar.padEnd(25)}  \n`;
        display += `  ${accuracyBar.padEnd(25)}                                 \n`;
        display += `                                                              \n`;
        
        // Total power
        const totalPower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + 
                          (stats.defense || 0) + (stats.luck || 0) + (stats.accuracy || 0);
        display += `  💪 **TỔNG SỨC MẠNH:** ${totalPower.toString().padEnd(35)}  \n`;
        display += `                                                              \n`;
        display += `══════════════════════════════════════`;
        
        return display;
    }

    /**
     * Tạo visual comparison stats với layout 2 cột
     */
    static createStatsComparison(userStats: any, opponentStats: any): string {
        const maxStat = 100;
        const barLength = 8;
        
        let display = `══════════════════════════════════════\n`;
        display += `           📊 STATS COMPARISON 📊       \n`;
        display += `══════════════════════════════════════\n`;
        display += `                                                              \n`;
        
        // Row 1: Strength vs Agility
        const userStrength = userStats.strength || 0;
        const opponentStrength = opponentStats.strength || 0;
        const strengthDiff = userStrength - opponentStrength;
        const strengthResult = strengthDiff > 0 ? '🟢' : strengthDiff < 0 ? '🔴' : '⚪';
        
        const userAgility = userStats.agility || 0;
        const opponentAgility = opponentStats.agility || 0;
        const agilityDiff = userAgility - opponentAgility;
        const agilityResult = agilityDiff > 0 ? '🟢' : agilityDiff < 0 ? '🔴' : '⚪';
        
        display += `  💪 **Sức mạnh:** ${userStrength.toString().padEnd(3)} vs ${opponentStrength.toString().padEnd(3)} ${strengthResult}  🏃 **Thể lực:** ${userAgility.toString().padEnd(3)} vs ${opponentAgility.toString().padEnd(3)} ${agilityResult}  \n`;
        display += `      ${this.createStatBar(userStrength, maxStat, barLength, '')} vs ${this.createStatBar(opponentStrength, maxStat, barLength, '')}      ${this.createStatBar(userAgility, maxStat, barLength, '')} vs ${this.createStatBar(opponentAgility, maxStat, barLength, '')}  \n`;
        display += `                                                              \n`;
        
        // Row 2: Intelligence vs Defense
        const userIntelligence = userStats.intelligence || 0;
        const opponentIntelligence = opponentStats.intelligence || 0;
        const intelligenceDiff = userIntelligence - opponentIntelligence;
        const intelligenceResult = intelligenceDiff > 0 ? '🟢' : intelligenceDiff < 0 ? '🔴' : '⚪';
        
        const userDefense = userStats.defense || 0;
        const opponentDefense = opponentStats.defense || 0;
        const defenseDiff = userDefense - opponentDefense;
        const defenseResult = defenseDiff > 0 ? '🟢' : defenseDiff < 0 ? '🔴' : '⚪';
        
        display += `  🧠 **Trí tuệ:** ${userIntelligence.toString().padEnd(3)} vs ${opponentIntelligence.toString().padEnd(3)} ${intelligenceResult}  🛡️ **Phòng thủ:** ${userDefense.toString().padEnd(3)} vs ${opponentDefense.toString().padEnd(3)} ${defenseResult}  \n`;
        display += `      ${this.createStatBar(userIntelligence, maxStat, barLength, '')} vs ${this.createStatBar(opponentIntelligence, maxStat, barLength, '')}      ${this.createStatBar(userDefense, maxStat, barLength, '')} vs ${this.createStatBar(opponentDefense, maxStat, barLength, '')}  \n`;
        display += `                                                              \n`;
        
        // Row 3: Luck vs Accuracy
        const userLuck = userStats.luck || 0;
        const opponentLuck = opponentStats.luck || 0;
        const luckDiff = userLuck - opponentLuck;
        const luckResult = luckDiff > 0 ? '🟢' : luckDiff < 0 ? '🔴' : '⚪';
        
        const userAccuracy = userStats.accuracy || 0;
        const opponentAccuracy = opponentStats.accuracy || 0;
        const accuracyDiff = userAccuracy - opponentAccuracy;
        const accuracyResult = accuracyDiff > 0 ? '🟢' : accuracyDiff < 0 ? '🔴' : '⚪';
        
        display += `  🍀 **May mắn:** ${userLuck.toString().padEnd(3)} vs ${opponentLuck.toString().padEnd(3)} ${luckResult}  🎯 **Chính xác:** ${userAccuracy.toString().padEnd(3)} vs ${opponentAccuracy.toString().padEnd(3)} ${accuracyResult}  \n`;
        display += `      ${this.createStatBar(userLuck, maxStat, barLength, '')} vs ${this.createStatBar(opponentLuck, maxStat, barLength, '')}      ${this.createStatBar(userAccuracy, maxStat, barLength, '')} vs ${this.createStatBar(opponentAccuracy, maxStat, barLength, '')}  \n`;
        display += `                                                              \n`;
        
        // Total power comparison
        const userTotalPower = userStrength + userAgility + userIntelligence + 
                              userDefense + userLuck + userAccuracy;
        const opponentTotalPower = opponentStrength + opponentAgility + opponentIntelligence + 
                                  opponentDefense + opponentLuck + opponentAccuracy;
        const totalDiff = userTotalPower - opponentTotalPower;
        const totalResult = totalDiff > 0 ? '🟢' : totalDiff < 0 ? '🔴' : '⚪';
        
        display += `  💪 **TỔNG SỨC MẠNH:** ${userTotalPower.toString().padEnd(3)} vs ${opponentTotalPower.toString().padEnd(3)} ${totalResult}                    \n`;
        display += `                                                             \n`;
        display += `══════════════════════════════════════`;
        
        return display;
    }

    /**
     * Tạo thanh stat riêng lẻ
     */
    private static createStatBar(value: number, maxValue: number, barLength: number, emoji: string): string {
        const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));
        const filledLength = Math.floor((percentage / 100) * barLength);
        const emptyLength = barLength - filledLength;
        
        const filled = '▰'.repeat(filledLength);
        const empty = '▱'.repeat(emptyLength);
        
        return `${emoji} ${filled}${empty} ${value}`;
    }

    /**
     * Tạo visual fish display với emoji và thông tin
     */
    static createFishDisplay(fish: any, isSelected: boolean = false): string {
        try {
            const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
            const rarityEmoji = this.getRarityEmoji(fish.rarity || 'common');
            const levelEmoji = this.getLevelEmoji(fish.level || 1, fish.generation || 1);
            const fishEmoji = this.getFishEmoji(fish.name || 'Unknown');
            
            let display = `${fishEmoji} ${rarityEmoji} **${fish.name || 'Unknown'}** ${levelEmoji}\n`;
            display += `📊 **Level:** ${fish.level || 1} | **Gen:** ${fish.generation || 1} | **Power:** ${this.calculatePower(fish)}\n`;
            
            if (isSelected) {
                display += `🎯 **ĐÃ CHỌN CHO TRẬN ĐẤU**\n`;
            }
            
            return display;
        } catch (error) {
            console.error('Error creating fish display:', error);
            return `🐟 **${fish.name || 'Unknown'}** (Lv.${fish.level || 1})`;
        }
    }

    /**
     * Tạo visual fish display chi tiết với stats
     */
    static createDetailedFishDisplay(fish: any, isSelected: boolean = false): string {
        const fishEmoji = this.getFishEmoji(fish.name);
        const rarityEmoji = this.getRarityEmoji(fish.rarity);
        const levelEmoji = this.getLevelEmoji(fish.level, fish.generation || 1);
        const statusEmoji = fish.status === 'adult' ? '🐟' : '🐠';
        
        let display = `  ${fishEmoji} ${fish.name} ${rarityEmoji}                    \n`;
        display += `                                                              \n`;
        display += `  ${statusEmoji} **Trạng thái:** ${fish.status === 'adult' ? 'Trưởng thành' : 'Đang lớn'}                    \n`;
        display += `  ${levelEmoji} **Level:** ${fish.level} | **Gen:** ${fish.generation} | **Power:** ${this.calculatePower(fish)}  \n`;
        display += `  💰 **Giá trị:** ${Number(fish.value).toLocaleString()} FishCoin                    \n`;
        display += `                                                              \n`;
        
        // Stats display
        const stats = fish.stats || {};
        display += `  📊 **STATS:**                                                \n`;
        display += `  💪 Sức mạnh: ${(stats.strength || 0).toString().padEnd(3)} 🏃 Thể lực: ${(stats.agility || 0).toString().padEnd(3)} 🧠 Trí tuệ: ${(stats.intelligence || 0).toString().padEnd(3)}  \n`;
        display += `  🛡️ Phòng thủ: ${(stats.defense || 0).toString().padEnd(3)} 🍀 May mắn: ${(stats.luck || 0).toString().padEnd(3)} 🎯 Chính xác: ${(stats.accuracy || 0).toString().padEnd(3)}  \n`;
        display += `                                                              \n`;
        
        if (isSelected) {
            display += `  🎯 **ĐÃ CHỌN CHO TRẬN ĐẤU**                              \n`;
        }
        
        return display;
    }

    /**
     * Tạo khung cho cá của bạn
     */
    static createUserFishFrame(userFish: any, userHP: number, userMaxHP: number, userHPBar: string, userHPPercent: number, userPower: number, userStats: any): string {
        return `
══════════════════════════════════════
            🐟 CÁ CỦA BẠN              
                                      
  ${this.getFishEmoji(userFish.name)} ${userFish.name.padEnd(25)}  
  Lv.${userFish.level} Gen.${userFish.generation} Power:${userPower.toString().padEnd(3)}       
                                      
  ❤️ HP: ${userHPBar.padEnd(25)}    
  💯 ${userHPPercent}% (${userHP}/${userMaxHP})                
                                      
  📊 **STATS:**                       
  💪${(userStats.strength || 0).toString().padEnd(3)} 🏃${(userStats.agility || 0).toString().padEnd(3)} 🧠${(userStats.intelligence || 0).toString().padEnd(3)}    
  🛡️${(userStats.defense || 0).toString().padEnd(3)} 🍀${(userStats.luck || 0).toString().padEnd(3)} 🎯${(userStats.accuracy || 0).toString().padEnd(3)}  
                                      
══════════════════════════════════════`;
    }

    /**
     * Tạo khung cho cá đối thủ
     */
    static createOpponentFishFrame(opponentFish: any, opponentHP: number, opponentMaxHP: number, opponentHPBar: string, opponentHPPercent: number, opponentPower: number, opponentStats: any): string {
        return `
            🐟 ĐỐI THỦ               
══════════════════════════════════════
                                      
  ${this.getFishEmoji(opponentFish.name)} ${opponentFish.name.padEnd(25)}  
  Lv.${opponentFish.level} Gen.${opponentFish.generation} Power:${opponentPower.toString().padEnd(3)}       
                                      
  ❤️ HP: ${opponentHPBar.padEnd(25)}    
  💯 ${opponentHPPercent}% (${opponentHP}/${opponentMaxHP})                
                                      
  📊 **STATS:**                       
  💪${(opponentStats.strength || 0).toString().padEnd(3)} 🏃${(opponentStats.agility || 0).toString().padEnd(3)} 🧠${(opponentStats.intelligence || 0).toString().padEnd(3)}    
  🛡️${(opponentStats.defense || 0).toString().padEnd(3)} 🍀${(opponentStats.luck || 0).toString().padEnd(3)} 🎯${(opponentStats.accuracy || 0).toString().padEnd(3)}  
                                      
══════════════════════════════════════`;
    }

    /**
     * Xếp 2 khung theo chiều dọc (dữ liệu của bạn ở trên, đối thủ ở dưới)
     */
    static combineFrames(userFrame: string, opponentFrame: string): string {
        // Xếp dọc: khung của bạn ở trên, khung đối thủ ở dưới
        return userFrame.trim() + '\n' + opponentFrame.trim();
    }

    /**
     * Tạo visual battle arena với 2 khung riêng biệt
     */
    static createBattleArena(userFish: any, opponentFish: any, userHP: number, opponentHP: number): string {
        try {
            const userMaxHP = this.calculateMaxHP(userFish);
            const opponentMaxHP = this.calculateMaxHP(opponentFish);
            
            const userHPBar = this.createHPBar(userHP, userMaxHP, 9);
            const opponentHPBar = this.createHPBar(opponentHP, opponentMaxHP, 9);
            
            const userPower = this.calculatePower(userFish);
            const opponentPower = this.calculatePower(opponentFish);
            
            const userStats = userFish.stats || {};
            const opponentStats = opponentFish.stats || {};
            
            // Tính phần trăm HP
            const userHPPercent = Math.floor((userHP / userMaxHP) * 100);
            const opponentHPPercent = Math.floor((opponentHP / opponentMaxHP) * 100);
            
            // Tạo 2 khung riêng biệt
            const userFrame = this.createUserFishFrame(userFish, userHP, userMaxHP, userHPBar, userHPPercent, userPower, userStats);
            const opponentFrame = this.createOpponentFishFrame(opponentFish, opponentHP, opponentMaxHP, opponentHPBar, opponentHPPercent, opponentPower, opponentStats);
            
            // Ghép 2 khung lại với nhau
            return this.combineFrames(userFrame, opponentFrame);
        } catch (error) {
            console.error('Error creating battle arena:', error);
            return `❌ Lỗi hiển thị battle arena: ${error}`;
        }
    }

    /**
     * Tạo visual battle result
     */
    static createBattleResult(result: any, isUserWinner: boolean): string {
        const winnerEmoji = isUserWinner ? '🏆' : '💀';
        const resultColor = isUserWinner ? '🟢' : '🔴';
        const winnerFishEmoji = this.getFishEmoji(result.winner.name);
        const loserFishEmoji = this.getFishEmoji(result.loser.name);
        
        let display = `
══════════════════════════════════════
${winnerEmoji} BATTLE RESULT ${winnerEmoji}
══════════════════════════════════════
                                                              
  ${resultColor} **${isUserWinner ? 'CHIẾN THẮNG!' : 'THẤT BẠI!'}** ${resultColor}                    
                                                              
  🏆 **Người thắng:** ${winnerFishEmoji} ${result.winner.name.padEnd(35)}  
  💀 **Người thua:** ${loserFishEmoji} ${result.loser.name.padEnd(36)}  
  💰 **Phần thưởng:** ${result.rewards.winner.toLocaleString().padEnd(35)} FishCoin  
  💪 **Sức mạnh:** ${result.winnerPower} vs ${result.loserPower}                    
                                                              
`;
        
        // Thêm thông tin HP cuối cùng nếu có
        if (result.finalHP) {
            const winnerHP = result.finalHP.winner;
            const loserHP = result.finalHP.loser;
            display += `  ❤️ **HP Người thắng:** ${winnerHP.current}/${winnerHP.max} (${winnerHP.percentage}%)                    \n`;
            display += `  💔 **HP Người thua:** ${loserHP.current}/${loserHP.max} (${loserHP.percentage}%)                    \n`;
            display += `                                                               \n`;
        }
        
        display += `══════════════════════════════════════`;
        
        return display;
    }

    /**
     * Tạo visual battle result tóm tắt (không hiển thị full log)
     */
    static createSummaryBattleResult(result: any, isUserWinner: boolean, battleId?: string): string {
        try {
            const winnerEmoji = isUserWinner ? '🏆' : '💀';
            const resultColor = isUserWinner ? '🟢' : '🔴';
            const winnerFishEmoji = this.getFishEmoji(result.winner.name || 'Unknown');
            const loserFishEmoji = this.getFishEmoji(result.loser.name || 'Unknown');
            
            let display = `══════════════════════════════════════\n`;
            display += `   ${winnerEmoji} BATTLE RESULT ${winnerEmoji} \n`;
            display += `══════════════════════════════════════\n`;
            display += `                                                              \n`;
            display += `  ${resultColor} **${isUserWinner ? 'CHIẾN THẮNG!' : 'THẤT BẠI!'}** ${resultColor}\n`;
            display += `                                                              \n`;
            
            // Winner and loser info
            display += `  🏆 **Người thắng:** ${winnerFishEmoji} ${(result.winner.name || 'Unknown').padEnd(35)}  \n`;
            display += `  💀 **Người thua:** ${loserFishEmoji} ${(result.loser.name || 'Unknown').padEnd(36)}  \n`;
            display += `                                                              \n`;
            
            // Power comparison
            display += `  💪 **Sức mạnh:** ${result.winnerPower || 0} vs ${result.loserPower || 0}                    \n`;
            display += `  📊 **Chênh lệch:** ${Math.abs((result.winnerPower || 0) - (result.loserPower || 0))}                    \n`;
            display += `                                                              \n`;
            
            // HP cuối cùng
            if (result.finalHP) {
                const winnerHP = result.finalHP.winner;
                const loserHP = result.finalHP.loser;
                display += `  ❤️ **HP Người thắng:** ${winnerHP.current}/${winnerHP.max} (${winnerHP.percentage}%)                    \n`;
                display += `  💔 **HP Người thua:** ${loserHP.current}/${loserHP.max} (${loserHP.percentage}%)                    \n`;
                display += `                                                              \n`;
            }
            
            // Rewards
            display += `  💰 **Phần thưởng người thắng:** ${(result.rewards?.winner || 0).toLocaleString().padEnd(25)} FishCoin  \n`;
            display += `  💰 **Phần thưởng người thua:** ${(result.rewards?.loser || 0).toLocaleString().padEnd(26)} FishCoin  \n`;
            display += `                                                              \n`;
            
            // Battle summary thay vì full log
            display += `  📝 **TÓM TẮT TRẬN ĐẤU:**                                    \n`;
            display += `  ${winnerEmoji} ${result.winner.name} đã chiến thắng!                    \n`;
            display += `  💪 Sức mạnh: ${result.winnerPower} vs ${result.loserPower}                    \n`;
            display += `  💰 Phần thưởng: ${result.rewards.winner.toLocaleString()} FishCoin                    \n`;
            if (battleId) {
                display += `  🔍 Sử dụng button "Xem chi tiết" để xem log đầy đủ                    \n`;
            }
            display += `                                                              \n`;
            
            display += `══════════════════════════════════════`;
            
            return display;
        } catch (error) {
            console.error('Error creating summary battle result:', error);
            return `❌ Lỗi hiển thị kết quả trận đấu: ${error}`;
        }
    }

    /**
     * Tạo detailed battle log để hiển thị khi user click "Xem chi tiết"
     */
    static createDetailedBattleLog(battleLog: string[]): string {
        try {
            let display = `📜 **CHI TIẾT TRẬN ĐẤU**\n`;
            display += `══════════════════════════════════════\n\n`;
            
            if (battleLog && battleLog.length > 0) {
                battleLog.forEach((logLine, index) => {
                    display += `${logLine}\n`;
                });
            } else {
                display += `Không có thông tin chi tiết về trận đấu.\n`;
            }
            
            display += `\n══════════════════════════════════════`;
            
            return display;
        } catch (error) {
            console.error('Error creating detailed battle log:', error);
            return `❌ Lỗi hiển thị chi tiết trận đấu: ${error}`;
        }
    }


    /**
     * Helper methods
     */
    private static getRarityEmoji(rarity: string): string {
        switch (rarity) {
            case 'common': return '⚪';
            case 'rare': return '🔵';
            case 'epic': return '🟣';
            case 'legendary': return '🟡';
            default: return '⚪';
        }
    }

    private static getFishEmoji(fishName: string): string {
        // Mapping cá với emoji phù hợp
        const fishEmojiMap: { [key: string]: string } = {
            // Cá thường
            'Cá rô phi': '🐟',
            'Cá chép': '🐟',
            'Cá trắm cỏ': '🐟',
            'Cá mè hoa': '🐟',
            'Cá diếc': '🐟',
            'Cá trôi Ấn Độ': '🐟',
            'Cá mè vinh': '🐟',
            'Cá rô đồng': '🐟',
            'Cá chạch': '🐟',
            'Cá trê phi': '🐟',
            'Cá rô phi đen': '🐟',
            'Cá mè trắng': '🐟',
            'Cá chép koi': '🐟',
            'Cá vàng': '🐟',
            
            // Tôm cua
            'Tôm sú': '🦐',
            'Tôm hùm': '🦞',
            'Cua biển': '🦀',
            'Ghẹ xanh': '🦀',
            'Mực ống': '🦑',
            'Ốc hương': '🐚',
            'Ốc móng tay': '🐚',
            
            // Cá hiếm
            'Cá lóc': '🐡',
            'Cá trê đen': '🐠',
            'Cá quả': '🐠',
            'Cá chình điện': '🐠',
            'Cá rô phi sọc': '🐠',
            'Cá chép trắng': '🐠',
            'Cá trắm đen': '🐠',
            'Cá rô đồng lớn': '🐠',
            'Cá chạch bùn': '🐠',
            'Cá trê phi đen': '🐠',
            'Cá rô phi đỏ': '🐠',
            'Cá mè trắng lớn': '🐠',
            'Tôm hùm đỏ': '🦞',
            'Cua hoàng đế': '🦀',
            'Mực khổng lồ': '🦑',
            'Ốc vòi voi': '🐚',
            
            // Cá quý hiếm
            'Cá tầm': '🦈',
            'Cá hồi Đại Tây Dương': '🦈',
            'Cá ngừ vây xanh': '🐋',
            'Cá mập trắng': '🦈',
            'Cá lóc khổng lồ': '🦈',
            'Cá trê khổng lồ': '🦈',
            'Cá quả khổng lồ': '🦈',
            'Cá chình điện khổng lồ': '🦈',
            'Cá rô phi khổng lồ': '🦈',
            'Cá chép khổng lồ': '🦈',
            'Cá trắm khổng lồ': '🦈',
            'Cá mè khổng lồ': '🦈',
            'Cá rô đồng khổng lồ': '🦈',
            'Cá chạch khổng lồ': '🦈',
            
            // Cá huyền thoại
            'Cá voi xanh': '🐳',
            'Cá mực khổng lồ': '🦑',
            'Cá rồng biển': '🐉',
            'Cá thần biển': '🧜',
            'Vua biển': '🔱',
            'Cá rồng nước ngọt': '🐉',
            'Cá thần nước ngọt': '🧜‍♂️',
            'Vua nước ngọt': '👑'
        };
        
        return fishEmojiMap[fishName] || '🐟';
    }

    private static getLevelEmoji(level: number, generation: number = 1): string {
        const maxLevel = getMaxLevelForGeneration(generation);
        if (level >= maxLevel * 0.8) return '🌟'; // 80% of max level
        if (level >= maxLevel * 0.6) return '⭐'; // 60% of max level
        if (level >= maxLevel * 0.4) return '✨'; // 40% of max level
        if (level >= maxLevel * 0.2) return '💫'; // 20% of max level
        return '🔸';
    }

    private static calculatePower(fish: any): number {
        try {
            const stats = fish.stats || {};
            return (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + 
                   (stats.defense || 0) + (stats.luck || 0) + (stats.accuracy || 0);
        } catch (error) {
            console.error('Error calculating power:', error);
            return 0;
        }
    }

    private static calculateMaxHP(fish: any): number {
        try {
            const baseHP = 1000;
            const levelBonus = (fish.level || 1) * 10;
            const defenseBonus = (fish.stats?.defense || 0) * 5;
            return baseHP + levelBonus + defenseBonus;
        } catch (error) {
            console.error('Error calculating max HP:', error);
            return 100;
        }
    }

    /**
     * Tạo khung cho cá của bạn (multi-round)
     */
    static createUserFishFrameMultiRound(userFish: any, roundData: any, userHPBar: string, userHPPercent: number, userPower: number, userStats: any): string {
        return `
══════════════════════════════════════
            🐟 CÁ CỦA BẠN              
                                      
  ${this.getFishEmoji(userFish.name)} ${userFish.name.padEnd(25)}  
  Lv.${userFish.level} Gen.${userFish.generation} Power:${userPower.toString().padEnd(3)}       
                                      
  ❤️ HP: ${userHPBar.padEnd(25)}    
  💯 ${userHPPercent}% (${roundData.userHP}/${roundData.userMaxHP})                
                                      
  📊 **STATS:**                       
  💪${(userStats.strength || 0).toString().padEnd(3)} 🏃${(userStats.agility || 0).toString().padEnd(3)} 🧠${(userStats.intelligence || 0).toString().padEnd(3)}    
  🛡️${(userStats.defense || 0).toString().padEnd(3)} 🍀${(userStats.luck || 0).toString().padEnd(3)} 🎯${(userStats.accuracy || 0).toString().padEnd(3)}  
                                    
══════════════════════════════════════`;
    }

    /**
     * Tạo khung cho cá đối thủ (multi-round)
     */
    static createOpponentFishFrameMultiRound(opponentFish: any, roundData: any, opponentHPBar: string, opponentHPPercent: number, opponentPower: number, opponentStats: any): string {
        return `
            🐟 ĐỐI THỦ               
══════════════════════════════════════
                                      
  ${this.getFishEmoji(opponentFish.name)} ${opponentFish.name.padEnd(25)}  
  Lv.${opponentFish.level} Gen.${opponentFish.generation} Power:${opponentPower.toString().padEnd(3)}       
                                      
  ❤️ HP: ${opponentHPBar.padEnd(25)}    
  💯 ${opponentHPPercent}% (${roundData.opponentHP}/${roundData.opponentMaxHP})                
                                      
  📊 **STATS:**                       
  💪${(opponentStats.strength || 0).toString().padEnd(3)} 🏃${(opponentStats.agility || 0).toString().padEnd(3)} 🧠${(opponentStats.intelligence || 0).toString().padEnd(3)}    
  🛡️${(opponentStats.defense || 0).toString().padEnd(3)} 🍀${(opponentStats.luck || 0).toString().padEnd(3)} 🎯${(opponentStats.accuracy || 0).toString().padEnd(3)}  
                                      
══════════════════════════════════════`;
    }

    /**
     * Tạo visual cho battle với nhiều hiệp - layout 2 khung riêng biệt
     */
    static createMultiRoundBattle(userFish: any, opponentFish: any, rounds: Array<{
        round: number;
        userHP: number;
        opponentHP: number;
        userMaxHP: number;
        opponentMaxHP: number;
        action: string;
    }>): string {
        try {
            let display = '';
            
            for (const roundData of rounds) {
                const userHPBar = this.createHPBar(roundData.userHP, roundData.userMaxHP, 9);
                const opponentHPBar = this.createHPBar(roundData.opponentHP, roundData.opponentMaxHP, 9);
                
                const userPower = this.calculatePower(userFish);
                const opponentPower = this.calculatePower(opponentFish);
                
                const userStats = userFish.stats || {};
                const opponentStats = opponentFish.stats || {};
                
                // Tính phần trăm HP
                const userHPPercent = Math.floor((roundData.userHP / roundData.userMaxHP) * 100);
                const opponentHPPercent = Math.floor((roundData.opponentHP / roundData.opponentMaxHP) * 100);
                
                // Tạo 2 khung riêng biệt cho mỗi hiệp
                const userFrame = this.createUserFishFrameMultiRound(userFish, roundData, userHPBar, userHPPercent, userPower, userStats);
                const opponentFrame = this.createOpponentFishFrameMultiRound(opponentFish, roundData, opponentHPBar, opponentHPPercent, opponentPower, opponentStats);
                
                // Ghép 2 khung lại với nhau
                const combinedFrames = this.combineFrames(userFrame, opponentFrame);
                
                display += `
══════════════════════════════════════
      ⚔️ HIỆP ${roundData.round} ⚔️               
${combinedFrames}
                                                             
  📝 **Hành động:** \n ${roundData.action.padEnd(50)}           
                                                            
══════════════════════════════════════
                `;
            }
            
            return display;
        } catch (error) {
            console.error('Error creating multi-round battle:', error);
            return `❌ Lỗi hiển thị battle nhiều hiệp: ${error}`;
        }
    }

    /**
     * Tạo battle animation với logic HP thực tế (đồng bộ với battle system)
     */
    static createBattleAnimation(userFish: any, opponentFish: any, userMaxHP: number, opponentMaxHP: number): Array<{
        round: number;
        userHP: number;
        opponentHP: number;
        userMaxHP: number;
        opponentMaxHP: number;
        action: string;
    }> {
        try {
            const rounds = [];
            let userHP = userMaxHP;
            let opponentHP = opponentMaxHP;
            let roundNumber = 1;
            
            // Tính sức mạnh để tính damage (tương tự như battle thực tế)
            const userTotalPower = this.calculateFishPower(userFish);
            const opponentTotalPower = this.calculateFishPower(opponentFish);
            
            const maxRounds = 10; // Giới hạn tối đa 10 hiệp
            
            while (userHP > 0 && opponentHP > 0 && roundNumber <= maxRounds) {
                // Tính damage dựa trên sức mạnh (điều chỉnh để battle kết thúc khi HP về 0)
                const userBaseDamage = Math.floor((userTotalPower / 8) * (0.8 + Math.random() * 0.4)); // 80-120% của base damage
                const opponentBaseDamage = Math.floor((opponentTotalPower / 8) * (0.8 + Math.random() * 0.4));
                
                // Tính khả năng né tránh dựa trên Agility và Intelligence
                const userAgility = userFish.stats?.agility || 0;
                const opponentAgility = opponentFish.stats?.agility || 0;
                const userIntelligence = userFish.stats?.intelligence || 0;
                const opponentIntelligence = opponentFish.stats?.intelligence || 0;
                
                // Khả năng né tránh: 0-40% dựa trên Agility (70%) + Intelligence (30%)
                const userDodgeChance = Math.min(0.4, (userAgility * 0.7 + userIntelligence * 0.3) / 1000); // Tối đa 40%
                const opponentDodgeChance = Math.min(0.4, (opponentAgility * 0.7 + opponentIntelligence * 0.3) / 1000);
                
                // Kiểm tra né tránh
                const userDodges = Math.random() < userDodgeChance;
                const opponentDodges = Math.random() < opponentDodgeChance;
                
                // Tính damage thực tế sau khi né tránh
                let userDamage = userDodges ? Math.floor(userBaseDamage * 0.3) : userBaseDamage; // Né tránh giảm 70% damage
                let opponentDamage = opponentDodges ? Math.floor(opponentBaseDamage * 0.3) : opponentBaseDamage;
                
                // Áp dụng Defense để giảm damage nhận vào
                const userDefense = userFish.stats?.defense || 0;
                const opponentDefense = opponentFish.stats?.defense || 0;
                
                // Defense giảm damage: 0-25% dựa trên Defense
                const userDefenseReduction = Math.min(0.25, userDefense / 1000); // Tối đa 25%
                const opponentDefenseReduction = Math.min(0.25, opponentDefense / 1000);
                
                // Áp dụng defense reduction cho damage nhận vào
                userDamage = Math.floor(userDamage * (1 - opponentDefenseReduction));
                opponentDamage = Math.floor(opponentDamage * (1 - userDefenseReduction));
                
                // Tính khả năng critical hit dựa trên Luck
                const userLuck = userFish.stats?.luck || 0;
                const opponentLuck = opponentFish.stats?.luck || 0;
                
                // Critical hit chance: 0-20% dựa trên Luck
                const userCritChance = Math.min(0.2, userLuck / 1000); // Tối đa 20%
                const opponentCritChance = Math.min(0.2, opponentLuck / 1000);
                
                // Kiểm tra critical hit
                const userCrits = Math.random() < userCritChance;
                const opponentCrits = Math.random() < opponentCritChance;
                
                // Áp dụng critical damage (x2) nếu crit
                if (userCrits) {
                    userDamage = Math.floor(userDamage * 2); // Critical damage x2
                }
                if (opponentCrits) {
                    opponentDamage = Math.floor(opponentDamage * 2); // Critical damage x2
                }
                
                // Tính khả năng hit dựa trên Accuracy
                const userAccuracy = userFish.stats?.accuracy || 0;
                const opponentAccuracy = opponentFish.stats?.accuracy || 0;
                
                // Hit chance: 70-100% dựa trên Accuracy (tối thiểu 70% để không miss quá nhiều)
                const userHitChance = Math.min(1.0, 0.7 + (userAccuracy / 1000)); // 70-100%
                const opponentHitChance = Math.min(1.0, 0.7 + (opponentAccuracy / 1000));
                
                // Kiểm tra hit/miss
                const userHits = Math.random() < userHitChance;
                const opponentHits = Math.random() < opponentHitChance;
                
                // Áp dụng miss (damage = 0) nếu miss
                if (!userHits) {
                    userDamage = 0; // Miss = 0 damage
                }
                if (!opponentHits) {
                    opponentDamage = 0; // Miss = 0 damage
                }
                
                // Xác định thứ tự tấn công dựa trên Agility
                const userAttacksFirst = userAgility >= opponentAgility;
                
                // Áp dụng damage theo thứ tự tấn công
                if (userAttacksFirst) {
                    // User tấn công trước
                    opponentHP = Math.max(0, opponentHP - userDamage);
                    if (opponentHP > 0) {
                        userHP = Math.max(0, userHP - opponentDamage);
                    }
                } else {
                    // Opponent tấn công trước
                    userHP = Math.max(0, userHP - opponentDamage);
                    if (userHP > 0) {
                        opponentHP = Math.max(0, opponentHP - userDamage);
                    }
                }
                
                // Tạo action message với thông tin chi tiết về các hiệu ứng đặc biệt
                let action = '';
                let specialEffects = [];
                
                // Kiểm tra các hiệu ứng đặc biệt
                if (userCrits) {
                    specialEffects.push(`💥 **${userFish.species} CHÍ MẠNG!** (May mắn: ${userLuck})`);
                }
                if (opponentCrits) {
                    specialEffects.push(`💥 **${opponentFish.species} CHÍ MẠNG!** (May mắn: ${opponentLuck})`);
                }
                if (userDodges) {
                    specialEffects.push(`🛡️ **${userFish.species} NÉ!** (Nhanh nhẹn: ${userAgility})`);
                }
                if (opponentDodges) {
                    specialEffects.push(`🛡️ **${opponentFish.species} NÉ!** (Nhanh nhẹn: ${opponentAgility})`);
                }
                if (!userHits) {
                    specialEffects.push(`❌ **${userFish.species} ĐÁNH TRƯỢT!** (Độ chính xác: ${userAccuracy})`);
                }
                if (!opponentHits) {
                    specialEffects.push(`❌ **${opponentFish.species} ĐÁNH TRƯỢT!** (Độ chính xác: ${opponentAccuracy})`);
                }
                
                // Tạo action message cơ bản
                switch (roundNumber) {
                    case 1:
                        action = `💥 Giao tranh dữ dội! Cả hai đều bị thương!`;
                        break;
                    case 2:
                        action = `⚡ Chiến đấu gay cấn! Sức mạnh tăng cao!`;
                        break;
                    case 3:
                        action = `🔥 Hiệp 3! Cuộc chiến ngày càng khốc liệt!`;
                        break;
                    case 4:
                        action = `💀 Hiệp 4! Cả hai đều đã mệt mỏi!`;
                        break;
                    case 5:
                        action = `⚔️ Hiệp 5! Thời khắc quyết định đang đến!`;
                        break;
                    case 6:
                        action = `🌪️ Hiệp 6! Bão tố chiến đấu bùng nổ!`;
                        break;
                    case 7:
                        action = `💢 Hiệp 7! Sức mạnh cuối cùng được giải phóng!`;
                        break;
                    case 8:
                        action = `🎯 Hiệp 8! Đòn đánh chí mạng!`;
                        break;
                    case 9:
                        action = `⚡ Hiệp 9! Thời khắc sinh tử!`;
                        break;
                    case 10:
                        action = `🏁 Hiệp 10! Trận đấu cuối cùng!`;
                        break;
                    default:
                        action = `🔥 Hiệp ${roundNumber}! Quyết định thắng thua!`;
                        break;
                }
                
                // Thêm thông tin hiệu ứng đặc biệt nếu có
                if (specialEffects.length > 0) {
                    action += `\n${specialEffects.join(' | ')}`;
                }
                
                rounds.push({
                    round: roundNumber++,
                    userHP,
                    opponentHP,
                    userMaxHP,
                    opponentMaxHP,
                    action: action
                });
                
                // Kiểm tra kết thúc
                if (userHP <= 0 || opponentHP <= 0) {
                    break;
                }
            }
            
            return rounds;
        } catch (error) {
            console.error('Error creating battle animation:', error);
            return [];
        }
    }
    
    /**
     * Tính sức mạnh của cá (tương tự như FishBreedingService)
     */
    private static calculateFishPower(fish: any): number {
        try {
            const stats = fish.stats || {};
            const basePower = (stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0);
            const levelBonus = (fish.level || 1) * 5;
            const generationBonus = (fish.generation || 1) * 10;
            return basePower + levelBonus + generationBonus;
        } catch (error) {
            console.error('Error calculating fish power:', error);
            return 100; // Default power
        }
    }
}
