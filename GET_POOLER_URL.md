# How to Get Supabase Connection Pooler URL

## Step 1: Find Connection Pooler URL

The connection pooler URL is usually found in one of these places:

### Option A: Connection String Section
1. In Supabase Dashboard, go to **Settings** → **Database**
2. Look for **"Connection string"** section
3. You should see tabs like:
   - **URI** (direct connection)
   - **Connection Pooling** (this is what you need!)
4. Click on **"Connection Pooling"** tab
5. Copy the connection string (it will have `pooler.supabase.com` in it)

### Option B: Connection Info
1. Go to **Settings** → **Database**
2. Scroll down to find connection information
3. Look for **"Connection Pooling"** or **"Session mode"**
4. Copy the pooler connection string

## Step 2: Pooler URL Format

The pooler URL usually looks like:
```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

OR

```
postgresql://postgres.xxxxx:YOUR_PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres?pgbouncer=true
```

**Key differences from direct connection:**
- Has `pooler.supabase.com` instead of `db.xxxxx.supabase.co`
- Uses port `6543` (pooler) or `5432` with `?pgbouncer=true`
- Has `postgres.xxxxx` format in the username

## Step 3: Update in Vercel

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click **Edit**
4. Paste the **pooler connection string** (with your password)
5. Click **Save**
6. Wait for redeploy (1-2 minutes)

## Why Use Pooler?

- ✅ Better for serverless (Vercel)
- ✅ Handles connection pooling automatically
- ✅ SSL is already configured
- ✅ More reliable for production

## If You Can't Find Pooler URL

You can construct it manually:
1. Your direct connection: `postgresql://postgres:1VfjEricmv6PJx3P@db.ihtpdlqroxahchuwxjzi.supabase.co:5432/postgres`
2. Replace `db.ihtpdlqroxahchuwxjzi.supabase.co` with `aws-0-us-east-1.pooler.supabase.com`
3. Replace port `5432` with `6543`
4. Change username from `postgres` to `postgres.ihtpdlqroxahchuwxjzi`

**Example:**
```
postgresql://postgres.ihtpdlqroxahchuwxjzi:1VfjEricmv6PJx3P@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Note:** The region (`us-east-1`) might be different for your project. Check your Supabase project region.

