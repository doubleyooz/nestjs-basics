import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';
import { DecodedIdToken } from 'firebase-admin/auth';

@Injectable()
export class AuthService {
  constructor(@Inject('FIREBASE_AUTH') private readonly auth: Auth) {}

  async verifyToken(idToken: string): Promise<DecodedIdToken> {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async getUserByUid(uid: string) {
    try {
      const userRecord = await this.auth.getUser(uid);
      return userRecord;
    } catch (error) {
      throw new UnauthorizedException('User not found');
    }
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    try {
      await this.auth.revokeRefreshTokens(uid);
    } catch (error) {
      throw new UnauthorizedException('Failed to revoke refresh tokens');
    }
  }
}
