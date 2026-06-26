#!/bin/bash

# Script để clear data trong Docker container
echo "🐳 Clearing data in Docker container..."

# Tên container (có thể thay đổi theo tên thực tế)
CONTAINER_NAME="aninhi-discord-bot"

# Kiểm tra xem container có đang chạy không
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Container $CONTAINER_NAME is not running!"
    echo "Please start the container first:"
    echo "  docker-compose up -d"
    exit 1
fi

echo "✅ Container $CONTAINER_NAME is running"

# Tùy chọn clear data
echo ""
echo "🧹 Choose what to clear:"
echo "1. Clear all data (⚠️ DANGEROUS!)"
echo "2. Clear test data only (✅ SAFE)"
echo "3. Show data statistics"
echo "4. Clear specific data type"
echo "0. Exit"
echo ""

read -p "Enter your choice (0-4): " choice

case $choice in
    1)
        echo "⚠️ WARNING: This will delete ALL data!"
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        if [ "$confirm" = "yes" ]; then
            echo "🗑️ Clearing all data..."
            docker exec $CONTAINER_NAME npx tsx scripts/clear-all-data.ts
        else
            echo "❌ Operation cancelled"
        fi
        ;;
    2)
        echo "🧹 Clearing test data..."
        docker exec $CONTAINER_NAME npx tsx scripts/clear-test-data.ts
        ;;
    3)
        echo "📊 Showing data statistics..."
        docker exec $CONTAINER_NAME npx tsx scripts/show-data-stats.ts
        ;;
    4)
        echo ""
        echo "📋 Choose specific data type to clear:"
        echo "1. Fishing data only"
        echo "2. User data only"
        echo "3. Tournament data only"
        echo "4. Transaction data only"
        echo "5. Inventory data only"
        echo "0. Back to main menu"
        echo ""
        
        read -p "Enter your choice (0-5): " subchoice
        
        case $subchoice in
            1)
                echo "🎣 Clearing fishing data..."
                docker exec $CONTAINER_NAME node -e "
                    const { clearFishingData } = require('./scripts/clear-specific-data');
                    clearFishingData().catch(console.error);
                "
                ;;
            2)
                echo "👥 Clearing user data..."
                docker exec $CONTAINER_NAME node -e "
                    const { clearUserData } = require('./scripts/clear-specific-data');
                    clearUserData().catch(console.error);
                "
                ;;
            3)
                echo "🏆 Clearing tournament data..."
                docker exec $CONTAINER_NAME node -e "
                    const { clearTournamentData } = require('./scripts/clear-specific-data');
                    clearTournamentData().catch(console.error);
                "
                ;;
            4)
                echo "💰 Clearing transaction data..."
                docker exec $CONTAINER_NAME node -e "
                    const { clearTransactionData } = require('./scripts/clear-specific-data');
                    clearTransactionData().catch(console.error);
                "
                ;;
            5)
                echo "📦 Clearing inventory data..."
                docker exec $CONTAINER_NAME node -e "
                    const { clearInventoryData } = require('./scripts/clear-specific-data');
                    clearInventoryData().catch(console.error);
                "
                ;;
            0)
                echo "Returning to main menu..."
                ;;
            *)
                echo "❌ Invalid choice"
                ;;
        esac
        ;;
    0)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        ;;
esac

echo ""
echo "✅ Operation completed!" 