'use client';

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect } from 'react';
import { Target, RotateCcw, Check, Eraser, TrendingUp, Trophy, Play, ArrowUp, ArrowDown, Zap, Award, Calculator, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DartsKeypad } from '@/components/darts-keypad';
import { NumberKeypad } from '@/components/number-keypad';
import { MobileNav } from '@/components/mobile-nav';
import { useSettings } from '@/contexts/settings-context';
import Link from 'next/link';

type GameType = '501' | '301' | 'Cricket';
type InputMethod = 'per-dart' | '3-darts' | 'direct';
type Player = {
  id: string;
  name: string;
  score: number;
  history: number[][];
  currentDarts: number[];
  darts: number;
  finished: boolean;
};

export default function ScoreboardPage() {
  const { preferences } = useSettings();
  const accentColor = preferences.accentColor || 'emerald';

  const [gameType, setGameType] = useState<GameType>('501');
  const [inputMethod, setInputMethod] = useState<InputMethod>('per-dart');
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Speler 1', score: 501, history: [], currentDarts: [], darts: 0, finished: false },
    { id: '2', name: 'Speler 2', score: 501, history: [], currentDarts: [], darts: 0, finished: false },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [checkOut, setCheckOut] = useState<string[]>([]);
  const [roundScore, setRoundScore] = useState('');
  const [scoreAnimation, setScoreAnimation] = useState<{ show: boolean; score: number; type: 'down' | 'up' }>({ show: false, score: 0, type: 'down' });
  const [lastRoundScore, setLastRoundScore] = useState<{ playerId: string; score: number } | null>(null);

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

  const calculateCheckOut = (score: number): string[] => {
    const outs: string[] = [];
    const doubles = [20, 16, 12, 8, 4, 18, 14, 10, 6, 2, 19, 17, 15, 13, 11, 9, 7, 5, 3, 1];
    const triples = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

    for (let d of doubles) {
      if (score - d === 25) outs.push(`Bull, D${d}`);
      if (score - d > 0 && score - d <= 20) outs.push(`${score - d}, D${d}`);
      if (score - d > 0 && score - d <= 60) {
        for (let t of triples) {
          if (score - d - t * 3 === 0) outs.push(`T${t}, D${d}`);
        }
      }
    }

    for (let t of triples) {
      for (let d of doubles) {
        const remaining = score - t * 3 - d;
        if (remaining > 0 && remaining <= 20) outs.push(`${remaining}, T${t}, D${d}`);
      }
    }

    return [...new Set(outs)].slice(0, 10);
  };

  // Score animation effect
  useEffect(() => {
    if (scoreAnimation.show) {
      const timer = setTimeout(() => setScoreAnimation({ show: false, score: 0, type: 'down' }), 1000);
      return () => clearTimeout(timer);
    }
  }, [scoreAnimation]);

  // Reset game when game type changes
  useEffect(() => {
    const startScore = gameType === '501' ? 501 : gameType === '301' ? 301 : 0;
    setPlayers([
      { id: '1', name: 'Speler 1', score: startScore, history: [], currentDarts: [], darts: 0, finished: false },
      { id: '2', name: 'Speler 2', score: startScore, history: [], currentDarts: [], darts: 0, finished: false },
    ]);
    setCurrentPlayerIndex(0);
    setMessage('');
    setCheckOut([]);
    setRoundScore('');
    setLastRoundScore(null);
  }, [gameType]);

  // Reset current round when input method changes
  useEffect(() => {
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex].currentDarts = [];
    setPlayers(newPlayers);
    setRoundScore('');
    setMessage('');
  }, [inputMethod, currentPlayerIndex]);

  // Calculate check-out options
  useEffect(() => {
    const player = players[currentPlayerIndex];
    if (player && !player.finished && player.score <= 170 && player.score > 0) {
      setCheckOut(calculateCheckOut(player.score));
    } else {
      setCheckOut([]);
    }
  }, [currentPlayerIndex, players]);

  const handlePerDartScore = (score: number) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    if (player.currentDarts.length >= 3) {
      setMessage('Bevestig eerst de huidige worp!');
      return;
    }

    const currentTotal = player.currentDarts.reduce((a, b) => a + b, 0);
    const newTotal = player.score - (currentTotal + score);

    if (newTotal < 0 || (newTotal === 1 && gameType !== 'Cricket')) {
      setMessage(`Let op: ${score} zou je busten!`);
      return;
    }

    player.currentDarts.push(score);
    setPlayers(newPlayers);
    setMessage('');

    if (player.currentDarts.length === 3 || newTotal === 0) {
      handleScoreSubmit();
    }
  };

  const handle3DartsScore = (darts: number[]) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    const total = darts.reduce((a, b) => a + b, 0);
    const newScore = player.score - total;

    if (newScore < 0 || (newScore === 1 && gameType !== 'Cricket')) {
      setMessage(`Beurt totaal ${total} zou je busten!`);
      return;
    }

    if (newScore === 0) {
      player.finished = true;
      setMessage(`🎉 ${player.name} heeft gewonnen met: ${formatDartScores(darts)}!`);
    }

    player.score = newScore;
    player.history.push([...darts]);
    player.darts += 3;
    player.currentDarts = [];

    setScoreAnimation({ show: true, score: total, type: 'down' });
    setLastRoundScore({ playerId: player.id, score: total });
    setPlayers(newPlayers);

    if (!newPlayers[currentPlayerIndex].finished) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
  };

  const handleDirectScore = (score: number) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    const newScore = player.score - score;

    if (newScore < 0 || (newScore === 1 && gameType !== 'Cricket')) {
      setMessage(`Score ${score} zou je busten!`);
      return;
    }

    if (newScore === 0) {
      player.finished = true;
      setMessage(`🎉 ${player.name} heeft gewonnen met: ${score}!`);
    }

    player.score = newScore;
    player.history.push([[score]]);
    player.darts += 3;
    player.currentDarts = [];

    setScoreAnimation({ show: true, score: score, type: 'down' });
    setLastRoundScore({ playerId: player.id, score: score });
    setPlayers(newPlayers);

    if (!newPlayers[currentPlayerIndex].finished) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
  };

  const clearCurrentDart = () => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    player.currentDarts.pop();
    setPlayers(newPlayers);
    setMessage('');
  };

  const clearAllDarts = () => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    player.currentDarts = [];
    setPlayers(newPlayers);
    setMessage('');
    setRoundScore('');
  };

  const handleScoreSubmit = () => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];

    if (inputMethod === '3-darts' || inputMethod === 'per-dart') {
      if (player.currentDarts.length === 0) {
        setMessage('Voer minimaal één dart score in.');
        return;
      }

      const roundTotal = player.currentDarts.reduce((a, b) => a + b, 0);
      const newScore = player.score - roundTotal;

      if (newScore < 0 || (newScore === 1 && gameType !== 'Cricket')) {
        setMessage('Geen geldige uitworp! Score onder 0 of resterend is 1.');
        return;
      }

      if (newScore === 0) {
        player.finished = true;
        setMessage(`🎉 ${player.name} heeft gewonnen met: ${formatDartScores(player.currentDarts)}!`);
      }

      player.score = newScore;
      player.history.push([...player.currentDarts]);
      player.darts += player.currentDarts.length;
      player.currentDarts = [];

      setScoreAnimation({ show: true, score: roundTotal, type: 'down' });
      setLastRoundScore({ playerId: player.id, score: roundTotal });
    }

    setPlayers(newPlayers);

    if (!newPlayers[currentPlayerIndex].finished) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
  };

  const formatDartScores = (darts: number[]) => {
    return darts.map((score, i) => {
      let prefix = '';
      if (score % 3 === 0 && score / 3 <= 20 && score > 0) prefix = 'T';
      else if (score % 2 === 0 && score / 2 <= 20 && score > 0) prefix = 'D';
      else if (score === 25) prefix = 'Bull';
      else if (score === 50) prefix = 'Bullseye';

      if (prefix) {
        const num = score === 25 ? 25 : score === 50 ? 50 :
                   prefix === 'T' ? score / 3 :
                   prefix === 'D' ? score / 2 : score;
        return `${prefix}${num}`;
      }
      return score.toString();
    }).join(' - ');
  };

  const resetGame = () => {
    const startScore = gameType === '501' ? 501 : gameType === '301' ? 301 : 0;
    setPlayers([
      { id: '1', name: 'Speler 1', score: startScore, history: [], currentDarts: [], darts: 0, finished: false },
      { id: '2', name: 'Speler 2', score: startScore, history: [], currentDarts: [], darts: 0, finished: false },
    ]);
    setCurrentPlayerIndex(0);
    setMessage('');
    setCheckOut([]);
    setRoundScore('');
  };

  const currentPlayer = players[currentPlayerIndex];
  const gameFinished = players.some(p => p.finished);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                <Target className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 leading-tight">
                  {preferences.groupName || 'DartsPro'}
                </h1>
                <Badge variant="secondary" className="text-[10px] px-1 py-0" style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor), color: getAccentTextColor(accentColor) }}>
                  <Trophy className="h-2.5 w-2.5 mr-0.5" />
                  {gameType}
                </Badge>
              </div>
            </Link>
            <Badge className="text-white text-xs" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
              Scoreteller
            </Badge>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-3 py-3 pb-20">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Game Settings - Compact */}
          <Card className="border-l-4" style={{ borderLeftColor: getAccentColorClass(accentColor) }}>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Select value={gameType} onValueChange={(v) => setGameType(v as GameType)}>
                    <SelectTrigger className="w-28 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="501">501</SelectItem>
                      <SelectItem value="301">301</SelectItem>
                      <SelectItem value="Cricket">Cricket</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={inputMethod} onValueChange={(v) => setInputMethod(v as InputMethod)}>
                    <SelectTrigger className="w-32 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-dart">Per Dart</SelectItem>
                      <SelectItem value="3-darts">3 Darts</SelectItem>
                      <SelectItem value="direct">Direct</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={resetGame} 
                  className="h-8 px-3 text-xs"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  Nieuw Spel
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Scoreboard Cards */}
          <div className="grid md:grid-cols-2 gap-3">
            {players.map((player, index) => {
              const avgPer3 = player.history.length > 0
                ? Math.round(player.history.reduce((a, b) => a + b.reduce((x, y) => x + y, 0), 0) / player.darts * 3)
                : 0;
              const highestScore = player.history.length > 0
                ? Math.max(...player.history.map(h => h.reduce((a, b) => a + b, 0)))
                : 0;
              const isLastRoundPlayer = lastRoundScore?.playerId === player.id;
              const scoreChange = isLastRoundPlayer ? lastRoundScore.score : 0;
              
              return (
                <Card
                  key={player.id}
                  className={`transition-all relative overflow-hidden ${
                    index === currentPlayerIndex && !gameFinished
                      ? 'border-2 shadow-lg scale-[1.02]'
                      : player.finished
                      ? 'border-2 border-amber-400 bg-amber-50/50'
                      : 'border border-slate-200'
                  }`}
                  style={{
                    borderColor: index === currentPlayerIndex && !gameFinished 
                      ? getAccentColorClass(accentColor) 
                      : undefined
                  }}
                >
                  {/* Score Change Animation */}
                  {isLastRoundPlayer && scoreChange > 0 && (
                    <div className="absolute top-2 right-2 text-xs font-bold animate-fadeInOut" style={{ color: getAccentTextColor(accentColor) }}>
                      <ArrowDown className="h-3 w-3 inline" /> {scoreChange}
                    </div>
                  )}
                  
                  <CardHeader className="pb-2 px-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-500">{player.name}</p>
                          {avgPer3 >= 80 && (
                            <Zap className="h-3 w-3 text-amber-500" fill="currentColor" />
                          )}
                          {highestScore >= 100 && (
                            <Award className="h-3 w-3 text-purple-500" />
                          )}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <CardTitle 
                            className={`text-4xl font-bold ${
                              index === currentPlayerIndex && !gameFinished
                                ? getAccentTextColor(accentColor)
                                : 'text-slate-900'
                            }`}
                          >
                            {player.score}
                          </CardTitle>
                          {index === currentPlayerIndex && !gameFinished && player.score <= 170 && player.score > 0 && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ 
                              backgroundColor: getAccentColorClassWithOpacity(accentColor, 0.15),
                              color: getAccentTextColor(accentColor)
                            }}>
                              Check-out
                            </span>
                          )}
                        </div>
                      </div>
                      {index === currentPlayerIndex && !gameFinished && (
                        <Badge 
                          className="animate-pulse text-white"
                          style={{ backgroundColor: getAccentColorClass(accentColor) }}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Aan beurt
                        </Badge>
                      )}
                      {player.finished && (
                        <Badge className="bg-amber-500 text-white">
                          <Trophy className="h-3 w-3 mr-1" />
                          Gewonnen
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 px-4">
                    {/* Statistics Grid */}
                    <div className="grid grid-cols-4 gap-2 text-center py-2 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
                      <div className="flex flex-col items-center">
                        <Target className="h-3 w-3 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">Darts</span>
                        <span className="font-bold text-sm text-slate-700">{player.darts}</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <TrendingUp className="h-3 w-3 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">Hoogste</span>
                        <span className={`font-bold text-sm ${highestScore >= 100 ? 'text-purple-600' : 'text-slate-700'}`}>
                          {highestScore}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Calculator className="h-3 w-3 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">Gem/3</span>
                        <span className={`font-bold text-sm ${avgPer3 >= 80 ? 'text-amber-600' : 'text-slate-700'}`}>
                          {avgPer3}
                        </span>
                      </div>
                      <div className="flex flex-col items-center">
                        <RotateCcw className="h-3 w-3 text-slate-400 mb-1" />
                        <span className="text-[10px] text-slate-500">Beurten</span>
                        <span className="font-bold text-sm text-slate-700">{player.history.length}</span>
                      </div>
                    </div>
                    
                    {/* Current Turn Display */}
                    {player.currentDarts.length > 0 && index === currentPlayerIndex && (
                      <div className="py-3 px-3 rounded-lg border-2" style={{ 
                        backgroundColor: getAccentColorClassWithOpacity(accentColor, 0.1),
                        borderColor: getAccentColorClass(accentColor)
                      }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold flex items-center gap-1" style={{ color: getAccentTextColor(accentColor) }}>
                            <Flame className="h-3 w-3" />
                            Huidige beurt
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-500">Totaal:</span>
                            <span className="text-lg font-bold" style={{ color: getAccentTextColor(accentColor) }}>
                              {player.currentDarts.reduce((a, b) => a + b, 0)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {[0, 1, 2].map((i) => (
                            <div 
                              key={i}
                              className={`flex-1 h-10 rounded-lg flex items-center justify-center text-sm font-bold ${
                                player.currentDarts[i] 
                                  ? 'text-white' 
                                  : 'bg-slate-100 text-slate-300'
                              }`}
                              style={{ 
                                backgroundColor: player.currentDarts[i] ? getAccentColorClass(accentColor) : undefined
                              }}
                            >
                              {player.currentDarts[i] || '-'}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Last Throws History */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-slate-500">Laatste worpen</span>
                        {player.history.length > 3 && (
                          <span className="text-[9px] text-slate-400">van {player.history.length} beurten</span>
                        )}
                      </div>
                      <div className="text-xs space-y-1">
                        {player.history.slice(-3).reverse().map((round, i) => (
                          <div 
                            key={i} 
                            className={`flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors ${
                              i === 0 && isLastRoundPlayer 
                                ? 'border-2' 
                                : 'border-b border-slate-100'
                            }`}
                            style={{
                              backgroundColor: i === 0 && isLastRoundPlayer ? getAccentColorClassWithOpacity(accentColor, 0.08) : undefined,
                              borderColor: i === 0 && isLastRoundPlayer ? getAccentColorClass(accentColor) : undefined
                            }}
                          >
                            <span className={`font-medium ${i === 0 ? getAccentTextColor(accentColor) : 'text-slate-600'}`}>
                              {formatDartScores(round)}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-400">{round.length} darts</span>
                              <span className={`font-bold ${i === 0 ? getAccentTextColor(accentColor) : 'text-slate-700'}`}>
                                {round.reduce((a, b) => a + b, 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                        {player.history.length === 0 && (
                          <div className="text-center py-3 text-slate-400 text-[11px]">
                            Nog geen worpen
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Score Input Section */}
          {!gameFinished && (
            <Card className="border-2">
              <CardHeader className="pb-3 px-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                        <Target className="h-3 w-3 text-white" />
                      </div>
                      <span>{currentPlayer.name}</span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-1">
                      Type: {inputMethod === 'per-dart' ? 'Per Dart' : inputMethod === '3-darts' ? '3 Darts + Bevestig' : 'Directe Score'}
                    </CardDescription>
                  </div>
                  {(inputMethod === 'per-dart' || inputMethod === '3-darts') && currentPlayer.currentDarts.length > 0 && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearCurrentDart}
                        className="h-8 px-2 text-xs"
                      >
                        <Eraser className="h-3 w-3 mr-1" />
                        Terug
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllDarts}
                        className="h-8 px-2 text-xs"
                      >
                        Wissen
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3 px-4">
                {message && (
                  <div className={`p-3 rounded-lg text-center text-sm font-medium ${
                    message.includes('busten') || message.includes('Ongeldige') || message.includes('fout')
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : message.includes('gewonnen') || message.includes('🎉')
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-900'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Current Round Info */}
                {currentPlayer.currentDarts.length > 0 && (
                  <div className="p-3 rounded-lg border-2" style={{ 
                    backgroundColor: getAccentColorClassWithOpacity(accentColor, 0.1),
                    borderColor: getAccentColorClass(accentColor)
                  }}>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium" style={{ color: getAccentTextColor(accentColor) }}>
                        Beurt: <strong>{formatDartScores(currentPlayer.currentDarts)}</strong>
                      </span>
                      <span className={`font-medium ${getAccentTextColor(accentColor)}`}>
                        Rest: <strong>{currentPlayer.score - currentPlayer.currentDarts.reduce((a, b) => a + b, 0)}</strong>
                      </span>
                    </div>
                  </div>
                )}

                {/* Input Method: Per Dart */}
                {inputMethod === 'per-dart' && (
                  <DartsKeypad
                    onScore={handlePerDartScore}
                    onClear={clearAllDarts}
                    disabled={gameFinished}
                    accentColor={accentColor}
                  />
                )}

                {/* Input Method: 3 Darts + Confirm */}
                {inputMethod === '3-darts' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="relative">
                          <label className="text-[10px] text-slate-500 absolute -top-1.5 left-2 bg-white px-1">
                            Dart {i + 1}
                          </label>
                          <input
                            type="number"
                            value={currentPlayer.currentDarts[i] || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              if (val >= 0 && val <= 180) {
                                const newPlayers = [...players];
                                const currentDarts = [...newPlayers[currentPlayerIndex].currentDarts];
                                currentDarts[i] = val;
                                newPlayers[currentPlayerIndex].currentDarts = currentDarts;
                                setPlayers(newPlayers);
                                setMessage('');
                              }
                            }}
                            placeholder="0"
                            className="w-full text-center text-xl font-bold p-3 pt-5 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all"
                            style={{
                              borderColor: currentPlayer.currentDarts[i] ? getAccentColorClass(accentColor) : 'rgb(226, 232, 240)',
                              focusRingColor: getAccentColorClass(accentColor)
                            }}
                            disabled={gameFinished}
                          />
                        </div>
                      ))}
                    </div>
                    <Button
                      onClick={handleScoreSubmit}
                      size="lg"
                      className="w-full text-white font-semibold h-12 transition-all hover:scale-[1.02]"
                      style={{ backgroundColor: getAccentColorClass(accentColor) }}
                      disabled={gameFinished || currentPlayer.currentDarts.length === 0}
                    >
                      <Check className="h-5 w-5 mr-2" />
                      Bevestig Beurt ({currentPlayer.currentDarts.length}/3)
                    </Button>
                  </div>
                )}

                {/* Input Method: Direct Score */}
                {inputMethod === 'direct' && (
                  <NumberKeypad
                    onScore={handleDirectScore}
                    disabled={gameFinished}
                    accentColor={accentColor}
                  />
                )}

                {/* Check-out Suggestions */}
                {checkOut.length > 0 && (
                  <div className="p-4 rounded-xl border-2 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-300 shadow-sm">
                    <p className="text-sm font-bold text-amber-900 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center">
                        <Target className="h-3 w-3 text-amber-700" />
                      </div>
                      Check-out mogelijkheden ({currentPlayer.score}):
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
                      {checkOut.map((out, i) => (
                        <Badge 
                          key={i} 
                          variant="secondary" 
                          className={`text-xs font-mono py-2 px-3 hover:bg-white hover:shadow-md cursor-pointer transition-all border-amber-200 ${
                            i < 2 ? 'bg-white text-amber-900 font-bold' : 'bg-amber-100/70 text-amber-800'
                          }`}
                        >
                          {i < 2 && <Zap className="h-3 w-3 mr-1 inline text-amber-500" />}
                          {out}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
