import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

// GET - Get match details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const match = await db.match.findUnique({
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
        },
        messages: {
          include: {
            player: {
              select: { id: true, name: true, nickname: true, avatar: true, initials: true }
            }
          },
          orderBy: { createdAt: 'asc' }
        },
        confirmations: {
          include: {
            player: {
              select: { id: true, name: true, nickname: true, initials: true }
            }
          }
        }
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // Check if user is a participant
    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(match)
  } catch (error) {
    console.error('Error fetching match:', error)
    return NextResponse.json({ error: 'Failed to fetch match' }, { status: 500 })
  }
}

// PUT - Update match (complete, cancel, etc.)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, winnerId, notes } = body

    // Check if match exists and user is participant
    const match = await db.match.findUnique({
      where: { id: params.id }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    let updateData: any = { updatedAt: new Date() }

    if (action === 'complete') {
      updateData.status = 'COMPLETED'
      updateData.completedAt = new Date()
      if (winnerId) {
        updateData.winnerId = winnerId
      }
    } else if (action === 'cancel') {
      updateData.status = 'CANCELLED'
      updateData.completedAt = new Date()
    } else if (action === 'dispute') {
      updateData.status = 'DISPUTED'
    } else if (notes !== undefined) {
      updateData.notes = notes
    }

    const updatedMatch = await db.match.update({
      where: { id: params.id },
      data: updateData,
      include: {
        player1: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        },
        player2: {
          select: { id: true, name: true, nickname: true, avatar: true, initials: true }
        }
      }
    })

    return NextResponse.json(updatedMatch)
  } catch (error) {
    console.error('Error updating match:', error)
    return NextResponse.json({ error: 'Failed to update match' }, { status: 500 })
  }
}
