import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'

// POST - Confirm or dispute a match score
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
    const { confirmed, disputeReason } = body

    // Check if match exists and user is participant
    const match = await db.match.findUnique({
      where: { id: params.id },
      include: {
        confirmations: true
      }
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (match.player1Id !== session.user.id && match.player2Id !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if user already confirmed
    const existingConfirmation = match.confirmations.find(
      c => c.playerId === session.user.id
    )

    if (existingConfirmation) {
      return NextResponse.json({ error: 'Already confirmed' }, { status: 400 })
    }

    // Create or update confirmation
    const confirmation = await db.scoreConfirmation.create({
      data: {
        matchId: params.id,
        playerId: session.user.id,
        confirmed: confirmed !== false,
        disputed: confirmed === false,
        disputeReason: disputeReason || null,
        confirmedAt: confirmed ? new Date() : null
      }
    })

    // Check if both players have confirmed
    const confirmations = await db.scoreConfirmation.findMany({
      where: { matchId: params.id }
    })

    if (confirmations.length === 2) {
      const allConfirmed = confirmations.every(c => c.confirmed)
      const anyDisputed = confirmations.some(c => c.disputed)

      let updateData: any = { updatedAt: new Date() }

      if (anyDisputed) {
        updateData.status = 'DISPUTED'
      } else if (allConfirmed && match.status === 'COMPLETED') {
        // Match is already complete, both confirmed - final confirmation
        updateData.status = 'COMPLETED'
      }

      await db.match.update({
        where: { id: params.id },
        data: updateData
      })
    }

    return NextResponse.json(confirmation)
  } catch (error) {
    console.error('Error confirming match:', error)
    return NextResponse.json({ error: 'Failed to confirm match' }, { status: 500 })
  }
}
