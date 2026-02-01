import prisma from '../utils/prisma';

describe('Prisma Utils', () => {
  it('should have prisma client defined', () => {
    expect(prisma).toBeDefined();
  });

  it('should have user model', () => {
    expect(prisma.user).toBeDefined();
  });

  it('should have post model', () => {
    expect(prisma.post).toBeDefined();
  });

  it('should have pet model', () => {
    expect(prisma.pet).toBeDefined();
  });

  it('should have all expected model methods', () => {
    const modelMethods = ['findUnique', 'findMany', 'create', 'update', 'delete'];
    
    modelMethods.forEach(method => {
      expect(typeof prisma.user[method as keyof typeof prisma.user]).toBe('function');
    });
  });
});
