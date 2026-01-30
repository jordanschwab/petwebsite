import { PrismaClient, Pet } from '@prisma/client';
import { createLogger } from '../utils/logger.js';

const logger = createLogger('PetService');
const prisma = new PrismaClient();

export interface CreatePetInput {
  name: string;
  species: string;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  colorDescription?: string;
  microchipId?: string;
  notes?: string;
  profilePictureUrl?: string;
}

export interface UpdatePetInput {
  name?: string;
  species?: string;
  breed?: string;
  birthDate?: Date;
  weight?: number;
  colorDescription?: string;
  microchipId?: string;
  notes?: string;
  profilePictureUrl?: string;
}

/**
 * Create a new pet for a user
 */
export async function createPet(userId: string, input: CreatePetInput): Promise<Pet> {
  const pet = await prisma.pet.create({
    data: {
      ...input,
      userId,
      createdBy: userId,
      weight: input.weight ? input.weight.toString() : null,
    },
  });

  logger.info('Pet created', { petId: pet.id, userId });
  return pet;
}

/**
 * Get all pets for a user (excluding soft-deleted)
 */
export async function getUserPets(userId: string): Promise<Pet[]> {
  const pets = await prisma.pet.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return pets;
}

/**
 * Get a single pet by ID (with ownership check)
 */
export async function getPetById(petId: string, userId: string): Promise<Pet | null> {
  const pet = await prisma.pet.findFirst({
    where: {
      id: petId,
      userId,
      deletedAt: null,
    },
  });

  return pet;
}

/**
 * Update a pet
 */
export async function updatePet(
  petId: string,
  userId: string,
  input: UpdatePetInput
): Promise<Pet> {
  // First check ownership
  const existingPet = await getPetById(petId, userId);
  if (!existingPet) {
    throw new Error('Pet not found or access denied');
  }

  const updatedPet = await prisma.pet.update({
    where: { id: petId },
    data: {
      ...input,
      weight: input.weight !== undefined ? input.weight.toString() : undefined,
      updatedAt: new Date(),
    },
  });

  logger.info('Pet updated', { petId, userId });
  return updatedPet;
}

/**
 * Soft delete a pet
 */
export async function deletePet(petId: string, userId: string): Promise<void> {
  // First check ownership
  const existingPet = await getPetById(petId, userId);
  if (!existingPet) {
    throw new Error('Pet not found or access denied');
  }

  await prisma.pet.update({
    where: { id: petId },
    data: {
      deletedAt: new Date(),
    },
  });

  logger.info('Pet deleted (soft)', { petId, userId });
}

/**
 * Search pets by name or species
 */
export async function searchPets(userId: string, query: string): Promise<Pet[]> {
  const pets = await prisma.pet.findMany({
    where: {
      userId,
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { species: { contains: query, mode: 'insensitive' } },
        { breed: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: {
      name: 'asc',
    },
  });

  return pets;
}
