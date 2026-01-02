# Database Connection URL Encoding Fix

## Problem

If your database password contains special characters (like `)`, `@`, `#`, `$`, etc.), the connection will fail with authentication errors because these characters need to be URL-encoded in the connection string.

## Solution

### Option 1: URL Encode the Password (Recommended)

If your password is: `tk0ru-9UXM)ULGxFYrk1S37g`

The `)` character needs to be encoded as `%29`, so the password becomes: `tk0ru-9UXM%29ULGxFYrk1S37g`

**Your DATABASE_URL should be:**
```
DATABASE_URL=mysql://dbpgf25301457:tk0ru-9UXM%29ULGxFYrk1S37g@serverless-europe-west9.sysp0000.db2.skysql.com:4046/epea3612_prod
```

### Option 2: Use URL Encoding Helper

The application now includes automatic URL encoding in `lib/database.ts`. However, it's still recommended to properly encode the password in your environment variables.

### Common Special Characters Encoding

| Character | Encoded |
|-----------|---------|
| `@` | `%40` |
| `#` | `#23` |
| `$` | `%24` |
| `%` | `%25` |
| `&` | `%26` |
| `(` | `%28` |
| `)` | `%29` |
| `*` | `%2A` |
| `+` | `%2B` |
| `/` | `%2F` |
| `:` | `%3A` |
| `=` | `%3D` |
| `?` | `%3F` |
| ` ` (space) | `%20` |

### Quick Fix for Your Current Password

Your password: `tk0ru-9UXM)ULGxFYrk1S37g`

Encoded password: `tk0ru-9UXM%29ULGxFYrk1S37g`

**Updated DATABASE_URL:**
```
DATABASE_URL=mysql://dbpgf25301457:tk0ru-9UXM%29ULGxFYrk1S37g@serverless-europe-west9.sysp0000.db2.skysql.com:4046/epea3612_prod
```

### How to Encode Manually

You can use JavaScript/Node.js to encode:

```javascript
const password = "tk0ru-9UXM)ULGxFYrk1S37g"
const encoded = encodeURIComponent(password)
console.log(encoded) // tk0ru-9UXM%29ULGxFYrk1S37g
```

Or use online tools:
- https://www.urlencoder.org/
- https://www.url-encode-decode.com/

### Update Environment Variables

1. **Vercel Dashboard:**
   - Go to your project settings
   - Navigate to Environment Variables
   - Update `DATABASE_URL` with the encoded password

2. **Local `.env` file:**
   - Update the `DATABASE_URL` with the encoded password

3. **GitHub Secrets (if using workflows):**
   - Update the `DATABASE_URL` secret with the encoded password

## Testing

After updating the DATABASE_URL, test the connection:

```bash
# Test with Prisma
yarn prisma db pull

# Or test with MySQL client
mysql -h serverless-europe-west9.sysp0000.db2.skysql.com -P 4046 -u dbpgf25301457 -p epea3612_prod
# Enter password: tk0ru-9UXM)ULGxFYrk1S37g (original, not encoded)
```

## Notes

- The application now includes automatic URL encoding in `lib/database.ts` as a fallback
- However, it's still best practice to properly encode passwords in environment variables
- Never commit DATABASE_URL with real credentials to version control
