#!/bin/bash

# PropertyM - Seed Database with Demo Data (Docker)

set -e

echo "🌱 Seeding PropertyM Database with Demo Data..."

# Check if containers are running
if ! docker-compose ps | grep -q "backend.*Up"; then
    echo "❌ Error: Backend container is not running!"
    echo "Please start the application first: ./deploy.sh"
    exit 1
fi

# Run seed script
echo "Running seed script..."
docker-compose exec -T backend npm run prisma:seed

echo ""
echo "✅ Database seeded successfully!"
echo ""
echo "👤 Demo User Credentials:"
echo "   Email: demo@propertym.com"
echo "   Password: Demo@123"
echo ""
echo "🌐 Login at: http://localhost:${FRONTEND_PORT:-3000}"
echo ""
echo "📚 For details, see: SEED_DATA_GUIDE.md"
echo "🗑️  To clear test data: ./clear-docker.sh"
echo ""

