#!/bin/bash

# PrimeDrive Testumgebung Quickstart
# Dieses Skript startet die komplette Testumgebung

set -e

echo "================================"
echo "🚀 PrimeDrive Testumgebung"
echo "================================"
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker nicht gefunden. Bitte installiere Docker Desktop."
    echo "   https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker is running
if ! docker info &> /dev/null; then
    echo "❌ Docker läuft nicht. Bitte starte Docker Desktop."
    exit 1
fi

echo "✅ Docker ist installed und läuft"
echo ""

# Navigate to root directory
cd "$(dirname "$0")/.."

echo "📦 Baue und starte Services..."
echo ""

# Create .env if not exists
if [ ! -f .env ]; then
    echo "📝 Erstelle .env Datei..."
    cp Database/.env.example .env
    echo "   ℹ️  Editiere .env bei Bedarf"
fi

# Start docker-compose
docker-compose up -d --build

echo ""
echo "⏳ Warte auf Services (ca. 30-60 Sekunden)..."
echo ""

# Wait for backend
echo "⏱️  Backend wird gestartet..."
for i in {1..60}; do
    if curl -f http://localhost:8080/actuator/health 2>/dev/null; then
        echo "✅ Backend ist ready!"
        break
    fi
    sleep 1
    echo -n "."
done

echo ""
echo "================================"
echo "✅ Testumgebung ist ready!"
echo "================================"
echo ""
echo "🌐 Frontend:  http://localhost:4200"
echo "🔧 Backend:   http://localhost:8080"
echo "🗄️  Database:  localhost:3306"
echo ""
echo "📊 Backend Health:  curl http://localhost:8080/actuator/health"
echo "📊 Frontend Health: curl http://localhost:4200/health"
echo ""
echo "🛑 Zum Stoppen:"
echo "   docker-compose down"
echo ""
echo "📖 Dokumentation: Docs/Konzept/DevOps/TESTUMGEBUNG.md"
echo ""
