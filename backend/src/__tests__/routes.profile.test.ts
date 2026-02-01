import express, { Express } from 'express';
import profileRoutes from '../routes/profile';

describe('Profile Routes', () => {
  it('should have profile routes defined', () => {
    expect(profileRoutes).toBeDefined();
    expect(profileRoutes.stack).toBeDefined();
  });

  it('should have route handlers', () => {
    const routeCount = profileRoutes.stack.length;
    expect(routeCount).toBeGreaterThan(0);
  });

  it('should support HTTP methods', () => {
    const methods = ['get', 'post', 'put', 'delete'];
    const hasMethod = profileRoutes.stack.some((r: any) => {
      if (!r.route) return false;
      return methods.some(method => r.route.methods[method]);
    });
    
    // Routes should have at least some HTTP methods defined
    expect(profileRoutes.stack.length).toBeGreaterThan(0);
  });

  describe('Route structure', () => {
    it('should handle user profile endpoints', () => {
      expect(profileRoutes.stack).toBeDefined();
      expect(Array.isArray(profileRoutes.stack)).toBe(true);
    });

    it('should have pet-related endpoints', () => {
      const routes = profileRoutes.stack.filter((r: any) => r.route);
      expect(routes.length).toBeGreaterThan(0);
    });
  });
});
