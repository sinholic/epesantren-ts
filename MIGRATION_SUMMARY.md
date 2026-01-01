# Database Configuration: MySQL

## Overview

Aplikasi E-Pesantren menggunakan **MySQL** sebagai database dengan Prisma ORM.

## Database Setup

### Connection String Format

```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

### Prisma Schema

File `prisma/schema.prisma` sudah dikonfigurasi untuk MySQL dengan:
- ✅ Semua models dengan proper MySQL data types
- ✅ Foreign key relations
- ✅ Indexes untuk performance
- ✅ Timestamp fields dengan precision `@db.Timestamp(0)`
- ✅ Year fields dengan `@db.Year`
- ✅ Unsigned integers dengan `@db.UnsignedInt`
- ✅ Blob fields dengan `@db.Blob`

## Models

### Core Models
- `User` - Admin/User accounts
- `UserRole` - User roles
- `Student` - Student data
- `Class` - Class management
- `Major` - Major/Jurusan

### Payment Models
- `Payment` - Payment definitions
- `Bulan` - Monthly payments
- `Bebas` - One-time payments
- `BebasPay` - Bebas payment records
- `Period` - Payment periods
- `Pos` - Payment positions

### Additional Models
- `PPDBParticipant` - PPDB participant data
- `PPDBBayar` - PPDB payment records
- `Debit` - Debit transactions
- `Kredit` - Credit transactions
- `Jurnal` - Journal management
- `Unit` - Unit management
- `Setting` - Application settings
- `Information` - Information/news
- `Log` - System logs
- `LogTrx` - Transaction logs

## Stored Procedures

Database MySQL memiliki stored procedures yang perlu dijalankan. File SQL untuk stored procedures ada di:
- `scripts/migrations/mysql_stored_procedures.sql`

### Stored Procedures yang tersedia:

1. **InsertDebitFromBulan** - Insert debit dari bulan payments
   - Menambahkan record debit dari tabel `bulan` yang sudah dibayar
   - Menghindari duplikasi dengan mengecek kombinasi `student_id` dan `debit_date`

2. **UpdateParticipantIdPpdbBayar** - Update participant ID di ppdb_bayar
   - Mengupdate `ppdb_participant_id` di tabel `ppdb_bayar` berdasarkan `nisn`

3. **update_bebas_total_pay** - Update total payment di bebas
   - Menghitung dan mengupdate total pembayaran di tabel `bebas` dari `bebas_pay`
   - Hanya menghitung pembayaran dengan `jurnal_id = 0`

### Cara menjalankan stored procedures:

```bash
# Login ke MySQL
mysql -u username -p database_name

# Atau langsung dari command line
mysql -u username -p database_name < scripts/migrations/mysql_stored_procedures.sql
```

### Cara memanggil stored procedures:

```sql
-- Insert debit from bulan
CALL InsertDebitFromBulan();

-- Update participant ID
CALL UpdateParticipantIdPpdbBayar();

-- Update bebas total pay
CALL update_bebas_total_pay();
```

## Setup Instructions

1. **Create database**:
   ```sql
   CREATE DATABASE epesantren_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

2. **Import SQL file** (jika ada):
   ```bash
   mysql -u username -p epesantren_db < epea3612_prod.sql
   ```

3. **Generate Prisma Client**:
   ```bash
   yarn prisma:generate
   ```

4. **Run migrations** (jika diperlukan):
   ```bash
   yarn prisma:migrate dev
   ```

## Notes

- **Character Set**: UTF8MB4 untuk support emoji dan special characters
- **Collation**: utf8mb4_unicode_ci untuk proper sorting
- **Stored Procedures**: Pastikan semua stored procedures sudah di-import
- **Foreign Keys**: Semua foreign keys sudah didefinisikan di Prisma schema
