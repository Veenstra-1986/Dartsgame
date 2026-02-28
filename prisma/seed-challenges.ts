import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const challengeTemplates = [
  {
    name: '501 Snelste Uitcheck',
    description: 'Speel een 501 en probeer uit te checken in zo min mogelijk darts.',
    gameType: '501',
    targetScore: 501,
    rules: 'Double-out modus. Houd je darts aantal bij. Bonuspunten voor sub-18 finishes.',
    difficulty: 'intermediate'
  },
  {
    name: '301 Rush',
    description: 'Snel 301 uitchecken!',
    gameType: '301',
    targetScore: 301,
    rules: 'Double-out modus. Snelste tijd wint.',
    difficulty: 'intermediate'
  },
  {
    name: 'Trebles Jacht',
    description: 'Alleen trebles tellen! Raak zo veel mogelijk trebles in 10 rondes.',
    gameType: 'treble-hunt',
    targetScore: 0,
    rules: 'T1-T20 in volgorde. 3 darts per nummer. Dubbele punten voor T20.',
    difficulty: 'advanced'
  },
  {
    name: 'Around the Clock',
    description: 'Goed voor je precisie! Raak alle nummers 1-20 in volgorde.',
    gameType: 'around-clock',
    targetScore: 0,
    rules: 'Singles tellen. Snelste tijd wint. Max 3 darts per nummer.',
    difficulty: 'beginner'
  },
  {
    name: 'Double Master',
    description: 'Focussen op doubles! Alleen doubles en bull tellen.',
    gameType: 'double-trouble',
    targetScore: 0,
    rules: '10 rondes, 3 darts. Hoogste totale score wint.',
    difficulty: 'intermediate'
  },
  {
    name: 'Cricket Battle',
    description: 'Intense Cricket battle!',
    gameType: 'cricket',
    targetScore: 0,
    rules: 'Standaard cricket regels. Speed cricket: 30 seconden per beurt.',
    difficulty: 'intermediate'
  },
  {
    name: 'High Score Challenge',
    description: 'Alles of niets! Maximaliseer je score in 10 worpen.',
    gameType: 'high-score',
    targetScore: 0,
    rules: '10 worpen, geen check-out. Hoogste totale score wint.',
    difficulty: 'beginner'
  },
  {
    name: 'Bull Master',
    description: 'Focus op de bull en bullseye!',
    gameType: 'bull-master',
    targetScore: 0,
    rules: '10 rondes, alleen bull (25) en bullseye (50) tellen.',
    difficulty: 'advanced'
  },
  {
    name: '180 Hunter',
    description: 'Probeer zoveel mogelijk 180s te gooien!',
    gameType: '180-hunter',
    targetScore: 0,
    rules: '10 rondes. Tel hoe vaak je 180 (T20, T20, T20) gooit.',
    difficulty: 'advanced'
  },
  {
    name: 'Shanghai',
    description: 'Raak single, double en triple van hetzelfde nummer!',
    gameType: 'shanghai',
    targetScore: 0,
    rules: 'Nummers 1-7 in volgorde. 1 ronde per nummer. Shanghai = single + double + triple.',
    difficulty: 'intermediate'
  },
  {
    name: 'Mickey Mouse',
    description: 'Sluit de nummers 20-15, Bull en Triples af!',
    gameType: 'mickey-mouse',
    targetScore: 0,
    rules: 'Sluit 20-15 en Bull af. Sluit daarna 3 triples. Wie alles als eerste sluit wint.',
    difficulty: 'advanced'
  },
  {
    name: 'Killer',
    description: 'Elimineer tegenstanders door hun nummer te raken!',
    gameType: 'killers',
    targetScore: 0,
    rules: 'Iedereen krijgt een nummer. Raak het nummer van je tegenstanders om levens af te nemen. Laatste overgebleven wint.',
    difficulty: 'intermediate'
  },
  {
    name: 'Gotcha',
    description: 'Raak precies je startscore om te winnen!',
    gameType: 'gotcha',
    targetScore: 36,
    rules: 'Elke speler begint met 36. Gooi je score en trek het af van je totaal. Precies op 0 uitchecken.',
    difficulty: 'beginner'
  },
  {
    name: 'Golf Darts',
    description: 'Golf variant voor darts! Hoe minder darts, hoe beter.',
    gameType: 'golf',
    targetScore: 0,
    rules: '9 "holes" (nummers). Probeer elk nummer in 1 dart te raken. Single=1, Double=2, Triple=3, Bull=4.',
    difficulty: 'intermediate'
  },
  {
    name: 'All Five',
    description: 'Alleen scores die deelbaar zijn door 5 tellen!',
    gameType: 'all-five',
    targetScore: 0,
    rules: 'Gooi scores die deelbaar zijn door 5 (5, 10, 15, 20, 25, 30, 40, 50, 60). Eerste die 100 punten haalt wint.',
    difficulty: 'beginner'
  },
  {
    name: 'Sudden Death',
    description: 'De laatste die overblijft wint!',
    gameType: 'sudden-death',
    targetScore: 0,
    rules: 'Iedere ronde wordt de speler met de laagste score geëlimineerd. Blijf scoren om te overleven!',
    difficulty: 'advanced'
  }
];

async function main() {
  console.log('🎯 Seeding daily challenges...');

  // Get today's date in Netherlands timezone
  const now = new Date();
  const nlOffset = 60; // UTC+1 for Netherlands
  const nlTime = new Date(now.getTime() + nlOffset * 60000);

  // Create challenges for the next 7 days
  for (let i = 0; i < 7; i++) {
    const challengeDate = new Date(nlTime);
    challengeDate.setDate(challengeDate.getDate() + i);
    challengeDate.setHours(0, 0, 0, 0);

    const expireDate = new Date(challengeDate);
    expireDate.setDate(expireDate.getDate() + 1);
    expireDate.setHours(9, 0, 0, 0); // Expires at 9:00 AM next day

    // Pick a template based on day of week
    const dayOfWeek = challengeDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const templateIndex = dayOfWeek % challengeTemplates.length;
    const template = challengeTemplates[templateIndex];

    // Add day name to challenge name
    const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const challengeName = `${dayNames[dayOfWeek]} ${template.name}`;

    // Check if challenge already exists for this date
    const existingChallenge = await prisma.challenge.findFirst({
      where: {
        scheduledAt: {
          gte: challengeDate,
          lt: new Date(challengeDate.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (existingChallenge) {
      console.log(`✓ Challenge already exists for ${dayNames[dayOfWeek]}`);
      continue;
    }

    // Create challenge
    const challenge = await prisma.challenge.create({
      data: {
        name: challengeName,
        description: template.description,
        gameType: template.gameType,
        targetScore: template.targetScore,
        rules: template.rules,
        scheduledAt: challengeDate,
        expiresAt: expireDate
      }
    });

    console.log(`✓ Created challenge: ${challenge.name} (${challenge.scheduledAt.toISOString().split('T')[0]})`);
  }

  console.log('✅ Daily challenges seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding challenges:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
