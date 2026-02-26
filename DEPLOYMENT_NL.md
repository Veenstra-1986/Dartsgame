# Vercel Deployement Gids - Quick Start

⚠️ **Belangrijk**: Voor Vercel deployment moet je een cloud database gebruiken (PostgreSQL), aangezien Vercel geen SQLite bestanden ondersteunt.

## Snelle Stappen voor Vercel Deployment

### 1. Kies een Cloud Database

**Optie A: Vercel Postgres (Aanbevolen - makkelijkst)**
- Ga naar je Vercel project → Storage tab
- Klik "Create Database" → "Postgres"
- Vercel stelt automatisch `DATABASE_URL` in

**Optie B: Neon PostgreSQL (Gratis tier)**
- Ga naar [neon.tech](https://neon.tech)
- Maak een gratis account en project
- Kopieer de connection string

**Optie C: Supabase (Gratis tier)**
- Ga naar [supabase.com](https://supabase.com)
- Maak een gratis account en project
- Kopieer de connection string

### 2. Update Prisma Schema

Open `prisma/schema.prisma` en verander:
```prisma
provider = "sqlite"  // Verander dit naar:
provider = "postgresql"
```

### 3. Deploy naar Vercel

1. Push je code naar GitHub/GitLab/Bitbucket
2. Ga naar [vercel.com](https://vercel.com)
3. "Add New Project" → Importeer je repository
4. Voeg deze environment variables toe:

| Variable | Waarde | Hoe te verkrijgen |
|----------|--------|------------------|
| `DATABASE_URL` | PostgreSQL connection string | Van je database provider |
| `NEXTAUTH_URL` | Je Vercel domein (bijv. `https://jou-app.vercel.app`) | Naar deploy |
| `NEXTAUTH_SECRET` | Genereer met: `openssl rand -base64 32` | Terminal commando |

5. Klik "Deploy"

### 4. Na Eerste Deploy

Als de database schema nodig is om te updaten:

```bash
# Genereer Prisma Client
bun run db:generate

# Push schema naar database
bun run db:push
```

### 5. Lokaal blijven ontwikkelen met SQLite

Om lokaal SQLite te blijven gebruiken en op Vercel PostgreSQL:

- Houd `DATABASE_URL="file:./db/custom.db"` in je lokale `.env` bestand
- In Vercel gebruik je de PostgreSQL `DATABASE_URL`
- Voeg dit toe aan `.gitignore` (al aanwezig):
  ```
  db/*.db
  db/*.db-journal
  .env.local
  ```

## Veelvoorkomende Fouten

### Fout: "DATABASE_URL references Secret database-url, which does not exist"

**Oplossing**: Je hebt de `DATABASE_URL` environment variable nog niet ingesteld in Vercel.

1. Ga naar je Vercel project
2. Settings → Environment Variables
3. Voeg `DATABASE_URL` toe met je PostgreSQL connection string

### Fout: "Prisma Client initialization error"

**Oplossing**: De database provider in `schema.prisma` komt niet overeen met je `DATABASE_URL`.

- Zorg dat `provider = "postgresql"` in `schema.prisma`
- Zorg dat `DATABASE_URL` begint met `postgresql://`

## Deployment Checklist

- [ ] Code pushen naar GitHub/GitLab/Bitbucket
- [ ] Cloud PostgreSQL database aanmaken
- [ ] PostgreSQL connection string kopiëren
- [ ] `prisma/schema.prisma` updaten: `provider = "postgresql"`
- [ ] Environment variables in Vercel toevoegen:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
- [ ] Deployen naar Vercel
- [ ] Database schema pushen (indien nodig)
- [ ] Geteste deployed applicatie

## Meer Informatie

Zie `VERCEL_DEPLOYMENT.md` voor gedetailleerde instructies en troubleshooting.

---

**Nadat deployment compleet is:**
- Je app is beschikbaar op `https://jou-project.vercel.app`
- Test alle functionaliteiten
- Controleer of de database verbinding werkt
- Geniet van je Darts app op het web! 🎯
