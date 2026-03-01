import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Submit a challenge score
export async function POST(request: NextRequest) {
  try {
    const { userId, challengeId, score } = await request.json();

    if (!userId || !challengeId || score === undefined) {
      return NextResponse.json(
        { error: 'Vul alle velden in' },
        { status: 400 }
      );
    }

    // Check if user already submitted for this challenge
    const existingScore = await db.challengeScore.findUnique({
      where: {
        userId_challengeId: { userId, challengeId }
      }
    });

    if (existingScore) {
      return NextResponse.json(
        { error: 'Je hebt al een score ingediend voor deze challenge. Je mag maar één keer deelnemen.' },
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

    if (new Date() > challenge.expiresAt) {
      return NextResponse.json(
        { error: 'Deze challenge is afgelopen. Je kunt geen score meer indienen.' },
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
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Score succesvol ingediend!',
      score: challengeScore
    });

  } catch (error) {
    console.error('Submit challenge score error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het indienen van je score' },
      { status: 500 }
    );
  }
}

// GET - Get user's scores for challenges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const challengeId = searchParams.get('challengeId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is vereist' },
        { status: 400 }
      );
    }

    const scores = await db.challengeScore.findMany({
      where: challengeId
        ? { userId, challengeId }
        : { userId },
      include: {
        challenge: {
          select: {
            id: true,
            name: true,
            gameType: true
          }
        }
      },
      orderBy: { completedAt: 'desc' }
    });

    return NextResponse.json({ success: true, scores });

  } catch (error) {
    console.error('Get challenge scores error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van scores' },
      { status: 500 }
    );
  }
}
