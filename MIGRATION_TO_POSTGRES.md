# Migration to PostgreSQL with Snake Case and Enums

This document describes the migration from MySQL/MariaDB to PostgreSQL with snake_case field names and enum types.

## Changes Made

### 1. Database Provider

- Changed from `mysql` to `postgresql` in Prisma schema
- Updated connection string format in `.env.example`

### 2. Field Names

All field names have been converted from camelCase to snake_case:

- `userId` → `user_id`
- `userEmail` → `user_email`
- `studentNis` → `student_nis`
- `paymentType` → `payment_type`
- etc.

### 3. Enums Created

The following enums have been created for better type safety:

- **Gender**: `L` (Laki-laki), `P` (Perempuan)
- **PaymentType**: `BULAN`, `BEBAS`
- **Agama**: `ISLAM`, `KRISTEN`, `KATOLIK`, `HINDU`, `BUDHA`, `KONGHUCU`
- **Pendidikan**: `TIDAK_SEKOLAH`, `SD`, `SMP`, `SMA`, `D3`, `S1`, `S2`, `S3`
- **TinggalBersama**: `BERSAMA_ORANGTUA`, `BERSAMA_WALI`
- **StatusOrangTua**: `MASIH_HIDUP`, `MENINGGAL`
- **PaymentMethod**: `CASH`, `TRANSFER`, `E_WALLET`, `OTHER`

## Files Updated

### Core Libraries

- ✅ `lib/auth.ts` - Updated to use snake_case
- ✅ `lib/auth-student.ts` - Updated to use snake_case
- ✅ `lib/auth-ppdb.ts` - Updated to use snake_case and Prisma model
- ✅ `lib/middleware.ts` - Updated to use snake_case
- ✅ `prisma/schema.prisma` - Complete rewrite with PostgreSQL, snake_case, and enums

### API Routes (Partially Updated)

- ✅ `app/api/auth/login/route.ts` - Updated response format
- ✅ `app/api/auth/me/route.ts` - Updated field names

### API Routes (Need Update)

The following files need to be updated to use snake_case field names:

#### Authentication Routes

- `app/api/student/auth/login/route.ts`
- `app/api/student/auth/me/route.ts`
- `app/api/teacher/auth/login/route.ts`
- `app/api/teacher/auth/me/route.ts`
- `app/api/ppdb/auth/login/route.ts`
- `app/api/ppdb/auth/me/route.ts`

#### Data Management Routes

- `app/api/users/route.ts`
- `app/api/users/[id]/route.ts`
- `app/api/users/roles/route.ts`
- `app/api/students/route.ts`
- `app/api/students/[id]/route.ts`
- `app/api/classes/route.ts`
- `app/api/classes/[id]/route.ts`
- `app/api/majors/route.ts`
- `app/api/majors/[id]/route.ts`
- `app/api/periods/route.ts`
- `app/api/periods/[id]/route.ts`
- `app/api/pos/route.ts`
- `app/api/pos/[id]/route.ts`
- `app/api/payments/route.ts`
- `app/api/payments/bulan/route.ts`
- `app/api/payments/bulan/[id]/route.ts`
- `app/api/payments/bebas/route.ts`
- `app/api/payments/bebas/[id]/route.ts`
- `app/api/settings/route.ts`
- `app/api/settings/[id]/route.ts`
- `app/api/profile/route.ts`
- `app/api/profile/password/route.ts`
- `app/api/dashboard/route.ts`

#### Frontend Pages (Need Update)

- `app/manage/students/page.tsx`
- `app/manage/payments/page.tsx`
- All other frontend pages that use Prisma models

## Field Name Mapping

### User Model

```typescript
// Old (camelCase)
userId, userEmail, userPassword, userFullName, userImage, userDescription, userRoleRoleId, userIsDeleted, userInputDate, userLastUpdate

// New (snake_case)
user_id, user_email, user_password, user_full_name, user_image, user_description, user_role_role_id, user_is_deleted, user_input_date, user_last_update
```

### Student Model

```typescript
// Old
studentId, studentNis, studentNisn, studentPassword, studentFullName, studentGender, studentBornPlace, studentBornDate, studentImg, studentPhone, studentHobby, studentAddress, studentNameOfMother, studentNameOfFather, studentParentPhone, classClassId, majorsMajorsId, studentStatus, studentInputDate, studentLastUpdate

// New
student_id, student_nis, student_nisn, student_password, student_full_name, student_gender, student_born_place, student_born_date, student_img, student_phone, student_hobby, student_address, student_name_of_mother, student_name_of_father, student_parent_phone, class_class_id, majors_majors_id, student_status, student_input_date, student_last_update
```

### Payment Model

```typescript
// Old
paymentId, paymentType, periodPeriodId, posPosId, paymentInputDate, paymentLastUpdate

// New
payment_id, payment_type, period_period_id, pos_pos_id, payment_input_date, payment_last_update
```

## How to Update Remaining Files

### Step 1: Update Prisma Queries

Replace all camelCase field names with snake_case:

```typescript
// Before
const user = await prisma.user.findUnique({
  where: { userId: 1 },
  select: {
    userId: true,
    userEmail: true,
  }
})

// After
const user = await prisma.user.findUnique({
  where: { user_id: 1 },
  select: {
    user_id: true,
    user_email: true,
  }
})
```

### Step 2: Update Response Objects

Keep API responses in camelCase for frontend compatibility:

```typescript
// Before
return NextResponse.json({
  user: {
    userId: user.userId,
    email: user.userEmail,
  }
})

// After
return NextResponse.json({
  user: {
    userId: user.user_id,
    email: user.user_email,
  }
})
```

### Step 3: Update Enum Values

Use enum values instead of strings:

```typescript
// Before
studentGender: 'L' // or 'P'

// After
student_gender: Gender.L // or Gender.P
```

### Step 4: Update Create/Update Operations

```typescript
// Before
await prisma.student.create({
  data: {
    studentNis: '12345',
    studentGender: 'L',
  }
})

// After
await prisma.student.create({
  data: {
    student_nis: '12345',
    student_gender: Gender.L,
  }
})
```

## Database Migration

### 1. Generate Prisma Client

```bash
yarn prisma:generate
```

### 2. Create Migration

```bash
yarn prisma:migrate dev --name migrate_to_postgres_snake_case
```

### 3. Apply Migration

```bash
yarn prisma:migrate deploy
```

## Testing

After migration, test the following:

1. ✅ Authentication (login, logout, me)
2. ⏳ Student CRUD operations
3. ⏳ Payment operations
4. ⏳ All API endpoints
5. ⏳ Frontend pages

## Notes

- All enum values in Prisma schema use UPPER_SNAKE_CASE for consistency
- API responses maintain camelCase for frontend compatibility
- Database fields use snake_case
- TypeScript interfaces use snake_case to match Prisma models
