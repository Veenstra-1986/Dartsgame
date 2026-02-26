import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail en wachtwoord zijn verplicht' },
        { status: 400 }
      );
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
      include: {
        groupMemberships: {
          include: {
            group: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldige e-mail of wachtwoord' },
        { status: 401 }
      );
    }

    // Check if verified
    if (!user.verified) {
      return NextResponse.json(
        { error: 'Account nog niet bevestigd. Controleer je e-mail.' },
        { status: 403 }
      );
    }

    // Check password
    const validPassword = await compare(password, user.password);

    if (!validPassword) {
      return NextResponse.json(
        { error: 'Ongeldige e-mail of wachtwoord' },
        { status: 401 }
      );
    }

    // Generate simple token (in production, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        groups: user.groupMemberships.map(gm => ({
          id: gm.group.id,
          name: gm.group.name,
          role: gm.role
        }))
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het inloggen' },
      { status: 500 }
    );
  }
}
