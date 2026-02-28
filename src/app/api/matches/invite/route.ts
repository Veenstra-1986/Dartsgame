import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Invite someone to a match
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, gameType, inviterId, scheduledAt } = body;

    if (!email || !gameType || !inviterId) {
      return NextResponse.json(
        { error: 'email, gameType en inviterId zijn verplicht' },
        { status: 400 }
      );
    }

    // Get inviter
    const inviter = await db.user.findUnique({
      where: { id: inviterId }
    });

    if (!inviter) {
      return NextResponse.json(
        { error: 'Uitnodiger niet gevonden' },
        { status: 404 }
      );
    }

    // Check if invitee exists
    const invitee = await db.user.findUnique({
      where: { email }
    });

    if (!invitee) {
      return NextResponse.json(
        { error: 'Gebruiker met dit e-mailadres niet gevonden. Vraag ze eerst om te registreren.' },
        { status: 404 }
      );
    }

    // Check if invitee is same as inviter
    if (invitee.id === inviterId) {
      return NextResponse.json(
        { error: 'Je kunt jezelf niet uitnodigen voor een match.' },
        { status: 400 }
      );
    }

    // Get a common group for both users
    const inviterGroups = await db.groupMember.findMany({
      where: { userId: inviterId },
      select: { groupId: true }
    });

    const inviteeGroups = await db.groupMember.findMany({
      where: { userId: invitee.id },
      select: { groupId: true }
    });

    const commonGroupId = inviterGroups
      .map(g => g.groupId)
      .find(gid => inviteeGroups.some(ig => ig.groupId === gid));

    if (!commonGroupId) {
      return NextResponse.json(
        { error: 'Je kunt alleen gebruikers uitnodigen die lid zijn van dezelfde groep.' },
        { status: 400 }
      );
    }

    // Check if there's already a scheduled match between these two players
    const existingMatch = await db.match.findFirst({
      where: {
        AND: [
          { OR: [
            { AND: [{ player1Id: inviterId }, { player2Id: invitee.id }] },
            { AND: [{ player1Id: invitee.id }, { player2Id: inviterId }] }
          ]},
          { status: 'scheduled' }
        ]
      }
    });

    if (existingMatch) {
      return NextResponse.json(
        { error: 'Je hebt al een geplande match met deze speler.' },
        { status: 400 }
      );
    }

    // Create the match
    const match = await db.match.create({
      data: {
        groupId: commonGroupId,
        player1Id: inviterId,
        player2Id: invitee.id,
        gameType,
        status: 'scheduled',
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date()
      },
      include: {
        player1: {
          select: { id: true, name: true, email: true }
        },
        player2: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Uitnodiging voor match verzonden!',
      match
    });

  } catch (error) {
    console.error('Match invitation error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verzenden van de match uitnodiging' },
      { status: 500 }
    );
  }
}

// GET - Get pending match invitations for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is verplicht' },
        { status: 400 }
      );
    }

    // Get matches where user is player2 (invited) and status is scheduled
    const invitations = await db.match.findMany({
      where: {
        player2Id: userId,
        status: 'scheduled'
      },
      include: {
        player1: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    // Also get matches where user is player1 (they invited someone)
    const sentInvitations = await db.match.findMany({
      where: {
        player1Id: userId,
        status: 'scheduled'
      },
      include: {
        player2: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { scheduledAt: 'asc' }
    });

    return NextResponse.json({
      success: true,
      invitations: {
        received: invitations,
        sent: sentInvitations
      }
    });

  } catch (error) {
    console.error('Get match invitations error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van match uitnodigingen' },
      { status: 500 }
    );
  }
}
