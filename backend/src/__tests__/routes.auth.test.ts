import express, { Express } from 'express';
import authRoutes from '../routes/auth';
import { generateToken } from '../utils/jwt';

describe('Auth Routes', () => {
  it('should have auth routes defined', () => {
    expect(authRoutes).toBeDefined();
    expect(authRoutes.stack).toBeDefined();
    expect(authRoutes.stack.length).toBeGreaterThan(0);
  });

  it('should have multiple route handlers', () => {
    const routeCount = authRoutes.stack.length;
    expect(routeCount).toBeGreaterThanOrEqual(2); // At least signup and login
  });

  it('should handle POST requests', () => {
    const hasPostRoute = authRoutes.stack.some((r: any) => r.route && r.route.methods.post);
    expect(hasPostRoute).toBe(true);
  });
});
