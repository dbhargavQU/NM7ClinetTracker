# NM7 Project Tracker

A multi-trainer SaaS web application for personal trainers to track their clients, payments, workout schedules, and progress.

## Features

- **Multi-trainer support**: Each trainer has their own isolated account and data
- **Client management**: Track client information, start dates, monthly fees, and notes
- **Smart payment tracking**: Record payments with automatic billing cycle calculation based on client start date
- **Workout scheduling**: Manage client workout schedules with day, time, and location
- **Progress tracking**: Record weight and progress over time with visual charts
- **Availability calendar**: View your free time slots based on existing client schedules
- **Dark mode**: Toggle between light and dark themes
- **Secure authentication**: Email/password authentication with bcrypt password hashing
- **Mobile-friendly**: Responsive design that works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Database**: PostgreSQL (via Prisma ORM)
- **Authentication**: NextAuth.js with Credentials provider
- **Charts**: Recharts for progress visualization
- **Timezone**: All dates and times displayed in IST (Indian Standard Time)
- **Currency**: Indian Rupees (₹)

## Key Features Explained

### Billing Cycles
Payments are tracked based on **client start date**, not calendar months. For example:
- If a client started on November 15th, their billing cycles are:
  - Nov 15 - Dec 14
  - Dec 15 - Jan 14
  - Jan 15 - Feb 14
  - And so on...

When you add a payment, simply select the "Paid On" date, and the system automatically assigns it to the correct billing cycle.

### Availability Calendar
The availability calendar shows your weekly schedule:
- **Booked slots**: Times when you have client workouts scheduled
- **Free slots**: Available time slots where you can schedule new clients

This helps you quickly identify when you're available to take on new clients.

### Payment Status
Each client shows their current billing cycle payment status:
- ✅ **Paid**: Payment received for the current billing cycle
- ❌ **Not paid**: No payment recorded for the current billing cycle
- Shows billing cycle dates and days remaining (if paid)

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

4. Configure build settings:
   - **Build Command**: `npm run build`
   - **Install Command**: `npm install`
   - **Output Directory**: `.next`

5. Vercel will automatically:
   - Install dependencies
   - Build the app
   - Deploy

### 3. Run Migrations on Vercel

After the first deployment, you need to run migrations. You can do this via:

**Option A: Vercel CLI** (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Link your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Vercel Dashboard**
- Go to your project → Settings → Build & Development Settings
- Add a build command: `npm run build && npx prisma migrate deploy`
- Redeploy your project

**Option C: One-time Migration via Vercel CLI**
```bash
vercel --prod -- npx prisma migrate deploy
```

### 4. Seed Production Database (Optional)

If you want demo data in production, you can run:

```bash
npm run db:seed
```

**Note**: Only do this if you want demo data. For production, trainers should register their own accounts.

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db?schema=public` |
| `NEXTAUTH_SECRET` | Secret key for NextAuth (generate with `openssl rand -base64 32`) | Random 32+ character string |
| `NEXTAUTH_URL` | Your app's URL | `http://localhost:3000` (dev) or `https://your-app.vercel.app` (prod) |

## Database Schema

The app uses the following main models:

- **User**: Trainer accounts (email, password hash)
- **Client**: Client information linked to trainers (name, start date, monthly fee, starting weight, notes)
- **WorkoutSchedule**: Weekly workout schedules for clients (day of week, start/end time, location)
- **Payment**: Payment records (month, year, amount, paid date) - automatically assigned to billing cycles
- **ProgressEntry**: Weight and progress tracking entries (date, weight, notes)

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

### Quick Start Guide for Trainers

1. **Register/Login**: Create an account or log in
2. **Add Clients**: Go to Dashboard → Add New Client
3. **Set Workout Schedules**: For each client, add their weekly workout schedule
4. **Track Payments**: Record payments using the "Paid On" date - the system automatically assigns it to the correct billing cycle
5. **Monitor Progress**: Add weight entries to track client progress over time
6. **Check Availability**: Use the Availability calendar to see your free time slots

## App Features

### Dashboard
- View all clients in a table
- See payment status for current billing cycle
- View next scheduled workout for each client
- Filter by unpaid clients or active clients only
- Quick access to client details

### Client Management
- Create, edit, and delete clients
- Track starting weight, monthly fee, and notes
- Mark clients as active/inactive
- View comprehensive client overview

### Workout Schedules
- Add multiple workout times per client
- Set day of week, time range, and location
- Edit or delete schedules as needed

### Payments
- Simple payment form (just enter amount and "Paid On" date)
- Automatic billing cycle assignment
- View payment history
- See current billing cycle status with expiry information

### Progress Tracking
- Record weight entries with dates
- View progress chart (weight vs. date)
- See starting weight, latest weight, and difference
- Add notes for each entry

### Availability Calendar
- Weekly view of your schedule
- See booked slots (client workouts)
- Identify free time slots
- Plan new client onboarding

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` is correct
- Check that your database allows connections from your IP (for hosted databases)
- Ensure SSL is configured if required (add `?sslmode=require` to connection string)
- For Supabase/Neon, make sure to use the connection pooler URL if available

### Migration Errors

- Make sure you've run `npx prisma generate` after schema changes
- For production, use `npx prisma migrate deploy` instead of `prisma migrate dev`
- If migrations fail, check your database connection and permissions

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set and is a long random string
- Check that `NEXTAUTH_URL` matches your actual app URL (including https:// in production)
- Clear browser cookies if experiencing session issues

### Build Errors on Vercel

- Ensure all environment variables are set in Vercel dashboard
- Check that `DATABASE_URL` is accessible from Vercel's servers
- Review build logs in Vercel dashboard for specific error messages
- Make sure to run migrations after first deployment

## Timezone and Currency

- **Timezone**: All dates and times are displayed in IST (Indian Standard Time)
- **Time Format**: 12-hour format with AM/PM
- **Currency**: Indian Rupees (₹)
- **Date Format**: DD MMM YYYY (e.g., "15 Nov 2024")

## License

MIT
