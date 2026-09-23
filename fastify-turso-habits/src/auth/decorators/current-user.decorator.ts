// src/auth/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { IUser } from '../../models/user/interfaces/user.interface.js';

export const CurrentUser = createParamDecorator(
  (data: keyof IUser | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user: IUser = req.user;
    return data ? user?.[data] : user;
  },
);