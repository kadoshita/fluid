#!/bin/bash
set -e

echo "Creating fluid_test database..."

mongosh --username "$MONGO_INITDB_ROOT_USERNAME" --password "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin <<EOF
use fluid_test
db.createCollection('init')
print('fluid_test database created successfully')
EOF

echo "Database initialization completed!"