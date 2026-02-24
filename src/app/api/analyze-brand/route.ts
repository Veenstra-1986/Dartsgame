import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function GET() {
  try {
    const zai = await ZAI.create()

    // Read Marimecs website
    const result = await zai.functions.invoke('page_reader', {
      url: 'https://www.marimecs.com'
    })

    // Extract color scheme and style information from the HTML
    const html = result.data.html

    // Extract colors from styles
    const colorMatches = html.match(/#[a-fA-F0-9]{3,6}|rgb\([^)]+\)|rgba\([^)]+\)/g) || []
    const uniqueColors = [...new Set(colorMatches)].slice(0, 20)

    // Extract common CSS classes and patterns
    const classPattern = html.match(/class=["']([^"']+)["']/g) || []
    const commonClasses = classPattern.map(c => c.replace(/class=["']|["']/g, '')).flat()

    // Look for brand-related colors and themes
    const primaryColorMatch = html.match(/(?:--primary|--color-primary|primary.*color)[:\s]*([^;]+)/gi) || []
    const secondaryColorMatch = html.match(/(?:--secondary|--color-secondary|secondary.*color)[:\s]*([^;]+)/gi) || []

    return NextResponse.json({
      success: true,
      title: result.data.title,
      html: result.data.html,
      extractedColors: uniqueColors,
      primaryColors: primaryColorMatch,
      secondaryColors: secondaryColorMatch,
      tokensUsed: result.data.usage.tokens
    })
  } catch (error) {
    console.error('Error analyzing brand:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to analyze brand' 
      },
      { status: 500 }
    )
  }
}
