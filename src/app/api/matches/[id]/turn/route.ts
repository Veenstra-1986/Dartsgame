import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

// POST - Add a turn to a match
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { darts } = body

    if (!darts || !Array.isArray(darts) || darts.length === 0 || darts.length > 3) {
      return NextResponse.json({ error: 'Invalid darts data' }, { status: 400 })
    }

    // Check if match exists and user is participant
    const match = await db.match.findUnique({
      where: { id: params.id },
      include: {
        turns: {
          orderBy: { turnOrder: 'desc' },
          take: 1
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (match.status !== 'IN_PROGRESS') {
      return NextResponse.json({ error: 'Match is not in progress' }, { status: 400 })
    }

    // Calculate turn score
    const turnScore = darts.reduce((sum: number, d: number) => sum + d, 0)

    // Determine turn order
    const turnOrder = match.turns.length > 0 ? match.turns[0].turnOrder + 1 : 1

    // Calculate remaining score
    const isPlayer1 = session.user.id === match.player1Id
    const currentScore = isPlayer1 ? (match.player1Score || 0) : (match.player2Score || 0)
    const newScore = currentScore - turnScore

    // Check for bust (below 0 or to 1 - can't checkout on 1)
    if (newScore < 0 || newScore === 1) {
      return NextResponse.json({ 
        error: 'BUST! Score would go below 0 or to 1',
        currentScore,
        turnScore
      }, { status: 400 })
    }

    // Check if last dart was a double for checkout
    const lastDart = darts[darts.length - 1]
    const isCheckout = newScore === 0 && lastDart % 2 === 0

    if (newScore === 0 && !isCheckout) {
      return NextResponse.json({ 
        error: 'Must finish on a double!',
        currentScore,
        turnScore
      }, { status: 400 })
    }

    // Update player score
    const updateData: any = {
      updatedAt: new Date()
    }

    if (isPlayer1) {
      updateData.player1Score = newScore
    } else {
      updateData.player2Score = newScore
    }

    // If checkout, set winner and complete match
    if (isCheckout) {
      updateData.status = 'COMPLETED'
      updateData.winnerId = session.user.id
      updateData.completedAt = new Date()
    }

    // Create turn and update match in transaction
    const result = await db.$transaction([
      db.match.update({
        where: { id: params.id },
        data: updateData
      }),
      db.matchTurn.create({
        data: {
          matchId: params.id,
          playerId: session.user.id,
          turnOrder,
          score: turnScore,
          darts
        }
      })
    ])

    const updatedMatch = await db.match.findUnique({
      where: { id: params.id },
      include: {
        player1: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        },
        player2: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        },
        turns: {
          include: {
            player: {
              select: { id: true, name: true, nickname: true, initials: true }
            }
          },
          orderBy: { turnOrder: 'asc' }
        }
      }
    })

    return NextResponse.json({ match: updatedMatch, turn: result[1], isCheckout })
  } catch (error) {
    console.error('Error adding turn:', error)
    return NextResponse.json({ error: 'Failed to add turn' }, { status: 500 })
  }
}
