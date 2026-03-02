import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create sample users
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'jan@bedrijf.nl' },
      update: {},
      create: {
        email: 'jan@bedrijf.nl',
        name: 'Jan de Vries',
        password: await hash('password123', 10),
        verified: true,
        accentColor: 'blue',
        groupName: 'TechCorp Darts'
      }
    }),
    prisma.user.upsert({
      where: { email: 'maria@bedrijf.nl' },
      update: {},
      create: {
        email: 'maria@bedrijf.nl',
        name: 'Maria Jansen',
        password: await hash('password123', 10),
        verified: true,
        accentColor: 'purple',
        groupName: 'TechCorp Darts'
      }
    }),
    prisma.user.upsert({
      where: { email: 'peter@bedrijf.nl' },
      update: {},
      create: {
        email: 'peter@bedrijf.nl',
        name: 'Peter van den Berg',
        password: await hash('password123', 10),
        verified: true,
        accentColor: 'rose',
        groupName: 'TechCorp Darts'
      }
    }),
    prisma.user.upsert({
      where: { email: 'lisa@bedrijf.nl' },
      update: {},
      create: {
        email: 'lisa@bedrijf.nl',
        name: 'Lisa Bakker',
        password: await hash('password123', 10),
        verified: true,
        accentColor: 'teal',
        groupName: 'TechCorp Darts'
      }
    }),
    prisma.user.upsert({
      where: { email: 'mark@bedrijf.nl' },
      update: {},
      create: {
        email: 'mark@bedrijf.nl',
        name: 'Mark de Graaf',
        password: await hash('password123', 10),
        verified: true,
        accentColor: 'amber',
        groupName: 'TechCorp Darts'
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create a sample group
  const group = await prisma.group.upsert({
    where: { code: 'COMPANY-2025' },
    update: {},
    create: {
      name: 'Bedrijf Darts Competitie',
      code: 'COMPANY-2025',
      description: 'De officiële darts groep voor ons bedrijf'
    }
  });

  console.log(`✅ Created group: ${group.name}`);

  // Add users to group
  for (const user of users) {
    await prisma.groupMember.upsert({
      where: {
        userId_groupId: {
          userId: user.id,
          groupId: group.id
        }
      },
      update: {},
      create: {
        userId: user.id,
        groupId: group.id,
        role: user.email === 'jan@bedrijf.nl' ? 'admin' : 'member'
      }
    });
  }

  console.log(`✅ Added ${users.length} members to group`);

  // Create many different challenges
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  const challengeTemplates = [
    {
      name: 'Maandag Mayhem',
      description: 'Start de week goed! Speel een 501 en probeer uit te checken in minder dan 18 darts.',
      gameType: '501',
      targetScore: 501,
      rules: 'Double-out modus. Houd je darts bij. Bonuspunten voor sub-18 finishes.',
      difficulty: 'intermediate',
      dayOffset: 0
    },
    {
      name: 'Dinsdag Doubles',
      description: 'Focus op doubles! Raak zoveel mogelijk verschillende doubles in 10 rondes.',
      gameType: 'doubles',
      targetScore: 0,
      rules: '3 darts per ronde. Elke nieuwe dubbele waarde telt als punt.',
      difficulty: 'intermediate',
      dayOffset: 1
    },
    {
      name: 'Woensdag 180 Hunt',
      description: 'Gooi zo veel mogelijk 180s in 15 minuten.',
      gameType: '180-hunt',
      targetScore: 0,
      rules: 'T20, T20, T20 = 1 punt. Maximaal aantal 180s tellen.',
      difficulty: 'advanced',
      dayOffset: 2
    },
    {
      name: 'Donderdag Trebles',
      description: 'Alleen trebles tellen! Raak zo veel mogelijk trebles in 10 rondes.',
      gameType: 'treble-hunt',
      targetScore: 0,
      rules: 'T1-T20 in volgorde. 3 darts per nummer. Dubbele punten voor T20.',
      difficulty: 'intermediate',
      dayOffset: 3
    },
    {
      name: 'Vrijdag Finale',
      description: 'De week afsluiten met een snelle 301!',
      gameType: '301',
      targetScore: 301,
      rules: 'Straight-out modus. Wie kan het snelst uitchecken?',
      difficulty: 'beginner',
      dayOffset: 4
    },
    {
      name: 'Zaterdag Snelle Rondes',
      description: 'Speel 10 rondes 501 en tel je totaal aantal punten.',
      gameType: 'score-accumulation',
      targetScore: 0,
      rules: '3 darts per ronde. Totaal aantal punten in 10 rondes.',
      difficulty: 'intermediate',
      dayOffset: 5
    },
    {
      name: 'Zondag Bullseye Battle',
      description: 'Wie raakt de bullseye het vaakst?',
      gameType: 'bullseye',
      targetScore: 0,
      rules: '3 darts per ronde, 10 rondes. Bullseye = 3 punten, Bull = 2 punten.',
      difficulty: 'beginner',
      dayOffset: 6
    },
    {
      name: 'Score uitcheck Challenge',
      description: 'Je krijgt 6 willekeurige scores. Probeer ze zo snel mogelijk uit te checken.',
      gameType: 'checkout-practice',
      targetScore: 0,
      rules: 'Scores: 170, 120, 80, 100, 60, 40. Darts tellen als score.',
      difficulty: 'advanced',
      dayOffset: 7
    },
    {
      name: 'High Average Challenge',
      description: 'Speel 5 rondes 501. Je gemiddelde per 3 darts is je score.',
      gameType: 'average',
      targetScore: 501,
      rules: '5 rondes van 501. Je gemiddelde (3-dart average) is je eindscore.',
      difficulty: 'advanced',
      dayOffset: 8
    },
    {
      name: 'Round the Clock',
      description: 'Raak elk nummer van 1-20 precies één keer in volgorde.',
      gameType: 'round-clock',
      targetScore: 0,
      rules: 'Minimaal aantal darts om van 1 naar 20 te komen. Bullseye als bonus.',
      difficulty: 'intermediate',
      dayOffset: 9
    },
    {
      name: 'Triple 20 Special',
      description: 'Alleen T20 tellen! Hoeveel T20s kun je raken in 15 rondes?',
      gameType: 't20-special',
      targetScore: 0,
      rules: '3 darts per ronde. Elke T20 = 10 punten. Max 150 punten.',
      difficulty: 'intermediate',
      dayOffset: 10
    },
    {
      name: 'Cricket Challenge',
      description: 'Speel een volledige Cricket game tegen jezelf.',
      gameType: 'cricket',
      targetScore: 0,
      rules: 'Standaard cricket regels (15-20 en bull). Minimale darts tellen als score.',
      difficulty: 'intermediate',
      dayOffset: 11
    },
    {
      name: 'Buster Prevention',
      description: 'Speel 501 en vermijd busts. Minste aantal busts wint.',
      gameType: 'no-bust-501',
      targetScore: 501,
      rules: 'Speel 501, maar elke bust kost je -5 punten. Score = remaining - (busts * 5).',
      difficulty: 'advanced',
      dayOffset: 12
    },
    {
      name: 'Sector Master',
      description: 'Focus op één sector: 19s. Raak zo veel mogelijk 19s.',
      gameType: 'sector-master',
      targetScore: 0,
      rules: 'T19, S19, D19. 3 darts per ronde, 10 rondes. T19 = 3pt, S19 = 1pt, D19 = 2pt.',
      difficulty: 'intermediate',
      dayOffset: 13
    },
    {
      name: 'Blind 180',
      description: 'Trek 3 willekeurige triples en probeer een 180 te gooien.',
      gameType: 'blind-180',
      targetScore: 0,
      rules: '3 willekeurige triples getekend. Probeer ze te raken. Elke hit = 10 punten.',
      difficulty: 'advanced',
      dayOffset: 14
    },
    {
      name: 'Quick 100',
      description: 'Wie kan het snelst totaal 100 punten gooien?',
      gameType: 'first-to-100',
      targetScore: 100,
      rules: 'Minimaal aantal darts om totaal 100 punten te bereiken. Aantal darts = score.',
      difficulty: 'beginner',
      dayOffset: 15
    },
    {
      name: 'Double Focus',
      description: 'Alle doubles (1-20) in volgorde raken.',
      gameType: 'all-doubles',
      targetScore: 0,
      rules: 'D1-D20 in volgorde. Minimale darts tellen als score.',
      difficulty: 'advanced',
      dayOffset: 16
    },
    {
      name: 'Trebles Marathon',
      description: 'Raak elke treble van 1-20 minstens één keer.',
      gameType: 'treble-marathon',
      targetScore: 0,
      rules: 'T1-T20. Minimaal één hit per treble. Darts totaal = score.',
      difficulty: 'advanced',
      dayOffset: 17
    },
    {
      name: 'Perfect 9 Darts',
      description: 'Simuleer een perfecte 9-darter. Hoe ver kom je in 9 darts?',
      gameType: '9-dart-sim',
      targetScore: 501,
      rules: '9 darts max. Huidige score na 9 darts is je resultaat. Hoe lager, hoe beter.',
      difficulty: 'advanced',
      dayOffset: 18
    },
    {
      name: 'Mixed Accuracy',
      description: 'Combineer singles, doubles en triples in één challenge.',
      gameType: 'mixed-accuracy',
      targetScore: 0,
      rules: '10 rondes: 5x T20, 5x D20. Raak zoveel mogelijk. T20=2pt, D20=1pt.',
      difficulty: 'intermediate',
      dayOffset: 19
    },
    {
      name: 'Pressure 170',
      description: 'Begin met 170 en probeer uit te checken. 3 pogingen.',
      gameType: 'checkout-pressure',
      targetScore: 170,
      rules: '3 pogingen om 170 uit te checken. Laagste aantal darts wint.',
      difficulty: 'advanced',
      dayOffset: 20
    }
  ];

  const challenges = await Promise.all(
    challengeTemplates.map((template) => {
      const scheduledAt = new Date(now.getTime() + template.dayOffset * oneDay);
      const expiresAt = new Date(scheduledAt.getTime() + 2 * oneDay); // 2 days duration

      return prisma.challenge.create({
        data: {
          name: template.name,
          description: template.description,
          gameType: template.gameType,
          targetScore: template.targetScore,
          rules: template.rules,
          difficulty: template.difficulty,
          scheduledAt,
          expiresAt
        }
      });
    })
  );

  console.log(`✅ Created ${challenges.length} challenges`);

  // Create some challenge scores for demo purposes (only for real users)
  const scoreData = [
    { userId: users[0].id, challengeId: challenges[0].id, score: 180 },
    { userId: users[1].id, challengeId: challenges[0].id, score: 165 },
    { userId: users[2].id, challengeId: challenges[0].id, score: 190 },
    { userId: users[0].id, challengeId: challenges[1].id, score: 15 },
    { userId: users[3].id, challengeId: challenges[1].id, score: 12 },
    { userId: users[4].id, challengeId: challenges[2].id, score: 2 },
    { userId: users[0].id, challengeId: challenges[2].id, score: 3 },
    { userId: users[1].id, challengeId: challenges[3].id, score: 25 },
    { userId: users[2].id, challengeId: challenges[3].id, score: 28 },
    { userId: users[3].id, challengeId: challenges[4].id, score: 75 },
    { userId: users[4].id, challengeId: challenges[4].id, score: 68 },
  ];

  for (const score of scoreData) {
    await prisma.challengeScore.create({
      data: score
    });
  }

  console.log(`✅ Created ${scoreData.length} challenge scores`);

  // Create sample training exercises
  await Promise.all([
    prisma.training.create({
      data: {
        name: '20 rondes op D20',
        description: 'Gooi 3 darts per ronde op double 20. Probeer zoveel mogelijk te raken.',
        gameType: 'accuracy',
        target: 'Zoveel mogelijk double 20s raken',
        difficulty: 'beginner',
        order: 1
      }
    }),
    prisma.training.create({
      data: {
        name: 'Treble Hunt',
        description: 'Begin bij T1 en werk door tot T20. Ga naar de volgende als je de treble raakt.',
        gameType: 'trebles',
        target: 'Alle trebles raken in zo min mogelijk darts',
        difficulty: 'intermediate',
        order: 2
      }
    }),
    prisma.training.create({
      data: {
        name: '501 Practice',
        description: 'Speel een solo 501 tegen jezelf. Probeer zo min mogelijk darts te gebruiken.',
        gameType: 'countdown',
        target: 'Uitchecken in zo min mogelijk darts',
        difficulty: 'intermediate',
        order: 3
      }
    }),
    prisma.training.create({
      data: {
        name: 'Bullseye Master',
        description: 'Focus op de bullseye. 30 darts, hoeveel hits?',
        gameType: 'accuracy',
        target: 'Zoveel mogelijk bullseyes raken',
        difficulty: 'beginner',
        order: 4
      }
    }),
    prisma.training.create({
      data: {
        name: 'Checkout Drill',
        description: 'Oefen uitchecken met verschillende scores: 40-170.',
        gameType: 'checkout',
        target: 'Oefen verschillende uitcheck scores',
        difficulty: 'advanced',
        order: 5
      }
    })
  ]);

  console.log('✅ Created training exercises');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
