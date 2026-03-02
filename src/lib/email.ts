import { Resend } from 'resend';

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, name: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/verify?token=${token}&email=${email}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Bevestig je emailadres',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #14b8a6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .button:hover { background: #059669; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DartsPro</h1>
              </div>
              <div class="content">
                <h2>Welkom bij DartsPro, ${name}!</h2>
                <p>Bedankt voor je registratie. Klik op de onderstaande knop om je emailadres te bevestigen:</p>
                <a href="${verificationUrl}" class="button">Bevestig Emailadres</a>
                <p>Of gebruik deze link:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${verificationUrl}</p>
                <p>Deze link is 24 uur geldig.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Als je dit niet hebt aangevraagd, kun je dit email negeren.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 DartsPro. Alle rechten voorbehouden.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(email: string, name: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@yourdomain.com',
      to: email,
      subject: 'Wachtwoord Reset - DartsPro',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #10b981, #14b8a6); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .header h1 { color: white; margin: 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
              .button:hover { background: #059669; }
              .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>DartsPro</h1>
              </div>
              <div class="content">
                <h2>Wachtwoord Reset</h2>
                <p>Hoi ${name},</p>
                <p>We hebben een verzoek ontvangen om je wachtwoord te resetten. Klik op de onderstaande knop om een nieuw wachtwoord in te stellen:</p>
                <a href="${resetUrl}" class="button">Reset Wachtwoord</a>
                <p>Of gebruik deze link:</p>
                <p style="word-break: break-all; color: #666; font-size: 12px;">${resetUrl}</p>
                <p>Deze link is 1 uur geldig.</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">Als je dit niet hebt aangevraagd, kun je dit email veilig negeren. Je wachtwoord wordt niet gewijzigd.</p>
              </div>
              <div class="footer">
                <p>&copy; 2025 DartsPro. Alle rechten voorbehouden.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}
