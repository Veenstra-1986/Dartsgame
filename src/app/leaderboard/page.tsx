'use client';

import { useState } from 'react';
import { Target, Trophy, TrendingUp, Calendar, Award, Users, Lock, Crown, Medal, Award as AwardIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileNav } from '@/components/mobile-nav';
import Link from 'next/link';

const mockWeekPlayers = [
  { id: 1, name: 'Jan de Vries', score: 2450, challenges: 5, wins: 3, bestScore: 180, avatar: 'JD' },
  { id: 2, name: 'Maria Jansen', score: 2380, challenges: 5, wins: 2, bestScore: 177, avatar: 'MJ' },
  { id: 3, name: 'Peter van den Berg', score: 2250, challenges: 5, wins: 2, bestScore: 174, avatar: 'PB' },
  { id: 4, name: 'Eva Bakker', score: 2100, challenges: 5, wins: 1, bestScore: 171, avatar: 'EB' },
  { id: 5, name: 'Mark Smit', score: 1980, challenges: 4, wins: 1, bestScore: 168, avatar: 'MS' },
  { id: 6, name: 'Lisa de Jong', score: 1850, challenges: 4, wins: 1, bestScore: 165, avatar: 'LJ' },
  { id: 7, name: 'Tom Visser', score: 1720, challenges: 4, wins: 0, bestScore: 162, avatar: 'TV' },
  { id: 8, name: 'Anna Dijkstra', score: 1650, challenges: 4, wins: 0, bestScore: 159, avatar: 'AD' },
];

const mockOverallPlayers = [
  { id: 1, name: 'Jan de Vries', score: 18500, challenges: 45, wins: 28, bestScore: 180, avatar: 'JD' },
  { id: 2, name: 'Maria Jansen', score: 17200, challenges: 43, wins: 22, bestScore: 177, avatar: 'MJ' },
  { id: 3, name: 'Peter van den Berg', score: 16800, challenges: 42, wins: 21, bestScore: 174, avatar: 'PB' },
  { id: 4, name: 'Eva Bakker', score: 15500, challenges: 40, wins: 18, bestScore: 171, avatar: 'EB' },
  { id: 5, name: 'Mark Smit', score: 14200, challenges: 38, wins: 15, bestScore: 168, avatar: 'MS' },
  { id: 6, name: 'Lisa de Jong', score: 13800, challenges: 37, wins: 14, bestScore: 165, avatar: 'LJ' },
  { id: 7, name: 'Tom Visser', score: 12500, challenges: 35, wins: 12, bestScore: 162, avatar: 'TV' },
  { id: 8, name: 'Anna Dijkstra', score: 11800, challenges: 33, wins: 11, bestScore: 159, avatar: 'AD' },
];

