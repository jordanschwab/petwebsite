import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data (be careful with this in production!)
  await prisma.auditLog.deleteMany();
  await prisma.petHealthRecord.deleteMany();
  await prisma.petPhoto.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seeding database...');

  // Create a test user
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      googleId: 'test-google-id-123',
      displayName: 'Test User',
      profilePictureUrl: 'https://example.com/pic.jpg',
      timezone: 'America/New_York',
    },
  });

  console.log(`Created user: ${testUser.email}`);

  // Create sample pets
  const dog = await prisma.pet.create({
    data: {
      userId: testUser.id,
      name: 'Max',
      species: 'dog',
      breed: 'Golden Retriever',
      birthDate: new Date('2020-05-15'),
      weight: 32.5,
      colorDescription: 'Golden',
      notes: 'Friendly and energetic',
      createdBy: testUser.id,
    },
  });

  const cat = await prisma.pet.create({
    data: {
      userId: testUser.id,
      name: 'Whiskers',
      species: 'cat',
      breed: 'Persian',
      birthDate: new Date('2021-03-20'),
      weight: 4.5,
      colorDescription: 'White with orange patches',
      notes: 'Calm and affectionate',
      createdBy: testUser.id,
    },
  });

  console.log(`Created pets: ${dog.name}, ${cat.name}`);

  // Create health records
  await prisma.petHealthRecord.create({
    data: {
      petId: dog.id,
      userId: testUser.id,
      recordType: 'vaccination',
      title: 'Rabies Vaccination',
      description: 'Annual rabies vaccination',
      recordedDate: new Date('2024-01-15'),
      expirationDate: new Date('2025-01-15'),
    },
  });

  await prisma.petHealthRecord.create({
    data: {
      petId: dog.id,
      userId: testUser.id,
      recordType: 'checkup',
      title: 'Annual Checkup',
      description: 'Annual veterinary checkup - all good',
      recordedDate: new Date('2024-01-20'),
    },
  });

  console.log('Created health records');

  // Log audit entry
  await prisma.auditLog.create({
    data: {
      userId: testUser.id,
      entityType: 'Pet',
      entityId: dog.id,
      action: 'CREATE',
      changes: {
        created: {
          name: dog.name,
          species: dog.species,
        },
      },
    },
  });

  console.log('Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
