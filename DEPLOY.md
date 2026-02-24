# Deploy naar Vercel met Supabase

## Wat is er al gedaan?

✅ Prisma schema bijgewerkt naar PostgreSQL
✅ Database credentials ingesteld
✅ WebSocket uitgeschakeld in production
✅ Health check endpoint toegevoegd
✅ Code geoptimaliseerd voor Vercel

## Deploy Stappen:

### Stap 1: Commit je wijzigingen

```bash
git add .
git commit -m "Migrate to PostgreSQL (Supabase)"
git push
```

### Stap 2: Vercel Deployment

1. Ga naar je Vercel project: `https://vercel.com/[jouw-username]/dartsgame-ten`

2. Vercel detecteert de push en start automatisch deploy

3. Tijdens deploy:
   - Vercel gebruikt de DATABASE_URL van de Supabase integratie
   - Prisma Client wordt gegenereerd
   - Database tabellen worden aangemaakt (automatisch via db:push in build)

4. Wachten tot deploy voltooid is

### Stap 3: Test de App

Na deploy:

1. **Test Health Check:**
   ```
   https://dartsgame-ten.vercel.app/api/health
   ```
   Je zou moeten zien:
   ```json
   {
     "status": "ok",
     "message": "Database connection successful"
   }
   ```

2. **Test de App:**
   ```
   https://dartsgame-ten.vercel.app/
   ```

3. **Probeer een speler toe te voegen**
   - Ga naar Beheer tab
   - Voeg een nieuwe speler toe
   - Kijk of het werkt!

## Mogelijke Problemen:

### Probleem: "Speler aanmaken mislukt"

**Oplossing 1:** Check Vercel logs
- Ga naar Vercel project
- Klik op "Functions"
- Bekijk logs voor errors

**Oplossing 2:** Check environment variables
- Vercel Settings → Environment Variables
- Zorg dat `DATABASE_URL` bestaat (moet automatisch door Vercel/Supabase integratie zijn ingesteld)

### Probleem: Health check geeft error

**Oplossing:** Database tabellen niet aangemaakt
- De eerste deploy kan soms falen
- Vercel zal automatisch opnieuw proberen
- Of voer handmatig uit:
  ```bash
  vercel env pull .env
  npx prisma db push
  ```

## Database Tabellen

Na succesvol deploy worden deze tabellen aangemaakt:
- ✅ Player (spelers met nickname, avatar, initials)
- ✅ Challenge (dagelijkse challenges)
- ✅ Score (scores van spelers)
- ✅ SiteSettings (logo opgeslagen in database)

## Volgende Features die werken:

1. **Speler beheer** - Spelers toevoegen, bewerken, verwijderen
2. **Dagelijkse challenges** - Scores indienen
3. **Leaderboards** - Vandaag, week, overall
4. **Training games** - Alle training games met uitleg
5. **Score tracker** - 101/301/501 met checkout suggesties
6. **Logo upload** - Logo opgeslagen in database
7. **Mobile optimalisatie** - Werkt op mobiel

## Data is Leeg bij Start

⚠️ Belangrijk:
- Je lokale SQLite database wordt **NIET** gemigreerd
- Spelers en scores starten leeg op Supabase
- Je moet opnieuw spelers aanmaken in de nieuwe database

## Succes! 🎯

Als alles werkt, heb je een volledig functionele darts app op Vercel met Supabase database!
