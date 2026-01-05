import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { Auth } from 'firebase-admin/auth';
import { DecodedIdToken } from 'firebase-admin/auth';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from 'src/models/user/user.repository';
import { UpdatePasswordDto } from './dto/update-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('FIREBASE_AUTH') private readonly auth: Auth,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async verifyToken(idToken: string): Promise<DecodedIdToken> {
    try {
      const decodedToken = await this.auth.verifyIdToken(idToken);
      return decodedToken;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async login(email: string, password: string): Promise<any> {
    try {
      // Note: Firebase Admin SDK doesn't have a direct login method
      // You need to use Firebase Client SDK on frontend, or implement your own
      // Here's an alternative approach using Firebase REST API

      // Option 1: Using Firebase REST API (recommended for server-side login)
      const response = await this.signInWithEmailPassword(email, password);

      // Option 2: Verify by getting user and checking credentials (if you store hashed passwords)
      // const userRecord = await this.auth.getUserByEmail(loginDto.email);
      // await this.verifyPassword(userRecord.uid, loginDto.password);

      return {
        message: 'Login successful',
        idToken: response.idToken,
        refreshToken: response.refreshToken,
        expiresIn: response.expiresIn,
        user: {
          uid: response.localId,
          email: response.email,
          displayName: response.displayName,
          emailVerified: response.emailVerified,
        },
      };
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  private async signInWithEmailPassword(email: string, password: string) {
    // This uses Firebase REST API since Admin SDK doesn't support signIn
    const apiKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');
    console.log('Firebase API Key:', apiKey);
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        returnSecureToken: true,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Authentication failed');
    }

    return data;
  }

  async getUserByUid(uid: string) {
    try {
      const userRecord = await this.auth.getUser(uid);
      return userRecord;
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('User not found');
    }
  }

  async revokeRefreshTokens(uid: string): Promise<void> {
    try {
      await this.auth.revokeRefreshTokens(uid);
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Failed to revoke refresh tokens');
    }
  }

  // Step 1: Verify current password using REST API
  async verifyCurrentPassword(email: string, password: string) {
    const apiKey = process.env.FIREBASE_API_KEY;
    const response = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
      {
        method: 'POST',
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      },
    );
    return response.ok;
  }

  // Step 2: Update password if verification passes
  async updatePasswordWithVerification(_updatePasswordDto: UpdatePasswordDto) {
    const isValid = await this.verifyCurrentPassword(
      _updatePasswordDto.email,
      _updatePasswordDto.currentPassword,
    );
    if (!isValid) {
      throw new UnauthorizedException('Invalid Credentials');
    }

    const userRecord = await this.auth.getUserByEmail(_updatePasswordDto.email);

    await this.auth.updateUser(userRecord.uid, {
      password: _updatePasswordDto.newPassword,
    });
  }
}
