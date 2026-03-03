import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is vereist' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal that user doesn't exist for security
      return NextResponse.json({
        success: true,
        message: 'Als dit emailadres bestaat, ontvang je een reset link.'
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await db.user.update({
      where: { email },
      data: {
        verificationToken: resetToken,
      }
    });

    // In a real application, you would send an email here
    // For now, we'll just return the token in development
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    console.log('Password reset link:', resetUrl);

    return NextResponse.json({
      success: true,
      message: 'Als dit emailadres bestaat, ontvang je een reset link.',
      // Only include this in development
      ...(process.env.NODE_ENV === 'development' && { resetUrl })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwerken van je verzoek' },
      { status: 500 }
    );
  }
}
