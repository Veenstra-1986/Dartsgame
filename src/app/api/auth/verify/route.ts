import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json(
        { error: 'Ongeldige verificatielink' },
        { status: 400 }
      );
    }

    // Find user with matching verification token and email
    const user = await db.user.findFirst({
      where: {
        email,
        verificationToken: token
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Ongeldige of verlopen verificatielink' },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        verified: true,
        verificationToken: null
      }
    });

    // Return success page
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Email Bevestigd - DartsPro</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              padding: 40px;
              border-radius: 16px;
              box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
              max-width: 400px;
              text-align: center;
            }
            .icon {
              width: 80px;
              height: 80px;
              background: #d1fae5;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
            }
            h1 {
              color: #1e293b;
              margin: 0 0 16px;
            }
            p {
              color: #64748b;
              margin: 0 0 24px;
            }
            .btn {
              background: #10b981;
              color: white;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 8px;
              display: inline-block;
              font-weight: 600;
            }
            .btn:hover {
              background: #059669;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">✓</div>
            <h1>Email Bevestigd!</h1>
            <p>Je account is geactiveerd. Je kunt nu inloggen.</p>
            <a href="/login" class="btn">Inloggen</a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het verifiëren' },
      { status: 500 }
    );
  }
}
