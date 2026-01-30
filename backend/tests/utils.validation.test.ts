import { describe, it, expect } from '@jest/globals';
import * as validation from '../src/utils/validation';

describe('Validation Utilities', () => {
  describe('isValidEmail', () => {
    it('should accept valid emails', () => {
      expect(validation.isValidEmail('test@example.com')).toBe(true);
      expect(validation.isValidEmail('user.name@example.co.uk')).toBe(true);
      expect(validation.isValidEmail('first+last@example.com')).toBe(true); // + is allowed
    });

    it('should reject invalid emails', () => {
      expect(validation.isValidEmail('')).toBe(false);
      expect(validation.isValidEmail('invalid')).toBe(false);
      expect(validation.isValidEmail('invalid@')).toBe(false);
      expect(validation.isValidEmail('@example.com')).toBe(false);
      expect(validation.isValidEmail('test@.com')).toBe(false);
      expect(validation.isValidEmail('test..name@example.com')).toBe(false);
    });

    it('should reject emails with spaces', () => {
      expect(validation.isValidEmail('test @example.com')).toBe(false);
      expect(validation.isValidEmail('test@ example.com')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidEmail(null as any)).toBe(false);
      expect(validation.isValidEmail(undefined as any)).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(validation.isValidEmail('  test@example.com  ')).toBe(true);
    });

    it('should reject emails that are too short or too long', () => {
      expect(validation.isValidEmail('a@b.co')).toBe(true); // minimum valid
      expect(validation.isValidEmail('a'.repeat(250) + '@example.com')).toBe(false); // too long
    });
  });

  describe('isValidPetName', () => {
    it('should accept valid pet names', () => {
      expect(validation.isValidPetName('Max')).toBe(true);
      expect(validation.isValidPetName('Lady Bug')).toBe(true);
      expect(validation.isValidPetName("O'Malley")).toBe(true);
      expect(validation.isValidPetName('Max-2')).toBe(true);
    });

    it('should reject invalid pet names', () => {
      expect(validation.isValidPetName('')).toBe(false);
      expect(validation.isValidPetName('  ')).toBe(false);
      expect(validation.isValidPetName('M@x')).toBe(false);
      expect(validation.isValidPetName('Max#')).toBe(false);
    });

    it('should reject names that are too long', () => {
      expect(validation.isValidPetName('a'.repeat(101))).toBe(false);
    });

    it('should accept names with exactly 100 characters', () => {
      expect(validation.isValidPetName('a'.repeat(100))).toBe(true);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidPetName(null as any)).toBe(false);
      expect(validation.isValidPetName(undefined as any)).toBe(false);
    });
  });

  describe('isValidUUID', () => {
    it('should accept valid UUIDs', () => {
      expect(validation.isValidUUID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validation.isValidUUID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validation.isValidUUID('not-a-uuid')).toBe(false);
      expect(validation.isValidUUID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(validation.isValidUUID('')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidUUID(null as any)).toBe(false);
      expect(validation.isValidUUID(undefined as any)).toBe(false);
    });
  });

  describe('isValidSpecies', () => {
    it('should accept valid species', () => {
      expect(validation.isValidSpecies('dog')).toBe(true);
      expect(validation.isValidSpecies('cat')).toBe(true);
      expect(validation.isValidSpecies('bird')).toBe(true);
      expect(validation.isValidSpecies('rabbit')).toBe(true);
      expect(validation.isValidSpecies('hamster')).toBe(true);
      expect(validation.isValidSpecies('guinea pig')).toBe(true);
      expect(validation.isValidSpecies('fish')).toBe(true);
      expect(validation.isValidSpecies('reptile')).toBe(true);
      expect(validation.isValidSpecies('other')).toBe(true);
    });

    it('should be case-insensitive', () => {
      expect(validation.isValidSpecies('DOG')).toBe(true);
      expect(validation.isValidSpecies('Cat')).toBe(true);
      expect(validation.isValidSpecies('GUINEA PIG')).toBe(true);
    });

    it('should reject invalid species', () => {
      expect(validation.isValidSpecies('dragon')).toBe(false);
      expect(validation.isValidSpecies('unicorn')).toBe(false);
      expect(validation.isValidSpecies('')).toBe(false);
    });
  });

  describe('isValidBreed', () => {
    it('should accept valid breeds', () => {
      expect(validation.isValidBreed('Golden Retriever')).toBe(true);
      expect(validation.isValidBreed('Shih-Tzu')).toBe(true);
      expect(validation.isValidBreed("St. John's Water Dog")).toBe(false); // period not allowed
    });

    it('should reject breeds that are too short or too long', () => {
      expect(validation.isValidBreed('')).toBe(false);
      expect(validation.isValidBreed('a'.repeat(101))).toBe(false);
    });

    it('should accept breeds with exactly 100 characters', () => {
      expect(validation.isValidBreed('a'.repeat(100))).toBe(true);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidBreed(null as any)).toBe(false);
      expect(validation.isValidBreed(undefined as any)).toBe(false);
    });
  });

  describe('isValidBirthDate', () => {
    it('should accept valid birth dates', () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 5);
      expect(validation.isValidBirthDate(pastDate.toISOString().split('T')[0])).toBe(true);
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      expect(validation.isValidBirthDate(futureDate.toISOString().split('T')[0])).toBe(false);
    });

    it('should reject dates more than 50 years ago', () => {
      const veryOldDate = new Date();
      veryOldDate.setFullYear(veryOldDate.getFullYear() - 51);
      expect(validation.isValidBirthDate(veryOldDate.toISOString().split('T')[0])).toBe(false);
    });

    it('should reject invalid date formats', () => {
      expect(validation.isValidBirthDate('invalid-date')).toBe(false);
      expect(validation.isValidBirthDate('2024-13-45')).toBe(false);
      expect(validation.isValidBirthDate('')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidBirthDate(null as any)).toBe(false);
      expect(validation.isValidBirthDate(undefined as any)).toBe(false);
    });
  });

  describe('isValidWeight', () => {
    it('should accept valid weights', () => {
      expect(validation.isValidWeight(10)).toBe(true);
      expect(validation.isValidWeight(0.5)).toBe(true);
      expect(validation.isValidWeight(100)).toBe(true);
    });

    it('should reject weights outside valid range', () => {
      expect(validation.isValidWeight(0)).toBe(false);
      expect(validation.isValidWeight(-5)).toBe(false);
      expect(validation.isValidWeight(0.05)).toBe(false); // below 0.1
      expect(validation.isValidWeight(350)).toBe(false); // above 300
    });

    it('should reject non-number inputs', () => {
      expect(validation.isValidWeight(NaN)).toBe(false);
      expect(validation.isValidWeight('10' as any)).toBe(false);
    });
  });

  describe('isValidColorDescription', () => {
    it('should accept valid color descriptions', () => {
      expect(validation.isValidColorDescription('Golden')).toBe(true);
      expect(validation.isValidColorDescription('White with orange patches')).toBe(true);
      expect(validation.isValidColorDescription('Black & tan')).toBe(true);
    });

    it('should reject descriptions that are too short or too long', () => {
      expect(validation.isValidColorDescription('')).toBe(false);
      expect(validation.isValidColorDescription('a'.repeat(201))).toBe(false);
    });

    it('should accept descriptions with exactly 200 characters', () => {
      expect(validation.isValidColorDescription('a'.repeat(200))).toBe(true);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidColorDescription(null as any)).toBe(false);
      expect(validation.isValidColorDescription(undefined as any)).toBe(false);
    });
  });

  describe('isValidMicrochipId', () => {
    it('should accept valid microchip IDs', () => {
      expect(validation.isValidMicrochipId('ABC123DEF456')).toBe(true);
      expect(validation.isValidMicrochipId('12345678')).toBe(true);
      expect(validation.isValidMicrochipId('ABCDEFGHIJ123456')).toBe(true);
    });

    it('should reject invalid microchip IDs', () => {
      expect(validation.isValidMicrochipId('ABC')).toBe(false); // too short
      expect(validation.isValidMicrochipId('ABC@DEF')).toBe(false); // special chars
      expect(validation.isValidMicrochipId('a'.repeat(21))).toBe(false); // too long
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidMicrochipId(null as any)).toBe(false);
      expect(validation.isValidMicrochipId(undefined as any)).toBe(false);
    });
  });

  describe('isValidNotes', () => {
    it('should accept valid notes', () => {
      expect(validation.isValidNotes('Friendly and energetic')).toBe(true);
      expect(validation.isValidNotes('Has a special diet')).toBe(true);
    });

    it('should reject notes that are too short or too long', () => {
      expect(validation.isValidNotes('')).toBe(false);
      expect(validation.isValidNotes('a'.repeat(1001))).toBe(false);
    });

    it('should accept notes with exactly 1000 characters', () => {
      expect(validation.isValidNotes('a'.repeat(1000))).toBe(true);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidNotes(null as any)).toBe(false);
      expect(validation.isValidNotes(undefined as any)).toBe(false);
    });
  });

  describe('sanitizeInput', () => {
    it('should trim whitespace', () => {
      expect(validation.sanitizeInput('  hello  ')).toBe('hello');
      expect(validation.sanitizeInput('\n\ttest\n')).toBe('test');
    });

    it('should return empty string for non-string inputs', () => {
      expect(validation.sanitizeInput(null as any)).toBe('');
      expect(validation.sanitizeInput(undefined as any)).toBe('');
    });
  });

  describe('isValidDisplayName', () => {
    it('should accept valid display names', () => {
      expect(validation.isValidDisplayName('John Doe')).toBe(true);
      expect(validation.isValidDisplayName("O'Brien")).toBe(true);
      expect(validation.isValidDisplayName('Jean-Pierre')).toBe(true);
    });

    it('should reject display names that are too short or too long', () => {
      expect(validation.isValidDisplayName('A')).toBe(false); // too short
      expect(validation.isValidDisplayName('a'.repeat(101))).toBe(false); // too long
    });

    it('should accept display names with exactly 100 characters', () => {
      expect(validation.isValidDisplayName('a'.repeat(100))).toBe(true);
    });

    it('should reject invalid characters', () => {
      expect(validation.isValidDisplayName('John@Doe')).toBe(false);
      expect(validation.isValidDisplayName('John_Doe')).toBe(false);
    });

    it('should reject non-string inputs', () => {
      expect(validation.isValidDisplayName(null as any)).toBe(false);
      expect(validation.isValidDisplayName(undefined as any)).toBe(false);
    });
  });

  describe('Integration tests', () => {
    it('should validate complete pet creation form', () => {
      const petData = {
        name: 'Max',
        species: 'dog',
        breed: 'Golden Retriever',
        birthDate: '2020-05-15',
        weight: 32.5,
        color: 'Golden',
        microchipId: 'ABC123DEF456',
        notes: 'Friendly and energetic',
      };

      expect(validation.isValidPetName(petData.name)).toBe(true);
      expect(validation.isValidSpecies(petData.species)).toBe(true);
      expect(validation.isValidBreed(petData.breed)).toBe(true);
      expect(validation.isValidBirthDate(petData.birthDate)).toBe(true);
      expect(validation.isValidWeight(petData.weight)).toBe(true);
      expect(validation.isValidColorDescription(petData.color)).toBe(true);
      expect(validation.isValidMicrochipId(petData.microchipId)).toBe(true);
      expect(validation.isValidNotes(petData.notes)).toBe(true);
    });

    it('should validate user registration form', () => {
      const userData = {
        email: 'john@example.com',
        displayName: 'John Doe',
      };

      expect(validation.isValidEmail(userData.email)).toBe(true);
      expect(validation.isValidDisplayName(userData.displayName)).toBe(true);
    });
  });
});
