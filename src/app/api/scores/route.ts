import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST create new score
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { playerId, challengeId, score, details } = body

    if (!playerId || !challengeId || score === undefined) {
      return NextResponse.json(
        { error: 'playerId, challengeId, and score are required' },
        { status: 400 }
      )
    }

    if (score < 0) {
      return NextResponse.json(
        { error: 'Score cannot be negative' },
        { status: 400 }
      )
    }

    // Check if player already submitted score for this challenge
    const existingScore = await db.score.findUnique({
      where: {
        playerId_challengeId: {
          playerId,
          challengeId
        }
      }
    })

    if (existingScore) {
      return NextResponse.json(
        { error: 'You have already submitted a score for this challenge' },
        { status: 400 }
      )
    }

    const newScore = await db.score.create({
      data: {
        playerId,
        challengeId,
        score: parseInt(score),
        details
      }
    })

    return NextResponse.json(newScore, { status: 201 })
  } catch (error) {
    console.error('Error creating score:', error)
    return NextResponse.json({ error: 'Failed to create score' }, { status: 500 })
  }
}
