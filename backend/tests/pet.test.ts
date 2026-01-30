import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { signToken } from '../src/utils/jwt.js';
import petRoutes from '../src/routes/pets.js';
import { authenticateToken } from '../src/middleware/auth.js';
import { errorHandler } from '../src/middleware/errorHandler.js';

const prisma = new PrismaClient();

// Create express app for testing
const app = express();
app.use(express.json());
app.use(authenticateToken);
app.use('/api/pets', petRoutes);
app.use(errorHandler);

describe('Pet CRUD Operations', () => {
  let testUserId: string;
  let testToken: string;
  let anotherUserId: string;
  let anotherUserToken: string;
  let testPetId: string;

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.pet.deleteMany({
      where: {
        OR: [
          { user: { email: { contains: 'pettest' } } },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: { email: { contains: 'pettest' } },
    });

    // Create test users
    const testUser = await prisma.user.create({
      data: {
        email: 'pettest1@example.com',
        googleId: 'google-pet-test-1',
        displayName: 'Pet Test User 1',
      },
    });
    testUserId = testUser.id;
    testToken = signToken(testUserId);

    const anotherUser = await prisma.user.create({
      data: {
        email: 'pettest2@example.com',
        googleId: 'google-pet-test-2',
        displayName: 'Pet Test User 2',
      },
    });
    anotherUserId = anotherUser.id;
    anotherUserToken = signToken(anotherUserId);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.pet.deleteMany({
      where: {
        OR: [
          { userId: testUserId },
          { userId: anotherUserId },
        ],
      },
    });
    await prisma.user.deleteMany({
      where: {
        id: { in: [testUserId, anotherUserId] },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /api/pets - Create Pet', () => {
    it('should create a new pet with required fields only', async () => {
      const petData = {
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(201);

      expect(response.body.data.pet).toMatchObject({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        userId: testUserId,
      });
      expect(response.body.data.pet.id).toBeDefined();
      expect(response.body.message).toBe('Pet created successfully');

      testPetId = response.body.data.pet.id;
    });

    it('should create a pet with all fields', async () => {
      const petData = {
        name: 'Whiskers',
        species: 'cat',
        breed: 'Persian',
        birthDate: '2020-05-15',
        weight: 4.5,
        colorDescription: 'White with gray patches',
        microchipId: 'ABC123456789',
        notes: 'Loves tuna and belly rubs',
        profilePictureUrl: 'https://example.com/whiskers.jpg',
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(201);

      expect(response.body.data.pet).toMatchObject({
        name: petData.name,
        species: petData.species,
        breed: petData.breed,
        colorDescription: petData.colorDescription,
        microchipId: petData.microchipId,
        notes: petData.notes,
        profilePictureUrl: petData.profilePictureUrl,
        userId: testUserId,
      });
      expect(response.body.data.pet.birthDate).toBeDefined();
      expect(parseFloat(response.body.data.pet.weight)).toBe(petData.weight);
    });

    it('should reject pet creation without authentication', async () => {
      const petData = {
        name: 'Fluffy',
        species: 'cat',
      };

      await request(app)
        .post('/api/pets')
        .send(petData)
        .expect(401);
    });

    it('should reject pet creation without required name', async () => {
      const petData = {
        species: 'dog',
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toContain('Name is required');
    });

    it('should reject pet creation without required species', async () => {
      const petData = {
        name: 'Rex',
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details).toContain('Species is required');
    });

    it('should reject pet creation with invalid species', async () => {
      const petData = {
        name: 'Dragon',
        species: 'dragon',
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details[0]).toContain('Invalid species');
    });

    it('should reject pet creation with invalid weight', async () => {
      const petData = {
        name: 'Tiny',
        species: 'hamster',
        weight: 0.05, // Too light
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details[0]).toContain('Weight must be between 0.1 and 300 kg');
    });

    it('should reject pet creation with future birth date', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const petData = {
        name: 'TimeTraveler',
        species: 'cat',
        birthDate: futureDate.toISOString().split('T')[0],
      };

      const response = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .send(petData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
      expect(response.body.details[0]).toContain('not in the future');
    });
  });

  describe('GET /api/pets - List Pets', () => {
    it('should return all pets for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pets).toBeInstanceOf(Array);
      expect(response.body.data.pets.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pets.every((pet: any) => pet.userId === testUserId)).toBe(true);
      expect(response.body.data.pets.every((pet: any) => !pet.deletedAt)).toBe(true);
    });

    it('should return empty array for user with no pets', async () => {
      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(200);

      expect(response.body.data.pets).toEqual([]);
    });

    it('should reject listing pets without authentication', async () => {
      await request(app)
        .get('/api/pets')
        .expect(401);
    });
  });

  describe('GET /api/pets/:id - Get Single Pet', () => {
    it('should return a specific pet by ID', async () => {
      const response = await request(app)
        .get(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pet).toMatchObject({
        id: testPetId,
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        userId: testUserId,
      });
    });

    it('should reject access to another user\'s pet', async () => {
      const response = await request(app)
        .get(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .expect(404);

      expect(response.body.code).toBe('PET_NOT_FOUND');
    });

    it('should return 404 for non-existent pet', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/pets/${fakeId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.code).toBe('PET_NOT_FOUND');
    });

    it('should reject getting pet without authentication', async () => {
      await request(app)
        .get(`/api/pets/${testPetId}`)
        .expect(401);
    });
  });

  describe('GET /api/pets?search=query - Search Pets', () => {
    beforeAll(async () => {
      // Create some test pets for searching
      await prisma.pet.createMany({
        data: [
          {
            userId: testUserId,
            name: 'Charlie',
            species: 'dog',
            breed: 'Beagle',
            createdBy: testUserId,
          },
          {
            userId: testUserId,
            name: 'Luna',
            species: 'cat',
            breed: 'Siamese',
            createdBy: testUserId,
          },
        ],
      });
    });

    it('should search pets by name', async () => {
      const response = await request(app)
        .get('/api/pets?search=Buddy')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pets.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.pets.some((pet: any) => pet.name === 'Buddy')).toBe(true);
    });

    it('should search pets by species', async () => {
      const response = await request(app)
        .get('/api/pets?search=dog')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pets.length).toBeGreaterThanOrEqual(2);
      expect(response.body.data.pets.every((pet: any) => pet.species === 'dog')).toBe(true);
    });

    it('should search pets by breed', async () => {
      const response = await request(app)
        .get('/api/pets?search=Beagle')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pets.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.pets.some((pet: any) => pet.breed === 'Beagle')).toBe(true);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/pets?search=NonexistentPetName12345')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pets).toEqual([]);
    });

    it('should be case-insensitive', async () => {
      const response = await request(app)
        .get('/api/pets?search=BUDDY')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.data.pets.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data.pets.some((pet: any) => pet.name === 'Buddy')).toBe(true);
    });
  });

  describe('PATCH /api/pets/:id - Update Pet', () => {
    let petToUpdate: string;

    beforeAll(async () => {
      // Create a pet specifically for update tests
      const pet = await prisma.pet.create({
        data: {
          userId: testUserId,
          name: 'UpdateTestPet',
          species: 'dog',
          createdBy: testUserId,
        },
      });
      petToUpdate = pet.id;
    });

    it('should update pet name', async () => {
      const updatedData = {
        name: 'Buddy Junior',
      };

      const response = await request(app)
        .patch(`/api/pets/${petToUpdate}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData);

      if (response.status !== 200) {
        console.log('Update name failed:', response.body);
      }
      
      expect(response.status).toBe(200);
      expect(response.body.data.pet.name).toBe(updatedData.name);
      expect(response.body.data.pet.id).toBe(petToUpdate);
    });

    it('should update multiple fields', async () => {
      const updatedData = {
        breed: 'Labrador Retriever',
        weight: 32.5,
        notes: 'Very energetic and loves swimming',
      };

      const response = await request(app)
        .patch(`/api/pets/${petToUpdate}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData)
        .expect(200);

      expect(response.body.data.pet.breed).toBe(updatedData.breed);
      expect(parseFloat(response.body.data.pet.weight)).toBe(updatedData.weight);
      expect(response.body.data.pet.notes).toBe(updatedData.notes);
    });

    it('should reject update to another user\'s pet', async () => {
      const updatedData = {
        name: 'Hacked',
      };

      const response = await request(app)
        .patch(`/api/pets/${petToUpdate}`)
        .set('Authorization', `Bearer ${anotherUserToken}`)
        .send(updatedData)
        .expect(404);

      expect(response.body.code).toBe('PET_NOT_FOUND');
    });

    it('should reject update with invalid data', async () => {
      const updatedData = {
        species: 'invalid-species',
      };

      const response = await request(app)
        .patch(`/api/pets/${petToUpdate}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updatedData)
        .expect(400);

      expect(response.body.code).toBe('VALIDATION_ERROR');
    });

    it('should reject update without authentication', async () => {
      await request(app)
        .patch(`/api/pets/${petToUpdate}`)
        .send({ name: 'Test' })
        .expect(401);
    });
  });

  describe('DELETE /api/pets/:id - Delete Pet (Soft Delete)', () => {
    it('should soft delete a pet', async () => {
      const response = await request(app)
        .delete(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      expect(response.body.message).toContain('deleted successfully');

      // Verify it's soft deleted
      const deletedPet = await prisma.pet.findUnique({
        where: { id: testPetId },
      });
      expect(deletedPet).not.toBeNull();
      expect(deletedPet?.deletedAt).not.toBeNull();
    });

    it('should not return soft-deleted pets in list', async () => {
      const response = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${testToken}`)
        .expect(200);

      const deletedPetInList = response.body.data.pets.find((pet: any) => pet.id === testPetId);
      expect(deletedPetInList).toBeUndefined();
    });

    it('should return 404 when trying to get soft-deleted pet', async () => {
      const response = await request(app)
        .get(`/api/pets/${testPetId}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.code).toBe('PET_NOT_FOUND');
    });

    it('should reject delete of another user\'s pet', async () => {
      // First create a pet for another user
      const otherUserPet = await prisma.pet.create({
        data: {
          userId: anotherUserId,
          name: 'Protected Pet',
          species: 'dog',
          createdBy: anotherUserId,
        },
      });

      const response = await request(app)
        .delete(`/api/pets/${otherUserPet.id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .expect(404);

      expect(response.body.code).toBe('PET_NOT_FOUND');

      // Clean up
      await prisma.pet.delete({ where: { id: otherUserPet.id } });
    });

    it('should reject delete without authentication', async () => {
      await request(app)
        .delete(`/api/pets/${testPetId}`)
        .expect(401);
    });
  });
});
