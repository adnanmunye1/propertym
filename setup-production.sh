#!/bin/bash

# PropertyM Production Setup Script

set -e

echo "🔧 PropertyM Production Setup"
echo "=============================="
echo ""

# Function to generate random secret
generate_secret() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-32
}

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Setup cancelled"
        exit 1
    fi
fi

# Create .env file
echo "📝 Creating .env file..."

cat > .env << EOF
# Database Configuration
DB_USER=propertym
DB_PASSWORD=$(generate_secret)
DB_NAME=propertym_db
DB_PORT=5432

# Backend Configuration
BACKEND_PORT=5000

# JWT Secrets
JWT_SECRET=$(generate_secret)
JWT_REFRESH_SECRET=$(generate_secret)
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Frontend Configuration
FRONTEND_PORT=3000
FRONTEND_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Storage Configuration
STORAGE_TYPE=local
UPLOAD_DIR=./uploads

# Logging
LOG_LEVEL=info

# Production Settings
NODE_ENV=production
EOF

echo "✅ .env file created with generated secrets"
echo ""

# Prompt for custom domain (optional)
read -p "Enter your domain name (leave empty for localhost): " domain

if [ ! -z "$domain" ]; then
    sed -i.bak "s|http://localhost:3000|https://$domain|g" .env
    sed -i.bak "s|http://localhost:5000|https://api.$domain|g" .env
    rm .env.bak
    echo "✅ Domain configured: $domain"
fi

echo ""
echo "🔐 Important: Your generated secrets are in .env file"
echo "📌 Keep this file secure and never commit it to version control!"
echo ""
echo "Next steps:"
echo "1. Review and adjust .env file if needed"
echo "2. Run: ./deploy.sh"
echo ""

