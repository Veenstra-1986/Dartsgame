# DartsPro - Vercel Deployment Guide

## Deployment naar Vercel

### Stap 1: Database Setup
Voor Vercel deploy moet je een PostgreSQL database gebruiken (SQLite werkt niet op Vercel).

Opties:
- **Vercel Postgres** (aanbevolen voor eenvoudige setup)
- **Neon** (PostgreSQL met serverless architectuur)
- **Supabase** (PostgreSQL met auth)

### Stap 2: Environment Variables

In je Vercel project settings, voeg deze environment variables toe:

```
DATABASE_URL=postgresql://jouw_database_url
NEXTAUTH_URL=https://jouw-project.vercel.app
NEXTAUTH_SECRET=jouw_geheime_key
```

### Stap 3: Deploy Command

De vercel.json bevat al de juiste build commando:
```bash
prisma generate && next build
```

### Stap 4: Database Migratie

Na eerste deploy, moet je de database migreren:

1. Ga naar Vercel project settings
2. Open "Environment Variables"
3. Voeg `DATABASE_URL` toe met je PostgreSQL connection string
4. Deploy opnieuw
5. Run in Vercel console:
   ```bash
   npx prisma db push
   ```

### Stap 5: Database Seeding (Optioneel)

Om test data te toevoegen, kun je de seed functie uitvoeren:
```bash
npx prisma db seed
```

## Belangrijke Opmerkingen

1. **SQLite werkt niet op Vercel** - Het bestandssysteem van Vercel is read-only, dus moet je PostgreSQL gebruiken
2. **Environment variables** - Zorg dat alle secrets in Vercel staan
3. **Database URL** - Gebruik de connection string van je PostgreSQL provider
4. **Prisma Client** - Wordt automatisch gegenereerd tijdens build

## Alternatieve Deployment Opties

Als Vercel niet werkt met je setup, overweeg:
- **Railway** - Voor volledige PostgreSQL integratie
- **Render** - Voor PostgreSQL en eenvoudige deployment
- **Docker** - Voor volledige controle over environment

## Locale Testing Voordat Deployen

```bash
# Test met PostgreSQL lokaal
# Installeer PostgreSQL en update DATABASE_URL in .env.local
DATABASE_URL="postgresql://user:password@localhost:5432/dartspro"

# Push schema
bun run db:push

# Run dev
bun run dev
```
