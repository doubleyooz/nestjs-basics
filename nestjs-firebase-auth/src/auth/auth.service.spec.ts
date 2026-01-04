import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Auth } from 'firebase-admin/auth';
import type { DecodedIdToken, UserRecord } from 'firebase-admin/auth';

describe('AuthService', () => {
  let service: AuthService;
  let mockAuth: jest.Mocked<Auth>;

  const mockDecodedToken: DecodedIdToken = {
    uid: 'test-uid',
    email: 'test@example.com',
    email_verified: true,
    name: 'Test User',
    picture: 'https://example.com/picture.jpg',
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

  const mockUserRecord: UserRecord = {
    uid: 'test-uid',
    email: 'test@example.com',
    emailVerified: true,
    displayName: 'Test User',
    photoURL: 'https://example.com/picture.jpg',
    disabled: false,
    metadata: {
      creationTime: new Date().toISOString(),
      lastSignInTime: new Date().toISOString(),
    },
    providerData: [],
    customClaims: {},
    toJSON: jest.fn(),
  };

  beforeEach(async () => {
    mockAuth = {
      verifyIdToken: jest.fn(),
      getUser: jest.fn(),
      revokeRefreshTokens: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: 'FIREBASE_AUTH',
          useValue: mockAuth,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should verify and return decoded token for valid token', async () => {
      const idToken = 'valid-token';
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await service.verifyToken(idToken);

      expect(result).toEqual(mockDecodedToken);
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(idToken);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const idToken = 'invalid-token';
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Invalid token'));

      await expect(service.verifyToken(idToken)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(idToken);
    });

    it('should throw UnauthorizedException for expired token', async () => {
      const idToken = 'expired-token';
      mockAuth.verifyIdToken.mockRejectedValue(new Error('Token expired'));

      await expect(service.verifyToken(idToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getUserByUid', () => {
    it('should return user record for valid uid', async () => {
      const uid = 'test-uid';
      mockAuth.getUser.mockResolvedValue(mockUserRecord);

      const result = await service.getUserByUid(uid);

      expect(result).toEqual(mockUserRecord);
      expect(mockAuth.getUser).toHaveBeenCalledWith(uid);
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      const uid = 'non-existent-uid';
      mockAuth.getUser.mockRejectedValue(new Error('User not found'));

      await expect(service.getUserByUid(uid)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('revokeRefreshTokens', () => {
    it('should successfully revoke refresh tokens', async () => {
      const uid = 'test-uid';
      mockAuth.revokeRefreshTokens.mockResolvedValue();

      await service.revokeRefreshTokens(uid);

      expect(mockAuth.revokeRefreshTokens).toHaveBeenCalledWith(uid);
    });

    it('should throw UnauthorizedException on failure', async () => {
      const uid = 'test-uid';
      mockAuth.revokeRefreshTokens.mockRejectedValue(
        new Error('Revoke failed'),
      );

      await expect(service.revokeRefreshTokens(uid)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
