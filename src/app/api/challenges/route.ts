import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch all challenges
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');

    const challenges = await db.challenge.findMany({
      where: active === 'true' ? {
        scheduledAt: { lte: new Date() },
        expiresAt: { gt: new Date() }
      } : undefined,
      orderBy: { scheduledAt: 'desc' },
      include: {
        scores: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: { score: 'desc' }
        }
      }
    });

    return NextResponse.json({ success: true, challenges });

  } catch (error) {
    console.error('Get challenges error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van challenges' },
      { status: 500 }
    );
  }
}

// POST - Create a new challenge (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, description, gameType, targetScore, rules, scheduledAt, expiresAt } = await request.json();

    const challenge = await db.challenge.create({
      data: {
        name,
        description,
        gameType,
        targetScore,
        rules,
        scheduledAt: new Date(scheduledAt),
        expiresAt: new Date(expiresAt)
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Challenge aangemaakt',
      challenge
    });

  } catch (error) {
    console.error('Create challenge error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken van de challenge' },
      { status: 500 }
    );
  }
}
