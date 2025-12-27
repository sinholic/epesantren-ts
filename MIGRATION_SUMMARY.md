# Migration Summary: MySQL to PostgreSQL

## Overview

Migration dari MySQL ke PostgreSQL untuk aplikasi E-Pesantren sudah selesai. Semua stored procedures, schema tables, dan data migration scripts sudah dibuat.

## Files Created/Updated

### 1. Prisma Schema (`prisma/schema.prisma`)
- ✅ Updated `Debit` model dengan field tambahan:
  - `accountId`, `studentId`, `recipient`, `posId`, `jurnalId`
  - `ppdbNisn`, `ppdbParticipantId`, `createdBy`
- ✅ Updated `BebasPay` model dengan `jurnalId`
- ✅ Added new models:
  - `Unit` - Unit management
  - `PPDBParticipant` - PPDB participant data
  - `PPDBBayar` - PPDB payment records
  - `Jurnal` - Journal management
- ✅ Updated relations untuk semua models

### 2. Migration SQL Script (`prisma/migrations/migrate_mysql_to_postgres.sql`)
- ✅ Converted 3 stored procedures ke PostgreSQL functions:
  1. `insert_debit_from_bulan()` - Insert debit dari bulan payments
  2. `update_participant_id_ppdb_bayar()` - Update participant ID
  3. `update_bebas_total_pay()` - Update bebas total payment
- ✅ Added missing columns ke existing tables
- ✅ Created missing tables (unit, ppdb_participant, ppdb_bayar, jurnal)
- ✅ Added foreign key constraints
- ✅ Created indexes untuk performance

### 3. Migration Guide (`prisma/migrations/MIGRATION_GUIDE.md`)
- ✅ Step-by-step migration guide
- ✅ Data type conversion table
- ✅ Troubleshooting section
- ✅ Rollback plan

### 4. Migration Script (`scripts/migrate-data.sh`)
- ✅ Automated migration script
- ✅ MySQL export
- ✅ SQL syntax conversion
- ✅ PostgreSQL import
- ✅ Function execution
- ✅ Verification

## Stored Procedures → PostgreSQL Functions

### 1. InsertDebitFromBulan → insert_debit_from_bulan()

**MySQL:**
```sql
CREATE PROCEDURE InsertDebitFromBulan()
BEGIN
  INSERT INTO debit (...)
  SELECT ... FROM bulan
  WHERE ...;
END
```

**PostgreSQL:**
```sql
CREATE OR REPLACE FUNCTION insert_debit_from_bulan()
RETURNS void AS $$
BEGIN
  INSERT INTO debit (...)
  SELECT ... FROM bulan
  WHERE ...;
END;
$$ LANGUAGE plpgsql;
```

### 2. UpdateParticipantIdPpdbBayar → update_participant_id_ppdb_bayar()

**MySQL:**
```sql
CREATE PROCEDURE UpdateParticipantIdPpdbBayar()
BEGIN
  UPDATE ppdb_bayar AS t
  JOIN ppdb_participant AS s ON t.nisn = s.nisn
  SET t.ppdb_participant_id = s.id
  WHERE t.nisn = s.nisn;
END
```

**PostgreSQL:**
```sql
CREATE OR REPLACE FUNCTION update_participant_id_ppdb_bayar()
RETURNS void AS $$
BEGIN
  UPDATE ppdb_bayar AS t
  SET ppdb_participant_id = s.id
  FROM ppdb_participant AS s
  WHERE t.nisn = s.nisn;
END;
$$ LANGUAGE plpgsql;
```

### 3. update_bebas_total_pay → update_bebas_total_pay()

**MySQL:**
```sql
CREATE PROCEDURE update_bebas_total_pay()
BEGIN
  UPDATE bebas
  JOIN (SELECT ...) AS subquery
  ON bebas.bebas_id = subquery.bebas_bebas_id
  SET bebas.bebas_total_pay = subquery.total_bebas_pay_bill;
END
```

**PostgreSQL:**
```sql
CREATE OR REPLACE FUNCTION update_bebas_total_pay()
RETURNS void AS $$
BEGIN
  UPDATE bebas
  SET bebas_total_pay = subquery.total_bebas_pay_bill
  FROM (SELECT ...) AS subquery
  WHERE bebas.bebas_id = subquery.bebas_bebas_id;
END;
$$ LANGUAGE plpgsql;
```

## Data Type Conversions

| MySQL | PostgreSQL | Conversion |
|-------|------------|------------|
| `YEAR` | `INTEGER` | Direct conversion |
| `UNSIGNED INT` | `INTEGER` | Remove unsigned |
| `BLOB` | `BYTEA` | Binary data |
| `TIMESTAMP(0)` | `TIMESTAMP` | Remove precision |
| `DATETIME` | `TIMESTAMP` | Direct conversion |
| `TINYINT(1)` | `BOOLEAN` | Type conversion |
| `DECIMAL(10,0)` | `DECIMAL(10,2)` | Adjust precision |

## How to Use

### 1. Run Migration Script

```bash
# Set environment variables
export MYSQL_HOST=localhost
export MYSQL_USER=root
export MYSQL_PASS=password
export MYSQL_DB=epea3612_prod

export PG_HOST=localhost
export PG_USER=postgres
export PG_PASS=password
export PG_DB=epesantren_db

# Run migration
./scripts/migrate-data.sh
```

### 2. Manual Migration

```bash
# 1. Export MySQL
mysqldump -u root -p epea3612_prod > backup.sql

# 2. Run PostgreSQL migration
psql -U postgres -d epesantren_db -f prisma/migrations/migrate_mysql_to_postgres.sql

# 3. Import data (after conversion)
psql -U postgres -d epesantren_db -f converted_data.sql
```

### 3. Use Functions

```sql
-- Call functions
SELECT insert_debit_from_bulan();
SELECT update_participant_id_ppdb_bayar();
SELECT update_bebas_total_pay();
```

## Verification Checklist

- [ ] All tables migrated
- [ ] All data migrated (check counts)
- [ ] Foreign keys working
- [ ] Functions working
- [ ] Indexes created
- [ ] Application working with PostgreSQL

## Next Steps

1. **Test migration** di development environment
2. **Verify data integrity** dengan compare counts
3. **Test all API endpoints** dengan PostgreSQL
4. **Update application code** jika ada yang perlu disesuaikan
5. **Deploy to production** setelah semua test passed

## Notes

- **Password hashing**: Tetap menggunakan format yang sama (SHA1/bcrypt)
- **Date handling**: PostgreSQL lebih strict dengan date format
- **Case sensitivity**: PostgreSQL case-sensitive untuk identifiers
- **Sequences**: PostgreSQL menggunakan sequences untuk auto-increment

## Support

Jika ada masalah:
1. Check `MIGRATION_GUIDE.md` untuk troubleshooting
2. Check PostgreSQL logs
3. Verify migration script sudah di-run dengan benar
