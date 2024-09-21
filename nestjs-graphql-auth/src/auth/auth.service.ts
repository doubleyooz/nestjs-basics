import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config/dist';
import { JwtService } from '@nestjs/jwt';
import { User } from '../models/users/entities/users.entity';
import { UsersService } from '../models/users/users.service';
import { ValidateLoginArgs } from './dto/args/validate-login.args';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  validate(payload: ValidateLoginArgs): User | null {
    const user = this.usersService.findOneByEmail(payload);

    if (!user) return null;

    const passwordIsValid = payload.password === user.password;
    return passwordIsValid ? user : null;
  }

  login(user: User): { accessToken: string } {
    const payload = {
      email: user.email,
      sub: user._id,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  verify(token: string): User {
    const decoded = this.jwtService.verify(token, {
      secret: this.configService.get<string>('JWT_SECRET'),
    });

    const user = this.usersService.findOneByEmail(decoded.email);

    if (!user) throw new Error('Unable to get the user from decoded token');

    return user;
  }
}
