import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  createPetHandler,
  getUserPetsHandler,
  getPetHandler,
  updatePetHandler,
  deletePetHandler,
} from '../controllers/petController.js';

const router = Router();

// All pet routes require authentication
router.use(requireAuth);

// POST /api/pets - Create a new pet
router.post('/', createPetHandler);

// GET /api/pets - Get all user's pets (supports ?search=query)
router.get('/', getUserPetsHandler);

// GET /api/pets/:id - Get a single pet
router.get('/:id', getPetHandler);

// PATCH /api/pets/:id - Update a pet
router.patch('/:id', updatePetHandler);

// DELETE /api/pets/:id - Delete a pet (soft delete)
router.delete('/:id', deletePetHandler);

export default router;
