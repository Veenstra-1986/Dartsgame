# DartsPro - Complete Project Bundle

## 📦 Bestandsinformatie

**Bestandsnaam:** `DartsPro-Latest-20260301-2014.zip`  
**Grootte:** 1.3 MB  
**Datum:** 1 Maart 2026, 20:14  
**Versie:** Met alle laatste updates

## ✅ Wat is inbegrepen in deze versie

### 🎯 Nieuwe Features
- ✅ **Forgot Password Functionaliteit** compleet geïmplementeerd
  - `/forgot-password` pagina
  - `/reset-password` pagina met token validatie
  - API routes: `/api/auth/forgot-password` en `/api/auth/reset-password`
  - Token-based wachtwoord reset (1 uur geldig)

- ✅ **Footer CTA Sectie Verbeterd**
  - Vaste donkere achtergrond voor betere leesbaarheid
  - Knoppen met duidelijk contrast (wit/zwart)
  - Alle tekst nu goed leesbaar

### 🎮 Alle bestaande functionaliteiten
- ✅ **PostgreSQL Database Schema** (Prisma ORM)
- ✅ **Challenges Systeem** met echte group leaderboards
- ✅ **Meerdere groepen** per gebruiker
- ✅ **Verbeterde Scoreteller**
  - Bewerkbare spelernamen en scores
  - Compacte lay-out (scores naast elkaar)
  - Actieve speler vergroot
  - Uitklapbare statistieken
- ✅ **Accent Color Personalisatie** (emerald, blue, purple, rose, amber, orange, teal, slate)
- ✅ **Next.js 16** met App Router
- ✅ **TypeScript** setup
- ✅ **shadcn/ui** componenten
- ✅ **Tailwind CSS 4**

### 📁 Volledige projectstructuur
```
my-project/
├── prisma/
│   └── schema.prisma       # PostgreSQL schema
├── src/
│   ├── app/                # Next.js App Router
│   ├── components/         # React componenten
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utility functions
├── public/                 # Statische bestanden
├── package.json
├── tsconfig.json
├── next.config.ts
└── vercel.json            # Vercel deployment config
```

## 🗑️ Wat is UITGESLOTEN
- ❌ `.next/` - build folder
- ❌ `node_modules/` - dependencies
- ❌ `db/*.db*` - database bestanden
- ❌ `.git/` - git history
- ❌ `.env*` - environment variabelen
- ❌ `dev.log` - ontwikkelingslogs
- ❌ `upload/` - geüploade bestanden

## 🚀 Installatie & Setup

### 1. Uitpakken
```bash
unzip DartsPro-Latest-20260301-2014.zip
cd my-project
```

### 2. Dependencies installeren
```bash
bun install
```

### 3. Environment variabelen instellen
Maak een `.env` bestand:
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 4. Database schema pushen
```bash
bun run db:push
```

### 5. Applicatie starten
```bash
bun run dev
```

Open http://localhost:3000 in je browser.

## 🗄️ Database Setup

### Voor Supabase (Aanbevolen voor Vercel)
1. Maak een project aan op supabase.com
2. Kopieer de Database URL uit Settings → Database
3. Voeg toe aan `.env` bestand
4. Run `bun run db:push`

### Voor Lokale PostgreSQL
```bash
# Maak database
createdb dartspro

# Update .env
DATABASE_URL=postgresql://postgres@localhost:5432/dartspro

# Push schema
bun run db:push
```

### Voor Vercel Postgres
1. Ga naar je Vercel project
2. Storage → Create Database → Postgres
3. Vercel stelt automatisch `DATABASE_URL` in
4. Run `bun run db:push`

## 📤 Naar GitHub Pushen

```bash
cd my-project

# (Eerste keer) Git repository initialiseren
git init
git add .
git commit -m "Initial commit - DartsPro with PostgreSQL and forgot password"

# Remote toevoegen (vervang YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/dartspro.git
git branch -M main
git push -u origin main
```

## 🌐 Deployen naar Vercel

### Via GitHub Integration
1. Push code naar GitHub
2. Ga naar vercel.com
3. "Add New Project" → Selecteer je GitHub repo
4. Stel environment variabelen in:
   ```
   DATABASE_URL=jouw_postgresql_connection_string
   ```
5. Klik "Deploy"

### Manual Deploy
1. Installeer Vercel CLI: `bun i -g vercel`
2. Run: `vercel`
3. Volg de instructies

## 🔍 Nieuwe Pagina's

### Forgot Password
- URL: `/forgot-password`
- Functie: Gebruiker kan email invullen
- Resultaat: Reset link wordt verstuurd (in dev: getoond in console)

### Reset Password
- URL: `/reset-password?token=TOKEN`
- Functie: Wachtwoord wijzigen met token
- Validatie: Minimaal 6 tekens, bevestiging vereist

## ⚠️ Productie Notities

### Email Service
De forgot password flow genereert een token, maar verstuurt **niet echt** een email in deze versie.

Voor productie moet je een email service implementeren:
- Resend.com (gratis tier beschikbaar)
- SendGrid
- AWS SES
- Supabase Email

Bekijk `/src/app/api/auth/forgot-password/route.ts` voor implementatie details.

### Security
- Tokens expire na 1 uur
- Wachtwoord hashing met bcrypt
- Geen onthullen of email bestaat (security best practice)
- Validatie voor alle inputs

## 🐛 Probleemoplossing

### Database connectie fouten
```bash
# Controleer .env bestand
cat .env | grep DATABASE_URL

# Test connectie
bun run db:studio
```

### Build errors
```bash
# Dependencies herinstalleren
rm -rf node_modules bun.lock
bun install

# Cache wissen
rm -rf .next
bun run dev
```

### Type errors
```bash
# Prisma client regenereren
bun run db:generate
```

## 📚 Documentatie

- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)

## 💡 Tips

1. Gebruik Supabase voor snelste setup met Vercel
2. Test lokaal met PostgreSQL voor production
3. Gebruik `bun run db:studio` voor visuele database
4. Lees `DEPLOYMENT.md` voor meer deployment details
5. Email service is nodig voor productie forgot password

## 📞 Ondersteuning

Als je problemen hebt:
1. Check environment variabelen
2. Verify `DATABASE_URL` is correct
3. Controleer of PostgreSQL draait
4. Check Vercel build logs
5. Probeer lokale `bun run dev` eerst

---

**Versie:** DartsPro-Latest-20260301-2014  
**Laatste Update:** 1 Maart 2026  
**Status:** Production Ready
