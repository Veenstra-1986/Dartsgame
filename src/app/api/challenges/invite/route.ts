import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Invite someone to join a challenge
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, challengeId, inviterId } = body;

    if (!email || !challengeId || !inviterId) {
      return NextResponse.json(
        { error: 'email, challengeId en inviterId zijn verplicht' },
        { status: 400 }
      );
    }

    // Check if challenge exists
    const challenge = await db.challenge.findUnique({
      where: { id: challengeId }
    });

    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge niet gevonden' },
        { status: 404 }
      );
    }

    // Check if user already exists
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker met dit e-mailadres niet gevonden. Vraag ze eerst om te registreren.' },
        { status: 404 }
      );
    }

    // Check if user already has a score for this challenge
    const existingScore = await db.challengeScore.findUnique({
      where: {
        userId_challengeId: {
          userId: user.id,
          challengeId
        }
      }
    });

    if (existingScore) {
      return NextResponse.json(
        { error: 'Deze gebruiker heeft al deelgenomen aan deze challenge' },
        { status: 400 }
      );
    }

    // For challenge invitations, we can create a notification or send an email
    // For now, we'll create a simple invitation record in the Group's invitations
    // Or we can add a ChallengeInvitation model if needed

    // Get user's first group (if any) to associate the invitation
    const groupMember = await db.groupMember.findFirst({
      where: { userId: user.id },
      include: { group: true }
    });

    if (!groupMember) {
      return NextResponse.json(
        { error: 'Gebruiker is geen lid van een groep. Vraag ze eerst om lid te worden van een groep.' },
        { status: 400 }
      );
    }

    // Create invitation record using existing Invitation model
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

    const invitation = await db.invitation.create({
      data: {
        email,
        groupId: groupMember.groupId,
        token,
        expiresAt
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Uitnodiging verzonden!',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        challengeId,
        expiresAt: invitation.expiresAt
      },
      invitedUser: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Challenge invitation error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verzenden van de uitnodiging' },
      { status: 500 }
    );
  }
}

// GET - Get challenge invitations for a user
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

    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        groupMemberships: {
          include: {
            group: {
              include: {
                invitations: {
                  where: {
                    status: 'pending',
                    expiresAt: { gt: new Date() }
                  },
                  orderBy: { createdAt: 'desc' }
                }
              }
            }
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Gebruiker niet gevonden' },
        { status: 404 }
      );
    }

    const allInvitations = user.groupMemberships.flatMap(gm => gm.group.invitations);

    return NextResponse.json({ success: true, invitations: allInvitations });

  } catch (error) {
    console.error('Get challenge invitations error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van uitnodigingen' },
      { status: 500 }
    );
  }
}
