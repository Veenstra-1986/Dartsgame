import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Create an invitation
export async function POST(request: NextRequest) {
  try {
    const { email, groupId, adminId } = await request.json();

    // Verify admin is actually an admin of the group
    const adminMember = await db.groupMember.findFirst({
      where: {
        userId: adminId,
        groupId,
        role: 'admin'
      }
    });

    if (!adminMember) {
      return NextResponse.json(
        { error: 'Je bent geen beheerder van deze groep' },
        { status: 403 }
      );
    }

    // Check if user already in group
    const existingMember = await db.groupMember.findFirst({
      where: {
        groupId,
        user: {
          email
        }
      }
    });

    if (existingMember) {
      return NextResponse.json(
        { error: 'Deze gebruiker is al lid van de groep' },
        { status: 400 }
      );
    }

    // Generate invitation token
    const token = Math.random().toString(36).substring(2, 15) +
                  Math.random().toString(36).substring(2, 15);

    // Set expiration to 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Create invitation
    const invitation = await db.invitation.create({
      data: {
        email,
        groupId,
        token,
        expiresAt
      }
    });

    // Get group details for email
    const group = await db.group.findUnique({
      where: { id: groupId }
    });

    // In a real application, send invitation email here
    console.log(`Invitation link: https://dartspro.app/register?invite=${group?.code}`);

    return NextResponse.json({
      success: true,
      message: 'Uitnodiging verstuurd',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        groupCode: group?.code
      }
    });

  } catch (error) {
    console.error('Create invitation error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken van de uitnodiging' },
      { status: 500 }
    );
  }
}
