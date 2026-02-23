'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Target, Calendar, Gamepad2, Swords, Calculator, BookOpen, Users, Flame, Award, ArrowRight, User, Lock, TrendingUp, Clock, Shield, Zap, CheckCircle, Minus } from 'lucide-react'
import brandConfig from '@/config/brand-config'
import Link from 'next/link'

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
  nickname?: string
  avatar?: string
  score: number
  isCurrentUser: boolean
}

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
    icon: <Target className="h-6 w-6" />,
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
    icon: <Swords className="h-6 w-6" />,
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
    icon: <Target className="h-6 w-6" />,
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
  }
]

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
        entries.slice(0, 5).map((entry) => (
          <div
            key={entry.rank}
            className="group relative overflow-hidden rounded-lg border bg-white border-gray-200 hover:border-[#4a5568] hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                {entry.avatar ? (
                  <img 
                    src={entry.avatar}
                    alt={entry.nickname || entry.playerName}
                    className="w-8 h-8 rounded-full object-cover border-2 border-white shadow-sm"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    entry.rank <= 3 
                      ? 'bg-[#2d3748] text-white' 
                      : 'bg-gray-100 text-[#4a5568]'
                  }`}>
                    {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-[#2d3748] text-sm">
                    {entry.nickname || entry.playerName}
                  </div>
                </div>
              </div>
              <span className="text-base font-semibold text-[#2d3748]">
                {entry.score}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

export default function DartsApp() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null)
  const [todayLeaderboard, setTodayLeaderboard] = useState<LeaderboardEntry[]>([])
  const [weekLeaderboard, setWeekLeaderboard] = useState<LeaderboardEntry[]>([])
  const [overallLeaderboard, setOverallLeaderboard] = useState<LeaderboardEntry[]>([])
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('')

  // Detail view state
  const [selectedChallenge, setSelectedChallengeDetail] = useState<typeof CHALLENGE_TYPES[0] | null>(null)
  const [selectedTrainingGame, setSelectedTrainingGame] = useState<typeof TRAINING_GAMES[0] | null>(null)

  // Load custom logo from database on mount
  useEffect(() => {
    const fetchCustomLogo = async () => {
      try {
        const res = await fetch('/api/settings/logo')
        if (res.ok) {
          const data = await res.json()
          if (data.logo) {
            setCustomLogoUrl(data.logo)
          }
        }
      } catch (error) {
        console.error('Error fetching custom logo:', error)
      }
    }
    fetchCustomLogo()
  }, [])

  const fetchData = async () => {
    try {
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

  useEffect(() => {
    fetchData()
  }, [])

  // Redirect to dashboard if logged in
  if (status === 'authenticated') {
    router.push('/dashboard')
    return null
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
                    <span className="bg-[#4a5568] text-white text-xs px-3 py-1 rounded-full">
                      Vandaag
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <Lock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="text-yellow-800 font-medium">Log in om je score in te dienen!</p>
                    <Link href="/login">
                      <Button className="mt-3 bg-[#4a5568] hover:bg-[#2d3748] text-white">
                        <User className="h-4 w-4 mr-2" />
                        Nu Inloggen
                      </Button>
                    </Link>
                  </div>
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
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
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
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(game.difficulty)}`}>
                        {game.difficulty}
                      </span>
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

                  {selectedTrainingGame.startingScore > 0 && (
                    <div className="bg-[#2d3748]/5 p-3 rounded-lg border border-[#2d3748]">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[#4a5568] text-sm font-medium">Startscore:</span>
                        <span className="text-xl font-bold text-[#2d3748]">{selectedTrainingGame.startingScore}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a5568] mx-auto"></div>
          <p className="mt-4 text-[#4a5568]">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col">
      {/* Header */}
      <header className="bg-[#f7fafc] border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <img 
                src={customLogoUrl || brandConfig.logo.path} 
                alt={brandConfig.logo.alt} 
                className="h-12 w-auto"
              />
              {brandConfig.logo.showText && (
                <div className="hidden sm:block">
                  <p className="text-xs text-[#4a5568] flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    {brandConfig.app.description}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#4a5568] text-[#4a5568] hover:bg-[#f7fafc]"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  Inloggen
                </Button>
              </Link>
              <Link href="/register">
                <Button
                  size="sm"
                  className="bg-[#4a5568] hover:bg-[#2d3748] text-white rounded-lg"
                >
                  <User className="h-4 w-4 mr-2" />
                  Registreren
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#2d3748] to-[#4a5568] text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welkom bij {brandConfig.logo.companyName} Dart Club
          </h1>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {brandConfig.app.description} - Volg je vooruitgang, daag je vrienden uit en verbeter je spel!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-white text-[#2d3748] hover:bg-gray-100">
                <User className="h-5 w-5 mr-2" />
                Start Nu
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Lock className="h-5 w-5 mr-2" />
                Inloggen
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Tabs defaultValue="home" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#f7fafc] border border-gray-200 rounded-lg p-0.5 overflow-x-auto">
                <TabsTrigger 
                  value="home" 
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-xs"
                  onClick={() => setActiveTab('home')}
                >
                  <Target className="h-3 w-3" />
                  <span>Home</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="challenges"
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-xs"
                  onClick={() => setActiveTab('challenges')}
                >
                  <BookOpen className="h-3 w-3" />
                  <span>Uitleg</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="training"
                  className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md text-xs"
                  onClick={() => setActiveTab('training')}
                >
                  <Gamepad2 className="h-3 w-3" />
                  <span>Training</span>
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
                  <TrendingUp className="h-4 w-4 text-[#2d3748]" />
                  Statistieken
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Actieve Spelers</span>
                  <span className="text-base font-semibold text-[#2d3748] px-3 py-1">
                    {todayLeaderboard.length > 0 ? '5+' : '-'}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Scores Vandaag</span>
                  <span className="text-base font-semibold text-[#2d3748] px-3 py-1">
                    {todayLeaderboard.length}
                  </span>
                </div>
                <div className="h-px bg-gray-200" />
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Beste Score Vandaag</span>
                  <span className="text-base font-bold text-[#2d3748] px-3 py-1">
                    {todayLeaderboard[0]?.score || '-'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto bg-[#2d3748] border-t border-gray-700 py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white text-sm font-medium">
            © {brandConfig.app.year} <span className="font-semibold">{brandConfig.logo.companyName}</span> • {brandConfig.app.name}
          </p>
          <p className="text-white/60 text-xs mt-2 flex items-center justify-center gap-2">
            {brandConfig.app.footerTagline}
          </p>
        </div>
      </footer>
    </div>
  )
}
