# MariaDB Setup Guide

## Overview

Aplikasi E-Pesantren menggunakan **MariaDB** sebagai database dengan Prisma ORM dan adapter khusus `@prisma/adapter-mariadb`.

## Why MariaDB Adapter?

Berdasarkan [dokumentasi Prisma](https://www.prisma.io/docs/orm/overview/databases/mysql), MariaDB memerlukan adapter khusus untuk:
- Kompatibilitas penuh dengan fitur-fitur MariaDB
- Optimasi performa untuk MariaDB
- Dukungan untuk fitur-fitur spesifik MariaDB

## Installation

Adapter sudah terinstall di `package.json`:
```json
"@prisma/adapter-mariadb": "^7.2.0"
```

## Configuration

### 1. Prisma Schema

Di `prisma/schema.prisma`, provider tetap menggunakan `mysql`:
```prisma
datasource db {
  provider = "mysql" // MariaDB uses mysql provider with @prisma/adapter-mariadb
  url      = env("DATABASE_URL")
}
```

### 2. Prisma Client

Di `lib/prisma.ts`, Prisma Client dikonfigurasi dengan MariaDB adapter:
```typescript
import { PrismaMariaDB } from '@prisma/adapter-mariadb'
import mariadb from 'mariadb'

// Create MariaDB connection pool
const pool = mariadb.createPool(connectionConfig)
const adapter = new PrismaMariaDB(pool)

export const prisma = new PrismaClient({
  adapter,
  // ... other options
})
```

### 3. Connection String

Connection string tetap menggunakan format `mysql://` karena MariaDB kompatibel dengan MySQL protocol:
```env
DATABASE_URL="mysql://username:password@host:port/database_name"
```

**Contoh:**
```env
DATABASE_URL="mysql://dbpgf25301457:tk0ru-9UXM%29ULGxFYrk1S37g@serverless-europe-west9.sysp0000.db2.skysql.com:4046/epea3612_prod"
```

**Catatan:** Pastikan password di-URL encode jika mengandung karakter khusus (misalnya `)` menjadi `%29`).

## Features

### Connection Pooling

MariaDB adapter menggunakan connection pooling untuk:
- Mengurangi overhead koneksi
- Meningkatkan performa
- Mengelola koneksi dengan efisien

Konfigurasi default:
- `connectionLimit: 10` - Maksimal 10 koneksi dalam pool
- `acquireTimeout: 60000` - Timeout 60 detik untuk mendapatkan koneksi
- `timeout: 60000` - Timeout 60 detik untuk query

### Error Handling

Adapter menangani error koneksi dengan baik:
- Automatic reconnection
- Connection pool management
- Clear error messages

## Troubleshooting

### Error: "Authentication failed"

1. **Cek password sudah di-URL encode:**
   ```bash
   # Password dengan karakter khusus perlu di-encode
   # Contoh: tk0ru-9UXM)ULGxFYrk1S37g
   # Menjadi: tk0ru-9UXM%29ULGxFYrk1S37g
   ```

2. **Cek kredensial database:**
   - Username benar
   - Password benar
   - Host dan port benar
   - Database name benar

### Error: "Connection timeout"

1. **Cek koneksi network ke database server**
2. **Cek firewall rules**
3. **Cek database server status**

### Error: "Pool exhausted"

1. **Tingkatkan `connectionLimit` di `lib/prisma.ts`:**
   ```typescript
   connectionLimit: 20, // Increase from 10 to 20
   ```

2. **Cek apakah ada connection leak (koneksi tidak di-close)**

## Migration from MySQL

Jika sebelumnya menggunakan MySQL tanpa adapter, tidak ada perubahan yang diperlukan karena:
- Connection string format sama
- Prisma schema tetap menggunakan `provider = "mysql"`
- Hanya perlu install `@prisma/adapter-mariadb` dan update `lib/prisma.ts`

## References

- [Prisma MariaDB Documentation](https://www.prisma.io/docs/orm/overview/databases/mysql)
- [MariaDB Node.js Driver](https://github.com/mariadb-corporation/mariadb-connector-nodejs)
- [Prisma Adapter MariaDB](https://www.npmjs.com/package/@prisma/adapter-mariadb)
