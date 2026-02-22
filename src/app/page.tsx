'use client'

import { useEffect, useState, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Target, TrendingUp, Calendar, Crosshair, User, Play, Plus, Zap, Award, Flame, Anchor, Waves } from 'lucide-react'

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
  isCurrentUser?: boolean
}

interface Player {
  id: string
  name: string
  email?: string
  initials?: string
}

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
  const socketRef = useRef<Socket | null>(null)

  // Fetch data on mount
  useEffect(() => {
    fetchData()
  }, [])

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

  // WebSocket connection
  useEffect(() => {
    const socket = io('/?XTransformPort=3003', {
      transports: ['websocket', 'polling']
    })

    socketRef.current = socket

    socket.on('connect', () => {
      console.log('Connected to WebSocket service')
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket service')
      setIsConnected(false)
    })

    socket.on('leaderboard-update', (data: any) => {
      console.log('Leaderboard update received:', data)
      fetchData()
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  // Identify player when selected
  useEffect(() => {
    if (selectedPlayer && socketRef.current) {
      socketRef.current.emit('identify', { playerId: selectedPlayer })
    }
  }, [selectedPlayer])

  // Check if current player has submitted today
  useEffect(() => {
    if (selectedPlayer && currentChallenge) {
      checkSubmittedToday()
    }
  }, [selectedPlayer, currentChallenge])

  const checkSubmittedToday = async () => {
    try {
      const res = await fetch(`/api/scores/check?playerId=${selectedPlayer}&challengeId=${currentChallenge.id}`)
      if (res.ok) {
        const data = await res.json()
        setHasSubmittedToday(data.hasSubmitted)
      }
    } catch (error) {
      console.error('Error checking submission:', error)
    }
  }

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

  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlayer || !currentChallenge || !scoreInput.trim()) return

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          playerId: selectedPlayer,
          challengeId: currentChallenge.id,
          score: parseInt(scoreInput)
        })
      })

      if (res.ok) {
        setHasSubmittedToday(true)
        setScoreInput('')
        if (socketRef.current) {
          socketRef.current.emit('score-submitted', {
            playerId: selectedPlayer,
            challengeId: currentChallenge.id,
            score: parseInt(scoreInput)
          })
        }
        fetchData()
      }
    } catch (error) {
      console.error('Error submitting score:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'high_score': return <Target className="h-6 w-6" />
      case 'triple_20': return <Crosshair className="h-6 w-6" />
      case 'bullseye': return <Target className="h-6 w-6" />
      default: return <Trophy className="h-6 w-6" />
    }
  }

  const LeaderboardTable = ({ entries, title, icon: Icon }: { entries: LeaderboardEntry[], title: string, icon: any }) => {
    const medalColors = ['text-yellow-600', 'text-gray-400', 'text-amber-700']
    
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[#2d3748]" />
          <h3 className="font-semibold text-sm text-[#2d3748] uppercase tracking-wide">{title}</h3>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-2">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-[#4a5568]">
              <Award className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Nog geen scores</p>
            </div>
          ) : (
            entries.map((entry, index) => (
              <div
                key={index}
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
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][index] : entry.rank}
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
      </div>
    )
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  return (
    <div className="min-h-screen bg-[#ffffff]">
      {/* Header */}
      <header className="bg-[#f7fafc] border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Marimecs-style logo */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#2d3748] flex items-center justify-center">
                  <Anchor className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-[#2d3748] tracking-tight">
                    MARIMECS
                  </h1>
                  <p className="text-xs text-[#4a5568] flex items-center gap-1">
                    <Target className="h-3 w-3" />
                    Darts Challenge
                    {isConnected && <span className="text-green-600 ml-2">● Live</span>}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {players.length > 0 && (
                <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                  <SelectTrigger className="w-56 bg-white border-gray-300 text-[#2d3748]">
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
                    className="bg-white border-gray-300 text-[#2d3748] placeholder:text-gray-400 text-center mt-1.5"
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Challenge & Score Entry */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Challenge Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[#f7fafc] flex items-center justify-center border border-gray-200">
                      <Calendar className="h-6 w-6 text-[#2d3748]" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#2d3748] flex items-center gap-2">
                        Daily Challenge
                        <Badge className="bg-[#2d3748] text-white rounded-md">
                          Vandaag
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-[#4a5568]">
                        Gedeeld scoreboard voor alle leden
                      </CardDescription>
                    </div>
                  </div>
                  {currentChallenge && (
                    <Badge variant="outline" className="border-[#4a5568] text-[#4a5568] bg-[#f7fafc]">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(currentChallenge.date)}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {currentChallenge ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4 p-4 bg-[#f7fafc] rounded-lg border border-gray-200">
                      <div className="w-14 h-14 rounded-lg bg-[#2d3748] flex items-center justify-center flex-shrink-0">
                        {getChallengeIcon(currentChallenge.type)}
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-[#2d3748]">{currentChallenge.name}</h2>
                        <p className="text-[#4a5568] mt-1">{currentChallenge.description}</p>
                      </div>
                    </div>
                    {currentChallenge.targetValue && (
                      <div className="bg-[#f7fafc] p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-center gap-3">
                          <span className="text-[#4a5568] font-medium">🎯 Doelwaarde:</span>
                          <span className="text-3xl font-bold text-[#2d3748]">
                            {currentChallenge.targetValue}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 text-[#4a5568]">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg">Er is nog geen challenge voor vandaag.</p>
                    <p className="text-sm mt-2">Er wordt automatisch een nieuwe challenge aangemaakt.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Entry Card */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-[#2d3748] flex items-center gap-2">
                  <div className="w-10 h-10 rounded-lg bg-[#f7fafc] flex items-center justify-center border border-gray-200">
                    <TrendingUp className="h-5 w-5 text-[#2d3748]" />
                  </div>
                  Score Invoeren
                </CardTitle>
                <CardDescription className="text-[#4a5568]">
                  Voer je score in voor de daily challenge
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedPlayer ? (
                  <div className="text-center py-12 text-[#4a5568]">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p className="text-lg">Selecteer eerst een speler om je score in te voeren</p>
                  </div>
                ) : hasSubmittedToday ? (
                  <div className="text-center py-12 bg-[#f7fafc] rounded-lg border border-gray-200">
                    <Trophy className="h-12 w-12 mx-auto mb-3 text-[#2d3748]" />
                    <p className="text-xl font-semibold text-[#2d3748]">Score Ingevoerd! 🎯</p>
                    <p className="text-sm text-[#4a5568] mt-2">
                      Bekijk het leaderboard om je positie te zien
                    </p>
                  </div>
                ) : !currentChallenge ? (
                  <div className="text-center py-12 text-[#4a5568]">
                    <p>Er is nog geen challenge beschikbaar</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitScore} className="space-y-6">
                    <div>
                      <Label htmlFor="score" className="text-[#2d3748] text-base font-semibold">Je Score</Label>
                      <Input
                        id="score"
                        type="number"
                        value={scoreInput}
                        onChange={(e) => setScoreInput(e.target.value)}
                        placeholder="Voer je score in..."
                        min="0"
                        required
                        className="mt-2 text-3xl h-16 text-center bg-white border-2 border-gray-300 text-[#2d3748] placeholder:text-gray-400 font-semibold focus:border-[#4a5568] transition-all rounded-lg"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full h-14 text-lg font-semibold bg-[#4a5568] hover:bg-[#2d3748] text-white rounded-lg transition-colors"
                      disabled={isSubmitting}
                    >
                      <Play className="h-5 w-5 mr-2" />
                      {isSubmitting ? 'Versturen...' : 'Score Versturen 🎯'}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
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
                  <TabsList className="grid w-full grid-cols-3 bg-[#f7fafc] border border-gray-200">
                    <TabsTrigger value="today" className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md">Vandaag</TabsTrigger>
                    <TabsTrigger value="week" className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md">Week</TabsTrigger>
                    <TabsTrigger value="overall" className="data-[state=active]:bg-[#2d3748] data-[state=active]:text-white rounded-md">Totaal</TabsTrigger>
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

            {/* Quick Stats Card */}
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
                  <Badge variant="secondary" className="bg-[#2d3748]/10 text-[#2d3748] border-[#2d3748]/20 text-base px-3 py-1">
                    {players.length}
                  </Badge>
                </div>
                <Separator className="bg-gray-200" />
                <div className="flex justify-between items-center p-3 bg-[#f7fafc] rounded-lg">
                  <span className="text-sm text-[#4a5568]">Scores Vandaag</span>
                  <Badge variant="secondary" className="bg-[#2d3748]/10 text-[#2d3748] border-[#2d3748]/20 text-base px-3 py-1">
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
            © 2025 <span className="font-semibold">Marimecs</span> • Darts Challenge App
          </p>
          <p className="text-white/60 text-xs mt-2 flex items-center justify-center gap-2">
            <Anchor className="h-3 w-3" />
            Elke dag een nieuwe uitdaging! 🎯
          </p>
        </div>
      </footer>
    </div>
  )
}
