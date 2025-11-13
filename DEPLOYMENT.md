# Free Deployment Guide - Vercel + Supabase

This guide will help you deploy the NM7 Project Tracker app for free so your friend can start using it.

## Step 1: Set Up Free Database (Supabase)

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" and sign up (free)
3. Create a new project:
   - Name: `nm7-project-tracker` (or any name)
   - Database Password: **Save this password!** You'll need it
   - Region: Choose closest to you
   - Wait 2-3 minutes for setup

4. Get your database URL:
   - Go to Project Settings → Database
   - Find "Connection string" → "URI"
   - Copy the connection string (it looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
   - Replace `[YOUR-PASSWORD]` with the password you saved

## Step 2: Push Code to GitHub

1. Create a GitHub account if you don't have one: [github.com](https://github.com)
2. Create a new repository:
   - Click "New repository"
   - Name: `nm7-project-tracker`
   - Make it **Private** (recommended)
   - Don't initialize with README
   - Click "Create repository"

3. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/nm7-project-tracker.git
   git push -u origin main
   ```
   (Replace `YOUR-USERNAME` with your GitHub username)

## Step 3: Deploy to Vercel (Free)

1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (free)
3. Click "Add New Project"
4. Import your repository: `nm7-project-tracker`
5. Configure project:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

6. **Add Environment Variables** (IMPORTANT!):
   Click "Environment Variables" and add:

   ```
   DATABASE_URL = postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   (Use the connection string from Step 1)

   ```
   NEXTAUTH_SECRET = [Generate a random string]
   ```
   To generate: Run this in terminal:
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste it as `NEXTAUTH_SECRET`

   ```
   NEXTAUTH_URL = https://your-app-name.vercel.app
   ```
   (You'll get this URL after first deployment, come back and update it)

7. Click "Deploy"
8. Wait 2-3 minutes for deployment

## Step 4: Set Up Database

After deployment, you need to run migrations:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   cd /path/to/NaveenTracker
   vercel link
   ```
   - Select your project
   - Use default settings

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

6. Seed the database (creates your friend's account):
   ```bash
   npm run db:seed
   ```

## Step 5: Update NEXTAUTH_URL

1. Go to Vercel dashboard → Your Project → Settings → Environment Variables
2. Find `NEXTAUTH_URL`
3. Update it to your actual Vercel URL (e.g., `https://nm7-project-tracker.vercel.app`)
4. Redeploy (or it will auto-redeploy)

## Step 6: Share Login Credentials

Your friend can now log in at: `https://your-app-name.vercel.app`

**Login Credentials:**
- Email: `Project@nm7.com`
- Password: `Nameerisgay123`

## Troubleshooting

### Can't connect to database
- Check that your Supabase project is active
- Verify the connection string is correct
- Make sure you replaced `[YOUR-PASSWORD]` in the connection string

### Migration errors
- Make sure you ran `npx prisma migrate deploy` after deployment
- Check that `DATABASE_URL` is set correctly in Vercel

### Authentication not working
- Verify `NEXTAUTH_SECRET` is set (should be a long random string)
- Make sure `NEXTAUTH_URL` matches your actual Vercel URL (with https://)

### Need to update NEXTAUTH_URL later
1. Go to Vercel → Settings → Environment Variables
2. Edit `NEXTAUTH_URL` with the correct URL
3. Redeploy the project

## Quick Commands Reference

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Run migrations locally
npx prisma migrate deploy

# Seed database (creates friend's account)
npm run db:seed

# Deploy to Vercel (after linking)
vercel --prod
```

## Cost

- **Vercel**: Free (Hobby plan)
- **Supabase**: Free (up to 500MB database, 2GB bandwidth)
- **Total**: $0/month

Both services have generous free tiers that should be enough for personal use.

