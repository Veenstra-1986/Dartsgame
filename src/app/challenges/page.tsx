'use client';

import { useState } from 'react';
import { Target, Calendar, Trophy, Zap, Clock, Users, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileNav } from '@/components/mobile-nav';
import Link from 'next/link';

const gameTypes = [
  { id: '501', name: '501', description: 'Klassiek countdown spel. Eerste die op 0 uitcheckt wint.' },
  { id: '301', name: '301', description: 'Sneller spel, uitchecken van 301.' },
  { id: 'cricket', name: 'Cricket', description: 'Sluit nummers 20-15 en bull af.' },
  { id: 'around-clock', name: 'Around the Clock', description: 'Raak elke sector in volgorde van 1-20.' },
  { id: 'high-score', name: 'High Score', description: 'Zo hoog mogelijk scoren in 10 worpen.' },
  { id: 'killers', name: 'Killers', description: 'Elimineer tegenstanders door hun nummer te raken.' }
];

const dailyChallenges = [
  {
    id: 1,
    name: 'Maandag Mayhem',
    gameType: '501',
    description: 'Start de week goed! Speel een 501 en probeer uit te checken in minder dan 18 darts.',
    rules: 'Double-out modus. Houd je darts bij. Bonuspunten voor sub-18 finishes.',
    targetScore: 501,
    scheduledFor: 'Maandag',
    expiresAt: 'Dinsdag 09:00',
    difficulty: 'intermediate',
    participants: 12
  },
  {
    id: 2,
    name: 'Dinsdag Trebles',
    gameType: 'treble-hunt',
    description: 'Alleen trebles tellen! Raak zo veel mogelijk trebles in 10 rondes.',
    rules: 'T1-T20 in volgorde. 3 darts per nummer. Dubbele punten voor T20.',
    targetScore: 0,
    scheduledFor: 'Dinsdag',
    expiresAt: 'Woensdag 09:00',
    difficulty: 'advanced',
    participants: 8
  },
  {
    id: 3,
    name: 'Woensdag Warm-up',
    gameType: 'around-clock',
    description: 'Goed voor je precisie! Raak alle nummers 1-20 in volgorde.',
    rules: 'Singles tellen. Snelste tijd wint. Max 3 darts per nummer.',
    targetScore: 0,
    scheduledFor: 'Woensdag',
    expiresAt: 'Donderdag 09:00',
    difficulty: 'beginner',
    participants: 15
  },
  {
    id: 4,
    name: 'Donderdag Doubles',
    gameType: 'double-trouble',
    description: 'Focussen op doubles! Alleen doubles en bull tellen.',
    rules: '10 rondes, 3 darts. Hoogste totale score wint.',
    targetScore: 0,
    scheduledFor: 'Donderdag',
    expiresAt: 'Vrijdag 09:00',
    difficulty: 'intermediate',
    participants: 10
  },
  {
    id: 5,
    name: 'Vrijdag Frenzy',
    gameType: 'cricket',
    description: 'Sluit het weekend af met een intense Cricket battle!',
    rules: 'Standaard cricket regels. Speed cricket: 30 seconden per beurt.',
    targetScore: 0,
    scheduledFor: 'Vrijdag',
    expiresAt: 'Zaterdag 09:00',
    difficulty: 'intermediate',
    participants: 20
  },
  {
    id: 6,
    name: 'Weekend Warrior',
    gameType: 'high-score',
    description: 'Alles of niets! Maximaliseer je score in 10 worpen.',
    rules: '10 worpen, geen check-out. Hoogste totale score wint.',
    targetScore: 0,
    scheduledFor: 'Zaterdag',
    expiresAt: 'Maandag 09:00',
    difficulty: 'beginner',
    participants: 25
  }
];

