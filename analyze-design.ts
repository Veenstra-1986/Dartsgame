import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

async function analyzeDesign() {
  console.log('Starting design analysis...')
  
  try {
    const zai = await ZAI.create()

    const screenshotPath = '/home/z/my-project/upload/pasted_image_1771575579117.png'
    
    if (!fs.existsSync(screenshotPath)) {
      console.error('Screenshot not found!')
      process.exit(1)
    }

    console.log('Reading image...')
    const imageBuffer = fs.readFileSync(screenshotPath)
    const base64Image = imageBuffer.toString('base64')
    const imageDataUrl = `data:image/png;base64,${base64Image}`

    console.log('Analyzing with AI...')
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analyze this website screenshot and provide ONLY these details in a structured format:

PRIMARY COLORS:
- Primary hex code:
- Secondary hex code:
- Accent hex code:

BACKGROUND:
- Main background color:
- Header background:
- Footer background:

TYPOGRAPHY:
- Font style:
- Text colors:

STYLE:
- Design style (modern/minimalist/corporate/etc):
- Key visual elements:

NAVIGATION:
- Navigation bar style:
- Button styles:

Be specific with color names and hex codes.`
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
      thinking: { type: 'disabled' }
    })

    const analysis = response.choices[0]?.message?.content
    console.log('\n=== DESIGN ANALYSIS ===\n')
    console.log(analysis)
    console.log('\n=== END ANALYSIS ===\n')

    // Save to file
    fs.writeFileSync('/home/z/my-project/design-analysis.txt', analysis || '')
    console.log('Analysis saved to design-analysis.txt')

  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

analyzeDesign()
