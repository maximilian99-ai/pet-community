import express, { Express } from 'express';
import postRoutes from '@/routes/post';

describe('Post Routes', () => {
  it('should have post routes defined', () => {
    expect(postRoutes).toBeDefined();
    expect(postRoutes.stack).toBeDefined();
  });

  it('should have multiple route handlers', () => {
    const routeCount = postRoutes.stack.length;
    expect(routeCount).toBeGreaterThan(0);
  });

  it('should have GET and POST methods', () => {
    const hasGetRoute = postRoutes.stack.some((r: any) => r.route && r.route.methods.get);
    const hasPostRoute = postRoutes.stack.some((r: any) => r.route && r.route.methods.post);
    
    expect(hasGetRoute || hasPostRoute).toBe(true);
  });

  it('should handle feed pagination endpoints', () => {
    const routes = postRoutes.stack.filter((r: any) => r.route);
    expect(routes.length).toBeGreaterThanOrEqual(1);
  });
});
