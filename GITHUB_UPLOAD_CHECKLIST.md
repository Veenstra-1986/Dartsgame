# GitHub Upload Checklist

Use this checklist to verify all files are uploaded to GitHub for deployment.

## ✅ Required Files - MUST BE IN GITHUB

### Root Configuration Files (11 files)
- [ ] `package.json` - Dependencies and scripts
- [ ] `tsconfig.json` - TypeScript configuration
- [ ] `next.config.ts` - Next.js configuration
- [ ] `tailwind.config.ts` - Tailwind CSS configuration
- [ ] `postcss.config.mjs` - PostCSS configuration
- [ ] `eslint.config.mjs` - ESLint configuration
- [ ] `components.json` - shadcn/ui configuration
- [ ] `.gitignore` - Git ignore rules
- [ ] `.env.example` - Environment variables template (IMPORTANT!)
- [ ] `setup-database.sql` - Supabase database setup script
- [ ] `Caddyfile` - Caddy configuration (if using custom gateway)

### Documentation Files (4 files)
- [ ] `README.md` - Project documentation
- [ ] `GITHUB_DEPLOY_GUIDE.md` - Deployment instructions
- [ ] `DEPLOY.md` - Original deployment guide
- [ ] `VERCEL_SETUP.md` - Vercel setup instructions
- [ ] `SUPABASE_SETUP.md` - Supabase setup instructions

### Source Code - `/src/` Directory
- [ ] `src/app/` - All Next.js pages and API routes
  - [ ] `src/app/page.tsx` - Home page
  - [ ] `src/app/layout.tsx` - Root layout
  - [ ] `src/app/globals.css` - Global styles
  - [ ] `src/app/dashboard/` - Dashboard page
  - [ ] `src/app/matches/[id]/` - Match detail page
  - [ ] `src/app/login/` - Login page
  - [ ] `src/app/register/` - Register page
  - [ ] `src/app/api/` - All API routes
    - [ ] `src/app/api/auth/` - Authentication endpoints
    - [ ] `src/app/api/matches/` - Match management APIs
    - [ ] `src/app/api/scores/` - Score tracking APIs
    - [ ] `src/app/api/players/` - Player management APIs
    - [ ] `src/app/api/challenges/` - Challenge APIs
    - [ ] `src/app/api/users/` - User APIs
    - [ ] `src/app/api/leaderboard/` - Leaderboard API
- [ ] `src/components/` - React components
  - [ ] `src/components/ui/` - All shadcn/ui components
  - [ ] `src/components/providers.tsx` - App providers
- [ ] `src/lib/` - Utility libraries
  - [ ] `src/lib/db.ts` - Prisma database client
  - [ ] `src/lib/utils.ts` - Utility functions
- [ ] `src/hooks/` - Custom React hooks
  - [ ] `src/hooks/use-toast.ts`
  - [ ] `src/hooks/use-mobile.ts`
- [ ] `src/config/` - Configuration
  - [ ] `src/config/brand-config.ts`
- [ ] `src/types/` - TypeScript definitions
  - [ ] `src/types/next-auth.d.ts`

### Database - `/prisma/` Directory (2 files)
- [ ] `prisma/schema.prisma` - Main database schema
- [ ] `prisma/schema.postgres.prisma` - PostgreSQL schema

### Public Assets - `/public/` Directory (3 files)
- [ ] `public/marimecs-logo.png` - App logo
- [ ] `public/logo.svg` - Fallback logo
- [ ] `public/robots.txt` - SEO robots file

### Mini Services - `/mini-services/` Directory (Optional - for future use)
- [ ] `mini-services/match-service/` - Real-time match service
  - [ ] `mini-services/match-service/index.ts`
  - [ ] `mini-services/match-service/package.json`
  - [ ] `mini-services/match-service/bun.lock`
- [ ] `mini-services/darts-ws/` - General WebSocket service
  - [ ] `mini-services/darts-ws/index.ts`
  - [ ] `mini-services/darts-ws/package.json`
  - [ ] `mini-services/darts-ws/bun.lock`

---

## ❌ Files to EXCLUDE - DO NOT UPLOAD

### Development & Temporary Files
- [x] `.env` - Contains sensitive credentials (use .env.example instead)
- [x] `node_modules/` - Dependencies (installed by Vercel)
- [x] `.next/` - Build artifacts (generated during build)
- [x] `*.log` - Development logs (dev.log, server.log, dev-*.log, etc.)
- [x] `db/` - Local SQLite database
- [x] `upload/` - Temporary upload files
- [x] `download/` - Temporary download files
- [x] `*.zip` - Archive files
- [x] `darts-game-backup.zip` - Backup file

### Test & Development Scripts
- [x] `test-prisma.mjs` - Test file
- [x] `analyze-design.ts` - Development script
- [x] `design-analysis.txt` - Development notes
- [x] `migration.sql` - Migration backup file

### Development Tools
- [x] `skills/` - AI skills directory
- [x] `examples/` - Example code (not needed for production)
- [x] `.zscripts/` - Internal scripts

### Build Artifacts
- [x] `next-env.d.ts` - Generated TypeScript definitions
- [x] `*.tsbuildinfo` - TypeScript build info

---

## 📋 Quick Verification Steps

### 1. Check File Count
After uploading, your GitHub repository should contain approximately:
- 50+ source files in `/src/`
- 2 Prisma schema files
- 3+ public assets
- 10+ configuration files
- 5+ documentation files

### 2. Verify Critical Files
Make sure these are definitely in GitHub:
- [ ] `.env.example` (NOT `.env`)
- [ ] `package.json`
- [ ] `prisma/schema.prisma`
- [ ] `src/lib/db.ts`
- [ ] `src/app/api/auth/[...nextauth]/route.ts`
- [ ] `public/marimecs-logo.png`
- [ ] `setup-database.sql`

### 3. Check for Sensitive Data
Review your GitHub repository and make sure:
- [ ] No `.env` file is committed
- [ ] No passwords or API keys in code
- [ ] No personal information in files

---

## 🚀 Upload Instructions

### Using GitHub Desktop

1. **Open GitHub Desktop**
2. **Review changes** in the "Changes" tab
3. **Uncheck** any files in the "❌ Files to EXCLUDE" list above
4. **Add a commit message**: "Complete head-to-head matches with live chat and score verification"
5. **Commit and Push**

### Using Command Line

```bash
# Check what will be committed
git status

# Review files (exclude unwanted ones)
git add .
git reset .env
git reset node_modules/
git reset .next/
git reset *.log
git reset db/
git reset upload/
git reset download/
git reset skills/
git reset examples/
git reset *.zip

# Commit and push
git commit -m "Complete head-to-head matches with live chat and score verification"
git push origin main
```

---

## 📊 After Upload Verification

Once uploaded to GitHub, verify:

1. **Visit your GitHub repository**
2. **Check the file list** matches the ✅ Required Files list
3. **Confirm .env is NOT present**
4. **Verify .env.example IS present**
5. **Check that all source code is there**

---

## ✅ Ready to Deploy

When all ✅ Required Files are uploaded and verified:

1. **Go to Vercel**: https://vercel.com
2. **Import your GitHub repository**
3. **Configure environment variables** (see GITHUB_DEPLOY_GUIDE.md)
4. **Deploy!**

---

## 🔒 Security Reminder

⚠️ **CRITICAL**: Never commit `.env` file to GitHub!

- Always use `.env.example` as a template
- Add actual values in Vercel environment variables
- Rotate secrets if accidentally committed

---

Created for Marimecs Darts Challenge App deployment.
