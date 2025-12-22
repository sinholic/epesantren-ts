# Deployment Guide

## Vercel Deployment dengan GitHub Actions

Repository ini sudah dikonfigurasi dengan GitHub Actions workflow untuk otomatis deploy ke Vercel setiap ada push ke branch `main`.

## Setup GitHub Secrets

Sebelum workflow bisa berjalan, Anda perlu setup secrets berikut di GitHub repository:

### 1. Vercel Token
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Buka [Settings > Tokens](https://vercel.com/account/tokens)
3. Buat token baru dengan nama "GitHub Actions"
4. Copy token tersebut
5. Di GitHub repository, buka **Settings > Secrets and variables > Actions**
6. Klik **New repository secret**
7. Name: `VERCEL_TOKEN`
8. Value: paste token dari Vercel
9. Klik **Add secret**

### 2. Vercel Organization ID
1. Install Vercel CLI: `yarn global add vercel`
2. Login: `vercel login`
3. Link project: `vercel link` (jika belum)
4. Atau cek file `.vercel/project.json` untuk melihat `orgId`
5. Di GitHub, buat secret baru:
   - Name: `VERCEL_ORG_ID`
   - Value: Organization ID dari Vercel

### 3. Vercel Project ID
1. Setelah `vercel link`, cek file `.vercel/project.json` untuk melihat `projectId`
2. Atau dari Vercel Dashboard, buka project settings
3. Di GitHub, buat secret baru:
   - Name: `VERCEL_PROJECT_ID`
   - Value: Project ID dari Vercel

### 4. Database & JWT Secrets
1. Di GitHub, buat secret:
   - Name: `DATABASE_URL`
   - Value: Database connection string (contoh: `postgresql://user:password@host:5432/dbname`)
2. Di GitHub, buat secret:
   - Name: `JWT_SECRET`
   - Value: Secret key untuk JWT (minimal 32 karakter random)

## Setup Vercel Project

### Opsi 1: Setup via Vercel Dashboard (Recommended)
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New Project**
3. Import repository `sinholic/epesantren-ts`
4. Configure project:
   - Framework Preset: Next.js
   - Root Directory: `./`
   - Build Command: `yarn build`
   - Install Command: `yarn install`
   - Output Directory: `.next`
5. Add Environment Variables:
   - `DATABASE_URL` - Database connection string
   - `JWT_SECRET` - JWT secret key
6. Deploy

### Opsi 2: Setup via Vercel CLI
```bash
# Install Vercel CLI
yarn global add vercel

# Login
vercel login

# Link project (first time)
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add JWT_SECRET

# Deploy
vercel --prod
```

## Workflow Files

Repository ini memiliki 3 workflow files:

### 1. `deploy-vercel.yml` (Recommended - but requires GitHub-Vercel connection)
- Menggunakan Vercel GitHub Action
- Lebih sederhana dan terintegrasi
- Auto-deploy ke production
- **Requires:** GitHub account connected to Vercel

### 2. `deploy-vercel-cli.yml` (Recommended - No Git Author Required)
- Menggunakan Vercel CLI langsung
- Tidak memerlukan git author access
- Paling aman untuk GitHub Actions
- **Use this if you get "git author access" error**

### 3. `deploy-vercel-simple.yml` (Alternative)
- Menggunakan Vercel CLI dengan prebuilt artifacts
- Lebih fleksibel untuk custom build
- Manual control lebih banyak

## Workflow Triggers

Workflow akan otomatis berjalan ketika:
- Push ke branch `main`
- Pull request ke branch `main` (untuk preview deployments)

## Manual Deployment

Jika ingin deploy manual tanpa GitHub Actions:

```bash
# Install dependencies
yarn install

# Generate Prisma Client
yarn prisma:generate

# Build project
yarn build

# Deploy to Vercel
vercel --prod
```

## Environment Variables di Vercel

Pastikan semua environment variables sudah di-set di Vercel Dashboard:
- `DATABASE_URL` - Database connection string
- `JWT_SECRET` - JWT secret key

## Troubleshooting

### Build Fails
1. Cek logs di GitHub Actions
2. Pastikan semua secrets sudah di-set dengan benar
3. Pastikan `DATABASE_URL` dan `JWT_SECRET` valid
4. Cek Prisma schema dan pastikan database accessible

### Deployment Fails
1. Cek Vercel logs di dashboard
2. Pastikan `VERCEL_TOKEN`, `VERCEL_ORG_ID`, dan `VERCEL_PROJECT_ID` valid
3. Pastikan project sudah di-link di Vercel

### Error: "Deployment request did not have a git author with contributing access"
Error ini terjadi ketika GitHub account yang digunakan untuk commit tidak terhubung dengan Vercel account.

**Solusi 1: Connect GitHub Account ke Vercel (Recommended)**
1. Login ke [Vercel Dashboard](https://vercel.com/dashboard)
2. Buka [Settings > Git](https://vercel.com/account/git)
3. Pastikan GitHub account sudah terhubung
4. Jika belum, klik "Connect GitHub" dan authorize

**Solusi 2: Gunakan Workflow CLI (Recommended untuk GitHub Actions)**
Jika masih error, gunakan workflow `deploy-vercel-cli.yml` yang tidak memerlukan git author access:
1. Disable atau rename `deploy-vercel.yml` (opsional)
2. Rename `deploy-vercel-cli.yml` menjadi `deploy-vercel.yml` (atau biarkan keduanya aktif)
3. Workflow CLI tidak memerlukan git author access dan lebih aman untuk GitHub Actions

**Solusi 3: Gunakan Workflow Simple (Alternative)**
Alternatif lain, gunakan workflow `deploy-vercel-simple.yml`:
1. Rename atau disable `deploy-vercel.yml`
2. Enable `deploy-vercel-simple.yml` (rename dari `deploy-vercel-simple.yml` ke `deploy-vercel.yml`)
3. Workflow simple menggunakan prebuilt artifacts

**Solusi 4: Setup Vercel Project via Dashboard**
1. Import repository langsung dari Vercel Dashboard
2. Vercel akan otomatis setup GitHub integration
3. Set environment variables di Vercel Dashboard
4. Deploy manual pertama kali, kemudian GitHub Actions akan bekerja

### Prisma Client Not Generated
- Workflow sudah include step `yarn prisma:generate`
- Pastikan Prisma schema valid
- Cek database connection

## Production Checklist

- [ ] GitHub secrets sudah di-set (VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID, DATABASE_URL, JWT_SECRET)
- [ ] Vercel project sudah dibuat dan di-link
- [ ] Environment variables sudah di-set di Vercel Dashboard
- [ ] Database sudah accessible dari Vercel
- [ ] Prisma schema sudah sesuai dengan database
- [ ] Build berhasil di local (`yarn build`)
- [ ] Test deployment di preview environment dulu

## Support

Jika ada masalah dengan deployment, cek:
1. GitHub Actions logs
2. Vercel deployment logs
3. Vercel project settings
4. Environment variables configuration
