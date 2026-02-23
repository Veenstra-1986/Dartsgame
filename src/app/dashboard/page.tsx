"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { 
  Trophy, Target, TrendingUp, Award, Crosshair, 
  Calendar, User, LogOut, ArrowRight, Swords, 
  Medal, Flame, Zap, BarChart3, CheckCircle, 
  X, Edit2, Play, Plus, Clock, Users, RefreshCw
} from "lucide-react"
import Link from "next/link"

interface UserStats {
  totalGames: number
  averageScore: number
  bestScore: number
  bestCheckout: string
  rank: number
  totalPlayers: number
  recentScores: any[]
  trend: number
  bestAverage: number
}

interface Match {
  id: string
  player1: any
  player2: any
  gameType: string
  player1Score: number
  player2Score: number
  status: string
  winnerId?: string
  createdAt: string
  _count: {
    turns: number
    messages: number
  }
}

interface OtherUser {
  id: string
  name: string
  nickname?: string
  initials?: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<UserStats | null>(null)
  const [matches, setMatches] = useState<Match[]>([])
  const [allUsers, setAllUsers] = useState<OtherUser[]>([])
  const [loading, setLoading] = useState(true)
  
  // Create match modal state
  const [showCreateMatch, setShowCreateMatch] = useState(false)
  const [selectedOpponent, setSelectedOpponent] = useState('')
  const [selectedGameType, setSelectedGameType] = useState('501')
  const [isCreatingMatch, setIsCreatingMatch] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (session?.user) {
      fetchStats()
      fetchMatches()
      fetchAllUsers()
    }
  }, [session])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/user/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/matches?status=IN_PROGRESS")
      if (res.ok) {
        const data = await res.json()
        setMatches(data)
      }
    } catch (error) {
      console.error("Error fetching matches:", error)
    }
  }

  const fetchAllUsers = async () => {
    try {
      const res = await fetch("/api/users")
      if (res.ok) {
        const data = await res.json()
        // Filter out current user
        const otherUsers = data.filter((u: OtherUser) => u.id !== session?.user?.id)
        setAllUsers(otherUsers)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMatch = async () => {
    if (!selectedOpponent) {
      alert('Selecteer een tegenstander')
      return
    }

    setIsCreatingMatch(true)
    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player2Id: selectedOpponent,
          gameType: selectedGameType
        })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Kon wedstrijd niet starten')
        return
      }

      const match = await res.json()
      setShowCreateMatch(false)
      setSelectedOpponent('')
      router.push(`/matches/${match.id}`)
    } catch (error) {
      console.error('Error creating match:', error)
      alert('Kon wedstrijd niet starten')
    } finally {
      setIsCreatingMatch(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7fafc]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d3748] mx-auto mb-4"></div>
          <p className="text-[#4a5568]">Laden...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <header className="bg-[#2d3748] text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-[#2d3748]" />
                </div>
                <div>
                  <h1 className="font-bold text-lg">Marimecs</h1>
                  <p className="text-xs text-gray-300">MARITIME EXCELLENCE</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="w-10 h-10 bg-[#4a5568] rounded-full flex items-center justify-center font-bold">
                  {session.user.image ? (
                    <img 
                      src={session.user.image} 
                      alt={session.user.name || ""} 
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(session.user.name || "")
                  )}
                </div>
                <div className="text-right">
                  <p className="font-medium">{session.user.name}</p>
                  <p className="text-xs text-gray-300">{session.user.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-white hover:bg-[#4a5568]"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Uitloggen
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#2d3748] mb-2">
            Welkom terug, {session.user?.name?.split(" ")[0]}! 👋
          </h2>
          <p className="text-[#4a5568]">
            Hier zie je statistieken en voortgang.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Key Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="h-5 w-5 opacity-80" />
                    <span className="text-xs opacity-80">Rank</span>
                  </div>
                  <div className="text-3xl font-bold">#{stats?.rank || "-"}</div>
                  <div className="text-xs opacity-80 mt-1">
                    van {stats?.totalPlayers || "-"} spelers
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Target className="h-5 w-5 opacity-80" />
                    <span className="text-xs opacity-80">Best Score</span>
                  </div>
                  <div className="text-3xl font-bold">{stats?.bestScore || 0}</div>
                  <div className="text-xs opacity-80 mt-1">
                    totaal
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="h-5 w-5 opacity-80" />
                    <span className="text-xs opacity-80">Gemiddelde</span>
                  </div>
                  <div className="text-3xl font-bold">{stats?.averageScore ? stats.averageScore.toFixed(0) : 0}</div>
                  <div className="text-xs opacity-80 mt-1">
                    per game
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Flame className="h-5 w-5 opacity-80" />
                    <span className="text-xs opacity-80">Games</span>
                  </div>
                  <div className="text-3xl font-bold">{stats?.totalGames || 0}</div>
                  <div className="text-xs opacity-80 mt-1">
                    gespeeld
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Best Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2d3748]">
                  <Award className="h-5 w-5 text-yellow-600" />
                  Beste Prestaties
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Zap className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2d3748]">Beste Checkout</p>
                      <p className="text-sm text-[#4a5568]">Succesvolste uitcheck</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {stats?.bestCheckout || "Nog geen"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2d3748]">Hoogste Average</p>
                      <p className="text-sm text-[#4a5568]">Per beurt in wedstrijden</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {stats?.bestAverage ? stats.bestAverage.toFixed(1) : 0}
                  </Badge>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-[#2d3748]">Verbetering</p>
                      <p className="text-sm text-[#4a5568]">Trend laatste 10 games</p>
                    </div>
                  </div>
                  <Badge className={stats?.trend >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {stats?.trend !== undefined && stats.trend >= 0 ? "+" : ""}
                    {stats?.trend !== undefined ? stats.trend.toFixed(1) : 0}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Active Matches */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-[#2d3748]">
                  <div className="flex items-center gap-2">
                    <Swords className="h-5 w-5" />
                    Actieve Wedstrijden
                  </div>
                  <Button 
                    onClick={() => setShowCreateMatch(true)}
                    size="sm"
                    className="bg-[#4a5568] hover:bg-[#2d3748]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nieuw
                  </Button>
                </CardTitle>
                <CardDescription>
                  Wedstrijden die nu gaande zijn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-8 text-[#4a5568]">
                    <Swords className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>Geen actieve wedstrijden</p>
                    <Button 
                      onClick={() => setShowCreateMatch(true)}
                      variant="outline" 
                      className="mt-4"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Start een wedstrijd
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {matches.map((match) => {
                      const isPlayer1 = match.player1.id === session?.user?.id
                      const opponent = isPlayer1 ? match.player2 : match.player1
                      const myScore = isPlayer1 ? match.player1Score : match.player2Score
                      const opponentScore = isPlayer1 ? match.player2Score : match.player1Score
                      
                      return (
                        <Link key={match.id} href={`/matches/${match.id}`}>
                          <div className="p-4 bg-[#f7fafc] rounded-lg border border-gray-200 hover:border-[#2d3748] hover:shadow-md transition-all cursor-pointer">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                                  opponent.avatar ? '' : 'bg-[#2d3748] text-white'
                                }`}>
                                  {opponent.avatar ? (
                                    <img src={opponent.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                                  ) : (
                                    opponent.initials || opponent.name.substring(0, 2)
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-[#2d3748]">
                                    {opponent.nickname || opponent.name}
                                  </p>
                                  <p className="text-xs text-[#4a5568]">
                                    {match.gameType} • {new Date(match.createdAt).toLocaleDateString('nl-NL')}
                                  </p>
                                </div>
                              </div>
                              <Badge className={match.winnerId ? 'bg-green-600' : 'bg-blue-600'}>
                                {match.winnerId ? 'Voltooid' : 'In Spel'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-4">
                                <span className="text-[#4a5568]">Jij: <strong className="text-[#2d3748]">{myScore}</strong></span>
                                <span className="text-[#4a5568]">Tegenstander: <strong className="text-[#2d3748]">{opponentScore}</strong></span>
                              </div>
                              <ArrowRight className="h-4 w-4 text-[#4a5568]" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Scores */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2d3748]">
                  <Calendar className="h-5 w-5" />
                  Recent Scores
                </CardTitle>
                <CardDescription>
                  Je laatste 5 scores
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentScores && stats.recentScores.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentScores.map((score: any, index: number) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 bg-[#f7fafc] rounded-lg hover:bg-[#edf2f7] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            index === 0 ? "bg-yellow-500 text-white" : "bg-[#2d3748] text-white"
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-[#2d3748]">{score.challengeName}</p>
                            <p className="text-xs text-[#4a5568]">
                              {new Date(score.submittedAt).toLocaleDateString("nl-NL", {
                                day: "numeric",
                                month: "short"
                              })}
                            </p>
                          </div>
                        </div>
                        <Badge className="bg-[#2d3748] text-white">
                          {score.score}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-[#4a5568]">
                    <Target className="h-12 w-12 mx-auto mb-3 opacity-40" />
                    <p>Geen scores nog. Doe mee met een challenge!</p>
                    <Link href="/" className="inline-flex items-center gap-2 mt-4 text-[#2d3748] hover:underline">
                      Naar Challenges
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2d3748]">
                  <Play className="h-5 w-5" />
                  Snel Starten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/" className="block">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Target className="h-4 w-4 mr-2" />
                    Doe mee met Daily Challenge
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/matches/new" className="block">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Swords className="h-4 w-4 mr-2" />
                    Start Onderlinge Wedstrijd
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/training" className="block">
                  <Button variant="outline" className="w-full justify-start text-left">
                    <Crosshair className="h-4 w-4 mr-2" />
                    Oefen Training Games
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Other Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-[#2d3748]">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Andere Spelers
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchAllUsers}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Start een wedstrijd met een andere speler
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allUsers.length === 0 ? (
                  <p className="text-center py-4 text-sm text-[#4a5568]">
                    Geen andere spelers gevonden
                  </p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allUsers.slice(0, 5).map((user) => (
                      <Button
                        key={user.id}
                        variant="outline"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setSelectedOpponent(user.id)
                          setShowCreateMatch(true)
                        }}
                      >
                        <div className="w-8 h-8 rounded-full bg-[#2d3748] text-white flex items-center justify-center text-xs font-bold mr-2">
                          {user.initials || user.name.substring(0, 2)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-sm">{user.nickname || user.name}</div>
                        </div>
                        <Swords className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#2d3748]">
                  <Medal className="h-5 w-5 text-yellow-600" />
                  Prestaties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-[#4a5568]">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>First Score Ingediend</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-[#4a5568]">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>First Wedstrijd Voltooid</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <X className="h-5 w-5" />
                    <span>Top 10 Speler</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Create Match Modal */}
      {showCreateMatch && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Nieuwe Wedstrijd Starten
                </div>
                <Button variant="ghost" size="sm" onClick={() => setShowCreateMatch(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>
                Kies een tegenstander en speltype
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tegenstander</Label>
                <select 
                  value={selectedOpponent}
                  onChange={(e) => setSelectedOpponent(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md bg-white"
                >
                  <option value="">Selecteer een speler...</option>
                  {allUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nickname || user.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Spel Type</Label>
                <select 
                  value={selectedGameType}
                  onChange={(e) => setSelectedGameType(e.target.value)}
                  className="w-full mt-2 p-2 border rounded-md bg-white"
                >
                  <option value="301">301</option>
                  <option value="501">501</option>
                  <option value="701">701</option>
                  <option value="cricket">Cricket</option>
                  <option value="practice">Oefenwedstrijd</option>
                </select>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateMatch(false)}
                  className="flex-1"
                  disabled={isCreatingMatch}
                >
                  Annuleren
                </Button>
                <Button 
                  onClick={handleCreateMatch}
                  className="flex-1 bg-[#4a5568] hover:bg-[#2d3748]"
                  disabled={!selectedOpponent || isCreatingMatch}
                >
                  {isCreatingMatch ? 'Starten...' : 'Start Wedstrijd'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