const top3Icons = [
  { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-100' },
  { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-100' },
  { icon: AwardIcon, color: 'text-amber-700', bg: 'bg-amber-50' }
];

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'week' | 'overall'>('week');
  const currentPlayers = timeframe === 'week' ? mockWeekPlayers : mockOverallPlayers;

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
              <Trophy className="h-4 w-4 mr-1" />
              Leaderboard
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Darts Leaderboard
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Bekijk wie de beste darter is in jouw groep. Competeer en klim omhoog!
            </p>
          </div>

          {/* Timeframe Tabs */}
          <Tabs value={timeframe} onValueChange={(v) => setTimeframe(v as 'week' | 'overall')} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="week">
                <Calendar className="h-4 w-4 mr-2" />
                Deze Week
              </TabsTrigger>
              <TabsTrigger value="overall">
                <TrendingUp className="h-4 w-4 mr-2" />
                Overall
              </TabsTrigger>
            </TabsList>

            <TabsContent value={timeframe} className="space-y-6">
              {/* Top 3 Podium */}
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {timeframe === 'week' ? (
                  <>
                    {/* 2nd Place */}
                    <Card className="order-2 md:order-1 border-2 border-slate-300">
                      <CardHeader className="text-center pb-3">
                        <div className={`h-16 w-16 ${top3Icons[1].bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <Medal className={`h-8 w-8 ${top3Icons[1].color}`} />
                        </div>
                        <CardTitle className="text-lg">{currentPlayers[1].name}</CardTitle>
                        <CardDescription>2e Plaats</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-3xl font-bold text-slate-900 mb-2">{currentPlayers[1].score}</div>
                        <div className="text-sm text-slate-600">punten</div>
                      </CardContent>
                    </Card>

                    {/* 1st Place */}
                    <Card className="order-1 md:order-2 border-4 border-amber-400 shadow-xl transform md:-translate-y-4">
                      <CardHeader className="text-center pb-3">
                        <div className={`h-20 w-20 ${top3Icons[0].bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <Crown className={`h-10 w-10 ${top3Icons[0].color}`} />
                        </div>
                        <CardTitle className="text-xl">{currentPlayers[0].name}</CardTitle>
                        <CardDescription>🏆 1e Plaats</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-4xl font-bold text-amber-600 mb-2">{currentPlayers[0].score}</div>
                        <div className="text-sm text-slate-600">punten</div>
                        <div className="mt-3 pt-3 border-t">
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {currentPlayers[0].wins} wins
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 3rd Place */}
                    <Card className="order-3 border-2 border-amber-200">
                      <CardHeader className="text-center pb-3">
                        <div className={`h-16 w-16 ${top3Icons[2].bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <AwardIcon className={`h-8 w-8 ${top3Icons[2].color}`} />
                        </div>
                        <CardTitle className="text-lg">{currentPlayers[2].name}</CardTitle>
                        <CardDescription>3e Plaats</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-3xl font-bold text-slate-900 mb-2">{currentPlayers[2].score}</div>
                        <div className="text-sm text-slate-600">punten</div>
                      </CardContent>
                    </Card>
                  </>
                ) : (
                  <>
                    <Card className="order-2 md:order-1 border-2 border-slate-300">
                      <CardHeader className="text-center pb-3">
                        <div className={`h-16 w-16 ${top3Icons[1].bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <Medal className={`h-8 w-8 ${top3Icons[1].color}`} />
                        </div>
                        <CardTitle className="text-lg">{currentPlayers[1].name}</CardTitle>
                        <CardDescription>2e Plaats</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-3xl font-bold text-slate-900 mb-2">{currentPlayers[1].score}</div>
                        <div className="text-sm text-slate-600">punten</div>
                      </CardContent>
                    </Card>

                    <Card className="order-1 md:order-2 border-4 border-amber-400 shadow-xl transform md:-translate-y-4">
                      <CardHeader className="text-center pb-3">
                        <div className={`h-20 w-20 ${top3Icons[0].bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <Crown className={`h-10 w-10 ${top3Icons[0].color}`} />
                        </div>
                        <CardTitle className="text-xl">{currentPlayers[0].name}</CardTitle>
                        <CardDescription>🏆 1e Plaats</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-4xl font-bold text-amber-600 mb-2">{currentPlayers[0].score}</div>
                        <div className="text-sm text-slate-600">punten</div>
                        <div className="mt-3 pt-3 border-t">
                          <Badge className="bg-emerald-100 text-emerald-700">
                            {currentPlayers[0].wins} wins
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="order-3 border-2 border-amber-200">
                      <CardHeader className="text-center pb-3">
                        <div className={`h-16 w-16 ${top3Icons[2].bg} rounded-full flex items-center justify-center mx-auto mb-3`}>
                          <AwardIcon className={`h-8 w-8 ${top3Icons[2].color}`} />
                        </div>
                        <CardTitle className="text-lg">{currentPlayers[2].name}</CardTitle>
                        <CardDescription>3e Plaats</CardDescription>
                      </CardHeader>
                      <CardContent className="text-center">
                        <div className="text-3xl font-bold text-slate-900 mb-2">{currentPlayers[2].score}</div>
                        <div className="text-sm text-slate-600">punten</div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Full Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-emerald-600" />
                    {timeframe === 'week' ? 'Week Stand' : 'Overall Stand'}
                  </CardTitle>
                  <CardDescription>
                    <Users className="h-4 w-4 inline mr-1" />
                    {currentPlayers.length} spelers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {currentPlayers.map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                          index < 3 ? 'bg-gradient-to-r from-emerald-50 to-transparent' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-amber-500 text-white' :
                            index === 1 ? 'bg-slate-400 text-white' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{player.name}</div>
                            <div className="text-sm text-slate-600">
                              {player.challenges} challenges • {player.wins} wins
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg text-emerald-600">{player.score}</div>
                          <div className="text-xs text-slate-500">Best: {player.bestScore}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-emerald-600" />
                Wil je meedoen aan de competitie?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-700">
                Registreer je account en doe mee met dagelijkse challenges! Bekijk je positie op het leaderboard
                en neem het op tegen je collega's.
              </p>
              <div className="flex gap-3">
                <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/register">Registreer Nu</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/challenges">Bekijk Challenges</Link>
                </Button>
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
