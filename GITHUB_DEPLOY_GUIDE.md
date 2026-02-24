# Marimecs Darts Challenge App - GitHub Deployment Guide

This guide helps you prepare the GitHub repository and deploy the app from your local GitHub Desktop.

## 📋 What Files to Upload to GitHub

### ✅ Upload These Files:

#### Root Configuration Files:
- `package.json` - Project dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `postcss.config.mjs` - PostCSS configuration
- `eslint.config.mjs` - ESLint configuration
- `components.json` - shadcn/ui configuration
- `.gitignore` - Git ignore rules
- `.env.example` - Environment variables template (IMPORTANT: not .env!)
- `README.md` - Project documentation
- `setup-database.sql` - Supabase database setup script

#### Source Code:
- `src/` - All source code
  - `app/` - Next.js app router pages
  - `components/` - React components
  - `lib/` - Utility libraries (db.ts, utils.ts)
  - `hooks/` - Custom React hooks
  - `config/` - Configuration files
  - `types/` - TypeScript type definitions

#### Database:
- `prisma/` - Prisma schema files
  - `schema.prisma` - Database schema
  - `schema.postgres.prisma` - PostgreSQL-specific schema

#### Public Assets:
- `public/` - Static files
  - `marimecs-logo.png` - App logo
  - `logo.svg` - Fallback logo
  - `robots.txt` - SEO robots file

#### Mini Services (Optional - for future WebSocket features):
- `mini-services/` - WebSocket services
  - `match-service/` - Real-time match service
  - `darts-ws/` - WebSocket service

#### Documentation:
- `DEPLOY.md` - Previous deployment guide
- `VERCEL_SETUP.md` - Vercel setup instructions
- `SUPABASE_SETUP.md` - Supabase setup instructions

### ❌ DO NOT Upload These Files:

- `.env` - Contains sensitive credentials (already in .gitignore)
- `node_modules/` - Dependencies will be installed by Vercel
- `.next/` - Build artifacts (already in .gitignore)
- `*.log` - Development logs (dev.log, server.log, etc.)
- `db/` - Local SQLite database (already in .gitignore)
- `upload/` - Temporary upload files
- `download/` - Temporary download files
- `*.zip` - Archive files
- `test-prisma.mjs` - Test files
- `analyze-design.ts` - Development scripts
- `design-analysis.txt` - Development notes
- `skills/` - AI skills directory
- `examples/` - Example code (not needed for production)

## 🚀 Step-by-Step Deployment

### Step 1: Commit Your Changes to GitHub

1. **Open your GitHub Desktop**
2. **Review changes** - Make sure you're only committing the files listed above
3. **Commit and push** all changes to your GitHub repository

```bash
# If you prefer command line:
git add .
git commit -m "Complete head-to-head matches with live chat and score verification"
git push origin main
```

### Step 2: Prepare Supabase Database

1. **Go to your Supabase project**: https://supabase.com/dashboard
2. **Open SQL Editor** (left sidebar)
3. **Run the database setup script**:
   - Copy the contents of `setup-database.sql`
   - Paste in SQL Editor
   - Click "Run" to create all tables

### Step 3: Deploy to Vercel

#### Option A: Import from GitHub (Recommended)

1. **Go to Vercel**: https://vercel.com
2. **Click "Add New..." → "Project"**
3. **Import from GitHub**:
   - Select your repository
   - Click "Import"

#### Option B: Use Existing Vercel Project

If you already have a Vercel project:
1. **Go to your Vercel dashboard**
2. **Select your project**
3. **Go to "Git" → "Connected Git Repository"**
4. **Click "Redeploy"** to deploy the latest changes

### Step 4: Configure Environment Variables in Vercel

In your Vercel project settings:

**Go to**: Settings → Environment Variables

Add the following variables:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | Your Supabase connection string | `postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres` |
| `NEXTAUTH_SECRET` | A random secret key | Generate with: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | Your Vercel URL | `https://your-project.vercel.app` |

**Important**:
- Select all environments (Production, Preview, Development)
- Click "Save"

### Step 5: Deploy and Test

