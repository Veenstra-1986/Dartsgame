import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token en wachtwoord zijn vereist' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Wachtwoord moet minimaal 6 tekens lang zijn' },
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await db.user.findFirst({
      where: { verificationToken: token }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldige of verlopen reset link' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user with new password and clear token
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        verificationToken: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Wachtwoord succesvol gewijzigd. Je kunt nu inloggen.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het wijzigen van je wachtwoord' },
      { status: 500 }
    );
  }
}