const pastChallenges = [
  {
    id: 7,
    name: 'Lanceer Challenge',
    gameType: '501',
    description: 'De eerste challenge van DartsPro! Iedereen mocht meedoen.',
    winner: 'Jan de Vries',
    winningScore: '15 darts',
    participants: 18
  },
  {
    id: 8,
    name: 'Bullseye Bonanza',
    gameType: 'bull-master',
    description: 'Alleen bull en bullseye tellen.',
    winner: 'Maria Jansen',
    winningScore: '8 hits',
    participants: 14
  }
];

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700'
};

export default function ChallengesPage() {
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Target className="h-8 w-8 text-emerald-600" />
              <h1 className="text-2xl font-bold text-slate-900">DartsPro</h1>
            </Link>
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              <Zap className="h-4 w-4 mr-1" />
              Dagelijkse Challenges
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calendar className="h-4 w-4" />
              Elke dag nieuwe challenges!
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Dagelijkse Darts Challenges
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Neem het op tegen collega's in leuke dagelijkse challenges. Van beginner tot expert!
            </p>
          </div>

          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Huidige Challenge</TabsTrigger>
              <TabsTrigger value="schedule">Alle Challenges</TabsTrigger>
              <TabsTrigger value="past">Vorige Resultaten</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {/* Today's Challenge */}
              {(() => {
                const todayChallenge = dailyChallenges[0];
                return (
                  <Card className="border-4 border-amber-400 shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Trophy className="h-8 w-8 text-amber-600" />
                          </div>
                          <div>
                            <CardTitle className="text-2xl">{todayChallenge.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-4 w-4" />
                              {todayChallenge.scheduledFor}
                              <span className="text-slate-400">•</span>
                              <Clock className="h-4 w-4" />
                              Verloopt: {todayChallenge.expiresAt}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={difficultyColors[todayChallenge.difficulty as keyof typeof difficultyColors]}>
                          {todayChallenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-slate-700">{todayChallenge.description}</p>

                      <div className="p-4 bg-slate-50 rounded-lg">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Target className="h-4 w-4 text-emerald-600" />
                          Regels
                        </h4>
                        <p className="text-sm text-slate-600">{todayChallenge.rules}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="h-4 w-4" />
                          {todayChallenge.participants} deelnemers
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Target className="h-4 w-4" />
                          {todayChallenge.targetScore > 0 ? `Start: ${todayChallenge.targetScore}` : 'Geen startscore'}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-4 border-t">
                        <Button size="lg" className="bg-amber-600 hover:bg-amber-700 flex-1">
                          <Zap className="h-5 w-5 mr-2" />
                          Doe Mee
                        </Button>
                        <Button size="lg" variant="outline" asChild>
                          <Link href="/register">Registreer om mee te doen</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}
            </TabsContent>

            <TabsContent value="schedule" className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                {dailyChallenges.map((challenge) => (
                  <Card
                    key={challenge.id}
                    className="hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => setSelectedChallenge(challenge.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <Target className="h-6 w-6 text-emerald-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{challenge.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Calendar className="h-3 w-3" />
                              {challenge.scheduledFor}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 mb-3">{challenge.description}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">{challenge.gameType}</span>
                        <span className="text-slate-500 flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {challenge.participants}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {pastChallenges.map((challenge) => (
                  <Card key={challenge.id} className="opacity-80">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Trophy className="h-6 w-6 text-slate-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{challenge.name}</CardTitle>
                            <CardDescription>{challenge.description}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary">Voltooid</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Winnaar:</span>
                          <span className="font-semibold text-emerald-600">{challenge.winner}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Winnaar Score:</span>
                          <span className="font-semibold">{challenge.winningScore}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Deelnemers:</span>
                          <span className="font-semibold">{challenge.participants}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Game Types Reference */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-600" />
                Darts Spel Types
              </CardTitle>
              <CardDescription>Bekijk de regels van verschillende darts spellen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gameTypes.map((game) => (
                  <div key={game.id} className="p-4 border rounded-lg hover:border-emerald-300 transition-colors">
                    <h4 className="font-semibold text-emerald-700 mb-2">{game.name}</h4>
                    <p className="text-sm text-slate-600">{game.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
