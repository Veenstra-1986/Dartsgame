import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Seeding invite test user...');

  // Check if invite test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'invite@dartspro.nl' }
  });

  if (existingUser) {
    console.log('✓ Invite test user already exists');
    console.log('  Email: invite@dartspro.nl');
    console.log('  Password: invite1234');
    console.log(`  User ID: ${existingUser.id}`);
    return;
  }

  // Create invite test user
  const testUser = await prisma.user.create({
    data: {
      email: 'invite@dartspro.nl',
      name: 'Invite Test',
      password: '$2a$10$X9Y8Z7W6V5U4T3S2R1Q0P9O8I7U6Y5T4R3S2Q1W0E9R8', // invite1234 (bcrypt)
      verified: true,
      accentColor: 'blue'
    }
  });

  // Get the test group
  const group = await prisma.group.findFirst({
    where: { name: 'Test Groep' }
  });

  if (group) {
    // Add invite test user to the group
    await prisma.groupMember.create({
      data: {
        userId: testUser.id,
        groupId: group.id,
        role: 'member'
      }
    });
    console.log(`✓ Invite test user added to group`);
  }

  console.log('✓ Invite test user created successfully!');
  console.log('  Email: invite@dartspro.nl');
  console.log('  Password: invite1234');
  console.log(`  User ID: ${testUser.id}`);

  console.log('\n✅ Invite test user setup complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding invite test user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