1. **Click "Deploy"** in Vercel
2. **Wait for deployment** (usually 2-3 minutes)
3. **Test the live app**:
   - Click the provided URL
   - Register a new user
   - Create a player profile
   - Try creating a match
   - Test the score tracker

### Step 6: Verify Database Connection

Test that everything is working:

**Health Check API:**
```
https://your-project.vercel.app/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Database connection successful"
}
```

## 🔧 Troubleshooting

### Problem: Build Fails - Database Connection Error

**Cause**: DATABASE_URL not set correctly or Supabase tables not created

**Solution**:
1. Verify DATABASE_URL in Vercel environment variables
2. Check that you ran `setup-database.sql` in Supabase SQL Editor
3. Check Vercel deployment logs for specific error messages

### Problem: NextAuth Error - "JSON.parse: unexpected end of data"

**Cause**: NEXTAUTH_SECRET or NEXTAUTH_URL not set

**Solution**:
1. Add NEXTAUTH_SECRET in Vercel environment variables
2. Set NEXTAUTH_URL to your Vercel domain
3. Redeploy the application

### Problem: Can't See Match Updates

**Cause**: WebSocket service not running (optional feature)

**Note**: Real-time WebSocket features are optional. The main match functionality works without it. Matches will refresh on page reload.

**To enable real-time**:
1. Deploy the match-service to a separate service (e.g., Railway, Render)
2. Update the WebSocket URL in your code
3. Add the service URL to environment variables

### Problem: Images Not Loading

**Cause**: Public assets not deployed

**Solution**:
1. Verify `public/marimecs-logo.png` exists in your repository
2. Check Vercel build logs for asset copying errors
3. Ensure file permissions are correct

## 📊 Features Available After Deployment

✅ **Player Management** - Add, edit, delete players
✅ **Daily Challenges** - Submit and track daily scores
✅ **Leaderboards** - Today, weekly, and overall rankings
✅ **Training Games** - All practice games with instructions
✅ **Score Tracker** - 101/301/501 with checkout suggestions
✅ **Head-to-Head Matches** - Live matches with turn-based scoring
✅ **Score Verification** - Double confirmation to prevent fraud
✅ **Match Chat** - In-match messaging (real-time if WebSocket enabled)
✅ **User Authentication** - Registration and login with NextAuth
✅ **Mobile Responsive** - Works on all devices

## 🔒 Security Notes

### ⚠️ IMPORTANT Security Practices:

1. **NEVER commit `.env` file** to GitHub
   - Use `.env.example` as a template
   - Add actual values in Vercel environment variables

2. **Generate a strong NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```

3. **Keep Supabase connection string secure**
   - Don't share your DATABASE_URL publicly
   - Use connection pooling for production

4. **Enable Vercel security features**:
   - Enable HTTPS (automatic on Vercel)
   - Set up domain redirects if needed
   - Enable rate limiting in Supabase

## 📈 Monitoring and Maintenance

### Check Vercel Logs:
- Go to your Vercel project
- Click "Functions" tab
- View real-time logs for API routes

### Monitor Supabase:
- Go to Supabase Dashboard
- Check "Database" → "Logs" for database queries
- Monitor usage and performance

### Update the App:
1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically detects and redeploys

## 🎯 Success Checklist

After deployment, verify:

- [ ] App loads correctly in browser
- [ ] User registration works
- [ ] User can log in
- [ ] Player profiles can be created
- [ ] Scores can be submitted
- [ ] Leaderboard displays correctly
- [ ] Matches can be created
- [ ] Match turns can be added
- [ ] Score confirmation works
- [ ] Chat messages can be sent
- [ ] Mobile layout is responsive
- [ ] Logo displays correctly

## 📞 Need Help?

If you encounter issues:

1. **Check Vercel deployment logs** - Most errors appear here
2. **Check Supabase logs** - Database connection issues
3. **Review this guide** - Make sure all steps were followed
4. **Check GitHub issues** - Look for similar problems

## 🎉 Congratulations!

Once deployed, your Marimecs Darts Challenge App will be live and fully functional with:
- Authentication system
- Player management
- Daily challenges
- Leaderboards
- Head-to-head matches with live scoring
- Score verification
- Match chat
- And more!

Enjoy your darts app! 🎯
