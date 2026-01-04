import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { Auth } from 'firebase-admin/auth';
import type { DecodedIdToken } from 'firebase-admin/auth';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let mockAuth: jest.Mocked<Auth>;

  const mockDecodedToken: DecodedIdToken = {
    uid: 'test-uid',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    iss: 'https://securetoken.google.com/test-project',
    aud: 'test-project',
    auth_time: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    iat: Math.floor(Date.now() / 1000),
    sub: 'test-uid',
    firebase: {
      identities: {},
      sign_in_provider: 'password',
    },
  };

  const createMockExecutionContext = (
    headers: Record<string, string> = {},
  ): ExecutionContext => {
    const request = {
      headers,
    };
    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => ({}),
      }),
    } as ExecutionContext;
  };

  beforeEach(async () => {
    mockAuth = {
      verifyIdToken: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        {
          provide: 'FIREBASE_AUTH',
          useValue: mockAuth,
        },
      ],
    }).compile();

    guard = module.get<FirebaseAuthGuard>(FirebaseAuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer valid-token',
      });
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(context.switchToHttp().getRequest().user).toEqual(
        mockDecodedToken,
      );
    });

    it('should throw UnauthorizedException when authorization header is missing', async () => {
      const context = createMockExecutionContext({});

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuth.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when token is missing', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer ',
      });

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuth.verifyIdToken).not.toHaveBeenCalled();
    });

    it('should attempt to verify token even when Bearer prefix is missing', async () => {
      const context = createMockExecutionContext({
        authorization: 'valid-token',
      });
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await guard.canActivate(context);

      // The guard will try to verify the token as-is when Bearer is missing
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('valid-token');
      expect(result).toBe(true);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer invalid-token',
      });
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith('invalid-token');
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer expired-token',
      });
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should set user in request after successful verification', async () => {
      const context = createMockExecutionContext({
        authorization: 'Bearer valid-token',
      });
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      await guard.canActivate(context);

      const request = context.switchToHttp().getRequest();
      expect(request.user).toEqual(mockDecodedToken);
    });
  });
});
