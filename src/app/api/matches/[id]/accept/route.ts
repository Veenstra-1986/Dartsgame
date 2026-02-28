import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Accept a match invitation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // Get the match
    const match = await db.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match niet gevonden' },
        { status: 404 }
      );
    }

    if (match.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Deze match kan niet meer worden geaccepteerd.' },
        { status: 400 }
      );
    }

    // Update match status to in_progress
    const updatedMatch = await db.match.update({
      where: { id: matchId },
      data: {
        status: 'in_progress'
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true
          }
        },
        player2: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Match geaccepteerd! Het spel kan beginnen.',
      match: updatedMatch
    });

  } catch (error) {
    console.error('Accept match error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het accepteren van de match' },
      { status: 500 }
    );
  }
}

// DELETE - Decline/Cancel a match invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const matchId = params.id;

    // Get the match
    const match = await db.match.findUnique({
      where: { id: matchId }
    });

    if (!match) {
      return NextResponse.json(
        { error: 'Match niet gevonden' },
        { status: 404 }
      );
    }

    if (match.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Deze match kan niet meer worden geannuleerd.' },
        { status: 400 }
      );
    }

    // Delete the match
    await db.match.delete({
      where: { id: matchId }
    });

    return NextResponse.json({
      success: true,
      message: 'Match uitnodiging geannuleerd.'
    });

  } catch (error) {
    console.error('Decline match error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het annuleren van de match' },
      { status: 500 }
    );
  }
}
