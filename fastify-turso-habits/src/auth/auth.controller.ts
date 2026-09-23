import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';

import type { FastifyReply } from 'fastify';
import { AuthService } from './auth.service.js';
import type { IUser } from '../models/user/interfaces/user.interface.js';
import { CurrentUser } from './decorators/current-user.decorator.js';
import {
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiProduces,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'Log in the user, returns an auth cookie',
    description:
      'user login returns an access token with some user information',
  })
  @ApiConsumes('application/json')
  @ApiProduces('application/json')
  async login(
    @CurrentUser() user: IUser,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { token, expires } = await this.authService.login(user);

    res.setCookie('jid', token, {
      httpOnly: true,
      sameSite: 'none',
      path: '/',
      expires,
    });
    res.send(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({
    summary: 'Log out the current user',
    description:
      'Receives the auth cookie with the token it, all tokens for this user will be blacklisted',
  })
  @ApiOkResponse({ description: 'User found and returned.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  async logout(
    @CurrentUser() user: IUser,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    await this.authService.logout(user);
    res.setCookie('jid', '', {
      httpOnly: true,
      expires: new Date(),
      path: '/',
      sameSite: 'none',
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get the current user',
    description:
      'Receives the auth cookie and returns information related to the user',
  })
  @ApiOkResponse({ description: 'User found and returned.' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  @ApiProduces('application/json')
  async validateUser(@CurrentUser() user: IUser) {
    return user;
  }

}
