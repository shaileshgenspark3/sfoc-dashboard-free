#!/bin/bash
set -e

echo "🚀 Starting FIT-O-CHARITY Dashboard..."

# Function to check and install dependencies
check_deps() {
    DIR=$1
    echo "📦 Checking dependencies in $DIR..."
    if [ ! -d "$DIR/node_modules" ]; then
        echo "   Installing dependencies..."
        (cd $DIR && npm install)
    else
        echo "   Dependencies found."
    fi
}

# Check Frontend
check_deps "frontend"
if [ ! -d "frontend/dist" ]; then
    echo "🏗️  Building Frontend..."
    (cd frontend && npm run build)
fi

# Check Backend
check_deps "backend"

echo "🌟 Starting Backend Server..."
cd backend
npx tsx server.ts