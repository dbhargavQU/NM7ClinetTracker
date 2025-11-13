# Fix Database Connection Issue

## Problem
Vercel can't connect to Supabase database because SSL is required.

## Solution

### Option 1: Update DATABASE_URL in Vercel (Recommended)

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find `DATABASE_URL`
3. Edit it and add `?sslmode=require` at the end:

**Current:**
```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**Updated:**
```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

4. Save and redeploy

### Option 2: Use Supabase Connection Pooler (Better for Production)

Supabase provides a connection pooler URL that's better for serverless environments:

1. Go to Supabase Dashboard → Your Project → Settings → Database
2. Find "Connection Pooling" section
3. Copy the "Connection string" (it will have `pooler.supabase.com` in the URL)
4. Update `DATABASE_URL` in Vercel with this connection string
5. It should already include SSL parameters

### Option 3: Use Direct Connection with SSL

If you want to use the direct connection, make sure the URL includes:
```
?sslmode=require
```

Or for more security:
```
?sslmode=require&sslcert=&sslkey=&sslrootcert=
```

## After Updating

1. Save the environment variable in Vercel
2. The app will automatically redeploy
3. Wait 1-2 minutes for deployment
4. Try logging in again

## Verify Connection

You can test the connection locally:
```bash
# Pull production env vars
vercel env pull .env.production

# Test connection
export DATABASE_URL=$(grep DATABASE_URL .env.production | cut -d '=' -f2- | tr -d '"')
npx prisma db pull
```

If this works, the connection string is correct.

