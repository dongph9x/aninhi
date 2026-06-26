import * as fs from 'fs';
import * as path from 'path';

// Danh sách các file cần cập nhật
const filesToUpdate = [
  'src/components/MessageComponent/BattleFishUI.ts',
  'src/components/MessageComponent/FishMarketHandler.ts',
  'src/components/MessageComponent/FishBarnUI.ts',
  'src/components/MessageComponent/FishMarketUI.ts',
  'src/components/MessageComponent/BattleFishHandler.ts',
  'src/commands/text/ecommerce/fishmarket.ts',
  'src/commands/text/ecommerce/fishbattle.ts',
  'src/components/MessageComponent/FishBarnHandler.ts'
];

// Pattern để tìm và thay thế
const patterns = [
  {
    // Pattern 1: Stats hiển thị với emoji
    find: /💪\$\{stats\.strength \|\| 0\} 🏃\$\{stats\.agility \|\| 0\} 🧠\$\{stats\.intelligence \|\| 0\} 🛡️\$\{stats\.defense \|\| 0\} 🍀\$\{stats\.luck \|\| 0\}/g,
    replace: '💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0} 🎯${stats.accuracy || 0}'
  },
  {
    // Pattern 2: Stats hiển thị với emoji (có dấu cách)
    find: /💪\$\{stats\.strength \|\| 0\} 🏃\$\{stats\.agility \|\| 0\} 🧠\$\{stats\.intelligence \|\| 0\} 🛡️\$\{stats\.defense \|\| 0\} 🍀\$\{stats\.luck \|\| 0\}/g,
    replace: '💪${stats.strength || 0} 🏃${stats.agility || 0} 🧠${stats.intelligence || 0} 🛡️${stats.defense || 0} 🍀${stats.luck || 0} 🎯${stats.accuracy || 0}'
  },
  {
    // Pattern 3: Tính tổng power
    find: /\(stats\.strength \|\| 0\) \+ \(stats\.agility \|\| 0\) \+ \(stats\.intelligence \|\| 0\) \+ \(stats\.defense \|\| 0\) \+ \(stats\.luck \|\| 0\)/g,
    replace: '(stats.strength || 0) + (stats.agility || 0) + (stats.intelligence || 0) + (stats.defense || 0) + (stats.luck || 0) + (stats.accuracy || 0)'
  },
  {
    // Pattern 4: Tính tổng power với type casting
    find: /\(\(stats as any\)\.strength \|\| 0\) \+ \(\(stats as any\)\.agility \|\| 0\) \+ \(\(stats as any\)\.intelligence \|\| 0\) \+ \(\(stats as any\)\.defense \|\| 0\) \+ \(\(stats as any\)\.luck \|\| 0\)/g,
    replace: '((stats as any).strength || 0) + ((stats as any).agility || 0) + ((stats as any).intelligence || 0) + ((stats as any).defense || 0) + ((stats as any).luck || 0) + ((stats as any).accuracy || 0)'
  }
];

function updateFile(filePath: string): { success: boolean; changes: number; errors: string[] } {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, changes: 0, errors: [`File not found: ${filePath}`] };
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let totalChanges = 0;
    const errors: string[] = [];

    // Áp dụng tất cả patterns
    patterns.forEach((pattern, index) => {
      const matches = content.match(pattern.find);
      if (matches) {
        const newContent = content.replace(pattern.find, pattern.replace);
        if (newContent !== content) {
          content = newContent;
          totalChanges += matches.length;
          console.log(`   ✅ Pattern ${index + 1}: Thay thế ${matches.length} lần`);
        }
      }
    });

    // Ghi file nếu có thay đổi
    if (totalChanges > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      return { success: true, changes: totalChanges, errors: [] };
    } else {
      return { success: true, changes: 0, errors: [] };
    }

  } catch (error) {
    return { success: false, changes: 0, errors: [`Error processing ${filePath}: ${error}`] };
  }
}

async function main() {
  console.log('🎯 Bắt đầu cập nhật hiển thị stats cá để thêm chỉ số accuracy...\n');

  let totalFilesProcessed = 0;
  let totalFilesUpdated = 0;
  let totalChanges = 0;
  const allErrors: string[] = [];

  for (const filePath of filesToUpdate) {
    console.log(`📁 Đang xử lý: ${filePath}`);
    
    const result = updateFile(filePath);
    totalFilesProcessed++;

    if (result.success) {
      if (result.changes > 0) {
        console.log(`   ✅ Đã cập nhật: ${result.changes} thay đổi`);
        totalFilesUpdated++;
        totalChanges += result.changes;
      } else {
        console.log(`   ⚠️  Không có thay đổi cần thiết`);
      }
    } else {
      console.log(`   ❌ Lỗi: ${result.errors.join(', ')}`);
      allErrors.push(...result.errors);
    }
    console.log('');
  }

  // Thống kê kết quả
  console.log('🎉 Hoàn thành cập nhật hiển thị stats!');
  console.log(`📈 Kết quả:`);
  console.log(`   📁 Đã xử lý: ${totalFilesProcessed} files`);
  console.log(`   ✅ Đã cập nhật: ${totalFilesUpdated} files`);
  console.log(`   🔄 Tổng thay đổi: ${totalChanges} lần`);
  
  if (allErrors.length > 0) {
    console.log(`   ❌ Lỗi: ${allErrors.length} lỗi`);
    allErrors.forEach(error => console.log(`      - ${error}`));
  }

  console.log('\n📋 Danh sách files đã cập nhật:');
  filesToUpdate.forEach(file => {
    console.log(`   📄 ${file}`);
  });

  console.log('\n🎯 Chỉ số accuracy đã được thêm vào tất cả hiển thị stats của cá!');
  console.log('   💪 Strength | 🏃 Agility | 🧠 Intelligence | 🛡️ Defense | 🍀 Luck | 🎯 Accuracy');
}

main().catch(console.error); 