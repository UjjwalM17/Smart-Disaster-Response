#!/bin/bash
set -e

echo "=========================================="
echo " Setting up PostgreSQL for Microservices"
echo "=========================================="

# Ensure PostgreSQL service is started
echo "Starting PostgreSQL..."
brew services start postgresql@18 || true

# Give PostgreSQL a second to listen
sleep 2

# Run the SQL script
echo "Creating user ujjwalmanocha and databases..."
psql postgres -f "$(dirname "$0")/setup-postgres.sql" || psql -U postgres -f "$(dirname "$0")/setup-postgres.sql"

echo ""
echo "=========================================="
echo " ✅ PostgreSQL setup completed successfully!"
echo " Databases created: incident_db, rescueteam_db, resource_db, mission_db, alert_db"
echo "=========================================="
