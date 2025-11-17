#!/bin/bash

# PropertyM Production Deployment Script

set -e

echo "🚀 Starting PropertyM Deployment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please copy .env.example to .env and configure your environment variables."
    exit 1
fi

# Load environment variables
source .env

# Check required environment variables
required_vars=("JWT_SECRET" "JWT_REFRESH_SECRET" "DB_PASSWORD")
for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: Required environment variable $var is not set!"
        exit 1
    fi
done

echo "✅ Environment variables validated"

# Pull latest changes (if using git)
if [ -d .git ]; then
    echo "📦 Pulling latest changes..."
    git pull
fi

# Build and start containers
echo "🐳 Building Docker containers..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Run database migrations
echo "📊 Running database migrations..."
docker-compose exec -T backend npx prisma migrate deploy

# Optional: Seed with demo data (uncomment to enable)
# echo "🌱 Seeding database with demo data..."
# docker-compose exec -T backend npm run prisma:seed

# Check if services are healthy
echo "🏥 Checking service health..."
sleep 5

# Check backend health
if curl -f http://localhost:${BACKEND_PORT:-5000}/api/health > /dev/null 2>&1; then
    echo "✅ Backend is healthy"
else
    echo "⚠️  Backend health check failed"
fi

# Check frontend health
if curl -f http://localhost:${FRONTEND_PORT:-3000} > /dev/null 2>&1; then
    echo "✅ Frontend is healthy"
else
    echo "⚠️  Frontend health check failed"
fi

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📍 Services:"
echo "   Frontend: http://localhost:${FRONTEND_PORT:-3000}"
echo "   Backend:  http://localhost:${BACKEND_PORT:-5000}"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop services: docker-compose down"
echo ""

