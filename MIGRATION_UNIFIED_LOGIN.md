# Migration Guide: Unified Login dengan Username

## Overview

Sistem login sekarang menggunakan **username dan password** untuk semua role (Admin, Student, Teacher) dari satu table `users`. PPDB tetap menggunakan login terpisah.

## Perubahan Schema

### 1. Field Baru di Table `users`

- `username` (VARCHAR(100), UNIQUE) - Username untuk login
- `user_role_type` (ENUM: ADMIN, STUDENT, TEACHER, PPDB) - Tipe role user

### 2. Migration SQL

```sql
-- Tambahkan column username
ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE;

-- Tambahkan enum untuk user_role_type
CREATE TYPE user_role_type AS ENUM ('ADMIN', 'STUDENT', 'TEACHER', 'PPDB');

-- Tambahkan column user_role_type
ALTER TABLE users ADD COLUMN user_role_type user_role_type;

-- Update username untuk user yang sudah ada
-- Admin: gunakan email sebagai username
UPDATE users 
SET username = user_email 
WHERE user_email IS NOT NULL AND user_role_role_id = 1; -- Sesuaikan role_id untuk admin

-- Student: perlu mapping dari table student ke users
-- Buat user di table users untuk setiap student yang belum ada
INSERT INTO users (username, user_password, user_full_name, user_role_type, user_role_role_id)
SELECT 
  student_nis as username,
  student_password,
  student_full_name,
  'STUDENT'::user_role_type,
  2 -- Sesuaikan role_id untuk student
FROM student
WHERE student_nis IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM users WHERE username = student.student_nis
);

-- Teacher: perlu mapping dari table teacher ke users (jika ada)
-- Buat user di table users untuk setiap teacher yang belum ada
-- Sesuaikan dengan struktur table teacher yang ada
```

## Cara Kerja

1. **Login Process:**
   - User memasukkan username dan password
   - System check di table `users` berdasarkan `username`
   - Jika valid, redirect berdasarkan `user_role_type`:
     - `ADMIN` → `/manage/dashboard`
     - `STUDENT` → `/student/dashboard`
     - `TEACHER` → `/teacher/dashboard`

2. **PPDB Login:**
   - Tetap terpisah di `/ppdb/auth`
   - Menggunakan table `ppdb_participant`

## API Changes

### POST `/api/auth/login`

**Request:**
```json
{
  "username": "admin123",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "userId": 1,
    "username": "admin123",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "roleId": 1,
    "roleType": "ADMIN"
  },
  "redirectPath": "/manage/dashboard",
  "token": "jwt_token_here"
}
```

## Frontend Changes

### Login Page: `/login`

- Form dengan field `username` dan `password`
- Auto redirect berdasarkan `roleType` setelah login berhasil
- Link ke PPDB login (terpisah)

### Home Page: `/`

- Menampilkan 2 card:
  - **Login** - untuk Admin, Student, Teacher
  - **PPDB** - untuk PPDB (terpisah)

## Migration Steps

1. **Run Prisma Migration:**
   ```bash
   yarn prisma:migrate dev --name add_username_and_role_type
   ```

2. **Update Existing Users:**
   - Set username untuk semua user yang sudah ada
   - Set user_role_type berdasarkan role_id
   - Mapping student dan teacher ke table users

3. **Test Login:**
   - Test login dengan username untuk setiap role
   - Verify redirect paths bekerja dengan benar

## Notes

- Password hashing tetap menggunakan bcrypt
- Legacy SHA1 passwords tetap didukung (auto upgrade)
- PPDB login tetap terpisah dan tidak terpengaruh
- Semua user harus punya username yang unique
