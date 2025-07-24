#!/bin/bash

echo "🔍 Kiểm Tra User Có Cá Gen 2 (Docker Container)"
echo ""

# 1. Sử dụng container ID cụ thể
echo "1️⃣ Sử Dụng Container ID Cụ Thể:"
CONTAINER_ID="c8203bcf3da3"

# Kiểm tra container có tồn tại không
if ! docker ps -a --format "{{.ID}}" | grep -q "$CONTAINER_ID"; then
    echo "   ❌ Container ID $CONTAINER_ID không tồn tại"
    echo "   💡 Hãy kiểm tra lại container ID"
    exit 1
fi

# Kiểm tra container có đang chạy không
if ! docker ps --format "{{.ID}}" | grep -q "$CONTAINER_ID"; then
    echo "   ⚠️ Container $CONTAINER_ID không đang chạy"
    echo "   💡 Hãy khởi động container: docker start $CONTAINER_ID"
    exit 1
fi

echo "   ✅ Sử dụng container ID: $CONTAINER_ID"

# 2. Chạy script trong container
echo ""
echo "2️⃣ Chạy Script Trong Container:"

# Tạo script tạm thời trong container
docker exec $CONTAINER_ID bash -c '
cat > /tmp/check-gen2-fish.js << "EOF"
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkUsersWithGen2Fish() {
  console.log("🔍 Kiểm Tra User Có Cá Gen 2 (Docker Database)");
  console.log("");

  try {
    // 1. Kiểm tra kết nối database
    console.log("1️⃣ Kiểm Tra Kết Nối Database Docker:");
    
    await prisma.$connect();
    console.log("   ✅ Kết nối database Docker thành công");

    // 2. Thống kê tổng quan
    console.log("");
    console.log("2️⃣ Thống Kê Tổng Quan:");
    
    const totalUsers = await prisma.user.count();
    const totalFish = await prisma.fish.count();
    
    console.log(`   👥 Tổng số user: ${totalUsers}`);
    console.log(`   🐟 Tổng số cá: ${totalFish}`);

    // 3. Thống kê theo generation
    console.log("");
    console.log("3️⃣ Thống Kê Theo Generation:");
    
    const fishByGeneration = await prisma.fish.groupBy({
      by: ["generation"],
      _count: {
        id: true
      },
      orderBy: {
        generation: "asc"
      }
    });

    fishByGeneration.forEach(group => {
      console.log(`   Gen ${group.generation}: ${group._count.id} con cá`);
    });

    // 4. Tìm user có cá gen 2
    console.log("");
    console.log("4️⃣ Tìm User Có Cá Gen 2:");
    
    const gen2Fish = await prisma.fish.findMany({
      where: {
        generation: 2
      },
      select: {
        id: true,
        userId: true,
        guildId: true,
        species: true,
        level: true,
        rarity: true,
        value: true,
        status: true,
        createdAt: true
      },
      orderBy: [
        { userId: "asc" },
        { createdAt: "desc" }
      ]
    });

    if (gen2Fish.length === 0) {
      console.log("   ✅ Không có cá gen 2 nào");
    } else {
      console.log(`   📊 Tìm thấy ${gen2Fish.length} con cá gen 2:`);
      
      gen2Fish.forEach((fish, index) => {
        console.log(`");
        console.log(`   🐟 Cá ${index + 1}:`);
        console.log(`      ID: ${fish.id}`);
        console.log(`      User: ${fish.userId}`);
        console.log(`      Guild: ${fish.guildId}`);
        console.log(`      Species: ${fish.species}`);
        console.log(`      Level: ${fish.level}`);
        console.log(`      Rarity: ${fish.rarity}`);
        console.log(`      Value: ${fish.value.toString()} coins`);
        console.log(`      Status: ${fish.status}`);
        console.log(`      Created: ${fish.createdAt.toLocaleString()}`);
      });
    }

    // 5. Tìm user có cá gen 3+
    console.log("");
    console.log("5️⃣ Tìm User Có Cá Gen 3+:");
    
    const gen3PlusFish = await prisma.fish.findMany({
      where: {
        generation: {
          gte: 3
        }
      },
      select: {
        id: true,
        userId: true,
        guildId: true,
        species: true,
        generation: true,
        level: true,
        rarity: true,
        value: true,
        status: true
      },
      orderBy: [
        { userId: "asc" },
        { generation: "desc" }
      ]
    });

    if (gen3PlusFish.length === 0) {
      console.log("   ✅ Không có cá gen 3+ nào");
    } else {
      console.log(`   📊 Tìm thấy ${gen3PlusFish.length} con cá gen 3+:`);
      
      gen3PlusFish.forEach((fish, index) => {
        console.log(`");
        console.log(`   🐟 Cá ${index + 1} (Gen ${fish.generation}):`);
        console.log(`      ID: ${fish.id}`);
        console.log(`      User: ${fish.userId}`);
        console.log(`      Guild: ${fish.guildId}`);
        console.log(`      Species: ${fish.species}`);
        console.log(`      Level: ${fish.level}`);
        console.log(`      Rarity: ${fish.rarity}`);
        console.log(`      Value: ${fish.value.toString()} coins`);
        console.log(`      Status: ${fish.status}`);
      });
    }

    // 6. Kiểm tra breeding history
    console.log("");
    console.log("6️⃣ Kiểm Tra Breeding History:");
    
    const breedingHistory = await prisma.breedingHistory.findMany({
      select: {
        id: true,
        userId: true,
        guildId: true,
        parent1Id: true,
        parent2Id: true,
        offspringId: true,
        bredAt: true,
        success: true
      },
      orderBy: {
        bredAt: "desc"
      }
    });

    if (breedingHistory.length === 0) {
      console.log("   ✅ Không có lịch sử lai tạo nào");
    } else {
      console.log(`   📊 Có ${breedingHistory.length} lần lai tạo:`);
      
      breedingHistory.slice(0, 5).forEach((record, index) => {
        console.log(`");
        console.log(`   ${index + 1}. User: ${record.userId} (Guild: ${record.guildId})`);
        console.log(`      🐟 Parent 1: ${record.parent1Id}`);
        console.log(`      🐟 Parent 2: ${record.parent2Id}`);
        console.log(`      🐟 Offspring: ${record.offspringId}`);
        console.log(`      ✅ Success: ${record.success}`);
        console.log(`      📅 Bred At: ${record.bredAt.toLocaleString()}`);
      });
      
      if (breedingHistory.length > 5) {
        console.log(`      ... và ${breedingHistory.length - 5} lần khác`);
      }
    }

  } catch (error) {
    console.error("❌ Lỗi:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsersWithGen2Fish();
EOF

# Chạy script
cd /app && node /tmp/check-gen2-fish.js
'

# 3. Dọn dẹp
echo ""
echo "3️⃣ Dọn Dẹp:"
docker exec $CONTAINER_ID rm -f /tmp/check-gen2-fish.js
echo "   ✅ Đã xóa file tạm thời"

echo ""
echo "✅ Hoàn thành kiểm tra!" 