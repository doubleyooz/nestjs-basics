// src/auth/jwt-auth.guard.ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtStrategy } from '../strategies/jwt.strategy.js';
import { UsersService } from '../../models/user/users.service.js';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtStrategy,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token: string | undefined = req?.cookies?.['jid'];

    if (!token) throw new UnauthorizedException();

    let payload;
    try {
      payload = await this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException();
    }

    const { result } = await this.usersService.findOneById(payload.userId);
    const user = result?.[0];
    if (!user || !user.active) throw new UnauthorizedException();

    // Token-version check — invalidate all sessions on password change, etc.
    if (user.tokenVersion !== payload.tokenVersion) {
      throw new UnauthorizedException();
    }

    req.user = user;
    return true;
  }
}