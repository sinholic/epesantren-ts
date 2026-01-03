# Dynamic School Branding Setup

This application supports dynamic school branding based on domain/subdomain. Each school can have its own branding (name, logo, primary color) while sharing the same application codebase.

## How It Works

1. **Server-Side Resolution**: Branding is resolved server-side on each request based on the `Host` header
2. **Database Lookup**: The system queries the `schools` table to find matching school by domain
3. **Fallback**: If no school is found, default branding is used
4. **Context Provider**: Branding is provided via React Context to all components

## Database Schema

The `School` model in Prisma schema:

```prisma
model School {
  id            Int       @id @default(autoincrement())
  school_name   String    @db.VarChar(255)
  logo_url      String?   @db.VarChar(255)
  primary_color String?   @db.VarChar(7)  // Hex color code (e.g., "#5e19e6")
  domain        String    @unique @db.VarChar(255)
  created_at    DateTime? @default(now()) @db.Timestamp
  updated_at    DateTime? @default(now()) @updatedAt @db.Timestamp
  deleted_at    DateTime? @db.Timestamp

  @@map("schools")
}
```

## Environment Variables

### Required
- `NEXT_PUBLIC_APP_NAME`: Product name (constant across all schools)
  - Example: `"ePesantren"`

### Optional
- `DATABASE_URL`: Database connection string (required for branding lookup)

## Setup Instructions

### 1. Add School Data to Database

Insert school records into the `schools` table:

```sql
INSERT INTO schools (school_name, logo_url, primary_color, domain, created_at, updated_at)
VALUES 
  ('SMA Negeri 1 Jakarta', 'https://example.com/logo.png', '#5e19e6', 'sman1jakarta.school.id', NOW(), NOW()),
  ('SMA Negeri 2 Bandung', 'https://example.com/logo2.png', '#0066cc', 'sman2bandung.school.id', NOW(), NOW());
```

### 2. Configure Domain

- **Exact Match**: Use full domain (e.g., `sman1jakarta.school.id`)
- **Subdomain Support**: System automatically tries parent domain for subdomains
  - Example: `app.sman1jakarta.school.id` → matches `sman1jakarta.school.id`

### 3. Set Environment Variables

Add to `.env` or Vercel Environment Variables:

```bash
NEXT_PUBLIC_APP_NAME="ePesantren"
DATABASE_URL="postgresql://..."
```

## Usage in Components

### Server Components

Branding is automatically resolved in `app/layout.tsx` and passed via `BrandingProvider`.

### Client Components

Use the `useBranding` hook:

```tsx
'use client'

import { useBranding } from '@/components/providers/BrandingProvider'

export default function MyComponent() {
  const branding = useBranding()
  
  return (
    <div>
      <h1>{branding.appName}</h1>
      <p>{branding.schoolName}</p>
      {branding.logoUrl && (
        <img src={branding.logoUrl} alt={branding.schoolName} />
      )}
    </div>
  )
}
```

## Branding Properties

```typescript
interface Branding {
  appName: string        // Product name (from NEXT_PUBLIC_APP_NAME)
  schoolName: string     // School name (from database)
  logoUrl: string | null // Logo URL (from database, optional)
  primaryColor: string | null // Primary color hex (from database, optional)
}
```

## Where Branding is Used

1. **Login Page** (`app/page.tsx`):
   - Logo display
   - App name in header
   - Welcome message

2. **Admin Layout** (`components/layout/AdminLayout.tsx`):
   - Sidebar header (logo + app name)
   - School name subtitle

3. **Dashboard Pages**:
   - Page headers with app name
   - School name display

4. **Primary Color**:
   - Automatically injected as CSS variable `--primary`
   - Used throughout the UI for buttons, links, etc.

## API Endpoint

### GET `/api/public/branding`

Server-side only endpoint to fetch branding. Returns:

```json
{
  "appName": "ePesantren",
  "schoolName": "SMA Negeri 1 Jakarta",
  "logoUrl": "https://example.com/logo.png",
  "primaryColor": "#5e19e6"
}
```

**Note**: This endpoint is primarily for server-side usage. Client components should use the `useBranding` hook instead.

## Troubleshooting

### Branding Not Resolving

1. Check database connection
2. Verify school record exists with correct `domain`
3. Check `Host` header in request
4. Verify `deleted_at` is NULL

### Logo Not Displaying

1. Verify `logo_url` is set in database
2. Check logo URL is accessible (CORS, authentication)
3. Ensure logo URL is absolute (not relative)

### Primary Color Not Applied

1. Verify `primary_color` is set in database
2. Check format is valid hex color (e.g., `#5e19e6`)
3. Clear browser cache

## Migration

To migrate existing hardcoded branding:

1. Create `schools` table (already in Prisma schema)
2. Insert school records
3. Deploy updated code
4. Branding will automatically resolve per domain

No code changes needed in individual pages - they automatically use branding from context.
