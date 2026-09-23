import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUser } from '../models/user/interfaces/user.interface.js';
import { UsersService } from '../models/user/users.service.js';
import { JwtStrategy, TokenPayload } from './strategies/jwt.strategy.js';


@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtStrategy,
  ) {}

  async login(user: IUser) {
    const tokenPayload: TokenPayload = {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    };

    const expires = new Date();

    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = await this.jwtService.sign(tokenPayload);

    return { token, expires };
  }

  async logout(user: IUser) {
    await this.userService.revokeToken(user.id);
  }
}
