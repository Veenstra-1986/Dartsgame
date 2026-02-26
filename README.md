# 🎯 DartsPro - Bedrijfs Darts Competitie App

Een complete darts competitie applicatie voor bedrijven met dagelijkse challenges, leaderboards, training tools en een professionele scoreteller.

## ✨ Features

- 🎯 **Professionele Scoreteller** met check-out suggesties (501, 301, Cricket)
- 🏆 **Dagelijkse Challenges** en competitieve leaderboards
- 📊 **Wedstrijd Statistieken** tussen spelers
- 🏋️ **Training Oefeningen** voor alle niveaus
- 👥 **Groepen & Uitnodigingen** met invite codes
- 🎨 **Personalisatie** - accentkleuren, logo's en app-naam
- 📱 **Mobile-First Design** met sticky bottom navigatie
- 🔐 **Gebruikersauthenticatie** met email verificatie

## 🚀 Quick Start (Lokaal Development)

### Benodigdheden
- Node.js 18+
- Bun (npm alternatief, sneller)
- SQLite (voor lokale ontwikkeling)

### Installatie

```bash
# Installeer dependencies
bun install

# Push database schema
bun run db:push

# (Optioneel) Voeg test data toe
bun run db:seed

# Start development server
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in je browser.

## 📁 Project Structuur

```
my-project/
├── src/
│   ├── app/                    # Next.js App Router pagina's
│   │   ├── page.tsx           # Homepage
│   │   ├── scoreboard/         # Scoreteller
│   │   ├── challenges/         # Challenges
│   │   ├── training/          # Training
│   │   ├── leaderboard/        # Leaderboards
│   │   ├── settings/          # Instellingen
│   │   ├── login/             # Login
│   │   └── register/          # Registratie
│   ├── components/
│   │   ├── darts-keypad.tsx   # Darts score invoer
│   │   ├── number-keypad.tsx  # Nummeriek toetsenbord
│   │   ├── mobile-nav.tsx     # Mobiele navigatie
│   │   └── ui/                # shadcn/ui componenten
│   ├── contexts/
│   │   └── settings-context.tsx  # Global settings
│   ├── lib/
│   │   └── db.ts              # Prisma client
│   └── app/
│       └── globals.css        # Global styles
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts               # Test data
├── db/                        # SQLite database bestanden
└── public/                    # Statische bestanden
```

## 🎮 Scoreteller Features

### Invoermethoden
1. **Per Dart** - D/T/SB/DB modifiers met nummers 1-20
2. **3 Darts + Bevestig** - 3 scores invoeren en bevestigen
3. **Directe Score** - 0-9 nummeriek toetsenbord

### Ondersteunde Spelletjes
- **501** - Klassiek darts spel
- **301** - Snellere variant
- **Cricket** - Cricket regels

### Features
- ✅ Check-out suggesties voor scores ≤ 170
- ✅ Bust detectie (score onder 0)
- ✅ Resterende score berekening
- ✅ Darts statistieken per speler
- ✅ Gemiddelde per 3 darts

## 🏆 Leaderboard & Challenges

- **Weekelijkse rankings** - Per week competities
- **Overall rankings** - Alle tijd
- **Dagelijkse challenges** - Nieuwe games elke dag
- **Groep system** - Maak groepen voor collega's
- **Invite codes** - Nodig collega's eenvoudig uit

## 🎨 Personalisatie

Log in om aan te passen:
- **Accentkleuren** - 8 kleuropties (emerald, blue, purple, rose, amber, orange, teal, slate)
- **Logo** - Upload je bedrijfslogo (JPG, PNG, GIF, WebP - max 2MB)
- **App Naam** - Pas de naam van de app aan (bijv. "Bedrijfs Darts")

## 📱 Responsive Design

- **Mobile-First** - Geoptimaliseerd voor smartphones
- **Sticky Bottom Nav** - Snelle toegang tot alle features
- **Compact UI** - Kleinere fonts en padding voor mobile
- **Touch-Friendly** - Grote knoppen (min 44px)

## 🔐 Authenticatie

- **Email Registratie** met verificatie
- **Wachtwoord Hashing** met bcrypt
- **Sessie Management** met JWT tokens
- **Group Invitation** met unieke codes

## 🗄️ Database Schema

### Modellen
- **User** - Spelers met personalisatie
- **Group** - Competitie groepen
- **GroupMember** - Groep lidmaatschappen
- **Invitation** - Uitnodigingen
- **Challenge** - Dagelijkse challenges
- **ChallengeScore** - Challenge scores
- **Match** - Wedstrijden
- **MatchScore** - Wedstrijd scores
- **Training** - Training oefeningen
- **TrainingProgress** - Training voortgang

## 🚀 Deployment

### Vercel (Aanbevolwen)

Zie `DEPLOYMENT.md` voor gedetailleerde instructies.

**Korte versie:**
1. Maak een GitHub repository
2. Push je code
3. Import in Vercel
4. Voeg environment variables toe (DATABASE_URL, NEXTAUTH_SECRET)
5. Deploy!

**Belangrijk:** Voor Vercel moet je PostgreSQL gebruiken (SQLite werkt niet in de cloud).

### Alternatieven
- **Railway** - Volledige PostgreSQL integratie
- **Render** - PostgreSQL + eenvoudige deployment
- **Docker** - Volledige controle

## 🔧 Development

```bash
# Run development server
bun run dev

# Type check
bun run lint

# Database migrations
bun run db:push
bun run db:generate
bun run db:migrate

# Reset database
bun run db:reset
```

## 📝 API Endpoints

### Authentication
- `POST /api/auth/register` - Registreren
- `POST /api/auth/login` - Inloggen
- `GET /api/auth/verify?token=xxx` - Email verifiëren

### Challenges
- `GET /api/challenges` - Alle challenges
- `POST /api/challenges` - Challenge aanmaken (admin)

### Leaderboard
- `GET /api/leaderboard?period=weekly` - Weekelijkse ranking
- `GET /api/leaderboard?period=overall` - Overall ranking

### Groups
- `GET /api/groups` - Jouw groepen
- `POST /api/groups` - Nieuwe groep maken
- `POST /api/groups/invite` - Uitnodiging aanmaken

### Settings
- `GET /api/settings` - Jouw instellingen
- `PUT /api/settings` - Instellingen bijwerken
- `POST /api/settings/logo` - Logo uploaden

## 🎨 Kleuren Schema

De app gebruikt 8 accentkleuren:

| Kleur | Naam | Tailwind Classes |
|-------|------|-----------------|
| 🟢 Emerald | Emerald | `bg-emerald-600` |
| 🔵 Blue | Blue | `bg-blue-600` |
| 🟣 Purple | Purple | `bg-purple-600` |
| 🔴 Rose | Rose | `bg-rose-600` |
| 🟡 Amber | Amber | `bg-amber-600` |
| 🟠 Orange | Orange | `bg-orange-600` |
| 🔷 Teal | Teal | `bg-teal-600` |
| ⚫ Slate | Slate | `bg-slate-600` |

## 📄 License

MIT License - zie LICENSE bestand voor details

## 🤝 Contributen

Contributies zijn welkom! Maak een pull request of open een issue.

## 📞 Support

Voor vragen of problemen, maak een issue aan op GitHub.

---

Gemaakt met ❤️ voor darts enthusiasts door het DartsPro team.
