# ePesantren - Sistem Informasi Manajemen Pesantren

Aplikasi sistem informasi manajemen pesantren yang telah direfactor dari PHP (CodeIgniter) ke TypeScript dengan Next.js untuk deployment di Vercel.

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MySQL dengan Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## ✨ Features

### Authentication System
- ✅ Admin/User authentication dengan email & password
- ✅ Student authentication dengan NIS & password
- ✅ Teacher authentication dengan email & password
- ✅ PPDB authentication dengan NISN & password
- ✅ JWT-based authentication dengan HTTP-only cookies
- ✅ Secure password hashing dengan bcrypt
- ✅ Backward compatibility dengan SHA1 password migration

### Frontend Pages
- ✅ Portal home page dengan akses ke 4 role
- ✅ Login pages untuk Admin, Student, Teacher, dan PPDB
- ✅ Dashboard pages untuk setiap role
- ✅ Student management (CRUD operations)
- ✅ Payment management dengan filtering
- ✅ Responsive design dengan Tailwind CSS

### API Endpoints
- ✅ Authentication APIs untuk semua role
- ✅ Student CRUD operations
- ✅ Payment management (Bulan & Bebas)
- ✅ Dashboard statistics
- ✅ Class & Major management

## 📋 Prerequisites

- Node.js 20+ (atau versi yang didukung)
- Yarn package manager
- MySQL database
- Vercel account (untuk deployment)

