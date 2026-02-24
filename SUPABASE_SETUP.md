# Supabase Setup Guide

## Your Connection Details:

**Connection String (URL-encoded):**
```
postgresql://postgres:Dartsgame%232026@db.kjwdvjgmtgxrjjtyvqff.supabase.co:5432/postgres
```

**Password:** Dartsgame#2026
**Host:** db.kjwdvjgmtgxrjjtyvqff.supabase.co
**Port:** 5432
**Database:** postgres
**User:** postgres

---

## Step 1: Verify Supabase Project is Active

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Make sure your project is **"Active"** (not paused)
4. Click on your project to open the dashboard

### If Project is Paused:
1. Click on your project
2. Click **"Resume"** (if paused)
3. Wait for it to start (1-2 minutes)

---

## Step 2: Check Database Settings

1. In Supabase, go to **Settings** → **Database**
2. Make sure these settings are correct:
   - **Database name:** postgres
   - **Database port:** 5432
3. Scroll to **"Connection pooling"**
   - Enable **"Connection pooling"** (this helps with Vercel)
   - Note the **"Transaction mode"** connection string

---

## Step 3: Test Connection Locally

### Option A: Test with Prisma (if you have the code locally)

```bash
# Install dependencies (if needed)
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# If successful, you'll see:
# "The database is already in sync with the Prisma schema."
```

### Option B: Test with psql (if you have PostgreSQL client installed)

```bash
psql "postgresql://postgres:Dartsgame%232026@db.kjwdvjgmtgxrjjtyvqff.supabase.co:5432/postgres"
```

If connection works, you'll see the PostgreSQL prompt.

---

## Step 4: Add to Vercel Environment Variables

1. Go to your Vercel project
2. Click **Settings** → **Environment Variables**
3. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** `postgresql://postgres:Dartsgame%232026@db.kjwdvjgmtgxrjjtyvqff.supabase.co:5432/postgres`
   - **Environments:** Select **Production**, **Preview**, and **Development**
4. Click **"Save"**

---

## Step 5: Deploy to Vercel

### Push Your Code:

```bash
git add .
git commit -m "Migrate to PostgreSQL (Supabase)"
git push
```

### Vercel Will Automatically:

1. Read the `DATABASE_URL` environment variable
2. Generate Prisma Client during build
3. Run `prisma db push` to create tables
4. Deploy your app

---

## Step 6: Verify Deployment

After deployment completes:

1. Visit your app: `https://dartsgame-ten.vercel.app/`
2. Try to add a player
3. Check if it works!

### Test Health Check:

Visit: `https://dartsgame-ten.vercel.app/api/health`

You should see:
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2026-02-22T..."
}
```

---

## Troubleshooting

### Issue: "Can't reach database server"

**Solution 1:** Check Supabase project status
- Make sure project is active (not paused)
- Try pausing and resuming the project

**Solution 2:** Check connection string
- Ensure `#` is URL-encoded as `%23`
- Verify host, port, and database name

**Solution 3:** Check Supabase network settings
- In Supabase: Settings → Database → **"Connection string"**
- Try the **"Session mode"** connection string instead
- Or try **"Transaction mode"** with connection pooling

### Issue: "Permission denied"

**Solution:** Check password
- In Supabase: Settings → Database
- Scroll to **"Database password"**
- Click **"Show"** to verify it matches: `Dartsgame#2026`
- Or generate a new password and update your connection string

### Issue: Tables not created

**Solution:** Manually run migration
```bash
npx prisma db push
```

---

## Next Steps After Success:

1. ✅ Players can be added
2. ✅ Scores are saved
3. ✅ Logo upload works (stored in database as base64)
4. ✅ App is fully functional on Vercel!

---

## Notes:

- Your local SQLite database (`db/custom.db`) won't be migrated
- Players and scores will start fresh on Supabase
- Avatar uploads to `public/uploads/avatars/` won't persist on Vercel
  - Consider using Supabase Storage for production avatars

Need help? Check Supabase docs: https://supabase.com/docs
