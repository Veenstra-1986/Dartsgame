import { Server as SocketIOServer } from 'socket.io'

const PORT = 3004

const io = new SocketIOServer(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

console.log(`Match service running on port ${PORT}`)

// Store active match rooms
const matchRooms = new Map<string, Set<string>>()

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`)

  // Join a match room
  socket.on('join-match', (matchId: string) => {
    socket.join(`match-${matchId}`)
    
    if (!matchRooms.has(matchId)) {
      matchRooms.set(matchId, new Set())
    }
    matchRooms.get(matchId)!.add(socket.id)
    
    console.log(`Socket ${socket.id} joined match ${matchId}`)
    
    // Notify others in the room
    socket.to(`match-${matchId}`).emit('player-joined', {
      socketId: socket.id,
      matchId
    })
  })

  // Leave a match room
  socket.on('leave-match', (matchId: string) => {
    socket.leave(`match-${matchId}`)
    
    if (matchRooms.has(matchId)) {
      matchRooms.get(matchId)!.delete(socket.id)
      if (matchRooms.get(matchId)!.size === 0) {
        matchRooms.delete(matchId)
      }
    }
    
    console.log(`Socket ${socket.id} left match ${matchId}`)
    
    // Notify others in the room
    socket.to(`match-${matchId}`).emit('player-left', {
      socketId: socket.id,
      matchId
    })
  })

  // Broadcast turn update
  socket.on('turn-update', (data: { matchId: string, turn: any }) => {
    socket.to(`match-${data.matchId}`).emit('turn-update', data.turn)
    console.log(`Turn update in match ${data.matchId}`)
  })

  // Broadcast match update
  socket.on('match-update', (data: { matchId: string, match: any }) => {
    socket.to(`match-${data.matchId}`).emit('match-update', data.match)
    console.log(`Match update in match ${data.matchId}`)
  })

  // Broadcast chat message
  socket.on('chat-message', (data: { matchId: string, message: any }) => {
    socket.to(`match-${data.matchId}`).emit('chat-message', data.message)
    console.log(`Chat message in match ${data.matchId}`)
  })

  // Typing indicator
  socket.on('typing', (data: { matchId: string, isTyping: boolean }) => {
    socket.to(`match-${data.matchId}`).emit('typing', {
      socketId: socket.id,
      isTyping: data.isTyping
    })
  })

  // Score confirmation update
  socket.on('confirmation-update', (data: { matchId: string, confirmation: any }) => {
    socket.to(`match-${data.matchId}`).emit('confirmation-update', data.confirmation)
    console.log(`Confirmation update in match ${data.matchId}`)
  })

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`)
    
    // Remove from all match rooms
    for (const [matchId, sockets] of matchRooms.entries()) {
      if (sockets.has(socket.id)) {
        sockets.delete(socket.id)
        socket.to(`match-${matchId}`).emit('player-left', {
          socketId: socket.id,
          matchId
        })
        
        if (sockets.size === 0) {
          matchRooms.delete(matchId)
        }
      }
    }
  })
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  io.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  io.close()
  process.exit(0)
})
