import { createLogger } from './logger';

const logger = createLogger('Validation');

/**
 * Email regex pattern for validation
 * RFC 5322 simplified pattern - allows alphanumeric, dots, plus, and hyphens
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.+_-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Pet name regex - allows letters, numbers, spaces, hyphens, apostrophes
 */
const PET_NAME_REGEX = /^[a-zA-Z0-9\s\-']{1,100}$/;

/**
 * Validates an email address
 * @param email - Email address to validate
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  const trimmed = email.trim().toLowerCase();
  
  // Check minimum length
  if (trimmed.length < 3 || trimmed.length > 254) {
    return false;
  }

  // Check regex pattern
  if (!EMAIL_REGEX.test(trimmed)) {
    return false;
  }

  // Check no consecutive dots
  if (trimmed.includes('..')) {
    return false;
  }

  return true;
}

/**
 * Validates a pet name
 * @param name - Pet name to validate
 * @returns true if valid, false otherwise
 */
export function isValidPetName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();

  // Check length (1-100 characters)
  if (trimmed.length < 1 || trimmed.length > 100) {
    return false;
  }

  // Check allowed characters
  if (!PET_NAME_REGEX.test(trimmed)) {
    return false;
  }

  return true;
}

/**
 * Validates a UUID format (v1-v5)
 * @param uuid - UUID string to validate
 * @returns true if valid UUID, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates a pet species from allowed list
 * @param species - Species to validate
 * @returns true if valid species, false otherwise
 */
export function isValidSpecies(species: string): boolean {
  const validSpecies = ['dog', 'cat', 'bird', 'rabbit', 'hamster', 'guinea pig', 'fish', 'reptile', 'other'];
  return validSpecies.includes(species.toLowerCase());
}

/**
 * Validates a breed name
 * @param breed - Breed name to validate
 * @returns true if valid breed, false otherwise
 */
export function isValidBreed(breed: string): boolean {
  if (!breed || typeof breed !== 'string') {
    return false;
  }

  const trimmed = breed.trim();

  // Check length (1-100 characters)
  if (trimmed.length < 1 || trimmed.length > 100) {
    return false;
  }

  // Allow letters, numbers, spaces, hyphens, apostrophes, slashes
  const breedRegex = /^[a-zA-Z0-9\s\-'/]{1,100}$/;
  return breedRegex.test(trimmed);
}

/**
 * Validates a date of birth is reasonable (not in future, not too old)
 * @param dateString - Date string in ISO format (YYYY-MM-DD)
 * @returns true if valid birth date, false otherwise
 */
export function isValidBirthDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }

  try {
    const date = new Date(dateString);
    const now = new Date();

    // Date must be a valid date
    if (isNaN(date.getTime())) {
      return false;
    }

    // Date cannot be in the future
    if (date > now) {
      return false;
    }

    // Date cannot be more than 50 years ago (maximum pet lifespan + buffer)
    const fiftyYearsAgo = new Date();
    fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
    if (date < fiftyYearsAgo) {
      return false;
    }

    return true;
  } catch (error) {
    logger.warn('Error validating birth date', { dateString, error });
    return false;
  }
}

/**
 * Validates a weight in kg (reasonable pet weight range)
 * @param weight - Weight as number in kg
 * @returns true if valid weight, false otherwise
 */
export function isValidWeight(weight: number): boolean {
  if (typeof weight !== 'number' || isNaN(weight)) {
    return false;
  }

  // Reasonable range: 0.1 kg (100g) to 300 kg
  return weight > 0.1 && weight < 300;
}

/**
 * Validates a color description
 * @param color - Color description to validate
 * @returns true if valid color description, false otherwise
 */
export function isValidColorDescription(color: string): boolean {
  if (!color || typeof color !== 'string') {
    return false;
  }

  const trimmed = color.trim();

  // Check length (1-200 characters)
  if (trimmed.length < 1 || trimmed.length > 200) {
    return false;
  }

  return true;
}

/**
 * Validates a microchip ID format (alphanumeric, 8-20 characters)
 * @param microchipId - Microchip ID to validate
 * @returns true if valid microchip ID, false otherwise
 */
export function isValidMicrochipId(microchipId: string): boolean {
  if (!microchipId || typeof microchipId !== 'string') {
    return false;
  }

  const trimmed = microchipId.trim();
  const microchipRegex = /^[a-zA-Z0-9]{8,20}$/;
  return microchipRegex.test(trimmed);
}

/**
 * Validates general notes/description text
 * @param notes - Notes text to validate
 * @returns true if valid notes, false otherwise
 */
export function isValidNotes(notes: string): boolean {
  if (!notes || typeof notes !== 'string') {
    return false;
  }

  const trimmed = notes.trim();

  // Check length (1-1000 characters)
  if (trimmed.length < 1 || trimmed.length > 1000) {
    return false;
  }

  return true;
}

/**
 * Sanitizes user input by trimming and removing potentially harmful characters
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input.trim();
}

/**
 * Validates a displayName for users
 * @param name - Display name to validate
 * @returns true if valid display name, false otherwise
 */
export function isValidDisplayName(name: string): boolean {
  if (!name || typeof name !== 'string') {
    return false;
  }

  const trimmed = name.trim();

  // Check length (2-100 characters)
  if (trimmed.length < 2 || trimmed.length > 100) {
    return false;
  }

  // Allow letters, numbers, spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-Z0-9\s\-']{2,100}$/;
  return nameRegex.test(trimmed);
}

/**
 * Validates pet data for creation/update
 * @param data - Pet data to validate
 * @returns Object with valid boolean and errors array
 */
export function validatePet(data: {
  name?: string;
  species?: string;
  breed?: string;
  birthDate?: string;
  weight?: number;
  colorDescription?: string;
  microchipId?: string;
  notes?: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate name (required)
  if (!data.name) {
    errors.push('Name is required');
  } else if (!isValidPetName(data.name)) {
    errors.push('Name must be 1-100 characters and contain only letters, numbers, spaces, hyphens, and apostrophes');
  }

  // Validate species (required)
  if (!data.species) {
    errors.push('Species is required');
  } else if (!isValidSpecies(data.species)) {
    errors.push('Invalid species. Must be one of: dog, cat, bird, rabbit, hamster, guinea pig, fish, reptile, other');
  }

  // Validate breed (optional)
  if (data.breed && !isValidBreed(data.breed)) {
    errors.push('Breed must be 1-100 characters and contain only letters, numbers, spaces, hyphens, apostrophes, and slashes');
  }

  // Validate birthDate (optional)
  if (data.birthDate && !isValidBirthDate(data.birthDate)) {
    errors.push('Birth date must be a valid date, not in the future, and within the last 50 years');
  }

  // Validate weight (optional)
  if (data.weight !== undefined && !isValidWeight(data.weight)) {
    errors.push('Weight must be between 0.1 and 300 kg');
  }

  // Validate color description (optional)
  if (data.colorDescription && !isValidColorDescription(data.colorDescription)) {
    errors.push('Color description must be 1-200 characters');
  }

  // Validate microchip ID (optional)
  if (data.microchipId && !isValidMicrochipId(data.microchipId)) {
    errors.push('Microchip ID must be 8-20 alphanumeric characters');
  }

  // Validate notes (optional)
  if (data.notes && !isValidNotes(data.notes)) {
    errors.push('Notes must be 1-1000 characters');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
