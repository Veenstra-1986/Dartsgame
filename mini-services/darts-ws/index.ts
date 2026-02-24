import { createServer } from 'http'
import { Server } from 'socket.io'

const PORT = 3003
const httpServer = createServer()
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

// Store connected clients
const connectedClients = new Map<string, any>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Store client
  connectedClients.set(socket.id, {
    connectedAt: new Date(),
    playerId: null
  })

  // Handle player identification
  socket.on('identify', (data: { playerId: string }) => {
    const client = connectedClients.get(socket.id)
    if (client) {
      client.playerId = data.playerId
      console.log(`Client ${socket.id} identified as player: ${data.playerId}`)
    }
  })

  // Handle score submission notification
  socket.on('score-submitted', (data: { playerId: string, challengeId: string, score: number }) => {
    console.log(`Score submitted by player ${data.playerId}: ${data.score}`)
    
    // Broadcast to all connected clients
    io.emit('leaderboard-update', {
      type: 'new-score',
      data: {
        playerId: data.playerId,
        challengeId: data.challengeId,
        score: data.score,
        timestamp: new Date().toISOString()
      }
    })
  })

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    connectedClients.delete(socket.id)
  })

  // Send current connection count
  socket.emit('connected', {
    message: 'Connected to Darts WebSocket Service',
    timestamp: new Date().toISOString()
  })
})

// Start server
httpServer.listen(PORT, () => {
  console.log(`🎯 Darts WebSocket Service running on port ${PORT}`)
  console.log(`   Socket.IO endpoint: ws://localhost:${PORT}`)
})

// Broadcast periodic leaderboard updates (every 30 seconds)
setInterval(() => {
  const activeUsers = connectedClients.size
  io.emit('ping', {
    activeUsers,
    timestamp: new Date().toISOString()
  })
}, 30000)
