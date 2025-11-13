# Update DATABASE_URL in Vercel - REQUIRED

## ⚠️ IMPORTANT: You MUST update DATABASE_URL in Vercel

The database connection is failing because SSL is required. Follow these steps:

## Step 1: Go to Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Click on your project: **nm-7-clinet-tracker**
3. Go to **Settings** → **Environment Variables**

## Step 2: Find and Edit DATABASE_URL

1. Find `DATABASE_URL` in the list
2. Click **Edit** (or the three dots → Edit)

## Step 3: Update the Connection String

**Current (WRONG - missing SSL):**
```
postgresql://postgres:1VfjEricmv6PJx3P@db.ihtpdlqroxahchuwxjzi.supabase.co:5432/postgres
```

**Updated (CORRECT - with SSL):**
```
postgresql://postgres:1VfjEricmv6PJx3P@db.ihtpdlqroxahchuwxjzi.supabase.co:5432/postgres?sslmode=require
```

**Important:** Add `?sslmode=require` at the end!

## Step 4: Save

1. Click **Save**
2. Vercel will automatically redeploy
3. Wait 1-2 minutes for deployment

## Step 5: Test

After deployment completes, try logging in:
- Email: `Project@nm7.com`
- Password: `Nameerisgay123`

## Alternative: Use Connection Pooler (Better for Production)

If you want better performance, use Supabase's connection pooler:

1. Go to Supabase Dashboard → Settings → Database
2. Find "Connection Pooling" section
3. Copy the pooler connection string
4. Update `DATABASE_URL` in Vercel with that URL

The pooler URL usually looks like:
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## Why This Is Needed

Supabase requires SSL connections from external services like Vercel. Without `?sslmode=require`, the connection will fail.

