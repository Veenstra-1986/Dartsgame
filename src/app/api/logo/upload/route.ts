import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('logo') as File

    if (!file) {
      return NextResponse.json({ error: 'Geen bestand geüpload' }, { status: 400 })
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Ongeldig bestandstype. Gebruik JPG, PNG, SVG of WebP.' }, { status: 400 })
    }

    // Check file size (max 2MB)
    const maxSize = 2 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'Bestand is te groot. Maximum is 2MB.' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split('.').pop()
    const filename = `logo-${timestamp}.${ext}`

    // Ensure public/uploads directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Write file
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Return the URL
    const logoUrl = `/uploads/${filename}`

    return NextResponse.json({ 
      success: true, 
      logoUrl,
      filename
    })

  } catch (error) {
    console.error('Logo upload error:', error)
    return NextResponse.json({ error: 'Logo upload mislukt' }, { status: 500 })
  }
}
