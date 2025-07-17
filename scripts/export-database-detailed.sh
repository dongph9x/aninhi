#!/bin/bash

echo "📤 Detailed Database Export from Cache..."
echo ""

# Kiểm tra container
if ! docker ps | grep -q "aninhi-discord-bot"; then
    echo "❌ Container aninhi-discord-bot is not running"
    exit 1
fi

# Tạo thư mục export
mkdir -p ./exports

# Timestamp
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
EXPORT_DIR="./exports/export-$TIMESTAMP"
mkdir -p "$EXPORT_DIR"

echo "📁 Export directory: $EXPORT_DIR"

# Copy databases
echo "📋 Copying databases from container..."
docker cp aninhi-discord-bot:/app/prisma/data/database.db "$EXPORT_DIR/prisma-database.db"
docker cp aninhi-discord-bot:/app/data/database.db "$EXPORT_DIR/data-database.db"

# Copy Prisma cache info
echo "📋 Copying Prisma cache information..."
docker cp aninhi-discord-bot:/app/node_modules/.prisma/client/schema.prisma "$EXPORT_DIR/prisma-schema.prisma"
docker cp aninhi-discord-bot:/app/node_modules/.prisma/client/package.json "$EXPORT_DIR/prisma-package.json"

# Kiểm tra thông tin database
echo "🔍 Analyzing databases..."

# Prisma database info
PRISMA_USERS=$(sqlite3 "$EXPORT_DIR/prisma-database.db" "SELECT COUNT(*) FROM User;" 2>/dev/null)
PRISMA_BALANCE=$(sqlite3 "$EXPORT_DIR/prisma-database.db" "SELECT balance FROM User WHERE userId = '389957152153796608';" 2>/dev/null)
PRISMA_SIZE=$(du -h "$EXPORT_DIR/prisma-database.db" | cut -f1)

# Data database info
DATA_USERS=$(sqlite3 "$EXPORT_DIR/data-database.db" "SELECT COUNT(*) FROM User;" 2>/dev/null)
DATA_BALANCE=$(sqlite3 "$EXPORT_DIR/data-database.db" "SELECT balance FROM User WHERE userId = '389957152153796608';" 2>/dev/null)
DATA_SIZE=$(du -h "$EXPORT_DIR/data-database.db" | cut -f1)

# Tạo file report
echo "📝 Creating detailed report..."
cat > "$EXPORT_DIR/export-report.txt" << EOF
Database Export Report
=====================
Export Time: $(date)
Container: aninhi-discord-bot
Export Directory: $EXPORT_DIR

DATABASE COMPARISON
==================

Prisma Database (Bot's actual database):
- File: prisma-database.db
- Size: $PRISMA_SIZE
- Users: $PRISMA_USERS
- Balance (389957152153796608): $PRISMA_BALANCE
- Location in container: /app/prisma/data/database.db

Data Database (Volume mounted):
- File: data-database.db
- Size: $DATA_SIZE
- Users: $DATA_USERS
- Balance (389957152153796608): $DATA_BALANCE
- Location in container: /app/data/database.db

DIFFERENCE ANALYSIS
==================
Users difference: $((PRISMA_USERS - DATA_USERS))
Balance difference: $((PRISMA_BALANCE - DATA_BALANCE))

RECOMMENDATIONS
==============
- Use prisma-database.db as the source of truth
- This is the database that the bot actually reads from
- data-database.db may be outdated due to volume mount issues

EXPORT COMMANDS USED
===================
docker cp aninhi-discord-bot:/app/prisma/data/database.db $EXPORT_DIR/prisma-database.db
docker cp aninhi-discord-bot:/app/data/database.db $EXPORT_DIR/data-database.db
docker cp aninhi-discord-bot:/app/node_modules/.prisma/client/schema.prisma $EXPORT_DIR/prisma-schema.prisma

FILES EXPORTED
==============
- prisma-database.db (main database)
- data-database.db (volume mounted database)
- prisma-schema.prisma (Prisma schema)
- prisma-package.json (Prisma client info)
- export-report.txt (this file)
EOF

# Tạo script để restore
echo "📝 Creating restore script..."
cat > "$EXPORT_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 Restoring database from export..."
echo ""

# Backup current databases
echo "📦 Creating backups..."
cp ./data/database.db ./data/database.db.backup-$(date +%s) 2>/dev/null
cp ./prisma/data/database.db ./data/prisma-database.db.backup-$(date +%s) 2>/dev/null

# Restore databases
echo "📋 Restoring databases..."
cp ./prisma-database.db ./data/database.db
cp ./prisma-database.db ./prisma/data/database.db

echo "✅ Database restored!"
echo "🚀 Please restart the bot: docker compose down && docker compose up -d --build"
EOF

chmod +x "$EXPORT_DIR/restore.sh"

# Hiển thị kết quả
echo ""
echo "✅ Detailed export completed!"
echo "📁 Export directory: $EXPORT_DIR"
echo ""
echo "📊 Summary:"
echo "  Prisma DB: $PRISMA_SIZE, $PRISMA_USERS users, balance: $PRISMA_BALANCE"
echo "  Data DB: $DATA_SIZE, $DATA_USERS users, balance: $DATA_BALANCE"
echo ""
echo "📄 Files created:"
ls -la "$EXPORT_DIR"
echo ""
echo "🚀 To restore: cd $EXPORT_DIR && ./restore.sh" 