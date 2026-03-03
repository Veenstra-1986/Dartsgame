import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';

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

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, user.name, resetToken);

    if (!emailSent) {
      // Log the reset link if email sending fails (for development)
      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
      console.log('Email sending failed. Password reset link:', resetUrl);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? 'Als dit emailadres bestaat, ontvang je een reset link.'
        : 'Als dit emailadres bestaat, ontvang je een reset link (email kon niet worden verzonden).',
      emailSent: emailSent
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verwerken van je verzoek' },
      { status: 500 }
    );
  }
}
