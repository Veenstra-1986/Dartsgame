'use client'

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Target, Calendar, Crosshair, User, Plus, Zap, Award, Flame, Anchor, BookOpen, Shield, Clock, Gamepad2, Sword, Users, Swords, Calculator, CheckCircle, Minus, RefreshCw, HelpCircle, List, Undo2, TrendingUp, Play } from 'lucide-react'
import brandConfig from '@/config/brand-config'

interface Player {
  id: string
  name: string
  email?: string
  initials?: string
}

interface Challenge {
  id: string
  name: string
  description: string
  type: string
  targetValue?: number
  date: string
}

interface LeaderboardEntry {
  rank: number
  playerName: string
  initials: string
  score: number
  isCurrentUser: boolean
}

// Checkout suggestions
const CHECKOUT_SUGGESTIONS: { [key: number]: string[] } = {
  2: ['D1'],
  3: ['D1', 'D1'],
  4: ['D2'],
  5: ['D1', 'D2'],
  6: ['D3', 'D2', 'D1'],
  7: ['D3', 'D2'],
  8: ['D4'],
  9: ['D1', 'D4'],
  10: ['D5'],
  11: ['D3', 'D1', 'D1'],
  12: ['D6'],
  13: ['D3', 'D1'],
  14: ['D7'],
  15: ['D7', 'D8'],
  16: ['D8'],
  17: ['D1', 'D1'],
  18: ['D4', 'D14'],
  19: ['D3', 'D7'],
  20: ['D10'],
  21: ['D5', 'D16'],
  22: ['D10', 'D12'],
  23: ['D7', 'D16'],
  24: ['D12', 'D12'],
  25: ['D9', 'D16', 'D8'],
  26: ['D10', 'D10', 'D6'],
  27: ['D11', 'D14'],
  28: ['D14', 'D14'],
  29: ['D13', 'D13'],
  30: ['D15', 'D10', 'D5'],
  31: ['D15', 'D10'],
  32: ['D16'],
  33: ['D1', 'D16', 'D8'],
  34: ['D18', 'D16'],
  35: ['D19', 'D16'],
  36: ['D18', 'D18'],
  37: ['D20', 'D17'],
  38: ['D20', 'D18'],
  39: ['D19', 'D20'],
  40: ['D20', 'D20'],
  41: ['T9', 'D7'],
  42: ['T10', 'D6'],
  43: ['T9', 'D8'],
  44: ['T12', 'D4'],
  45: ['T13', 'D3'],
  46: ['T14', 'D2'],
  47: ['T15', 'D1'],
  48: ['T16', 'D16'],
  49: ['T15', 'D7'],
  50: ['D25'],
  51: ['T11', 'D9'],
  52: ['T12', 'D8'],
  53: ['T13', 'D7'],
  54: ['T14', 'D6'],
  55: ['T15', 'D5'],
  56: ['T16', 'D4'],
  57: ['T17', 'D3'],
  58: ['T18', 'D2'],
  59: ['T19', 'D1'],
  60: ['D20', 'D20'],
  61: ['T11', 'D14'],
  62: ['T12', 'D13'],
  63: ['T13', 'D12'],
  64: ['T14', 'D11'],
  65: ['T15', 'D10'],
  66: ['T16', 'D9'],
  67: ['T17', 'D8'],
  68: ['T18', 'D7'],
  69: ['T19', 'D6'],
  70: ['T14', 'D14'],
  71: ['T13', 'D16'],
  72: ['T16', 'D12'],
  73: ['T17', 'D11'],
  74: ['T18', 'D10'],
  75: ['T19', 'D9'],
  76: ['D20', 'D18'],
  77: ['T19', 'D10'],
  78: ['T18', 'D12'],
  79: ['T13', 'D20'],
  80: ['D20', 'D20'],
  81: ['T19', 'D12'],
  82: ['T18', 'D14'],
  83: ['T17', 'D16'],
  84: ['D20', 'D22'],
  85: ['T15', 'D20'],
  86: ['T18', 'D16'],
  87: ['T17', 'D18'],
  88: ['T16', 'D20'],
  89: ['T19', 'D16'],
  90: ['D20', 'D25'],
  91: ['T17', 'D20'],
  92: ['T20', 'D16'],
  93: ['T19', 'D18'],
  94: ['T18', 'D20'],
  95: ['T19', 'D19'],
  96: ['D20', 'D28'],
  97: ['T19', 'D20'],
  98: ['T20', 'D19'],
  99: ['T19', 'D21'],
  100: ['D20', 'D20'],
  101: ['T17', 'D25'],
  102: ['T20', 'D21'],
  103: ['T19', 'D23'],
  104: ['T19', 'D24'],
  105: ['T20', 'D25'],
  106: ['T20', 'D23'],
  107: ['T19', 'D25'],
  108: ['T20', 'D24'],
  109: ['T19', 'D26'],
  110: ['T20', 'D25'],
  111: ['T19', 'D27'],
  112: ['T20', 'D26'],
  113: ['T19', 'D28'],
  114: ['T20', 'D27'],
  115: ['T19', 'D29'],
  116: ['T20', 'D28'],
  117: ['T17', 'D33'],
  118: ['T20', 'D29'],
  119: ['T19', 'D31'],
  120: ['D20', 'D20'],
  121: ['T19', 'D32'],
  122: ['T20', 'D31'],
  123: ['T19', 'D33'],
  124: ['T20', 'D32'],
  125: ['T19', 'D34'],
  126: ['T20', 'D33'],
  127: ['T19', 'D35'],
  128: ['T20', 'D34'],
  129: ['T19', 'D36'],
  130: ['T20', 'D35'],
  131: ['T19', 'D37'],
  132: ['T20', 'D36'],
  133: ['T19', 'D38'],
  134: ['T20', 'D37'],
  135: ['T19', 'D39'],
  136: ['T20', 'D38'],
  137: ['T19', 'D40'],
  138: ['T20', 'D39'],
  139: ['T19', 'D41'],
  140: ['D20', 'D20'],
  141: ['T19', 'D42'],
  142: ['T20', 'D41'],
  143: ['T19', 'D43'],
  144: ['T20', 'D42'],
  145: ['T19', 'D44'],
  146: ['T20', 'D43'],
  147: ['T19', 'D45'],
  148: ['T20', 'D44'],
  149: ['T19', 'D46'],
  150: ['T20', 'D45'],
  151: ['T19', 'D47'],
  152: ['T20', 'D46'],
  153: ['T19', 'D48'],
  154: ['T20', 'D47'],
  155: ['T19', 'D49'],
  156: ['T20', 'D48'],
  157: ['T19', 'D50'],
  158: ['T20', 'D49'],
  159: ['T19', 'D51'],
  160: ['D20', 'D20'],
  161: ['T19', 'D52'],
  162: ['T20', 'D51'],
  163: ['T19', 'D53'],
  164: ['T19', 'D54'],
  165: ['T19', 'D53'],
  166: ['T19', 'D55'],
  167: ['T19', 'D55'],
  168: ['T20', 'D54'],
  169: ['T19', 'D56'],
  170: ['T20', 'T18', 'Bull'],
}

