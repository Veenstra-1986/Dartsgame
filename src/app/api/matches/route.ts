import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

// POST - Create a new match
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { player2Id, gameType, notes } = body

    if (!player2Id || !gameType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    if (player2Id === session.user.id) {
      return NextResponse.json({ error: 'Cannot play against yourself' }, { status: 400 })
    }

    // Check if player 2 exists
    const player2 = await db.user.findUnique({
      where: { id: player2Id }
    })

    if (!player2) {
      return NextResponse.json({ error: 'Player 2 not found' }, { status: 404 })
    }

    // Set starting score based on game type
    const startScores: { [key: string]: number } = {
      '301': 301,
      '501': 501,
      '701': 701,
      'cricket': 0,
      'practice': 0
    }

    const startingScore = startScores[gameType] || 301

    const match = await db.match.create({
      data: {
        player1Id: session.user.id,
        player2Id,
        gameType,
        player1Score: startingScore,
        player2Score: startingScore,
        notes: notes || null,
        status: 'IN_PROGRESS'
      },
      include: {
        player1: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        },
        player2: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        }
      }
    })

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}

// GET - List matches for current user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where: any = {
      OR: [
        { player1Id: session.user.id },
        { player2Id: session.user.id }
      ]
    }

    if (status) {
      where.status = status
    }

    const matches = await db.match.findMany({
      where,
      include: {
        player1: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        },
        player2: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        },
        turns: {
          orderBy: { turnOrder: 'asc' }
        },
        _count: {
          select: { turns: true, messages: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(matches)
  } catch (error) {
    console.error('Error fetching matches:', error)
    return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
  }
}
