import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: NextRequest) {
  try {
    const { accentColor, logoUrl, groupName } = await request.json();

    // Get user (for demo, use first user or create default)
    let user = await db.user.findFirst();

    if (!user) {
      // Create a default user if none exists
      user = await db.user.create({
        data: {
          email: 'demo@dartspro.app',
          name: 'Demo Gebruiker',
          password: 'demo', // Not used in this demo
          verified: true,
          accentColor: accentColor || 'emerald',
          logoUrl: logoUrl || null,
          groupName: groupName || 'DartsPro'
        }
      });
    }

    // Update user preferences
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        accentColor: accentColor !== undefined ? accentColor : user.accentColor,
        logoUrl: logoUrl !== undefined ? logoUrl : user.logoUrl,
        groupName: groupName !== undefined ? groupName : user.groupName
      }
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        accentColor: updatedUser.accentColor,
        logoUrl: updatedUser.logoUrl,
        groupName: updatedUser.groupName
      }
    });

  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Fout bij opslaan instellingen' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user (for demo, use first user or return defaults)
    let user = await db.user.findFirst();

    if (!user) {
      // Return default settings if no user exists
      return NextResponse.json({
        success: true,
        user: {
          id: '',
          name: '',
          email: '',
          accentColor: 'emerald',
          logoUrl: null,
          groupName: 'DartsPro'
        }
      });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accentColor: user.accentColor,
        logoUrl: user.logoUrl,
        groupName: user.groupName
      }
    });

  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Fout bij ophalen instellingen' },
      { status: 500 }
    );
  }
}
