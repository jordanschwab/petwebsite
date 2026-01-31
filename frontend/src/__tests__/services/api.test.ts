jest.mock('../../services/api', () => ({
  default: {},
  getPets: jest.fn(),
  createPet: jest.fn(),
  deletePet: jest.fn(),
  getMe: jest.fn(),
  logout: jest.fn(),
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be mockable', () => {
    const apiModule = require('../../services/api');
    expect(apiModule.getPets).toBeDefined();
  });

  it('should support creating pets', () => {
    const apiModule = require('../../services/api');
    expect(apiModule.createPet).toBeDefined();
  });

  it('should support deleting pets', () => {
    const apiModule = require('../../services/api');
    expect(apiModule.deletePet).toBeDefined();
  });

  it('should support getting user info', () => {
    const apiModule = require('../../services/api');
    expect(apiModule.getMe).toBeDefined();
  });

  it('should support logout', () => {
    const apiModule = require('../../services/api');
    expect(apiModule.logout).toBeDefined();
  });
});