## 🛠️ Setup Development

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd epesantren-ts
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` dan isi dengan konfigurasi database Anda:
   ```env
   DATABASE_URL="mysql://username:password@localhost:3306/database_name"
   JWT_SECRET="your-secret-key-here"
   NODE_ENV="development"
   ```

4. **Setup Prisma**
   ```bash
   # Generate Prisma Client
   yarn prisma:generate
   
   # (Optional) Run migrations jika diperlukan
   yarn prisma:migrate
   ```

5. **Run development server**
   ```bash
   yarn dev
   ```

   Aplikasi akan berjalan di http://localhost:3000

## 📁 Struktur Project

```
epesantren-ts/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/         # Admin authentication
│   │   ├── student/      # Student authentication & CRUD
│   │   ├── teacher/      # Teacher authentication
│   │   ├── ppdb/         # PPDB authentication
│   │   ├── payments/     # Payment management
│   │   ├── dashboard/    # Dashboard endpoints
│   │   ├── classes/      # Class management
│   │   └── majors/       # Major management
│   ├── manage/           # Admin pages
│   │   ├── auth/        # Admin login
│   │   ├── dashboard/   # Admin dashboard
│   │   ├── students/    # Student management
│   │   └── payments/     # Payment management
│   ├── student/          # Student pages
│   │   ├── auth/        # Student login
│   │   └── dashboard/   # Student dashboard
│   ├── teacher/          # Teacher pages
│   │   ├── auth/        # Teacher login
│   │   └── dashboard/   # Teacher dashboard
│   ├── ppdb/             # PPDB pages
│   │   ├── auth/        # PPDB login
│   │   └── dashboard/   # PPDB dashboard
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home portal
│   └── globals.css       # Global styles
├── components/            # React components
│   ├── ui/              # UI components (Button, Input, Modal, etc)
│   └── layout/          # Layout components (AdminLayout)
├── lib/                   # Utility libraries
│   ├── prisma.ts         # Prisma client instance
│   ├── auth.ts           # Admin authentication
│   ├── auth-student.ts   # Student authentication
│   ├── auth-teacher.ts   # Teacher authentication
│   ├── auth-ppdb.ts      # PPDB authentication
│   └── middleware.ts     # Auth middleware
├── prisma/
│   └── schema.prisma     # Database schema
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── vercel.json
```

## 🔐 Authentication

Aplikasi mendukung 4 jenis authentication:

1. **Admin/User Authentication** (`/api/auth/*`)
   - Login dengan email dan password
   - Token disimpan di cookie `auth_token`
   - Access: `/manage/*`

2. **Student Authentication** (`/api/student/auth/*`)
   - Login dengan NIS dan password
   - Token disimpan di cookie `student_token`
   - Access: `/student/*`

3. **Teacher Authentication** (`/api/teacher/auth/*`)
   - Login dengan email dan password
   - Token disimpan di cookie `teacher_token`
   - Access: `/teacher/*`

4. **PPDB Authentication** (`/api/ppdb/auth/*`)
   - Login dengan NISN dan password
   - Token disimpan di cookie `ppdb_token`
   - Access: `/ppdb/*`

### Password Security

- Password baru menggunakan bcrypt hashing
- Mendukung migrasi otomatis dari SHA1 ke bcrypt
- Password lama tetap bisa login dan akan di-upgrade otomatis

## 📡 API Endpoints

### Authentication

#### Admin
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/me` - Get current admin user

#### Student
- `POST /api/student/auth/login` - Student login
- `POST /api/student/auth/logout` - Student logout
- `GET /api/student/auth/me` - Get current student

#### Teacher
- `POST /api/teacher/auth/login` - Teacher login
- `POST /api/teacher/auth/logout` - Teacher logout
- `GET /api/teacher/auth/me` - Get current teacher

#### PPDB
- `POST /api/ppdb/auth/login` - PPDB login
- `POST /api/ppdb/auth/logout` - PPDB logout
- `GET /api/ppdb/auth/me` - Get current PPDB participant

### Data Management

#### Students
- `GET /api/students` - Get list of students (with pagination)
  - Query params: `page`, `limit`, `search`
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get student by ID
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

#### Payments
- `GET /api/payments` - Get list of payments (with pagination)
  - Query params: `page`, `limit`, `studentId`
- `POST /api/payments` - Create new payment
- `GET /api/payments/bulan` - Get bulan payments
- `POST /api/payments/bulan` - Create bulan payment
- `GET /api/payments/bebas` - Get bebas payments
- `POST /api/payments/bebas` - Create bebas payment

#### Dashboard
- `GET /api/dashboard` - Get dashboard statistics (requires auth)

#### Reference Data
- `GET /api/classes` - Get list of classes
- `GET /api/majors` - Get list of majors

## 🎨 UI Components

Aplikasi menggunakan komponen UI reusable:

- **Button** - Primary, secondary, danger, outline variants
- **Input** - Text input dengan label dan error handling
- **Select** - Dropdown dengan label dan error handling
- **Modal** - Dialog modal dengan berbagai ukuran
- **Table** - Data table dengan pagination dan actions

## 🚢 Deployment ke Vercel

### Automatic Deployment dengan GitHub Actions

Repository ini sudah dikonfigurasi dengan GitHub Actions untuk otomatis deploy ke Vercel setiap ada push ke branch `main`.

#### Setup GitHub Secrets

Sebelum workflow bisa berjalan, setup secrets berikut di GitHub repository:

1. **VERCEL_TOKEN** - Token dari [Vercel Settings > Tokens](https://vercel.com/account/tokens)
2. **VERCEL_ORG_ID** - Organization ID dari Vercel (cek di `.vercel/project.json` setelah `vercel link`)
3. **VERCEL_PROJECT_ID** - Project ID dari Vercel (cek di `.vercel/project.json`)
4. **DATABASE_URL** - Database connection string
5. **JWT_SECRET** - Secret key untuk JWT (minimal 32 karakter)

Cara setup:
- Buka GitHub repository > **Settings > Secrets and variables > Actions**
- Klik **New repository secret**
- Tambahkan semua secrets di atas

#### Setup Vercel Project

1. **Import project ke Vercel**
   - Buka https://vercel.com
   - Klik "New Project"
   - Import repository `sinholic/epesantren-ts`
   - Vercel akan otomatis detect Next.js

2. **Setup Environment Variables**
   Di Vercel dashboard, tambahkan:
   - `DATABASE_URL` - Connection string database
   - `JWT_SECRET` - Secret key untuk JWT (generate random string)
   - `NODE_ENV` - Set ke `production`

3. **Link Project (untuk mendapatkan IDs)**
   ```bash
   yarn global add vercel
   vercel login
   vercel link
   ```
   File `.vercel/project.json` akan dibuat dengan `orgId` dan `projectId`

4. **Deploy**
   - Push ke branch `main` akan otomatis trigger deployment
   - Atau deploy manual: `vercel --prod`

📖 **Dokumentasi lengkap**: Lihat [DEPLOYMENT.md](./DEPLOYMENT.md) untuk detail setup dan troubleshooting.

## 🔄 Migration dari PHP

Aplikasi ini adalah refactor lengkap dari aplikasi PHP CodeIgniter. Perubahan utama:

- ✅ Database schema tetap sama (menggunakan Prisma)
- ✅ Authentication logic dipertahankan dengan security improvements
- ✅ API endpoints dibuat untuk menggantikan PHP controllers
- ✅ Frontend dibuat dengan Next.js dan Tailwind CSS
- ✅ Password hashing ditingkatkan dari SHA1 ke bcrypt
- ✅ CSRF protection dan XSS filtering diaktifkan

## 📝 Development Notes

### Menambahkan API Route Baru

1. Buat file di `app/api/[route]/route.ts`
2. Gunakan `requireAuth` untuk protected routes
3. Gunakan Prisma untuk database operations

Contoh:
```typescript
import { requireAuth } from '@/lib/middleware'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

async function handler(req: Request) {
  // Your logic here
  return NextResponse.json({ data: 'result' })
}

export const GET = requireAuth(handler)
```

### Menambahkan Model Baru

1. Edit `prisma/schema.prisma`
2. Run `yarn prisma:generate`
3. Model akan tersedia di `prisma` client

### Menambahkan Halaman Baru

1. Buat file di `app/[route]/page.tsx`
2. Gunakan layout yang sesuai (AdminLayout untuk admin pages)
3. Import komponen UI dari `@/components/ui`

## 🐛 Troubleshooting

### Prisma Client Error
```bash
yarn prisma:generate
```

### Database Connection Error
- Pastikan `DATABASE_URL` di `.env` benar
- Pastikan database server running
- Check firewall/network settings

### Build Error di Vercel
- Pastikan semua dependencies terinstall
- Check `package.json` scripts
- Pastikan environment variables sudah di-set

### TypeScript Errors
```bash
yarn prisma:generate
# Restart TypeScript server di editor
```

## 📄 License

MIT

## 👥 Contributors

- Original PHP version: bharyon4
- TypeScript refactor: [Your Name]

## 🔗 Links

- GitHub: [Your Repository URL]
- Vercel Deployment: [Your Vercel URL]
