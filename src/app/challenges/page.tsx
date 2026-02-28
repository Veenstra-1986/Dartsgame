'use client';

import { useState, useEffect } from 'react';
import { Target, Calendar, Trophy, Zap, Clock, Users, Play, Send, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MobileNav } from '@/components/mobile-nav';
import { MatchInvitations } from '@/components/match-invitations';
import Link from 'next/link';
import { useSettings } from '@/contexts/settings-context';
import { toast } from '@/hooks/use-toast';

type Challenge = {
  id: string;
  name: string;
  description: string;
  gameType: string;
  targetScore: number | null;
  rules: string;
  scheduledAt: string;
  expiresAt: string;
  scores: ChallengeScore[];
};

type ChallengeScore = {
  id: string;
  score: number;
  completedAt: string;
  user: {
    id: string;
    name: string;
  };
};

type User = {
  id: string;
  name: string;
  email: string;
};

const gameTypeNames: Record<string, string> = {
  '501': '501',
  '301': '301',
  'cricket': 'Cricket',
  'around-clock': 'Around the Clock',
  'high-score': 'High Score',
  'treble-hunt': 'Trebles Jacht',
  'double-trouble': 'Double Master',
  'bull-master': 'Bull Master',
  '180-hunter': '180 Hunter',
  'shanghai': 'Shanghai',
  'mickey-mouse': 'Mickey Mouse',
  'killers': 'Killer',
  'gotcha': 'Gotcha',
  'golf': 'Golf Darts',
  'all-five': 'All Five',
  'sudden-death': 'Sudden Death'
};

const difficultyFromGameType: Record<string, string> = {
  '501': 'intermediate',
  '301': 'intermediate',
  'cricket': 'intermediate',
  'around-clock': 'beginner',
  'high-score': 'beginner',
  'treble-hunt': 'advanced',
  'double-trouble': 'intermediate',
  'bull-master': 'advanced',
  '180-hunter': 'advanced',
  'shanghai': 'intermediate',
  'mickey-mouse': 'advanced',
  'killers': 'intermediate',
  'gotcha': 'beginner',
  'golf': 'intermediate',
  'all-five': 'beginner',
  'sudden-death': 'advanced'
};

const difficultyColors = {
  beginner: 'bg-emerald-100 text-emerald-700',
  intermediate: 'bg-amber-100 text-amber-700',
  advanced: 'bg-rose-100 text-rose-700'
};

