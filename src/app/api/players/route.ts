import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all players
export async function GET() {
  try {
    const players = await db.player.findMany({
      orderBy: { name: 'asc' }
    })
    return NextResponse.json(players)
  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json({ error: 'Failed to fetch players' }, { status: 500 })
  }
}

// POST create new player
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, initials } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const player = await db.player.create({
      data: {
        name,
        email,
        initials: initials || name.substring(0, 2).toUpperCase()
      }
    })

    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json({ error: 'Failed to create player' }, { status: 500 })
  }
}
