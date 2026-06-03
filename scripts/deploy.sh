#!/bin/bash
set -e

echo "🚛 Deploying Sistema de Transporte..."

# Stop and remove old containers
docker-compose down --remove-orphans

# Build and start
docker-compose up --build -d

echo "⏳ Waiting for services..."
sleep 15

# Run seed
docker exec transport_postgres psql -U transport_user -d transport_db -f /docker-entrypoint-initdb.d/02-seed.sql 2>/dev/null || true

echo ""
echo "✅ Sistema levantado:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001/api"
echo "   Swagger:  http://localhost:3001/api/docs"
echo ""
echo "Credenciales:"
echo "   Admin:       admin@transporte.com / Admin123!"
echo "   Coordinador: coord@transporte.com / Coord123!"
echo "   Transportista: driver1@transporte.com / Driver123!"
