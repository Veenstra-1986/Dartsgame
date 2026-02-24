# Vercel Deployment Guide

## Critical Issue: SQLite doesn't work on Vercel

Vercel uses serverless functions with an ephemeral file system. SQLite database writes are lost between function invocations, making it unsuitable for production on Vercel.

## Solution: Use Vercel Postgres

### Step 1: Set up Vercel Postgres

1. Go to your Vercel project dashboard
2. Navigate to **Storage** tab
3. Click **Create Database**
4. Select **Postgres** (free tier available)
5. Follow the setup wizard

### Step 2: Update Prisma Schema

Replace `prisma/schema.prisma` with the PostgreSQL version:

```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

The rest of the schema stays the same.

### Step 3: Run Migration

After updating the schema, run:

```bash
# Install Prisma (if not already installed)
npm install prisma @prisma/client

# Generate Prisma Client
npx prisma generate

# Push schema to database (or use migrations)
npx prisma db push
```

### Step 4: Deploy to Vercel

Vercel will automatically:
- Detect the database dependency
- Set up the `DATABASE_URL` environment variable
- Run database migrations during deployment

### Step 5: Verify Deployment

After deployment, test the health check:

```
https://your-app.vercel.app/api/health
```

You should see:
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2026-02-22T..."
}
```

## Alternative: Other Database Providers

If you prefer not to use Vercel Postgres, you can use:

### 1. Neon (PostgreSQL)
- Free tier available
- Sign up at: https://neon.tech
- Create a project and copy the connection string
- Add `DATABASE_URL` to Vercel environment variables

### 2. Supabase (PostgreSQL)
- Free tier available
- Sign up at: https://supabase.com
- Create a project and copy the connection string
- Add `DATABASE_URL` to Vercel environment variables

### 3. PlanetScale (MySQL)
- Free tier available
- Sign up at: https://planetscale.com
- Create a database and copy the connection string
- Update Prisma schema to use `mysql` provider
- Add `DATABASE_URL` to Vercel environment variables

## What's Already Fixed

1. ✅ WebSocket connection disabled in production
2. ✅ Better error logging for API endpoints
3. ✅ Health check endpoint added
4. ✅ Prisma client optimized for production

## Testing Locally with PostgreSQL

To test locally with PostgreSQL before deploying:

1. Install Docker and run Postgres:
```bash
docker run --name darts-postgres -e POSTGRES_PASSWORD=darts123 -p 5432:5432 -d postgres
```

2. Update `.env`:
```
DATABASE_URL="postgresql://postgres:darts123@localhost:5432/darts?schema=public"
```

3. Run migrations:
```bash
npx prisma db push
```

4. Start dev server:
```bash
npm run dev
```

## Notes

- The existing SQLite database (in `db/custom.db`) will NOT be migrated automatically
- Players, scores, and other data will need to be re-created in PostgreSQL
- Avatar uploads to `public/uploads/avatars/` also won't persist on Vercel (consider using a cloud storage service like Vercel Blob or AWS S3 for production)
