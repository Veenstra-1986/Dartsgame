import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'today'

    let scores
    const now = new Date()

    switch (period) {
      case 'today':
        // Get scores from today's challenge only
        const todayStart = new Date(now)
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000)

        const todayChallenge = await db.challenge.findFirst({
          where: {
            date: {
              gte: todayStart,
              lt: todayEnd
            }
          }
        })

        if (!todayChallenge) {
          return NextResponse.json([])
        }

        scores = await db.score.findMany({
          where: {
            challengeId: todayChallenge.id
          },
          include: {
            player: true
          },
          orderBy: {
            score: 'desc'
          }
        })
        break

      case 'week':
        // Get all scores from the current week
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
        weekStart.setHours(0, 0, 0, 0)

        scores = await db.score.findMany({
          where: {
            challenge: {
              date: {
                gte: weekStart
              }
            }
          },
          include: {
            player: true,
            challenge: true
          },
          orderBy: {
            score: 'desc'
          }
        })
        break

      case 'overall':
        // Get all scores ever, sum per player
        const allScores = await db.score.findMany({
          include: {
            player: true
          },
          orderBy: {
            score: 'desc'
          }
        })

        // Group by player and sum scores
        const playerScores = new Map<string, { player: any, totalScore: number }>()
        
        allScores.forEach(score => {
          const playerId = score.playerId
          if (playerScores.has(playerId)) {
            playerScores.get(playerId)!.totalScore += score.score
          } else {
            playerScores.set(playerId, {
              player: score.player,
              totalScore: score.score
            })
          }
        })

        // Convert to array and sort
        const aggregatedScores = Array.from(playerScores.values())
          .map(item => ({
            player: item.player,
            score: item.totalScore
          }))
          .sort((a, b) => b.score - a.score)

        return NextResponse.json(
          aggregatedScores.map((entry, index) => ({
            rank: index + 1,
            playerName: entry.player.name,
            initials: entry.player.initials || entry.player.name.substring(0, 2).toUpperCase(),
            score: entry.score
          }))
        )

      default:
        return NextResponse.json({ error: 'Invalid period' }, { status: 400 })
    }

    // Format the response for today and week
    if (period === 'today' || period === 'week') {
      return NextResponse.json(
        scores.map((entry, index) => ({
          rank: index + 1,
          playerName: entry.player.name,
          initials: entry.player.initials || entry.player.name.substring(0, 2).toUpperCase(),
          score: entry.score
        }))
      )
    }

    return NextResponse.json([])
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}
