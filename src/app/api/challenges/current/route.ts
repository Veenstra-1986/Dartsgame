import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Challenge types with descriptions
const CHALLENGE_TYPES = [
  {
    type: 'high_score',
    name: 'High Score (3 Pijlen)',
    description: 'Gooi 3 pijlen en behaal de hoogst mogelijke score. Triples en doubles tellen mee!'
  },
  {
    type: 'triple_20',
    name: 'Triple 20 Blitz',
    description: 'Gooi 9 pijlen en tel hoe vaak je triple 20 raakt. Max score: 9.',
    targetValue: 9
  },
  {
    type: 'bullseye',
    name: 'Bullseye Challenge',
    description: 'Gooi 3 pijlen naar de bullseye. Bull = 50 punten, Outer Bull = 25 punten.',
    targetValue: 180
  },
  {
    type: 'target_number',
    name: 'Target Number Hunt',
    description: 'Gooi 9 pijlen, allemaal naar hetzelfde nummer. Triples en doubles tellen mee!',
  },
  {
    type: 'round_the_clock',
    name: 'Round the Clock',
    description: 'Gooi van 1 tot 20 in volgorde. Hoe ver kom je in 9 pogingen?',
    targetValue: 20
  },
  {
    type: 'double_dash',
    name: 'Double Dash',
    description: 'Gooi zoveel mogelijk verschillende doubles in 6 pogingen.',
    targetValue: 6
  },
  {
    type: 'cricket_quick',
    name: 'Cricket Quick',
    description: 'Gooi 3 nummers (20, 19, 18). Wie raakt ze als eerste 3x elk? 9 pogingen.',
    targetValue: 9
  },
  {
    type: 'checkout_100',
    name: '100 Check-out',
    description: 'Van 100 naar 0 in maximaal 3 pijlen. Dubbel uit is verplicht!',
    targetValue: 100
  }
]

// Get or create current day's challenge
export async function GET() {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if challenge exists for today
    let challenge = await db.challenge.findFirst({
      where: {
        date: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    })

    // If no challenge for today, create one
    if (!challenge) {
      // Select a challenge based on the day of the week to have variety
      const dayOfWeek = today.getDay()
      const challengeIndex = dayOfWeek % CHALLENGE_TYPES.length
      const selectedChallenge = CHALLENGE_TYPES[challengeIndex]

      // For target_number, pick a random number between 1-20
      let description = selectedChallenge.description
      let targetValue = selectedChallenge.targetValue

      if (selectedChallenge.type === 'target_number') {
        const targetNum = ((dayOfWeek * 7) % 20) + 1
        description = `Gooi 9 pijlen, allemaal naar nummer ${targetNum}. Triples en doubles tellen mee!`
        targetValue = 270 // Maximum possible (3 × triple 20 = 180, but let's use 3×triple of target)
      }

      challenge = await db.challenge.create({
        data: {
          name: selectedChallenge.name,
          description: description,
          type: selectedChallenge.type,
          targetValue: targetValue,
          date: today
        }
      })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Error fetching/creating challenge:', error)
    return NextResponse.json({ error: 'Failed to fetch challenge' }, { status: 500 })
  }
}
