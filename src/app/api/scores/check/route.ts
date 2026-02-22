import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Check if player has submitted score for a challenge
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const playerId = searchParams.get('playerId')
    const challengeId = searchParams.get('challengeId')

    if (!playerId || !challengeId) {
      return NextResponse.json(
        { error: 'playerId and challengeId are required' },
        { status: 400 }
      )
    }

    const score = await db.score.findUnique({
      where: {
        playerId_challengeId: {
          playerId,
          challengeId
        }
      }
    })

    return NextResponse.json({
      hasSubmitted: !!score,
      score: score?.score || null
    })
  } catch (error) {
    console.error('Error checking score:', error)
    return NextResponse.json({ error: 'Failed to check score' }, { status: 500 })
  }
}
