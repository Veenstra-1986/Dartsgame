'use client';

import { useState, useEffect } from 'react';
import { Target, Calendar, Trophy, Zap, Clock, Users, Lock, Unlock, Medal, Star, TrendingUp, Award, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MobileNav } from '@/components/mobile-nav';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

// Simulate current user - in real app this comes from auth
const currentUser = {
  id: 'user-1',
  name: 'Jan de Vries'
};

// Difficulty colors
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'intermediate':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    case 'advanced':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
};

const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'Beginner';
    case 'intermediate': return 'Gevorderd';
    case 'advanced': return 'Expert';
    default: return difficulty;
  }
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [userScores, setUserScores] = useState<Record<string, any>>({});
  const [submitDialog, setSubmitDialog] = useState<{ open: boolean; challengeId: string | null }>({ open: false, challengeId: null });
  const [submitScore, setSubmitScore] = useState('');
  const { toast } = useToast();

  // Load challenges and user data
  useEffect(() => {
    loadChallenges();
    loadGroups();
    loadUserScores();
  }, []);

  const loadChallenges = async () => {
    try {
      const res = await fetch(`/api/challenges/grouped?userId=${currentUser.id}&active=true`);
      const data = await res.json();
      if (data.success) {
        setChallenges(data.challenges);
      }
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const res = await fetch(`/api/groups?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        setGroups(data.groups);
        if (data.groups.length > 0) {
          setSelectedGroupId(data.groups[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading groups:', error);
    }
  };

  const loadUserScores = async () => {
    try {
      const res = await fetch(`/api/challenges/scores?userId=${currentUser.id}`);
      const data = await res.json();
      if (data.success) {
        const scoresMap: Record<string, any> = {};
        data.scores.forEach((score: any) => {
          scoresMap[score.challengeId] = score;
        });
        setUserScores(scoresMap);
      }
    } catch (error) {
      console.error('Error loading user scores:', error);
    }
  };

  const handleSubmitScore = async (challengeId: string) => {
    const score = parseInt(submitScore);
    if (isNaN(score) || score < 0) {
      toast({
        variant: 'destructive',
        title: 'Ongeldige score',
        description: 'Voer een geldig nummer in'
      });
      return;
    }

    try {
      const res = await fetch('/api/challenges/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          challengeId,
          score
        })
      });

      const data = await res.json();
      if (data.success) {
        toast({
          title: 'Score ingediend!',
          description: `Je score van ${score} is succesvol opgeslagen.`
        });
        setSubmitDialog({ open: false, challengeId: null });
        setSubmitScore('');
        loadChallenges();
        loadUserScores();
      } else {
        toast({
          variant: 'destructive',
          title: 'Fout',
          description: data.error
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Er ging iets mis'
      });
    }
  };

  const getGroupMembers = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    return group?.members || [];
  };

  const getFilteredScores = (challenge: any) => {
    if (!selectedGroupId) return challenge.scores;
    const memberIds = getGroupMembers(selectedGroupId).map((m: any) => m.id);
    return challenge.scores.filter((s: any) => memberIds.includes(s.userId));
  };

  const isChallengeActive = (challenge: any) => {
    const now = new Date();
    return new Date(challenge.scheduledAt) <= now && new Date(challenge.expiresAt) > now;
  };

  const isChallengeExpired = (challenge: any) => {
    return new Date() > new Date(challenge.expiresAt);
  };

  const hasUserSubmitted = (challengeId: string) => {
    return !!userScores[challengeId];
  };

  const getWinnerBadge = (index: number) => {
    if (index === 0) return <Medal className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-slate-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return null;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-emerald-50/20 to-slate-100 dark:from-slate-950 dark:via-emerald-950/20 dark:to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">DartsPro</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Competitie & Challenges</p>
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Zap className="h-3 w-3 mr-1" />
                Dagelijkse Challenges
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 pb-24">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Hero Section */}
          <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0 shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <CardHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-12 w-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-3xl font-bold">Dagelijkse Darts Challenges</CardTitle>
                  <CardDescription className="text-emerald-100 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    Neem het op tegen je groepsgenoten!
                  </CardDescription>
                </div>
              </div>
              <p className="text-emerald-50 mt-3 text-lg">
                Dagelijkse uitdagingen met echte competitie tussen groepsleden. Bewijs je skills en klim naar de top van het leaderboard!
              </p>
            </CardHeader>
          </Card>

          {/* Group Selector */}
          {groups.length > 0 && (
            <Card className="border-2">
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <Label htmlFor="group-select" className="font-medium">Selecteer je groep:</Label>
                  <Select value={selectedGroupId || ''} onValueChange={setSelectedGroupId}>
                    <SelectTrigger id="group-select" className="flex-1 max-w-md">
                      <SelectValue placeholder="Kies een groep" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name} ({group.memberCount} leden)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* No Groups Message */}
          {groups.length === 0 && (
            <Card className="border-2 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-amber-900 dark:text-amber-200">Nog geen groep?</h3>
                    <p className="text-sm text-amber-800 dark:text-amber-300 mt-1">
                      Word lid van een groep om mee te doen aan challenges en je scores te vergelijken met teamgenoten.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-600 border-t-transparent" />
              <p className="text-slate-600 dark:text-slate-400 mt-4">Challenges laden...</p>
            </div>
          ) : challenges.length === 0 ? (
            <Card className="border-2 border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Target className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Geen actieve challenges</h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Er zijn momenteel geen actieve challenges. Kom later terug!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {challenges.map((challenge, index) => {
                const isActive = isChallengeActive(challenge);
                const isExpired = isChallengeExpired(challenge);
                const userSubmitted = hasUserSubmitted(challenge.id);
                const filteredScores = getFilteredScores(challenge);

                return (
                  <Card
                    key={challenge.id}
                    className={`overflow-hidden transition-all hover:shadow-xl ${
                      isActive ? 'border-4 border-emerald-400 dark:border-emerald-600 shadow-lg' :
                      isExpired ? 'opacity-75' : ''
                    }`}
                  >
                    {/* Challenge Header */}
                    <div className={`bg-gradient-to-r ${
                      isActive ? 'from-emerald-500 to-teal-500' :
                      isExpired ? 'from-slate-400 to-slate-500' : 'from-amber-500 to-orange-500'
                    } px-6 py-4`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-14 w-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            {isActive && <Trophy className="h-8 w-8 text-white" />}
                            {isExpired && <Lock className="h-8 w-8 text-white/70" />}
                            {!isActive && !isExpired && <Clock className="h-8 w-8 text-white" />}
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">{challenge.name}</h3>
                            <div className="flex items-center gap-3 mt-1 text-white/90 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(challenge.scheduledAt).toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })}
                              </span>
                              {isActive && (
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  Verloopt: {new Date(challenge.expiresAt).toLocaleDateString('nl-NL', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <Badge className={`${getDifficultyColor(challenge.difficulty || 'intermediate')} border-0`}>
                          {getDifficultyLabel(challenge.difficulty)}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6 space-y-4">
                      {/* Challenge Details */}
                      <div className="space-y-3">
                        <p className="text-slate-700 dark:text-slate-300">{challenge.description}</p>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
                            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                            Regels
                          </h4>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{challenge.rules}</p>
                        </div>
                      </div>

                      {/* Leaderboard */}
                      {filteredScores.length > 0 ? (
                        <div className="space-y-3">
                          <h4 className="font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                            <Award className="h-4 w-4 text-amber-600" />
                            Leaderboard ({filteredScores.length} deelnemers)
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {filteredScores.slice(0, 10).map((entry: any, idx: number) => (
                              <div
                                key={entry.id}
                                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                  entry.userId === currentUser.id
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700'
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 flex items-center justify-center">
                                    {getWinnerBadge(idx)}
                                  </div>
                                  <div>
                                    <p className={`font-medium ${entry.userId === currentUser.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                      {entry.user.name}
                                      {entry.userId === currentUser.id && (
                                        <Badge className="ml-2 text-xs bg-emerald-600 text-white">Jij</Badge>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{entry.score}</p>
                                  {idx === 0 && (
                                    <div className="flex items-center gap-1 text-amber-600 text-xs mt-1">
                                      <TrendingUp className="h-3 w-3" />
                                      <span>Leider</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-dashed">
                          <Users className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Nog geen scores ingediend voor deze challenge
                          </p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      {isActive && !userSubmitted && (
                        <Dialog open={submitDialog.open && submitDialog.challengeId === challenge.id} onOpenChange={(open) => setSubmitDialog({ open, challengeId: open ? challenge.id : null })}>
                          <DialogTrigger asChild>
                            <Button size="lg" className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg">
                              <Zap className="h-5 w-5 mr-2" />
                              Doe Mee met deze Challenge
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Score indienen voor {challenge.name}</DialogTitle>
                              <DialogDescription>
                                Voer je score in. Je kunt dit maar één keer doen, dus wees zeker van je resultaat!
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div>
                                <Label htmlFor="score">Jouw Score</Label>
                                <Input
                                  id="score"
                                  type="number"
                                  value={submitScore}
                                  onChange={(e) => setSubmitScore(e.target.value)}
                                  placeholder="Voer je score in..."
                                  className="text-2xl font-bold h-16 text-center"
                                />
                              </div>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                ⚠️ Je kunt slechts één keer een score indienen per challenge. Wees zeker van je resultaat voordat je opslaat.
                              </p>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={() => setSubmitDialog({ open: false, challengeId: null })}
                                  className="flex-1"
                                >
                                  Annuleren
                                </Button>
                                <Button
                                  onClick={() => handleSubmitScore(challenge.id)}
                                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                                  disabled={!submitScore}
                                >
                                  Score Opslaan
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {userSubmitted && (
                        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-emerald-600 rounded-full flex items-center justify-center">
                              <Check className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-emerald-900 dark:text-emerald-200">Score Ingediend</p>
                              <p className="text-sm text-emerald-700 dark:text-emerald-400">
                                Je score van {userScores[challenge.id]?.score} is opgeslagen
                              </p>
                            </div>
                            <Star className="h-6 w-6 text-amber-500" />
                          </div>
                        </div>
                      )}

                      {isExpired && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border-2 border-slate-200 dark:border-slate-700">
                          <div className="flex items-center gap-3">
                            <Lock className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              Deze challenge is afgelopen. Bekijk de bovenstaande leaderboard voor de resultaten.
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