// Challenge Types
const CHALLENGE_TYPES = [
  {
    id: 'high_score',
    name: 'High Score',
    icon: <Trophy className="h-6 w-6" />,
    description: 'Gooi de hoogst mogelijke score in 3 minuten!',
    fullDescription: 'De High Score challenge is de ultieme test van je scoren vermogen. In slechts 3 minuten moet je zo veel mogelijk punten verzamelen. Focus op de triple 20 en bullseye voor de maximale score. Dit is een race tegen de klok!',
    rules: [
      'Je hebt 3 minuten de tijd',
      'Gooi zoveel mogelijk pijlen als mogelijk',
      'Tel alleen de scores die raken',
      'Missers tellen als 0',
      'Focus op T20 en Bullseye voor maximale punten'
    ],
    tips: [
      'Blijf gooien op Triple 20 (hoogste score)',
      'Gooi snel, niet perfect - tempo is belangrijk',
      'Bullseye (50) is het doel als T20 niet lukt',
      'Houd je pijlen in de buurt om tijd te besparen',
      'Adem rustig uit voor je gooit'
    ],
    difficulty: 'Gemiddeld',
    duration: '3 minuten'
  },
  {
    id: 'triple_20_blitz',
    name: 'Triple 20 Blitz',
    icon: <Target className="h-6 w-6" />,
    description: 'Hoe vaak raak je Triple 20 in 2 minuten?',
    fullDescription: 'Triple 20 Blitz test je nauwkeurigheid op het meest waardevolle gebied van het bord. In 2 minuten moet je zo vaak mogelijk de Triple 20 raken. Elke T20 telt als 1 punt. De perfecte oefening voor je beslissingsmomenten!',
    rules: [
      '2 minuten speeltijd',
      'Alleen Triple 20 raakt = 1 punt',
      'Single 20 = 0 punten',
      'Miss = 0 punten',
      'Probeer maximaal aantal T20s te raken'
    ],
    tips: [
      'Focus op één ritme',
      'Niet te hard gooien, nauwkeurigheid eerst',
      'Visualiseer de T20 voor je gooit',
      'Houd je arm ontspannen',
      'Neem rustig de tijd per pijl'
    ],
    difficulty: 'Moeilijk',
    duration: '2 minuten'
  },
  {
    id: 'bullseye_blitz',
    name: 'Bullseye Blitz',
    icon: <Crosshair className="h-6 w-6" />,
    description: 'Raak de Bullseye zo vaak mogelijk!',
    fullDescription: 'Bullseye Blitz is pure concentratie. Raak de Bullseye (50 punten) zo vaak mogelijk in 2 minuten. De buitenste bull (25) telt als half punt. Dit is de ultieme test van je focus en steadiness onder druk!',
    rules: [
      '2 minuten speeltijd',
      'Bullseye (50) = 2 punten',
      'Outer Bull (25) = 1 punt',
      'Miss = 0 punten',
      'Probeer maximaal punten te verzamelen'
    ],
    tips: [
      'Visualiseer een klein stipje in het midden',
      'Gooi zachtjes, niet te hard',
      'Houd je arm stil voor je gooit',
      'Focus, focus, focus!',
      'Dit is een rustoefening - blijf kalm'
    ],
    difficulty: 'Moeilijk',
    duration: '2 minuten'
  },
  {
    id: 'target_number_hunt',
    name: 'Target Number Hunt',
    icon: <TrendingUp className="h-6 w-6" />,
    description: 'Raak het target nummer zo vaak mogelijk!',
    fullDescription: 'Elke dag een willekeurig target nummer. Raak dit nummer zo vaak mogelijk in 2 minuten. Het doel is consistentie op verschillende posities op het bord. Perfect voor het trainen van je gehele bord!',
    rules: [
      'Dagelijks wisselend target nummer',
      '2 minuten speeltijd',
      'Raak het target nummer (single, double, of triple)',
      'Triple = 3x punten, Double = 2x punten, Single = 1 punt',
      'Probeer je eigen record te verbeteren'
    ],
    tips: [
      'Leer de positie van elk nummer',
      'Adapt snel aan het nieuwe target',
      'Triples zijn de moeite waard (3x punten)',
      'Houd je ritme constant',
      'Eerste gooien zijn vaak het beste - begin goed!'
    ],
    difficulty: 'Gemiddeld',
    duration: '2 minuten'
  },
  {
    id: 'round_the_clock',
    name: 'Round the Clock',
    icon: <Clock className="h-6 w-6" />,
    description: 'Gooi van 1 tot 20 in volgorde!',
    fullDescription: 'De klassieke warming-up oefening die elke darter kent. Gooi van 1 tot 20 in volgorde. Hoe minder pijlen, hoe beter. Een geweldige manier om je warming-up te doen en je gehele bord te leren!',
    rules: [
      'Begin bij 1, ga door tot 20',
      'Je moet het nummer raken om door te gaan',
      'Single, Double of Triple - alles telt',
      'Tel je aantal worpen',
      'Finish met Bullseye als bonus'
    ],
    tips: [
      'Gebruik dit als dagelijkse warming-up',
      'Niet te hard gooien, accuracy eerst',
      'Leer de relatieve posities',
      'Neem rustig de tijd per nummer',
      'Probeer onder de 20-24 darts te finishen'
    ],
    difficulty: 'Gemiddeld',
    duration: '3-5 minuten'
  },
  {
    id: 'double_dash',
    name: 'Double Dash',
    icon: <Shield className="h-6 w-6" />,
    description: 'Alle doubles van 1-20 in volgorde!',
    fullDescription: 'De ultieme test voor je double skills. Gooi elke dubbele van 1 tot 20 in volgorde. Alleen doubles tellen. Dit is een uitdaging voor gevorderde spelers die hun checkout game willen verbeteren!',
    rules: [
      'Begin bij D1, ga door tot D20',
      'Alleen doubles tellen',
      'Je moet de double raken om door te gaan',
      'Bullseye (50) telt als double',
      'Tel het aantal darts'
    ],
    tips: [
      'Focus op consistentie, niet snelheid',
      'Begin met makkelijke doubles (D16, D8, D20)',
      'Gebruik een ritme voor elke double',
      'Probeer triples te vermijden (telt niet)',
      'Oefen regelmatig voor verbetering'
    ],
    difficulty: 'Zeer Moeilijk',
    duration: '10-15 minuten'
  },
  {
    id: 'cricket_quick',
    name: 'Cricket Quick',
    icon: <Sword className="h-6 w-6" />,
    description: 'Sluit 15-20 en Bull zo snel mogelijk!',
    fullDescription: 'Cricket in snelle versie. Sluit de nummers 15, 16, 17, 18, 19, 20 en Bull. Raak elk nummer 3x (triple telt als 3x). Wie als eerst alles sluit wint! Een tactisch en sneller spel!',
    rules: [
      'Nummers: 20, 19, 18, 17, 16, 15 en Bull',
      'Raak elk nummer 3x om te sluiten',
      'Triple = 3x raak in één worp',
      'Na sluiten mag je er punten van scoren',
      'Eerste die alles sluit wint'
    ],
    tips: [
      'Sluit nummers van hoog naar laag',
      'Triples zijn essentieel voor snelheid',
      'Focus op één nummer tegelijk',
      'Bull is 50 en kan snel worden gesloten',
      'Leer je favoriete volgorde'
    ],
    difficulty: 'Moeilijk',
    duration: '5-10 minuten'
  },
  {
    id: 'checkout_challenge',
    name: '100 Check-out',
    icon: <Zap className="h-6 w-6" />,
    description: 'Start met 100 en check uit met een double!',
    fullDescription: 'Een uitdagende checkout test. Begin met 100 punten en probeer zo snel mogelijk uit te checken met een double. Probeer dit meerdere keren en verbeter je tijd. Perfect voor het oefenen van druk situaties!',
    rules: [
      'Begin met 100 punten',
      'Trek je score af na elke worp',
      'Eindig precies op 0 met een double',
      'Overshoot = opnieuw beginnen',
      'Probeer zo min mogelijk dartsen te gebruiken'
    ],
    tips: [
      'Ken je checkout routes',
      'D20, D16, D20 is de standaard',
      'Oefen doubles onder druk',
      'Focus, niet haasten',
      'Dit is wat telt in echte wedstrijden!'
    ],
    difficulty: 'Moeilijk',
    duration: '2-3 minuten'
  },
  {
    id: 'seven',
    name: 'Seven',
    icon: <Play className="h-6 w-6" />,
    description: 'Raak 7-16, 9-12, 11-14, 13-10 in volgorde!',
    fullDescription: 'Een klassieke oefening die je helpt om snel tussen nummers te schakelen. Gooi de paren in volgorde: 7-16, 9-12, 11-14, 13-10. Hoe minder pijlen, hoe beter!',
    rules: [
      'Gooi paren in volgorde: 7-16, 9-12, 11-14, 13-10',
      'Je moet beide nummers van een paar raken',
      'Doubles en triples tellen ook',
      'Hoe minder pijlen, hoe beter je score',
      'Pauzeer niet tussen paren, ga door!'
    ],
    tips: [
      'Leer de posities van alle nummers',
      'Focus op accuracy boven snelheid',
      'Gebruik triples om sneller te finishen',
      'Visualiseer de paren vooraf',
      'Snelheid komt met oefening'
    ],
    difficulty: 'Moeilijk',
    duration: '5-8 minuten'
  },
  {
    id: 'killer',
    name: 'Killer',
    icon: <Swords className="h-6 w-6" />,
    description: 'Iedereen krijgt 3 levens. Raak andres nummers om een leven te stelen!',
    fullDescription: 'Een competitief spel voor meerdere spelers. Iedereen kiest een nummer en krijgt 3 levens. Raak andres nummers om levens te stelen. Laatste overlevende wint!',
    rules: [
      'Iedereen kiest een nummer (3 levens)',
      'Raak andres nummer = 1 leven eraf',
      'Dubbel = 2 levens eraf',
      'Triple = 3 levens eraf',
      'Laatste overlevende wint het spel'
    ],
    tips: [
      'Kies een moeilijk nummer dat niemand raakt',
      'Wees agressief aan het begin van het spel',
      'Bescherm je eigen nummer door goed te gooien',
      'Probeer triples te gooien op andres nummers',
      'Let op wie de meeste levens heeft'
    ],
    difficulty: 'Makkelijk',
    duration: '10-15 minuten'
  },
  {
    id: 'around_the_clock_doubles',
    name: 'Around the Clock (Doubles)',
    icon: <Shield className="h-6 w-6" />,
    description: 'Alle doubles van 1-20 in volgorde!',
    fullDescription: 'De ultieme dubbele oefening. Begin bij dubbele 1 en werk je weg door tot dubbele 20. Je moet elke dubbele minimaal 1x raken. Alleen doorgaan wanneer je raakt. Een echte test voor dubbele experts!',
    rules: [
      'Begin bij dubbele 1, ga door tot dubbele 20',
      'Je moet elke dubbele minimaal 1x raken',
      'Als je mist, blijf je op die dubbele',
      'Score = aantal doubles geraken',
      'Maximum is 20 (perfect game!)'
    ],
    tips: [
      'Oefen alle doubles regelmatig',
      'Gebruik een ritme voor elke dubbele',
      'Focus op consistentie, niet snelheid',
      'Begin met makkelijke doubles (D16, D8, D20)',
      'Slaap over moeilijke doubles voor het einde'
    ],
    difficulty: 'Zeer Moeilijk',
    duration: '10-15 minuten'
  }
]

