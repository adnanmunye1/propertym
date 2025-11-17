#!/bin/bash
# Quick fix script to upgrade Node and start the frontend

echo "🔧 Fixing Frontend - Upgrading Node.js"
echo "======================================="
echo ""

# Check if nvm is available
if command -v nvm &> /dev/null; then
    echo "✅ Using nvm to install Node 20..."
    nvm install 20
    nvm use 20
else
    echo "✅ Using Homebrew to install Node 20..."
    brew install node@20
    brew link --overwrite node@20
fi

echo ""
echo "✅ Node upgraded! Current version:"
node --version

echo ""
echo "🚀 Starting frontend on port 8080..."
cd /Users/munye/Documents/Propertym/frontend
npm run dev

echo ""
echo "✅ Frontend should now be running at http://localhost:8080"

