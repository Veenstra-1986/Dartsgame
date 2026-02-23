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
    const { name, email, nickname, initials } = body

    if (!name) {
      return NextResponse.json({ error: 'Naam is verplicht' }, { status: 400 })
    }

    console.log('Creating player:', { name, email, nickname, initials })

    const player = await db.player.create({
      data: {
        name,
        email,
        nickname,
        initials: initials || name.substring(0, 2).toUpperCase()
      }
    })

    console.log('Player created successfully:', player.id)
    return NextResponse.json(player, { status: 201 })
  } catch (error) {
    console.error('Error creating player:', error)
    
    // Check for unique constraint violation
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return NextResponse.json({ error: 'Email is al in gebruik' }, { status: 409 })
    }
    
    return NextResponse.json({ error: 'Speler aanmaken mislukt', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// PUT update player
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { id, name, nickname, avatar, initials } = body

    if (!id) {
      return NextResponse.json({ error: 'Speler ID is verplicht' }, { status: 400 })
    }

    const player = await db.player.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(nickname !== undefined && { nickname }),
        ...(avatar !== undefined && { avatar }),
        ...(initials !== undefined && { initials })
      }
    })

    return NextResponse.json(player)
  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json({ error: 'Speler bijwerken mislukt' }, { status: 500 })
  }
}

// DELETE player
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Speler ID is verplicht' }, { status: 400 })
    }

    await db.player.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json({ error: 'Speler verwijderen mislukt' }, { status: 500 })
  }
}
