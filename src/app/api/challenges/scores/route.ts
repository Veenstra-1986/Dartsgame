import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Submit a score for a challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, challengeId, score } = body;

    if (!userId || !challengeId || score === undefined) {
      return NextResponse.json(
        { error: 'userId, challengeId en score zijn verplicht' },
        { status: 400 }
      );
    }

    // Check if user already submitted a score for this challenge
    const existingScore = await db.challengeScore.findUnique({
      where: {
        userId_challengeId: {
          userId,
          challengeId
        }
      }
    });

    if (existingScore) {
      return NextResponse.json(
        { error: 'Je hebt al een score ingediend voor deze challenge' },
        { status: 400 }
      );
    }

    // Check if challenge is still valid
    const challenge = await db.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge niet gevonden' },
        { status: 404 }
      );
    }

    if (new Date() > new Date(challenge.expiresAt)) {
      return NextResponse.json(
        { error: 'Deze challenge is verlopen' },
        { status: 400 }
      );
    }

    if (new Date() < new Date(challenge.scheduledAt)) {
      return NextResponse.json(
        { error: 'Deze challenge is nog niet begonnen' },
        { status: 400 }
      );
    }

    // Create the challenge score
    const challengeScore = await db.challengeScore.create({
      data: {
        userId,
        challengeId,
        score,
        completedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        },
        challenge: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Score opgeslagen!',
      challengeScore
    });

  } catch (error) {
    console.error('Submit challenge score error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het opslaan van je score' },
      { status: 500 }
    );
  }
}

// GET - Get scores for a specific challenge or user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const challengeId = searchParams.get('challengeId');
    const userId = searchParams.get('userId');

    let scores;

    if (challengeId) {
      scores = await db.challengeScore.findMany({
        where: { challengeId },
        include: {
          user: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { score: 'desc' }
      });
    } else if (userId) {
      scores = await db.challengeScore.findMany({
        where: { userId },
        include: {
          challenge: {
            select: {
              id: true,
              name: true,
              gameType: true,
              scheduledAt: true,
              expiresAt: true
            }
          }
        },
        orderBy: { completedAt: 'desc' }
      });
    } else {
      return NextResponse.json(
        { error: 'challengeId of userId is verplicht' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, scores });

  } catch (error) {
    console.error('Get challenge scores error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van de scores' },
      { status: 500 }
    );
  }
}
