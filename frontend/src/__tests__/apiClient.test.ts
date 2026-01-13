/**
 * @jest-environment jsdom
 */

import { apiClient } from '@/api/client';

describe('API Client', () => {
  it('should be defined', () => {
    expect(apiClient).toBeDefined();
  });

  it('should have required methods', () => {
    expect(apiClient.get).toBeDefined();
    expect(apiClient.post).toBeDefined();
    expect(apiClient.put).toBeDefined();
    expect(apiClient.delete).toBeDefined();
  });

  it('should have interceptors configured', () => {
    expect(apiClient.interceptors).toBeDefined();
    expect(apiClient.interceptors.request).toBeDefined();
    expect(apiClient.interceptors.response).toBeDefined();
  });

  describe('Request Interceptor', () => {
    it('should be configured', () => {
      expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
    });
  });

  describe('Response Interceptor', () => {
    it('should be configured', () => {
      expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
    });
  });
});
