import { Request, Response } from 'express';
import {
  createPet,
  getUserPets,
  getPetById,
  updatePet,
  deletePet,
  searchPets,
} from '../services/petService.js';
import { createLogger } from '../utils/logger.js';
import { validatePet } from '../utils/validation.js';

const logger = createLogger('PetController');

/**
 * POST /api/pets - Create a new pet
 */
export async function createPetHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }

    const { name, species, breed, birthDate, weight, colorDescription, microchipId, notes, profilePictureUrl } = req.body;

    // Validate pet data
    const validation = validatePet({
      name,
      species,
      breed,
      birthDate,
      weight,
    });

    if (!validation.valid) {
      return res.status(400).json({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        details: validation.errors,
      });
    }

    const pet = await createPet(userId, {
      name,
      species,
      breed,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      weight,
      colorDescription,
      microchipId,
      notes,
      profilePictureUrl,
    });

    return res.status(201).json({
      data: { pet },
      message: 'Pet created successfully',
    });
  } catch (error) {
    logger.error('Error creating pet', { error });
    return res.status(500).json({
      error: 'Failed to create pet',
      code: 'CREATE_FAILED',
    });
  }
}

/**
 * GET /api/pets - Get all pets for the current user
 */
export async function getUserPetsHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }

    const { search } = req.query;

    let pets;
    if (search && typeof search === 'string') {
      pets = await searchPets(userId, search);
    } else {
      pets = await getUserPets(userId);
    }

    return res.json({
      data: { pets, count: pets.length },
    });
  } catch (error) {
    logger.error('Error fetching pets', { error });
    return res.status(500).json({
      error: 'Failed to fetch pets',
      code: 'FETCH_FAILED',
    });
  }
}

/**
 * GET /api/pets/:id - Get a single pet by ID
 */
export async function getPetHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }

    const pet = await getPetById(id, userId);

    if (!pet) {
      return res.status(404).json({
        error: 'Pet not found',
        code: 'PET_NOT_FOUND',
      });
    }

    return res.json({
      data: { pet },
    });
  } catch (error) {
    logger.error('Error fetching pet', { error });
    return res.status(500).json({
      error: 'Failed to fetch pet',
      code: 'FETCH_FAILED',
    });
  }
}

/**
 * PATCH /api/pets/:id - Update a pet
 */
export async function updatePetHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }

    const { name, species, breed, birthDate, weight, colorDescription, microchipId, notes, profilePictureUrl } = req.body;

    // Validate only provided fields (for partial updates)
    if (name !== undefined || species !== undefined || breed !== undefined || birthDate !== undefined || weight !== undefined) {
      // Get current pet to fill in missing required fields for validation
      const currentPet = await getPetById(id, userId);
      if (!currentPet) {
        return res.status(404).json({
          error: 'Pet not found or access denied',
          code: 'PET_NOT_FOUND',
        });
      }

      const validation = validatePet({
        name: name !== undefined ? name : currentPet.name,
        species: species !== undefined ? species : currentPet.species,
        breed: breed !== undefined ? breed : currentPet.breed || undefined,
        birthDate: birthDate || undefined,
        weight: weight !== undefined ? weight : (currentPet.weight ? parseFloat(currentPet.weight.toString()) : undefined),
      });

      if (!validation.valid) {
        return res.status(400).json({
          error: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors,
        });
      }
    }

    const pet = await updatePet(id, userId, {
      name,
      species,
      breed,
      birthDate: birthDate ? new Date(birthDate) : undefined,
      weight,
      colorDescription,
      microchipId,
      notes,
      profilePictureUrl,
    });

    return res.json({
      data: { pet },
      message: 'Pet updated successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Pet not found or access denied',
        code: 'PET_NOT_FOUND',
      });
    }

    logger.error('Error updating pet', { error });
    return res.status(500).json({
      error: 'Failed to update pet',
      code: 'UPDATE_FAILED',
    });
  }
}

/**
 * DELETE /api/pets/:id - Delete a pet (soft delete)
 */
export async function deletePetHandler(req: Request, res: Response) {
  try {
    const userId = (req as any).userId as string;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized', code: 'AUTH_REQUIRED' });
    }

    await deletePet(id, userId);

    return res.json({
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Pet not found or access denied',
        code: 'PET_NOT_FOUND',
      });
    }

    logger.error('Error deleting pet', { error });
    return res.status(500).json({
      error: 'Failed to delete pet',
      code: 'DELETE_FAILED',
    });
  }
}
