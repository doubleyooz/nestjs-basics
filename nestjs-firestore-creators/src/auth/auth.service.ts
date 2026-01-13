import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../models/user/user.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { User } from '../models/user/user.schema';
import { AUTHENTICATION_COOKIE } from './constants/auth-cookie';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async verifyUser(email: string, password: string): Promise<User> {
    // Explicitly type user as User | null
    const user: User | null = await this.usersService.getUser({ email }, [
      'password',
      'tokenVersion',
    ]);
    if (!user) throw new UnauthorizedException('Credentials are not valid.');

    if (!user.password) {
      throw new UnauthorizedException('Credentials are not valid.');
    }

    const authenticated = await bcrypt.compare(password, user.password);
    if (!authenticated)
      throw new UnauthorizedException('Credentials are not valid.');

    return user;
  }

  async login(user: User, res: Response): Promise<{ accessToken: string }> {
    const tokenPayload: TokenPayload = {
      id: user.id,
      // Types may not match, so fallback to 0 if undefined
      tokenVersion: user.tokenVersion ?? 0,
    };

    const refreshTokenExpirationValue = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const refreshTokenExpiration = new Date();
    refreshTokenExpiration.setSeconds(
      refreshTokenExpiration.getSeconds() +
        (refreshTokenExpirationValue ?? 60 * 60 * 24 * 7), // fallback to 1 week
    );

    const accessToken = this.jwtService.sign(tokenPayload);
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: `${refreshTokenExpirationValue ?? 60 * 60 * 24 * 7}s`,
    });

    res.cookie(AUTHENTICATION_COOKIE, refreshToken, {
      secure: true,
      httpOnly: true,
      expires: refreshTokenExpiration,
    });

    return { accessToken };
  }

  async googleLogin(
    req: { user: any },
    res: Response,
  ): Promise<{ accessToken: string }> {
    // req.user is of unknown type, so handle type cautiously
    const email = req?.user?.email;
    if (!email)
      throw new UnauthorizedException(
        'Google authentication failed: no email found.',
      );

    const user: User | null = await this.usersService.getUser({ email }, [
      'tokenVersion',
    ]);

    if (!user) throw new UnauthorizedException('Credentials are not valid.');

    const tokenPayload: TokenPayload = {
      id: user.id,
      tokenVersion: user.tokenVersion ?? 0,
    };

    const refreshTokenExpirationValue = this.configService.get<number>(
      'REFRESH_TOKEN_EXPIRATION',
    );
    const refreshTokenExpiration = new Date();

    refreshTokenExpiration.setSeconds(
      refreshTokenExpiration.getSeconds() +
        (refreshTokenExpirationValue ?? 60 * 60 * 24 * 7), // fallback to 1 week
    );

    const accessToken = this.jwtService.sign(tokenPayload);
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn: `${refreshTokenExpirationValue ?? 60 * 60 * 24 * 7}s`,
    });

    res.cookie(AUTHENTICATION_COOKIE, refreshToken, {
      secure: true,
      httpOnly: true,
      expires: refreshTokenExpiration,
    });

    return { accessToken };
  }

  async logout(user: User, response: Response): Promise<void> {
    await this.usersService.updateTokenVersion({ id: user.id });
    response.clearCookie(AUTHENTICATION_COOKIE);
  }
}
