'use client';

import { useState, useEffect } from 'react';
import { Target, RotateCcw, Check, Eraser, Trophy, Play, Edit2, ChevronDown, ChevronUp, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DartsKeypad } from '@/components/darts-keypad';
import { NumberKeypad } from '@/components/number-keypad';
import { MobileNav } from '@/components/mobile-nav';
import { useSettings } from '@/contexts/settings-context';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const [gameType, setGameType] = useState<GameType>('501');
  const [inputMethod, setInputMethod] = useState<InputMethod>('per-dart');
  const [players, setPlayers] = useState<Player[]>([
    { id: '1', name: 'Speler 1', score: 501, history: [], currentDarts: [], darts: 0, finished: false },
    { id: '2', name: 'Speler 2', score: 501, history: [], currentDarts: [], darts: 0, finished: false },
  ]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [checkOut, setCheckOut] = useState<string[]>([]);
  const [inputPanelOpen, setInputPanelOpen] = useState(true);
  const [editNameDialog, setEditNameDialog] = useState<{ open: boolean; playerId: string | null; name: string }>({ open: false, playerId: null, name: '' });
  const [editScoreDialog, setEditScoreDialog] = useState<{ open: boolean; playerId: string | null; roundIndex: number | null; dartIndex: number | null; value: string }>({ open: false, playerId: null, roundIndex: null, dartIndex: null, value: '' });

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

    return [...new Set(outs)].slice(0, 6);
  };

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
  }, [gameType]);

  // Reset current round when input method changes
  useEffect(() => {
    const newPlayers = [...players];
    newPlayers[currentPlayerIndex].currentDarts = [];
    setPlayers(newPlayers);
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
      setMessage(`${score} zou je busten!`);
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
      setMessage(`🎉 ${player.name} wint!`);
    }

    player.score = newScore;
    player.history.push([...darts]);
    player.darts += 3;
    player.currentDarts = [];

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
      setMessage(`🎉 ${player.name} wint!`);
    }

    player.score = newScore;
    player.history.push([[score]]);
    player.darts += 3;
    player.currentDarts = [];

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
        setMessage('Geen geldige uitworp!');
        return;
      }

      if (newScore === 0) {
        player.finished = true;
        setMessage(`🎉 ${player.name} wint!`);
      }

      player.score = newScore;
      player.history.push([...player.currentDarts]);
      player.darts += player.currentDarts.length;
      player.currentDarts = [];
    }

    setPlayers(newPlayers);

    if (!newPlayers[currentPlayerIndex].finished) {
      setCurrentPlayerIndex((currentPlayerIndex + 1) % players.length);
    }
  };

  const formatDartScores = (darts: number[]) => {
    return darts.map((score) => {
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
  };

  const handleEditPlayerName = () => {
    if (!editNameDialog.playerId || !editNameDialog.name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Fout',
        description: 'Voer een geldige naam in'
      });
      return;
    }

    const newPlayers = [...players];
    const player = newPlayers.find(p => p.id === editNameDialog.playerId);
    if (player) {
      player.name = editNameDialog.name;
      setPlayers(newPlayers);
      toast({
        title: 'Naam gewijzigd',
        description: `Speler heet nu ${player.name}`
      });
    }
    setEditNameDialog({ open: false, playerId: null, name: '' });
  };

  const handleEditScore = () => {
    if (!editScoreDialog.playerId || editScoreDialog.roundIndex === null) return;

    const newScore = parseInt(editScoreDialog.value);
    if (isNaN(newScore) || newScore < 0 || newScore > 180) {
      toast({
        variant: 'destructive',
        title: 'Ongeldige score',
        description: 'Voer een score tussen 0 en 180 in'
      });
      return;
    }

    const newPlayers = [...players];
    const player = newPlayers.find(p => p.id === editScoreDialog.playerId);

    if (player && editScoreDialog.roundIndex !== null && player.history[editScoreDialog.roundIndex]) {
      if (editScoreDialog.dartIndex !== null && editScoreDialog.dartIndex !== -1) {
        const oldScore = player.history[editScoreDialog.roundIndex][editScoreDialog.dartIndex];
        player.history[editScoreDialog.roundIndex][editScoreDialog.dartIndex] = newScore;
        const roundDiff = newScore - oldScore;
        player.score -= roundDiff;
      } else if (editScoreDialog.dartIndex === -1) {
        const oldTotal = player.history[editScoreDialog.roundIndex].reduce((a, b) => a + b, 0);
        const diff = newScore - oldTotal;
        player.score -= diff;
        const numDarts = player.history[editScoreDialog.roundIndex].length;
        for (let i = 0; i < numDarts; i++) {
          player.history[editScoreDialog.roundIndex][i] = Math.floor(newScore / numDarts);
        }
        player.history[editScoreDialog.roundIndex][0] += newScore % numDarts;
      }
      setPlayers(newPlayers);
      toast({
        title: 'Score gewijzigd',
        description: 'De score is succesvol aangepast'
      });
    }
    setEditScoreDialog({ open: false, playerId: null, roundIndex: null, dartIndex: null, value: '' });
  };

  const currentPlayer = players[currentPlayerIndex];
  const gameFinished = players.some(p => p.finished);
  const roundTotal = currentPlayer.currentDarts.reduce((a, b) => a + b, 0);

  return (
    <div className="h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 overflow-hidden">
      {/* Header - Ultra Compact */}
      <header className="flex-shrink-0 border-b bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm">
        <div className="px-3 py-2">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                <Target className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-bold text-slate-900 dark:text-white leading-tight truncate">
                  {preferences.groupName || 'DartsPro'}
                </h1>
              </div>
            </Link>
            
            {/* Game Type & Input Method Together */}
            <div className="flex items-center gap-2">
              <Select value={gameType} onValueChange={(v) => setGameType(v as GameType)}>
                <SelectTrigger className="w-20 h-7 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="501">501</SelectItem>
                  <SelectItem value="301">301</SelectItem>
                  <SelectItem value="Cricket">Cricket</SelectItem>
                </SelectContent>
              </Select>
              <Select value={inputMethod} onValueChange={(v) => setInputMethod(v as InputMethod)}>
                <SelectTrigger className="w-20 h-7 text-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per-dart">Per Dart</SelectItem>
                  <SelectItem value="3-darts">3 Darts</SelectItem>
                  <SelectItem value="direct">Direct</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={resetGame}
                className="h-7 px-2 text-[10px]"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Score Cards - Side by Side, Compact */}
        <div className="flex-shrink-0 px-2 py-2">
          <div className="grid grid-cols-2 gap-2">
            {players.map((player, index) => {
              const isCurrentPlayer = index === currentPlayerIndex && !gameFinished;
              
              return (
                <Card
                  key={player.id}
                  className={`relative transition-all ${
                    isCurrentPlayer
                      ? 'border-2 shadow-lg'
                      : player.finished
                      ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border border-slate-200 dark:border-slate-800'
                  }`}
                  style={{
                    borderColor: isCurrentPlayer ? getAccentColorClass(accentColor) : undefined,
                  }}
                >
                  <CardHeader className="pb-1 px-2 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <p className={`font-bold truncate ${isCurrentPlayer ? 'text-sm' : 'text-xs'}`}>
                          {player.name}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 flex-shrink-0"
                          onClick={() => setEditNameDialog({ open: true, playerId: player.id, name: player.name })}
                        >
                          <Edit2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                      {isCurrentPlayer && (
                        <Badge className="animate-pulse text-white text-[9px] px-1.5 py-0.5" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                          Aan beurt
                        </Badge>
                      )}
                      {player.finished && (
                        <Badge className="bg-amber-500 text-white text-[9px] px-1.5 py-0.5">
                          <Trophy className="h-2 w-2 mr-0.5" />
                          Winst
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-2 pb-2">
                    <CardTitle
                      className={`font-bold leading-none text-center ${
                        isCurrentPlayer ? 'text-5xl' : 'text-2xl'
                      } ${
                        isCurrentPlayer
                          ? getAccentTextColor(accentColor)
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {player.score}
                    </CardTitle>
                    <div className="flex justify-between items-center mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                      <span>Darts: {player.darts}</span>
                      <span>
                        Avg: {player.darts > 0 
                          ? Math.round(
                              player.history.reduce((a, b) => a + b.reduce((x, y) => x + y, 0), 0) /
                              player.darts * 3
                            )
                          : 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Collapsible Input Panel with Score Info */}
        {!gameFinished && (
          <div className="flex-shrink-0 px-2 flex flex-col min-h-0">
            <Card className="flex flex-col flex-1 min-h-0 border-2">
              {/* Toggle Header with Current Player Info */}
              <button
                onClick={() => setInputPanelOpen(!inputPanelOpen)}
                className="flex items-center justify-between px-3 py-2 border-b bg-white/50 dark:bg-slate-800/50 hover:bg-white/80 dark:hover:bg-slate-800 transition-colors"
                style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor, 0.05) }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: getAccentColorClass(accentColor) }}>
                    <Play className="h-2.5 w-2.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white truncate">{currentPlayer.name}</span>
                      {currentPlayer.currentDarts.length > 0 && (
                        <span className={`font-bold text-xs flex-shrink-0 ${getAccentTextColor(accentColor)}`}>{roundTotal}</span>
                      )}
                    </div>
                    {currentPlayer.currentDarts.length > 0 && (
                      <div className="flex items-center gap-1">
                        {currentPlayer.currentDarts.map((score, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className={`text-[9px] px-1 py-0 bg-white dark:bg-slate-800 ${getAccentTextColor(accentColor)}`}
                          >
                            {score}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {(inputMethod === 'per-dart' || inputMethod === '3-darts') && currentPlayer.currentDarts.length > 0 && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); clearCurrentDart(); }}
                        className="h-5 w-5 p-0 text-[10px]"
                      >
                        <Eraser className="h-2.5 w-2.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); clearAllDarts(); }}
                        className="h-5 w-5 p-0 text-[10px]"
                      >
                        <X className="h-2.5 w-2.5" />
                      </Button>
                    </div>
                  )}
                  {inputPanelOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </button>

              {/* Expandable Content */}
              {inputPanelOpen && (
                <CardContent className="p-2 overflow-auto flex flex-col min-h-0">
                  {/* Message */}
                  {message && (
                    <div className={`p-1.5 rounded text-center text-[10px] font-medium mb-2 ${
                      message.includes('busten') || message.includes('Ongeldige')
                        ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400'
                        : message.includes('wint') || message.includes('🎉')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white'
                    }`}>
                      {message}
                    </div>
                  )}

                  {/* Remaining Score Display */}
                  {currentPlayer.currentDarts.length > 0 && (
                    <div className="flex items-center justify-center py-1.5 px-2 rounded-lg mb-2" style={{ backgroundColor: getAccentColorClassWithOpacity(accentColor, 0.15) }}>
                      <span className="text-[10px] text-slate-500 mr-2">Rest:</span>
                      <span className={`font-bold text-sm ${getAccentTextColor(accentColor)}`}>
                        {currentPlayer.score - roundTotal}
                      </span>
                    </div>
                  )}

                  {/* Check-out Suggestions - Compact */}
                  {checkOut.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {checkOut.map((out, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="bg-amber-100 text-amber-800 border-amber-300 text-[9px] font-mono py-0.5 px-1.5 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700"
                        >
                          {out}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Input Method: Per Dart */}
                  {inputMethod === 'per-dart' && (
                    <div className="flex-1 min-h-0">
                      <DartsKeypad
                        onScore={handlePerDartScore}
                        onClear={clearAllDarts}
                        disabled={gameFinished}
                        accentColor={accentColor}
                      />
                    </div>
                  )}

                  {/* Input Method: 3 Darts */}
                  {inputMethod === '3-darts' && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="relative">
                            <label className="text-[9px] text-slate-500 absolute -top-1 left-2 bg-white dark:bg-slate-900 px-0.5">
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
                              className="w-full text-center text-xl font-bold p-2 pt-4 border-2 rounded-lg focus:outline-none focus:ring-2 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                              style={{
                                borderColor: currentPlayer.currentDarts[i] ? getAccentColorClass(accentColor) : 'rgb(226, 232, 240)',
                              }}
                              disabled={gameFinished}
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={handleScoreSubmit}
                        size="lg"
                        className="w-full text-white font-semibold h-10 transition-all"
                        style={{ backgroundColor: getAccentColorClass(accentColor) }}
                        disabled={gameFinished || currentPlayer.currentDarts.length === 0}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Bevestig ({currentPlayer.currentDarts.length}/3)
                      </Button>
                    </div>
                  )}

                  {/* Input Method: Direct Score */}
                  {inputMethod === 'direct' && (
                    <div className="flex-1 min-h-0">
                      <NumberKeypad
                        onScore={handleDirectScore}
                        disabled={gameFinished}
                        accentColor={accentColor}
                      />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </main>

      {/* Edit Name Dialog */}
      <Dialog open={editNameDialog.open} onOpenChange={(open) => setEditNameDialog({ open, playerId: null, name: '' })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Naam wijzigen</DialogTitle>
            <DialogDescription>Voer de nieuwe naam van de speler in</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="player-name">Spelernaam</Label>
              <Input
                id="player-name"
                value={editNameDialog.name}
                onChange={(e) => setEditNameDialog({ ...editNameDialog, name: e.target.value })}
                placeholder="Naam van de speler"
                onKeyDown={(e) => e.key === 'Enter' && handleEditPlayerName()}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setEditNameDialog({ open: false, playerId: null, name: '' })}
                className="flex-1"
              >
                Annuleren
              </Button>
              <Button
                onClick={handleEditPlayerName}
                className="flex-1"
                style={{ backgroundColor: getAccentColorClass(accentColor) }}
              >
                Opslaan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mobile Navigation */}
      <MobileNav />
    </div>
  );
}
