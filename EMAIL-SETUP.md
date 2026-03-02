# Email Setup Guide

Deze applicatie gebruikt **Resend** voor het verzenden van emails (verificatie en wachtwoord reset).

## Waarom Resend?

- ✅ Gratis tier beschikbaar (tot 3.000 emails per maand)
- ✅ Eenvoudige integratie met Next.js
- ✅ Werkt perfect met Vercel
- ✅ Professionele email templates
- ✅ goede deliverability

## Setup Instructies

### Stap 1: Maak een Resend Account

1. Ga naar [resend.com](https://resend.com)
2. Maak een gratis account aan
3. Verifieer je emailadres

### Stap 2: Verifieer je Domein (Optioneel maar aanbevolen)

**Voor productie:**
1. Ga naar Resend dashboard → Domains
2. Voeg je domein toe (bijv. `dartspro.nl`)
3. Volg de DNS instructies
4. Wacht tot het domein is geverifieerd

**Voor development/test:**
- Je kunt `@resend.dev` gebruiken (gratis test domein)

### Stap 3: Haal je API Key op

1. Ga naar Resend dashboard → API Keys
2. Klik op "Create API Key"
3. Geef het een naam (bijv. "DartsPro Production")
4. Kopieer de API key

### Stap 4: Voeg Environment Variables toe

Voeg deze variabelen toe in je `.env` bestand en op je hosting platform (Vercel):

```env
# Resend Email Config
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@joudomein.com
NEXT_PUBLIC_APP_URL=https://jouw-app.vercel.app
```

**Belangrijk:**
- `RESEND_API_KEY`: Je Resend API key van stap 3
- `RESEND_FROM_EMAIL`: Het emailadres waarvan emails worden verzonden
  - Voor test: gebruik `onboarding@resend.dev`
  - Voor productie: gebruik je geverifieerde domein (bijv. `noreply@dartspro.nl`)
- `NEXT_PUBLIC_APP_URL`: De URL van je app
  - Local: `http://localhost:3000`
  - Production: `https://jouw-app.vercel.app`

### Stap 5: Vercel Environment Variables

1. Ga naar je project op Vercel
2. Klik op Settings → Environment Variables
3. Voeg de bovenstaande variabelen toe
4. Redeploy je app

## Local Development

Voor local development heb je de `.env` file nodig:

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

## Testen

Om te testen of email werkt:

1. Registreer een nieuw account
2. Check je inbox (en spam folder)
3. Klik op de bevestigingslink

## Foutoplossing

### Geen email ontvangen?

1. **Check de environment variables:**
   ```bash
   # In je terminal
   echo $RESEND_API_KEY
   echo $RESEND_FROM_EMAIL
   ```

2. **Check de logs:**
   - In development: zie console output
   - In production: check Vercel logs

3. **Email in spam folder?**
   - Voeg het afzenderadres toe aan je contacten

4. **API key verkeerd?**
   - Ga naar Resend dashboard
   - Genereer een nieuwe API key
   - Update je environment variables

### "Email kon niet worden verzonden" bericht

Als je dit bericht ziet:
- Check de console logs voor details
- Controleer of je Resend API key correct is
- Zorg dat je `.env` file correct is geüpload

## Alternatieve Email Providers

Als je Resend niet wilt gebruiken, kun je ook:
- **SendGrid** (gratis tier beschikbaar)
- **Postmark** (geen gratis tier)
- **Mailgun** (gratis tier beschikbaar)
- **AWS SES** (pay-as-you-go)

De implementatie zou vergelijkbaar zijn, alleen de email library verschilt.

## Kosten

- **Resend Free Tier:** 3.000 emails/maand
- **Extra emails:** $1 per 100.000 emails

Voor de meeste darts apps is de gratis tier ruim voldoende!

## Veiligheid

⚠️ **Nooit** je API keys committen naar Git!
- Voeg `.env` toe aan `.gitignore` (al gedaan)
- Gebruik environment variables op Vercel
- Genereer nieuwe API keys als ze gelekt zijn
