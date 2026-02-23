'use client'

import { useEffect, useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Target, Swords, MessageSquare, Send, CheckCircle, XCircle, 
  AlertCircle, Clock, User, Trophy, ArrowRight, 
  TrendingUp, Minus, RefreshCw, LogOut, AlertTriangle 
} from 'lucide-react'

interface Player {
  id: string
  name: string
  nickname?: string
  avatar?: string
  initials?: string
}

interface Turn {
  id: string
  playerId: string
  player: Player
  turnOrder: number
  score: number
  darts: number[]
  createdAt: string
}

interface MatchMessage {
  id: string
  playerId: string
  player: Player
  message: string
  createdAt: string
}

interface Confirmation {
  id: string
  playerId: string
  player: Player
  confirmed: boolean
  disputed: boolean
  disputeReason?: string
  confirmedAt?: string
}

interface Match {
  id: string
  player1Id: string
  player2Id: string
  player1: Player
  player2: Player
  gameType: string
  player1Score: number
  player2Score: number
  status: 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'
  winnerId?: string
  notes?: string
  createdAt: string
  turns: Turn[]
  messages: MatchMessage[]
  confirmations: Confirmation[]
}

export default function MatchPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const params = useParams()
  const matchId = params.id as string

  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  // Turn input state
  const [dartScores, setDartScores] = useState<number[]>([])
  const [currentDartInput, setCurrentDartInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Chat state
  const [messageInput, setMessageInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [otherUserTyping, setOtherUserTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Typing timeout ref
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }

    fetchMatch()
    connectWebSocket()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [session, matchId])

  useEffect(() => {
    scrollToBottom()
  }, [match?.messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}`)
      if (!res.ok) {
        if (res.status === 401) router.push('/login')
        if (res.status === 404) setError('Wedstrijd niet gevonden')
        if (res.status === 403) setError('Geen toegang tot deze wedstrijd')
        setLoading(false)
        return
      }

      const data = await res.json()
      setMatch(data)
      setLoading(false)
    } catch (err) {
      console.error('Error fetching match:', err)
      setError('Kon wedstrijd niet laden')
      setLoading(false)
    }
  }

  const connectWebSocket = () => {
    // Only connect in development or if explicitly enabled
    // In production on Vercel, use polling fallback
    const socketInstance = io('/?XTransformPort=3004', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    })

    socketInstance.on('connect', () => {
      console.log('Connected to match service')
      setConnected(true)
      setSocket(socketInstance)
      socketInstance.emit('join-match', matchId)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from match service')
      setConnected(false)
    })

    socketInstance.on('turn-update', (turn: Turn) => {
      console.log('Turn update received:', turn)
      fetchMatch()
    })

    socketInstance.on('match-update', (updatedMatch: Match) => {
      console.log('Match update received:', updatedMatch)
      setMatch(updatedMatch)
    })

    socketInstance.on('chat-message', (message: MatchMessage) => {
      console.log('Chat message received:', message)
      fetchMatch()
    })

    socketInstance.on('typing', (data: { socketId: string, isTyping: boolean }) => {
      if (data.socketId !== socketInstance.id) {
        setOtherUserTyping(data.isTyping)
      }
    })

    socketInstance.on('confirmation-update', (confirmation: Confirmation) => {
      console.log('Confirmation update received:', confirmation)
      fetchMatch()
    })

    socketInstance.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err)
      setConnected(false)
    })
  }

  const getCurrentPlayer = () => {
    if (!match || !session) return null
    return match.player1Id === session.user.id ? match.player1 : match.player2
  }

  const getOpponent = () => {
    if (!match || !session) return null
    return match.player1Id === session.user.id ? match.player2 : match.player1
  }

  const isMyTurn = () => {
    if (!match || !session) return false
    const lastTurn = match.turns[match.turns.length - 1]
    if (!lastTurn) {
      // First turn - player 1 starts
      return match.player1Id === session.user.id
    }
    // Alternate turns
    return lastTurn.playerId !== session.user.id
  }

  const addDartScore = () => {
    const score = parseInt(currentDartInput)
    if (isNaN(score) || score < 0 || score > 180) {
      return
    }
    
    if (dartScores.length >= 3) {
      return
    }

    setDartScores([...dartScores, score])
    setCurrentDartInput('')
  }

  const removeLastDart = () => {
    if (dartScores.length > 0) {
      setDartScores(dartScores.slice(0, -1))
    }
  }

  const submitTurn = async () => {
    if (dartScores.length === 0 || isSubmitting) return

    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/matches/${matchId}/turn`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ darts: dartScores })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Fout bij toevoegen beurt')
        return
      }

      const data = await res.json()
      
      // Broadcast turn update via WebSocket
      if (socket) {
        socket.emit('turn-update', { matchId, turn: data.turn })
      }

      setDartScores([])
      setMatch(data.match)

      if (data.isCheckout) {
        alert('Checkout! 🎯 Je hebt gewonnen!')
      }
    } catch (err) {
      console.error('Error submitting turn:', err)
      alert('Kon beurt niet verzenden')
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmMatch = async () => {
    try {
      const res = await fetch(`/api/matches/${matchId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: true })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Fout bij bevestigen')
        return
      }

      const confirmation = await res.json()
      
      if (socket) {
        socket.emit('confirmation-update', { matchId, confirmation })
      }

      fetchMatch()
    } catch (err) {
      console.error('Error confirming match:', err)
      alert('Kon wedstrijd niet bevestigen')
    }
  }

  const disputeMatch = async (reason: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmed: false, disputeReason: reason })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Fout bij betwisten')
        return
      }

      const confirmation = await res.json()
      
      if (socket) {
        socket.emit('confirmation-update', { matchId, confirmation })
      }

      fetchMatch()
    } catch (err) {
      console.error('Error disputing match:', err)
      alert('Kon wedstrijd niet betwisten')
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || isSubmitting) return

    const message = messageInput.trim()
    setMessageInput('')
    setIsTyping(false)

    try {
      const res = await fetch(`/api/matches/${matchId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      if (!res.ok) {
        const error = await res.json()
        alert(error.error || 'Fout bij verzenden bericht')
        setMessageInput(message)
        return
      }

      const newMessage = await res.json()
      
      if (socket) {
        socket.emit('chat-message', { matchId, message: newMessage })
      }

      setMatch(prev => prev ? {
        ...prev,
        messages: [...prev.messages, newMessage]
      } : null)
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Kon bericht niet verzenden')
      setMessageInput(message)
    }
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      if (socket) {
        socket.emit('typing', { matchId, isTyping: true })
      }
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false)
      if (socket) {
        socket.emit('typing', { matchId, isTyping: false })
      }
    }, 2000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4a5568] mx-auto"></div>
          <p className="mt-4 text-[#4a5568]">Wedstrijd laden...</p>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-[#f7fafc] flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Fout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-[#4a5568] mb-4">{error || 'Wedstrijd niet gevonden'}</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Terug naar Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentPlayer = getCurrentPlayer()
  const opponent = getOpponent()
  const myTurn = isMyTurn()
  const myScore = match.player1Id === session!.user.id ? match.player1Score : match.player2Score
  const opponentScore = match.player1Id === session!.user.id ? match.player2Score : match.player1Score

  const myConfirmation = match.confirmations.find(c => c.playerId === session!.user.id)
  const opponentConfirmation = match.confirmations.find(c => c.playerId !== session!.user.id)

  return (
    <div className="min-h-screen bg-[#f7fafc]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <LogOut className="h-4 w-4 mr-2" />
                Verlaat
              </Button>
              <div>
                <h1 className="text-lg font-bold text-[#2d3748]">
                  {match.player1.nickname || match.player1.name} vs {match.player2.nickname || match.player2.name}
                </h1>
                <p className="text-xs text-[#4a5568]">
                  {match.gameType} • {new Date(match.createdAt).toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant={connected ? "default" : "secondary"}
                className={connected ? "bg-green-500" : ""}
              >
                {connected ? '● Live' : '● Offline'}
              </Badge>
              <Badge 
                variant={
                  match.status === 'IN_PROGRESS' ? 'default' :
                  match.status === 'COMPLETED' ? 'secondary' : 'destructive'
                }
              >
                {match.status === 'IN_PROGRESS' ? 'In Spel' :
                 match.status === 'COMPLETED' ? 'Voltooid' :
                 match.status === 'DISPUTED' ? 'Betwist' : 'Geannuleerd'}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Scorecard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scoreboard */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Live Scorebord
                </CardTitle>
                <CardDescription>
                  {match.status === 'IN_PROGRESS' && myTurn && 'Jouw beurt!' || 'Wacht op tegenstander...'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {/* Player 1 */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    match.player1Id === session!.user.id 
                      ? 'bg-[#2d3748] text-white border-[#2d3748]' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {match.player1.avatar ? (
                        <img src={match.player1.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm">
                          {match.player1.initials || match.player1.name.substring(0, 2)}
                        </div>
                      )}
                      <span className="font-semibold text-sm">
                        {match.player1.nickname || match.player1.name}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      {match.player1Score}
                    </div>
                    <div className="text-xs opacity-70">
                      {(match.player1Id === session!.user.id ? myScore : opponentScore) > 0 ? 'Rest' : 'Checkout!'}
                    </div>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-[#4a5568]">VS</div>
                      {match.winnerId && (
                        <Trophy className="h-8 w-8 text-yellow-500 mx-auto mt-2" />
                      )}
                    </div>
                  </div>

                  {/* Player 2 */}
                  <div className={`p-4 rounded-lg border-2 transition-all ${
                    match.player2Id === session!.user.id 
                      ? 'bg-[#2d3748] text-white border-[#2d3748]' 
                      : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {match.player2.avatar ? (
                        <img src={match.player2.avatar} alt="" className="w-8 h-8 rounded-full" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center font-bold text-sm">
                          {match.player2.initials || match.player2.name.substring(0, 2)}
                        </div>
                      )}
                      <span className="font-semibold text-sm">
                        {match.player2.nickname || match.player2.name}
                      </span>
                    </div>
                    <div className="text-4xl font-bold mb-1">
                      {match.player2Score}
                    </div>
                    <div className="text-xs opacity-70">
                      {(match.player2Id === session!.user.id ? myScore : opponentScore) > 0 ? 'Rest' : 'Checkout!'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Turn Input - Only show if it's your turn and match is in progress */}
            {match.status === 'IN_PROGRESS' && myTurn && (
              <Card className="border-[#4a5568] border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#2d3748]">
                    <TrendingUp className="h-5 w-5" />
                    Jouw Beurt
                  </CardTitle>
                  <CardDescription>
                    Voer je scores in voor de 3 pijlen
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Dart scores display */}
                  <div className="flex justify-center gap-4">
                    {[0, 1, 2].map((i) => (
                      <div 
                        key={i}
                        className={`w-20 h-20 rounded-lg flex items-center justify-center font-bold text-2xl border-2 transition-all ${
                          dartScores[i] !== undefined 
                            ? 'bg-[#2d3748] text-white border-[#2d3748]' 
                            : 'bg-gray-100 text-gray-400 border-gray-200'
                        }`}
                      >
                        {dartScores[i] !== undefined ? dartScores[i] : '-'}
                      </div>
                    ))}
                  </div>

                  {/* Current turn score */}
                  {dartScores.length > 0 && (
                    <div className="text-center">
                      <div className="text-sm text-[#4a5568]">Totaal deze beurt</div>
                      <div className="text-3xl font-bold text-[#2d3748]">
                        {dartScores.reduce((a, b) => a + b, 0)}
                      </div>
                      {myScore - dartScores.reduce((a, b) => a + b, 0) > 0 && (
                        <div className="text-sm text-[#4a5568]">
                          Nieuwe rest: <span className="font-bold">{myScore - dartScores.reduce((a, b) => a + b, 0)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Score input */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={currentDartInput}
                      onChange={(e) => setCurrentDartInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addDartScore()
                      }}
                      placeholder="Score (0-180)"
                      min={0}
                      max={180}
                      disabled={dartScores.length >= 3 || isSubmitting}
                      className="text-lg text-center"
                    />
                    <Button 
                      onClick={addDartScore}
                      disabled={dartScores.length >= 3 || isSubmitting}
                      className="bg-[#4a5568] hover:bg-[#2d3748]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Voeg Toe
                    </Button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={removeLastDart}
                      variant="outline"
                      disabled={dartScores.length === 0 || isSubmitting}
                      className="flex-1"
                    >
                      <Minus className="h-4 w-4 mr-2" />
                      Ongedaan
                    </Button>
                    <Button 
                      onClick={submitTurn}
                      disabled={dartScores.length === 0 || isSubmitting}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Beurt Indienen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Turn History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Beurt Geschiedenis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {match.turns.length === 0 ? (
                  <p className="text-center py-8 text-[#4a5568]">Nog geen beurten</p>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {match.turns.slice().reverse().map((turn) => (
                      <div 
                        key={turn.id}
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          turn.playerId === session!.user.id 
                            ? 'bg-[#2d3748]/5 border-[#2d3748]' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="font-mono text-sm font-semibold">
                            #{turn.turnOrder}
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {turn.player.nickname || turn.player.name}
                            </div>
                            <div className="text-xs text-[#4a5568]">
                              {turn.darts.join(' + ')} = {turn.score}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-[#4a5568]" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Score Confirmation */}
            {match.status === 'COMPLETED' && (
              <Card className="border-yellow-500 border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <AlertTriangle className="h-5 w-5" />
                    Bevestig Score
                  </CardTitle>
                  <CardDescription>
                    Bevestig dat de score correct is om fraude te voorkomen
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* My confirmation status */}
                      <div className="p-4 rounded-lg border">
                        <div className="flex items-center gap-2 mb-2">
                          {myConfirmation?.confirmed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : myConfirmation?.disputed ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className="font-semibold">Jouw bevestiging</span>
                        </div>
                        {myConfirmation?.confirmed && (
                          <p className="text-sm text-green-700">Je hebt bevestigd</p>
                        )}
                        {myConfirmation?.disputed && (
                          <p className="text-sm text-red-700">Je hebt betwist: {myConfirmation.disputeReason}</p>
                        )}
                        {!myConfirmation && (
                          <div className="space-y-2">
                            <Button 
                              onClick={confirmMatch}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                              disabled={isSubmitting}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Bevestig Score
                            </Button>
                            <Button 
                              onClick={() => {
                                const reason = prompt('Waarom betwist je deze score?')
                                if (reason) disputeMatch(reason)
                              }}
                              variant="destructive"
                              className="w-full"
                              disabled={isSubmitting}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Betwist Score
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Opponent confirmation status */}
                      <div className="p-4 rounded-lg border bg-gray-50">
                        <div className="flex items-center gap-2 mb-2">
                          {opponentConfirmation?.confirmed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : opponentConfirmation?.disputed ? (
                            <XCircle className="h-5 w-5 text-red-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-yellow-600" />
                          )}
                          <span className="font-semibold">
                            {opponent?.nickname || opponent?.name}
                          </span>
                        </div>
                        {opponentConfirmation?.confirmed && (
                          <p className="text-sm text-green-700">Heeft bevestigd</p>
                        )}
                        {opponentConfirmation?.disputed && (
                          <p className="text-sm text-red-700">Heeft betwist: {opponentConfirmation.disputeReason}</p>
                        )}
                        {!opponentConfirmation && (
                          <p className="text-sm text-yellow-700">Wacht op bevestiging...</p>
                        )}
                      </div>
                    </div>

                    {match.status === 'DISPUTED' && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-800 font-medium">
                          ⚠️ Deze wedstrijd wordt betwist. Een admin zal dit beoordelen.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Chat */}
          <div className="space-y-6">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Chat
                </CardTitle>
                {otherUserTyping && (
                  <p className="text-sm text-[#4a5568]">Typend...</p>
                )}
              </CardHeader>
              <CardContent className="flex-1 flex flex-col min-h-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {match.messages.length === 0 ? (
                    <p className="text-center py-8 text-[#4a5568] text-sm">
                      Nog geen berichten. Stel een vraag of moedig je tegenstander aan!
                    </p>
                  ) : (
                    match.messages.map((msg) => {
                      const isMyMessage = msg.playerId === session!.user.id
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-[80%] ${
                            isMyMessage 
                              ? 'bg-[#2d3748] text-white' 
                              : 'bg-gray-200 text-[#2d3748]'
                          } rounded-lg p-3`}>
                            {!isMyMessage && (
                              <div className="text-xs font-semibold mb-1 opacity-70">
                                {msg.player.nickname || msg.player.name}
                              </div>
                            )}
                            <p className="text-sm">{msg.message}</p>
                            <div className={`text-xs mt-1 ${isMyMessage ? 'opacity-70' : 'opacity-50'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString('nl-NL', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value)
                      handleTyping()
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        sendMessage()
                      }
                    }}
                    placeholder="Typ een bericht..."
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <Button 
                    onClick={sendMessage}
                    disabled={!messageInput.trim() || isSubmitting}
                    size="icon"
                    className="bg-[#4a5568] hover:bg-[#2d3748]"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Match Notes */}
            {match.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Notities</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#4a5568]">{match.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Plus({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  )
}
