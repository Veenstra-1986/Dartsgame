import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👤 Seeding test user...');

  // Check if test user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: 'test@dartspro.nl' }
  });

  if (existingUser) {
    console.log('✓ Test user already exists');
    console.log('  Email: test@dartspro.nl');
    console.log('  Password: test1234');
    console.log(`  User ID: ${existingUser.id}`);
    console.log(`\n💡 Tip: Save this to localStorage to test logged in features:`);
    console.log(`   localStorage.setItem('user', JSON.stringify({`);
    console.log(`     id: '${existingUser.id}',`);
    console.log(`     name: '${existingUser.name}',`);
    console.log(`     email: '${existingUser.email}'`);
    console.log(`   }))`);
    return;
  }

  // Create test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@dartspro.nl',
      name: 'Test Speler',
      password: '$2a$10$7K3j8Z9Z4X5Y6W7V8U9I0O1P2Q3R4S5T6U7V8W9X0Y1Z2', // test1234 (bcrypt)
      verified: true,
      accentColor: 'emerald',
      groupName: 'Test Darts'
    }
  });

  console.log('✓ Test user created successfully!');
  console.log('  Email: test@dartspro.nl');
  console.log('  Password: test1234');
  console.log(`  User ID: ${testUser.id}`);
  console.log(`\n💡 Tip: Save this to localStorage to test logged in features:`);
  console.log(`   localStorage.setItem('user', JSON.stringify({`);
  console.log(`     id: '${testUser.id}',`);
  console.log(`     name: '${testUser.name}',`);
  console.log(`     email: '${testUser.email}'`);
  console.log(`   }))`);

  // Create a test group if it doesn't exist
  const existingGroup = await prisma.group.findFirst({
    where: { name: 'Test Groep' }
  });

  let groupId;
  if (!existingGroup) {
    const group = await prisma.group.create({
      data: {
        name: 'Test Groep',
        code: 'TEST123',
        description: 'Een test groep voor het testen van de app'
      }
    });
    groupId = group.id;
    console.log(`\n✓ Test group created: ${group.id}`);
  } else {
    groupId = existingGroup.id;
    console.log(`\n✓ Test group already exists: ${groupId}`);
  }

  // Add test user to the group
  const existingMember = await prisma.groupMember.findFirst({
    where: {
      userId: testUser.id,
      groupId
    }
  });

  if (!existingMember) {
    await prisma.groupMember.create({
      data: {
        userId: testUser.id,
        groupId,
        role: 'admin'
      }
    });
    console.log(`✓ Test user added to group as admin`);
  } else {
    console.log(`✓ Test user is already a member of the group`);
  }

  console.log('\n✅ Test user setup complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding test user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
