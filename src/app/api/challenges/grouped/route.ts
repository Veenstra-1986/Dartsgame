import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch challenges filtered by user's groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const active = searchParams.get('active');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is vereist' },
        { status: 400 }
      );
    }

    // Get user's groups
    const userGroups = await db.groupMember.findMany({
      where: { userId },
      select: { groupId: true }
    });

    const groupIds = userGroups.map(g => g.groupId);

    if (groupIds.length === 0) {
      return NextResponse.json({
        success: true,
        challenges: [],
        message: 'Je bent nog geen lid van een groep'
      });
    }

    // Get all members of user's groups
    const groupMembers = await db.groupMember.findMany({
      where: { groupId: { in: groupIds } },
      select: { userId: true }
    });

    const memberIds = [...new Set(groupMembers.map(m => m.userId))];

    // Fetch challenges with scores filtered to group members only
    const challenges = await db.challenge.findMany({
      where: active === 'true' ? {
        scheduledAt: { lte: new Date() },
        expiresAt: { gt: new Date() }
      } : undefined,
      orderBy: { scheduledAt: 'desc' },
      include: {
        scores: {
          where: {
            userId: { in: memberIds }
          },
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

    return NextResponse.json({ success: true, challenges, memberIds, groupIds });

  } catch (error) {
    console.error('Get grouped challenges error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van challenges' },
      { status: 500 }
    );
  }
}
