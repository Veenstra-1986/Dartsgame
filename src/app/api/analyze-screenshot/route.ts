import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const zai = await ZAI.create()

    // Read the uploaded screenshot
    const screenshotPath = '/home/z/my-project/upload/pasted_image_1771575579117.png'
    
    // Check if file exists
    if (!fs.existsSync(screenshotPath)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Screenshot not found' 
        },
        { status: 404 }
      )
    }

    // Read image and convert to base64
    const imageBuffer = fs.readFileSync(screenshotPath)
    const base64Image = imageBuffer.toString('base64')
    const imageDataUrl = `data:image/png;base64,${base64Image}`

    // Analyze the screenshot for design elements
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this website screenshot in detail and extract:
1. Primary color scheme (hex codes if visible or approximate colors)
2. Secondary/accent colors
3. Background colors
4. Typography style (font types, sizes)
5. Overall design style (modern, corporate, minimalist, etc.)
6. Navigation structure
7. Key visual elements
8. Any distinctive brand elements

Please provide a structured analysis that I can use to recreate this design style in a web application.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      thinking: { type: 'enabled' }
    })

    const analysis = response.choices[0]?.message?.content

    return NextResponse.json({
      success: true,
      analysis: analysis,
      tokensUsed: response.usage?.total_tokens || 0
    })
  } catch (error) {
    console.error('Error analyzing screenshot:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze screenshot' 
      },
      { status: 500 }
    )
  }
}
