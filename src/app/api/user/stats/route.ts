import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { db } from "@/lib/db"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Get total games (scores)
    const totalScores = await db.score.count({
      where: { userId }
    })

    // Get best score
    const bestScoreResult = await db.score.findFirst({
      where: { userId },
      orderBy: { score: "desc" },
      select: { score: true }
    })
    const bestScore = bestScoreResult?.score || 0

    // Get average score
    const scores = await db.score.findMany({
      where: { userId },
      select: { score: true, submittedAt: true }
    })
    const averageScore = scores.length > 0 
      ? scores.reduce((sum, s) => sum + s.score, 0) / scores.length 
      : 0

    // Get rank
    const allUsersBestScores = await db.$queryRaw<Array<{ user_id: string, max_score: number }>>`
      SELECT 
        user_id,
        MAX(score) as max_score
      FROM "Score"
      GROUP BY user_id
      ORDER BY max_score DESC
    ` as any

    const rank = allUsersBestScores.findIndex((u: any) => u.user_id === userId) + 1
    const totalPlayers = allUsersBestScores.length

    // Get recent scores
    const recentScores = await db.score.findMany({
      where: { userId },
      include: {
        challenge: true
      },
      orderBy: { submittedAt: "desc" },
      take: 5
    })

    // Calculate trend (improvement over last 10 games)
    const last10Scores = scores.slice(-10)
    let trend = 0
    if (last10Scores.length >= 2) {
      const firstHalf = last10Scores.slice(0, Math.floor(last10Scores.length / 2))
      const secondHalf = last10Scores.slice(Math.floor(last10Scores.length / 2))
      const firstAvg = firstHalf.reduce((a, b) => a + b.score, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((a, b) => a + b.score, 0) / secondHalf.length
      trend = ((secondAvg - firstAvg) / firstAvg) * 100
    }

    // Get best checkout (simulated - based on high scores)
    let bestCheckout = "Nog geen"
    if (bestScore > 0) {
      // Simple logic: highest score suggests good checkout
      const checkoutOptions = {
        60: "D20", 57: "D17", 54: "D18", 51: "D17", 50: "D25", 48: "D24", 45: "D18", 42: "D16", 40: "D20"
      }
      for (const [score, checkout] of Object.entries(checkoutOptions)) {
        if (bestScore >= parseInt(score)) {
          bestCheckout = checkout
          break
        }
      }
    }

    // Get best average from matches (if any)
    const matches = await db.match.findMany({
      where: {
        OR: [
          { player1Id: userId, status: "COMPLETED" },
          { player2Id: userId, status: "COMPLETED" }
        ]
      }
    })

    let bestAverage = 0
    if (matches.length > 0) {
      const userTurns = await db.matchTurn.findMany({
        where: { playerId: userId },
        include: {
          match: true
        }
      })

      if (userTurns.length > 0) {
        const matchAverages = new Map<string, number[]>()
        userTurns.forEach(turn => {
          if (!matchAverages.has(turn.matchId)) {
            matchAverages.set(turn.matchId, [])
          }
          matchAverages.get(turn.matchId)?.push(turn.score)
        })

        const averages = Array.from(matchAverages.values()).map(scores => 
          scores.reduce((a, b) => a + b, 0) / scores.length
        )
        bestAverage = Math.max(...averages)
      }
    }

    return NextResponse.json({
      totalGames: totalScores,
      averageScore: Math.round(averageScore),
      bestScore,
      bestCheckout,
      rank,
      totalPlayers,
      recentScores: recentScores.map(s => ({
        challengeName: s.challenge.name,
        score: s.score,
        submittedAt: s.submittedAt
      })),
      trend,
      bestAverage
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
