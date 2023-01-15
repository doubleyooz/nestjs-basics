import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { User } from 'src/users/models/user.model';
import { AuthService } from '../auth.service';
import { ValidateLoginArgs } from '../dto/args/validate-login.args';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({ email: 'email' });
  }

  validate(payload: ValidateLoginArgs): User {
    const user = this.authService.validate(payload);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
