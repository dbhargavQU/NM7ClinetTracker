# Connection Pooler: Transaction vs Session

## For Vercel (Serverless) - Use **Transaction Pooler**

### Transaction Pooler ✅ (Recommended for Vercel)
- **Best for**: Serverless functions, short-lived connections
- **Why**: Vercel functions are stateless and short-lived
- **Connection sharing**: Yes, across multiple requests
- **Port**: Usually `6543`
- **Use case**: Next.js API routes, serverless functions

### Session Pooler ❌ (Not recommended for Vercel)
- **Best for**: Long-lived connections, persistent apps
- **Why**: Not ideal for serverless
- **Connection sharing**: Limited
- **Port**: Usually `5432` with `?pgbouncer=true`
- **Use case**: Traditional servers, VMs, containers

## How to Get Transaction Pooler URL

1. In Supabase Dashboard → **Settings** → **Database**
2. Find **"Connection string"** section
3. Click on **"Connection Pooling"** tab
4. Select **"Transaction"** mode (not Session)
5. Copy the connection string

## Transaction Pooler URL Format

```
postgresql://postgres.xxxxx:PASSWORD@aws-0-REGION.pooler.supabase.com:6543/postgres
```

**Key points:**
- Port: `6543`
- Username format: `postgres.xxxxx` (not just `postgres`)
- Host: `pooler.supabase.com` (not `db.xxxxx.supabase.co`)

## Update in Vercel

1. Copy the **Transaction pooler** connection string
2. Go to Vercel → Settings → Environment Variables
3. Update `DATABASE_URL` with the transaction pooler URL
4. Save and redeploy

This should fix your connection issues!

