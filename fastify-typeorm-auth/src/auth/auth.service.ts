import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../models/users/users.service';
import { TokenPayload } from './interfaces/token-payload.interface';
import { IUser } from '../models/users/interfaces/user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}
  async verifyUser(email: string, password: string) {
    try {
      return await this.usersService.validateUser(email, password);
    } catch (err) {
      throw new UnauthorizedException('Credentials are not valid.');
    }
  }
  async login(user: IUser, res: Response) {
    const tokenPayload: TokenPayload = {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    };

    const refreshTokenExpiration = new Date();

    refreshTokenExpiration.setSeconds(
      refreshTokenExpiration.getSeconds() +
        this.configService.get<number>('REFRESH_TOKEN_EXPIRATION'),
    );

    const accessToken = this.jwtService.sign(tokenPayload);
    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
      expiresIn:
        this.configService.get<number>('REFRESH_TOKEN_EXPIRATION') + 's',
    });

    res.cookie('Authentication', refreshToken, {
      secure: true,
      httpOnly: true,
      expires: refreshTokenExpiration,
    });

    return { accessToken };
  }
}
