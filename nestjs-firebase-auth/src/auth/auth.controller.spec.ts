import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto/verify-token.dto';
import type { DecodedIdToken } from 'firebase-admin/auth';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

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

  beforeEach(async () => {
    const mockAuthService = {
      verifyToken: jest.fn(),
      getUserByUid: jest.fn(),
      revokeRefreshTokens: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: 'FIREBASE_AUTH',
          useValue: {
            verifyIdToken: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('verifyToken', () => {
    it('should verify token and return user info', async () => {
      const verifyTokenDto: VerifyTokenDto = { idToken: 'valid-token' };
      authService.verifyToken.mockResolvedValue(mockDecodedToken);

      const result = await controller.verifyToken(verifyTokenDto);

      expect(result).toEqual({
        valid: true,
        uid: mockDecodedToken.uid,
        email: mockDecodedToken.email,
        name: mockDecodedToken.name,
      });
      expect(authService.verifyToken).toHaveBeenCalledWith(
        verifyTokenDto.idToken,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const verifyTokenDto: VerifyTokenDto = { idToken: 'invalid-token' };
      authService.verifyToken.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      await expect(
        controller.verifyToken(verifyTokenDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('should login successfully and return user info', async () => {
      const verifyTokenDto: VerifyTokenDto = { idToken: 'valid-token' };
      authService.verifyToken.mockResolvedValue(mockDecodedToken);

      const result = await controller.login(verifyTokenDto);

      expect(result).toEqual({
        message: 'Login successful',
        user: {
          uid: mockDecodedToken.uid,
          email: mockDecodedToken.email,
          name: mockDecodedToken.name,
        },
      });
      expect(authService.verifyToken).toHaveBeenCalledWith(
        verifyTokenDto.idToken,
      );
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      const verifyTokenDto: VerifyTokenDto = { idToken: 'invalid-token' };
      authService.verifyToken.mockRejectedValue(
        new UnauthorizedException('Invalid or expired token'),
      );

      await expect(controller.login(verifyTokenDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      authService.revokeRefreshTokens.mockResolvedValue(undefined);

      const result = await controller.logout(mockDecodedToken);

      expect(result).toEqual({
        message: 'Logout successful. All refresh tokens have been revoked.',
      });
      expect(authService.revokeRefreshTokens).toHaveBeenCalledWith(
        mockDecodedToken.uid,
      );
    });

    it('should throw UnauthorizedException on logout failure', async () => {
      authService.revokeRefreshTokens.mockRejectedValue(
        new UnauthorizedException('Failed to revoke refresh tokens'),
      );

      await expect(controller.logout(mockDecodedToken)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user information', async () => {
      const result = await controller.getCurrentUser(mockDecodedToken);

      expect(result).toEqual({
        uid: mockDecodedToken.uid,
        email: mockDecodedToken.email,
        name: mockDecodedToken.name,
        picture: mockDecodedToken.picture,
      });
    });

    it('should handle user without picture', async () => {
      const tokenWithoutPicture = { ...mockDecodedToken };
      delete tokenWithoutPicture.picture;

      const result = await controller.getCurrentUser(tokenWithoutPicture);

      expect(result).toEqual({
        uid: tokenWithoutPicture.uid,
        email: tokenWithoutPicture.email,
        name: tokenWithoutPicture.name,
        picture: undefined,
      });
    });
  });
});