// Training Games
const TRAINING_GAMES = [
  {
    id: '101',
    name: '101',
    icon: <Trophy className="h-6 w-6" />,
    description: 'Klassiek darts spel - van 101 naar 0.',
    fullDescription: 'De 101 is de perfecte introductie tot het check-out darts. Begin met 101 punten en werk naar beneden. Het doel is om precies op 0 te eindigen met een dubbele. Dit is de snelste en makkelijkste versie van het klassieke 501.',
    rules: [
      'Begin met 101 punten',
      'Trek je score af na elke beurt',
      'Eindig precies op 0 met een dubbele',
      'Bullseye (50) telt als dubbele uit',
      'Overshoot = beurt overgeslagen of correctie',
      'Meestal gespeeld in 3 of 5 legs'
    ],
    tips: [
      'Plan je dubbel uit vooraf',
      'Veelvoorkomende checkouts: 32 (D16), 40 (D20), 24 (D12)',
      'Bullseye is 50 = uitcheck mogelijk!',
      'Als je onder 100 bent, check snel uit',
      'Oefen bekende checkouts'
    ],
    difficulty: 'Makkelijk',
    duration: '5-10 minuten',
    startingScore: 101
  },
  {
    id: '301',
    name: '301',
    icon: <Trophy className="h-6 w-6" />,
    description: 'Van 301 naar 0. Dubbel of bullseye uit!',
    fullDescription: '301 is de standaard voor beginnende competitieve darters. Het vereist meer planning en skill dan 101, maar is nog steeds toegankelijk. Je kunt uitchecken met een dubbele OF de bullseye.',
    rules: [
      'Begin met 301 punten',
      'Trek je score af na elke beurt',
      'Eindig precies op 0 met een dubbele of bullseye',
      'Bullseye (50) telt als dubbele uit',
      'Meestal gespeeld in 3 of 5 legs',
      'Hoge scores maken het makkelijker'
    ],
    tips: [
      'Blijf gooien op triple 20 (hoogste score)',
      'Leer je favoriete checkouts',
      'Bullseye (50) is een geweldige uit',
      'Onder 170? Checkouts zijn cruciaal',
      'Blijf kalm onder druk'
    ],
    difficulty: 'Gemiddeld',
    duration: '10-20 minuten',
    startingScore: 301
  },
  {
    id: '501',
    name: '501',
    icon: <Trophy className="h-6 w-6" />,
    description: 'Het klassieke professionele darts spel!',
    fullDescription: '501 is het wereldwijd meest gespeelde darts formaat. Het wordt gebruikt in alle grote toernooien zoals PDC World Championship. Het vereist een combinatie van hoge scores en nauwkeurige checkouts.',
    rules: [
      'Begin met 501 punten',
      'Trek je score af na elke beurt',
      'Eindig precies op 0 met een dubbele',
      'Meestal gespeeld in 3 of 5 legs',
      'Hoge scores zijn essentieel',
      'Overshoot = beurt overgeslagen'
    ],
    tips: [
      'Blijf gooien op triple 20 (hoogste score)',
      'Oefen checkout routes onder 170',
      'Leer de "big checkouts": 170, 167, 164, 161, 160',
      'Blijf kalm onder druk',
      'Plan je laatste 3 darts voor de checkout'
    ],
    difficulty: 'Moeilijk',
    duration: '15-30 minuten',
    startingScore: 501
  },
  {
    id: '701',
    name: '701',
    icon: <Trophy className="h-6 w-6" />,
    description: 'Voor de ervaren spelers - van 701 naar 0!',
    fullDescription: '701 wordt gespeeld door gevorderde spelers die een extra uitdaging willen. Het vereist consistent hoge scores (180\'s) en perfecte checkout skills. Alleen voor de echte experts!',
    rules: [
      'Begin met 701 punten',
      'Trek je score af na elke beurt',
      'Eindig precies op 0 met een dubbele',
      'Voor gevorderde spelers',
      '180 per beurt is het maximum (3x T20)'
    ],
    tips: [
      'Hoge scores zijn essentieel (180\'s)',
      'Beheer je checkout skills onder 170',
      'Consistentie is cruciaal',
      'Geen fouten toegestaan',
      'Mental strength is key'
    ],
    difficulty: 'Zeer Moeilijk',
    duration: '20-40 minuten',
    startingScore: 701
  },
  {
    id: 'round_the_clock_practice',
    name: 'Round the Clock (Practice)',
    icon: <Clock className="h-6 w-6" />,
    description: 'Oefen alle nummers van 1-20 in volgorde.',
    fullDescription: 'De perfecte dagelijkse oefening zonder tijdsdruk. Gooi van 1 tot 20 in volgorde. Geen limiet op aantal pijlen. Dit is geweldig om je accuracy en snelheid te verbeteren.',
    rules: [
      'Gooi van 1 tot 20 in volgorde',
      'Geen limiet op aantal pijlen',
      'Raak elk nummer minimaal 1x',
      'Probeer zo snel mogelijk te finishen',
      'Houd je tijd bij voor verbetering'
    ],
    tips: [
      'Gebruik dit als dagelijkse warming-up',
      'Focus op accuracy, niet snelheid',
      'Houd je tijd bij in een notitieblok',
      'Probeer je persoonlijk record te verbeteren',
      'Dit is de beste oefening voor beginners'
    ],
    difficulty: 'Makkelijk',
    duration: 'Variabel',
    startingScore: 0
  },
  {
    id: 'cricket_practice',
    name: 'Cricket (Practice)',
    icon: <Target className="h-6 w-6" />,
    description: 'Cricket in je eentje oefenen.',
    fullDescription: 'Cricket solo spelen is een uitstekende manier om je triple skills te verbeteren. De nummers zijn 20, 19, 18, 17, 16, 15 en Bull. Raak elk nummer 3x (triple telt als 3x). Daarna mag je punten scoren!',
    rules: [
      'Nummers: 20, 19, 18, 17, 16, 15 en Bull',
      'Raak elk nummer 3x om het te "sluiten"',
      'Triple telt als 3x raak',
      'Bull = 50 (telt dubbel)',
      'Na sluiten: mag je er punten van scoren',
      'Doel: zo hoog mogelijke score'
    ],
    tips: [
      'Sluit nummers van hoog naar laag (20 → 15)',
      'Triples zijn essentieel voor hoge score',
      'Bull is 50 (telt als dubbele sluiten)',
      'Plan je route door het bord',
      'Oefen regelmatig voor verbetering'
    ],
    difficulty: 'Gemiddeld',
    duration: '15-20 minuten',
    startingScore: 0
  },
  {
    id: 'halve_it',
    name: 'Halve It',
    icon: <Crosshair className="h-6 w-6" />,
    description: 'Gooi 3 pijlen op het target nummer.',
    fullDescription: 'Een spannende oefening die accuracy beloont. Gooi 3 pijlen op het target nummer en alleen de hoogste score telt. Raak je niets? Dan wordt je score gehalveerd! Raak je een dubbele? Dan verdubbel je score!',
    rules: [
      'Target nummers: 20, 16, 7, 14, 10, 8 (in die volgorde)',
      'Gooi 3 pijlen, alleen hoogste telt',
      'Raak je niets? Score wordt gehalveerd',
      'Raak een dubbele? Score wordt verdubbeld',
      'Begin met 100 punten',
      'Doel: eindig met zo hoog mogelijke score'
    ],
    tips: [
      'Accuracy is belangrijker dan score',
      'Focus op het raken van het nummer',
      'Beter een lage score dan halveren',
      'Triples en doubles zijn risicovol maar belonend',
      'Wees consistent en voorzichtig'
    ],
    difficulty: 'Gemiddeld',
    duration: '10-15 minuten',
    startingScore: 0
  },
  {
    id: 'bobs_27',
    name: 'Bob\'s 27',
    icon: <Zap className="h-6 w-6" />,
    description: 'Begin met 27 punten. Raak een dubbele? -1.',
    fullDescription: 'Een unieke dubbele oefening. Begin met 27 punten. Elke ronde kies je 3 verschillende doubles. Raak een dubbele? -1 punt. Mist? +1 punt. Wie als eerste op 0 is, wint!',
    rules: [
      'Begin met 27 punten',
      'Kies 3 verschillende doubles per ronde',
      'Raak een dubbele = -1 punt',
      'Mis = +1 punt',
      'Doel: zo snel mogelijk op 0',
      'Kies makkelijke doubles (D16, D8, D18, D20)'
    ],
    tips: [
      'Kies makkelijke doubles (D16, D8)',
      'Consistentie is belangrijker dan snelheid',
      'Probeer triples te vermijden',
      'Verlies je geduld niet',
      'Oefen alle doubles regelmatig'
    ],
    difficulty: 'Gemiddeld',
    duration: '10-15 minuten',
    startingScore: 27
  }
]

