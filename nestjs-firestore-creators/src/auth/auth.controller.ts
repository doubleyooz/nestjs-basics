import { Controller, Get, Post, Res, Request, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import type { User } from '../models/user/user.schema';
import { JwtAuthGuard } from './guards/jwt.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';

import {
  ApiTags,
  ApiBearerAuth,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
  ApiOperation,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'User login with local credentials' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'strongPassword123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiOkResponse({
    description: 'Successfully logged in. Returns access token.',
    schema: {
      type: 'object',
      properties: { accessToken: { type: 'string' } },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials.' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    // Removed console.log(console);
    return this.authService.login(user, response);
  }

  @ApiOperation({ summary: 'User logout and invalidate refresh token' })
  @ApiBearerAuth()
  @ApiCookieAuth()
  @ApiOkResponse({ description: 'Successfully logged out.' })
  @ApiUnauthorizedResponse({ description: 'Not authorized.' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout(user, response);
  }

  @ApiOperation({ summary: 'Authenticate with Google' })
  @ApiOkResponse({
    description: 'Successfully logged in with Google. Returns access token.',
    schema: {
      type: 'object',
      properties: { accessToken: { type: 'string' } },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Google authentication failed.' })
  @Get('login/google')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(
    @Request() req,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.googleLogin(req, res);
  }
}
