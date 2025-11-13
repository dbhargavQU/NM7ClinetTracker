# NM7 Project Tracker

A multi-trainer SaaS web application for personal trainers to track their clients, payments, workout schedules, and progress.

## Features

- **Multi-trainer support**: Each trainer has their own isolated account and data
- **Client management**: Track client information, start dates, monthly fees, and notes
- **Payment tracking**: Record and monitor monthly payments with payment status indicators
- **Workout scheduling**: Manage client workout schedules with day, time, and location
- **Progress tracking**: Record weight and progress over time with visual charts
- **Secure authentication**: Email/password authentication with bcrypt password hashing

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js with Credentials provider
- **Charts**: Recharts

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or hosted like Supabase/Neon)

## Local Development Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/naveen_tracker?schema=public"
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Set Up Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev
```

This will:
- Create the database schema
- Generate Prisma Client

### 4. Seed the Database (Optional)

Populate the database with demo data:

```bash
npm run db:seed
```

This creates:
- A demo trainer account:
  - Email: `trainer@example.com`
  - Password: `password123`
- Sample clients, schedules, payments, and progress entries

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Prepare Your Database

Set up a hosted PostgreSQL database:
- **Supabase**: [supabase.com](https://supabase.com) - Free tier available
- **Neon**: [neon.tech](https://neon.tech) - Free tier available

Get your database connection string (DATABASE_URL).

### 2. Deploy to Vercel

1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in [Vercel](https://vercel.com)
3. Configure environment variables in Vercel dashboard:

   ```
   DATABASE_URL=postgresql://user:password@host:5432/database?schema=public
   NEXTAUTH_SECRET=your-generated-secret-key
   NEXTAUTH_URL=https://your-app.vercel.app
   ```

4. Vercel will automatically:
   - Install dependencies (`npm install`)
   - Run Prisma migrations (`npx prisma migrate deploy`) - **Important**: Make sure to add this as a build command or run it manually after first deployment
   - Build the app (`npm run build`)
   - Deploy

### 3. Run Migrations on Vercel

After the first deployment, you need to run migrations. You can do this via:

**Option A: Vercel CLI**
```bash
vercel env pull .env.local
npx prisma migrate deploy
```

**Option B: Vercel Dashboard**
- Go to your project settings
- Add a build command: `npm run build && npx prisma migrate deploy`
- Or use Vercel's "Deployments" tab to run a command

**Option C: Manual Migration Script**
Create a one-time migration script and run it after deployment.

### 4. Seed Production Database (Optional)

If you want demo data in production, you can run:

```bash
npm run db:seed
```

**Note**: Only do this if you want demo data. For production, trainers should register their own accounts.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth (generate with `openssl rand -base64 32`) | Random 32+ character string |
| `NEXTAUTH_URL` | Your app's URL | `http://localhost:3000` (dev) or `https://your-app.vercel.app` (prod) |

## Database Schema

The app uses the following main models:

- **User**: Trainer accounts
- **Client**: Client information linked to trainers
- **WorkoutSchedule**: Weekly workout schedules for clients
- **Payment**: Monthly payment records
- **ProgressEntry**: Weight and progress tracking entries

All queries are scoped by `userId` to ensure complete data isolation between trainers.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:migrate` - Run Prisma migrations (development)
- `npm run db:deploy` - Deploy migrations (production)
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio (database GUI)

## Security Features

- **Password hashing**: All passwords are hashed using bcrypt
- **Multi-tenant isolation**: All database queries filter by authenticated user ID
- **Protected routes**: All app routes require authentication
- **Session management**: JWT-based sessions via NextAuth

## Usage for Trainers

Once deployed, trainers can:

1. Visit your app URL
2. Click "Register" to create an account
3. Log in with their credentials
4. Start adding clients and tracking their data

**No technical knowledge required** - trainers just need to visit the URL and use the web interface.

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that your database allows connections from your IP (for hosted databases)
- Ensure SSL is configured if required (add `?sslmode=require` to connection string)

### Migration Errors

- Make sure you've run `npx prisma generate` after schema changes
- For production, use `npx prisma migrate deploy` instead of `prisma migrate dev`

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set and is a long random string
- Check that `NEXTAUTH_URL` matches your actual app URL

## License

MIT

