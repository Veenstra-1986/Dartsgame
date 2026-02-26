import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, inviteCode } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Naam, e-mail en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Er bestaat al een account met dit e-mailadres' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hash(password, 10);

    // Generate verification token
    const verificationToken = Math.random().toString(36).substring(2, 15) +
                              Math.random().toString(36).substring(2, 15);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationToken,
        verified: false
      }
    });

    // If invite code provided, check if valid and add to group
    let group = null;
    if (inviteCode) {
      group = await db.group.findUnique({
        where: { code: inviteCode }
      });

      if (group) {
        // Add user to group
        await db.groupMember.create({
          data: {
            userId: user.id,
            groupId: group.id,
            role: 'member'
          }
        });
      }
    }

    // In a real application, send verification email here
    // For now, we'll log it
    console.log('Verification link would be:', `/api/auth/verify?token=${verificationToken}&email=${email}`);

    return NextResponse.json({
      success: true,
      message: 'Registratie succesvol. Controleer je e-mail voor bevestiging.',
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      group: group ? {
        id: group.id,
        name: group.name
      } : null
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het registreren' },
      { status: 500 }
    );
  }
}
