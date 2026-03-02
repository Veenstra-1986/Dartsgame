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

  // Create sample challenges
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const challenges = await Promise.all([
    prisma.challenge.create({
      data: {
        name: 'Maandag Mayhem',
        description: 'Start de week goed! Speel een 501 en probeer uit te checken in minder dan 18 darts.',
        gameType: '501',
        targetScore: 501,
        rules: 'Double-out modus. Houd je darts bij. Bonuspunten voor sub-18 finishes.',
        scheduledAt: yesterday,
        expiresAt: tomorrow
      }
    }),
    prisma.challenge.create({
      data: {
        name: 'Dinsdag Trebles',
        description: 'Alleen trebles tellen! Raak zo veel mogelijk trebles in 10 rondes.',
        gameType: 'treble-hunt',
        targetScore: 0,
        rules: 'T1-T20 in volgorde. 3 darts per nummer. Dubbele punten voor T20.',
        scheduledAt: now,
        expiresAt: weekFromNow
      }
    })
  ]);

  console.log(`✅ Created ${challenges.length} challenges`);

  // Create sample challenge scores
  await prisma.challengeScore.create({
    data: {
      userId: users[0].id,
      challengeId: challenges[0].id,
      score: 180
    }
  });

  await prisma.challengeScore.create({
    data: {
      userId: users[1].id,
      challengeId: challenges[0].id,
      score: 165
    }
  });

  console.log('✅ Created sample scores');

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
