#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "🚀 Starting Call Me Reminder Application..."
echo "📁 Project root: $PROJECT_ROOT"
echo ""

if [ ! -f .env ]; then
    echo "⚠️  .env file not found! Copying from .env.example..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your Vapi credentials before running again."
    exit 1
fi

echo "🐳 Building and starting Docker containers..."
docker-compose up --build

echo ""
echo "✅ Application stopped."
