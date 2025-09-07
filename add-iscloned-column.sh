#!/bin/bash

# 🐳 Add isCloned Column Script
# Thêm cột isCloned, clonedFrom, clonedAt vào database trực tiếp

echo "🚀 Adding isCloned columns to database..."

# Lệnh để thêm các cột cần thiết
docker exec -it aninhi-discord-bot node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addCloningColumns() {
  try {
    console.log('🔄 Adding isCloned column...');
    await prisma.\$executeRaw\`ALTER TABLE \"Fish\" ADD COLUMN IF NOT EXISTS \"isCloned\" BOOLEAN NOT NULL DEFAULT false\`;
    
    console.log('🔄 Adding clonedFrom column...');
    await prisma.\$executeRaw\`ALTER TABLE \"Fish\" ADD COLUMN IF NOT EXISTS \"clonedFrom\" TEXT\`;
    
    console.log('🔄 Adding clonedAt column...');
    await prisma.\$executeRaw\`ALTER TABLE \"Fish\" ADD COLUMN IF NOT EXISTS \"clonedAt\" DATETIME\`;
    
    console.log('🔄 Creating indexes...');
    await prisma.\$executeRaw\`CREATE INDEX IF NOT EXISTS \"Fish_isCloned_idx\" ON \"Fish\"(\"isCloned\")\`;
    await prisma.\$executeRaw\`CREATE INDEX IF NOT EXISTS \"Fish_clonedFrom_idx\" ON \"Fish\"(\"clonedFrom\")\`;
    
    console.log('✅ All cloning columns and indexes added successfully!');
  } catch (error) {
    console.error('❌ Error adding columns:', error);
  } finally {
    await prisma.\$disconnect();
  }
}

addCloningColumns();
"

echo "🎯 isCloned columns should now exist in the database!"
echo "🚀 You can now run the application without the column error."
