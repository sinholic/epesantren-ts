# Migration Guide: MySQL to PostgreSQL

Panduan lengkap untuk migrasi database dari MySQL ke PostgreSQL untuk aplikasi E-Pesantren.

## Prerequisites

1. **MySQL Database** - Database source yang akan di-migrate
2. **PostgreSQL Database** - Database target yang sudah dibuat
3. **pgloader** atau **mysqldump + manual conversion** - Tools untuk migrasi data

## Step 1: Backup MySQL Database

```bash
# Backup MySQL database
mysqldump -u username -p epea3612_prod > backup_mysql.sql

# Atau backup dengan struktur saja
mysqldump -u username -p --no-data epea3612_prod > backup_structure.sql
```

## Step 2: Convert Schema dengan Prisma

1. **Update Prisma schema** - Sudah dilakukan di `schema.prisma`
2. **Generate Prisma Client**:
   ```bash
   yarn prisma:generate
   ```

3. **Create migration**:
   ```bash
   yarn prisma migrate dev --name migrate_mysql_to_postgres
   ```

## Step 3: Run PostgreSQL Migration Script

Jalankan script SQL untuk:
- Convert stored procedures ke functions
- Add missing columns
- Create missing tables
- Add foreign keys

```bash
# Connect ke PostgreSQL
psql -U username -d database_name

# Run migration script
\i prisma/migrations/migrate_mysql_to_postgres.sql
```

## Step 4: Migrate Data

### Option 1: Menggunakan pgloader (Recommended)

```bash
# Install pgloader
# macOS
brew install pgloader

# Ubuntu/Debian
sudo apt-get install pgloader

# Create pgloader config file
cat > migrate.load <<EOF
LOAD DATABASE
  FROM mysql://username:password@localhost/epea3612_prod
  INTO postgresql://username:password@localhost/epesantren_db

WITH
  include drop, create tables, create indexes, reset sequences

SET
  maintenance_work_mem to '256MB',
  work_mem to '128MB'

CAST
  type year to integer,
  type datetime to timestamp,
  type date to date,
  type timestamp to timestamp,
  type tinyint to boolean using tinyint-to-boolean,
  type decimal to decimal,
  type double to double precision,
  type float to real,
  type blob to bytea,
  type text to text

ALTER TABLE NAMES MATCHING ~/.*/, ~/.*/ RENAME TO ~/.*/, ~/.*/
;
EOF

# Run pgloader
pgloader migrate.load
```

### Option 2: Manual Export/Import

1. **Export data dari MySQL**:
   ```bash
   mysqldump -u username -p --no-create-info --skip-triggers epea3612_prod > data_only.sql
   ```

2. **Convert SQL syntax**:
   - Replace `\` dengan `"` untuk identifiers
   - Replace `0000-00-00 00:00:00` dengan `NULL`
   - Remove `ENGINE=InnoDB` dan `DEFAULT CHARSET`
   - Convert `YEAR` type ke `INTEGER`
   - Convert `UNSIGNED` ke regular integer

3. **Import ke PostgreSQL**:
   ```bash
   psql -U username -d database_name -f converted_data.sql
   ```

## Step 5: Convert Stored Procedures

Stored procedures sudah di-convert ke PostgreSQL functions di `migrate_mysql_to_postgres.sql`.

### Functions yang tersedia:

1. **insert_debit_from_bulan()** - Insert debit dari bulan payments
2. **update_participant_id_ppdb_bayar()** - Update participant ID di ppdb_bayar
3. **update_bebas_total_pay()** - Update total payment di bebas

### Cara menggunakan:

```sql
-- Call function
SELECT insert_debit_from_bulan();
SELECT update_participant_id_ppdb_bayar();
SELECT update_bebas_total_pay();
```

## Step 6: Data Type Conversions

### MySQL → PostgreSQL Conversions:

| MySQL | PostgreSQL | Notes |
|-------|------------|-------|
| `YEAR` | `INTEGER` | PostgreSQL tidak punya tipe YEAR |
| `UNSIGNED INT` | `INTEGER` | PostgreSQL tidak support unsigned |
| `BLOB` | `BYTEA` | Binary data |
| `TIMESTAMP(0)` | `TIMESTAMP` | PostgreSQL tidak support precision |
| `DATETIME` | `TIMESTAMP` | |
| `TINYINT(1)` | `BOOLEAN` | |
| `DECIMAL(10,0)` | `DECIMAL(10,2)` | Adjust precision |

## Step 7: Verify Migration

1. **Check table counts**:
   ```sql
   -- MySQL
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM student;
   SELECT COUNT(*) FROM bulan;
   
   -- PostgreSQL
   SELECT COUNT(*) FROM users;
   SELECT COUNT(*) FROM student;
   SELECT COUNT(*) FROM bulan;
   ```

2. **Test functions**:
   ```sql
   -- Test insert_debit_from_bulan
   SELECT insert_debit_from_bulan();
   
   -- Check results
   SELECT COUNT(*) FROM debit;
   ```

3. **Check foreign keys**:
   ```sql
   SELECT 
     tc.table_name, 
     kcu.column_name, 
     ccu.table_name AS foreign_table_name,
     ccu.column_name AS foreign_column_name 
   FROM information_schema.table_constraints AS tc 
   JOIN information_schema.key_column_usage AS kcu
     ON tc.constraint_name = kcu.constraint_name
   JOIN information_schema.constraint_column_usage AS ccu
     ON ccu.constraint_name = tc.constraint_name
   WHERE tc.constraint_type = 'FOREIGN KEY';
   ```

## Step 8: Update Application Code

1. **Update connection string**:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/epesantren_db?schema=public
   ```

2. **Test API endpoints**:
   ```bash
   yarn dev
   # Test semua endpoints
   ```

## Troubleshooting

### Error: Column does not exist
- Pastikan semua column sudah di-add di migration script
- Check Prisma schema sudah update

### Error: Function does not exist
- Pastikan migration script sudah di-run
- Check function name (case sensitive di PostgreSQL)

### Error: Foreign key constraint
- Pastikan data sudah di-import dengan benar
- Check foreign key references

### Error: Invalid date format
- Convert `0000-00-00` dates ke `NULL`
- Use `NULLIF()` function untuk handle invalid dates

## Rollback Plan

Jika perlu rollback:

1. **Backup PostgreSQL database**:
   ```bash
   pg_dump -U username database_name > backup_postgres.sql
   ```

2. **Restore MySQL database**:
   ```bash
   mysql -u username -p epea3612_prod < backup_mysql.sql
   ```

## Notes

- **Password hashing**: Pastikan password tetap menggunakan format yang sama (SHA1 atau bcrypt)
- **Date handling**: PostgreSQL lebih strict dengan date format
- **Case sensitivity**: PostgreSQL case-sensitive untuk identifiers
- **Sequences**: PostgreSQL menggunakan sequences untuk auto-increment

## Support

Jika ada masalah dengan migration, check:
1. PostgreSQL logs
2. Application logs
3. Migration script output
