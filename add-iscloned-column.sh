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
    // Kiểm tra xem cột đã tồn tại chưa
    console.log('🔍 Checking existing columns...');
    const tableInfo = await prisma.\$queryRaw\`PRAGMA table_info(Fish)\`;
    const existingColumns = tableInfo.map(col => col.name);
    
    if (!existingColumns.includes('isCloned')) {
      console.log('🔄 Adding isCloned column...');
      await prisma.\$executeRaw\`ALTER TABLE \"Fish\" ADD COLUMN \"isCloned\" BOOLEAN NOT NULL DEFAULT false\`;
    } else {
      console.log('✅ isCloned column already exists');
    }
    
    if (!existingColumns.includes('clonedFrom')) {
      console.log('🔄 Adding clonedFrom column...');
      await prisma.\$executeRaw\`ALTER TABLE \"Fish\" ADD COLUMN \"clonedFrom\" TEXT\`;
    } else {
      console.log('✅ clonedFrom column already exists');
    }
    
    if (!existingColumns.includes('clonedAt')) {
      console.log('🔄 Adding clonedAt column...');
      await prisma.\$executeRaw\`ALTER TABLE \"Fish\" ADD COLUMN \"clonedAt\" DATETIME\`;
    } else {
      console.log('✅ clonedAt column already exists');
    }
    
    console.log('🔄 Creating indexes...');
    try {
      await prisma.\$executeRaw\`CREATE INDEX \"Fish_isCloned_idx\" ON \"Fish\"(\"isCloned\")\`;
      console.log('✅ Fish_isCloned_idx created');
    } catch (e) {
      console.log('ℹ️ Fish_isCloned_idx already exists');
    }
    
    try {
      await prisma.\$executeRaw\`CREATE INDEX \"Fish_clonedFrom_idx\" ON \"Fish\"(\"clonedFrom\")\`;
      console.log('✅ Fish_clonedFrom_idx created');
    } catch (e) {
      console.log('ℹ️ Fish_clonedFrom_idx already exists');
    }
    
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