export default function DartsApp() {
  const [selectedPlayer, setSelectedPlayer] = useState<string>('')
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [newPlayerName, setNewPlayerName] = useState('')
  const [newPlayerInitials, setNewPlayerInitials] = useState('')
  const [players, setPlayers] = useState<Player[]>([])
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardEntry[]>([])
  const [weekLeaderboard, setWeekLeaderboard] = useState<LeaderboardEntry[]>([])
  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([])
  const [scoreInput, setScoreInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('home')
  const [socketRef, setSocketRef] = useState<Socket | null>(null)

  // Score tracker state
  const [gameType, setGameType] = useState<'101' | '301' | '501'>(brandConfig.game.defaultScoreType as any)
  const [currentScore, setCurrentScore] = useState(parseInt(brandConfig.game.defaultScoreType))
  const [dartsThrown, setDartsThrown] = useState(0)
  const [scoresHistory, setScoresHistory] = useState<Array<{gameType: string, startingScore: number, finalScore: number, darts: number, date: string}>>([])
  const [throwHistory, setThrowHistory] = useState<Array<{throwNum: number, score: number, remainingScore: number, darts: number}>>([])
  const [manualScoreInput, setManualScoreInput] = useState('')
  const [currentThrowScores, setCurrentThrowScores] = useState<number[]>([])

  // Match/Scoreboard state
  const [matches, setMatches] = useState<any[]>([])

  // Detail view state
  const [selectedChallenge, setSelectedChallengeDetail] = useState<typeof CHALLENGE_TYPES[0] | null>(null)
  const [selectedTrainingGame, setSelectedTrainingGame] = useState<typeof TRAINING_GAMES[0] | null>(null)

  const fetchData = async () => {
    try {
      const playersRes = await fetch('/api/players')
      if (playersRes.ok) {
        const playersData = await playersRes.json()
        setPlayers(playersData)
      }

      const challengeRes = await fetch('/api/challenges/current')
      if (challengeRes.ok) {
        const challengeData = await challengeRes.json()
        setCurrentChallenge(challengeData)
      }

      const [todayRes, weekRes, overallRes] = await Promise.all([
        fetch('/api/leaderboard?period=today'),
        fetch('/api/leaderboard?period=week'),
        fetch('/api/leaderboard?period=overall')
      ])

      if (todayRes.ok) setTodayLeaderboard(await todayRes.json())
      if (weekRes.ok) setWeekLeaderboard(await weekRes.json())
      if (overallRes.ok) setOverallLeaderboard(await overallRes.json())
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const connectWebSocket = () => {
    try {
      const socket = io('/?XTransformPort=3003', {
        transports: ['websocket', 'polling']
      })

      socket.on('connect', () => {
        setIsConnected(true)
        setSocketRef(socket)
      })

      socket.on('disconnect', () => {
        setIsConnected(false)
      })

      socket.on('leaderboard-update', () => {
        fetchData()
      })

      return socket
    } catch (error) {
      console.error('WebSocket connection error:', error)
      return null
    }
  }

  // Fetch data on mount
  useEffect(() => {
    fetchData()
    connectWebSocket()
  }, [])

  // Check if current player has submitted today
  useEffect(() => {
    if (selectedPlayer && currentChallenge) {
      fetch(`/api/scores/check?playerId=${selectedPlayer}&challengeId=${currentChallenge.id}`)
        .then(res => res.json())
        .then(data => {
          setHasSubmittedToday(data.hasSubmitted)
        })
    }
  }, [selectedPlayer, currentChallenge])

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPlayerName.trim()) return

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPlayerName,
          initials: newPlayerInitials || newPlayerName.substring(0, 2).toUpperCase()
        })
      })

      if (res.ok) {
        const player = await res.json()
        setPlayers([...players, player])
        setSelectedPlayer(player.id)
        setNewPlayerName('')
        setNewPlayerInitials('')
        setShowAddPlayer(false)
      }
    } catch (error) {
      console.error('Error adding player:', error)
    }
  }

  const handleSubmitScore = async () => {
    if (!selectedPlayer || !currentChallenge || !scoreInput.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer,
          challengeId: currentChallenge.id,
          score: parseInt(scoreInput),
          details: { date: new Date().toISOString() }
        })
      })

      if (res.ok) {
        setHasSubmittedToday(true)
        setScoreInput('')
        fetchData()
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetGame = () => {
    const startScores = { '101': 101, '301': 301, '501': 501 }
    setCurrentScore(startScores[brandConfig.game.defaultScoreType])
    setDartsThrown(0)
    setThrowHistory([])
    setCurrentThrowScores([])
    setManualScoreInput('')
  }

  // Add a score to the current throw (individual dart)
  const addDartScore = (score: number) => {
    if (currentScore === 0) return
    
    const newScore = currentScore - score
    
    // Check for bust (going below 0 or to 1)
    if (newScore < 0 || newScore === 1) {
      alert('BUST! Score blijft: ' + currentScore)
      // Reset current throw
      setCurrentThrowScores([])
      return
    }
    
    // Add score to current throw
    setCurrentThrowScores([...currentThrowScores, score])
    setCurrentScore(newScore)
    setDartsThrown(dartsThrown + 1)
    
    // Check for checkout (score = 0)
    if (newScore === 0) {
      // End turn on checkout
      finishTurn()
    }
  }

  // Finish the current turn and add to history
  const finishTurn = () => {
    if (currentThrowScores.length === 0) return
    
    const turnScore = currentThrowScores.reduce((sum, score) => sum + score, 0)
    const throwNumber = throwHistory.length + 1
    
    setThrowHistory([...throwHistory, {
      throwNum: throwNumber,
      score: turnScore,
      remainingScore: currentScore,
      darts: currentThrowScores.length
    }])
    
    setCurrentThrowScores([])
    setManualScoreInput('')
  }

  // Undo the last dart
  const undoLastDart = () => {
    if (currentThrowScores.length > 0) {
      // Undo within current turn
      const lastScore = currentThrowScores[currentThrowScores.length - 1]
      setCurrentScore(currentScore + lastScore)
      setCurrentThrowScores(currentThrowScores.slice(0, -1))
      setDartsThrown(Math.max(0, dartsThrown - 1))
    } else if (throwHistory.length > 0) {
      // Undo entire last turn
      const lastTurn = throwHistory[throwHistory.length - 1]
      setCurrentScore(lastTurn.remainingScore + lastTurn.score)
      setDartsThrown(Math.max(0, dartsThrown - lastTurn.darts))
      setThrowHistory(throwHistory.slice(0, -1))
    }
  }

  const saveGameScore = () => {
    const gameRecord = {
      gameType,
      startingScore: { '101': 101, '301': 301, '501': 501 }[gameType],
      finalScore: currentScore,
      darts: dartsThrown,
      date: new Date().toISOString()
    }
    setScoresHistory([...scoresHistory, gameRecord])
    // TODO: Save to API
    alert(`Game opgeslagen! Score: ${currentScore} in ${dartsThrown} darts`)
    resetGame()
  }

  const LeaderboardTable = ({ entries, title, icon: Icon }: { entries: LeaderboardEntry[], title: string, icon: any }) => {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#2d3748]" />
          <h3 className="font-semibold text-sm text-[#2d3748] uppercase tracking-wide">{title}</h3>
        </div>
        {entries.length === 0 ? (
          <p className="text-center py-8 text-[#4a5568] text-sm">Nog geen scores</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.rank}
              className={`group relative overflow-hidden rounded-lg border transition-all duration-200 ${
                entry.isCurrentUser 
                  ? 'bg-[#2d3748]/5 border-[#2d3748]' 
                  : 'bg-white border-gray-200 hover:border-[#4a5568] hover:shadow-md'
              }`}
            >
              <div className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                    entry.rank <= 3 
                      ? 'bg-[#2d3748] text-white' 
                      : 'bg-gray-100 text-[#4a5568]'
                  }`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                  <div>
                    <div className="font-semibold text-[#2d3748]">{entry.playerName}</div>
                    <div className="text-xs text-[#4a5568] font-mono">{entry.initials}</div>
                  </div>
                </div>
                <Badge 
                  variant={entry.isCurrentUser ? 'default' : 'secondary'} 
                  className={`text-base font-semibold px-3 py-1 ${
                    entry.isCurrentUser 
                      ? 'bg-[#2d3748] hover:bg-[#4a5568]' 
                      : 'bg-gray-100 text-[#4a5568]'
                  }`}
                >
                  {entry.score}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Makkelijk': return 'bg-green-100 text-green-800 border-green-200'
      case 'Gemiddeld': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Moeilijk': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Zeer Moeilijk': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-[#2d3748]" />
              <h2 className="text-xl font-bold text-[#2d3748]">Dagelijkse Challenge</h2>
            </div>

            {currentChallenge && (
              <Card className="bg-white border border-gray-200 shadow-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#2d3748] flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        {currentChallenge.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {currentChallenge.description}
                      </CardDescription>
                    </div>
                    <Badge className="bg-[#4a5568] text-white">
                      Vandaag
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {hasSubmittedToday ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <p className="text-green-800 font-medium">Je hebt al een score ingediend vandaag!</p>
                      <p className="text-green-600 text-sm mt-1">Probeer morgen weer</p>
                    </div>
                  ) : !selectedPlayer ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                      <User className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                      <p className="text-yellow-800 font-medium">Selecteer eerst een speler</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="score">Je Score</Label>
                        <Input
                          id="score"
                          type="number"
                          value={scoreInput}
                          onChange={(e) => setScoreInput(e.target.value)}
                          placeholder="Voer je score in"
                          className="text-2xl h-14 text-center"
                        />
                      </div>
                      <Button 
                        onClick={handleSubmitScore}
                        disabled={!scoreInput || isSubmitting}
                        className="w-full bg-[#4a5568] hover:bg-[#2d3748] text-white"
                      >
                        {isSubmitting ? 'Indienen...' : 'Score Indienen'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'challenges':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-[#2d3748]" />
              <h2 className="text-xl font-bold text-[#2d3748]">Challenge Uitleg</h2>
            </div>
            <p className="text-[#4a5568]">Klik op een challenge voor uitgebreide uitleg, regels en tips!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {CHALLENGE_TYPES.map((challenge) => (
                <Card 
                  key={challenge.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedChallengeDetail(challenge)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f7fafc] rounded-lg">
                          {challenge.icon}
                        </div>
                        <div>
                          <CardTitle className="text-[#2d3748] text-base">{challenge.name}</CardTitle>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {challenge.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedChallenge && (
              <Card className="bg-white border border-gray-200 shadow-lg mt-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2d3748] flex items-center gap-2">
                      {selectedChallenge.icon}
                      {selectedChallenge.name}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setSelectedChallengeDetail(null)}>
                      <Minus className="h-4 w-4 mr-2" />
                      Sluiten
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#2d3748] mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Volledige Uitleg
                    </h4>
                    <p className="text-sm text-[#4a5568] leading-relaxed">
                      {selectedChallenge.fullDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-[#2d3748] mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Regels
                    </h4>
                    <ul className="space-y-2 text-sm text-[#4a5568]">
                      {selectedChallenge.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-[#2d3748] mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Tips & Strategie
                    </h4>
                    <ul className="space-y-2 text-sm text-[#4a5568]">
                      {selectedChallenge.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#f7fafc] p-4 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-sm text-[#2d3748] mb-2 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Duur
                    </h4>
                    <p className="text-sm text-[#4a5568]">{selectedChallenge.duration}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'training':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Gamepad2 className="h-5 w-5 text-[#2d3748]" />
              <h2 className="text-xl font-bold text-[#2d3748]">Training Games</h2>
            </div>
            <p className="text-[#4a5568]">Klik op een training game voor uitgebreide uitleg en tips!</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TRAINING_GAMES.map((game) => (
                <Card 
                  key={game.id}
                  className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedTrainingGame(game)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#f7fafc] rounded-lg">
                          {game.icon}
                        </div>
                        <div>
                          <CardTitle className="text-[#2d3748] text-base">{game.name}</CardTitle>
                        </div>
                      </div>
                      <Badge className={`text-xs ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>
                      {game.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedTrainingGame && (
              <Card className="bg-white border border-gray-200 shadow-lg mt-4">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#2d3748] flex items-center gap-2">
                      {selectedTrainingGame.icon}
                      {selectedTrainingGame.name}
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setSelectedTrainingGame(null)}>
                      <Minus className="h-4 w-4 mr-2" />
                      Sluiten
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-[#2d3748] mb-2 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Volledige Omschrijving
                    </h4>
                    <p className="text-sm text-[#4a5568] leading-relaxed">
                      {selectedTrainingGame.fullDescription}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-[#2d3748] mb-2 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Regels
                    </h4>
                    <ul className="space-y-1 text-sm text-[#4a5568]">
                      {selectedTrainingGame.rules.map((rule, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-sm text-[#2d3748] mb-2 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Tips
                    </h4>
                    <ul className="space-y-1 text-sm text-[#4a5568]">
                      {selectedTrainingGame.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Zap className="h-4 w-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {game.startingScore > 0 && (
                    <div className="bg-[#2d3748]/5 p-3 rounded-lg border border-[#2d3748]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[#4a5568] text-sm font-medium">Startscore:</span>
                        <span className="text-xl font-bold text-[#2d3748]">{game.startingScore}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'scoreboard':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Swords className="h-5 w-5 text-[#2d3748]" />
              <h2 className="text-xl font-bold text-[#2d3748]">Wedstrijdjes Scoreboard</h2>
            </div>
            <p className="text-[#4a5568]">Houd bij wie het beste resultaat van vandaag!</p>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle>Nieuwe Wedstrijd</CardTitle>
                <CardDescription>
                  Registreer een nieuwe wedstrijd tussen twee spelers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Speler 1</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecteer speler 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.initials})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Speler 2</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecteer speler 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {players.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.initials})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Score Speler 1</Label>
                    <Input type="number" placeholder="Score" />
                  </div>
                  <div>
                    <Label>Score Speler 2</Label>
                    <Input type="number" placeholder="Score" />
                  </div>
                </div>

                <div>
                  <Label>Spel Type</Label>
                  <Select>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecteer spel type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="301">301</SelectItem>
                      <SelectItem value="501">501</SelectItem>
                      <SelectItem value="cricket">Cricket</SelectItem>
                      <SelectItem value="practice">Oefenwedstrijd</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button className="w-full bg-[#4a5568] hover:bg-[#2d3748] text-white">
                  <Swords className="h-4 w-4 mr-2" />
                  Wedstrijd Opslaan
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  Laatste Wedstrijden
                </CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-[#4a5568]">
                    <Swords className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg">Nog geen wedstrijden gespeeld</p>
                    <p className="text-sm mt-2">Start de eerste wedstrijd!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.slice(0, 10).map((match: any, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-[#f7fafc] rounded-lg border border-gray-200">
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-500 text-white">#{index + 1}</Badge>
                          <div>
                            <div className="font-semibold text-[#2d3748]">{match.player1Name} vs {match.player2Name}</div>
                            <div className="text-xs text-[#4a5568]">{match.gameType}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-[#4a5568]">{match.player1Score} - {match.player2Score}</div>
                          <div className="font-bold text-[#2d3748]">{match.winnerName}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#2d3748]" />
                  Statistieken Onderlinge Wedstrijden
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="bg-[#f7fafc] p-4 rounded-lg">
                    <h4 className="font-semibold text-[#2d3748] mb-3">Top Winnaars</h4>
                    <div className="space-y-2">
                      {players.slice(0, 5).map((player, idx) => (
                        <div key={player.id} className="flex items-center justify-between">
                          <span className="text-sm text-[#4a5568]">{player.name}</span>
                          <Badge className="bg-[#2d3748] text-white">{Math.floor(Math.random() * 20) + 5} winst</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#f7fafc] p-4 rounded-lg">
                    <h4 className="font-semibold text-[#2d3748] mb-3">Hoogste Averages</h4>
                    <div className="space-y-2">
                      {players.slice(0, 5).map((player, idx) => (
                        <div key={player.id} className="flex items-center justify-between">
                          <span className="text-sm text-[#4a5568]">{player.name}</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {(Math.random() * 20 + 60).toFixed(1)} avg
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case 'score-tracker':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Calculator className="h-5 w-5 text-[#2d3748]" />
              <h2 className="text-xl font-bold text-[#2d3748]">Score Teller (101 / 301 / 501)</h2>
            </div>
            <p className="text-[#4a5568] mb-6">Voer je scores in en track je worpen!</p>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gamepad2 className="h-5 w-5 text-[#2d3748]" />
                  Game Instellingen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Spel Type</Label>
                  <Select value={gameType} onValueChange={(v) => { setGameType(v as any); resetGame(); }}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="101">101 (Beginner)</SelectItem>
                      <SelectItem value="301">301 (Standaard)</SelectItem>
                      <SelectItem value="501">501 (Professional)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-[#2d3748]/5 p-6 rounded-lg border border-[#2d3748]">
                  <div className="text-center">
                    <div className="text-sm text-[#4a5568] mb-2">Huidige Score</div>
                    <div className="text-6xl font-bold text-[#2d3748]">{currentScore}</div>
                    <div className="text-xs text-[#4a5568] mt-2">Start: {{ '101': 101, '301': 301, '501': 501 }[gameType]}</div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-sm text-[#4a5568]">Pijlen Gegooid</Label>
                    <div className="text-3xl font-bold text-[#2d3748]">{dartsThrown}</div>
                  </div>
                  <div>
                    <Label className="text-sm text-[#4a5568]">Gemiddel/Worp</Label>
                    <div className="text-xl font-semibold text-[#2d3748]">
                      {throwHistory.length > 0 
                        ? Math.round(throwHistory.reduce((sum, t) => sum + t.score, 0) / throwHistory.length)
                        : 0}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm text-[#4a5568]">Status</Label>
                    <div className={`text-sm font-medium ${currentScore === 0 ? 'text-green-600' : 'text-[#2d3748]'}`}>
                      {currentScore === 0 ? 'Uitgechecked! 🎯' : 'In spel'}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={resetGame}
                    variant="outline"
                    className="flex-1"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button 
                    onClick={undoLastDart}
                    variant="outline"
                    className="flex-1"
                    disabled={dartsThrown === 0}
                  >
                    <Undo2 className="h-4 w-4 mr-2" />
                    Ongedaan Maken
                  </Button>
                  <Button 
                    onClick={saveGameScore}
                    className="flex-1 bg-[#4a5568] hover:bg-[#2d3748] text-white"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Opslaan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Suggesties - Automatisch weergegeven bij scores onder 170 */}
            {currentScore > 0 && currentScore <= 170 && (
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2d3748]">
                    <Zap className="h-5 w-5 text-yellow-600" />
                    Checkout Suggestie: {currentScore}
                  </CardTitle>
                  <CardDescription>
                    Beste checkout route om uit te checken
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    {CHECKOUT_SUGGESTIONS[currentScore as keyof typeof CHECKOUT_SUGGESTIONS]?.map((suggestion, idx) => (
                      <div 
                        key={idx}
                        className="p-3 bg-white rounded-lg border border-yellow-200 hover:border-[#2d3748] transition-colors"
                      >
                        <div className="font-mono text-lg font-bold text-[#2d3748]">{suggestion}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white/70 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-yellow-800">
                      <strong>💡 Tip:</strong> Oefen deze routes! De "Big Checkouts" (170, 167, 164, 161, 160) komen het vaakst voor.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crosshair className="h-5 w-5 text-[#2d3748]" />
                  Score Invoer
                </CardTitle>
                <CardDescription>
                  Voer de score in voor elke pijl (max 3 per beurt)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="manualScore">Handmatige Score Invoer</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="manualScore"
                      type="number"
                      value={manualScoreInput}
                      onChange={(e) => setManualScoreInput(e.target.value)}
                      placeholder="Voer score in (0-60)"
                      min={0}
                      max={60}
                      className="flex-1"
                    />
                    <Button 
                      onClick={() => {
                        const score = parseInt(manualScoreInput)
                        if (score >= 0 && score <= 60) {
                          addDartScore(score)
                          setManualScoreInput('')
                        }
                      }}
                      disabled={!manualScoreInput || currentThrowScores.length >= 3 || currentScore === 0}
                      className="bg-[#4a5568] hover:bg-[#2d3748] text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Voeg Toe
                    </Button>
                  </div>
                </div>

                {currentThrowScores.length > 0 && (
                  <div className="bg-[#f7fafc] p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-[#2d3748]">Huidige Worp ({currentThrowScores.length}/3)</span>
                      <Button 
                        onClick={finishTurn}
                        size="sm"
                        variant="outline"
                        disabled={currentThrowScores.length === 0}
                      >
                        Beëindig Beurt
                      </Button>
                    </div>
                    <div className="flex gap-3">
                      {[0, 1, 2].map((i) => (
                        <div 
                          key={i}
                          className={`w-16 h-16 rounded-lg flex items-center justify-center font-bold text-lg
                            ${currentThrowScores[i] !== undefined 
                              ? 'bg-[#2d3748] text-white' 
                              : 'bg-gray-100 text-gray-400'}`}
                        >
                          {currentThrowScores[i] !== undefined ? currentThrowScores[i] : '-'}
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 text-sm text-[#4a5568]">
                      Totaal deze beurt: <span className="font-bold text-[#2d3748]">{currentThrowScores.reduce((a, b) => a + b, 0)}</span>
                    </div>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">Snelle Scores</Label>
                  <div className="grid grid-cols-7 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                      <Button
                        key={num}
                        variant="outline"
                        size="sm"
                        onClick={() => addDartScore(num)}
                        disabled={currentThrowScores.length >= 3 || currentScore === 0}
                        className={`text-sm ${num === 0 ? 'bg-red-50 border-red-200 text-red-700' : ''}`}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block text-sm">Doubles (D1-D20)</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                        <Button
                          key={`D${num}`}
                          variant="outline"
                          size="sm"
                          onClick={() => addDartScore(num * 2)}
                          disabled={currentThrowScores.length >= 3 || currentScore === 0}
                          className="text-xs font-mono"
                        >
                          D{num}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block text-sm">Triples (T1-T20)</Label>
                    <div className="grid grid-cols-5 gap-1">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((num) => (
                        <Button
                          key={`T${num}`}
                          variant="outline"
                          size="sm"
                          onClick={() => addDartScore(num * 3)}
                          disabled={currentThrowScores.length >= 3 || currentScore === 0}
                          className="text-xs font-mono"
                        >
                          T{num}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="mb-2 block">Bullseye</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => addDartScore(25)}
                      disabled={currentThrowScores.length >= 3 || currentScore === 0}
                      className="flex-1"
                    >
                      Outer Bull (25)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => addDartScore(50)}
                      disabled={currentThrowScores.length >= 3 || currentScore === 0}
                      className="flex-1 font-bold bg-[#2d3748] text-white"
                    >
                      Bullseye (50)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5 text-[#2d3748]" />
                  Worp Geschiedenis
                </CardTitle>
                <CardDescription>
                  Overzicht van alle worpen
                </CardDescription>
              </CardHeader>
              <CardContent>
                {throwHistory.length === 0 ? (
                  <p className="text-center py-8 text-[#4a5568]">Nog geen worpen geregistreerd</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 px-3 text-sm font-semibold text-[#2d3748]">Worp</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-[#2d3748]">Pijlen</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-[#2d3748]">Score</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold text-[#2d3748]">Rest</th>
                        </tr>
                      </thead>
                      <tbody>
                        {throwHistory.map((throw_) => (
                          <tr key={throw_.throwNum} className="border-b border-gray-100 hover:bg-[#f7fafc]">
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="font-mono">
                                #{throw_.throwNum}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-sm text-[#4a5568]">{throw_.darts}</td>
                            <td className="py-2 px-3">
                              <span className="font-bold text-[#2d3748]">{throw_.score}</span>
                            </td>
                            <td className="py-2 px-3">
                              <span className={`font-mono font-bold ${throw_.remainingScore <= 100 ? 'text-green-600' : 'text-[#2d3748]'}`}>
                                {throw_.remainingScore}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#2d3748]" />
                  Spel Geschiedenis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scoresHistory.length === 0 ? (
                  <p className="text-center py-8 text-[#4a5568]">Nog geen gespeelde games</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {scoresHistory.slice(-10).reverse().map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-[#f7fafc] rounded">
                        <div className="text-sm">
                          <span className="font-medium">{game.gameType}</span>
                          <span className="text-[#4a5568] ml-2">{new Date(game.date).toLocaleDateString('nl-NL')}</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-[#4a5568]">{game.darts} darts</span>
                          <Badge variant={game.finalScore === 0 ? 'bg-green-500' : 'bg-blue-500'} className="text-white">
                            {game.finalScore}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      <header className="bg-[#f7fafc] border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={brandConfig.logo.path} 
                alt={brandConfig.logo.alt} 
                className="h-14 w-auto"
              />
              {brandConfig.logo.showText && (
                <div className="hidden sm:block">
                  <p className="text-xs text-[#4a5568] flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {brandConfig.app.description}
                    {isConnected && <span className="text-green-600 ml-2">● Live</span>}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              {players.length > 0 && (
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger className="w-48 sm:w-56 bg-white border-gray-300 text-[#2d3748]">
                    <User className="h-4 w-4 mr-2 text-[#4a5568]" />
                    <SelectValue placeholder="Selecteer speler" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id} className="text-[#2d3748]">
                        {player.initials} • {player.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                variant="default"
                size="sm"
                onClick={() => setShowAddPlayer(!showAddPlayer)}
                className="bg-[#4a5568] hover:bg-[#2d3748] text-white rounded-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Speler
              </Button>
            </div>
          </div>
        </div>
      </header>

      {showAddPlayer && (
        <div className="container mx-auto px-4 py-6">
          <Card className="bg-white border-2 border-[#4a5568]/30 shadow-lg">
            <CardHeader>
              <CardTitle className="text-[#2d3748] flex items-center gap-2">
                <User className="h-5 w-5 text-[#4a5568]" />
                Nieuwe speler toevoegen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddPlayer} className="flex gap-4 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="name" className="text-[#4a5568]">Naam</Label>
                  <Input
                    id="name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    placeholder="Bijv. Jan de Vries"
                    required
                    className="bg-white border-gray-300 text-[#2d3748] placeholder:text-gray-400 mt-1.5"
                  />
                </div>
                <div className="w-28">
                  <Label htmlFor="initials" className="text-[#4a5568]">Initialen</Label>
                  <Input
                    id="initials"
                    value={newPlayerInitials}
                    onChange={(e) => setNewPlayerInitials(e.target.value)}
                    placeholder="JD"
                    maxLength={3}
                    className="bg-white border-gray-300 text-[#2a5568] placeholder:text-gray-400 text-center mt-1.5"
                  />
                </div>
                <Button type="submit" className="bg-[#4a5568] hover:bg-[#2d3748] text-white rounded-lg">
                  Toevoegen
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddPlayer(false)} className="border-gray-300 text-[#4a5568] hover:bg-gray-50">
                  Annuleren
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-[#f7fafc] border border-gray-200 rounded-lg p-1">
                <TabsTrigger 
                  value="home" 
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-sm"
                  onClick={() => setActiveTab('home')}
                >
                  <Target className="h-4 w-4" />
                  <span className="hidden sm:inline">Home</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="challenges"
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-sm"
                  onClick={() => setActiveTab('challenges')}
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Uitleg</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="training"
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-sm"
                  onClick={() => setActiveTab('training')}
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Training</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="scoreboard"
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-sm"
                  onClick={() => setActiveTab('scoreboard')}
                >
                  <Swords className="h-4 w-4" />
                  <span className="hidden sm:inline">Wedstrijd</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="score-tracker"
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-sm"
                  onClick={() => setActiveTab('score-tracker')}
                >
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Score</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="home" className="mt-4">
                {renderContent()}
              </TabsContent>

              <TabsContent value="challenges">
                {renderContent()}
              </TabsContent>

              <TabsContent value="training">
                {renderContent()}
              </TabsContent>

              <TabsContent value="scoreboard">
                {renderContent()}
              </TabsContent>

              <TabsContent value="score-tracker">
                {renderContent()}
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Leaderboards */}
          <div className="space-y-6">
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#2d3748] flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-[#2d3748]" />
                  Leaderboards
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="today" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[#f7fafc] border border-gray-200 rounded-lg">
                    <TabsTrigger value="today" className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-xs">Vandaag</TabsTrigger>
                    <TabsTrigger value="week" className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-xs">Week</TabsTrigger>
                    <TabsTrigger value="overall" className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-xs">Totaal</TabsTrigger>
                  </TabsList>
                  <TabsContent value="today" className="mt-4">
                    <LeaderboardTable entries={todayLeaderboard} title="Vandaag" icon={Flame} />
                  </TabsContent>
                  <TabsContent value="week" className="mt-4">
                    <LeaderboardTable entries={weekLeaderboard} title="Deze Week" icon={Calendar} />
                  </TabsContent>
                  <TabsContent value="overall" className="mt-4">
                    <LeaderboardTable entries={overallLeaderboard} title="Algemeen" icon={Award} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#2d3748] text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#2d3748]" />
                  Statistieken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Actieve Spelers</span>
                  <Badge variant="secondary" className="bg-[#2d3748]/10 text-[#2d3748] border-[#2a5568]/20 text-base px-3 py-1">
                    {players.length}
                  </Badge>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Scores Vandaag</span>
                  <Badge variant="secondary" className="bg-[#2d3748]/10 text-[#2d3748] border-[#4a5568]/20 text-base px-3 py-1">
                    {todayLeaderboard.length}
                  </Badge>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Beste Score Vandaag</span>
                  <Badge className="bg-[#2d3748] text-white text-base px-3 py-1">
                    {todayLeaderboard[0]?.score || '-'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <footer className="mt-auto bg-[#2d3748] border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white text-sm font-medium">
            © {brandConfig.app.year} <span className="font-semibold">{brandConfig.logo.companyName}</span> • {brandConfig.app.name}
          </p>
          <p className="text-white/60 text-xs mt-2 flex items-center justify-center gap-2">
            <Anchor className="h-3 w-3" />
            {brandConfig.app.footerTagline}
          </p>
        </div>
      </footer>
    </div>
  )
}
