# Fix: Prepared Statement Error with PgBouncer

## Problem
Error: `prepared statement "s0" does not exist`

This happens because:
- Prisma uses prepared statements by default
- PgBouncer transaction pooler doesn't support prepared statements
- Need to disable prepared statements when using pooler

## Solution

### Option 1: Add `?pgbouncer=true` to Connection String (Recommended)

Update your `DATABASE_URL` in Vercel to include `?pgbouncer=true`:

**Current:**
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**Updated:**
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 2: Use Session Pooler Instead

If you prefer, you can use Session pooler which supports prepared statements:
- Go to Supabase → Settings → Database → Connection Pooling
- Select **Session** mode (instead of Transaction)
- Use that connection string

**Note:** Session pooler is less efficient for serverless but works with prepared statements.

## Steps to Fix

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Add `?pgbouncer=true` at the end of the connection string
5. Click **Save**
6. Wait for redeploy (1-2 minutes)

## After Fix

The code has been updated to automatically add `?pgbouncer=true` if it detects a pooler URL, but it's better to add it directly to the connection string in Vercel.

