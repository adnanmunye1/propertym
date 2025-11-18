#!/bin/bash

# Script to run opening balance migration on Railway
# This script should be run from Railway's environment or with Railway CLI

echo "🚀 Running opening balance migration on Railway..."

# Try to get DATABASE_URL from environment (Railway provides this)
if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in environment"
  echo "Please ensure you're running this from Railway's environment"
  echo ""
  echo "To run manually:"
  echo "1. Go to Railway Dashboard → Your Project → PostgreSQL Service"
  echo "2. Click 'Data' or 'Query' tab"
  echo "3. Run: ALTER TABLE tenants ADD COLUMN opening_balance DECIMAL(10,2);"
  exit 1
fi

echo "✅ DATABASE_URL found"
echo "📊 Running migration..."

# Run the migration using psql
psql "$DATABASE_URL" -c "ALTER TABLE tenants ADD COLUMN opening_balance DECIMAL(10,2);"

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully!"
  echo "The opening_balance column has been added to the tenants table."
else
  echo "❌ Migration failed"
  echo "The column might already exist, or there was an error."
  exit 1
fi

