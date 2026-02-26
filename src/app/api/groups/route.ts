import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch user's groups
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is vereist' },
        { status: 400 }
      );
    }

    const memberships = await db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      groups: memberships.map(m => ({
        id: m.group.id,
        name: m.group.name,
        code: m.group.code,
        description: m.group.description,
        role: m.role,
        memberCount: m.group.members.length,
        members: m.group.members.map(gm => ({
          id: gm.user.id,
          name: gm.user.name,
          email: gm.user.email,
          role: gm.role
        }))
      }))
    });

  } catch (error) {
    console.error('Get groups error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het ophalen van groepen' },
      { status: 500 }
    );
  }
}

// POST - Create a new group
export async function POST(request: NextRequest) {
  try {
    const { name, description, userId } = await request.json();

    // Generate unique join code
    const code = `${name.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Create group
    const group = await db.group.create({
      data: {
        name,
        description,
        code
      }
    });

    // Add creator as admin
    await db.groupMember.create({
      data: {
        userId,
        groupId: group.id,
        role: 'admin'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Groep aangemaakt',
      group: {
        id: group.id,
        name: group.name,
        code: group.code,
        description: group.description
      }
    });

  } catch (error) {
    console.error('Create group error:', error);
    return NextResponse.json(
      { error: 'Er ging iets mis bij het aanmaken van de groep' },
      { status: 500 }
    );
  }
}
