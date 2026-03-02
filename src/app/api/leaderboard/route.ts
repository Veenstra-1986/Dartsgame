import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || 'week'; // 'week' or 'overall'
    const groupId = searchParams.get('groupId');

    // Calculate date range for weekly leaderboard
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get group members
    const groupMembers = await db.groupMember.findMany({
      where: groupId ? { groupId } : undefined,
      include: {
        user: true
      }
    });

    // Calculate scores for each user
    const leaderboard = await Promise.all(
      groupMembers.map(async (member) => {
        const user = member.user;

        // Get challenge scores
        const challengeScores = await db.challengeScore.findMany({
          where: {
            userId: user.id,
            challenge: {
              ...(timeframe === 'week' ? {
                scheduledAt: { gte: weekAgo }
              } : {})
            }
          }
        });

        const totalScore = challengeScores.reduce((sum, cs) => sum + cs.score, 0);
        const wins = challengeScores.filter(cs => cs.score > 0).length;

        return {
          id: user.id,
          name: user.name,
          score: totalScore,
          challenges: challengeScores.length,
          wins,
          bestScore: challengeScores.length > 0 ? Math.max(...challengeScores.map(cs => cs.score)) : 0
        };
      })
    );

    // Sort by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);

    return NextResponse.json({
      success: true,
      leaderboard,
      timeframe
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van het leaderboard' },
      { status: 500 }
    );
  }
}
