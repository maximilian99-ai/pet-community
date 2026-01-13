import { generateToken, verifyToken, decodeToken, TokenPayload } from '@/utils/jwt';

describe('JWT Utilities', () => {
  const payload: TokenPayload = {
    userId: 'test-user-123',
    email: 'test@example.com',
  };

  describe('generateToken', () => {
    it('should generate a valid token', () => {
      const token = generateToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.').length).toBe(3); // JWT format: header.payload.signature
    });

    it('should generate token with correct payload data', () => {
      const token = generateToken(payload);
      const decoded = decodeToken(token);
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = generateToken(payload);
      const verified = verifyToken(token);
      expect(verified).toBeDefined();
      expect(verified?.userId).toBe(payload.userId);
      expect(verified?.email).toBe(payload.email);
    });

    it('should return null for invalid token', () => {
      const verified = verifyToken('invalid.token.here');
      expect(verified).toBeNull();
    });

    it('should return null for tampered token', () => {
      const token = generateToken(payload);
      const tampered = token.slice(0, -5) + 'xxxxx';
      const verified = verifyToken(tampered);
      expect(verified).toBeNull();
    });
  });

  describe('decodeToken', () => {
    it('should decode a token without verification', () => {
      const token = generateToken(payload);
      const decoded = decodeToken(token);
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(payload.userId);
      expect(decoded?.email).toBe(payload.email);
    });

    it('should return null for invalid token format', () => {
      const decoded = decodeToken('not.a.token');
      expect(decoded).toBeNull();
    });
  });
});