export default function ChallengesPage() {
  const { preferences } = useSettings();
  const accentColor = preferences.accentColor || 'emerald';

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [submitScoreOpen, setSubmitScoreOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [scoreInput, setScoreInput] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'daily' | 'matches' | 'upcoming' | 'past'>('daily');

  // Helper functions for accent colors
  const getAccentColorClass = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'bg-emerald-600',
      blue: 'bg-blue-600',
      purple: 'bg-purple-600',
      rose: 'bg-rose-600',
      amber: 'bg-amber-600',
      orange: 'bg-orange-600',
      teal: 'bg-teal-600',
      slate: 'bg-slate-600',
    };
    return colors[color] || 'bg-emerald-600';
  };

  const getAccentTextColor = (color: string) => {
    const colors: Record<string, string> = {
      emerald: 'text-emerald-600',
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      rose: 'text-rose-600',
      amber: 'text-amber-600',
      orange: 'text-orange-600',
      teal: 'text-teal-600',
      slate: 'text-slate-600',
    };
    return colors[color] || 'text-emerald-600';
  };

  const getAccentColorClassWithOpacity = (color: string, opacity: number = 0.2) => {
    const colors: Record<string, string> = {
      emerald: 'rgb(16, 185, 129)',
      blue: 'rgb(37, 99, 235)',
      purple: 'rgb(147, 51, 234)',
      rose: 'rgb(244, 63, 94)',
      amber: 'rgb(245, 158, 11)',
      orange: 'rgb(249, 115, 22)',
      teal: 'rgb(20, 184, 166)',
      slate: 'rgb(71, 85, 105)',
    };
    const baseColor = colors[color] || colors.emerald;
    return baseColor.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
  };

  // Fetch challenges
  useEffect(() => {
    fetchChallenges();
    checkCurrentUser();
  }, []);

  const fetchChallenges = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/challenges');
      const data = await response.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  };

  const getTodayChallenge = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return challenges.find(c => {
      const scheduledDate = new Date(c.scheduledAt);
      return scheduledDate.toDateString() === today.toDateString();
    });
  };

  const getActiveChallenges = () => {
    const now = new Date();
    return challenges.filter(c => {
      const scheduled = new Date(c.scheduledAt);
      const expires = new Date(c.expiresAt);
      return scheduled <= now && expires > now;
    });
  };

  const getPastChallenges = () => {
    const now = new Date();
    return challenges.filter(c => {
      const expires = new Date(c.expiresAt);
      return expires <= now;
    }).slice(0, 5);
  };

  const handleScoreSubmit = async () => {
    if (!selectedChallenge || !currentUser) return;

    const score = parseInt(scoreInput);
    if (isNaN(score) || score < 0) {
      toast({
        variant: 'destructive',
        title: 'Ongeldige score',
        description: 'Voer een geldig positief getal in.'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/challenges/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          challengeId: selectedChallenge.id,
          score
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Score opgeslagen!',
          description: 'Je score is succesvol ingediend voor de challenge.'
        });
        setSubmitScoreOpen(false);
        setScoreInput('');
        fetchChallenges();
      } else {
        toast({
          variant: 'destructive',
          title: 'Fout',
          description: data.error || 'Er ging iets mis.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Er ging iets mis bij het opslaan van je score.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleInvite = async () => {
    if (!selectedChallenge || !currentUser) return;

    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast({
        variant: 'destructive',
        title: 'Ongeldig e-mailadres',
        description: 'Voer een geldig e-mailadres in.'
      });
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/challenges/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          challengeId: selectedChallenge.id,
          inviterId: currentUser.id
        })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Uitnodiging verzonden!',
          description: `${data.invitedUser.name} is uitgenodigd om mee te doen met de challenge.`
        });
        setInviteOpen(false);
        setInviteEmail('');
      } else {
        toast({
          variant: 'destructive',
          title: 'Fout',
          description: data.error || 'Er ging iets mis.'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Er ging iets mis bij het verzenden van de uitnodiging.'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    return days[date.getDay()];
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
  };

  const todayChallenge = getTodayChallenge();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header - Compact */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-3 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                <Target className="h-3.5 w-3.5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 leading-tight">
                  {preferences.groupName || 'DartsPro'}
                </h1>
                <Badge variant="secondary" className="text-[9px] px-1 py-0 h-4" style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor), color: getAccentTextColor(accentColor) }}>
                  <Zap className="h-2.5 w-2.5 mr-0.5" />
                  Dagelijkse Challenges
                </Badge>
              </div>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 py-2 pb-20 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-3">
          {/* Tabs for different views */}
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="daily" className="text-xs">Dagelijkse</TabsTrigger>
              <TabsTrigger value="matches" className="text-xs">Match Uitnodigingen</TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-2 mt-3">
              {/* Today's Challenge Card - Compact */}
              {todayChallenge ? (
            <Card className="border-2 shadow-lg" style={{ borderColor: getAccentColorClass(accentColor) }}>
              <CardHeader className="pb-2 px-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor) }}>
                      <Trophy className="h-5 w-5" style={{ color: getAccentTextColor(accentColor) }} />
                    </div>
                    <div>
                      <CardTitle className="text-base leading-tight">{todayChallenge.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1 text-[10px]">
                        <Calendar className="h-3 w-3" />
                        {formatDate(todayChallenge.scheduledAt)}
                        <span className="text-slate-400">•</span>
                        <Clock className="h-3 w-3" />
                        {formatDate(todayChallenge.expiresAt)} {formatTime(todayChallenge.expiresAt)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={`text-[10px] px-2 py-0.5 ${difficultyColors[difficultyFromGameType[todayChallenge.gameType] as keyof typeof difficultyColors]}`}>
                    {difficultyFromGameType[todayChallenge.gameType]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-3">
                <p className="text-xs text-slate-700 line-clamp-2">{todayChallenge.description}</p>

                <div className="p-2 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold mb-1 flex items-center gap-2 text-xs">
                    <Target className="h-3 w-3" style={{ color: getAccentTextColor(accentColor) }} />
                    Regels
                  </h4>
                  <p className="text-[10px] text-slate-600 line-clamp-2">{todayChallenge.rules}</p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users className="h-2.5 w-2.5" />
                      {todayChallenge.scores.length} deelnemers
                    </div>
                    {todayChallenge.targetScore && todayChallenge.targetScore > 0 && (
                      <div className="flex items-center gap-1">
                        <Target className="h-2.5 w-2.5" />
                        {todayChallenge.targetScore}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1.5">
                    {currentUser ? (
                      <>
                        {todayChallenge.scores.find(s => s.user.id === currentUser.id) ? (
                          <Button size="sm" variant="outline" disabled className="text-[10px] h-7 px-2">
                            <Check className="h-3 w-3 mr-1" />
                            Ingediend
                          </Button>
                        ) : (
                          <Dialog open={submitScoreOpen} onOpenChange={setSubmitScoreOpen}>
                            <DialogTrigger asChild>
                              <Button size="sm" className="text-[10px] h-7 px-2" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                                <Play className="h-3 w-3 mr-1" />
                                Doe Mee
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Score Invoeren</DialogTitle>
                                <DialogDescription>
                                  Voer je score in voor: {todayChallenge.name}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div>
                                  <Label htmlFor="score">Je Score</Label>
                                  <Input
                                    id="score"
                                    type="number"
                                    placeholder="Voer je score in..."
                                    value={scoreInput}
                                    onChange={(e) => setScoreInput(e.target.value)}
                                    className="mt-2"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    onClick={handleScoreSubmit}
                                    disabled={submitting}
                                    className="flex-1"
                                    style={{ backgroundColor: getAccentColorClass(accentColor) }}
                                  >
                                    {submitting ? 'Opslaan...' : 'Score Opslaan'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => setSubmitScoreOpen(false)}
                                  >
                                    Annuleren
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-[10px] h-7 px-2">
                              <Send className="h-3 w-3 mr-1" />
                              Uitnodigen
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Uitnodigen</DialogTitle>
                              <DialogDescription>
                                Nodig iemand uit om mee te doen met: {todayChallenge.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="email">E-mailadres</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  placeholder="email@voorbeeld.nl"
                                  value={inviteEmail}
                                  onChange={(e) => setInviteEmail(e.target.value)}
                                  className="mt-2"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={handleInvite}
                                  disabled={submitting}
                                  className="flex-1"
                                  style={{ backgroundColor: getAccentColorClass(accentColor) }}
                                >
                                  {submitting ? 'Verzenden...' : 'Uitnodiging Versturen'}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => setInviteOpen(false)}
                                >
                                  Annuleren
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="text-[10px] h-7 px-2" asChild>
                        <Link href="/login">Inloggen</Link>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Leaderboard for this challenge - Compact */}
                {todayChallenge.scores.length > 0 && (
                  <div className="mt-2 pt-2 border-t">
                    <h4 className="font-semibold mb-2 text-xs flex items-center gap-2">
                      <Trophy className="h-3 w-3" style={{ color: getAccentTextColor(accentColor) }} />
                      Tussenstand
                    </h4>
                    <div className="space-y-1.5">
                      {todayChallenge.scores.slice(0, 3).map((score, index) => (
                        <div key={score.id} className="flex items-center justify-between py-1.5 px-2 bg-slate-50 rounded">
                          <div className="flex items-center gap-2">
                            <Badge variant={index === 0 ? 'default' : 'secondary'} className="text-[9px] h-5 px-1.5"
                              style={index === 0 ? { backgroundColor: getAccentColorClass(accentColor) } : {}}>
                            {index + 1}
                          </Badge>
                            <span className="text-xs font-medium truncate max-w-[120px]">{score.user.name}</span>
                          </div>
                          <span className="font-bold text-xs" style={{ color: getAccentTextColor(accentColor) }}>
                            {score.score}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-4 text-slate-500 text-xs">Geen challenge voor vandaag</div>
          )}

          {/* Upcoming and Past Challenges */}
          <div className="mt-4">
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-8">
                <TabsTrigger value="upcoming" className="text-xs">Komende</TabsTrigger>
                <TabsTrigger value="past" className="text-xs">Vorige</TabsTrigger>
              </TabsList>

            <TabsContent value="upcoming" className="space-y-2 mt-3">
              {loading ? (
                <div className="text-center py-4 text-slate-500 text-xs">Laden...</div>
              ) : getActiveChallenges().length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs">Geen actieve challenges</div>
              ) : (
                <div className="space-y-2">
                  {getActiveChallenges().map((challenge) => (
                    <Card
                      key={challenge.id}
                      className="hover:shadow-md transition-all"
                    >
                      <CardHeader className="pb-2 px-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor) }}>
                              <Target className="h-4 w-4" style={{ color: getAccentTextColor(accentColor) }} />
                            </div>
                            <div>
                              <CardTitle className="text-sm leading-tight">{challenge.name}</CardTitle>
                              <CardDescription className="flex items-center gap-2 mt-0.5 text-[10px]">
                                <Calendar className="h-2.5 w-2.5" />
                                {formatDate(challenge.scheduledAt)}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className={`text-[9px] px-1.5 py-0.5 h-5 ${difficultyColors[difficultyFromGameType[challenge.gameType] as keyof typeof difficultyColors]}`}>
                            {difficultyFromGameType[challenge.gameType]}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        <p className="text-[10px] text-slate-600 mb-2 line-clamp-1">{challenge.description}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500">
                          <span>{gameTypeNames[challenge.gameType] || challenge.gameType}</span>
                          <span className="flex items-center gap-1">
                            <Users className="h-2.5 w-2.5" />
                            {challenge.scores.length}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-2 mt-3">
              {getPastChallenges().length === 0 ? (
                <div className="text-center py-4 text-slate-500 text-xs">Geen eerdere challenges</div>
              ) : (
                <div className="space-y-2">
                  {getPastChallenges().map((challenge) => (
                    <Card key={challenge.id} className="opacity-75">
                      <CardHeader className="pb-2 px-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor) }}>
                              <Trophy className="h-4 w-4" style={{ color: getAccentTextColor(accentColor) }} />
                            </div>
                            <div>
                              <CardTitle className="text-sm leading-tight">{challenge.name}</CardTitle>
                              <CardDescription className="text-[10px]">{formatDate(challenge.scheduledAt)}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary" className="text-[9px] h-5">Voltooid</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        {challenge.scores.length > 0 && (
                          <div className="pt-2 border-t">
                            <div className="flex items-center justify-between py-0.5">
                              <span className="text-[10px] text-slate-600">Winnaar:</span>
                              <span className="text-[10px] font-semibold" style={{ color: getAccentTextColor(accentColor) }}>
                                {challenge.scores[0].user.name}
                              </span>
                            </div>
                            <div className="flex items-center justify-between py-0.5">
                              <span className="text-[10px] text-slate-600">Score:</span>
                              <span className="text-[10px] font-bold">{challenge.scores[0].score}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            </Tabs>
          </div>
        </TabsContent>

        {/* Match Invitations Tab */}
        <TabsContent value="matches" className="space-y-2 mt-3">
          <MatchInvitations
            currentUser={currentUser}
            getAccentColorClass={getAccentColorClass}
            getAccentTextColor={getAccentTextColor}
            accentColor={accentColor}
          />
        </TabsContent>
      </Tabs>
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
