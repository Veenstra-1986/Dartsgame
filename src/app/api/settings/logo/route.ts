import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

// Create a fresh Prisma client instance for this API route
const prisma = new PrismaClient()

// GET - Retrieve current custom logo
export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: 'custom_logo' }
    })

    if (!setting) {
      return NextResponse.json({ logo: null })
    }

    return NextResponse.json({
      logo: setting.value,
      mimeType: setting.mimeType
    })
  } catch (error) {
    console.error('Error fetching logo:', error)
    return NextResponse.json({ error: 'Failed to fetch logo' }, { status: 500 })
  }
}

// POST - Upload a custom logo (as base64)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { logoData, mimeType } = body

    if (!logoData) {
      return NextResponse.json({ error: 'No logo data provided' }, { status: 400 })
    }

    // Validate it's a valid base64 string (basic validation)
    if (!logoData.startsWith('data:')) {
      return NextResponse.json({ error: 'Invalid logo data format' }, { status: 400 })
    }

    // Check if logo size is reasonable (max 2MB base64)
    const base64Length = logoData.split(',')[1]?.length || 0
    if (base64Length > 2 * 1024 * 1024 * 1.37) { // 2MB base64 encoded is ~2.7M chars
      return NextResponse.json({ error: 'Logo is too large. Max 2MB.' }, { status: 400 })
    }

    // Upsert the logo setting
    const setting = await prisma.siteSettings.upsert({
      where: { key: 'custom_logo' },
      update: {
        value: logoData,
        mimeType: mimeType || 'image/png'
      },
      create: {
        key: 'custom_logo',
        value: logoData,
        mimeType: mimeType || 'image/png'
      }
    })

    return NextResponse.json({
      logo: setting.value,
      mimeType: setting.mimeType
    })
  } catch (error) {
    console.error('Error saving logo:', error)
    return NextResponse.json({ error: 'Failed to save logo' }, { status: 500 })
  }
}

// DELETE - Remove custom logo
export async function DELETE() {
  try {
    await prisma.siteSettings.deleteMany({
      where: { key: 'custom_logo' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting logo:', error)
    return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 })
  }
}
