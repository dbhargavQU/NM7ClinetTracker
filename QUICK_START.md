# Quick Start - Deploy for Your Friend

## 🚀 Fastest Way to Deploy (15 minutes)

### 1. Get Free Database (5 min)
- Sign up at [supabase.com](https://supabase.com) (free)
- Create project → Copy database URL

### 2. Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "Initial commit"
# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR-USERNAME/nm7-project-tracker.git
git push -u origin main
```

### 3. Deploy to Vercel (5 min)
- Go to [vercel.com](https://vercel.com)
- Import GitHub repo
- Add environment variables:
  - `DATABASE_URL` = (from Supabase)
  - `NEXTAUTH_SECRET` = (run: `openssl rand -base64 32`)
  - `NEXTAUTH_URL` = (will be your Vercel URL after deploy)
- Deploy!

### 4. Run Database Setup (3 min)
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npx prisma migrate deploy
npm run db:seed
```

### 5. Update NEXTAUTH_URL
- Go to Vercel → Settings → Environment Variables
- Update `NEXTAUTH_URL` to your actual URL
- Redeploy

## ✅ Done!

**Your friend can now log in at:** `https://your-app.vercel.app`

**Login:**
- Email: `Project@nm7.com`
- Password: `Nameerisgay123`

---

See `DEPLOYMENT.md` for detailed instructions.

