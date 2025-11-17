#!/bin/bash

# PropertyM - Clear Test Data (Docker)

set -e

echo "🗑️  Clearing PropertyM Test Data..."

# Check if containers are running
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo "❌ Error: Backend container is not running!"
    echo "Please start the application first: ./deploy.sh"
    exit 1
fi

# Confirmation prompt
read -p "⚠️  This will delete ALL test data (properties, units, tenants, payments, etc.). Continue? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Cancelled"
    exit 1
fi

# Run clear script
echo "Clearing test data..."
docker-compose exec -T backend npm run prisma:clear

echo ""
echo "✅ Test data cleared successfully!"
echo ""
echo "You can now add your own data through the application."
echo ""

