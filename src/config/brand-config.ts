// Marimecs Darts App - Branding Configuration
// ========================================
// Pas hier je kleuren, logo en andere branding settings aan
// Wijzigingen worden automatisch toegepast in de hele app

export const brandConfig = {
  // Kleurenschema
  colors: {
    // Primaire kleur (donker, voor titels, headers, buttons)
    primary: '#2d3748', // Marimecs donkerblauw/grijs
    
    // Secundaire kleur (middel, voor hover states, actieve elementen)
    secondary: '#4a5568', // Marimecs grijs
    
    // Achtergrondkleur (licht, voor achtergronden, cards)
    background: '#f7fafc', // Lichtgrijs/wit
    
    // Accentkleur (voor highlights, belangrijke elementen)
    accent: '#2d3748', // Kan worden aangepast voor accenten
    
    // Succes kleur (voor positieve feedback, checkouts, etc.)
    success: '#10b981', // Groen
    
    // Waarschuwing kleur
    warning: '#f59e0b', // Oranje/Geel
    
    // Error kleur
    error: '#ef4444', // Rood
  },

  // Logo instellingen
  logo: {
    // Pad naar je logo (plaats logo bestanden in de /public folder)
    path: '/marimecs-logo.png',
    
    // Alt tekst voor toegankelijkheid
    alt: 'Marimecs Logo',
    
    // Hoogte van het logo in pixels
    height: 48,
    
    // Toon tekst in de header (naast of in plaats van logo)
    showText: true,
    
    // Bedrijfsnaam
    companyName: 'Marimecs',
    
    // Tagline/slogan
    tagline: 'MARITIME EXCELLENCE',
  },

  // Website / App informatie
  app: {
    // Naam van de applicatie
    name: 'Marimecs Darts Challenge',
    
    // Korte beschrijving
    description: 'Darts Challenge & Training App',
    
    // Footer tagline
    footerTagline: 'Elke dag een nieuwe uitdaging! • Train, verbeter, win! 🎯',
    
    // Jaar voor copyright
    year: new Date().getFullYear(),
  },

  // Spel instellingen
  game: {
    // Default spel type bij score teller
    defaultScoreType: '301', // '101', '301', of '501'
    
    // Aantal pijlen per beurt
    dartsPerTurn: 3,
    
    // Maximum score voor checkout helper
    maxCheckoutScore: 170,
    
    // Minimum score voor checkout helper
    minCheckoutScore: 2,
  },

  // Challenge instellingen
  challenge: {
    // Uitdagingen automatisch roteren op dagbasis
    autoRotate: true,
    
    // Aantal dagen voordat een challenge herhaald wordt (optioneel)
    rotationDays: 11, // 11 verschillende challenges
  },

  // Leaderboard instellingen
  leaderboard: {
    // Aantal top scores om te tonen
    topScores: 10,
    
    // Aantal recente games in geschiedenis
    recentGames: 10,
  },

  // UI instellingen
  ui: {
    // Hoeveelheid afstand tussen elementen (spacing)
    spacing: {
      small: '0.5rem',
      medium: '1rem',
      large: '2rem',
    },
    
    // Afgeronde hoeken
    borderRadius: {
      small: '0.375rem',
      medium: '0.5rem',
      large: '0.75rem',
    },
    
    // Schaduw intensiteit
    shadow: {
      small: 'shadow-sm',
      medium: 'shadow',
      large: 'shadow-lg',
    },
  },
}

// Helper functies om gemakkelijk kleuren te gebruiken in CSS classes
export const getPrimaryColor = () => brandConfig.colors.primary
export const getSecondaryColor = () => brandConfig.colors.secondary
export const getBackgroundColor = () => brandConfig.colors.background
export const getAccentColor = () => brandConfig.colors.accent
export const getSuccessColor = () => brandConfig.colors.success

export default brandConfig
