#!/bin/bash
# Production setup script for Vercel deployment
# Run this once after deployment to set up the database

set -e

echo "🚀 Setting up production database..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "   Please set it in Vercel dashboard or run: vercel env pull .env.local"
  exit 1
fi

# Run migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed database (creates user account)
echo "🌱 Seeding database (creating user account)..."
npm run db:seed

echo "✅ Setup complete!"
echo ""
echo "📧 Login credentials:"
echo "   Check your seed script or database for the actual credentials"
echo "   Default demo account: trainer@example.com / password123"
echo ""
echo "🎉 Your friend can now log in at your Vercel URL!"

