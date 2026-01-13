import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenPayload } from '../interfaces/token-payload.interface';

import { UserService } from '../../models/user/user.service';
import { AUTHENTICATION_COOKIE } from '../constants/auth-cookie';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const cookie = request?.headers[AUTHENTICATION_COOKIE];
          if (!cookie) return null;
          const [, token] = cookie.split(' ');
          return token;
        },
      ]),
      secretOrKey: configService.get<string>('ACCESS_TOKEN_SECRET'),
      signOptions: {
        expiresIn: configService.get<string>('ACCESS_TOKEN_EXPIRATION') + 's',
      },
    });
  }

  async validate(token: TokenPayload) {
    try {
      const result = await this.userService.getUser(
        {
          id: token.id,
          tokenVersion: token.tokenVersion,
        },
        ['tokenVersion', 'id'],
      );
      console.log('validate', result);
      return result;
    } catch (err) {
      console.log(err);
      throw new UnauthorizedException();
    }
  }
}
