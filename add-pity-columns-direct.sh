#!/bin/bash

echo "🔧 Adding Pity System Columns Directly via SQL"
echo "================================================"

# Thêm cột legendaryPityCount
echo "📊 Adding legendaryPityCount column..."
docker exec -it aninhi-discord-bot node -e "
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.\$executeRaw\`ALTER TABLE FishingData ADD COLUMN legendaryPityCount INTEGER NOT NULL DEFAULT 0\`
.then(() => console.log('✅ legendaryPityCount column added'))
.catch((error) => {
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ legendaryPityCount column already exists');
    } else {
        console.error('❌ Error:', error.message);
    }
})
.finally(() => prisma.\$disconnect())
"

# Thêm cột lastLegendaryCaught
echo ""
echo "📅 Adding lastLegendaryCaught column..."
docker exec -it aninhi-discord-bot node -e "
const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.\$executeRaw\`ALTER TABLE FishingData ADD COLUMN lastLegendaryCaught DATETIME\`
.then(() => console.log('✅ lastLegendaryCaught column added'))
.catch((error) => {
    if (error.message.includes('duplicate column name')) {
        console.log('ℹ️ lastLegendaryCaught column already exists');
    } else {
        console.error('❌ Error:', error.message);
    }
})
.finally(() => prisma.\$disconnect())
"

echo ""
echo "✅ Pity system columns added!"
echo ""
echo "📋 Next steps:"
echo "1. Test fishing command: n.fishing"
echo "2. Test pity command: n.pity"
echo "3. Check if pity system works correctly" 