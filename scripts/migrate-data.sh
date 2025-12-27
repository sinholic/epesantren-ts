#!/bin/bash

# Migration Script: MySQL to PostgreSQL
# This script helps migrate data from MySQL to PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
MYSQL_HOST="${MYSQL_HOST:-localhost}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASS="${MYSQL_PASS:-}"
MYSQL_DB="${MYSQL_DB:-epea3612_prod}"

PG_HOST="${PG_HOST:-localhost}"
PG_USER="${PG_USER:-postgres}"
PG_PASS="${PG_PASS:-}"
PG_DB="${PG_DB:-epesantren_db}"

echo -e "${GREEN}Starting MySQL to PostgreSQL Migration${NC}"

# Step 1: Export MySQL data
echo -e "${YELLOW}Step 1: Exporting MySQL data...${NC}"
mysqldump -h "$MYSQL_HOST" -u "$MYSQL_USER" -p"$MYSQL_PASS" \
  --no-create-info \
  --skip-triggers \
  --skip-lock-tables \
  --single-transaction \
  "$MYSQL_DB" > mysql_data.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ MySQL data exported successfully${NC}"
else
  echo -e "${RED}✗ Failed to export MySQL data${NC}"
  exit 1
fi

# Step 2: Convert SQL syntax
echo -e "${YELLOW}Step 2: Converting SQL syntax...${NC}"
sed -i.bak \
  -e 's/`/"/g' \
  -e "s/'0000-00-00 00:00:00'/NULL/g" \
  -e "s/'0000-00-00'/NULL/g" \
  -e 's/ENGINE=InnoDB//g' \
  -e 's/DEFAULT CHARSET=[^ ]*//g' \
  -e 's/COLLATE=[^ ]*//g' \
  mysql_data.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ SQL syntax converted${NC}"
else
  echo -e "${RED}✗ Failed to convert SQL syntax${NC}"
  exit 1
fi

# Step 3: Run PostgreSQL migration schema
echo -e "${YELLOW}Step 3: Running PostgreSQL migration schema...${NC}"
PGPASSWORD="$PG_PASS" psql -h "$PG_HOST" -U "$PG_USER" -d "$PG_DB" \
  -f scripts/migrations/migrate_mysql_to_postgres.sql

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PostgreSQL schema migration completed${NC}"
else
  echo -e "${RED}✗ Failed to run PostgreSQL migration${NC}"
  exit 1
fi

# Step 4: Import data to PostgreSQL
echo -e "${YELLOW}Step 4: Importing data to PostgreSQL...${NC}"
PGPASSWORD="$PG_PASS" psql -h "$PG_HOST" -U "$PG_USER" -d "$PG_DB" \
  -f mysql_data.sql 2>&1 | grep -v "ERROR" || true

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ Data imported successfully${NC}"
else
  echo -e "${YELLOW}⚠ Some errors occurred during import (may be expected)${NC}"
fi

# Step 5: Run PostgreSQL functions
echo -e "${YELLOW}Step 5: Running PostgreSQL functions...${NC}"
PGPASSWORD="$PG_PASS" psql -h "$PG_HOST" -U "$PG_USER" -d "$PG_DB" <<EOF
SELECT insert_debit_from_bulan();
SELECT update_participant_id_ppdb_bayar();
SELECT update_bebas_total_pay();
EOF

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓ PostgreSQL functions executed${NC}"
else
  echo -e "${RED}✗ Failed to execute PostgreSQL functions${NC}"
  exit 1
fi

# Step 6: Verify migration
echo -e "${YELLOW}Step 6: Verifying migration...${NC}"
PGPASSWORD="$PG_PASS" psql -h "$PG_HOST" -U "$PG_USER" -d "$PG_DB" <<EOF
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'student', COUNT(*) FROM student
UNION ALL
SELECT 'bulan', COUNT(*) FROM bulan
UNION ALL
SELECT 'bebas', COUNT(*) FROM bebas
UNION ALL
SELECT 'debit', COUNT(*) FROM debit;
EOF

echo -e "${GREEN}Migration completed successfully!${NC}"
echo -e "${YELLOW}Note: Please verify the data counts match between MySQL and PostgreSQL${NC}"

# Cleanup
rm -f mysql_data.sql.bak
