# Vercel Deployment Guide

## Important: Database Configuration for Vercel

This application uses Prisma ORM with SQLite for local development. However, **Vercel does not support persistent SQLite files** in production because it uses a serverless environment.

### Required Changes for Vercel Deployment

#### 1. Choose a Cloud Database

You must use a cloud PostgreSQL database. Recommended options:

- **Vercel Postgres** (Easiest, integrated with Vercel)
- **Neon PostgreSQL** (Free tier available)
- **Supabase PostgreSQL** (Free tier available)
- **Any other PostgreSQL database**

#### 2. Update Prisma Schema

The current `prisma/schema.prisma` is configured for SQLite. For Vercel, you need to update it to use PostgreSQL:

```prisma
// Change this line in prisma/schema.prisma:
// provider = "sqlite"

// To:
provider = "postgresql"
```

#### 3. Deploy to Vercel

**Step 1: Prepare your repository**
- Push your code to GitHub/GitLab/Bitbucket

**Step 2: Install Vercel CLI (optional)**
```bash
npm i -g vercel
```

**Step 3: Deploy using Vercel Dashboard**
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your repository
4. Configure environment variables (see below)

**Step 4: Configure Environment Variables in Vercel**

Add these environment variables in your Vercel project settings:

| Variable | Value | Description |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL connection string | Required - see database setup below |
| `NEXTAUTH_URL` | Your Vercel domain (e.g., `https://your-app.vercel.app`) | Required for authentication |
| `NEXTAUTH_SECRET` | Generate with: `openssl rand -base64 32` | Required for authentication security |
| `NODE_ENV` | `production` | Auto-set by Vercel |

#### 4. Set Up Your Database

**Option A: Vercel Postgres (Recommended)**

1. In your Vercel project, go to "Storage" tab
2. Click "Create Database"
3. Select "Postgres"
4. Follow the setup wizard
5. Vercel will automatically set `DATABASE_URL` as an environment variable

**Option B: Neon PostgreSQL**

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string
4. In Vercel project settings, add `DATABASE_URL` with this value

**Option C: Supabase**

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. In Vercel project settings, add `DATABASE_URL` with this value

#### 5. Update Prisma and Run Migrations

After setting up your database:

```bash
# Update Prisma schema to use PostgreSQL
# Edit prisma/schema.prisma: change provider to "postgresql"

# Generate Prisma Client
bun run db:generate

# Push schema to your database
bun run db:push
```

#### 6. Redeploy

After setting up the database and updating the schema:

1. Commit and push your changes
2. Vercel will automatically redeploy
3. Your app should now work with the cloud database!

## Local Development After Vercel Setup

To continue using SQLite locally while using PostgreSQL on Vercel:

1. Keep `DATABASE_URL="file:./db/custom.db"` in your local `.env` file
2. Create a `.env.production` file (don't commit this) with your PostgreSQL connection string
3. Or use different database providers in your schema:

```prisma
// prisma/schema.prisma
datasource db {
  provider = "sqlite"  // for local dev
  // provider = "postgresql"  // uncomment for Vercel
  url      = env("DATABASE_URL")
}
```

## Troubleshooting

### Error: "DATABASE_URL references Secret database-url, which does not exist"

This means you haven't set up the `DATABASE_URL` environment variable in Vercel.

**Solution:**
1. Go to your Vercel project
2. Navigate to Settings > Environment Variables
3. Add `DATABASE_URL` with your PostgreSQL connection string

### Error: "Prisma Client initialization error"

This usually happens when the database provider in `schema.prisma` doesn't match your `DATABASE_URL`.

**Solution:**
- Make sure `provider = "postgresql"` in `schema.prisma`
- Make sure `DATABASE_URL` starts with `postgresql://`

### Build Errors

If you encounter build errors:

1. Check that all dependencies are in `package.json`
2. Ensure `bun run build` works locally
3. Check the Vercel build logs for specific errors

## Summary Checklist for Vercel Deployment

- [ ] Push code to GitHub/GitLab/Bitbucket
- [ ] Create a cloud PostgreSQL database (Vercel Postgres/Neon/Supabase)
- [ ] Get the PostgreSQL connection string
- [ ] Update `prisma/schema.prisma` to use `provider = "postgresql"`
- [ ] Add environment variables in Vercel:
  - [ ] `DATABASE_URL` (PostgreSQL connection string)
  - [ ] `NEXTAUTH_URL` (Your Vercel domain)
  - [ ] `NEXTAUTH_SECRET` (Generate with `openssl rand -base64 32`)
- [ ] Deploy to Vercel
- [ ] Run database migrations (Vercel Postgres does this automatically)
- [ ] Test the deployed application

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
